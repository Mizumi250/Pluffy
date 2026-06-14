// ============================================================
// ARKZEN GENERATED SCREEN — layout-test/native-auth
// ============================================================

import React from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthLayout }  from '@/layouts/AuthLayout'
import { NativeLayerBadge } from './components/NativeLayerBadge'

// User screen (from @arkzen:native:page:native-auth)
const NativeAuthPage = () => (
  <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937' }}>Native Auth Guard</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20 }}>
      Guard only — no custom layout chain. Uses <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>+auth</Text>.
      Equivalent to old <Text style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>layout:auth</Text>.
    </Text>
    <NativeLayerBadge layers={['AuthLayout (guard)']} />
  </ScrollView>
)

// Engine wrapper
export function ArkzenScreen_LayoutTest_NativeAuth() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('layout-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AuthLayout tatSlug="layout-test" loginRoute="/layout-test/login">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <NativeAuthPage />
      </ScrollView>
      </AuthLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_LayoutTest_NativeAuth
