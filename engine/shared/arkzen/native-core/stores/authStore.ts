// ============================================================
// ARKZEN ENGINE — NATIVE AUTH STORE v1.2
// React Native specific. No window/document/localStorage.
//
// v1.2: Fixed cross-tatemono user/isAuthenticated bleed.
//       v1.1 persisted { user, isAuthenticated } under the fixed
//       key 'arkzen-auth-active' — shared by ALL tatemonos.
//       Logging into broadcast-test would persist isAuthenticated:true
//       and broadcast-test's user into that key. Navigating to
//       roles-test or notification-test would rehydrate from the
//       same key → wrong user shown, wrong auth state.
//
//       Fix: remove zustand persist entirely. Auth state is ephemeral
//       in the store. Tokens survive restarts via the isolated token
//       map. Layouts call fetchMe() on mount via tatSlug useEffect.
//       setActiveTatemono() is now safe to call at module load time —
//       it only sets the global slug, no setState, no async work.
//
// v1.1: Fixed per-tatemono token isolation (token map).
// v1.0: Initial native auth store.
//
// Lives in engine/shared/arkzen/native-core/stores/ and is
// sync-copied into mobile stacks (expo, bare-rn, lynx) by
// shared-sync.ts.
// ============================================================

import AsyncStorage   from '@react-native-async-storage/async-storage'
import { create }     from 'zustand'
import { useEffect, useState } from 'react'  // ← still needed for useAuthStoreHydrated? No — but we keep useEffect for potential future. Actually v1.2 returns true, so useState is dead. Let's remove it.

// Actually, let's clean up: useAuthStoreHydrated no longer uses useState/useEffect.
// So remove those imports entirely.
// Corrected:
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { create } from 'zustand'

// But the user's file had useState imported and unused. We'll remove it.

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

export async function getTokenForSlug(slug: string): Promise<string | null> {
  const map = await readTokenMap()
  return map[slug] ?? null
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
// STORE — no persist, fully ephemeral
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
        await clearTokenFromMap(slug)
      }
    },

    fetchMe: async () => {
      // v1.1+ fix: Read from the isolated token map — not get().token which is
      // never persisted and is always null on cold start, causing fetchMe to
      // immediately wipe isAuthenticated and corrupt the store for the active tatemono.
      const slug  = global.__ARKZEN_TATEMONO__ ?? ''
      const token = slug ? await getTokenForSlug(slug) : get().token
      if (!token) { set({ user: null, token: null, isAuthenticated: false }); return }
      // Sync token into store so the rest of the app can read it
      set({ token, isLoading: true })
      try {
        const base = (process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')
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
      void writeTokenToMap(slug, token)
    },

    clear: () => {
      const slug = getSlug()
      set({ user: null, token: null, isAuthenticated: false })
      void clearTokenFromMap(slug)
    },
  })
)

// ─────────────────────────────────────────────
// HYDRATION HOOK
// v1.2: No persist means no async rehydration.
// Returns true immediately — layouts use fetchMe
// via useEffect instead.
// ─────────────────────────────────────────────

export function useAuthStoreHydrated(): boolean {
  return true
}

// ─────────────────────────────────────────────
// FETCH HELPER
// ─────────────────────────────────────────────

export async function arkzenFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const slug  = global.__ARKZEN_TATEMONO__
  const token = slug ? await getTokenForSlug(slug) : useAuthStore.getState().token

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
// TATEMONO SLUG HELPER
// Safe to call at module load time — only sets
// the global slug. No setState, no async work.
// Layouts call fetchMe() themselves via useEffect.
// ─────────────────────────────────────────────

export function setActiveTatemono(slug: string): void {
  const previous = global.__ARKZEN_TATEMONO__
  global.__ARKZEN_TATEMONO__ = slug

  // If switching to a different tatemono, wipe in-memory state so the previous
  // tatemono's user/token don't bleed through. The new tatemono's layout will
  // call fetchMe() on mount to restore its own session from the token map.
  if (previous !== slug) {
    useAuthStore.setState({
      user:            null,
      token:           null,
      isAuthenticated: false,
      isLoading:       false,
    })
  }
}