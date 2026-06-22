// ARKZEN GENERATED — broadcast-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:11.826Z
import { ChannelCard } from './components/ChannelCard'
import { BACKEND_URL, POLL_INTERVAL_MS } from './components/constants'
import type { LynxMessage, WsStatus } from './components/types'
import { useCallback, useEffect, useRef, useState } from '@lynx-js/react'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'

// v2: Reverb/WebSocket replaced with polling via arkzenFetch.
// Lynx's `new WebSocket(...)` throws "TypeError: not a function" —
// @lynx-js/websocket's WebSocketImpl isn't functional in this
// runtime. Streaming fetch()/EventSource support is also
// unconfirmed in Lynx's main-thread, so this polls a plain JSON
// endpoint (/api/broadcast-test/sse-poll/{channelType}) using the
// same request/response arkzenFetch already proven to work
// elsewhere on this page (login, send).
//
// Known gap: the live "who's online" presence roster relied on
// real Pusher presence-channel semantics (member_added/removed)
// with no equivalent when polling a messages table. The presence
// message stream itself still works; the member list does not,
// and is intentionally left empty here rather than faked.
type ChannelType = 'public' | 'private' | 'presence'

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

  const pollTimerRef = useRef<any>(null)
  const cursorRef     = useRef<{ public: number; private: number; presence: number }>({ public: 0, private: 0, presence: 0 })
  const mountedRef    = useRef(true)

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

  const applyIncoming = useCallback((channelType: ChannelType, eventName: string | null, data: any) => {
    if (eventName === 'broadcast-test.message-sent-public' || channelType === 'public') {
      addMsg(setPublicMsgs, data as LynxMessage); setPublicCount((c: number) => c + 1)
    }
    if (eventName === 'broadcast-test.message-sent-private' || channelType === 'private') {
      addMsg(setPrivateMsgs, data as LynxMessage); setPrivateCount((c: number) => c + 1)
    }
    if (eventName === 'broadcast-test.message-sent-presence' || channelType === 'presence') {
      addMsg(setPresenceMsgs, data as LynxMessage); setPresenceCount((c: number) => c + 1)
    }
  }, [])

  const pollChannel = useCallback(async (channelType: ChannelType, setStatus: (s: WsStatus) => void) => {
    try {
      const after = cursorRef.current[channelType]
      const res   = await arkzenFetch(`${BACKEND_URL}/api/broadcast-test/sse-poll/${channelType}?after_id=${after}`)
      if (!res.ok) { setStatus('error'); return }

      const body = await res.json() as { messages: { event: string | null; data: any }[]; last_id: number }
      cursorRef.current[channelType] = body.last_id

      for (const item of body.messages) {
        applyIncoming(channelType, item.event, item.data)
      }
      setStatus('connected')
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }, [applyIncoming])

  const pollAll = useCallback(async () => {
    if (!mountedRef.current) return
    await Promise.all([
      pollChannel('public',   setPublicStatus),
      pollChannel('private',  setPrivateStatus),
      pollChannel('presence', setPresenceStatus),
    ])
  }, [pollChannel])

  const startPolling = useCallback(() => {
    setPublicStatus('connecting'); setPrivateStatus('connecting'); setPresenceStatus('connecting')
    pollAll()
    pollTimerRef.current = setInterval(pollAll, POLL_INTERVAL_MS)
  }, [pollAll])

  useEffect(() => {
    mountedRef.current = true
    if (user?.id) startPolling()
    return () => {
      mountedRef.current = false
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [user?.id])

  const handleLogout = async () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
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
          description={`private-broadcast-test.${user?.id} · Bearer-token scoped per user.`}
          status={privateStatus} count={privateCount} msgs={privateMsgs} onSend={sendPrivate}
        />

        <ChannelCard
          title="Presence channel" badge="presence" badgeColor="bg-green-500"
          description="presence-broadcast-test-presence · Auth required (no live roster on Lynx)."
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
            {'Public — open, no auth.\nPrivate — scoped to your user ID via Bearer token.\nPresence — same as private; live member roster not available over the Lynx polling bridge.'}
          </text>
        </view>

      </scroll-view>
    </view>
  )
}

export const BroadcastTestDashboard = DashboardScreen;
