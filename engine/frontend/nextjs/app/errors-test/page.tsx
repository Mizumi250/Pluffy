'use client'
// ============================================================
// ARKZEN GENERATED PAGE — errors-test/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:06.894Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { ErrorScreen } from './components/ErrorScreen'
import { ERRORS } from './components/constants'
import { err } from './components/utils'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const [simulating, setSimulating] = useState<number | null>(null)
  const [result, setResult] = useState<{ code: number; body: string } | null>(null)
  const { toast } = useToast()

  const API_CODES  = [400, 401, 403, 409, 422, 429, 503]
  const NEXT_CODES = [404, 500]

  const simulate = async (code: number) => {
    setSimulating(code)
    setResult(null)
    try {
      const res  = await arkzenFetch(`/api/errors-test/simulate/${code}`)
      const text = await res.text()
      setResult({ code: res.status, body: text })
      const err = ERRORS.find(e => e.code === res.status)
      if (err && API_CODES.includes(res.status)) {
        const type = res.status === 429 ? 'warning' as const : res.status === 401 ? 'info' as const : 'error' as const
        toast[type](`${res.status} ${err.title} — ${err.message}`)
      }
    } catch (e) {
      toast.error('Network error — could not reach the server.')
    } finally {
      setSimulating(null)
    }
  }

  const triggerCrash = () => { throw new Error('Intentional crash to trigger error.tsx') }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Error Handler Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Verify all 9 error codes. Next.js handlers are triggered for real — no fake preview pages.
            API codes fire toasts via the arkzenFetch interceptor.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Next.js Segment Handlers
          </h2>

          <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-neutral-900">404</span>
                <span className="text-sm text-neutral-600">Not Found</span>
                <code className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-lg">not-found.tsx</code>
              </div>
              <p className="text-xs text-neutral-400">Navigate to any non-existent route under /errors-test/ to trigger the real handler.</p>
            </div>
            <a
              href="/errors-test/trigger-not-found"
              className="shrink-0 text-xs font-medium bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-700 transition-colors"
            >
              Trigger
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-neutral-900">500</span>
                <span className="text-sm text-neutral-600">Server Error</span>
                <code className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-lg">error.tsx</code>
              </div>
              <p className="text-xs text-neutral-400">Throws a runtime error in this component to trigger the real error boundary.</p>
            </div>
            <button
              onClick={triggerCrash}
              className="shrink-0 text-xs font-medium bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
            >
              Trigger
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            API Response Codes — Toast
          </h2>
          {ERRORS.filter(e => API_CODES.includes(e.code)).map(err => (
            <div key={err.code} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={'text-base font-bold ' + err.color}>{err.code}</span>
                  <span className="text-sm text-neutral-600">{err.title}</span>
                  <code className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-lg">toast</code>
                </div>
                <p className="text-xs text-neutral-400 max-w-sm">{err.message}</p>
              </div>
              <button
                onClick={() => simulate(err.code)}
                disabled={simulating === err.code}
                className="shrink-0 text-xs font-medium bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-40"
              >
                {simulating === err.code ? '...' : 'Simulate'}
              </button>
            </div>
          ))}
        </div>

        {result && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <p className="text-xs font-medium text-neutral-500 mb-2">Last API response — HTTP {result.code}</p>
            <pre className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-3 overflow-x-auto">{result.body}</pre>
          </div>
        )}

      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_ErrorsTest_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_ErrorsTest_Index
