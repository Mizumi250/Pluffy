// ============================================================
// ARKZEN — GuestLayout (Expo) v2.2
// src/layouts/GuestLayout.tsx
//
// v2.2: Added setActiveTatemono before fetchMe.
//       Uses single async restore effect that waits for token
//       restoration before deciding to redirect to dashboard.
//       Prevents race conditions and ensures per‑tatemono isolation.
// ============================================================

import React, { useEffect, useRef } from 'react'
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { 
  useAuthStore, 
  setActiveTatemono 
} from '../../arkzen/core/stores/authStore'

interface GuestLayoutProps {
  children:       React.ReactNode
  tatSlug:        string
  dashboardRoute: string
}

export function GuestLayout({ children, tatSlug, dashboardRoute }: GuestLayoutProps) {
  const router          = useRouter()
  const isLoading       = useAuthStore(s => s.isLoading)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const fetchMe         = useAuthStore(s => s.fetchMe)

  // Ensure the global tatemono slug is set before any store operations
  useEffect(() => {
    setActiveTatemono(tatSlug)
  }, [tatSlug])

  // Restore session + redirect – no race condition
  const isRedirectingRef = useRef(false)

  useEffect(() => {
    let active = true
    const restoreAndRedirect = async () => {
      if (isRedirectingRef.current) return
      isRedirectingRef.current = true

      // 1. Restore user/token from the isolated map into the store
      await fetchMe()

      if (!active) return

      // 2. After fetchMe completes, check final auth state
      const { isAuthenticated: finalAuth, isLoading: finalLoading } = useAuthStore.getState()
      if (!finalLoading && finalAuth) {
        router.replace(dashboardRoute as any)
      }

      isRedirectingRef.current = false
    }

    restoreAndRedirect()
    return () => { active = false }
  }, [tatSlug, dashboardRoute])

  // Show loader while restoring or redirecting
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="small" color="#a3a3a3" />
      </SafeAreaView>
    )
  }

  // If authenticated and not loading, redirect already triggered
  // (but prevent flash of content – keep loader)
  if (isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="small" color="#a3a3a3" />
      </SafeAreaView>
    )
  }

  // Not authenticated – render guest content (login/register forms)
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