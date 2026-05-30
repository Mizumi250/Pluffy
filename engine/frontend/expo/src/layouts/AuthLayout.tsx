// ============================================================
// ARKZEN — AuthLayout (Expo) v2.0
// src/layouts/AuthLayout.tsx
//
// Uses useAuthStore (zustand + AsyncStorage) — same store the
// generated screens use. v1.0 used useArkzenExpoAuth (SecureStore)
// which was a separate store, causing auth checks to always fail
// after login via the generated screens.
// ============================================================

import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuthStore, useAuthStoreHydrated } from '../../arkzen/core/stores/authStore'

interface AuthLayoutProps {
  children:   React.ReactNode
  tatSlug:    string
  loginRoute: string
}

export function AuthLayout({ children, tatSlug, loginRoute }: AuthLayoutProps) {
  const router          = useRouter()
  const hydrated        = useAuthStoreHydrated()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)
  const logout          = useAuthStore(s => s.logout)

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      router.replace(loginRoute as any)
    }
  }, [hydrated, isAuthenticated, loginRoute])

  if (!hydrated || !isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="small" color="#a3a3a3" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">

      {/* Top bar */}
      <View className="h-14 flex-row items-center justify-between px-5 bg-white/90 border-b border-black/5">
        <Text className="text-sm font-semibold text-neutral-900 tracking-tight">
          Arkzen
        </Text>
        <View className="flex-row items-center gap-3">
          {user && (
            <Text className="text-xs text-neutral-400 max-w-36" numberOfLines={1}>
              {user.email}
            </Text>
          )}
          <TouchableOpacity
            onPress={logout}
            className="px-3 py-1.5 rounded-md border border-neutral-200 bg-white active:opacity-70"
          >
            <Text className="text-xs text-neutral-600">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen content */}
      <View className="flex-1">
        {children}
      </View>

    </SafeAreaView>
  )
}

export default AuthLayout
