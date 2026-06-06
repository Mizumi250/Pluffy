// ============================================================
// ARKZEN ENGINE — NATIVE AUTH STORE v1.0
// React Native specific. No window/document/localStorage.
//
// Identical logic to web-core/stores/authStore.ts except:
//   - persist uses AsyncStorage instead of localStorage
//   - slug resolved via global instead of window
//   - cookie helpers are no-ops (token lives in AsyncStorage)
//   - useAuthStoreHydrated starts false (AsyncStorage is async)
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
// COOKIE HELPERS — no-ops on native
// Token is persisted via AsyncStorage instead
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
          setCookie(getSlug(), data.token)
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (name, email, password, passwordConfirmation) => {
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
          setCookie(getSlug(), data.token)
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
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
          clearCookie(getSlug())
        }
      },

      fetchMe: async () => {
        const { token } = get()
        if (!token) { set({ isAuthenticated: false }); return }
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
        set({ token, user, isAuthenticated: true })
        setCookie(getSlug(), token)
      },

      clear: () => {
        set({ user: null, token: null, isAuthenticated: false })
        clearCookie(getSlug())
      },
    }),

    {
      get name() {
        return `arkzen-auth-${global.__ARKZEN_TATEMONO__ ?? 'default'}`
      },
      storage:    createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token }),
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

export async function arkzenFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().token
  const base  = (process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')
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

export function setActiveTatemono(slug: string): void {
  global.__ARKZEN_TATEMONO__ = slug
}