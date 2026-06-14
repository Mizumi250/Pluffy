// ARKZEN CUSTOM LAYOUT — layout-test/card-modal [Expo]

import React from 'react'
import { ScrollView, Text, View } from 'react-native'

export const CardModalLayout: React.FC<{ children: React.ReactNode; tatSlug?: string }> = ({ children }) => {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(200,210,255,0.50)',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: 'rgba(139,92,246,0.10)',
          alignSelf: 'flex-start',
          paddingHorizontal: 10, paddingVertical: 4,
          borderRadius: 999, marginBottom: 16,
        }}>
          <Text style={{ fontSize: 10, color: '#7c3aed', fontWeight: '700' }}>
            CardModalLayout — parent: tab-panel
          </Text>
        </View>
        {children}
      </View>
    </ScrollView>
  )
}
