// ARKZEN CUSTOM LAYOUT — layout-test/app-shell [Expo]

import React from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Platform, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export const AppShellLayout: React.FC<{ children: React.ReactNode; tatSlug?: string }> = ({ children }) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4ff' }}>
      {/* Shell header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(200,210,255,0.40)',
        }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: '#6366f1',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>A</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>AppShellLayout</Text>
          <View style={{
            marginLeft: 'auto',
            backgroundColor: 'rgba(99,102,241,0.10)',
            paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
          }}>
            <Text style={{ fontSize: 10, color: '#6366f1', fontWeight: '600' }}>outermost</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {children}
      </View>

      {/* Shell footer */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'rgba(255,255,255,0.70)' }}>
        <View style={{
          alignItems: 'center', paddingVertical: 8,
          borderTopWidth: 1, borderTopColor: 'rgba(200,210,255,0.30)',
        }}>
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>AppShellLayout footer</Text>
        </View>
      </SafeAreaView>
    </View>
  )
}
