// ARKZEN CUSTOM LAYOUT — dtr-geofencing/app [Expo]

import React, { useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { CalendarClock, Settings } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const NAV = [
  { href: '/dtr-geofencing',       label: 'Clock In/Out', icon: CalendarClock },
  { href: '/dtr-geofencing/admin', label: 'Admin',        icon: Settings },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useRouter()
  const pathname = usePathname()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Top bar */}
      <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#ffffff0d' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarClock size={14} color="#ffffff70" />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffffe6', letterSpacing: -0.2 }}>DTR · Geofence</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <TouchableOpacity
                key={href}
                onPress={() => router.push(href as any)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: active ? '#ffffff14' : 'transparent' }}
              >
                <Icon size={13} color={active ? '#ffffff' : '#ffffff40'} />
                <Text style={{ fontSize: 12, fontWeight: '500', color: active ? '#ffffff' : '#ffffff40' }}>{label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  )
}
