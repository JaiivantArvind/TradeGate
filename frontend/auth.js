import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tghzoebwbexrjjjvjgek.supabase.co'   // replace with real URL
const SUPABASE_ANON_KEY = 'sb_publishable_pcpRLRbwj4PlLVoHUrX91g_n9ly7sdj'                 // replace with real anon key

let _client = null

async function init() {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _client
}

async function getSession() {
  const client = await init()
  const { data } = await client.auth.getSession()
  return data?.session ?? null
}

async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}

async function signInWithGoogle() {
  const client = await init()
  const user = await getUser()

  // If user already has a country set, redirect to index after login
  const hasCountry = user?.user_metadata?.home_country != null
  const redirectTo = hasCountry
    ? window.location.origin + '/index.html'
    : window.location.origin + '/settings.html'

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) console.error('Google sign-in error:', error.message)
}

async function signInWithEmail(email, password) {
  const client = await init()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) return { error }
  return { user: data.user }
}

async function signUpWithEmail(email, password) {
  const client = await init()
  const { data, error } = await client.auth.signUp({ email, password })
  if (error) return { error }
  return { user: data.user }
}

async function signOut() {
  const client = await init()
  await client.auth.signOut()
  window.location.href = '/login.html'
}

async function requireAuth() {
  const session = await getSession()
  if (!session) {
    window.location.href = '/login.html'
    return null
  }
  return session.user
}

async function saveCountry(countryId) {
  const client = await init()
  const { data, error } = await client.auth.updateUser({
    data: { home_country: countryId },
  })
  if (error) return { error }
  return { user: data.user }
}

async function getCountry() {
  const user = await getUser()
  return user?.user_metadata?.home_country ?? null
}

window.Auth = {
  init,
  getSession,
  getUser,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  requireAuth,
  saveCountry,
  getCountry,
}
