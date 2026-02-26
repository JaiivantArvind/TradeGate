import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getSession, getCountry, signOut } from '@/lib/auth'

// ── Design tokens (matches original CSS variables) ────────────
const C = {
  bg:          '#0b0f1a',
  bgCard:      '#111827',
  bgInput:     '#1a2236',
  border:      '#1f2d45',
  borderFocus: '#3b82f6',
  text:        '#e2e8f0',
  textDim:     '#64748b',
  textLabel:   '#94a3b8',
  accent:      '#3b82f6',
  accentDim:   '#1d4ed8',
  green:       '#10b981',
  red:         '#ef4444',
} as const

// ── Static data ───────────────────────────────────────────────
const COUNTRIES: Record<number, string> = {
  1: '🇺🇸 USA',        2: '🇨🇳 China',      3: '🇮🇳 India',
  4: '🇩🇪 Germany',    5: '🇯🇵 Japan',      6: '🇰🇷 South Korea',
  7: '🇻🇳 Vietnam',    8: '🇲🇾 Malaysia',   9: '🇬🇧 UK',
  10: '🇫🇷 France',
}
const COUNTRY_NAMES: Record<number, string> = {
  1: 'USA', 2: 'China', 3: 'India', 4: 'Germany', 5: 'Japan',
  6: 'South Korea', 7: 'Vietnam', 8: 'Malaysia', 9: 'UK', 10: 'France',
}
const COUNTRY_IDS = Object.keys(COUNTRIES).map(Number)

const CATEGORIES: Record<number, string> = {
  1: 'Electronics', 2: 'Steel',     3: 'Agriculture', 4: 'Automobiles',
  5: 'Textiles',    6: 'Chemicals', 7: 'Machinery',   8: 'Pharmaceuticals',
}

// ── Types ─────────────────────────────────────────────────────
interface CalcResult {
  base_tariff:      string
  effective_tariff: string
  duty_payable:     number
  ai_assisted:      boolean
}

// ── Helper ────────────────────────────────────────────────────
function usd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)
}

