'use client'
// ============================================================
// ARKZEN GENERATED PAGE — queue-flow/admin
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-06T15:36:27.622Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AdminCallButton } from '../components/AdminCallButton'
import { AnnounceBadge } from '../components/AnnounceBadge'
import { BigTicketDisplay } from '../components/BigTicketDisplay'
import { CircularRing } from '../components/CircularRing'
import { NowServingCard } from '../components/NowServingCard'
import { StatPill } from '../components/StatPill'
import { TicketRow } from '../components/TicketRow'
import { useAnnounce, useQueueStore } from '../components/hooks'
import type { MyTicketResponse, Queue, QueueStatus, QueueStore, Ticket } from '../components/types'
import { fmtWait } from '../components/utils'
import { AppLayout } from '@/arkzen/core/layouts/custom/queue-flow-app'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'

// Page component code (from @arkzen:page:admin)
const AdminPage = () => {
  const { statuses, setStatus } = useQueueStore()
  const [queueId, setQueueId] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [calling, setCalling] = useState(false)
  const status = queueId === null ? undefined : statuses[queueId]
  const announce = useAnnounce()

  const loadQueues = useCallback(async () => {
    try {
      const res = await arkzenFetch('/api/queue-flow/queues')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Unable to load queues')
      const queues = Array.isArray(data) ? data : data.data
      if (!Array.isArray(queues)) throw new Error('Queue response is invalid')
      const active = queues.find((queue: Queue) => queue.is_active)
      if (!active) throw new Error('No active queue is available')
      setQueueId(active.id)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load queues')
    }
  }, [])

  useEffect(() => {
    void loadQueues()
  }, [loadQueues])

  const load = useCallback(async () => {
    if (queueId === null) return
    try {
      const res = await arkzenFetch(`/api/queue-flow/status/${queueId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Unable to load queue status')
      if (!data?.queue || !Array.isArray(data.waiting)) throw new Error('Queue status response is invalid')
      setStatus(queueId, data as QueueStatus)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load queue status')
    }
  }, [queueId])

  useEffect(() => {
    if (queueId === null) return
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [load])

  const callNext = async () => {
    setCalling(true)
    try {
      const res = await arkzenFetch('/api/queue-flow/call-next', {
        method: 'POST',
        body: JSON.stringify({ queue_id: queueId }),
      })
      const data = await res.json()
      if (data.ticket) {
        announce(`Now serving ${data.ticket.ticket_number}, ${data.ticket.customer_name ?? 'Guest'}, please proceed to the counter.`)
      }
      load()
    } catch {} finally { setCalling(false) }
  }

  if (!status) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '64px 20px 0' }}>
        {loadError
          ? <><p role="alert" style={{ color: '#b42318', textAlign: 'center' }}>{loadError}</p><button onClick={() => queueId === null ? void loadQueues() : void load()} style={{ color: '#4a72c8', fontWeight: 600 }}>Retry</button></>
          : <Loader2 size={24} style={{ color: '#4a72c8', animation: 'spin 1s linear infinite' }} />}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', padding: '32px 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ fontSize: 10, color: '#7aaace', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>QueueFlow</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f2050', marginTop: 2, letterSpacing: '-0.5px' }}>Admin</h1>
      </div>
      <NowServingCard ticket={status.serving ?? null} queueName={status.queue?.name ?? 'General'} />
      <div style={{ display: 'flex', gap: 10 }}>
        <AnnounceBadge ticket={status.serving ?? null} />
        <div style={{ flex: 1 }}>
          <AdminCallButton onCallNext={callNext} loading={calling} disabled={status.total_waiting === 0} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatPill icon={Users} label="Waiting" value={status.total_waiting ?? 0} color="blue" />
        <StatPill icon={CheckCircle} label="Served" value={status.done_count ?? 0} color="green" />
        <StatPill icon={Clock} label="Avg" value={fmtWait(status.queue?.avg_wait_minutes ?? 5)} color="amber" />
      </div>
      {status.waiting?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 10, color: '#7a9bc4', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 2px' }}>Waiting</p>
          {status.waiting.map((t, i) => (
            <TicketRow key={t.id} ticket={t} position={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_QueueFlow_Admin = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <AppLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <AdminPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_QueueFlow_Admin
