// ============================================================
// ARKZEN ENGINE — GLOBAL AUTH STORE v4.1 (COOKIE + PER-TATEMONO)
// React+Vite edition — drop into:
//   engine/frontend/react-vite/src/arkzen/core/stores/authStore.ts
//
// Identical logic to the Next.js version but:
//   • No Next.js imports (none were needed anyway — all logic is
//     pure browser/client-side)
//   • process.env.NEXT_PUBLIC_* is NOT referenced here; env vars
//     for Vite live in import.meta.env.VITE_* inside page files
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────
// TATEMONO SLUG RESOLUTION
// ─────────────────────────────────────────────

declare global {
  interface Window {
    __ARKZEN_TATEMONO__?: string
  }
}

function getSlug(): string {
  const s = typeof window !== 'undefined' ? window.__ARKZEN_TATEMONO__ : undefined
  if (!s) throw new Error('[Arkzen] window.__ARKZEN_TATEMONO__ is not set. Did you forget to call setActiveTatemono() in your tatemono?')
  return s
}

function getAuthBase(): string {
  return `/api/${getSlug()}/auth`
}

// ─────────────────────────────────────────────
// COOKIE HELPERS
// ─────────────────────────────────────────────

function setCookie(slug: string, token: string): void {
  document.cookie = `arkzen-auth-${slug}=${token}; path=/; SameSite=Lax`
}

function clearCookie(slug: string): void {
  document.cookie = `arkzen-auth-${slug}=; path=/; max-age=0`
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
    if (status === 0 || !res.url) {
      throw new Error('Cannot reach the server. Is the backend running?')
    }
    if (status >= 500) {
      throw new Error(`Server error (${status}). Check the Laravel logs.`)
    }
    if (status === 404) {
      throw new Error(`API route not found (${status}). Check your backend routes.`)
    }
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

      // ── Login ────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch(`${getAuthBase()}/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:    JSON.stringify({ email, password }),
          })

          const data = await safeJson<{ user: ArkzenUser; token: string; message?: string }>(res)

          if (!res.ok) {
            throw new Error(data.message ?? 'Login failed. Check your credentials.')
          }

          set({ user: data.user, token: data.token, isAuthenticated: true })
          setCookie(getSlug(), data.token)
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Register ─────────────────────────────
      register: async (name, email, password, passwordConfirmation) => {
        set({ isLoading: true })
        try {
          const res = await fetch(`${getAuthBase()}/register`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:    JSON.stringify({
              name,
              email,
              password,
              password_confirmation: passwordConfirmation,
            }),
          })

          const data = await safeJson<{ user: ArkzenUser; token: string; message?: string }>(res)

          if (!res.ok) {
            throw new Error(data.message ?? 'Registration failed.')
          }

          set({ user: data.user, token: data.token, isAuthenticated: true })
          setCookie(getSlug(), data.token)
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Logout ───────────────────────────────
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
          // Logout locally even if request fails
        } finally {
          set({ user: null, token: null, isAuthenticated: false })
          clearCookie(getSlug())
        }
      },

      // ── Fetch Current User ────────────────────
      fetchMe: async () => {
        const { token } = get()
        if (!token) { set({ isAuthenticated: false }); return }

        set({ isLoading: true })
        try {
          const res = await fetch(`${getAuthBase()}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept':        'application/json',
            },
          })

          if (!res.ok) {
            set({ user: null, token: null, isAuthenticated: false })
            return
          }

          const user = await safeJson<ArkzenUser>(res)
          set({ user, isAuthenticated: true })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Refresh User ─────────────────────────
      refreshUser: async () => {
        await get().fetchMe()
      },

      // ── Manual setToken ───────────────────────
      setToken: (token, user) => {
        set({ token, user, isAuthenticated: true })
        setCookie(getSlug(), token)
      },

      // ── Clear ─────────────────────────────────
      clear: () => {
        set({ user: null, token: null, isAuthenticated: false })
        clearCookie(getSlug())
      },
    }),

    {
      name:       `arkzen-auth-${typeof window !== 'undefined' ? (window.__ARKZEN_TATEMONO__ ?? 'default') : 'default'}`,
      partialize: (state) => ({ token: state.token }),
    }
  )
)

// ─────────────────────────────────────────────
// FETCH HELPER
// ─────────────────────────────────────────────

export async function arkzenFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().token

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Accept':        'application/json',
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
  if (typeof window !== 'undefined') {
    window.__ARKZEN_TATEMONO__ = slug
  }
}