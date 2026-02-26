import os
import re
import shutil
import struct
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

from dosbox_runner import run_asm_engine

# ── Environment & paths ───────────────────────────────────────────────────────

load_dotenv()

DOSBOX_PATH   = os.getenv("DOSBOX_PATH", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ASM_DIR        = Path(__file__).parent.parent / "asm"

# ── Lookup tables ─────────────────────────────────────────────────────────────

COUNTRY_NAMES = {
    1: "USA", 2: "China",  3: "India",   4: "Germany", 5: "Japan",
    6: "South Korea", 7: "Vietnam", 8: "Malaysia", 9: "UK", 10: "France",
}
CATEGORY_NAMES = {
    1: "Electronics", 2: "Steel",    3: "Agriculture", 4: "Automobiles",
    5: "Textiles",    6: "Chemicals", 7: "Machinery",   8: "Pharmaceuticals",
}

# Byte signature of the first 3 words of TARIFF_TABLE in the compiled EXE:
# 2500 (0x09C4), 2400 (0x0960), 2300 (0x08FC) — all little-endian.
_TABLE_SIGNATURE = bytes([0xC4, 0x09, 0x60, 0x09, 0xFC, 0x08])

# ── Gemini live tariff lookup ─────────────────────────────────────────────────

def get_live_tariff(exporter_id: int, importer_id: int, category_id: int):
    """
    Query Gemini for the current MFN / bilateral tariff rate.

    Returns the rate as a scaled integer (e.g. 2500 = 25.00%),
    clamped to [0, 15000] (0% free trade – 150% extreme protection).
    Returns None on any failure.
    """
    if not GEMINI_API_KEY:
        return None
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        exporter = COUNTRY_NAMES.get(exporter_id, str(exporter_id))
        importer = COUNTRY_NAMES.get(importer_id, str(importer_id))
        category = CATEGORY_NAMES.get(category_id, str(category_id))

        prompt = (
            f"You are a trade tariff expert with knowledge of WTO MFN rates and bilateral trade agreements.\n\n"
            f"Task: Return the most likely customs import tariff rate that {importer} applies on {category} goods imported from {exporter}.\n\n"
            f"Consider:\n"
            f"- WTO Most Favoured Nation (MFN) bound and applied rates\n"
            f"- Any active free trade agreements between {exporter} and {importer}\n"
            f"- Preferential rates if a trade agreement exists\n"
            f"- Typical tariff ranges for {category} in {importer}\n\n"
            f"Examples of realistic rates:\n"
            f"- USA on Steel from China: 25.0 (due to Section 301 tariffs)\n"
            f"- EU (Germany) on Electronics from Japan: 0.0 (EPA agreement)\n"
            f"- India on Automobiles from USA: 100.0 (high protection)\n"
            f"- USA on Textiles from Vietnam: 12.0\n"
            f"- China on Agriculture from USA: 25.0 (trade war tariffs)\n\n"
            f"Reply with ONLY a single number representing the percentage. "
            f"No % sign. No explanation. No text. Just the number.\n"
            f"Example reply: 25.0"
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0),
        )
        raw = response.text.strip()

        match = re.search(r"\d+(?:\.\d+)?", raw)
        if not match:
            return None

        float_val = float(match.group())
        scaled = round(float_val * 100)

        # Clamp to realistic range: 0% (free trade) to 150% (extreme protection)
        scaled = max(0, min(15000, scaled))
        return scaled

    except Exception as e:
        app.logger.error(f"Gemini error: {e}")
        return None


# ── EXE patching helper ───────────────────────────────────────────────────────

def patch_tariff_exe(src_exe: Path, dest_exe: Path,
                     exporter: int, importer: int, category: int,
                     tariff_value: int) -> bool:
    """
    Copy src_exe → dest_exe and overwrite the one tariff word for
    (importer, exporter, category) with tariff_value (scaled int).

    Returns True on success, False if the signature is not found.
    """
    data = src_exe.read_bytes()

    idx = data.find(_TABLE_SIGNATURE)
    if idx == -1:
        return False

    word_offset = (importer - 1) * 80 + (exporter - 1) * 8 + (category - 1)
    byte_offset  = idx + word_offset * 2

    patched = (
        data[:byte_offset]
        + struct.pack("<H", tariff_value)
        + data[byte_offset + 2:]
    )
    dest_exe.write_bytes(patched)
    return True


# ── App ───────────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

# ── Route ─────────────────────────────────────────────────────────────────────

@app.route("/calculate", methods=["POST"])
def calculate():

    # ── Parse & validate ──────────────────────────────────────────────────────
    body = request.get_json(silent=True) or {}

    try:
        exporter       = int(body["exporter"])
        importer       = int(body["importer"])
        category       = int(body["category"])
        declared_value = int(body["declared_value"])
        condition      = int(body["condition"])
    except (KeyError, TypeError, ValueError) as exc:
        return jsonify({"error": f"Missing or non-integer field: {exc}"}), 400

    if not (1 <= exporter <= 10):
        return jsonify({"error": "exporter must be an integer between 1 and 10"}), 400
    if not (1 <= importer <= 10):
        return jsonify({"error": "importer must be an integer between 1 and 10"}), 400
    if exporter == importer:
        return jsonify({"error": "exporter and importer cannot be the same country"}), 400
    if not (1 <= category <= 8):
        return jsonify({"error": "category must be an integer between 1 and 8"}), 400
    if declared_value <= 0:
        return jsonify({"error": "declared_value must be a positive integer"}), 400
    if condition not in (1, 2, 3):
        return jsonify({"error": "condition must be 1 (Normal), 2 (Preferential), or 3 (Penalty)"}), 400

    # ── AI tariff lookup ──────────────────────────────────────────────────────
    live_tariff  = get_live_tariff(exporter, importer, category)
    ai_assisted  = live_tariff is not None

    # ── Determine asm_dir (possibly patched copy) ─────────────────────────────
    patch_tmpdir = None
    effective_asm_dir = str(ASM_DIR)

    if ai_assisted:
        src_exe = next(
            (p for p in ASM_DIR.iterdir() if p.name.upper() == "TARIFF_1.EXE"),
            None,
        )
        if src_exe:
            patch_tmpdir = tempfile.mkdtemp(prefix="tariff_patch_")
            dest_exe = Path(patch_tmpdir) / "TARIFF_1.EXE"
            ok = patch_tariff_exe(src_exe, dest_exe, exporter, importer, category, live_tariff)
            if ok:
                effective_asm_dir = patch_tmpdir
            else:
                # Signature not found — fall back silently
                shutil.rmtree(patch_tmpdir, ignore_errors=True)
                patch_tmpdir  = None
                ai_assisted   = False

    # ── Run ASM engine ────────────────────────────────────────────────────────
    try:
        result = run_asm_engine(
            exporter       = exporter,
            importer       = importer,
            category       = category,
            declared_value = declared_value,
            condition      = condition,
            asm_dir        = effective_asm_dir,
            dosbox_path    = DOSBOX_PATH,
        )
    except RuntimeError as exc:
        return jsonify({"error": "ASM engine failed", "detail": str(exc)}), 500
    finally:
        if patch_tmpdir:
            shutil.rmtree(patch_tmpdir, ignore_errors=True)

    return jsonify({
        "exporter":         exporter,
        "importer":         importer,
        "category":         category,
        "declared_value":   declared_value,
        "condition":        condition,
        "base_tariff":      result["base_tariff"],
        "effective_tariff": result["effective_tariff"],
        "duty_payable":     result["duty_payable"],
        "engine":           "dosbox",
        "ai_assisted":      ai_assisted,
    })


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
