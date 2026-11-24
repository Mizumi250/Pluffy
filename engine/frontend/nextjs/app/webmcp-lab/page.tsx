'use client'
// ============================================================
// ARKZEN GENERATED PAGE — webmcp-lab/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:20.162Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BookingForm } from './components/BookingForm'
import { ConfirmDialog } from './components/ConfirmDialog'
import { PriceList } from './components/PriceList'
import { StatusLookup } from './components/StatusLookup'
import { useWebMcpTools } from './components/hooks'
import type { Draft, Service } from './components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const [service, setService] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState<{ draft: Draft; resolve: (ok: boolean) => void } | null>(null)

  const askConfirm = (draft: Draft, signal?: AbortSignal) =>
    new Promise<boolean>(resolve => {
      if (pending) return resolve(false)
      let finished = false
      const finish = (ok: boolean) => {
        if (finished) return
        finished = true
        window.clearTimeout(timer)
        setPending(null)
        resolve(ok)
      }
      const timer = window.setTimeout(() => finish(false), 60000)
      signal?.addEventListener('abort', () => finish(false))
      setPending({ draft, resolve: finish })
    })

  const { count } = useWebMcpTools(askConfirm, draft => setNotice('Booked ' + draft.service + ' on ' + draft.day + ' at ' + draft.slot + ' for ' + draft.name + '.'))

  return (
    <main className="wm-root">
      <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-6">
        <header className="mb-5">
          <h1 className="text-xl font-bold">Bengkel Rahayu</h1>
        </header>
        {notice && <p role="status" className="wm-notice mb-4">{notice}</p>}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid content-start gap-5">
            <BookingForm service={service} onService={setService} onDone={setNotice} />
            <StatusLookup />
          </div>
          <PriceList onPick={setService} />
        </div>
        {count > 0 && <p className="wm-muted wm-small mt-6">{count} tools are available to your browser assistant. Bookings always ask you first.</p>}
      </div>
      {pending && <ConfirmDialog draft={pending.draft} onAnswer={pending.resolve} />}
    </main>
  )
}

// Wrapper for animation + layout
const ArkzenPage_WebmcpLab_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
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

export default ArkzenPage_WebmcpLab_Index
