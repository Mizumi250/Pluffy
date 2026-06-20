// ARKZEN GENERATED — events-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.125Z
import { apiFetch, eventColor, statusStyle } from './components/utils'
import type { EventLogEntry } from './components/types'
import { ScrollView, Text, TouchableOpacity, View, useCallback, useEffect, useRef, useState } from '@lynx-js/react'
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
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <View className="flex-row items-center gap-2">
          <Icon set="lucide" name="zap" size={18} color="#0f172a" />
          <Text className="text-base font-semibold text-neutral-900">Events Test</Text>
        </View>
        <Text className="text-xs text-neutral-500 mt-0.5">
          Each event fires its listeners as queued jobs.
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Event fire cards */}
        {events.map(ev => {
          const color = eventColor(ev.key)
          return (
            <View key={ev.key} className="bg-white rounded-2xl border border-neutral-100 p-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 min-w-0">
                  <View className={`self-start px-2 py-0.5 rounded-md mb-1.5 ${color.bg}`}>
                    <Text className={`text-xs font-mono font-bold ${color.text}`}>{ev.label}</Text>
                  </View>
                  <Text className="text-xs text-neutral-500">{ev.desc}</Text>
                  <Text className="text-xs text-neutral-400 font-mono mt-1" numberOfLines={1}>
                    {JSON.stringify(ev.payload)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => fire(ev.key, ev.payload)}
                  disabled={!!firing}
                  activeOpacity={0.8}
                  className={`px-4 py-2 rounded-xl items-center justify-center ${
                    firing === ev.key ? 'bg-neutral-200' : 'bg-neutral-900'
                  }`}
                >
                  <Text className="text-white text-xs font-semibold">
                    {firing === ev.key ? '…' : 'Fire'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}

        {/* Log panel */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          {/* Log header */}
          <View className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-900">Listener execution log</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={loadLog} className="p-1.5">
                <Icon set="lucide" name="refresh-cw" size={14} color="#a3a3a3" />
              </TouchableOpacity>
              {log.length > 0 && (
                <TouchableOpacity onPress={clearLog} disabled={clearing} className="p-1.5">
                  {clearing
                    ? <Text className="text-xs text-red-400">…</Text>
                    : <Icon set="lucide" name="trash-2" size={14} color="#f87171" />
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>

          {Object.keys(grouped).length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-neutral-400">No events fired yet.</Text>
              <Text className="text-xs text-neutral-300 mt-1">Fire an event above to see listener results.</Text>
            </View>
          ) : (
            Object.entries(grouped).map(([groupKey, entries]) => (
              <View key={groupKey} className="px-5 py-3 border-b border-neutral-50">
                {/* Group header */}
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Icon set="lucide" name="flame" size={13} color="#f59e0b" />
                  <Text className="text-xs font-medium text-neutral-500">
                    {entries[0].event_name} — {entries[0].created_at?.slice(11, 19)}
                  </Text>
                </View>
                {/* Listener rows */}
                <View className="pl-3 border-l-2 border-neutral-100 gap-1.5">
                  {entries.map((e, i) => {
                    const st = statusStyle(e.status)
                    return (
                      <View key={i} className="flex-row items-center justify-between">
                        <Text className="text-xs text-neutral-600 font-mono flex-1" numberOfLines={1}>
                          {e.listener_name}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          {e.duration_ms !== null && (
                            <Text className="text-xs text-neutral-400">{e.duration_ms}ms</Text>
                          )}
                          <View className={`px-1.5 py-0.5 rounded-md ${st.bg}`}>
                            <Text className={`text-xs font-medium ${st.text}`}>{e.status}</Text>
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Footer info */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            {`endpoint: /api/events-test\nqueue: php artisan queue:work`}
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}
