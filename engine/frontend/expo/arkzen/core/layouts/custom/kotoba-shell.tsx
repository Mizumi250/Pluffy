// ARKZEN CUSTOM LAYOUT — kotoba/shell [Expo]

import React, { useEffect, useState } from 'react'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

/* @arkzen:resolved:import expo */
const useTabNav = () => {
  const r = useRouter()
  const p = usePathname() ?? ''
  return { go: (k: string) => r.push(`/kotoba/${k}` as any), active: p.split('/').filter(Boolean).pop() ?? '' }
}



const TABS = [
  { key: 'dashboard', label: 'Home', icon: '🏠' }, { key: 'feed', label: 'Feed', icon: '📰' }, { key: 'learn', label: 'Learn', icon: '🎓' },
  { key: 'review', label: 'Review', icon: '🧠' }, { key: 'chat', label: 'Chat', icon: '💬' }, { key: 'profile', label: 'Me', icon: '👤' },
]

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore()
  const nav = useTabNav()
  const insets = useSafeAreaInsets()
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: string }[]>([])
  const uid = (user as any)?.id as number | undefined

  useEffect(() => {
    const g = globalThis as any
    g.__ktToast = (message: string, kind: string) => {
      const id = Date.now() + Math.random()
      setToasts(t => [...t, { id, message, kind }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
    }
    return () => { g.__ktToast = undefined }
  }, [])

  // Realtime: one Reverb socket per session, fanned out through a global bus
  useEffect(() => {
    if (!uid) return
    let closed = false
    let retry = 0
    let timer: any
    let ws: WebSocket | null = null
    let host = 'localhost'
    let port = '8080'
    let key = 'arkzen-key'
    let secure = false
    try {
      host = process.env.EXPO_PUBLIC_REVERB_HOST ?? host
      port = process.env.EXPO_PUBLIC_REVERB_PORT ?? port
      key = process.env.EXPO_PUBLIC_REVERB_APP_KEY ?? key
      secure = (process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'ws') === 'wss'
    } catch { /* defaults */ }
    const emit = (event: string, data: any) => { const g = globalThis as any; g.__ktBus?.forEach((h: any) => h(event, data)) }
    const connect = () => {
      if (closed) return
      ws = new WebSocket(`${secure ? 'wss' : 'ws'}://${host}:${port}/app/${key}?protocol=7&client=js&version=8.4.0`)
      ws.onmessage = async (ev: any) => {
        let msg: any
        try { msg = JSON.parse(ev.data) } catch { return }
        if (msg.event === 'pusher:connection_established') {
          retry = 0
          const socketId = JSON.parse(msg.data).socket_id
          const channel = `private-kotoba.${uid}`
          try {
            const res = await arkzenFetch('/api/kotoba/auth/broadcasting/auth', { method: 'POST', body: JSON.stringify({ socket_id: socketId, channel_name: channel }) })
            if (!res.ok) return
            const auth = await res.json()
            ws?.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel, auth: auth.auth } }))
          } catch { /* retry on reconnect */ }
        } else if (msg.event === 'pusher:ping') {
          ws?.send(JSON.stringify({ event: 'pusher:pong', data: {} }))
        } else if (typeof msg.event === 'string' && msg.event.startsWith('kotoba.')) {
          let data: any = msg.data
          try { data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data } catch { /* raw */ }
          emit(msg.event, data)
          if (msg.event === 'kotoba.alert-created') { const a = data?.data ?? data; (globalThis as any).__ktToast?.(a?.text ?? 'New notification', 'ok') }
        }
      }
      ws.onclose = () => { if (closed) return; retry = Math.min(retry + 1, 6); timer = setTimeout(connect, 1000 * 2 ** retry) }
      ws.onerror = () => { try { ws?.close() } catch { /* ignore */ } }
    }
    connect()
    return () => { closed = true; clearTimeout(timer); try { ws?.close() } catch { /* ignore */ } }
  }, [uid])

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f7' }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>{children}</SafeAreaView>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.96)', borderTopWidth: 1, borderTopColor: 'rgba(60,60,67,0.16)', paddingTop: 6, paddingBottom: Math.max(insets.bottom, 8) }}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: nav.active === t.key }} onPress={() => nav.go(t.key)} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 }}>
            <Text style={{ fontSize: 22, opacity: nav.active === t.key ? 1 : 0.55 }}>{t.icon}</Text>
            <Text style={{ fontSize: 10, fontWeight: '600', color: nav.active === t.key ? '#0a84ff' : '#8e8e93' }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, gap: 8 }}>
        {toasts.map(t => <View key={t.id} style={{ backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}><Text style={{ fontSize: 14, fontWeight: '600', color: t.kind === 'err' ? '#ff453a' : '#1c1c1e' }}>{t.message}</Text></View>)}
      </View>
    </View>
  )
}
