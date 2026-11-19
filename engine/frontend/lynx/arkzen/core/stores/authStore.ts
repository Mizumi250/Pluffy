// ============================================================
// ARKZEN ENGINE — LYNX AUTH STORE v1.1
// arkzen/core/stores/authStore.ts
//
// Lynx port of native-core/stores/authStore.ts.
// Unaffected by the Tailwind/className rework — this file is
// pure logic with no styling, so it's unchanged from the
// previous pass. Included here so the whole folder set is
// copy-paste complete in one place.
//
// v1.1: Social sign-in helpers (getOAuthProviders, oauthLoginUrl,
//       oauthSignIn, completeOAuthFromUrl, consumeOAuthError) for
//       tatemonos that declare @arkzen:oauth. See the OAuth section
//       at the bottom of this file.
//
// Key differences from Expo version:
//  - NO AsyncStorage (@react-native-async-storage)
//    → Lynx exposes lynx.localStorage (synchronous KV store)
//      similar to web localStorage. Falls back to in-memory
//      map when unavailable (SSR / test env).
//  - NO EXPO_PUBLIC_* env vars
//    → uses ARKZEN_BACKEND_URL (standard env var for Lynx/rspeedy)
//      or falls back to http://localhost:8000
//  - Everything else is identical: per-tatemono token map,
//    ephemeral zustand store, setActiveTatemono, arkzenFetch.
// ============================================================

import { create } from 'zustand'

// ─────────────────────────────────────────────
// STORAGE SHIM (lynx.localStorage → in-memory fallback)
// ─────────────────────────────────────────────

const memStore: Record<string, string> = {}

function storageGet(key: string): string | null {
  try {
    // @ts-ignore — lynx global
    return lynx?.localStorage?.getItem?.(key) ?? memStore[key] ?? null
  } catch {
    return memStore[key] ?? null
  }
}

function storageSet(key: string, value: string): void {
  try {
    // @ts-ignore — lynx global
    lynx?.localStorage?.setItem?.(key, value)
  } catch {}
  memStore[key] = value
}

function storageRemove(key: string): void {
  try {
    // @ts-ignore — lynx global
    lynx?.localStorage?.removeItem?.(key)
  } catch {}
  delete memStore[key]
}

// ─────────────────────────────────────────────
// TATEMONO SLUG RESOLUTION
// ─────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __ARKZEN_TATEMONO__: string | undefined
}

function getSlug(): string {
  const s = globalThis.__ARKZEN_TATEMONO__
  if (!s) throw new Error('[Arkzen] __ARKZEN_TATEMONO__ is not set. Did you forget to call setActiveTatemono()?')
  return s
}

