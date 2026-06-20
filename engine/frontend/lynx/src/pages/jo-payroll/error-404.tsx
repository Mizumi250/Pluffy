// ARKZEN GENERATED — jo-payroll error 404 (Lynx)
// DO NOT EDIT DIRECTLY.
import { View, Text, TouchableOpacity } from '@lynx-js/react'
import { useState } from '@lynx-js/react'

const NotFoundScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <View style={{ flex: 1, backgroundColor: '#F4F5F7', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
    <Text style={{ fontSize: 96, fontWeight: '900', color: '#e5e7eb', letterSpacing: -4 }}>404</Text>
    <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginTop: -8, marginBottom: 8 }}>Page not found</Text>
    <Text style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 24 }}>
      The page you're looking for doesn't exist in this module.
    </Text>
    <TouchableOpacity
      onPress={() => onNavigate('index')}
      style={{ backgroundColor: '#171717', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
    >
      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>Back to Dashboard</Text>
    </TouchableOpacity>
  </View>
)
