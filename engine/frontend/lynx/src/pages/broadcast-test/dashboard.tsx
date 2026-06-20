// ARKZEN GENERATED — broadcast-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:32.208Z
import { ChannelCard } from './components/ChannelCard'
import { APP_KEY, BACKEND_URL, REVERB_HOST, REVERB_PORT, REVERB_SCHEME } from './components/constants'
import type { LynxMessage, WsStatus } from './components/types'
import { useCallback, useEffect, useRef, useState } from '@lynx-js/react'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'

const DashboardScreen = () => {
  const { user, logout } = useAuthStore()

  const [publicMsgs,   setPublicMsgs]   = useState<LynxMessage[]>([])
  const [privateMsgs,  setPrivateMsgs]  = useState<LynxMessage[]>([])
  const [presenceMsgs, setPresenceMsgs] = useState<LynxMessage[]>([])
  const [members,      setMembers]      = useState<{ id: number; name: string }[]>([])

  const [publicStatus,   setPublicStatus]   = useState<WsStatus>('connecting')
  const [privateStatus,  setPrivateStatus]  = useState<WsStatus>('connecting')
  const [presenceStatus, setPresenceStatus] = useState<WsStatus>('connecting')

  const [publicCount,   setPublicCount]   = useState(0)
  const [privateCount,  setPrivateCount]  = useState(0)
  const [presenceCount, setPresenceCount] = useState(0)

  const wsRef      = useRef<any>(null)
  const mountedRef = useRef(true)

  const addMsg = (setter: any, msg: LynxMessage) =>
    setter((prev: LynxMessage[]) => [msg, ...prev].slice(0, 50))

  const send = useCallback(async (channelType: string, content: string) => {
    if (!content.trim()) return
    try {
      await arkzenFetch(`${BACKEND_URL}/api/broadcast-test/messages`, {
        method: 'POST',
        body:   JSON.stringify({ content, channel_type: channelType }),
      })
    } catch (e) { console.error(e) }
  }, [])

  const connectReverb = useCallback(async (userId: number) => {
    if (wsRef.current?.readyState === 1) return

    setPublicStatus('connecting')
    setPrivateStatus('connecting')
    setPresenceStatus('connecting')

    const ws = new WebSocket(`${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}/app/${APP_KEY}`)
    wsRef.current = ws

    ws.onmessage = async (event: any) => {
      if (!mountedRef.current) return
      let msg: { event: string; data: unknown; channel?: string }
      try { msg = JSON.parse(event.data) } catch { return }

      if (msg.event === 'pusher:connection_established') {
        const connData = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const socketId = (connData as any).socket_id as string

        setPublicStatus('connected')
        ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: 'broadcast-test-public' } }))

        try {
          const res = await arkzenFetch(`${BACKEND_URL}/api/broadcast-test/auth/broadcasting/auth`, {
            method: 'POST',
            body:   JSON.stringify({ socket_id: socketId, channel_name: `private-broadcast-test.${userId}` }),
          })
          if (res.ok) {
            const { auth } = await res.json()
            ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `private-broadcast-test.${userId}`, auth } }))
            setPrivateStatus('connected')
          } else { setPrivateStatus('error') }
        } catch { setPrivateStatus('error') }

        try {
          const res = await arkzenFetch(`${BACKEND_URL}/api/broadcast-test/auth/broadcasting/auth`, {
            method: 'POST',
            body:   JSON.stringify({ socket_id: socketId, channel_name: 'presence-broadcast-test-presence' }),
          })
          if (res.ok) {
            const { auth, channel_data } = await res.json()
            ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: 'presence-broadcast-test-presence', auth, channel_data } }))
            setPresenceStatus('connected')
          } else { setPresenceStatus('error') }
        } catch { setPresenceStatus('error') }
      }

      if (msg.event === 'broadcast-test.message-sent-public' || msg.channel === 'broadcast-test-public') {
        const p = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPublicMsgs, p as LynxMessage); setPublicCount((c: number) => c + 1)
      }
      if (msg.event === 'broadcast-test.message-sent-private') {
        const p = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPrivateMsgs, p as LynxMessage); setPrivateCount((c: number) => c + 1)
      }
      if (msg.event === 'broadcast-test.message-sent-presence') {
        const p = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        addMsg(setPresenceMsgs, p as LynxMessage); setPresenceCount((c: number) => c + 1)
      }
      if (msg.event === 'pusher_internal:member_added') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        setMembers((prev: any[]) => [...prev.filter((m: any) => m.id !== (d as any).user_id), { id: (d as any).user_id, name: (d as any).user_info?.name ?? 'Unknown' }])
      }
      if (msg.event === 'pusher_internal:member_removed') {
        const d = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        setMembers((prev: any[]) => prev.filter((m: any) => m.id !== (d as any).user_id))
      }
      if (msg.event === 'pusher_internal:subscription_succeeded' && msg.channel === 'presence-broadcast-test-presence') {
        const d    = typeof msg.data === 'string' ? JSON.parse(msg.data as string) : msg.data
        const hash = (d as any).presence?.hash ?? {}
        setMembers(Object.entries(hash).map(([id, info]: [string, any]) => ({ id: Number(id), name: info?.name ?? 'Unknown' })))
      }
    }

    ws.onerror = () => { ws.close() }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setPublicStatus('error'); setPrivateStatus('error'); setPresenceStatus('error')
      setTimeout(() => { if (mountedRef.current) connectReverb(userId) }, 3000)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    if (user?.id) connectReverb(user.id)
    return () => {
      mountedRef.current = false
      wsRef.current?.close()
    }
  }, [user?.id])

  const handleLogout = async () => {
    wsRef.current?.close()
    await logout()
  }

  const sendPublic   = useCallback((val: string) => send('public',   val), [send])
  const sendPrivate  = useCallback((val: string) => send('private',  val), [send])
  const sendPresence = useCallback((val: string) => send('presence', val), [send])

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view>
          <text className="text-base font-semibold text-neutral-900">📡 Broadcast Test</text>
          <text className="text-xs text-neutral-400 mt-0.5">{user?.name}</text>
        </view>
        <view bindtap={handleLogout}>
          <text className="text-xs text-neutral-400">Sign out</text>
        </view>
      </view>

      <scroll-view className="flex-1 p-4 pb-8">

        <ChannelCard
          title="Public channel" badge="public" badgeColor="bg-blue-500"
          description="broadcast-test-public · No auth required."
          status={publicStatus} count={publicCount} msgs={publicMsgs} onSend={sendPublic}
        />

        <ChannelCard
          title="Private channel" badge="private" badgeColor="bg-purple-500"
          description={`private-broadcast-test.${user?.id} · HMAC-signed per user.`}
          status={privateStatus} count={privateCount} msgs={privateMsgs} onSend={sendPrivate}
        />

        <ChannelCard
          title="Presence channel" badge="presence" badgeColor="bg-green-500"
          description="presence-broadcast-test-presence · Auth + member roster."
          status={presenceStatus} count={presenceCount} msgs={presenceMsgs} onSend={sendPresence}
          footer={
            <view className="flex-row flex-wrap items-center gap-1.5">
              <text className="text-xs text-neutral-400">Online:</text>
              {members.length === 0
                ? <text className="text-xs text-neutral-300">No members yet</text>
                : members.map(m => (
                    <view key={m.id} className="bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                      <text className="text-xs text-green-700">{m.name}</text>
                    </view>
                  ))
              }
            </view>
          }
        />

        {/* How it works */}
        <view className="bg-neutral-100 rounded-2xl px-4 py-3 mt-2">
          <text className="text-xs text-neutral-500 font-semibold mb-1.5">How each type works</text>
          <text className="text-xs text-neutral-500 leading-5">
            {'Public — open channel, no auth handshake.\nPrivate — scoped to your user ID, HMAC-verified.\nPresence — like private + live member roster.'}
          </text>
          {/* fontFamily monospace not a Tailwind class in Lynx, use inline */}
          <text className="text-xs text-neutral-400 mt-2" style={{ fontFamily: 'monospace' }}>
            {'php artisan reverb:start\nphp artisan queue:work'}
          </text>
        </view>

      </scroll-view>
    </view>
  )
}
