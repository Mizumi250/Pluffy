/* @arkzen:meta
name: events-test
version: 1.0.0
description: Tests Laravel Events + Listeners pipeline. Fire events manually, see listeners execute asynchronously, inspect the event chain.
auth: false
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 4000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:database:event_log
table: event_log
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  event_name:
    type: string
    length: 255
    nullable: false
  listener_name:
    type: string
    length: 255
    nullable: false
  status:
    type: string
    length: 50
    default: completed
  payload:
    type: text
    nullable: true
  duration_ms:
    type: integer
    nullable: true
*/

/* @arkzen:api:event_log
model: EventLog
controller: EventLogController
prefix: /api/events-test
middleware: []
endpoints:
  index:
    method: GET
    route: /log
    description: Get event log entries
    response:
      type: paginated
  store:
    method: POST
    route: /fire
    description: Fire an event
    type: event_fire
    validation:
      event: required|string
      payload: nullable|array
    response:
      type: single
  clearLog:
    method: POST
    route: /log/clear
    description: Clear all log entries
    response:
      type: message
      value: Log cleared
*/

/* @arkzen:events:user-signed-up
listeners: [SendWelcomeEmail, UpdateUserStats, NotifyAdmins]
*/
/* @arkzen:events:user-signed-up:end */

/* @arkzen:events:order-placed
listeners: [ProcessPayment, UpdateInventory, SendOrderConfirmation]
*/
/* @arkzen:events:order-placed:end */

/* @arkzen:events:data-exported
listeners: [LogExportActivity, CleanupTempFiles]
*/
/* @arkzen:events:data-exported:end */

/* @arkzen:listeners:SendWelcomeEmail */
class SendWelcomeEmail implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    \DB::table('event_log')->insert([
      'event_name'    => 'UserSignedUp',
      'listener_name' => 'SendWelcomeEmail',
      'status'        => 'completed',
      'payload'       => json_encode($event->payload ?? []),
      'duration_ms'   => intval((microtime(true) - $start) * 1000),
      'created_at'    => now(),
      'updated_at'    => now(),
    ]);
  }
}
/* @arkzen:listeners:SendWelcomeEmail:end */

/* @arkzen:listeners:UpdateUserStats */
class UpdateUserStats implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    \DB::table('event_log')->insert([
      'event_name'    => 'UserSignedUp',
      'listener_name' => 'UpdateUserStats',
      'status'        => 'completed',
      'payload'       => json_encode($event->payload ?? []),
      'duration_ms'   => intval((microtime(true) - $start) * 1000),
      'created_at'    => now(),
      'updated_at'    => now(),
    ]);
  }
}
/* @arkzen:listeners:UpdateUserStats:end */

/* @arkzen:listeners:NotifyAdmins */
class NotifyAdmins implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    \DB::table('event_log')->insert([
      'event_name'    => 'UserSignedUp',
      'listener_name' => 'NotifyAdmins',
      'status'        => 'completed',
      'payload'       => json_encode($event->payload ?? []),
      'duration_ms'   => intval((microtime(true) - $start) * 1000),
      'created_at'    => now(),
      'updated_at'    => now(),
    ]);
  }
}
/* @arkzen:listeners:NotifyAdmins:end */

/* @arkzen:listeners:ProcessPayment */
class ProcessPayment implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    \DB::table('event_log')->insert([
      'event_name'    => 'OrderPlaced',
      'listener_name' => 'ProcessPayment',
      'status'        => 'completed',
      'payload'       => json_encode($event->payload ?? []),
      'duration_ms'   => intval((microtime(true) - $start) * 1000),
      'created_at'    => now(),
      'updated_at'    => now(),
    ]);
  }
}
/* @arkzen:listeners:ProcessPayment:end */

/* @arkzen:listeners:UpdateInventory */
class UpdateInventory implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    \DB::table('event_log')->insert([
      'event_name'    => 'OrderPlaced',
      'listener_name' => 'UpdateInventory',
      'status'        => 'completed',
      'payload'       => json_encode($event->payload ?? []),
      'duration_ms'   => intval((microtime(true) - $start) * 1000),
      'created_at'    => now(),
      'updated_at'    => now(),
    ]);
  }
}
/* @arkzen:listeners:UpdateInventory:end */

/* @arkzen:listeners:SendOrderConfirmation */
class SendOrderConfirmation implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    \DB::table('event_log')->insert([
      'event_name'    => 'OrderPlaced',
      'listener_name' => 'SendOrderConfirmation',
      'status'        => 'completed',
      'payload'       => json_encode($event->payload ?? []),
      'duration_ms'   => intval((microtime(true) - $start) * 1000),
      'created_at'    => now(),
      'updated_at'    => now(),
    ]);
  }
}
/* @arkzen:listeners:SendOrderConfirmation:end */

