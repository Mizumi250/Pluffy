// ARKZEN GENERATED — middleware-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T07:06:50.793Z
import { GhostBtn } from './components/GhostBtn'
import { PrimaryBtn } from './components/PrimaryBtn'
import { ResultBox } from './components/ResultBox'
import { apiFetch } from './components/utils'
import type { PingLog, Result } from './components/types'
import { useEffect, useState } from '@lynx-js/react'

/* @arkzen:native:page:layout:default */

const IndexScreen = () => {
  const [logs,    setLogs]    = useState<PingLog[]>([])
  const [message, setMessage] = useState('')
  const [result,  setResult]  = useState<Result>({ status: 'idle', text: '' })
  const [loading, setLoading] = useState(false)

  const loadLogs = async () => {
    try {
      const res = await apiFetch('/api/middleware-test/ping', {
        headers: { 'Content-Type': 'application/json' },
      })
      const d = await res.json()
      setLogs(d.data ?? d ?? [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  const sendPing = async (withCorrectHeader: boolean) => {
    setLoading(true)
    setResult({ status: 'idle', text: 'Sending…' })
    try {
      const headers: Record<string, string> = {}
      if (withCorrectHeader) headers['Content-Type'] = 'application/json'

      const res = await apiFetch('/api/middleware-test/ping', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: message.trim() || 'Test ping', headers_ok: withCorrectHeader }),
      })
      const d = await res.json()
      if (res.ok) {
        setResult({ status: 'pass', text: '✓ Request passed — Content-Type was application/json' })
        setMessage('')
        setTimeout(loadLogs, 300)
      } else if (res.status === 415) {
        setResult({ status: 'blocked', text: `✗ Blocked by requireJson — ${d.message}` })
      } else {
        setResult({ status: 'fail', text: d.message ?? '✗ Request failed' })
      }
    } catch (e) {
      setResult({ status: 'fail', text: e instanceof Error ? e.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4">
        <text className="text-base font-semibold text-neutral-900">🛡️ Middleware Test</text>
        <text className="text-xs text-neutral-400 mt-0.5">
          Tests requireJson middleware body injection
        </text>
      </view>

      <scroll-view className="flex-1 pb-8">

        {/* What was generated */}
        <view className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5">
          <text className="text-sm font-semibold text-neutral-900 mb-2">What Arkzen generated</text>
          <text className="text-xs text-neutral-500 leading-5">
            <text className="font-mono text-neutral-700">@arkzen:middleware:requireJson</text>
            {' '}injects real PHP into{' '}
            <text className="font-mono text-neutral-700">handle()</text>.
            {' '}Alias registered in route file so Laravel resolves it correctly.
          </text>
          <view className="mt-2 bg-neutral-50 rounded-xl px-3 py-2">
            <text className="text-xs font-mono text-neutral-500">
              POST without Content-Type → 415{'\n'}
              POST with Content-Type: application/json → 200
            </text>
          </view>
        </view>

        {/* Test panel */}
        <view className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 p-5 gap-y-3">
          <text className="text-sm font-semibold text-neutral-900">Test the middleware</text>

          <input
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Optional message"
            bindinput={e => setMessage(e.detail.value)}
            type="text"
          />

          <view className="flex-row gap-x-2">
            <PrimaryBtn
              label="✓ With JSON header"
              onPress={() => sendPing(true)}
              loading={loading}
            />
            <GhostBtn
              label="✗ Without JSON header"
              onPress={() => sendPing(false)}
              loading={loading}
            />
          </view>

          <ResultBox result={result} />
        </view>

        {/* Ping log */}
        <view className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="font-semibold text-sm text-neutral-900">Ping log</text>
            <view bindtap={loadLogs}>
              <text className="text-xs text-neutral-400">Refresh</text>
            </view>
          </view>
          {logs.length === 0 ? (
            <view className="p-8 items-center">
              <text className="text-sm text-neutral-400">No pings yet.</text>
            </view>
          ) : (
            logs.map((l, i) => (
              <view key={i} className="px-5 py-3 flex-row items-center justify-between border-b border-neutral-50">
                <text className="text-sm text-neutral-900 flex-1">{l.message}</text>
                <view className={`px-2.5 py-1 rounded-full ml-3 ${l.headers_ok ? 'bg-green-100' : 'bg-neutral-100'}`}>
                  <text className={`text-xs font-semibold ${l.headers_ok ? 'text-green-700' : 'text-neutral-500'}`}>
                    {l.headers_ok ? 'json ✓' : 'no header'}
                  </text>
                </view>
              </view>
            ))
          )}
        </view>

      </scroll-view>
    </view>
  )
}

export const MiddlewareTestIndex = IndexScreen;
