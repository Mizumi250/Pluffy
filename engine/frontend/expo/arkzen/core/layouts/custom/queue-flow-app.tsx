// ARKZEN CUSTOM LAYOUT — queue-flow/app [Expo]

import React, { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { LayoutGrid, Settings, Ticket, WifiOff } from 'lucide-react-native'
import { AppState, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const NAV = [
  { href: '/queue-flow',       icon: LayoutGrid, label: 'Display' },
  { href: '/queue-flow/join',  icon: Ticket,     label: 'Join'    },
  { href: '/queue-flow/admin', icon: Settings,   label: 'Admin'   },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useRouter()
  const pathname = usePathname()
  const [online, setOnline] = useState(true)

  const checkOnline = useCallback(async () => {
    try {
      const res = await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD', cache: 'no-cache',
      })
      setOnline(res.status === 204)
    } catch {
      setOnline(false)
    }
  }, [])

  useEffect(() => {
    checkOnline()
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') checkOnline()
    })
    return () => sub.remove()
  }, [checkOnline])

  return (
    <View
      style={{
        flex: 1,
        // @ts-ignore — experimental_backgroundImage supported in Expo SDK 50+
        experimental_backgroundImage: 'linear-gradient(165deg, #e8f2ff 0%, #d0e5ff 18%, #b8d4f8 36%, #a4c5f5 52%, #b0cef7 68%, #c4daff 84%, #daeeff 100%)',
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* Offline banner — mirrors web WifiOff banner */}
        {!online && (
          <View style={{
            backgroundColor: 'rgba(251,191,36,0.12)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(251,191,36,0.25)',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 8,
          }}>
            <WifiOff size={13} color="#d97706" />
            <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '500' }}>
              Offline — data may be outdated
            </Text>
          </View>
        )}

        {/* Screen content */}
        <View style={{ flex: 1 }}>
          {children}
        </View>

        {/* Bottom nav — frosted glass mirroring web */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.60)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.85)',
          shadowColor: 'rgba(80,130,210,0.10)',
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 24,
          shadowOpacity: 1,
          elevation: 12,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            height: 64,
            paddingHorizontal: 16,
          }}>
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href

              return (
                <TouchableOpacity
                  key={href}
                  onPress={() => router.push(href as any)}
                  activeOpacity={0.8}
                  style={{ flex: 1, alignItems: 'center', gap: 4 }}
                >
                  <View style={{
                    width: 38, height: 38, borderRadius: 14,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: active ? 'rgba(80,130,230,0.15)' : 'transparent',
                  }}>
                    <Icon size={20} color={active ? '#3a6fd8' : '#8aabcf'} />
                  </View>
                  <Text style={{
                    fontSize: 10, fontWeight: '600',
                    color: active ? '#3a6fd8' : '#8aabcf',
                    letterSpacing: 0.02 * 10,
                  }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

      </SafeAreaView>
    </View>
  )
}
