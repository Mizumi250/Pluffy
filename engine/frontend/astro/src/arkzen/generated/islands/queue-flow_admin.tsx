// ============================================================
// ARKZEN GENERATED ISLAND — queue-flow/admin
// React island component. Hydrated with client:load in .astro page shell.
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:13.700Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/queue-flow-app'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AdminCallButton } from '@/arkzen/generated/components/queue-flow/AdminCallButton'
import { AnnounceBadge } from '@/arkzen/generated/components/queue-flow/AnnounceBadge'
import { NowServingCard } from '@/arkzen/generated/components/queue-flow/NowServingCard'
import { StatPill } from '@/arkzen/generated/components/queue-flow/StatPill'
import { TicketRow } from '@/arkzen/generated/components/queue-flow/TicketRow'
import { useAnnounce, useQueueStore } from '@/arkzen/generated/components/queue-flow/hooks'
import type { QueueStatus } from '@/arkzen/generated/components/queue-flow/types'
import { fmtWait } from '@/arkzen/generated/components/queue-flow/utils'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'

// Page component code (from @arkzen:page:admin)
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

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_QueueFlow_Admin = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
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

export default ArkzenIsland_QueueFlow_Admin
