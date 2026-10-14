// ============================================================
// ARKZEN GENERATED PAGE — queue-flow/admin [React+Inertia]
// Layout: app | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.972Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AdminCallButton } from './components/AdminCallButton'
import { AnnounceBadge } from './components/AnnounceBadge'
import { BigTicketDisplay } from './components/BigTicketDisplay'
import { CircularRing } from './components/CircularRing'
import { NowServingCard } from './components/NowServingCard'
import { StatPill } from './components/StatPill'
import { TicketRow } from './components/TicketRow'
import { useAnnounce, useQueueStore } from './components/hooks'
import { fmtWait } from './components/utils'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { AppLayout } from '@/arkzen/core/layouts/custom/queue-flow-app'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { router, usePage } from '@inertiajs/react'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'

// Props passed from Laravel via Inertia::render()
export type QueueFlowAdminProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:admin ─────────────────────────────
const AdminPage = () => {
  const { statuses, setStatus } = useQueueStore()
  const [queueId] = useState(1)
  const [calling, setCalling] = useState(false)
  const status = statuses[queueId]
  const announce = useAnnounce()

  const load = useCallback(async () => {
    try {
      const res = await arkzenFetch(`/api/queue-flow/status/${queueId}`)
      const data = await res.json() as QueueStatus
      setStatus(queueId, data)
    } catch {}
  }, [queueId])

  useEffect(() => {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 64 }}>
        <Loader2 size={24} style={{ color: '#4a72c8', animation: 'spin 1s linear infinite' }} />
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

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_QueueFlow_Admin() {
  const props   = usePage<QueueFlowAdminProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animation initializer
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={{}}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AdminPage {...props} />
    </motion.div>
  )

  return (
    <AppLayout>
    {content}
    </AppLayout>
  )
}

export default ArkzenPage_QueueFlow_Admin
