"""
dosbox_runner.py
Runs TARIFF_1.EXE inside DOSBox non-interactively and captures its output.
Standard library only — no third-party imports required.
"""

import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path


def run_asm_engine(
    exporter:       int,
    importer:       int,
    category:       int,
    declared_value: int,
    condition:      int,
    asm_dir:        str,
    dosbox_path:    str,
) -> dict:
    """
    Run TARIFF_1.EXE inside DOSBox, feed all five inputs programmatically via
    stdin redirection, and return the parsed results.

    Parameters
    ----------
    exporter       : 1–10
    importer       : 1–10  (must differ from exporter)
    category       : 1–8
    declared_value : non-negative integer
    condition      : 1 = Normal | 2 = Preferential | 3 = Penalty
    asm_dir        : directory that contains TARIFF_1.EXE
    dosbox_path    : path to the DOSBox executable  OR  its parent directory

    Returns
    -------
    {
        "base_tariff":      "22.00%",
        "effective_tariff": "17.00%",
        "duty_payable":     85000       # int
    }

    Raises
    ------
    FileNotFoundError  – EXE or DOSBox not found
    subprocess.TimeoutExpired – DOSBox took longer than 15 s
    RuntimeError       – output.txt absent or could not be parsed
    """

    # ── Resolve paths ─────────────────────────────────────────────────────────

    asm_dir = Path(asm_dir)

    # Accept either casing of the EXE name
    exe_src = next(
        (p for p in asm_dir.iterdir()
         if p.name.upper() == "TARIFF_1.EXE"),
        None,
    )
    if exe_src is None:
        raise FileNotFoundError(f"TARIFF_1.EXE not found in: {asm_dir}")

    # Accept a directory (e.g. "D:\\…\\DOSBox-0.74") or a direct exe path
    dosbox = Path(dosbox_path)
    if dosbox.is_dir():
        dosbox = dosbox / "DOSBox.exe"
    if not dosbox.exists():
        raise FileNotFoundError(f"DOSBox executable not found at: {dosbox}")

    # ── Temp working directory ─────────────────────────────────────────────────

    tmpdir = tempfile.mkdtemp(prefix="tariff_")
    try:
        tmp = Path(tmpdir)

        # ── 1. Copy EXE ───────────────────────────────────────────────────────
        shutil.copy2(exe_src, tmp / "TARIFF_1.EXE")

        # ── 2. Write input.txt (kept for backward-compat / interactive fallback) ──
        lines = [exporter, importer, category, declared_value, condition]
        (tmp / "input.txt").write_bytes(
            "\r\n".join(str(v) for v in lines).encode("ascii") + b"\r\n"
        )

        # ── 3. Write run.bat ──────────────────────────────────────────────────
        # Pass all 5 inputs as command-line arguments — the ASM program now
        # reads from PSP:[80h] instead of stdin, so no < redirect needed.
        bat_cmd = (
            f"TARIFF_1.EXE {exporter} {importer} {category}"
            f" {declared_value} {condition} > output.txt\r\n"
        )
        (tmp / "run.bat").write_bytes(bat_cmd.encode("ascii"))

        # ── 4. Write dosbox.cfg ───────────────────────────────────────────────
        # Use Windows backslash path in [autoexec] — DOSBox mount requires it.
        mount_path = tmpdir  # keep native Windows backslashes

        cfg = "\n".join([
            "[sdl]",
            "fullscreen=false",
            "output=surface",
            "autolock=false",
            "",
            "[dosbox]",
            "machine=svga_s3",
            "captures=capture",
            "memsize=16",
            "",
            "[render]",
            "frameskip=5",
            "",
            "[cpu]",
            "core=normal",
            "cputype=486_slow",
            "cycles=max",
            "",
            "[autoexec]",
            "@echo off",
            f'mount c "{mount_path}"',
            "c:",
            f"TARIFF_1.EXE {exporter} {importer} {category} {declared_value} {condition} > output.txt",
            "if errorlevel 1 goto fail",
            "goto done",
            ":fail",
            "echo ASM_ERROR > output.txt",
            ":done",
            "exit",
            "",
        ])
        cfg_path = tmp / "dosbox.cfg"
        cfg_path.write_text(cfg, encoding="ascii")

        # ── 5. Launch DOSBox ──────────────────────────────────────────────────
        cmd = [str(dosbox), "-conf", str(cfg_path), "-noconsole", "-exit"]

        # Suppress the DOSBox window on Windows
        kwargs = {}
        if os.name == "nt":
            kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

        subprocess.run(
            cmd,
            timeout=30,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            **kwargs,
        )

        # ── 6. Read output.txt ────────────────────────────────────────────────
        output_file = tmp / "output.txt"
        if not output_file.exists():
            raise RuntimeError(
                "DOSBox ran but produced no output.txt — autoexec may have failed"
            )

        raw = output_file.read_text(errors="replace")

        if "ASM_ERROR" in raw:
            raise RuntimeError("ASM EXE failed")

        # ── 7. Parse output ───────────────────────────────────────────────────
        base_m = re.search(r"Base\s+Tariff\s*:\s*([\d]+\.[\d]+%)", raw, re.IGNORECASE)
        eff_m  = re.search(r"Effective\s+Tariff\s*:\s*([\d]+\.[\d]+%)", raw, re.IGNORECASE)
        duty_m = re.search(r"Duty\s+Payable\s*:\s*(\d+)", raw, re.IGNORECASE)

        # ── 8. Raise if parsing failed ────────────────────────────────────────
        if not (base_m and eff_m and duty_m):
            raise RuntimeError(
                f"Could not parse ASM output.\nRaw output was:\n{raw!r}"
            )

        # ── 9. Return result dict ─────────────────────────────────────────────
        return {
            "base_tariff":      base_m.group(1),
            "effective_tariff": eff_m.group(1),
            "duty_payable":     int(duty_m.group(1)),
        }

    finally:
        # ── 10. Clean up temp dir ─────────────────────────────────────────────
        shutil.rmtree(tmpdir, ignore_errors=True)
