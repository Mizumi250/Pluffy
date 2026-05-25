// ============================================================
// ARKZEN ENGINE — NATIVE GUEST LAYOUT v1.0
// NativeWind equivalent of web-core/layouts/GuestLayout.tsx
// Uses expo-router for navigation instead of useArkzenRouter.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useAuthStore, useAuthStoreHydrated } from '../stores/authStore'
import { ToastProvider } from '../components/Toast'

export interface GuestLayoutProps {
  children:        React.ReactNode
  redirectIfAuth?: boolean
  guestOnly?:      boolean
  redirectTo?:     string
  className?:      string
}

export const NativeGuestLayout: React.FC<GuestLayoutProps> = ({
  children,
  redirectIfAuth = false,
  guestOnly      = false,
  redirectTo,
  className = '',
}) => {
  const router              = useRouter()
  const pathname            = usePathname()
  const hydrated            = useAuthStoreHydrated()
  const { isAuthenticated } = useAuthStore()
  const shouldGuard         = redirectIfAuth || guestOnly
  const [checking, setChecking] = useState(shouldGuard)
  const [ready, setReady]       = useState(false)
  const checked                 = useRef(false)

  const getDashboard = () => {
    const segments = pathname.split('/').filter(Boolean)
    const tatemono = segments[0] ?? ''
    return redirectTo ?? (tatemono ? `/${tatemono}/dashboard` : '/dashboard')
  }

  useEffect(() => {
    if (!hydrated) return
    if (checked.current) return
    checked.current = true

    if (!shouldGuard) { setChecking(false); setReady(true); return }

    const check = async () => {
      const { token, isAuthenticated, fetchMe } = useAuthStore.getState()

      if (isAuthenticated) {
        router.replace(getDashboard() as any)
        return
      }

      if (token) {
        await fetchMe()
        if (useAuthStore.getState().isAuthenticated) {
          router.replace(getDashboard() as any)
          return
        }
      }

      setChecking(false)
      setReady(true)
    }

    check()
  }, [hydrated])

  useEffect(() => {
    if (!ready) return
    if (!shouldGuard) return
    if (!isAuthenticated) return
    router.replace(getDashboard() as any)
  }, [isAuthenticated, ready])

  const content = checking ? (
    <View className="flex-1 items-center justify-center bg-neutral-50">
      <ActivityIndicator size="small" color="#404040" />
    </View>
  ) : (
    <View className={`flex-1 ${className}`}>
      {children}
    </View>
  )

  return (
    <ToastProvider position="top-right">
      {content}
    </ToastProvider>
  )
}

export const GuestLayout = NativeGuestLayout
