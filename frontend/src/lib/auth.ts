import { createClient, SupabaseClient, Session, User, AuthError } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tghzoebwbexrjjjvjgek.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_pcpRLRbwj4PlLVoHUrX91g_n9ly7sdj'

let _client: SupabaseClient | null = null

export async function init(): Promise<SupabaseClient> {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _client
}

export async function getSession(): Promise<Session | null> {
  const client = await init()
  const { data } = await client.auth.getSession()
  return data?.session ?? null
}

export async function getUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

export async function signInWithGoogle(): Promise<void> {
  const client = await init()
  const user = await getUser()

  const hasCountry = user?.user_metadata?.home_country != null
  const redirectTo = hasCountry
    ? window.location.origin + '/calculator'
    : window.location.origin + '/settings'

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) console.error('Google sign-in error:', error.message)
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user?: User; error?: AuthError }> {
  const client = await init()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) return { error }
  return { user: data.user }
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ user?: User | null; error?: AuthError }> {
  const client = await init()
  const { data, error } = await client.auth.signUp({ email, password })
  if (error) return { error }
  return { user: data.user }
}

export async function signOut(): Promise<void> {
  const client = await init()
  await client.auth.signOut()
  window.location.href = '/'
}

export async function requireAuth(): Promise<User | null> {
  const session = await getSession()
  if (!session) {
    window.location.href = '/'
    return null
  }
  return session.user
}

export async function saveCountry(
  countryId: number,
): Promise<{ user?: User; error?: AuthError }> {
  const client = await init()
  const { data, error } = await client.auth.updateUser({
    data: { home_country: countryId },
  })
  if (error) return { error }
  return { user: data.user }
}

export async function getCountry(): Promise<number | null> {
  const user = await getUser()
  return user?.user_metadata?.home_country ?? null
}
