// ============================================================
// ARKZEN ENGINE — LYNX AUTH STORE v1.0
// arkzen/core/stores/authStore.ts
//
// Lynx port of native-core/stores/authStore.ts.
// Unaffected by the Tailwind/className rework — this file is
// pure logic with no styling, so it's unchanged from the
// previous pass. Included here so the whole folder set is
// copy-paste complete in one place.
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
    if (status >= 500)            throw new Error(`Server error (${status}). Check the Laravel logs.`)
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
