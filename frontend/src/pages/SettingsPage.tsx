import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getSession, getUser, getCountry, saveCountry, signOut } from '@/lib/auth'

const COUNTRIES = [
  { id: 1,  label: '🇺🇸 USA'         },
  { id: 2,  label: '🇨🇳 China'       },
  { id: 3,  label: '🇮🇳 India'       },
  { id: 4,  label: '🇩🇪 Germany'     },
  { id: 5,  label: '🇯🇵 Japan'       },
  { id: 6,  label: '🇰🇷 South Korea' },
  { id: 7,  label: '🇻🇳 Vietnam'     },
  { id: 8,  label: '🇲🇾 Malaysia'    },
  { id: 9,  label: '🇬🇧 UK'          },
  { id: 10, label: '🇫🇷 France'      },
]

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()

  const [email, setEmail]           = useState<string | null>(null)
  const [countryId, setCountryId]   = useState<string>('')
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  // ── Auth gate + load user data ─────────────────────────────
  useEffect(() => {
    ;(async () => {
      const session = await getSession()
      if (!session) { navigate('/', { replace: true }); return }

      const [user, savedCountry] = await Promise.all([getUser(), getCountry()])
      setEmail(user?.email ?? null)
      if (savedCountry) setCountryId(String(savedCountry))
      setLoading(false)
    })()
  }, [navigate])

  // ── Save settings ──────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(''); setSaveSuccess('')

    if (!countryId) {
      setSaveError('Please select a country before saving.')
      return
    }

    setSaving(true)
    const { error } = await saveCountry(parseInt(countryId))
    setSaving(false)

    if (error) {
      setSaveError(error.message ?? 'Failed to save settings. Please try again.')
      return
    }

    setSaveSuccess('✅ Settings saved!')
    setTimeout(() => navigate('/calculator', { replace: true }), 2000)
  }

  // ── Shared styles ──────────────────────────────────────────
  const inputCls =
    'w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm px-3.5 py-2.5 outline-none focus:border-blue-400 transition-colors placeholder:text-white/30'
  const sectionLabelCls =
    'text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2 before:content-[""] before:inline-block before:w-0.5 before:h-3 before:bg-blue-400 before:rounded'

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 h-14 bg-[#0b0f1a]/80 backdrop-blur-md border-b border-white/10">
        <span className="text-base font-bold text-white tracking-tight">
          Trade<span className="text-blue-400">Gate</span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            to="/calculator"
            className="text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-blue-400/50 rounded-lg px-3 py-1.5 transition-colors"
          >
            ⚡ Calculator
          </Link>
          <button
            onClick={() => signOut()}
            className="text-sm font-medium text-white/60 hover:text-red-400 border border-white/10 hover:border-red-400/40 rounded-lg px-3 py-1.5 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

            {/* Card header */}
            <div className="px-7 pt-7 pb-5 border-b border-white/10">
              <h1 className="text-xl font-bold text-white mb-1">Account Settings</h1>
              <p className="text-sm text-white/40">Manage your profile and preferences</p>
            </div>

            {/* ── Section 1: Profile ──────────────────────── */}
            <div className="px-7 py-6 border-b border-white/10">
              <p className={sectionLabelCls}>Profile</p>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Logged in as
              </label>
              {loading ? (
                <div className="h-10 rounded-lg bg-white/10 animate-pulse" />
              ) : (
                <div className={`${inputCls} text-white/50 cursor-default select-all`}>
                  {email ?? '—'}
                </div>
              )}
            </div>

            {/* ── Section 2: Home Country ──────────────────── */}
            <div className="px-7 py-6 border-b border-white/10">
              <p className={sectionLabelCls}>Home Country</p>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">
                    Your Country
                  </label>
                  <p className="text-xs text-white/30 mb-2">
                    Pre-fills the Exporter field in the calculator
                  </p>
                  <select
                    value={countryId}
                    onChange={(e) => setCountryId(e.target.value)}
                    disabled={loading}
                    className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm px-3.5 py-2.5 outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2394a3b8' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.9rem center',
                    }}
                  >
                    <option value="" disabled className="bg-[#1a2236] text-white">
                      Select your country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#1a2236] text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving || loading}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {saving ? <><Spinner /> Saving…</> : 'Save Settings'}
                </button>

                {saveError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    {saveError}
                  </p>
                )}
                {saveSuccess && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                    {saveSuccess} Redirecting to calculator…
                  </p>
                )}
              </form>
            </div>

            {/* ── Section 3: Danger Zone ───────────────────── */}
            <div className="px-7 py-6">
              <p className={sectionLabelCls}>Danger Zone</p>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center bg-transparent hover:bg-red-500/10 text-red-400 text-sm font-semibold py-2.5 rounded-lg border border-red-500/40 hover:border-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>

          </div>
        </div>
      </main>

    </div>
  )
}
