import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Cpu, Globe } from 'lucide-react'
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  getSession,
  getCountry,
} from '@/lib/auth'

// ── Google SVG icon ──────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

// ── Spinner ──────────────────────────────────────────────────
function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-block w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0 ${
        dark
          ? 'border-gray-300 border-t-gray-700'
          : 'border-white/30 border-t-white'
      }`}
    />
  )
}

// ── Main component ───────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  // Sign-in state
  const [siEmail, setSiEmail]       = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siLoading, setSiLoading]   = useState(false)
  const [siError, setSiError]       = useState('')

  // Sign-up state
  const [suEmail, setSuEmail]         = useState('')
  const [suPassword, setSuPassword]   = useState('')
  const [suConfirm, setSuConfirm]     = useState('')
  const [suLoading, setSuLoading]     = useState(false)
  const [suError, setSuError]         = useState('')
  const [suSuccess, setSuSuccess]     = useState('')

  // Google loading
  const [googleLoading, setGoogleLoading] = useState(false)

  // ── Session check on mount ─────────────────────────────────
  useEffect(() => {
    ;(async () => {
      const session = await getSession()
      if (!session) return
      const country = await getCountry()
      navigate(country ? '/calculator' : '/settings', { replace: true })
    })()
  }, [navigate])

  // ── Post-sign-in redirect helper ──────────────────────────
  async function redirectAfterSignIn() {
    const country = await getCountry()
    navigate(country ? '/calculator' : '/settings', { replace: true })
  }

  // ── Sign in with email ────────────────────────────────────
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setSiError('')
    if (!siEmail || !siPassword) {
      setSiError('Please enter your email and password.')
      return
    }
    setSiLoading(true)
    const { error } = await signInWithEmail(siEmail, siPassword)
    setSiLoading(false)
    if (error) { setSiError(error.message); return }
    await redirectAfterSignIn()
  }

  // ── Sign up with email ────────────────────────────────────
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setSuError(''); setSuSuccess('')
    if (!suEmail || !suPassword || !suConfirm) {
      setSuError('Please fill in all fields.'); return
    }
    if (suPassword !== suConfirm) {
      setSuError('Passwords do not match.'); return
    }
    if (suPassword.length < 6) {
      setSuError('Password must be at least 6 characters.'); return
    }
    setSuLoading(true)
    const { error } = await signUpWithEmail(suEmail, suPassword)
    setSuLoading(false)
    if (error) { setSuError(error.message); return }
    setSuSuccess('✅ Check your email to confirm your account.')
  }

  // ── Google OAuth ──────────────────────────────────────────
  async function handleGoogle() {
    setGoogleLoading(true)
    await signInWithGoogle()
    setTimeout(() => setGoogleLoading(false), 3000)
  }

  // ── Tab switch clears messages ────────────────────────────
  function switchTab(t: 'signin' | 'signup') {
    setTab(t)
    setSiError(''); setSuError(''); setSuSuccess('')
  }

  // ── Shared input styles ────────────────────────────────────
  const inputCls =
    'w-full bg-[#1a2236] border border-[#1f2d45] rounded-lg text-[#e2e8f0] text-sm px-3.5 py-2.5 outline-none focus:border-blue-500 transition-colors placeholder:text-[#64748b]'
  const labelCls = 'block text-xs font-medium text-[#94a3b8] mb-1.5'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-[#1f2d45] bg-[#111827]/80 backdrop-blur-sm overflow-hidden shadow-2xl relative">

        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row min-h-[580px]">

          {/* ── LEFT: Hero ─────────────────────────────────────── */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-12 relative z-10 border-b md:border-b-0 md:border-r border-[#1f2d45]">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1f2d45] bg-blue-500/10 px-3 py-1 text-xs text-blue-300 font-semibold tracking-widest uppercase mb-6 w-fit">
              8086 ASM · Flask API · Gemini AI
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-3">
              Trade<span className="text-blue-400">Gate</span>
            </h1>
            <p className="text-sm md:text-base bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-medium mb-8">
              AI-Powered International Trade Tariff Calculator
            </p>

            {/* Feature bullets */}
            <div className="flex flex-col gap-3 mb-10">
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                <Zap size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Real-time tariff rates via Gemini AI</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Live lookups powered by Google's Gemini model</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                <Cpu size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Computed by 8086 Assembly Engine</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Duty arithmetic runs on a real x86 ASM core</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                <Globe size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">10 countries, 8 goods categories</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Covering major global economies and sectors</p>
                </div>
              </div>
            </div>

            {/* Stat row */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-white">20+</p>
                <p className="text-xs text-[#64748b]">Trade Routes</p>
              </div>
              <div className="w-px h-8 bg-[#1f2d45]" />
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-xs text-[#64748b]">Goods Categories</p>
              </div>
              <div className="w-px h-8 bg-[#1f2d45]" />
              <div>
                <p className="text-2xl font-bold text-white">AI</p>
                <p className="text-xs text-[#64748b]">Gemini-Powered</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Login card ──────────────────────────────── */}
          <div className="w-full md:w-[420px] flex flex-col justify-center p-8 md:p-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-sm text-[#64748b]">Sign in to access your trade calculator</p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-[#1a2236] border border-[#1f2d45] rounded-lg p-1 gap-1 mb-6">
              {(['signin', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    tab === t
                      ? 'bg-[#111827] text-white shadow'
                      : 'text-[#64748b] hover:text-white'
                  }`}
                >
                  {t === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* ── Sign In tab ─────────────────────────────────── */}
            {tab === 'signin' && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-4" noValidate>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    className={inputCls}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    className={inputCls}
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={siLoading}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {siLoading ? <><Spinner /> Signing in…</> : 'Sign In'}
                </button>

                {siError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    {siError}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[#64748b] text-xs">
                  <div className="flex-1 h-px bg-[#1f2d45]" />
                  or
                  <div className="flex-1 h-px bg-[#1f2d45]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="flex items-center justify-center gap-2.5 w-full bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-medium py-2.5 rounded-lg border border-gray-200 transition-colors"
                >
                  {googleLoading ? <Spinner dark /> : <GoogleIcon />}
                  {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>
              </form>
            )}

            {/* ── Sign Up tab ─────────────────────────────────── */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="flex flex-col gap-4" noValidate>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                    className={inputCls}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={suPassword}
                    onChange={(e) => setSuPassword(e.target.value)}
                    className={inputCls}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={suConfirm}
                    onChange={(e) => setSuConfirm(e.target.value)}
                    className={inputCls}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={suLoading}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {suLoading ? <><Spinner /> Creating account…</> : 'Create Account'}
                </button>

                {suError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    {suError}
                  </p>
                )}
                {suSuccess && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                    {suSuccess}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[#64748b] text-xs">
                  <div className="flex-1 h-px bg-[#1f2d45]" />
                  or
                  <div className="flex-1 h-px bg-[#1f2d45]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="flex items-center justify-center gap-2.5 w-full bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-medium py-2.5 rounded-lg border border-gray-200 transition-colors"
                >
                  {googleLoading ? <Spinner dark /> : <GoogleIcon />}
                  {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
