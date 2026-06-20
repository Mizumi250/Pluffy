/* @arkzen:meta
name: scheduler-test
version: 2.0.0
description: Tests Laravel Console Commands + Scheduler. Register Artisan commands, run them manually, inspect execution history.
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

/* @arkzen:database
table: command_runs
timestamps: true
softDeletes: false

columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  command_name:
    type: string
    length: 100
    nullable: false
  signature:
    type: string
    length: 150
    nullable: false
  exit_code:
    type: integer
    nullable: false
    default: 0
  output:
    type: text
    nullable: true
  triggered_by:
    type: string
    length: 50
    nullable: false
    default: manual
  duration_ms:
    type: integer
    nullable: true
*/

/* @arkzen:api
model: CommandRun
controller: CommandRunController
prefix: /api/scheduler-test
middleware: []
resource: false
policy: false
factory: false

endpoints:
  index:
    method: GET
    route: /runs
    description: Get all command run records
    response:
      type: paginated

  store:
    method: POST
    route: /run
    description: Execute a command and record the result
    type: command_run
    validation:
      command: required|string
      triggered_by: sometimes|string
    response:
      type: single

  destroy:
    method: DELETE
    route: /runs
    description: Clear all run records
    response:
      type: message
      value: Runs cleared
*/

/* @arkzen:console:cleanup-temp
signature: scheduler-test:cleanup-temp
description: Deletes temporary files older than 24h
schedule: '0 * * * *'
*/
public function handle(): int
{
    $start = microtime(true);
    $this->info('[Arkzen:scheduler-test] Running cleanup-temp...');

    \App\Models\Arkzen\SchedulerTest\CommandRun::create([
        'command_name' => 'cleanup-temp',
        'signature'    => 'scheduler-test:cleanup-temp',
        'exit_code'    => 0,
        'output'       => 'Cleanup completed successfully.',
        'triggered_by' => 'schedule',
        'duration_ms'  => (int) ((microtime(true) - $start) * 1000),
    ]);

    $this->info('[Arkzen:scheduler-test] ✓ Done');
    return Command::SUCCESS;
}
/* @arkzen:console:cleanup-temp:end */

/* @arkzen:console:generate-report
signature: scheduler-test:generate-report
description: Generates a daily activity report
schedule: '0 8 * * *'
*/
public function handle(): int
{
    $start = microtime(true);
    $this->info('[Arkzen:scheduler-test] Generating report...');

    \App\Models\Arkzen\SchedulerTest\CommandRun::create([
        'command_name' => 'generate-report',
        'signature'    => 'scheduler-test:generate-report',
        'exit_code'    => 0,
        'output'       => 'Daily report generated successfully.',
        'triggered_by' => 'schedule',
        'duration_ms'  => (int) ((microtime(true) - $start) * 1000),
    ]);

    $this->info('[Arkzen:scheduler-test] ✓ Done');
    return Command::SUCCESS;
}
/* @arkzen:console:generate-report:end */

/* @arkzen:console:ping-health
signature: scheduler-test:ping-health
description: Pings all services and records health status
schedule: '*/5 * * * *'
*/
public function handle(): int
{
    $start = microtime(true);
    $this->info('[Arkzen:scheduler-test] Pinging services...');

    \App\Models\Arkzen\SchedulerTest\CommandRun::create([
        'command_name' => 'ping-health',
        'signature'    => 'scheduler-test:ping-health',
        'exit_code'    => 0,
        'output'       => 'All services healthy.',
        'triggered_by' => 'schedule',
        'duration_ms'  => (int) ((microtime(true) - $start) * 1000),
    ]);

    $this->info('[Arkzen:scheduler-test] ✓ Done');
    return Command::SUCCESS;
}
/* @arkzen:console:ping-health:end */

