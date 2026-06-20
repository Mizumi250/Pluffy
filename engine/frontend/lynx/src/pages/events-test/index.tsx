// ARKZEN GENERATED — events-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:03.762Z
import { apiFetch, eventColor, statusStyle } from './components/utils'
import type { EventLogEntry } from './components/types'
import { useCallback, useEffect, useRef, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'

const IndexScreen = () => {
  const events = [
    {
      key:     'user-signed-up',
      label:   'UserSignedUp',
      desc:    'SendWelcomeEmail, UpdateUserStats, NotifyAdmins',
      payload: { user_id: 1, email: 'test@example.com', name: 'Test User' },
    },
    {
      key:     'order-placed',
      label:   'OrderPlaced',
      desc:    'ProcessPayment, UpdateInventory, SendOrderConfirmation',
      payload: { order_id: 'ORD-9999', total: 149.99, items: 3 },
    },
    {
      key:     'data-exported',
      label:   'DataExported',
      desc:    'LogExportActivity, CleanupTempFiles',
      payload: { export_id: 'EXP-001', format: 'csv', rows: 250 },
    },
  ]

  const [log,      setLog]      = useState<EventLogEntry[]>([])
  const [firing,   setFiring]   = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadLog = useCallback(async () => {
    try {
      const res = await apiFetch('/api/events-test/log?per_page=100')
      const d   = await res.json()
      setLog(d.data ?? [])
    } catch {}
  }, [])

  useEffect(() => {
    loadLog()
    return () => {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
    }
  }, [loadLog])

  const fire = async (eventKey: string, payload: object) => {
    setFiring(eventKey)
    try {
      await apiFetch('/api/events-test/fire', {
        method: 'POST',
        body:   JSON.stringify({ event: eventKey, payload }),
      })
      if (pollingRef.current) clearInterval(pollingRef.current)
      loadLog()
      pollingRef.current = setInterval(loadLog, 500)
      setTimeout(() => {
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
      }, 15000)
    } catch {}
    finally { setFiring(null) }
  }

  const clearLog = async () => {
    setClearing(true)
    try {
      await apiFetch('/api/events-test/log/clear', { method: 'POST' })
      setLog([])
    } catch {}
    finally { setClearing(false) }
  }

  const grouped = log.reduce((acc: Record<string, EventLogEntry[]>, entry) => {
    const key = `${entry.event_name}:${entry.created_at?.slice(0, 19)}`
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4">
        <view className="flex-row items-center gap-2">
          <Icon set="lucide" name="zap" size={18} color="#0f172a" />
          <text className="text-base font-semibold text-neutral-900">Events Test</text>
        </view>
        <text className="text-xs text-neutral-500 mt-0.5">
          Each event fires its listeners as queued jobs.
        </text>
      </view>

      <scroll-view className="flex-1 p-4 gap-y-3">

        {/* Event fire cards */}
        {events.map(ev => {
          const color = eventColor(ev.key)
          return (
            <view key={ev.key} className="bg-white rounded-2xl border border-neutral-100 p-4">
              <view className="flex-row items-start justify-between gap-3">
                <view className="flex-1 min-w-0">
                  <view className={`self-start px-2 py-0.5 rounded-md mb-1.5 ${color.bg}`}>
                    <text className={`text-xs font-mono font-bold ${color.text}`}>{ev.label}</text>
                  </view>
                  <text className="text-xs text-neutral-500">{ev.desc}</text>
                  <text className="text-xs text-neutral-400 font-mono mt-1">
                    {JSON.stringify(ev.payload)}
                  </text>
                </view>
                <view
                  bindtap={firing ? undefined : () => fire(ev.key, ev.payload)}
                  className={`px-4 py-2 rounded-xl items-center justify-center ${
                    firing === ev.key ? 'bg-neutral-200' : 'bg-neutral-900'
                  }`}
                >
                  <text className="text-white text-xs font-semibold">
                    {firing === ev.key ? '…' : 'Fire'}
                  </text>
                </view>
              </view>
            </view>
          )
        })}

        {/* Log panel */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          {/* Log header */}
          <view className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="text-sm font-semibold text-neutral-900">Listener execution log</text>
            <view className="flex-row items-center gap-3">
              <view bindtap={loadLog} className="p-1.5">
                <Icon set="lucide" name="refresh-cw" size={14} color="#a3a3a3" />
              </view>
              {log.length > 0 && (
                <view bindtap={clearing ? undefined : clearLog} className="p-1.5">
                  {clearing
                    ? <text className="text-xs text-red-400">…</text>
                    : <Icon set="lucide" name="trash-2" size={14} color="#f87171" />
                  }
                </view>
              )}
            </view>
          </view>

          {Object.keys(grouped).length === 0 ? (
            <view className="py-10 items-center">
              <text className="text-sm text-neutral-400">No events fired yet.</text>
              <text className="text-xs text-neutral-300 mt-1">Fire an event above to see listener results.</text>
            </view>
          ) : (
            Object.entries(grouped).map(([groupKey, entries]) => (
              <view key={groupKey} className="px-5 py-3 border-b border-neutral-50">
                {/* Group header */}
                <view className="flex-row items-center gap-1.5 mb-2">
                  <Icon set="lucide" name="flame" size={13} color="#f59e0b" />
                  <text className="text-xs font-medium text-neutral-500">
                    {entries[0].event_name} — {entries[0].created_at?.slice(11, 19)}
                  </text>
                </view>
                {/* Listener rows */}
                <view className="pl-3 border-l-2 border-neutral-100 gap-1.5">
                  {entries.map((e, i) => {
                    const st = statusStyle(e.status)
                    return (
                      <view key={i} className="flex-row items-center justify-between">
                        <text className="text-xs text-neutral-600 font-mono flex-1">
                          {e.listener_name}
                        </text>
                        <view className="flex-row items-center gap-2">
                          {e.duration_ms !== null && (
                            <text className="text-xs text-neutral-400">{e.duration_ms}ms</text>
                          )}
                          <view className={`px-1.5 py-0.5 rounded-md ${st.bg}`}>
                            <text className={`text-xs font-medium ${st.text}`}>{e.status}</text>
                          </view>
                        </view>
                      </view>
                    )
                  })}
                </view>
              </view>
            ))
          )}
        </view>

        {/* Footer info */}
        <view className="bg-neutral-100 rounded-2xl px-4 py-3">
          <text className="text-xs text-neutral-500 font-mono leading-5">
            {`endpoint: /api/events-test\nqueue: php artisan queue:work`}
          </text>
        </view>

      </scroll-view>
    </view>
  )
}