function getAuthBase(): string {
  // @ts-ignore — rspeedy injects process.env at build time
  const base = (process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')
  return `${base}/api/${getSlug()}/auth`
}

// ─────────────────────────────────────────────
// PER-TATEMONO TOKEN MAP (synchronous via storage shim)
// ─────────────────────────────────────────────

const TOKEN_MAP_KEY = 'arkzen-auth-tokens'

function readTokenMap(): Record<string, string> {
  try {
    const raw = storageGet(TOKEN_MAP_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeTokenToMap(slug: string, token: string): void {
  const map = readTokenMap()
  map[slug] = token
  storageSet(TOKEN_MAP_KEY, JSON.stringify(map))
}

function clearTokenFromMap(slug: string): void {
  const map = readTokenMap()
  delete map[slug]
  storageSet(TOKEN_MAP_KEY, JSON.stringify(map))
}

export function getTokenForSlug(slug: string): string | null {
  return readTokenMap()[slug] ?? null
}

// ─────────────────────────────────────────────
// SAFE JSON HELPER
// ─────────────────────────────────────────────

async function safeJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    const status = res.status
    if (status === 0 || !res.url) throw new Error('Cannot reach the server. Is the backend running?')
    if (status >= 500)            throw new Error(`Backend request failed (${status}). Confirm the selected backend is running and check its logs.`)
    if (status === 404)           throw new Error(`API route not found (${status}). Check your backend routes.`)
    throw new Error(`Unexpected server response (${status}). Expected JSON but got HTML.`)
  }
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ArkzenUser {
  id:         number
  name:       string
  email:      string
  role?:      string
  created_at: string
  updated_at: string
}

interface AuthState {
  user:            ArkzenUser | null
  token:           string | null
  isAuthenticated: boolean
  isLoading:       boolean

  login:       (email: string, password: string) => Promise<void>
  register:    (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout:      () => Promise<void>
  fetchMe:     () => Promise<void>
  refreshUser: () => Promise<void>
  setToken:    (token: string, user: ArkzenUser) => void
  clear:       () => void
}

// ─────────────────────────────────────────────
// STORE — ephemeral, no persist
// ─────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user:            null,
    token:           null,
    isAuthenticated: false,
    isLoading:       false,

    login: async (email, password) => {
      const slug = getSlug()
      set({ isLoading: true })
      try {
        const res  = await fetch(`${getAuthBase()}/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify({ email, password }),
        })
        const data = await safeJson<{ user: ArkzenUser; token: string; message?: string }>(res)
        if (!res.ok) throw new Error(data.message ?? 'Login failed. Check your credentials.')
        set({ user: data.user, token: data.token, isAuthenticated: true })
        writeTokenToMap(slug, data.token)
      } finally {
        set({ isLoading: false })
      }
    },

    register: async (name, email, password, passwordConfirmation) => {
      const slug = getSlug()
      set({ isLoading: true })
      try {
        const res  = await fetch(`${getAuthBase()}/register`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
        })
        const data = await safeJson<{ user: ArkzenUser; token: string; message?: string }>(res)
        if (!res.ok) throw new Error(data.message ?? 'Registration failed.')
        set({ user: data.user, token: data.token, isAuthenticated: true })
        writeTokenToMap(slug, data.token)
      } finally {
        set({ isLoading: false })
      }
    },

    logout: async () => {
      const slug      = getSlug()
      const { token } = get()
      try {
        await fetch(`${getAuthBase()}/logout`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Accept':        'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch {
        // logout locally even if request fails
      } finally {
        set({ user: null, token: null, isAuthenticated: false })
        clearTokenFromMap(slug)
      }
    },

    fetchMe: async () => {
      const slug  = globalThis.__ARKZEN_TATEMONO__ ?? ''
      const token = slug ? getTokenForSlug(slug) : get().token
      if (!token) { set({ user: null, token: null, isAuthenticated: false }); return }
      set({ token, isLoading: true })
      try {
        // @ts-ignore
        const base = (process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')
        const res  = await fetch(`${base}/api/${slug}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        })
        if (!res.ok) { set({ user: null, token: null, isAuthenticated: false }); return }
        const user = await safeJson<ArkzenUser>(res)
        set({ user, isAuthenticated: true })
      } catch {
        set({ user: null, token: null, isAuthenticated: false })
      } finally {
        set({ isLoading: false })
      }
    },

    refreshUser: async () => {
      await get().fetchMe()
    },

    setToken: (token, user) => {
      const slug = getSlug()
      set({ token, user, isAuthenticated: true })
      writeTokenToMap(slug, token)
    },

    clear: () => {
      const slug = getSlug()
      set({ user: null, token: null, isAuthenticated: false })
      clearTokenFromMap(slug)
    },
  })
)

// ─────────────────────────────────────────────
// HYDRATION HOOK
// No persist — returns true immediately.
// Layouts call fetchMe() on mount via tatSlug useEffect.
// ─────────────────────────────────────────────

export function useAuthStoreHydrated(): boolean {
  return true
}

// ─────────────────────────────────────────────
// FETCH HELPER
// ─────────────────────────────────────────────

