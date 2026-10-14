// ============================================================
// ARKZEN — AuthLayout (Expo) v2.2
// src/layouts/AuthLayout.tsx
//
// v2.2: Fixed redirect race condition with fetchMe().
//       Uses async restore session that waits for token restoration
//       before deciding to redirect. Also ensures tatemono slug is
//       set in the global store before mounting.
// ============================================================

import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAuthStore, setActiveTatemono } from '../stores/authStore'

interface AuthLayoutProps {
  children:   React.ReactNode
  tatSlug:    string
  loginRoute: string
}

export function AuthLayout({ children, tatSlug, loginRoute }: AuthLayoutProps) {
  const navigation      = useNavigation<NativeStackNavigationProp<ParamListBase>>()
  const isLoading       = useAuthStore(s => s.isLoading)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)
  const logout          = useAuthStore(s => s.logout)
  const fetchMe         = useAuthStore(s => s.fetchMe)

  // Ensure the global tatemono slug is set before any store operations
  // Must run before the restore effect
  useEffect(() => {
    setActiveTatemono(tatSlug)
  }, [tatSlug])

  // Restore session + redirect – async, no race condition
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
      if (!finalLoading && !finalAuth) {
        navigation.replace(loginRoute)
      }

      isRedirectingRef.current = false
    }

    restoreAndRedirect()
    return () => { active = false }
  }, [tatSlug, loginRoute, fetchMe, navigation]) // re-run if slug or loginRoute changes

  // Show loader while restoring or redirecting
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="small" color="#a3a3a3" />
      </SafeAreaView>
    )
  }

  // If not authenticated and not loading, redirect already triggered
  // (but prevent flash of content)
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="small" color="#a3a3a3" />
      </SafeAreaView>
    )
  }

  // Fully authenticated – render content
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