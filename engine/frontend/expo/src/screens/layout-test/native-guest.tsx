// ============================================================
// ARKZEN GENERATED SCREEN — layout-test/native-guest
// ============================================================

import React from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GuestLayout } from '@/layouts/GuestLayout'
import { NativeLayerBadge } from './components/NativeLayerBadge'

// User screen (from @arkzen:native:page:native-guest)
const NativeGuestPage = () => (
  <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937' }}>Native Guest Guard</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20 }}>
      Guest guard only. Uses <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>+guest</Text>.
      Redirects to dashboard if already authenticated.
    </Text>
    <NativeLayerBadge layers={['GuestLayout (guard)']} />
  </ScrollView>
)

// Engine wrapper
export function ArkzenScreen_LayoutTest_NativeGuest() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('layout-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="layout-test" dashboardRoute="/layout-test/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <NativeGuestPage />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_LayoutTest_NativeGuest