export async function arkzenFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const slug  = globalThis.__ARKZEN_TATEMONO__
  const token = slug ? getTokenForSlug(slug) : useAuthStore.getState().token

  // @ts-ignore
  const base        = (process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')
  const resolvedUrl = url.startsWith('/') ? `${base}${url}` : url

  return fetch(resolvedUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}

export async function arkzenGet<T = unknown>(url: string): Promise<T> {
  const res = await arkzenFetch(url)
  return safeJson<T>(res)
}

// ─────────────────────────────────────────────
// TATEMONO SLUG HELPER
// ─────────────────────────────────────────────

export function setActiveTatemono(slug: string): void {
  const previous = globalThis.__ARKZEN_TATEMONO__
  globalThis.__ARKZEN_TATEMONO__ = slug

  if (previous !== slug) {
    useAuthStore.setState({
      user:            null,
      token:           null,
      isAuthenticated: false,
      isLoading:       false,
    })
  }
}

// ─────────────────────────────────────────────
// SOCIAL SIGN-IN (OAuth) — opt-in via @arkzen:oauth
// ─────────────────────────────────────────────
//
// Native apps have no URL hash, so the browser round trip works like this:
//   1. oauthSignIn('google', opener) hands oauthLoginUrl('google') to `opener`,
//      which opens the system browser (Expo: WebBrowser.openAuthSessionAsync,
//      bare RN / Lynx: your own in-app browser or deep-link handler).
//   2. The backend talks to the provider, then redirects to
//      OAUTH_FRONTEND_URL + redirect path + #arkzen_oauth_token=...&arkzen_oauth_slug=...
//      (or #arkzen_oauth_error=...). Set OAUTH_FRONTEND_URL in the backend
//      .env to the app's deep-link base, e.g. arkzen://oauth
//   3. `opener` resolves with that final URL and completeOAuthFromUrl() stores
//      the token in the per-tatemono token map, then calls fetchMe().
// The opener is injected so this file keeps zero extra dependencies.

export type OAuthOpener = (loginUrl: string) => Promise<string | null | undefined>

const OAUTH_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/
let lastOAuthError: string | null = null

function parseOAuthFragment(url: string): Record<string, string> {
  const out: Record<string, string> = {}
  const hash = url.indexOf('#')
  if (hash === -1) return out
  for (const pair of url.slice(hash + 1).split('&')) {
    if (!pair) continue
    const eq  = pair.indexOf('=')
    const key = eq === -1 ? pair : pair.slice(0, eq)
    const raw = eq === -1 ? ''   : pair.slice(eq + 1)
    try {
      out[decodeURIComponent(key)] = decodeURIComponent(raw.replace(/\+/g, ' '))
    } catch {
      // malformed escape: skip this pair
    }
  }
  return out
}

/** Providers the backend has configured (client id + secret present in its .env). */
export async function getOAuthProviders(): Promise<string[]> {
  try {
    const res  = await fetch(`${getAuthBase()}/oauth/providers`, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return []
    const data = await safeJson<{ providers?: { id: string; enabled?: boolean }[] }>(res)
    return (data.providers ?? []).filter(p => p.enabled !== false).map(p => p.id)
  } catch {
    return []
  }
}

/** URL to open in the system browser to start sign-in. */
export function oauthLoginUrl(provider: string): string {
  return `${getAuthBase()}/oauth/${encodeURIComponent(provider)}/redirect`
}

/** Returns the message from a failed sign-in once, then forgets it. */
export function consumeOAuthError(): string | null {
  const msg = lastOAuthError
  lastOAuthError = null
  return msg
}

/**
 * Call with the URL the backend redirected to (from the opener's result or a
 * deep-link listener). Returns true when a session was established.
 * Returns false for cancelled or failed sign-ins; read the reason with
 * consumeOAuthError().
 */
export async function completeOAuthFromUrl(url: string): Promise<boolean> {
  const params = parseOAuthFragment(url)
  const token  = params['arkzen_oauth_token']
  const slug   = params['arkzen_oauth_slug']
  const error  = params['arkzen_oauth_error']

  if (error) { lastOAuthError = error; return false }
  if (!token || !slug) return false

  const active = globalThis.__ARKZEN_TATEMONO__
  if (!OAUTH_SLUG_RE.test(slug) || slug !== active) {
    lastOAuthError = 'Sign-in finished for a different app. Please try again.'
    return false
  }

  writeTokenToMap(slug, token)
  useAuthStore.setState({ token })
  await useAuthStore.getState().fetchMe()
  return useAuthStore.getState().isAuthenticated
}

/** Full sign-in: open the browser, wait for the redirect, store the session. */
export async function oauthSignIn(provider: string, openAuthSession: OAuthOpener): Promise<boolean> {
  lastOAuthError = null
  const finalUrl = await openAuthSession(oauthLoginUrl(provider))
  if (!finalUrl) return false
  return completeOAuthFromUrl(finalUrl)
}
