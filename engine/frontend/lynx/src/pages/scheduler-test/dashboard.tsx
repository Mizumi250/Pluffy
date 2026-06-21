// ARKZEN GENERATED — scheduler-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:34.161Z
import { exitCodeStyle, triggeredStyle } from './components/utils'
import type { CommandRun } from './components/types'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'

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

export const SchedulerTestDashboard = DashboardLynxPage;
