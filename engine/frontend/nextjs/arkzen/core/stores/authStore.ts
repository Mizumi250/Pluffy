// ============================================================
// ARKZEN ENGINE — SHARED AUTH STORE v1.1
// Framework-agnostic. No next/navigation or react-router imports.
// Works identically in Next.js, React+Vite, React+Inertia,
// React Native — any stack that has zustand + fetch.
//
// Cookie helpers use document.cookie (web stacks only).
// For React Native, override setCookie/clearCookie in the adapter.
//
// v1.2: Social sign-in helpers (getOAuthProviders, oauthLoginUrl,
//       consumeOAuthError) and one-shot pickup of the token that the
//       backend hands over in the URL hash after an OAuth callback.
//
// This file lives in engine/shared and is sync-copied into
// each stack's arkzen/core/stores/ by shared-sync.ts.
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'

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
  if (typeof document === 'undefined') return
  document.cookie = `arkzen-auth-${slug}=${token}; path=/; SameSite=Lax`
}

function clearCookie(slug: string): void {
  if (typeof document === 'undefined') return
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
// SOCIAL SIGN-IN (OAuth) — opt-in via @arkzen:oauth
// ─────────────────────────────────────────────
//
// Flow: the page links the browser to oauthLoginUrl('google'). The backend
// bounces through the provider, creates or links the user, and redirects back
// to the tatemono with  #arkzen_oauth_token=<token>&arkzen_oauth_slug=<slug>
// (or  #arkzen_oauth_error=<message>). The hash never reaches a server log.
// consumeOAuthHash() below runs when this module loads, writes the token into
// the same persisted slot zustand uses, and strips the hash from the address
// bar, so AuthLayout finds a normal session and calls fetchMe() as usual.

const OAUTH_HASH_TOKEN = 'arkzen_oauth_token'
const OAUTH_HASH_SLUG  = 'arkzen_oauth_slug'
const OAUTH_HASH_ERROR = 'arkzen_oauth_error'

function consumeOAuthHash(): void {
  if (typeof window === 'undefined' || !window.location.hash) return
  try {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const token  = params.get(OAUTH_HASH_TOKEN)
    const slug   = params.get(OAUTH_HASH_SLUG)
    const error  = params.get(OAUTH_HASH_ERROR)
    if (!token && !error) return

    if (token && slug && /^[a-z0-9][a-z0-9-]*$/.test(slug)) {
      window.localStorage.setItem(`arkzen-auth-${slug}`, JSON.stringify({ state: { token }, version: 0 }))
      setCookie(slug, token)
    }
    if (error) window.sessionStorage.setItem(`arkzen-oauth-error`, error)

    params.delete(OAUTH_HASH_TOKEN); params.delete(OAUTH_HASH_SLUG); params.delete(OAUTH_HASH_ERROR)
    const rest = params.toString()
    window.history.replaceState(null, '', window.location.pathname + window.location.search + (rest ? `#${rest}` : ''))
  } catch {
    // storage blocked or malformed hash: fall back to a normal logged-out state
  }
}

consumeOAuthHash()

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
          if (!res.ok) {
            set({ user: null, token: null, isAuthenticated: false })
            clearCookie(getSlug())
            return
          }
          const user = await safeJson<ArkzenUser>(res)
          set({ user, isAuthenticated: true })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
          clearCookie(getSlug())
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
      // IMPORTANT: name must use a lazy getter, not a template literal evaluated at
      // module load time. On MPA stacks (Astro), ES module imports are hoisted and
      // evaluated before any component code runs — so window.__ARKZEN_TATEMONO__ is
      // always undefined when the store is first created, causing every tatemono to
      // share the key 'arkzen-auth-default'. The lazy getter resolves the slug at the
      // moment zustand/persist first reads or writes localStorage, by which point the
      // island's setActiveTatemono() call has already executed.
      // On SPA stacks (Next.js, Vite, Inertia) this is a no-op change — the store is
      // created once and setActiveTatemono() is called before any auth action anyway.
      get name() {
        return `arkzen-auth-${typeof window !== 'undefined' ? (window.__ARKZEN_TATEMONO__ ?? 'default') : 'default'}`
      },
      partialize: (state) => ({ token: state.token }),
    }
  )
)

// ─────────────────────────────────────────────
// HYDRATION HOOK
// ─────────────────────────────────────────────
//
// useAuthStoreHydrated() — returns true once zustand/persist has
// finished rehydrating the token from localStorage.
//
// WHY THIS EXISTS:
//   SPA stacks (Next.js, Vite, Inertia) never destroy the store
//   between navigations, so hasHydrated() is already true by the
//   time any layout mounts. This hook is a safe no-op for them.
//
//   Astro (and any MPA stack) does a full page reload on every
//   navigation. The store is re-created cold and persist rehydrates
//   asynchronously. Without this hook, AuthLayout's useEffect fires
//   before the token is restored → sees null → redirects to /login.
//
// USAGE: call at the top of AuthLayout / GuestLayout:
//   const hydrated = useAuthStoreHydrated()
//   if (!hydrated) return <spinner>

export function useAuthStoreHydrated(tatemono?: string): boolean {
  // On the server (SSR), zustand/persist skips storage init because localStorage
  // doesn't exist — useAuthStore.persist is undefined. Return true immediately so
  // layouts don't block render. Hydration only matters client-side.
  const isServer = typeof window === 'undefined'
  if (!isServer && tatemono && window.__ARKZEN_TATEMONO__ !== tatemono) {
    setActiveTatemono(tatemono)
  }

  const [hydrated, setHydrated] = useState(() => {
    if (isServer) return true
    return useAuthStore.persist?.hasHydrated() ?? true
  })

  useEffect(() => {
    if (hydrated) return
    if (!useAuthStore.persist) { setHydrated(true); return }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    // Catch the race: may have finished between useState initialiser and useEffect
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
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  return fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
// SOCIAL SIGN-IN HELPERS
// ─────────────────────────────────────────────

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

/** URL to send the browser to (window.location.href = oauthLoginUrl('github')). */
export function oauthLoginUrl(provider: string): string {
  return `${getAuthBase()}/oauth/${encodeURIComponent(provider)}/redirect`
}

/** Returns the message from a failed sign-in once, then forgets it. */
export function consumeOAuthError(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const msg = window.sessionStorage.getItem('arkzen-oauth-error')
    if (msg) window.sessionStorage.removeItem('arkzen-oauth-error')
    return msg
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// TATEMONO LAYOUT HELPER
// ─────────────────────────────────────────────

export function setActiveTatemono(slug: string): void {
  if (typeof window !== 'undefined') {
    window.__ARKZEN_TATEMONO__ = slug
  }
}
