// ============================================================
// ARKZEN GENERATED SCREEN — layout-test/tab
// ============================================================

import React from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TabPanelLayout } from '../../../arkzen/core/layouts/custom/layout-test-tab-panel'
import { NativeLayerBadge } from './components/NativeLayerBadge'

// User screen (from @arkzen:native:page:tab)
const TabNativePage = () => (
  <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937' }}>Tab Page</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20 }}>
      Rendered inside <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>AppShellLayout → TabPanelLayout</Text>.
      {'\n'}TabPanelLayout declared <Text style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>parent: app-shell</Text> — chain resolved automatically.
    </Text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout']} />
  </ScrollView>
)

// Engine wrapper
export function ArkzenScreen_LayoutTest_Tab() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('layout-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <TabPanelLayout tatSlug="layout-test">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TabNativePage />
      </ScrollView>
      </TabPanelLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_LayoutTest_Tab
