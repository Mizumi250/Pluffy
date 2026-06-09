// ============================================================
// ARKZEN ENGINE — NATIVE AUTH LAYOUT v1.2
//
// v1.2: Always call fetchMe when user is null, even if
//       isAuthenticated is true. setActiveTatemono syncs
//       the token and sets isAuthenticated:true but leaves
//       user:null — so the dashboard gets user?.id = undefined
//       and connectReverb never fires.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore, setActiveTatemono, useAuthStoreHydrated } from '../stores/authStore'
import { ToastProvider } from '../components/Toast'

export interface AuthLayoutProps {
  children:     React.ReactNode
  tatSlug:      string
  loginRoute:   string
  requireAuth?: boolean
  className?:   string
}

export const NativeAuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  tatSlug,
  loginRoute,
  requireAuth = true,
  className = '',
}) => {
  const router   = useRouter()
  const hydrated = useAuthStoreHydrated()
  const [checking, setChecking] = useState(requireAuth)
  const checked = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (checked.current) return
    checked.current = true

    setActiveTatemono(tatSlug)

    if (!requireAuth) { setChecking(false); return }

    const check = async () => {
      // Wait for setActiveTatemono async token sync to settle
      await new Promise(r => setTimeout(r, 80))

      const { isAuthenticated, user, fetchMe } = useAuthStore.getState()

      if (!isAuthenticated) {
        router.replace(loginRoute as any)
        return
      }

      // Token synced but user not fetched yet — always fetchMe when user is null
      if (!user) {
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
