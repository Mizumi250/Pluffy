// ============================================================
// ARKZEN GENERATED SCREEN — layout-test/index
// ============================================================

import React from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppShellLayout } from '../../../arkzen/core/layouts/custom/layout-test-app-shell'
import { NativeLayerBadge } from './components/NativeLayerBadge'

// User screen (from @arkzen:native:page:index)
const NATIVE_PAGES = [
  { href: '/layout-test',                  label: 'index',        combo: 'app-shell only',                        tag: 'app-shell' },
  { href: '/layout-test/tab',              label: 'tab',          combo: 'app-shell → tab-panel',                 tag: 'tab-panel' },
  { href: '/layout-test/native-deep',      label: 'native-deep',  combo: 'app-shell → tab-panel → card-modal',   tag: 'card-modal' },
  { href: '/layout-test/native-auth',      label: 'native-auth',  combo: 'auth guard only',                      tag: '+auth' },
  { href: '/layout-test/native-chain-auth',label: 'native-chain', combo: 'app-shell → tab-panel → auth guard',   tag: '+auth:tab-panel' },
  { href: '/layout-test/native-guest',     label: 'native-guest', combo: 'guest guard only',                     tag: '+guest' },
]

const IndexNativePage = () => {
  const router = useRouter()

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 8 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <Text style={{ fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 4 }}>
        Layout Test
      </Text>
      <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        v11.0 native — tap each to test the layout combo.
      </Text>

      {NATIVE_PAGES.map(({ href, label, combo, tag }) => (
        <TouchableOpacity
          key={href}
          onPress={() => router.push(href as any)}
          activeOpacity={0.85}
          style={{
            backgroundColor: 'rgba(255,255,255,0.75)',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: 'rgba(200,210,255,0.40)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 6,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>{label}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{combo}</Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(99,102,241,0.08)',
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
          }}>
            <Text style={{ fontSize: 10, color: '#6366f1', fontFamily: 'monospace', fontWeight: '600' }}>
              {tag}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_LayoutTest_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('layout-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AppShellLayout tatSlug="layout-test">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexNativePage />
      </ScrollView>
      </AppShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_LayoutTest_Index
