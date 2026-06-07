// ============================================================
// ARKZEN ENGINE — NATIVE GUEST LAYOUT v1.1
//
// v1.1: Fixed cross-tatemono auth bleed — same root cause as
//       AuthLayout v1.0.
//       v1.0 read token from useAuthStore.getState().token
//       (always null, never persisted) and isAuthenticated from
//       the shared persisted store — which belonged to whichever
//       tatemono last wrote it. fetchMe() then fired with a stale
//       __ARKZEN_TATEMONO__ slug, hitting the wrong /auth/me
//       endpoint, getting 401, clearing the store, and leaving
//       the guest screen in a broken state that triggered a
//       spurious login call on the wrong tatemono.
//
//       Fix: accept tatSlug + dashboardRoute as explicit props,
//       call setActiveTatemono(tatSlug) first, read token from
//       the isolated AsyncStorage map, never from store state.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore, setActiveTatemono, useAuthStoreHydrated } from '../stores/authStore'
import { ToastProvider } from '../components/Toast'

export interface GuestLayoutProps {
  children:        React.ReactNode
  tatSlug:         string
  dashboardRoute:  string
  redirectIfAuth?: boolean
  guestOnly?:      boolean
  className?:      string
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

export const NativeGuestLayout: React.FC<GuestLayoutProps> = ({
  children,
  tatSlug,
  dashboardRoute,
  redirectIfAuth = false,
  guestOnly      = false,
  className = '',
}) => {
  const router              = useRouter()
  const hydrated            = useAuthStoreHydrated()
  const shouldGuard         = redirectIfAuth || guestOnly
  const [checking, setChecking] = useState(shouldGuard)
  const checked                 = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (checked.current) return
    checked.current = true

    // Set slug FIRST so fetchMe() hits the correct /auth/me endpoint
    setActiveTatemono(tatSlug)

    if (!shouldGuard) { setChecking(false); return }

    const check = async () => {
      const token = await getTokenForSlug(tatSlug)

      if (!token) {
        setChecking(false)
        return
      }

      const { isAuthenticated, fetchMe } = useAuthStore.getState()

      if (isAuthenticated) {
        router.replace(dashboardRoute as any)
        return
      }

      await fetchMe()

      if (useAuthStore.getState().isAuthenticated) {
        router.replace(dashboardRoute as any)
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

export const GuestLayout = NativeGuestLayout
