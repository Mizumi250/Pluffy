// ============================================================
// ARKZEN ENGINE — NATIVE AUTH STORE v1.1
// React Native specific. No window/document/localStorage.
//
// v1.1: Fixed per-tatemono token isolation.
//       v1.0 used a dynamic persist name getter which caused
//       cross-tatemono token bleed — the store rehydrated with
//       whichever slug was last active, so broadcast-test would
//       load the roles-test token and get 401 on auth:sanctum.
//
//       Fix: persist a single map of slug→token in AsyncStorage
//       under a fixed key 'arkzen-auth-tokens'. getToken() reads
//       the current slug's token at call time. setToken/clearToken
//       update only that slug's entry. The store itself holds the
//       currently active user + token for the active tatemono.
//
// Lives in engine/shared/arkzen/native-core/stores/ and is
// sync-copied into mobile stacks (expo, bare-rn, lynx) by
// shared-sync.ts.
// ============================================================

import AsyncStorage                    from '@react-native-async-storage/async-storage'
import { create }                      from 'zustand'
import { persist, createJSONStorage }  from 'zustand/middleware'
import { useEffect, useState }         from 'react'

// ─────────────────────────────────────────────
// TATEMONO SLUG RESOLUTION
// ─────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __ARKZEN_TATEMONO__: string | undefined
}

function getSlug(): string {
  const s = global.__ARKZEN_TATEMONO__
  if (!s) throw new Error('[Arkzen] __ARKZEN_TATEMONO__ is not set. Did you forget to call setActiveTatemono()?')
  return s
}

function getAuthBase(): string {
  const base = (process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')
  return `${base}/api/${getSlug()}/auth`
}

// ─────────────────────────────────────────────
// PER-TATEMONO TOKEN MAP
// Stored under a fixed AsyncStorage key so each
// slug's token is isolated and survives app restarts.
// ─────────────────────────────────────────────

const TOKEN_MAP_KEY = 'arkzen-auth-tokens'

async function readTokenMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(TOKEN_MAP_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

async function writeTokenToMap(slug: string, token: string): Promise<void> {
  try {
    const map = await readTokenMap()
    map[slug] = token
    await AsyncStorage.setItem(TOKEN_MAP_KEY, JSON.stringify(map))
  } catch {}
}

async function clearTokenFromMap(slug: string): Promise<void> {
  try {
    const map = await readTokenMap()
    delete map[slug]
    await AsyncStorage.setItem(TOKEN_MAP_KEY, JSON.stringify(map))
  } catch {}
}

async function getTokenForSlug(slug: string): Promise<string | null> {
  const map = await readTokenMap()
  return map[slug] ?? null
}

// ─────────────────────────────────────────────
// COOKIE HELPERS — no-ops on native
// Token is persisted via AsyncStorage token map instead
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setCookie(_slug: string, _token: string): void {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function clearCookie(_slug: string): void {}

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
// STORE
// ─────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
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
          await writeTokenToMap(slug, data.token)
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
          await writeTokenToMap(slug, data.token)
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        const slug    = getSlug()
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
          await clearTokenFromMap(slug)
        }
      },

      fetchMe: async () => {
        // Read from the isolated token map — not get().token which is
        // never persisted and is always null on cold start, causing
        // fetchMe to immediately wipe isAuthenticated and corrupt the
        // store for the active tatemono.
        const slug  = global.__ARKZEN_TATEMONO__ ?? ''
        const token = slug
          ? await getTokenForSlug(slug)
          : get().token
        if (!token) { set({ isAuthenticated: false }); return }
        // Sync token into store so the rest of the app can read it
        set({ token })
        set({ isLoading: true })
        try {
          const res = await fetch(`${getAuthBase()}/me`, {
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
        void writeTokenToMap(slug, token)
      },

      clear: () => {
        const slug = getSlug()
        set({ user: null, token: null, isAuthenticated: false })
        void clearTokenFromMap(slug)
      },
    }),

    {
      // Fixed key — token isolation is now handled by the token map,
      // not by a dynamic persist name. The store persists user + auth
      // state for the currently active tatemono only.
      name:    'arkzen-auth-active',
      storage: createJSONStorage(() => AsyncStorage),
      // v1.1: do NOT persist token here — token lives in the token map.
      // Persisting it here caused the cross-tatemono bleed in v1.0.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ─────────────────────────────────────────────
// HYDRATION HOOK
// ─────────────────────────────────────────────
//
// Starts false — AsyncStorage reads are always async on native.
// Layouts must gate on this to avoid redirecting to login before
// the token is restored from storage.

export function useAuthStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist?.hasHydrated() ?? false)

  useEffect(() => {
    if (hydrated) return
    if (!useAuthStore.persist) { setHydrated(true); return }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    if (useAuthStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  return hydrated
}

// ─────────────────────────────────────────────
// FETCH HELPERS
// ─────────────────────────────────────────────
//
// v1.1: arkzenFetch reads the token from the per-slug token map
// so it always uses the correct token for the active tatemono,
// even if the store was rehydrated with a different slug's state.

export async function arkzenFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const slug  = global.__ARKZEN_TATEMONO__
  const token = slug
    ? await getTokenForSlug(slug)
    : useAuthStore.getState().token

  const base        = (process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')
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
// TATEMONO LAYOUT HELPER
// ─────────────────────────────────────────────
//
// v1.1: Also syncs the active tatemono's token from the map
// into the store so useAuthStore().token is correct for the
// current screen.

export function setActiveTatemono(slug: string): void {
  global.__ARKZEN_TATEMONO__ = slug
  // Sync token from map into store for the newly active tatemono
  void getTokenForSlug(slug).then(token => {
    if (token) {
      const state = useAuthStore.getState()
      if (state.token !== token) {
        useAuthStore.setState({ token, isAuthenticated: true })
      }
    } else {
      const current = useAuthStore.getState()
      if (!current.token && !current.isAuthenticated) {
        useAuthStore.setState({ token: null, isAuthenticated: false, user: null })
      }
    }
  })
}
