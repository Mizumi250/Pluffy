// ARKZEN GENERATED — errors-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:30.314Z
import { LynxResultBanner } from './components/LynxResultBanner'
import { BACKEND_URL, LYNX_ERRORS } from './components/constants'
import { useState } from '@lynx-js/react'

const IndexScreen = () => {
  const [simulating,  setSimulating]  = useState<number | null>(null)
  const [result,      setResult]      = useState<{ code: number; body: string } | null>(null)
  const [shouldCrash, setShouldCrash] = useState(false)

  if (shouldCrash) throw new Error('Intentional crash to trigger error boundary')

  const simulate = async (code: number) => {
    setSimulating(code)
    setResult(null)
    try {
      const res  = await fetch(`${BACKEND_URL}/api/errors-test/simulate/${code}`, {
        headers: { Accept: 'application/json' },
      })
      const text = await res.text()
      setResult({ code: res.status, body: text })
    } catch (e) {
      setResult({ code: 0, body: e instanceof Error ? e.message : 'Network error' })
    } finally {
      setSimulating(null)
    }
  }

  const API_CODES = [400, 401, 403, 409, 422, 429, 503]

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4">
        <text className="text-base font-semibold text-neutral-900">⚠️ Error Handler Test</text>
        <text className="text-xs text-neutral-400 mt-0.5">Simulate all 9 HTTP error codes against the API</text>
      </view>

      <scroll-view className="flex-1">

        <LynxResultBanner result={result} />

        {/* Router handlers */}
        <view className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-4 border-b border-neutral-100">
            <text className="text-xs font-semibold uppercase tracking-widest text-neutral-400">ROUTER HANDLERS</text>
          </view>

          <view className="px-5 py-4 flex-row items-center justify-between border-b border-neutral-50">
            <view className="flex-1 mr-4">
              <text className="text-sm font-bold text-neutral-700">404 — Not Found</text>
              <text className="text-xs text-neutral-400 mt-0.5">Navigates to a non-existent route</text>
            </view>
            <view className="px-4 py-2 rounded-xl items-center bg-neutral-900">
              <text className="text-white text-xs font-semibold">Trigger</text>
            </view>
          </view>

          <view className="px-5 py-4 flex-row items-center justify-between">
            <view className="flex-1 mr-4">
              <text className="text-sm font-bold text-red-700">500 — Server Error</text>
              <text className="text-xs text-neutral-400 mt-0.5">Crashes the component to trigger error boundary</text>
            </view>
            <view bindtap={() => setShouldCrash(true)} className="px-4 py-2 rounded-xl items-center bg-red-600">
              <text className="text-white text-xs font-semibold">Trigger</text>
            </view>
          </view>
        </view>

        {/* API codes */}
        <view className="mx-4 mt-4 mb-8 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-4 border-b border-neutral-100">
            <text className="text-xs font-semibold uppercase tracking-widest text-neutral-400">API RESPONSE CODES</text>
          </view>

          {LYNX_ERRORS.filter(e => API_CODES.includes(e.code)).map((err, i) => (
            <view
              key={err.code}
              className={`px-5 py-4 flex-row items-center justify-between ${i < API_CODES.length - 1 ? 'border-b border-neutral-50' : ''}`}
            >
              <view className="flex-1 mr-4">
                <text className={`text-sm font-bold ${err.color}`}>{err.code} — {err.title}</text>
                <text className="text-xs text-neutral-400 mt-0.5">{err.message}</text>
              </view>
              <view
                bindtap={() => simulating === err.code ? null : simulate(err.code)}
                className={`px-4 py-2 rounded-xl items-center ${simulating === err.code ? 'bg-neutral-200' : 'bg-neutral-900'}`}
              >
                <text className={`text-xs font-semibold ${simulating === err.code ? 'text-neutral-500' : 'text-white'}`}>
                  {simulating === err.code ? '...' : 'Simulate'}
                </text>
              </view>
            </view>
          ))}
        </view>

      </scroll-view>
    </view>
  )
}

export const ErrorsTestIndex = IndexScreen;
