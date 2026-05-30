// ============================================================
// ARKZEN — GuestLayout (Expo) v2.0
// src/layouts/GuestLayout.tsx
//
// Uses useAuthStore (zustand + AsyncStorage) — same store the
// generated screens use. v1.0 used useArkzenExpoAuth (SecureStore)
// which was a separate store, causing the redirect loop after login.
// ============================================================

import React, { useEffect } from 'react'
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuthStore, useAuthStoreHydrated } from '../../arkzen/core/stores/authStore'

interface GuestLayoutProps {
  children:       React.ReactNode
  tatSlug:        string
  dashboardRoute: string
}

export function GuestLayout({ children, tatSlug, dashboardRoute }: GuestLayoutProps) {
  const router          = useRouter()
  const hydrated        = useAuthStoreHydrated()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  useEffect(() => {
    if (!hydrated) return
    if (isAuthenticated) {
      router.replace(dashboardRoute as any)
    }
  }, [hydrated, isAuthenticated, dashboardRoute])

  // Wait for AsyncStorage to rehydrate before making auth decisions
  if (!hydrated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="small" color="#a3a3a3" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-6 py-12">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default GuestLayout
