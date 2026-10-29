// ARKZEN CUSTOM LAYOUT — kotoba/shell [Expo]

import React from 'react'
import { usePathname, useRouter } from 'expo-router'
import { GraduationCap, Home, Layers, MessageCircle, Newspaper, User } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

/* @arkzen:resolved:import expo */
const useTabNav = () => {
  const r = useRouter()
  const p = usePathname() ?? ''
  return { go: (k: string) => r.push(`/kotoba/${k}` as any), active: p.split('/').filter(Boolean).pop() ?? '' }
}



const TABS = [
  { key: 'dashboard', label: 'Home', icon: Home }, { key: 'feed', label: 'Feed', icon: Newspaper }, { key: 'learn', label: 'Learn', icon: GraduationCap },
  { key: 'review', label: 'Review', icon: Layers }, { key: 'chat', label: 'Chat', icon: MessageCircle }, { key: 'profile', label: 'Me', icon: User },
]

// The shell is only chrome (tab bar). Realtime and toasts live in the shared <ShellFx/> component, mounted by <Screen>,
// because layouts cannot use the '@/arkzen' import alias (their generated file sits in a different folder).
export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const nav = useTabNav()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: '#e9e4da' }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>{children}</SafeAreaView>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', marginHorizontal: 14, marginBottom: Math.max(insets.bottom, 10), padding: 6, backgroundColor: '#f5f1e9', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(18,18,18,0.12)' }}>
        {TABS.map(t => {
          const on = nav.active === t.key
          const Icon = t.icon
          return (
            <TouchableOpacity key={t.key} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} onPress={() => nav.go(t.key)} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 7, borderRadius: 999, backgroundColor: on ? '#121212' : 'transparent' }}>
              <Icon size={20} color={on ? '#f5f1e9' : '#6b655b'} strokeWidth={1.8} />
              <Text style={{ fontSize: 10, fontWeight: '600', color: on ? '#f5f1e9' : '#6b655b' }}>{t.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
