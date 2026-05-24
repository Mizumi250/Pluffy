// ============================================================
// ARKZEN — useArkzenExpoAuth Hook v1.0
// src/hooks/useArkzenExpoAuth.ts
//
// Expo equivalent of the web authStore.ts (Zustand store).
// Uses expo-secure-store for token persistence instead of
// cookies/localStorage.
//
// Same tatemono-scoped API (/api/{slug}/auth/*) as web.
// Same Laravel Sanctum backend — API is completely shared.
//
// Differences from web authStore:
//   - SecureStore instead of cookies
//   - useState/useEffect instead of Zustand (no SSR concern)
//   - No CSRF token (Sanctum token auth, not session auth)
//   - Returns isAuthed boolean (web uses computed from store)
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

// ─── Types ────────────────────────────────────────────────────────────────────

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

type LoginResult    = { success: true }  | { success: false; error: string }
type RegisterResult = { success: true }  | { success: false; error: string }

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function arkzenFetch(
  url: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<Response> {
  return fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  try { return await res.json() }
  catch { return {} }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useArkzenExpoAuth(tatSlug: string) {
  const tokenKey = `arkzen-token-${tatSlug}`

  const [state, setState] = useState<AuthState>({
    user:      null,
    token:     null,
    isLoading: true,
    error:     null,
  })

  // ── Load token from SecureStore on mount ────────────────────────────────────
  useEffect(() => {
    SecureStore.getItemAsync(tokenKey).then(async token => {
      if (!token) {
        setState(s => ({ ...s, isLoading: false }))
        return
      }

      try {
        const res  = await arkzenFetch(`/api/${tatSlug}/auth/me`, {}, token)
        const data = await safeJson(res)

        if (!res.ok) throw new Error('Token invalid')

        setState({
          user:      data.user as AuthUser,
          token,
          isLoading: false,
          error:     null,
        })
      } catch {
        // Token is stale — clear it
        await SecureStore.deleteItemAsync(tokenKey)
        setState({ user: null, token: null, isLoading: false, error: null })
      }
    })
  }, [tatSlug])

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
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
  }, [tatSlug, tokenKey])

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
  ): Promise<RegisterResult> => {
    setState(s => ({ ...s, isLoading: true, error: null }))

    try {
      const res  = await arkzenFetch(`/api/${tatSlug}/auth/register`, {
        method: 'POST',
        body:   JSON.stringify({
          name,
          email,
          password,
          password_confirmation: password,
        }),
      })
      const data = await safeJson(res)

      if (!res.ok) throw new Error((data.message as string) ?? 'Registration failed')

      const token = data.token as string
      const user  = data.user  as AuthUser

      await SecureStore.setItemAsync(tokenKey, token)
      setState({ user, token, isLoading: false, error: null })
      return { success: true }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Registration failed'
      setState(s => ({ ...s, isLoading: false, error }))
      return { success: false, error }
    }
  }, [tatSlug, tokenKey])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (state.token) {
      // Tell Laravel to revoke the token
      await arkzenFetch(
        `/api/${tatSlug}/auth/logout`,
        { method: 'POST' },
        state.token,
      ).catch(() => {})
    }
    await SecureStore.deleteItemAsync(tokenKey)
    setState({ user: null, token: null, isLoading: false, error: null })
  }, [state.token, tatSlug, tokenKey])

  // ── Authenticated fetch helper ───────────────────────────────────────────────
  const apiFetch = useCallback(
    (url: string, options: RequestInit = {}) =>
      arkzenFetch(url, options, state.token),
    [state.token],
  )

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
