// ============================================================
// ARKZEN GENERATED SCREEN — auth-test/dashboard
// ============================================================

import React from 'react'
import { setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthLayout }  from '@/layouts/AuthLayout'
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const router          = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.replace('/auth-test/login' as any)
  }

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">✅ Auth Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-xs text-neutral-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success card */}
        <View className="mx-4 mt-6 bg-white rounded-2xl border border-neutral-100 p-8 items-center">
          <Text className="text-4xl mb-3">🛡️</Text>
          <Text className="text-base font-semibold text-neutral-900 mb-1">
            Authentication successful
          </Text>
          <Text className="text-xs text-neutral-500 text-center leading-5">
            This screen is protected by the auth layout.{'\n'}
            Only signed-in users can see it.
          </Text>
        </View>

        {/* User info */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5">
          <Text className="text-sm font-semibold text-neutral-900 mb-3">User info</Text>
          <View className="bg-neutral-50 rounded-xl p-4">
            <Text className="text-xs font-mono text-neutral-500 leading-5">
              {JSON.stringify(user, null, 2)}
            </Text>
          </View>
        </View>

        {/* Footer note */}
        <View className="mx-4 mt-4 mb-8 bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            token: Sanctum Bearer{'\n'}
            scope: auth-test SQLite{'\n'}
            shared: web ↔ native same token
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_AuthTest_Dashboard() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('auth-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AuthLayout tatSlug="auth-test" loginRoute="/auth-test/login">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DashboardScreen />
      </ScrollView>
      </AuthLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_AuthTest_Dashboard
