// ============================================================
// ARKZEN EXPO ROUTE — layout-test/+not-found
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React from 'react'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

const NativeNotFoundScreen = () => {
  const router = useRouter()
  return (
    <View style={{ flex: 1, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 96, fontWeight: '900', color: '#c7d2fe', lineHeight: 100 }}>404</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#1f2937', marginTop: -8, marginBottom: 8 }}>Page not found</Text>
      <Text style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>This route doesn't exist in the layout-test module.</Text>
      <TouchableOpacity
        onPress={() => router.replace('/layout-test')}
        style={{ backgroundColor: '#6366f1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Back to Layout Test</Text>
      </TouchableOpacity>
    </View>
  )
}

export default NativeNotFoundScreen
