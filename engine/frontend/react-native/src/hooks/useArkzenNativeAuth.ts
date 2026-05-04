// ============================================================
// ARKZEN — useArkzenNativeAuth Hook
// React Native equivalent of authStore.ts
//
// Differences from web authStore:
//   - Token stored in SecureStore (not cookies/localStorage)
//   - Uses React Native's SecureStore for secure token persistence
//   - Same API endpoints as web (Laravel backend is shared)
//   - Same tatemono-scoped auth (/api/{slug}/auth/*)
//
// STATUS: Foundation — core structure matches web authStore.
// SecureStore dependency commented out until Expo is wired up.
// ============================================================

import { useState, useEffect, useCallback } from 'react'

// NOTE: In a real Expo project, uncomment this:
// import * as SecureStore from 'expo-secure-store'

// Placeholder until Expo is wired up
const SecureStore = {
  getItemAsync:    async (_key: string) => null as string | null,
  setItemAsync:    async (_key: string, _value: string) => {},
  deleteItemAsync: async (_key: string) => {},
}

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

interface AuthUser {
  id:    number
  name:  string
  email: string
  role?: string
}

interface AuthState {
  user:      AuthUser | null
  token:     string | null
  isLoading: boolean
  error:     string | null
}

async function arkzenFetch(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  return fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Accept':        'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  try { return await res.json() }
  catch { return {} }
}

export function useArkzenNativeAuth(tatSlug: string) {
  const tokenKey = `arkzen-token-${tatSlug}`

  const [state, setState] = useState<AuthState>({
    user:      null,
    token:     null,
    isLoading: true,
    error:     null,
  })

  // Load token from SecureStore on mount
  useEffect(() => {
    SecureStore.getItemAsync(tokenKey).then(token => {
      if (token) {
        // Token exists — fetch the user
        arkzenFetch(`/api/${tatSlug}/auth/me`, {}, token)
          .then(safeJson)
          .then(data => {
            setState({
              user:      (data.user as AuthUser) ?? null,
              token,
              isLoading: false,
              error:     null,
            })
          })
          .catch(() => {
            // Token invalid — clear it
            SecureStore.deleteItemAsync(tokenKey)
            setState({ user: null, token: null, isLoading: false, error: null })
          })
      } else {
        setState(s => ({ ...s, isLoading: false }))
      }
    })
  }, [tatSlug])

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }))
    try {
      const res  = await arkzenFetch(`/api/${tatSlug}/auth/login`, {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error((data.message as string) ?? 'Login failed')

      const token = data.token as string
      const user  = data.user  as AuthUser
      await SecureStore.setItemAsync(tokenKey, token)
      setState({ user, token, isLoading: false, error: null })
      return { success: true }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Login failed'
      setState(s => ({ ...s, isLoading: false, error }))
      return { success: false, error }
    }
  }, [tatSlug])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }))
    try {
      const res  = await arkzenFetch(`/api/${tatSlug}/auth/register`, {
        method: 'POST',
        body:   JSON.stringify({ name, email, password, password_confirmation: password }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error((data.message as string) ?? 'Register failed')

      const token = data.token as string
      const user  = data.user  as AuthUser
      await SecureStore.setItemAsync(tokenKey, token)
      setState({ user, token, isLoading: false, error: null })
      return { success: true }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Register failed'
      setState(s => ({ ...s, isLoading: false, error }))
      return { success: false, error }
    }
  }, [tatSlug])

  const logout = useCallback(async () => {
    if (state.token) {
      await arkzenFetch(`/api/${tatSlug}/auth/logout`, { method: 'POST' }, state.token).catch(() => {})
    }
    await SecureStore.deleteItemAsync(tokenKey)
    setState({ user: null, token: null, isLoading: false, error: null })
  }, [state.token, tatSlug])

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    return arkzenFetch(url, options, state.token)
  }, [state.token])

  return {
    user:      state.user,
    token:     state.token,
    isLoading: state.isLoading,
    error:     state.error,
    isAuthed:  !!state.user && !!state.token,
    login,
    register,
    logout,
    apiFetch,
  }
}