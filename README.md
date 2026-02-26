# International Trade Tariff System

An 8086 Assembly-powered international trade duty calculator with a Flask API backend and a browser-based frontend.

---

## Architecture

```
frontend/index.html  --POST /calculate-->  backend/app.py
                                                |
                                         dosbox_runner.py
                                                |
                                        DOSBox subprocess
                                        TARIFF_1.EXE 3 1 2 500000 1
                                        (8086 ASM binary)
                                                |
                                     parse stdout -> JSON response
```

## Folder Structure

```
tariff-system/
+-- frontend/
|   +-- index.html              HTML/CSS/JS single-page UI
+-- backend/
|   +-- app.py                  Flask API server
|   +-- dosbox_runner.py        DOSBox subprocess helper
|   +-- requirements.txt        Python dependencies
|   +-- .env                    Environment variables (not committed)
+-- asm/
|   +-- tariff_1.asm            8086 MASM source
|   +-- TARIFF_1.EXE            Compiled DOS binary (run by DOSBox)
|   +-- compile.bat / compile.cfg   One-click recompile via DOSBox+MASM
|   +-- test.bat / test.cfg     End-to-end test runner
+-- README.md
```

---

## Setup

### 1. Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment variables

Create `backend/.env`:
```
DOSBOX_PATH=C:\path\to\DOSBox.exe
```

| Variable | Required | Description |
|---|---|---|
| `DOSBOX_PATH` | **Required** | Full path to `DOSBox.exe` |

### 3. Compile the ASM binary

Double-click `asm\compile.bat` (or run it from CMD).
This launches DOSBox, mounts the `asm\` folder, and runs MASM + LINK automatically.
Output: `asm\TARIFF_1.EXE`

> MASM.EXE and LINK.EXE must be present in the `asm\` folder.

### 4. Run the backend

```bash
cd backend
python app.py
```
Server starts at `http://localhost:5000`.

### 5. Open the frontend

Open `frontend/index.html` directly in a browser (no build step needed).

---

## API

### `POST /calculate`

**Request body (JSON):**
```json
{
  "exporter":       3,
  "importer":       7,
  "category":       4,
  "declared_value": 500000,
  "condition":      1
}
```

| Field | Type | Range | Description |
|---|---|---|---|
| `exporter` | int | 1-10 | Exporter country index |
| `importer` | int | 1-10 | Importer country index (not equal to exporter) |
| `category` | int | 1-8 | Goods category |
| `declared_value` | int | > 0 | Declared shipment value |
| `condition` | int | 1-3 | 1=Normal, 2=Preferential (-5%), 3=Penalty (+10%) |

**Success response (200):**
```json
{
  "exporter":         3,
  "importer":         7,
  "category":         4,
  "declared_value":   500000,
  "condition":        1,
  "base_tariff":      "26.00%",
  "effective_tariff": "26.00%",
  "duty_payable":     130000,
  "engine":           "dosbox"
}
```

**Error responses:**
- `400` -- validation failure (`{"error": "..."}`)
- `500` -- ASM engine failed (`{"error": "ASM engine failed", "detail": "..."}`)

---

## Execution Pipeline (per request)

1. **Validate** all five inputs (range checks, exporter != importer)
2. **dosbox_runner.py** -- creates a temp dir, copies `TARIFF_1.EXE`, writes a `dosbox.cfg`
3. **DOSBox** -- launched headless (`-noconsole -exit`), runs:
   `TARIFF_1.EXE {exp} {imp} {cat} {value} {cond} > output.txt`
4. **Parse** -- extract `Base Tariff`, `Effective Tariff`, `Duty Payable` from `output.txt` with regex
5. **Return** JSON to frontend; temp dir cleaned up

---

## Tariff Table

3D lookup: `[importer 1-10][exporter 1-10][category 1-8]`
Formula: `min(4000, 2500 + (imp + exp - cat - 1) * 100)`
Values are stored as `percentage * 100` (e.g. `2600` = 26.00%).

## Policy Adjustments

| Condition | Rule | Floor | Ceiling |
|---|---|---|---|
| 1 Normal | No change | -- | 40.00% |
| 2 Preferential | -5.00% (-500) | 0.00% | 40.00% |
| 3 Penalty | +10.00% (+1000) | -- | 40.00% |

## Duty Formula

```
duty = floor( (declared_value * effective_tariff_hundredths + 5000) / 10000 )
```
(Round-half-up; implemented via 32-bit chained division in the ASM `CalculateDuty` procedure.)
