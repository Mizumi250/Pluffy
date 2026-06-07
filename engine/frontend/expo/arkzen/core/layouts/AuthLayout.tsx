// ============================================================
// ARKZEN ENGINE — NATIVE AUTH LAYOUT v1.1
//
// v1.1: Fixed cross-tatemono auth bleed.
//       v1.0 read token from useAuthStore.getState().token
//       which is never persisted (intentional in authStore v1.1)
//       so it was always null on mount. It then called fetchMe()
//       which internally called getAuthBase() → getSlug() →
//       __ARKZEN_TATEMONO__ — which could still be a stale slug
//       from the previously visited tatemono if navigation
//       happened faster than setActiveTatemono resolved.
//
//       Fix: await setActiveTatemono before any token/auth check,
//       and read the token from AsyncStorage via getTokenForSlug
//       (the same isolated map authStore v1.1 uses) instead of
//       the in-memory store state.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore, setActiveTatemono, useAuthStoreHydrated } from '../stores/authStore'
import { ToastProvider } from '../components/Toast'

export interface AuthLayoutProps {
  children:     React.ReactNode
  tatSlug:      string          // explicit slug — no more pathname guessing
  loginRoute:   string
  requireAuth?: boolean
  className?:   string
}

async function getTokenForSlug(slug: string): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem('arkzen-auth-tokens')
    const map: Record<string, string> = raw ? JSON.parse(raw) : {}
    return map[slug] ?? null
  } catch {
    return null
  }
}

export const NativeAuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  tatSlug,
  loginRoute,
  requireAuth = true,
  className = '',
}) => {
  const router              = useRouter()
  const hydrated            = useAuthStoreHydrated()
  const [checking, setChecking] = useState(requireAuth)
  const checked = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (checked.current) return
    checked.current = true

    // Set slug FIRST synchronously so every subsequent call
    // to getSlug() / getAuthBase() uses the correct tatemono.
    setActiveTatemono(tatSlug)

    if (!requireAuth) { setChecking(false); return }

    const check = async () => {
      // Read token from the isolated map — not the in-memory store
      // which is never persisted and is always null on cold mount.
      const token = await getTokenForSlug(tatSlug)

      if (!token) {
        router.replace(loginRoute as any)
        return
      }

      // Token exists — sync it into the store then verify with backend
      const { isAuthenticated, fetchMe } = useAuthStore.getState()

      if (!isAuthenticated) {
        await fetchMe()
      }

      if (!useAuthStore.getState().isAuthenticated) {
        router.replace(loginRoute as any)
        return
      }

      setChecking(false)
    }

    check()
  }, [hydrated])

  if (checking) {
    return (
      <ToastProvider position="top-right">
        <View className="flex-1 items-center justify-center bg-neutral-50">
          <ActivityIndicator size="small" color="#404040" />
        </View>
      </ToastProvider>
    )
  }

  return (
    <ToastProvider position="top-right">
      <View className={`flex-1 ${className}`}>
        {children}
      </View>
    </ToastProvider>
  )
}

export const AuthLayout = NativeAuthLayout
