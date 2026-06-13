'use client'
// ============================================================
// ARKZEN GENERATED PAGE — queue-flow/index
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T00:54:09.262Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/queue-flow-app'
import { BigTicketDisplay } from './components/BigTicketDisplay'
import { CircularRing } from './components/CircularRing'
import { NowServingCard } from './components/NowServingCard'
import { StatPill } from './components/StatPill'
import { TicketRow } from './components/TicketRow'
import { useAnnounce, useQueueStore } from './components/hooks'
import { announce, fmtWait, id } from './components/utils'
import type { Queue, QueueStatus } from './components/types'
import { Users, Clock, CheckCircle, SkipForward, Volume2, Loader2, ArrowRight, Pause, Calendar } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const { statuses, setStatus } = useQueueStore()
  const [queueId] = useState(1)
  const status = statuses[queueId]
  const announce = useAnnounce()
  const prevServing = useRef<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await arkzenFetch(`/api/queue-flow/status/${queueId}`)
      const data = await res.json() as QueueStatus
      setStatus(queueId, data)
      if (data.serving && data.serving.ticket_number !== prevServing.current) {
        prevServing.current = data.serving.ticket_number
        announce(`Now serving ${data.serving.ticket_number}`)
      }
    } catch {}
  }, [queueId])

  useEffect(() => {
    load()
    const interval = setInterval(load, 4000)
    return () => clearInterval(interval)
  }, [load])

  if (!status) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <Loader2 size={24} style={{ color: '#4a72c8', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const riskLabel = status.total_waiting === 0 ? 'Minimal'
    : status.total_waiting < 5 ? 'Low'
    : status.total_waiting < 10 ? 'Moderate' : 'High'

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', padding: '32px 20px 16px' }}>

      {/* Header: Today / Live tabs + calendar icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#7a9bc4', padding: '4px 14px', borderRadius: 999 }}>Today</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#2a3f6f', padding: '4px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.90)', boxShadow: '0 2px 8px rgba(80,120,200,0.12)' }}>Live</span>
        </div>
        <button style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.80)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Calendar size={15} style={{ color: '#5a82b8' }} />
        </button>
      </div>

      {/* Headline */}
      <div style={{ marginBottom: 4, marginTop: 12 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#0f2050', letterSpacing: '-0.5px', lineHeight: 1.1, margin: 0 }}>
          {status.total_waiting === 0 ? 'Smooth sailing!' : `${status.total_waiting} waiting`}
        </h1>
        <p style={{ fontSize: 12, color: '#7aaace', marginTop: 6, lineHeight: 1.5, fontWeight: 400 }}>
          {status.total_waiting === 0
            ? 'Please be careful even if the risk of delays is low'
            : `Queue is active — avg wait ${fmtWait(status.queue?.avg_wait_minutes ?? 5)}`}
          {' '}
          <span style={{ display: 'inline-flex', alignItems: 'center', width: 14, height: 14, borderRadius: '50%', background: 'rgba(100,160,230,0.25)', fontSize: 9, justifyContent: 'center', color: '#4a82c8', fontWeight: 700, verticalAlign: 'middle', marginLeft: 2 }}>i</span>
        </p>
      </div>

      {/* Circular Ring card */}
      <div style={{ position: 'relative', background: 'linear-gradient(145deg, rgba(100,160,255,0.35) 0%, rgba(80,140,240,0.45) 50%, rgba(60,120,220,0.35) 100%)', borderRadius: 28, padding: '8px 0 16px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.55)', boxShadow: '0 12px 40px rgba(60,120,220,0.20)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <CircularRing label={riskLabel} sublabel="Queue risk level" />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatPill icon={Users} label="Waiting" value={status.total_waiting ?? 0} color="blue" />
        <StatPill icon={CheckCircle} label="Served" value={status.done_count ?? 0} color="green" />
        <StatPill icon={Clock} label="Avg Wait" value={fmtWait(status.queue?.avg_wait_minutes ?? 5)} color="amber" />
      </div>

      {/* Now serving */}
      <div style={{ marginBottom: 16 }}>
        <NowServingCard ticket={status.serving ?? null} queueName={status.queue?.name ?? 'General'} />
      </div>

      {/* Waiting list */}
      {status.waiting?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <p style={{ fontSize: 10, color: '#7a9bc4', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 2px' }}>Up Next</p>
          {status.waiting.slice(0, 6).map((t, i) => (
            <TicketRow key={t.id} ticket={t} position={i + 1} />
          ))}
          {status.waiting.length > 6 && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#8aabc8', paddingTop: 4 }}>+{status.waiting.length - 6} more in queue</p>
          )}
        </div>
      )}

      {/* Sensor badge */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(80,130,200,0.10)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#3a5080' }}>Sensor attached</span>
        </div>
      </div>

    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_QueueFlow_Index = () => {
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
        <IndexPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_QueueFlow_Index
