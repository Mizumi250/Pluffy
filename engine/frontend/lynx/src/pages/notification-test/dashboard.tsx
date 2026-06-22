// ARKZEN GENERATED — notification-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T07:06:51.599Z
import { channelDesc, channelEmoji, channelLabel } from './components/utils'
import type { WsStatus } from './components/types'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:auth */

import { useState, useEffect } from '@lynx-js/react'

const DashboardLynxPage = () => {
  const { user, logout } = useAuthStore()
  const [inbox, setInbox] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [wsStatus, setWsStatus] = useState<WsStatus>('connecting')
  const [toast, setToast] = useState<string | null>(null)

  const notifTypes = [
    'database-ping',
    'mail-ping',
    'broadcast-ping',
    'broadcast-ping-public',
    'all-channels',
  ]

  const loadInbox = async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch('/api/notification-test/inbox')
      const d = await res.json()
      const items = d.data ?? []
      setInbox(items)
      setUnread(items.filter((n: any) => !n.read_at).length)
    } catch (err) {
      console.error('[notification-test] Failed to load inbox:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInbox() }, [])

  const trigger = async (key: string) => {
    setSending(key)
    try {
      await arkzenFetch('/api/notification-test/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification: key }),
      })
      if (!['broadcast-ping', 'broadcast-ping-public', 'all-channels'].includes(key)) {
        setToast(`${channelLabel[key]} notification sent!`)
        setTimeout(() => setToast(null), 4000)
      }
      setTimeout(loadInbox, 800)
    } catch (err) {
      console.error('[notification-test] trigger failed:', err)
    } finally {
      setSending(null)
    }
  }

  const readAll = async () => {
    try {
      await arkzenFetch('/api/notification-test/inbox/read-all', { method: 'POST' })
      loadInbox()
    } catch {}
  }

  const deleteNotif = async (id: number) => {
    try {
      await arkzenFetch(`/api/notification-test/inbox/${id}`, { method: 'DELETE' })
      loadInbox()
    } catch {}
  }

  const handleLogout = async () => {
    await logout()
  }

  const statusColor = {
    connecting: '#facc15',
    connected:  '#4ade80',
    error:      '#f87171',
  }

  return (
    <scroll-view className="flex-1 p-8">
      {toast && (
        <view className="bg-[#171717] rounded-2xl px-5 py-3 mb-4 flex-row items-center" style={{ gap: 8 }}>
          <text className="text-white text-sm">🔔 {toast}</text>
        </view>
      )}

      <view style={{ gap: 24 }}>
        <view className="flex-row items-center justify-between">
          <view>
            <text className="text-2xl font-bold">🔔 Notification Test</text>
            <text className="text-sm text-neutral-500 mt-1">
              Signed in as <text className="font-medium">{user?.email}</text>
            </text>
          </view>
          <view className="flex-row items-center" style={{ gap: 16 }}>
            <view className="flex-row items-center" style={{ gap: 8 }}>
              <view
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusColor[wsStatus] }}
              />
              <text className="text-neutral-500 text-sm" style={{ textTransform: 'capitalize' }}>{wsStatus}</text>
            </view>
            <text className="text-xs text-neutral-400" bindtap={handleLogout}>
              Sign out
            </text>
          </view>
        </view>

        <view className="bg-white rounded-2xl p-5 border border-neutral-100">
          <view className="flex-row items-center justify-between">
            <view>
              <text className="text-2xl font-bold text-neutral-900">{unread}</text>
              <text className="text-sm text-neutral-500">Unread notifications</text>
            </view>
            <view>
              <text className="text-2xl font-bold text-neutral-900">{inbox.length}</text>
              <text className="text-sm text-neutral-500">Total notifications</text>
            </view>
          </view>
        </view>

        <view className="flex-row flex-wrap" style={{ gap: 12 }}>
          {notifTypes.map(key => (
            <view key={key} className="bg-white rounded-2xl border border-neutral-100 p-4" style={{ minWidth: '30%', flexGrow: 1 }}>
              <view className="flex-row items-center mb-2" style={{ gap: 8 }}>
                <text>{channelEmoji[key]}</text>
                <text className="font-medium text-sm">{channelLabel[key]}</text>
              </view>
              <text className="text-xs text-neutral-400 mb-3">{channelDesc[key]}</text>
              <view
                bindtap={sending ? undefined : () => trigger(key)}
                className="w-full rounded-xl py-2 items-center"
                style={{ backgroundColor: '#171717', opacity: sending ? 0.6 : 1 }}
              >
                <text className="text-white text-sm font-medium">{sending === key ? '...' : 'Trigger'}</text>
              </view>
            </view>
          ))}
        </view>

        <view className="bg-white rounded-2xl border border-neutral-100" style={{ overflow: 'hidden' }}>
          <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="font-semibold">Database inbox ({unread} unread)</text>
            <view className="flex-row" style={{ gap: 12 }}>
              {unread > 0 && (
                <text className="text-xs text-neutral-500" bindtap={readAll}>
                  Mark all read
                </text>
              )}
              <text className="text-xs text-neutral-400" bindtap={loadInbox}>
                {loading ? 'Loading...' : 'Refresh'}
              </text>
            </view>
          </view>
          {inbox.length === 0 ? (
            <view className="p-8 items-center">
              <text className="text-sm text-neutral-400">No notifications yet. Trigger one above.</text>
            </view>
          ) : (
            <view>
              {inbox.map((n) => {
                const data = n.data && typeof n.data === 'string' ? JSON.parse(n.data) : (n.data || {})
                return (
                  <view key={n.id} className={`px-5 py-3 border-b border-neutral-50 flex-row items-center ${!n.read_at ? 'bg-blue-50' : ''}`} style={{ gap: 12 }}>
                    {!n.read_at && <view className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    {n.read_at && <view className="w-1.5 h-1.5" />}
                    <view className="flex-1">
                      <text className="text-sm text-neutral-700">
                        {data.message ?? 'Notification'}
                      </text>
                      <text className="text-xs text-neutral-400">
                        {data.subject ?? n.type} · {n.created_at?.slice(0, 19).replace('T', ' ')}
                      </text>
                    </view>
                    <view className="flex-row items-center" style={{ gap: 8 }}>
                      {n.read_at && <text className="text-xs text-neutral-300">read</text>}
                      <text
                        className="text-xs text-red-400"
                        bindtap={() => deleteNotif(n.id)}
                      >
                        Delete
                      </text>
                    </view>
                  </view>
                )
              })}
            </view>
          )}
        </view>

        {wsStatus === 'error' && (
          <view className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <text className="text-sm text-amber-800">
              <text className="font-bold">WebSocket not connected.</text> Make sure Laravel Reverb is running:{' '}
              <text className="bg-amber-100 px-1 rounded" style={{ fontFamily: 'monospace' }}>php artisan reverb:start</text>
            </text>
          </view>
        )}

        <view className="text-xs bg-neutral-50 rounded-xl p-4">
          <text className="text-xs text-neutral-400">
            <text className="font-bold">Channels tested:</text>{'\n'}
            <text className="font-bold">database</text> — stored in native notifications table, shown in inbox above{'\n'}
            <text className="font-bold">mail</text> — sent to {user?.email} (check Mailtrap){'\n'}
            <text className="font-bold">broadcast (private)</text> — fires on private-notification-test.userId — only you receive it{'\n'}
            <text className="font-bold">broadcast (public)</text> — fires on notification-test.notifications — anyone subscribed receives it{'\n'}
            Run <text style={{ fontFamily: 'monospace' }}>php artisan reverb:start</text> for broadcast + <text style={{ fontFamily: 'monospace' }}>php artisan queue:work</text> for mail.
          </text>
        </view>
      </view>
    </scroll-view>
  )
}

export const NotificationTestDashboard = DashboardLynxPage;