// ── Shared inline style fragments ─────────────────────────────
const selectBase: React.CSSProperties = {
  background:            C.bgInput,
  border:                `1px solid ${C.border}`,
  borderRadius:          7,
  color:                 C.text,
  fontFamily:            'inherit',
  fontSize:              '0.9rem',
  padding:               '0.65rem 2.2rem 0.65rem 0.85rem',
  width:                 '100%',
  outline:               'none',
  appearance:            'none',
  backgroundImage:       `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2364748b' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
  backgroundRepeat:      'no-repeat',
  backgroundPosition:    'right 0.85rem center',
  transition:            'border-color 0.15s',
}
const inputBase: React.CSSProperties = {
  background:   C.bgInput,
  border:       `1px solid ${C.border}`,
  borderRadius: 7,
  color:        C.text,
  fontFamily:   'inherit',
  fontSize:     '0.9rem',
  padding:      '0.65rem 0.85rem',
  width:        '100%',
  outline:      'none',
  transition:   'border-color 0.15s',
}
const cardStyle: React.CSSProperties = {
  background:   C.bgCard,
  border:       `1px solid ${C.border}`,
  borderRadius: 10,
  padding:      '1.75rem',
  boxShadow:    '0 4px 24px rgba(0,0,0,0.4)',
}
const cardTitleStyle: React.CSSProperties = {
  fontSize:       '0.72rem',
  fontWeight:     600,
  letterSpacing:  '0.1em',
  textTransform:  'uppercase',
  color:          C.textDim,
  marginBottom:   '1.25rem',
  display:        'flex',
  alignItems:     'center',
  gap:            '0.5rem',
}
const sectionTitleStyle: React.CSSProperties = {
  fontSize:      '0.7rem',
  fontWeight:    600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color:         C.textDim,
  marginBottom:  '0.85rem',
}
const labelStyle: React.CSSProperties = {
  fontSize:   '0.8rem',
  fontWeight: 500,
  color:      C.textLabel,
}
const fieldErrorStyle: React.CSSProperties = {
  fontSize:  '0.75rem',
  color:     C.red,
  minHeight: '1rem',
}

// ── Component ─────────────────────────────────────────────────
export default function CalculatorPage() {
  const navigate = useNavigate()

  const [exporter,      setExporter]      = useState('')
  const [importer,      setImporter]      = useState('')
  const [category,      setCategory]      = useState('')
  const [declared,      setDeclared]      = useState('')
  const [condition,     setCondition]     = useState(1)
  const [prefilled,     setPrefilled]     = useState(false)
  const [fieldErrors,   setFieldErrors]   = useState<Record<string, string>>({})
  const [apiError,      setApiError]      = useState('')
  const [calculating,   setCalculating]   = useState(false)
  const [result,        setResult]        = useState<CalcResult | null>(null)
  const [resultVisible, setResultVisible] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // ── Auth gate + country prefill ──────────────────────────────
  useEffect(() => {
    ;(async () => {
      const session = await getSession()
      if (!session) { navigate('/', { replace: true }); return }
      const saved = await getCountry()
      if (saved) { setExporter(String(saved)); setPrefilled(true) }
    })()
  }, [navigate])

  // ── Inline same-country check on change ──────────────────────
  function checkSameCountry(exp: string, imp: string) {
    if (exp && imp && exp === imp) {
      setFieldErrors(prev => ({
        ...prev,
        importer: 'Importer cannot be the same as exporter.',
        exporter: ' ',
      }))
    } else {
      setFieldErrors(prev => {
        const next = { ...prev }
        if (next.importer === 'Importer cannot be the same as exporter.') delete next.importer
        if (next.exporter === ' ') delete next.exporter
        return next
      })
    }
  }

  function clearResult() {
    setResultVisible(false)
    setTimeout(() => setResult(null), 300)
  }

  // ── Validation ───────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!exporter)                           e.exporter = 'Please select an exporter.'
    if (!importer)                           e.importer = 'Please select an importer.'
    if (!category)                           e.category = 'Please select a category.'
    if (!declared || parseInt(declared) < 1) e.declared = 'Enter a positive integer value.'
    if (exporter && importer && exporter === importer) {
      e.importer = 'Importer cannot be the same as exporter.'
      e.exporter = ' '
    }
    setFieldErrors(e)
    return !Object.keys(e).length
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setCalculating(true)
    clearResult()

    try {
      const res = await fetch('/calculate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          exporter:       parseInt(exporter),
          importer:       parseInt(importer),
          category:       parseInt(category),
          declared_value: parseInt(declared),
          condition,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setApiError(data.error ?? `Server error ${res.status}`); return }
      setResult(data)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setResultVisible(true))
      )
      setTimeout(() =>
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50
      )
    } catch {
      setApiError('Could not reach the backend. Is the Flask server running on port 5000?')
    } finally {
      setCalculating(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.text, minHeight: '100vh' }}>

      {/* ── Spinner keyframes ──────────────────────────────────── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 58,
        background: C.bgCard, borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.text }}>
          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🌐</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Trade<span style={{ color: C.accent }}>Gate</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/settings"
            style={{
              color: C.textLabel, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 500,
              padding: '0.45rem 0.85rem', borderRadius: 6,
              border: `1px solid ${C.border}`,
            }}
          >
            ⚙ Settings
          </Link>
          <button
            onClick={() => signOut()}
            style={{
              fontSize: '0.85rem', fontWeight: 500, padding: '0.45rem 0.85rem',
              borderRadius: 6, border: `1px solid ${C.border}`,
              background: 'transparent', color: C.textDim,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Page ──────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 760, margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
        padding: '2rem 1rem 0',
      }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <header style={{ textAlign: 'center', paddingBottom: '0.25rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
            color: '#93c5fd', fontSize: '0.7rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '0.3rem 0.85rem', borderRadius: 100, marginBottom: '1rem',
          }}>
            8086 ASM Engine · Flask API · Gemini AI
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.55rem', marginBottom: '0.4rem',
          }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>🌐</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
              Trade<span style={{ color: C.accent }}>Gate</span>
            </h1>
          </div>
          <p style={{ color: C.textDim, fontSize: '0.85rem', marginTop: '0.35rem', letterSpacing: '0.01em' }}>
            AI-Powered International Trade Tariff Calculator
          </p>
        </header>

        {/* ── Form Card ───────────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            <span style={{ display: 'inline-block', width: 3, height: 14, background: C.accent, borderRadius: 2, flexShrink: 0 }} />
            Transaction Details
          </div>

          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>

              {/* Exporter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={labelStyle}>Exporter Country</label>
                <select
                  value={exporter}
                  onChange={e => {
                    setExporter(e.target.value)
                    checkSameCountry(e.target.value, importer)
                    clearResult()
                  }}
                  style={{ ...selectBase, borderColor: fieldErrors.exporter?.trim() ? C.red : C.border }}
                >
                  <option value="" disabled style={{ background: C.bgInput }}>Select country</option>
                  {COUNTRY_IDS.map(id => (
                    <option key={id} value={id} style={{ background: C.bgInput }}>{COUNTRIES[id]}</option>
                  ))}
                </select>
                <div style={fieldErrorStyle}>{fieldErrors.exporter?.trim() || ''}</div>
                {prefilled && (
                  <div style={{ fontSize: '0.75rem', color: C.textDim }}>
                    Pre-filled from your settings —{' '}
                    <Link to="/settings" style={{ color: C.accent, textDecoration: 'none' }}>Change</Link>
                  </div>
                )}
              </div>

              {/* Importer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={labelStyle}>Importer Country</label>
                <select
                  value={importer}
                  onChange={e => {
                    setImporter(e.target.value)
                    checkSameCountry(exporter, e.target.value)
                    clearResult()
                  }}
                  style={{ ...selectBase, borderColor: fieldErrors.importer ? C.red : C.border }}
                >
                  <option value="" disabled style={{ background: C.bgInput }}>Select country</option>
                  {COUNTRY_IDS.map(id => (
                    <option key={id} value={id} style={{ background: C.bgInput }}>{COUNTRIES[id]}</option>
                  ))}
                </select>
                <div style={fieldErrorStyle}>{fieldErrors.importer || ''}</div>
              </div>

              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={labelStyle}>Goods Category</label>
                <select
                  value={category}
                  onChange={e => { setCategory(e.target.value); clearResult() }}
                  style={{ ...selectBase, borderColor: fieldErrors.category ? C.red : C.border }}
                >
                  <option value="" disabled style={{ background: C.bgInput }}>Select category</option>
                  {Object.entries(CATEGORIES).map(([id, name]) => (
                    <option key={id} value={id} style={{ background: C.bgInput }}>{name}</option>
                  ))}
                </select>
                <div style={fieldErrorStyle}>{fieldErrors.category || ''}</div>
              </div>

              {/* Declared Value */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={labelStyle}>
                  Declared Value{' '}
                  <span style={{ fontWeight: 400, color: C.textDim }}>(USD)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 500000"
                  value={declared}
                  onChange={e => { setDeclared(e.target.value); clearResult() }}
                  style={{ ...inputBase, borderColor: fieldErrors.declared ? C.red : C.border }}
                />
                <div style={fieldErrorStyle}>{fieldErrors.declared || ''}</div>
              </div>

              {/* Trade Condition — full width */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <label style={labelStyle}>Trade Condition</label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {([
                    [1, 'Normal'],
                    [2, 'Preferential −5%'],
                    [3, 'Penalty +10%'],
                  ] as [number, string][]).map(([id, lbl]) => (
                    <div
                      key={id}
                      onClick={() => { setCondition(id); clearResult() }}
                      style={{
                        flex: 1, minWidth: 120, textAlign: 'center',
                        padding: '0.6rem 0.5rem',
                        background: condition === id ? 'rgba(59,130,246,0.15)' : C.bgInput,
                        border: `1px solid ${condition === id ? C.accent : C.border}`,
                        borderRadius: 7, cursor: 'pointer',
                        color: condition === id ? C.text : C.textLabel,
                        fontSize: '0.82rem', fontWeight: 500,
                        transition: 'all 0.15s', userSelect: 'none',
                      }}
                    >
                      {lbl}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Submit */}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={calculating}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.6rem',
                  background: C.accent, color: '#fff', border: 'none', borderRadius: 7,
                  fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600,
                  padding: '0.78rem 1.5rem', width: '100%',
                  cursor: calculating ? 'not-allowed' : 'pointer',
                  opacity: calculating ? 0.5 : 1,
                  transition: 'background 0.15s, opacity 0.15s',
                }}
              >
                {calculating ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.65s linear infinite',
                    }} />
                    Calculating…
                  </>
                ) : 'Calculate Duty'}
              </button>
            </div>
          </form>

          {/* API error banner */}
          {apiError && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', borderRadius: 10, padding: '0.85rem 1rem',
              fontSize: '0.85rem', lineHeight: 1.5, marginTop: '1rem',
            }}>
              {apiError}
            </div>
          )}
        </div>

        {/* ── Result Card ──────────────────────────────────────── */}
        <div
          ref={resultRef}
          style={{
            ...cardStyle,
            display:    result ? 'block' : 'none',
            opacity:    resultVisible ? 1 : 0,
            transform:  resultVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {result && (
            <>
              <div style={cardTitleStyle}>
                <span style={{ display: 'inline-block', width: 3, height: 14, background: C.accent, borderRadius: 2, flexShrink: 0 }} />
                Calculation Result
              </div>

              {/* Trade Summary */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={sectionTitleStyle}>Trade Summary</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {([
                      ['Exporter',       COUNTRY_NAMES[parseInt(exporter)]  ?? '—'],
                      ['Importer',       COUNTRY_NAMES[parseInt(importer)]  ?? '—'],
                      ['Goods Category', CATEGORIES[parseInt(category)]     ?? '—'],
                      ['Declared Value', usd(parseInt(declared) || 0)],
                    ] as [string, string][]).map(([k, v], i, arr) => (
                      <tr key={k}>
                        <td style={{
                          padding: '0.5rem 0', fontSize: '0.88rem', verticalAlign: 'top',
                          borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : `1px solid ${C.border}`,
                          color: C.textDim, width: '48%',
                        }}>
                          {k}
                        </td>
                        <td style={{
                          padding: '0.5rem 0', fontSize: '0.88rem', verticalAlign: 'top',
                          borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : `1px solid ${C.border}`,
                          color: C.text, fontWeight: 500, textAlign: 'right',
                        }}>
                          {v}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: '0.5rem 0', fontSize: '0.88rem', color: C.textDim, width: '48%' }}>
                        Trade Condition
                      </td>
                      <td style={{
                        padding: '0.5rem 0', fontSize: '0.88rem', fontWeight: 500, textAlign: 'right',
                        color: condition === 2 ? C.green : condition === 3 ? C.red : C.text,
                      }}>
                        {condition === 1 ? 'Normal' : condition === 2 ? 'Preferential ▼5%' : 'Penalty ▲10%'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Applied Tariff */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={sectionTitleStyle}>Applied Tariff</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                  <span style={result.ai_assisted ? {
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    fontSize: '0.72rem', fontWeight: 600, padding: '0.28rem 0.7rem',
                    borderRadius: 100, letterSpacing: '0.04em',
                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                    color: '#6ee7b7', boxShadow: '0 0 10px rgba(16,185,129,0.15)',
                  } : {
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    fontSize: '0.72rem', fontWeight: 600, padding: '0.28rem 0.7rem',
                    borderRadius: 100, letterSpacing: '0.04em',
                    background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)',
                    color: C.textDim,
                  }}>
                    {result.ai_assisted ? '✨ AI-Assisted Rate' : '📊 Standard Rate'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: C.textDim, marginBottom: '0.35rem' }}>Base Tariff</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#60a5fa' }}>{result.base_tariff}</div>
                  </div>
                  <div style={{ background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem 1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: C.textDim, marginBottom: '0.35rem' }}>Effective Tariff</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 700, color: C.green }}>{result.effective_tariff}</div>
                  </div>
                </div>
              </div>

              {/* Duty Payable */}
              <div>
                <div style={sectionTitleStyle}>Duty Payable</div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.08))',
                  border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '1.25rem 1.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ color: C.textDim, fontSize: '0.82rem', fontWeight: 500 }}>Total Duty Amount</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 700, color: C.green, letterSpacing: '-0.02em' }}>
                        {usd(result.duty_payable)}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                      background: 'rgba(59,130,246,0.15)', color: '#93c5fd',
                      border: '1px solid rgba(59,130,246,0.25)', padding: '0.25rem 0.65rem', borderRadius: 100,
                    }}>
                      ⚙ DOSBox ASM
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: C.textDim, marginTop: '0.5rem', fontStyle: 'italic' }}>
                    {result.ai_assisted ? 'Rate sourced live via Gemini AI' : 'Rate from standard tariff table'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer style={{
          textAlign: 'center', color: C.textDim, fontSize: '0.75rem',
          padding: '1.5rem 0', borderTop: `1px solid ${C.border}`, marginTop: '0.5rem',
        }}>
          TradeGate © 2026 &nbsp;|&nbsp; Powered by 8086 ASM + Gemini AI
        </footer>

      </div>
    </div>
  )
}
