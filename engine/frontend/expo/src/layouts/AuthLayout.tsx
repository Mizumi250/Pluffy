// ============================================================
// ARKZEN — AuthLayout (Expo) v1.0
// src/layouts/AuthLayout.tsx
//
// Wraps auth-protected screens.
// Checks token via useArkzenExpoAuth — redirects to login if not authed.
//
// Uses NativeWind className for styling (same Tailwind syntax as web).
// Uses expo-router for navigation.
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
import { useArkzenExpoAuth } from '@/hooks/useArkzenExpoAuth'

interface AuthLayoutProps {
  children:   React.ReactNode
  tatSlug:    string
  loginRoute: string  // e.g. '/barbershop-booking/login'
}

export function AuthLayout({ children, tatSlug, loginRoute }: AuthLayoutProps) {
  const router = useRouter()
  const { user, isLoading, isAuthed, logout } = useArkzenExpoAuth(tatSlug)

  useEffect(() => {
    if (!isLoading && !isAuthed) {
      router.replace(loginRoute as any)
    }
  }, [isLoading, isAuthed, loginRoute])

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="small" color="#a3a3a3" />
        <Text className="mt-3 text-xs text-neutral-400 tracking-wide">
          Checking auth...
        </Text>
      </SafeAreaView>
    )
  }

  // ── Not authed — render nothing while redirect fires ───────────────────────
  if (!isAuthed) return null

  // ── Authed ─────────────────────────────────────────────────────────────────
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
