// ARKZEN GENERATED — scheduler-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:54.855Z
import { exitCodeStyle, triggeredStyle } from './components/utils'
import type { CommandRun } from './components/types'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'

/* @arkzen:native:page:layout:guest */

import React from 'react'

const DashboardLynxPage = () => {
  const commands = [
    { key: 'cleanup-temp',    label: 'Cleanup Temp',    signature: 'scheduler-test:cleanup-temp',    schedule: 'Every hour',    icon: '🗑️' },
    { key: 'generate-report', label: 'Generate Report', signature: 'scheduler-test:generate-report', schedule: 'Daily at 8am', icon: '📊' },
    { key: 'ping-health',     label: 'Ping Health',     signature: 'scheduler-test:ping-health',     schedule: 'Every 5 min',  icon: '❤️' },
    { key: 'sync-data',       label: 'Sync Data',       signature: 'scheduler-test:sync-data',       schedule: 'Every 15 min', icon: '🔄' },
  ]

  const [runs, setRuns] = React.useState<CommandRun[]>([])
  const [loading, setLoading] = React.useState(false)
  const [running, setRunning] = React.useState<string | null>(null)
  const [clearing, setClearing] = React.useState(false)

  const loadRuns = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await arkzenFetch('/api/scheduler-test/runs?per_page=50')
      const d = await res.json()
      setRuns(Array.isArray(d) ? d : (d?.data ?? []))
    } catch {}
    finally { setLoading(false) }
  }, [])

  React.useEffect(() => { loadRuns() }, [loadRuns])

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
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">⏰ Scheduler Test</h1>
          <p className="text-sm text-neutral-500 mt-1">Run commands manually or let the scheduler fire them.</p>
        </div>

        {/* Command cards — 2 column grid */}
        <div className="grid grid-cols-2 gap-3">
          {commands.map(cmd => (
            <div key={cmd.key} className="bg-white rounded-2xl border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{cmd.icon}</span>
                <span className="font-medium text-sm truncate">{cmd.label}</span>
              </div>
              <code className="text-xs text-neutral-400 block mb-1 truncate">{cmd.signature}</code>
              <div className="text-xs text-neutral-500 mb-3 flex items-center gap-1">🕒 {cmd.schedule}</div>
              <button
                className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                  running === cmd.key
                    ? 'bg-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
                onClick={() => runCommand(cmd.key)}
                disabled={!!running}
              >
                {running === cmd.key ? '...' : 'Run now'}
              </button>
            </div>
          ))}
        </div>

        {/* Execution history */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Execution history</h2>
            <div className="flex gap-3">
              <button 
                onClick={loadRuns}
                className="text-xs text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '...' : 'Refresh'}
              </button>
              {runs.length > 0 && (
                <button 
                  onClick={clearRuns}
                  disabled={clearing}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                >
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
              {runs.map((r) => {
                const exit = exitCodeStyle(r.exit_code)
                const trigger = triggeredStyle(r.triggered_by)
                return (
                  <div key={r.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <code className="text-xs font-mono font-medium text-neutral-700 flex-1">{r.signature}</code>
                      <div className="flex items-center gap-1.5">
                        {r.duration_ms != null && (
                          <span className="text-xs text-neutral-400">{r.duration_ms}ms</span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${trigger.bg} ${trigger.text}`}>
                          {r.triggered_by}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${exit.bg} ${exit.text}`}>
                          exit {r.exit_code}
                        </span>
                      </div>
                    </div>
                    {r.output && (
                      <pre className="text-xs text-neutral-400 bg-neutral-50 rounded-lg p-2 mt-1 overflow-x-auto whitespace-pre-wrap">{r.output}</pre>
                    )}
                    <div className="text-xs text-neutral-300 mt-1">{r.created_at}</div>
                  </div>
                )
              })}
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