/* @arkzen:listeners:LogExportActivity */
class LogExportActivity implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    \DB::table('event_log')->insert([
      'event_name'    => 'DataExported',
      'listener_name' => 'LogExportActivity',
      'status'        => 'completed',
      'payload'       => json_encode($event->payload ?? []),
      'duration_ms'   => intval((microtime(true) - $start) * 1000),
      'created_at'    => now(),
      'updated_at'    => now(),
    ]);
  }
}
/* @arkzen:listeners:LogExportActivity:end */

/* @arkzen:listeners:CleanupTempFiles */
class CleanupTempFiles implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    \DB::table('event_log')->insert([
      'event_name'    => 'DataExported',
      'listener_name' => 'CleanupTempFiles',
      'status'        => 'completed',
      'payload'       => json_encode($event->payload ?? []),
      'duration_ms'   => intval((microtime(true) - $start) * 1000),
      'created_at'    => now(),
      'updated_at'    => now(),
    ]);
  }
}
/* @arkzen:listeners:CleanupTempFiles:end */

/* @arkzen:endpoint:index */
public function index(Request $request): JsonResponse
{
    $perPage = $request->get('per_page', 100);
    $results = EventLog::query()->latest()->paginate($perPage);
    return response()->json($results);
}
/* @arkzen:endpoint:index:end */