/* @arkzen:console:sync-data
signature: scheduler-test:sync-data
description: Syncs data from external source
schedule: '*/15 * * * *'
*/
public function handle(): int
{
    $start = microtime(true);
    $this->info('[Arkzen:scheduler-test] Syncing data...');

    \App\Models\Arkzen\SchedulerTest\CommandRun::create([
        'command_name' => 'sync-data',
        'signature'    => 'scheduler-test:sync-data',
        'exit_code'    => 0,
        'output'       => 'Data synced successfully.',
        'triggered_by' => 'schedule',
        'duration_ms'  => (int) ((microtime(true) - $start) * 1000),
    ]);

    $this->info('[Arkzen:scheduler-test] ✓ Done');
    return Command::SUCCESS;
}
/* @arkzen:console:sync-data:end */

/* @arkzen:web:components:shared */

'use client'

import React                        from 'react'
import { Activity, BarChart3, Clock3, RefreshCw, Trash2 } from 'lucide-react'
import { useMutation }              from '@/arkzen/core/hooks/useMutation'
import { useQuery }                 from '@/arkzen/core/hooks/useQuery'
import { useToast }                 from '@/arkzen/core/components/Toast'

interface CommandRun {
  id:           number
  command_name: string
  signature:    string
  exit_code:    number
  output:       string | null
  triggered_by: string
  duration_ms:  number | null
  created_at:   string
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:guest */
const DashboardPage = () => {
  const { toast } = useToast()

  const commands = [
    { key: 'cleanup-temp',    label: 'Cleanup Temp',    signature: 'scheduler-test:cleanup-temp',    schedule: 'Every hour',    icon: <Trash2 size={14} className="text-amber-600" /> },
    { key: 'generate-report', label: 'Generate Report', signature: 'scheduler-test:generate-report', schedule: 'Daily at 8am', icon: <BarChart3 size={14} className="text-violet-600" /> },
    { key: 'ping-health',     label: 'Ping Health',     signature: 'scheduler-test:ping-health',     schedule: 'Every 5 min',  icon: <Activity size={14} className="text-red-600" /> },
    { key: 'sync-data',       label: 'Sync Data',       signature: 'scheduler-test:sync-data',       schedule: 'Every 15 min', icon: <RefreshCw size={14} className="text-sky-600" /> },
  ]

  const { data: runsData, refetch } = useQuery<{ data: CommandRun[] }>('/api/scheduler-test/runs', {
    params: { per_page: 50 },
  })

  const runs = runsData?.data ?? []

  const { mutate: runCommand, isLoading: running, variables: runningKey } = useMutation<CommandRun, { command: string; triggered_by: string }>({
    method:      'POST',
    invalidates: ['/api/scheduler-test/runs'],
    onSuccess:   () => {
      toast.success('Command executed');
      refetch();   // Force a refetch to update the history immediately
    },
    onError:     (err) => toast.error(err),
  })

  const { mutate: clearRuns, isLoading: clearing } = useMutation({
    method:      'DELETE',
    invalidates: ['/api/scheduler-test/runs'],
    onSuccess:   () => {
      toast.success('Runs cleared');
      refetch();   // Also refetch after clearing
    },
  })

  const exitCodeBadge  = (code: number) => code === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  const triggeredBadge = (t: string)    => t === 'manual' ? 'bg-blue-100 text-blue-600' : 'bg-neutral-100 text-neutral-500'

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Clock3 size={20} /> Scheduler Test</h1>
          <p className="text-sm text-neutral-500 mt-1">Run commands manually or let the scheduler fire them.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {commands.map(cmd => (
            <div key={cmd.key} className="bg-white rounded-2xl border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center">{cmd.icon}</span>
                <span className="font-medium text-sm">{cmd.label}</span>
              </div>
              <code className="text-xs text-neutral-400 block mb-1">{cmd.signature}</code>
              <div className="text-xs text-neutral-500 mb-3 flex items-center gap-1"><Clock3 size={11} /> {cmd.schedule}</div>
              <button
                className="arkzen-btn-primary w-full text-sm"
                onClick={() => runCommand('/api/scheduler-test/run', { command: cmd.key, triggered_by: 'manual' })}
                disabled={!!running}
              >
                {running && runningKey?.command === cmd.key ? 'Running...' : 'Run now'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Execution history</h2>
            <div className="flex gap-3">
              <button className="text-xs text-neutral-400" onClick={refetch}>Refresh</button>
              {runs.length > 0 && (
                <button className="text-xs text-red-400" onClick={() => clearRuns('/api/scheduler-test/runs')} disabled={clearing}>
                  {clearing ? '...' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {runs.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No runs yet. Click "Run now" on any command above.
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {runs.map((r) => (
                <div key={r.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-medium text-neutral-700">{r.signature}</code>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${triggeredBadge(r.triggered_by)}`}>
                        {r.triggered_by}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.duration_ms != null && <span className="text-xs text-neutral-400">{r.duration_ms}ms</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${exitCodeBadge(r.exit_code)}`}>
                        exit {r.exit_code}
                      </span>
                    </div>
                  </div>
                  {r.output && (
                    <pre className="text-xs text-neutral-400 bg-neutral-50 rounded-lg p-2 mt-1 overflow-x-auto whitespace-pre-wrap">{r.output}</pre>
                  )}
                  <div className="text-xs text-neutral-300 mt-1">{r.created_at}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>Schedule:</strong> Run <code>* * * * * php /path/to/artisan schedule:run</code> via crontab.<br/>
          <strong>Commands are scoped:</strong> All signatures are prefixed with <code>scheduler-test:</code> so they never collide with other tatemonos.<br/>
          <strong>Run all now:</strong> <code>php artisan schedule:run</code>
        </div>

      </div>
    </div>
  )
}
/* @arkzen:web:page:dashboard:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Activity, BarChart3, Clock3, RefreshCw, Trash2 } from 'lucide-react-native'

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Activity, BarChart3, Clock3, RefreshCw, Trash2 } from 'lucide-react-native'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

interface CommandRun {
  id:           number
  command_name: string
  signature:    string
  exit_code:    number
  output:       string | null
  triggered_by: string
  duration_ms:  number | null
  created_at:   string
}

const exitCodeStyle    = (code: number) => code === 0
  ? { bg: 'bg-green-100', text: 'text-green-700' }
  : { bg: 'bg-red-100',   text: 'text-red-600'   }

const triggeredStyle = (t: string) => t === 'manual'
  ? { bg: 'bg-blue-100',    text: 'text-blue-600'    }
  : { bg: 'bg-neutral-100', text: 'text-neutral-500' }

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:dashboard */
/* @arkzen:native:page:layout:default */

const DashboardScreen = () => {
  const commands = [
    { key: 'cleanup-temp',    label: 'Cleanup Temp',    signature: 'scheduler-test:cleanup-temp',    schedule: 'Every hour',    icon: <Trash2    size={14} color="#d97706" /> },
    { key: 'generate-report', label: 'Generate Report', signature: 'scheduler-test:generate-report', schedule: 'Daily at 8am', icon: <BarChart3  size={14} color="#7c3aed" /> },
    { key: 'ping-health',     label: 'Ping Health',     signature: 'scheduler-test:ping-health',     schedule: 'Every 5 min',  icon: <Activity  size={14} color="#dc2626" /> },
    { key: 'sync-data',       label: 'Sync Data',       signature: 'scheduler-test:sync-data',       schedule: 'Every 15 min', icon: <RefreshCw size={14} color="#0284c7" /> },
  ]

  const [runs,      setRuns]      = useState<CommandRun[]>([])
  const [loading,   setLoading]   = useState(false)
  const [running,   setRunning]   = useState<string | null>(null)
  const [clearing,  setClearing]  = useState(false)

  const loadRuns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch(`${BACKEND_URL}/api/scheduler-test/runs?per_page=50`)
      const d   = await res.json()
      setRuns(Array.isArray(d) ? d : (d?.data ?? []))
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadRuns() }, [loadRuns])

  const runCommand = async (cmdKey: string) => {
    setRunning(cmdKey)
    try {
      await arkzenFetch(`${BACKEND_URL}/api/scheduler-test/run`, {
        method: 'POST',
        body:   JSON.stringify({ command: cmdKey, triggered_by: 'manual' }),
      })
      await loadRuns()
    } catch {}
    finally { setRunning(null) }
  }

  const clearRuns = async () => {
    setClearing(true)
    try {
      await arkzenFetch(`${BACKEND_URL}/api/scheduler-test/runs`, { method: 'DELETE' })
      setRuns([])
    } catch {}
    finally { setClearing(false) }
  }

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <View className="flex-row items-center gap-2">
          <Clock3 size={18} color="#0f172a" />
          <Text className="text-lg font-bold text-neutral-900">Scheduler Test</Text>
        </View>
        <Text className="text-xs text-neutral-500 mt-0.5">
          Run commands manually or let the scheduler fire them.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Command cards — 2 column grid */}
        <View className="flex-row flex-wrap gap-3">
          {commands.map(cmd => (
            <View key={cmd.key} className="bg-white rounded-2xl border border-neutral-100 p-4" style={{ width: '47.5%' }}>
              <View className="flex-row items-center gap-2 mb-1">
                {cmd.icon}
                <Text className="text-sm font-semibold text-neutral-900 flex-1" numberOfLines={1}>{cmd.label}</Text>
              </View>
              <Text className="text-xs text-neutral-400 font-mono mb-1" numberOfLines={1}>{cmd.signature}</Text>
              <View className="flex-row items-center gap-1 mb-3">
                <Clock3 size={11} color="#a3a3a3" />
                <Text className="text-xs text-neutral-500">{cmd.schedule}</Text>
              </View>
              <TouchableOpacity
                onPress={() => runCommand(cmd.key)}
                disabled={!!running}
                activeOpacity={0.8}
                className={`py-2 rounded-xl items-center ${running === cmd.key ? 'bg-neutral-200' : 'bg-neutral-900'}`}
              >
                {running === cmd.key
                  ? <ActivityIndicator size="small" color="#737373" />
                  : <Text className="text-white text-xs font-semibold">Run now</Text>
                }
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Execution history */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3.5 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-900">Execution history</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={loadRuns} className="p-1.5">
                {loading
                  ? <ActivityIndicator size="small" color="#a3a3a3" />
                  : <RefreshCw size={14} color="#a3a3a3" />
                }
              </TouchableOpacity>
              {runs.length > 0 && (
                <TouchableOpacity onPress={clearRuns} disabled={clearing} className="p-1.5">
                  {clearing
                    ? <ActivityIndicator size="small" color="#f87171" />
                    : <Trash2 size={14} color="#f87171" />
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>

          {runs.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-neutral-400">No runs yet.</Text>
              <Text className="text-xs text-neutral-300 mt-1">Click "Run now" on any command above.</Text>
            </View>
          ) : (
            runs.map((r, i) => {
              const exit    = exitCodeStyle(r.exit_code)
              const trigger = triggeredStyle(r.triggered_by)
              return (
                <View
                  key={r.id}
                  className={`px-5 py-3.5 ${i < runs.length - 1 ? 'border-b border-neutral-50' : ''}`}
                >
                  <View className="flex-row items-center justify-between gap-2 mb-1">
                    <Text className="text-xs font-mono font-medium text-neutral-700 flex-1" numberOfLines={1}>
                      {r.signature}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      {r.duration_ms != null && (
                        <Text className="text-xs text-neutral-400">{r.duration_ms}ms</Text>
                      )}
                      <View className={`px-1.5 py-0.5 rounded-md ${trigger.bg}`}>
                        <Text className={`text-xs font-medium ${trigger.text}`}>{r.triggered_by}</Text>
                      </View>
                      <View className={`px-1.5 py-0.5 rounded-md ${exit.bg}`}>
                        <Text className={`text-xs font-medium ${exit.text}`}>exit {r.exit_code}</Text>
                      </View>
                    </View>
                  </View>
                  {r.output && (
                    <View className="bg-neutral-50 rounded-lg px-3 py-2 mt-1">
                      <Text className="text-xs text-neutral-400">{r.output}</Text>
                    </View>
                  )}
                  <Text className="text-xs text-neutral-300 mt-1">{r.created_at}</Text>
                </View>
              )
            })
          )}
        </View>

        {/* Info */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            backend: /api/scheduler-test{'\n'}
            cron: * * * * * php artisan schedule:run
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:dashboard:end */

// ─────────────────────────────────────────────────────────────────────────────
// LYNX NATIVE COMPONENTS & PAGES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:lynx:shared */

import { useState, useCallback } from '@lynx-js/react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

interface CommandRun {
  id:           number
  command_name: string
  signature:    string
  exit_code:    number
  output:       string | null
  triggered_by: string
  duration_ms:  number | null
  created_at:   string
}

const exitCodeStyle = (code: number) => code === 0
  ? { bg: 'bg-green-100', text: 'text-green-700' }
  : { bg: 'bg-red-100',   text: 'text-red-600'   }

const triggeredStyle = (t: string) => t === 'manual'
  ? { bg: 'bg-blue-100',    text: 'text-blue-600'    }
  : { bg: 'bg-neutral-100', text: 'text-neutral-500' }

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:dashboard */
/* @arkzen:native:page:layout:guest */

import { useState, useCallback, useEffect } from '@lynx-js/react'

const DashboardLynxPage = () => {
  const commands = [
    { key: 'cleanup-temp',    label: 'Cleanup Temp',    signature: 'scheduler-test:cleanup-temp',    schedule: 'Every hour',    icon: '🗑️' },
    { key: 'generate-report', label: 'Generate Report', signature: 'scheduler-test:generate-report', schedule: 'Daily at 8am', icon: '📊' },
    { key: 'ping-health',     label: 'Ping Health',     signature: 'scheduler-test:ping-health',     schedule: 'Every 5 min',  icon: '❤️' },
    { key: 'sync-data',       label: 'Sync Data',       signature: 'scheduler-test:sync-data',       schedule: 'Every 15 min', icon: '🔄' },
  ]

  const [runs, setRuns] = useState<CommandRun[]>([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const loadRuns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch('/api/scheduler-test/runs?per_page=50')
      const d = await res.json()
      setRuns(Array.isArray(d) ? d : (d?.data ?? []))
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadRuns() }, [])

  const runCommand = async (cmdKey: string) => {
    setRunning(cmdKey)
    try {
      await arkzenFetch('/api/scheduler-test/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmdKey, triggered_by: 'manual' }),
      })
      await loadRuns()
    } catch {}
    finally { setRunning(null) }
  }

  const clearRuns = async () => {
    setClearing(true)
    try {
      await arkzenFetch('/api/scheduler-test/runs', { method: 'DELETE' })
      setRuns([])
    } catch {}
    finally { setClearing(false) }
  }

  return (
    <scroll-view className="flex-1 bg-neutral-50">
      <view className="p-8">
        <view className="max-w-2xl mx-auto" style={{ gap: 24 }}>

          <view>
            <text className="text-2xl font-bold" style={{ gap: 8 }}>
              ⏰ Scheduler Test
            </text>
            <text className="text-sm text-neutral-500 mt-1">Run commands manually or let the scheduler fire them.</text>
          </view>

          {/* Command cards — 2 column grid */}
          <view className="flex-row flex-wrap" style={{ gap: 12 }}>
            {commands.map(cmd => (
              <view key={cmd.key} className="bg-white rounded-2xl border border-neutral-100 p-4" style={{ width: 'calc(50% - 6px)' }}>
                <view className="flex-row items-center gap-2 mb-1">
                  <text className="text-lg">{cmd.icon}</text>
                  <text className="font-medium text-sm">{cmd.label}</text>
                </view>
                <text className="text-xs text-neutral-400 font-mono block mb-1">{cmd.signature}</text>
                <view className="flex-row items-center gap-1 mb-3">
                  <text className="text-xs">🕒</text>
                  <text className="text-xs text-neutral-500">{cmd.schedule}</text>
                </view>
                <view
                  bindtap={running === cmd.key ? undefined : () => runCommand(cmd.key)}
                  className="w-full py-2 rounded-xl items-center"
                  style={{ backgroundColor: running === cmd.key ? '#e5e5e5' : '#171717' }}
                >
                  <text className={`text-sm font-semibold ${running === cmd.key ? 'text-neutral-700' : 'text-white'}`}>
                    {running === cmd.key ? '...' : 'Run now'}
                  </text>
                </view>
              </view>
            ))}
          </view>

          {/* Execution history */}
          <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
              <text className="font-semibold">Execution history</text>
              <view className="flex-row" style={{ gap: 12 }}>
                <text
                  className="text-xs text-neutral-400"
                  bindtap={loading ? undefined : loadRuns}
                >
                  {loading ? '...' : 'Refresh'}
                </text>
                {runs.length > 0 && (
                  <text
                    className="text-xs text-red-400"
                    bindtap={clearing ? undefined : clearRuns}
                  >
                    {clearing ? '...' : 'Clear'}
                  </text>
                )}
              </view>
            </view>

            {runs.length === 0 ? (
              <view className="p-8 items-center">
                <text className="text-sm text-neutral-400 text-center">
                  No runs yet. Click "Run now" on any command above.
                </text>
              </view>
            ) : (
              <view>
                {runs.map((r) => {
                  const exit = exitCodeStyle(r.exit_code)
                  const trigger = triggeredStyle(r.triggered_by)
                  return (
                    <view key={r.id} className="px-5 py-3 border-b border-neutral-50">
                      <view className="flex-row items-center justify-between flex-wrap" style={{ gap: 8 }}>
                        <text className="text-xs font-mono font-medium text-neutral-700 flex-1">{r.signature}</text>
                        <view className="flex-row" style={{ gap: 6 }}>
                          {r.duration_ms != null && (
                            <text className="text-xs text-neutral-400">{r.duration_ms}ms</text>
                          )}
                          <view className={`px-1.5 py-0.5 rounded-md ${trigger.bg}`}>
                            <text className={`text-xs font-medium ${trigger.text}`}>{r.triggered_by}</text>
                          </view>
                          <view className={`px-1.5 py-0.5 rounded-md ${exit.bg}`}>
                            <text className={`text-xs font-medium ${exit.text}`}>exit {r.exit_code}</text>
                          </view>
                        </view>
                      </view>
                      {r.output && (
                        <view className="bg-neutral-50 rounded-lg px-3 py-2 mt-1">
                          <text className="text-xs text-neutral-400">{r.output}</text>
                        </view>
                      )}
                      <text className="text-xs text-neutral-300 mt-1">{r.created_at}</text>
                    </view>
                  )
                })}
              </view>
            )}
          </view>

          {/* Info */}
          <view className="bg-neutral-100 rounded-2xl px-4 py-3">
            <text className="text-xs text-neutral-500 font-mono leading-5">
              backend: /api/scheduler-test{'\n'}
              cron: * * * * * php artisan schedule:run
            </text>
          </view>

        </view>
      </view>
    </scroll-view>
  )
}

/* @arkzen:native:page:lynx:dashboard:end */