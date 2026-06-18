// ============================================================
// ARKZEN — useArkzenNativeAuth Hook v2.0
// src/hooks/useArkzenNativeAuth.ts
//
// Bare React Native equivalent of expo's useArkzenExpoAuth.ts.
//
// v2.0 — FULL WIRE-UP.
//   - Removed placeholder SecureStore stub — uses real
//     @react-native-async-storage/async-storage (bare RN has
//     no expo-secure-store; use AsyncStorage + your own
//     encryption layer or react-native-encrypted-storage for
//     production hardening)
//   - Same tatemono-scoped API (/api/{slug}/auth/*)
//   - Same Laravel Sanctum token-based backend as Expo stack
//   - Per-tatemono token isolation (arkzen-token-{slug})
//   - Exports apiFetch() helper for authenticated requests
//
// v1.0 — Foundation: stubbed SecureStore, core hook shape only.
//
// NOTE on storage:
//   Bare RN doesn't ship expo-secure-store. AsyncStorage is
//   cleartext. For production, swap the STORAGE_* helpers below
//   for react-native-encrypted-storage or react-native-keychain.
//   The hook API is identical regardless of storage backend.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BACKEND_URL = (
  process.env.ARKZEN_BACKEND_URL ??
  process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ??
  'http://localhost:8000'
).replace(/\/$/, '')

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

type LoginResult    = { success: true } | { success: false; error: string }
type RegisterResult = { success: true } | { success: false; error: string }

// ─── Storage helpers (swap out for encrypted storage in production) ────────────

async function storageGet(key: string): Promise<string | null> {
  try { return await AsyncStorage.getItem(key) }
  catch { return null }
}

async function storageSet(key: string, value: string): Promise<void> {
  try { await AsyncStorage.setItem(key, value) }
  catch { /* ignore */ }
}

async function storageDelete(key: string): Promise<void> {
  try { await AsyncStorage.removeItem(key) }
  catch { /* ignore */ }
}

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

export function useArkzenNativeAuth(tatSlug: string) {
  const tokenKey = `arkzen-token-${tatSlug}`

  const [state, setState] = useState<AuthState>({
    user:      null,
    token:     null,
    isLoading: true,
    error:     null,
  })

  // ── Load token on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    storageGet(tokenKey).then(async token => {
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
        await storageDelete(tokenKey)
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

      await storageSet(tokenKey, token)
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

      await storageSet(tokenKey, token)
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
      await arkzenFetch(
        `/api/${tatSlug}/auth/logout`,
        { method: 'POST' },
        state.token,
      ).catch(() => {})
    }
    await storageDelete(tokenKey)
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
