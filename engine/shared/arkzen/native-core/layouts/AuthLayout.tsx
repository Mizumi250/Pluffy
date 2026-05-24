// ============================================================
// ARKZEN ENGINE — NATIVE AUTH LAYOUT v1.0
// NativeWind equivalent of web-core/layouts/AuthLayout.tsx
// Uses expo-router for navigation instead of useArkzenRouter.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useAuthStore, setActiveTatemono, useAuthStoreHydrated } from '../stores/authStore'
import { ToastProvider } from '../components/Toast'

export interface AuthLayoutProps {
  children:     React.ReactNode
  requireAuth?: boolean
  redirectTo?:  string
  className?:   string
}

export const NativeAuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  className = '',
}) => {
  const router              = useRouter()
  const pathname            = usePathname()
  const hydrated            = useAuthStoreHydrated()
  const [checking, setChecking] = useState(requireAuth)
  const checked = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (checked.current) return
    checked.current = true

    const segments = pathname.split('/').filter(Boolean)
    const tatemono = segments[0] ?? ''
    if (tatemono) setActiveTatemono(tatemono)

    if (!requireAuth) { setChecking(false); return }

    const check = async () => {
      const { token, isAuthenticated, fetchMe } = useAuthStore.getState()

      if (!token) {
        const loginPage = redirectTo ?? (tatemono ? `/${tatemono}/login` : '/login')
        router.replace(loginPage as any)
        return
      }

      if (!isAuthenticated) {
        await fetchMe()
      }

      if (!useAuthStore.getState().isAuthenticated) {
        const loginPage = redirectTo ?? (tatemono ? `/${tatemono}/login` : '/login')
        router.replace(loginPage as any)
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
