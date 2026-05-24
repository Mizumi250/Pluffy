// ============================================================
// ARKZEN — GuestLayout (Expo) v1.0
// src/layouts/GuestLayout.tsx
//
// For login / register screens.
// Redirects to dashboard if user is already authenticated.
//
// Uses NativeWind className for styling.
// Uses expo-router for navigation.
// Handles keyboard avoiding for form inputs.
// ============================================================

import React, { useEffect } from 'react'
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useArkzenExpoAuth } from '@/hooks/useArkzenExpoAuth'

interface GuestLayoutProps {
  children:       React.ReactNode
  tatSlug:        string
  dashboardRoute: string  // e.g. '/barbershop-booking/dashboard'
}

export function GuestLayout({ children, tatSlug, dashboardRoute }: GuestLayoutProps) {
  const router   = useRouter()
  const { isAuthed, isLoading } = useArkzenExpoAuth(tatSlug)

  // If already logged in, redirect away from guest screens
  useEffect(() => {
    if (!isLoading && isAuthed) {
      router.replace(dashboardRoute as any)
    }
  }, [isLoading, isAuthed, dashboardRoute])

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
