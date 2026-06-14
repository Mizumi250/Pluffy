// ============================================================
// ARKZEN GENERATED SCREEN — layout-test/native-deep
// ============================================================

import React from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CardModalLayout } from '../../../arkzen/core/layouts/custom/layout-test-card-modal'
import { NativeLayerBadge } from './components/NativeLayerBadge'

// User screen (from @arkzen:native:page:native-deep)
const NativeDeepPage = () => (
  <>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937', marginBottom: 8 }}>Deep Page</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 }}>
      Three native layouts deep:{'\n'}
      <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>AppShellLayout → TabPanelLayout → CardModalLayout</Text>.
      {'\n'}Only <Text style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>layout:card-modal</Text> declared.
    </Text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout', 'CardModalLayout']} />
  </>
)

// Engine wrapper
export function ArkzenScreen_LayoutTest_NativeDeep() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('layout-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <CardModalLayout tatSlug="layout-test">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <NativeDeepPage />
      </ScrollView>
      </CardModalLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_LayoutTest_NativeDeep
