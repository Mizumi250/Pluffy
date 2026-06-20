// ARKZEN GENERATED — notification-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.645Z
import { channelDesc, channelEmoji, channelLabel } from './components/utils'
import type { WsStatus } from './components/types'
import { arkzenFetch, useAuthStore } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:auth */

import React from 'react'

const DashboardLynxPage = () => {
  const { user, logout } = useAuthStore()
  const [inbox, setInbox] = React.useState<any[]>([])
  const [unread, setUnread] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [sending, setSending] = React.useState<string | null>(null)
  const [wsStatus, setWsStatus] = React.useState<WsStatus>('connecting')
  const [toast, setToast] = React.useState<string | null>(null)

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

  React.useEffect(() => { loadInbox() }, [])

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
    window.location.href = '/notification-test/login'
  }

  const statusColor = {
    connecting: '#facc15',
    connected:  '#4ade80',
    error:      '#f87171',
  }

  return (
    <div className="min-h-screen p-8">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-neutral-900 text-white text-sm rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2">
          🔔 {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">🔔 Notification Test</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: statusColor[wsStatus] }}
              />
              <span className="text-neutral-500 capitalize">{wsStatus}</span>
            </div>
            <button
              className="text-xs text-neutral-400 hover:text-neutral-700"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-neutral-900">{unread}</div>
              <div className="text-sm text-neutral-500">Unread notifications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{inbox.length}</div>
              <div className="text-sm text-neutral-500">Total notifications</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {notifTypes.map(key => (
            <div key={key} className="bg-white rounded-2xl border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{channelEmoji[key]}</span>
                <span className="font-medium text-sm">{channelLabel[key]}</span>
              </div>
              <div className="text-xs text-neutral-400 mb-3">{channelDesc[key]}</div>
              <button
                className="arkzen-btn w-full text-sm"
                onClick={() => trigger(key)}
                disabled={!!sending}
              >
                {sending === key ? '...' : 'Trigger'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Database inbox ({unread} unread)</h2>
            <div className="flex gap-3">
              {unread > 0 && (
                <button className="text-xs text-neutral-500 hover:text-neutral-900" onClick={readAll}>
                  Mark all read
                </button>
              )}
              <button className="text-xs text-neutral-400 hover:text-neutral-700" onClick={loadInbox}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          {inbox.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No notifications yet. Trigger one above.
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {inbox.map((n) => {
                const data = n.data && typeof n.data === 'string' ? JSON.parse(n.data) : (n.data || {})
                return (
                  <div key={n.id} className={`px-5 py-3 flex items-center gap-3 ${!n.read_at ? 'bg-blue-50/40' : ''}`}>
                    {!n.read_at && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                    {n.read_at && <div className="w-1.5 h-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-700 truncate">
                        {data.message ?? 'Notification'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {data.subject ?? n.type} · {n.created_at?.slice(0, 19).replace('T', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {n.read_at && <span className="text-xs text-neutral-300">read</span>}
                      <button
                        className="text-xs text-red-400 hover:text-red-600"
                        onClick={() => deleteNotif(n.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {wsStatus === 'error' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
            <strong>WebSocket not connected.</strong> Make sure Laravel Reverb is running:{' '}
            <code className="bg-amber-100 px-1 rounded">php artisan reverb:start</code>
          </div>
        )}

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>Channels tested:</strong><br/>
          <strong>database</strong> — stored in native notifications table, shown in inbox above<br/>
          <strong>mail</strong> — sent to {user?.email} (check Mailtrap)<br/>
          <strong>broadcast (private)</strong> — fires on <code>private-notification-test.{'{'}userId{'}'}</code> — only you receive it<br/>
          <strong>broadcast (public)</strong> — fires on <code>notification-test.notifications</code> — anyone subscribed receives it<br/>
          Run <code>php artisan reverb:start</code> for broadcast + <code>php artisan queue:work</code> for mail.
        </div>
      </div>
    </div>
  )
}
