// ARKZEN CUSTOM LAYOUT — layout-test/tab-panel [Expo]

import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

export const TabPanelLayout: React.FC<{ children: React.ReactNode; tatSlug?: string }> = ({ children }) => {
  const tabs = ['Overview', 'Settings', 'Reports']

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {/* Side tabs */}
      <View style={{
        width: 120,
        backgroundColor: 'rgba(255,255,255,0.60)',
        borderRightWidth: 1,
        borderRightColor: 'rgba(200,210,255,0.35)',
        paddingTop: 12,
        gap: 4,
        paddingHorizontal: 8,
      }}>
        <Text style={{
          fontSize: 9, fontWeight: '800', color: '#9ca3af',
          textTransform: 'uppercase', letterSpacing: 1.2,
          paddingHorizontal: 8, marginBottom: 4,
        }}>
          TabPanel
        </Text>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={{
              paddingHorizontal: 10, paddingVertical: 8,
              borderRadius: 8, backgroundColor: 'transparent',
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12, color: '#6b7280' }}>{tab}</Text>
          </TouchableOpacity>
        ))}
        <View style={{
          marginTop: 'auto',
          backgroundColor: 'rgba(99,102,241,0.08)',
          borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
          alignItems: 'center', marginBottom: 12,
        }}>
          <Text style={{ fontSize: 9, color: '#8b5cf6', fontWeight: '600' }}>parent: app-shell</Text>
        </View>
      </View>

      {/* Panel content */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  )
}
