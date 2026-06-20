// ============================================================
// ARKZEN GENERATED SCREEN — layout-test/native-chain-auth
// ============================================================

import React from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TabPanelLayout } from '../../../arkzen/core/layouts/custom/layout-test-tab-panel'
import { AuthLayout }  from '@/layouts/AuthLayout'
import { NativeLayerBadge } from './components/NativeLayerBadge'

// User screen (from @arkzen:native:page:native-chain-auth)
const NativeChainAuthPage = () => (
  <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937' }}>Native Chain + Auth</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20 }}>
      Auth guard wrapped in full native chain:{'\n'}
      <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>AppShellLayout → TabPanelLayout → AuthLayout</Text>.
      {'\n'}Declared as <Text style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>+auth:tab-panel</Text>.
    </Text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout', 'AuthLayout (guard)']} />
  </ScrollView>
)

// Engine wrapper
export function ArkzenScreen_LayoutTest_NativeChainAuth() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('layout-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <TabPanelLayout tatSlug="layout-test">
      <AuthLayout tatSlug="layout-test" loginRoute="/layout-test/login">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <NativeChainAuthPage />
      </ScrollView>
      </AuthLayout>
      </TabPanelLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_LayoutTest_NativeChainAuth
