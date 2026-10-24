// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — NativeLayerBadge [Expo]
// Source: @arkzen:native:components (layout-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:33.866Z
// ============================================================

import React from 'react'
import { usePathname, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NATIVE_COLORS } from './constants'

export const NativeLayerBadge: React.FC<{ layers: string[] }> = ({ layers }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
    {layers.map((layer, i) => (
      <View
        key={layer}
        style={{
          backgroundColor: NATIVE_COLORS[i % NATIVE_COLORS.length],
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
          {i + 1}. {layer}
        </Text>
      </View>
    ))}
  </View>
)
