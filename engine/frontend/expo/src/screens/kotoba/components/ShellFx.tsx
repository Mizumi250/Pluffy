// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ShellFx [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.743Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { toast } from './utils'
import { Screen } from './Screen'

// Realtime socket + toast host. Mounted once per screen through <Screen/>; the socket is shared and ref-counted so it
// connects once per session no matter how many screens are in the stack.
export const ShellFx = () => {
  const { user } = useAuthStore()
  const insets = useSafeAreaInsets()
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: string }[]>([])
  const uid = (user as any)?.id as number | undefined

  useEffect(() => {
    const g = globalThis as any
    const host = (message: string, kind: string) => {
      const id = Date.now() + Math.random()
      setToasts(t => [...t, { id, message, kind }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
    }
    g.__ktHosts = [...(g.__ktHosts ?? []), host]
    g.__ktToast = (message: string, kind: string) => { const hs = g.__ktHosts ?? []; hs[hs.length - 1]?.(message, kind) }
    return () => { g.__ktHosts = (g.__ktHosts ?? []).filter((h: any) => h !== host) }
  }, [])

  // Realtime: one Reverb socket per session, fanned out through a global bus
  useEffect(() => {
    if (!uid) return
    const g = globalThis as any
    const rtState = (g.__ktRt = g.__ktRt ?? { uid: 0, users: 0, close: null as null | (() => void) })
    rtState.users += 1
    if (rtState.uid === uid && rtState.close) return () => { rtState.users -= 1; if (rtState.users <= 0 && rtState.close) { rtState.close(); rtState.close = null; rtState.uid = 0 } }
    rtState.close?.()
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
    rtState.uid = uid
    rtState.close = () => { closed = true; clearTimeout(timer); try { ws?.close() } catch { /* ignore */ } }
    return () => { rtState.users -= 1; if (rtState.users <= 0 && rtState.close) { rtState.close(); rtState.close = null; rtState.uid = 0 } }
  }, [uid])


  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, gap: 8 }}>
      {toasts.map(t => <View key={t.id} style={{ backgroundColor: t.kind === 'err' ? '#9b3b34' : '#121212', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 20 }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#f5f1e9' }}>{t.message}</Text></View>)}
    </View>
  )
}