/* @arkzen:endpoint:clearLog */
public function clearLog(Request $request): JsonResponse
{
    \DB::table('event_log')->truncate();
    return response()->json(['message' => 'Log cleared']);
}
/* @arkzen:endpoint:clearLog:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Flame, Zap } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

interface EventLogEntry {
  id:            number
  event_name:    string
  listener_name: string
  status:        string
  payload:       string | null
  duration_ms:   number | null
  created_at:    string
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const events = [
    {
      key:     'user-signed-up',
      label:   'UserSignedUp',
      desc:    'Fires 3 listeners: SendWelcomeEmail, UpdateUserStats, NotifyAdmins',
      payload: { user_id: 1, email: 'test@example.com', name: 'Test User' },
      color:   'text-blue-600 bg-blue-50',
    },
    {
      key:     'order-placed',
      label:   'OrderPlaced',
      desc:    'Fires 3 listeners: ProcessPayment, UpdateInventory, SendOrderConfirmation',
      payload: { order_id: 'ORD-9999', total: 149.99, items: 3 },
      color:   'text-green-600 bg-green-50',
    },
    {
      key:     'data-exported',
      label:   'DataExported',
      desc:    'Fires 2 listeners: LogExportActivity, CleanupTempFiles',
      payload: { export_id: 'EXP-001', format: 'csv', rows: 250 },
      color:   'text-purple-600 bg-purple-50',
    },
  ]

  const [log, setLog]           = useState<EventLogEntry[]>([])
  const [firing, setFiring]     = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null)

  // useCallback keeps loadLog stable across StrictMode remounts so the
  // setInterval callback inside fire() never closes over a stale reference.
  // per_page=100 + latest() ensures all recent entries always appear on page 1.
  const loadLog = useCallback(async () => {
    try {
      const res = await arkzenFetch('/api/events-test/log?per_page=100')
      const d   = await res.json()
      setLog(d.data ?? [])
    } catch (e) {
      console.error('Failed to load log:', e)
    }
  }, [])

  useEffect(() => {
    loadLog()
    // Clean up any running interval on unmount so StrictMode's forced
    // unmount/remount cycle doesn't leave a ghost interval behind.
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [loadLog])

  const fire = async (eventKey: string, payload: object) => {
    setFiring(eventKey)
    try {
      await arkzenFetch('/api/events-test/fire', {
        method: 'POST',
        body:   JSON.stringify({ event: eventKey, payload }),
      })

      // Clear any existing poll then start aggressive polling immediately
      if (pollingRef.current) clearInterval(pollingRef.current)

      loadLog()
      pollingRef.current = setInterval(loadLog, 500)

      // Stop polling after 15 seconds
      setTimeout(() => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }, 15000)
    } catch (e) {
      console.error('Fire failed:', e)
    } finally {
      setFiring(null)
    }
  }

  const clearLog = async () => {
    setClearing(true)
    try {
      await arkzenFetch('/api/events-test/log/clear', { method: 'POST' })
      setLog([])
    } catch {} finally { setClearing(false) }
  }

  const statusColor = (s: string) => ({
    completed: 'bg-green-100 text-green-700',
    running:   'bg-yellow-100 text-yellow-700',
    failed:    'bg-red-100 text-red-700',
  }[s] ?? 'bg-neutral-100 text-neutral-600')

  // Group by event + second bucket — latest() order means newest groups appear first
  const grouped = log.reduce((acc: Record<string, EventLogEntry[]>, entry) => {
    const key = `${entry.event_name}:${entry.created_at?.slice(0, 19)}`
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap size={20} /> Events Test</h1>
          <p className="text-sm text-neutral-500 mt-1">Each event fires its listeners as queued jobs.</p>
        </div>

        {/* Event fire buttons */}
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.key} className="bg-white rounded-2xl border border-neutral-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${ev.color}`}>{ev.label}</span>
                  </div>
                  <div className="text-xs text-neutral-500">{ev.desc}</div>
                  <div className="text-xs text-neutral-400 mt-1 font-mono">
                    payload: {JSON.stringify(ev.payload)}
                  </div>
                </div>
                <button
                  className="arkzen-btn text-sm shrink-0"
                  onClick={() => fire(ev.key, ev.payload)}
                  disabled={!!firing}
                >
                  {firing === ev.key ? 'Firing...' : 'Fire'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Event log */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Listener execution log</h2>
            <div className="flex gap-3">
              <button className="text-xs text-neutral-400" onClick={loadLog}>Refresh</button>
              {log.length > 0 && (
                <button className="text-xs text-red-400" onClick={clearLog} disabled={clearing}>
                  {clearing ? 'Clearing...' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No events fired yet. Fire an event above — listener results appear here.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {Object.entries(grouped).map(([groupKey, entries]) => (
                <div key={groupKey} className="px-5 py-3">
                  <div className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1">
                    <Flame size={13} className="text-amber-500" /> {entries[0].event_name} — {entries[0].created_at?.slice(11, 19)}
                  </div>
                  <div className="space-y-1.5 pl-3 border-l-2 border-neutral-100">
                    {entries.map((e, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-neutral-600 font-mono">{e.listener_name}</span>
                        <div className="flex items-center gap-2">
                          {e.duration_ms !== null && <span className="text-neutral-400">{e.duration_ms}ms</span>}
                          <span className={`px-1.5 py-0.5 rounded-md font-medium ${statusColor(e.status)}`}>{e.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>How it works:</strong> The backend fires the Arkzen-generated Event class → Laravel event dispatcher → each listener is a queued job (ShouldQueue). Run <code>php artisan queue:work</code> to process them.
        </div>
      </div>
    </div>
  )
}
/* @arkzen:web:page:index:end */
/* @arkzen:native:components:shared */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Flame, Zap, RefreshCw, Trash2 } from 'lucide-react-native'

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

interface EventLogEntry {
  id:            number
  event_name:    string
  listener_name: string
  status:        string
  payload:       string | null
  duration_ms:   number | null
  created_at:    string
}

const statusStyle = (s: string) => ({
  completed: { bg: 'bg-green-100',   text: 'text-green-700'   },
  running:   { bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
  failed:    { bg: 'bg-red-100',     text: 'text-red-600'     },
}[s] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' })

const eventColor = (key: string) => ({
  'user-signed-up': { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  'order-placed':   { bg: 'bg-green-50',  text: 'text-green-600'  },
  'data-exported':  { bg: 'bg-purple-50', text: 'text-purple-600' },
}[key] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' })

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

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
      const res = await arkzenFetch(`${BACKEND_URL}/api/events-test/log?per_page=100`)
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
      await arkzenFetch(`${BACKEND_URL}/api/events-test/fire`, {
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
      await arkzenFetch(`${BACKEND_URL}/api/events-test/log/clear`, { method: 'POST' })
      setLog([])
    } catch {}
    finally { setClearing(false) }
  }

  // Group by event + second bucket — same logic as web
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
          <Zap size={18} color="#0f172a" />
          <Text className="text-lg font-bold text-neutral-900">Events Test</Text>
        </View>
        <Text className="text-xs text-neutral-500 mt-0.5">
          Each event fires its listeners as queued jobs.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >

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
                  {firing === ev.key
                    ? <ActivityIndicator size="small" color="#737373" />
                    : <Text className="text-white text-xs font-semibold">Fire</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )
        })}

        {/* Log panel */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-900">Listener execution log</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={loadLog} className="p-1.5">
                <RefreshCw size={14} color="#a3a3a3" />
              </TouchableOpacity>
              {log.length > 0 && (
                <TouchableOpacity onPress={clearLog} disabled={clearing} className="p-1.5">
                  {clearing
                    ? <ActivityIndicator size="small" color="#f87171" />
                    : <Trash2 size={14} color="#f87171" />
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
                  <Flame size={13} color="#f59e0b" />
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

        {/* Info */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            backend: /api/events-test{'\n'}
            queue: php artisan queue:work
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:index:end */
