<div align="center">

# 🌐 TradeGate

### AI-Powered International Trade Tariff Calculator

*A real 8086 DOS assembly program, brought to life through Flask, Gemini AI, and a React SPA*

[![Python](https://img.shields.io/badge/Python-3.9+-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![Assembly](https://img.shields.io/badge/8086-MASM-brightgreen?style=flat-square)](https://en.wikipedia.org/wiki/Microsoft_Macro_Assembler)
[![DOSBox](https://img.shields.io/badge/DOSBox-0.74-orange?style=flat-square)](https://www.dosbox.com)
[![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)

</div>

---

## What is TradeGate?

TradeGate calculates international trade duty in a genuinely unusual way: **the computation engine is a real 8086 DOS assembly program**, compiled with MASM and executed inside DOSBox on every request. A Flask REST API orchestrates the pipeline, optionally querying Gemini AI for live MFN (Most-Favoured-Nation) tariff rates and patching them directly into the EXE binary before execution.

The frontend is a React + TypeScript SPA with Supabase authentication, a full-page animated globe background, and a premium dark-navy UI — all served by Vite.

---

## Features

- **8086 ASM Compute Engine** — All tariff lookup, policy application, and duty arithmetic runs inside a real `TARIFF_1.EXE` DOS binary via DOSBox, not a software emulator.
- **Gemini AI Live Tariff Lookup** — Queries `gemini-2.5-flash-lite` for the current MFN rate for the selected country pair + category. Falls back gracefully to the hardcoded table if the API is unavailable or quota is exhausted.
- **In-Memory EXE Patching** — When an AI rate is obtained, Flask locates the `TARIFF_TABLE` inside the compiled binary by byte signature, overwrites the exact 2-byte little-endian word for the requested slot, and executes the patched copy — all in a temp directory, leaving the original untouched.
- **Three Trade Conditions** — Normal, Preferential (−5%), and Penalty (+10%) with floor/ceiling enforcement.
- **10 Countries × 8 Goods Categories** — USA, China, India, Germany, Japan, South Korea, Vietnam, Malaysia, UK, France across Electronics, Steel, Agriculture, Automobiles, Textiles, Chemicals, Machinery, and Pharmaceuticals.
- **Supabase Authentication** — Google OAuth + email/password sign-in, user metadata for home-country preference.
- **React SPA Frontend** — Three pages (Login, Settings, Calculator) with React Router, TypeScript, Tailwind CSS, and Vite. Animated interactive globe canvas background on every page.
- **Dark Professional UI** — Premium dark-navy glassmorphism theme with animated result card, inline validation, and AI/standard rate badges.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Compute engine** | 8086 MASM assembly (`tariff_1.asm`), compiled with MASM 5.x + LINK |
| **DOS runtime** | DOSBox 0.74 (headless, `-noconsole -exit`) |
| **Backend API** | Python 3.9+, Flask 3.x, flask-cors |
| **AI integration** | Google Gemini (`google-genai` SDK, model: `gemini-2.5-flash-lite`) |
| **Config management** | python-dotenv |
| **Authentication** | Supabase (Google OAuth + email/password), `@supabase/supabase-js` v2 |
| **Frontend framework** | React 18 + TypeScript 5, Vite 6 |
| **Styling** | Tailwind CSS 3, inline styles for pixel-accurate design tokens |
| **Routing** | React Router v6 |
| **Globe animation** | Canvas 2D API — Fibonacci sphere, arc connections, traveling dots |
| **Fonts** | Google Fonts — Inter |

---

## Architecture & How It Works

```
Browser (React SPA — Vite dev server :3000)
      │  POST /calculate  {exporter, importer, category, declared_value, condition}
      │  (proxied by Vite → Flask :5000)
      ▼
Flask API (app.py)
      │
      ├─ 1. Validate all 5 inputs (range checks, exporter ≠ importer)
      │
      ├─ 2. get_live_tariff() ──► Gemini AI (gemini-2.5-flash-lite)
      │        │                   "What is the MFN rate applied by USA
      │        │                    on Steel from India?"  → "7.5"
      │        │                   parse float → scale ×100 → clamp [1800,4000]
      │        │
      │        └─ if AI rate obtained:
      │              patch_tariff_exe()
      │              ┌──────────────────────────────────────────────────┐
      │              │ 1. Read TARIFF_1.EXE as raw bytes                │
      │              │ 2. Locate TARIFF_TABLE by 6-byte signature:      │
      │              │    C4 09 60 09 FC 08  (2500, 2400, 2300 LE)      │
      │              │ 3. word_offset = (imp-1)*80 + (exp-1)*8 + cat-1  │
      │              │ 4. struct.pack("<H", ai_rate) at that offset      │
      │              │ 5. Write patched copy to temp dir                 │
      │              └──────────────────────────────────────────────────┘
      │
      ├─ 3. run_asm_engine() (dosbox_runner.py)
      │        │
      │        │  Create temp dir → copy (patched) TARIFF_1.EXE
      │        │  Write dosbox.cfg with [autoexec]:
      │        │      mount c <tmpdir>
      │        │      TARIFF_1.EXE 3 1 2 500000 1 > output.txt
      │        │
      │        │  subprocess.run(["DOSBox.exe", "-conf", cfg, "-noconsole", "-exit"])
      │        │  timeout=30s, CREATE_NO_WINDOW
      │        │
      │        │  Read output.txt → regex parse:
      │        │      "Base Tariff: 18.00%"
      │        │      "Effective Tariff: 13.00%"
      │        │      "Duty Payable: 65000"
      │        │
      │        └─ return {base_tariff, effective_tariff, duty_payable}
      │
      └─ 4. Return JSON + ai_assisted flag → React renders result card
```

### Key algorithms in `tariff_1.asm`

**Tariff lookup** — A 3D array `[IMP=10][EXP=10][CAT=8]` of 16-bit words baked into the `.data` segment. The word offset formula is:
```
word_offset = (importer−1) × 80 + (exporter−1) × 8 + (category−1)
```

**Policy application** — Condition 2 subtracts 500 (5.00%) with a floor of 0; Condition 3 adds 1000 (10.00%); both cap at 4000 (40.00%).

**32-bit duty calculation** — Declared values can exceed 65535, so the multiplication `declared_value × effective_tariff` produces a 32-bit result. A two-step chained division handles the 8086 DIV overflow constraint.

**Command-line argument parsing** — The program reads the DOS PSP command tail at `ES:[80h]`, parsing five space-separated integers to skip interactive input entirely (required for headless DOSBox execution).

---

## Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**
- **DOSBox 0.74** — [dosbox.com](https://www.dosbox.com/download.php?main=1)
- **MASM.EXE + LINK.EXE** — included in `asm/` (required only to recompile)
- A **Gemini API key** — [aistudio.google.com](https://aistudio.google.com/app/apikey) *(optional — falls back to hardcoded table)*
- A **Supabase project** — [supabase.com](https://supabase.com) *(required for authentication)*

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tradegate.git
cd tradegate
```

### 2. Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure backend environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Full path to DOSBox.exe
# Windows: D:\DOSBox-0.74\DOSBox.exe
# Linux:   /usr/bin/dosbox
DOSBOX_PATH=C:\path\to\DOSBox.exe

# Gemini API key (optional — leave blank to use hardcoded tariff table)
GEMINI_API_KEY=your_key_here
```

### 4. Configure Supabase credentials

Edit `frontend/src/lib/auth.ts` and replace the two constants at the top:

```ts
const SUPABASE_URL  = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'eyJ...'
```

In your Supabase dashboard, enable **Google OAuth** and add `http://localhost:3000` as an allowed redirect URL.

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Compile the ASM binary (optional — pre-built EXE is included)

Double-click `asm/compile.bat`, or from a terminal:

```cmd
asm\compile.bat
```

### 7. Run the backend

```bash
cd backend
python app.py
```

Server starts at **http://localhost:5000**

### 8. Run the frontend

```bash
cd frontend
npm run dev
```

Frontend starts at **http://localhost:3000**

The Vite dev server automatically proxies `/calculate` → `http://localhost:5000`.

---

## API Reference

### `POST /calculate`

**Request**
```json
{
  "exporter":       3,
  "importer":       1,
  "category":       2,
  "declared_value": 500000,
  "condition":      1
}
```

| Field | Type | Valid range | Description |
|---|---|---|---|
| `exporter` | int | 1–10 | Exporter country |
| `importer` | int | 1–10 | Importer country (≠ exporter) |
| `category` | int | 1–8 | Goods category |
| `declared_value` | int | > 0 | Declared shipment value (USD) |
| `condition` | int | 1–3 | 1=Normal, 2=Preferential (−5%), 3=Penalty (+10%) |

**Success response `200`**
```json
{
  "exporter": 3,
  "importer": 1,
  "category": 2,
  "declared_value": 500000,
  "condition": 1,
  "base_tariff": "18.00%",
  "effective_tariff": "18.00%",
  "duty_payable": 90000,
  "engine": "dosbox",
  "ai_assisted": true
}
```

**Error responses**

| Code | Meaning |
|---|---|
| `400` | Validation failure — `{"error": "..."}` |
| `500` | DOSBox/ASM engine failed — `{"error": "ASM engine failed", "detail": "..."}` |

---

## Country & Category Reference

**Countries (1–10):** USA · China · India · Germany · Japan · South Korea · Vietnam · Malaysia · UK · France

**Categories (1–8):** Electronics · Steel · Agriculture · Automobiles · Textiles · Chemicals · Machinery · Pharmaceuticals

---

## Project Structure

```
tradegate/
├── asm/
│   ├── tariff_1.asm            8086 MASM source — the compute engine
│   ├── TARIFF_1.EXE            Compiled DOS binary (pre-built)
│   ├── MASM.EXE                Microsoft Macro Assembler
│   ├── LINK.EXE                DOS linker
│   ├── compile.bat             One-click recompile via DOSBox
│   ├── compile.cfg             DOSBox config for compilation
│   ├── test.bat                End-to-end test runner
│   └── test.cfg                DOSBox config for testing
├── backend/
│   ├── app.py                  Flask API — Gemini AI + EXE patching + routing
│   ├── dosbox_runner.py        DOSBox subprocess orchestration + output parsing
│   ├── requirements.txt        Python dependencies
│   └── .env.example            Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GlobeBackground.tsx   Full-page animated canvas globe
│   │   │   ├── Layout.tsx            Page wrapper (globe bg + z-index layering)
│   │   │   └── ui/
│   │   │       └── interactive-globe.tsx  Reusable canvas globe component
│   │   ├── lib/
│   │   │   ├── auth.ts               Supabase auth module (named exports)
│   │   │   └── utils.ts              cn() helper (clsx + tailwind-merge)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx         Login/signup with Google OAuth
│   │   │   ├── SettingsPage.tsx      Home country preference + sign out
│   │   │   └── CalculatorPage.tsx    Tariff calculator form + result card
│   │   ├── App.tsx                   React Router routes (all wrapped in Layout)
│   │   ├── main.tsx                  React entry point
│   │   └── index.css                 Tailwind CSS directives
│   ├── index.html                    Vite HTML entry
│   ├── package.json                  npm dependencies
│   ├── vite.config.js                Vite config (@/ alias, :3000, /calculate proxy)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig*.json
├── .gitignore
└── README.md
```

---

## License

MIT

---

<div align="center">
<sub>TradeGate © 2026 — Built with 8086 Assembly, Python, React, and too much curiosity about old computers.</sub>
</div>
