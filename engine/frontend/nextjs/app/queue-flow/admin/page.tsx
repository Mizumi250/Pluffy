'use client'
// ============================================================
// ARKZEN GENERATED PAGE — queue-flow/admin
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-03T04:00:13.996Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/queue-flow-app'


// Utilities, types, and helper functions from @arkzen:components
import { create } from 'zustand'
import {
  Users, Clock, CheckCircle, ChevronRight,
  Plus, SkipForward, Volume2, Hash,
  Loader2, ArrowRight, Star
} from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Queue {
  id:                number
  name:              string
  description:       string | null
  prefix:            string
  is_active:         boolean
  avg_wait_minutes:  number
}

export interface Ticket {
  id:            number
  queue_id:      number
  ticket_number: string
  customer_name: string | null
  status:        'waiting' | 'serving' | 'done' | 'skipped'
  position:      number
  called_at:     string | null
  served_at:     string | null
  created_at:    string
}

export interface QueueStatus {
  queue:         Queue
  serving:       Ticket | null
  waiting:       Ticket[]
  done_count:    number
  total_waiting: number
}

export interface MyTicketResponse {
  ticket:         Ticket
  position:       number
  estimated_wait: number
  is_serving:     boolean
  is_done:        boolean
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface QueueStore {
  queues:      Queue[]
  statuses:    Record<number, QueueStatus>
  myTicket:    MyTicketResponse | null
  loading:     boolean
  setQueues:   (q: Queue[]) => void
  setStatus:   (id: number, s: QueueStatus) => void
  setMyTicket: (t: MyTicketResponse | null) => void
  setLoading:  (l: boolean) => void
}

export const useQueueStore = create<QueueStore>((set) => ({
  queues:      [],
  statuses:    {},
  myTicket:    null,
  loading:     false,
  setQueues:   (queues)      => set({ queues }),
  setStatus:   (id, status)  => set(s => ({ statuses: { ...s.statuses, [id]: status } })),
  setMyTicket: (myTicket)    => set({ myTicket }),
  setLoading:  (loading)     => set({ loading }),
}))

// ─── Utilities ────────────────────────────────────────────────────────────────

export const fmtWait = (mins: number) =>
  mins <= 0 ? 'Now' : mins < 60 ? `~${mins}m` : `~${Math.round(mins / 60)}h`

export const statusColor = (status: Ticket['status']) => ({
  waiting:  'text-violet-400 bg-violet-400/10 border-violet-400/20',
  serving:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  done:     'text-white/30 bg-white/[0.03] border-white/[0.06]',
  skipped:  'text-red-400 bg-red-400/10 border-red-400/20',
}[status] ?? '')

// ─── Announcement hook ────────────────────────────────────────────────────────

export const useAnnounce = () => {
  const announce = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate   = 0.85
    utterance.pitch  = 1
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  }, [])
  return announce
}

// ─── Components ───────────────────────────────────────────────────────────────

export const NowServingCard = ({ ticket, queueName }: { ticket: Ticket | null; queueName: string }) => (
  <div className="now-serving-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-transparent border border-violet-500/20 p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
    <div className="relative">
      <p className="text-xs font-semibold tracking-[0.2em] text-violet-400/70 uppercase mb-4">
        Now Serving · {queueName}
      </p>
      {ticket ? (
        <div className="flex items-end justify-between">
          <div>
            <div className="text-6xl font-black tracking-tight text-white mb-1">
              {ticket.ticket_number}
            </div>
            <p className="text-white/50 text-sm">{ticket.customer_name ?? 'Guest'}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
        </div>
      ) : (
        <div className="text-white/30 text-lg font-medium">Queue is empty</div>
      )}
    </div>
  </div>
)

export const TicketRow = ({ ticket, position }: { ticket: Ticket; position: number }) => (
  <div className="ticket-row flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
    <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-white/40">#{position}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white truncate">{ticket.ticket_number}</p>
      <p className="text-xs text-white/40 truncate">{ticket.customer_name ?? 'Guest'}</p>
    </div>
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColor(ticket.status)}`}>
      {ticket.status}
    </span>
  </div>
)

export const BigTicketDisplay = ({ data }: { data: MyTicketResponse }) => {
  const { ticket, position, estimated_wait, is_serving, is_done } = data

  return (
    <div className="flex flex-col items-center text-center px-6 pt-12 pb-8">
      {/* Status ring */}
      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center mb-8
        ${is_serving
          ? 'bg-emerald-500/10 border-2 border-emerald-500/40 shadow-[0_0_60px_rgba(52,211,153,0.15)]'
          : is_done
            ? 'bg-white/[0.03] border-2 border-white/10'
            : 'bg-violet-500/10 border-2 border-violet-500/30 shadow-[0_0_60px_rgba(139,92,246,0.15)]'
        }`}
      >
        {/* Pulse ring for serving */}
        {is_serving && (
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" />
        )}
        <div className="flex flex-col items-center">
          <span className={`text-6xl font-black ${is_serving ? 'text-emerald-400' : is_done ? 'text-white/20' : 'text-white'}`}>
            {is_done ? '✓' : position}
          </span>
          <span className={`text-xs font-semibold mt-1 ${is_serving ? 'text-emerald-400/70' : 'text-white/30'}`}>
            {is_serving ? 'YOUR TURN' : is_done ? 'SERVED' : 'position'}
          </span>
        </div>
      </div>

      {/* Ticket number */}
      <div className="mb-2">
        <p className="text-4xl font-black text-white tracking-tight">{ticket.ticket_number}</p>
        <p className="text-white/40 text-sm mt-1">{ticket.customer_name ?? 'Guest'}</p>
      </div>

      {/* Status message */}
      <div className={`mt-6 px-6 py-4 rounded-2xl w-full max-w-xs
        ${is_serving
          ? 'bg-emerald-500/10 border border-emerald-500/20'
          : is_done
            ? 'bg-white/[0.03] border border-white/[0.06]'
            : 'bg-violet-500/10 border border-violet-500/20'
        }`}
      >
        {is_serving ? (
          <p className="text-emerald-400 font-semibold text-sm">Please proceed to the counter</p>
        ) : is_done ? (
          <p className="text-white/40 font-medium text-sm">Thank you for your patience</p>
        ) : (
          <>
            <p className="text-violet-300 font-semibold text-sm mb-1">Estimated wait</p>
            <p className="text-white/60 text-xs">{fmtWait(estimated_wait)}</p>
          </>
        )}
      </div>
    </div>
  )
}

export const StatPill = ({ icon: Icon, label, value, color = 'violet' }: {
  icon: React.ElementType
  label: string
  value: string | number
  color?: 'violet' | 'emerald' | 'amber'
}) => {
  const colors = {
    violet: 'text-violet-400 bg-violet-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/10',
    amber:   'text-amber-400 bg-amber-400/10',
  }
  return (
    <div className="stat-pill flex flex-col gap-1 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={14} />
      </div>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[10px] text-white/30 font-medium uppercase tracking-wide">{label}</p>
    </div>
  )
}

export const AdminCallButton = ({
  onCallNext,
  loading,
  disabled,
}: {
  onCallNext: () => void
  loading: boolean
  disabled: boolean
}) => (
  <button
    onClick={onCallNext}
    disabled={loading || disabled}
    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl
      bg-violet-600 hover:bg-violet-500 active:scale-95
      disabled:opacity-40 disabled:cursor-not-allowed
      transition-all font-bold text-white text-base"
  >
    {loading
      ? <Loader2 size={18} className="animate-spin" />
      : <SkipForward size={18} />
    }
    Call Next
  </button>
)

export const AnnounceBadge = ({ ticket }: { ticket: { ticket_number: string; customer_name: string | null } | null }) => {
  const announce = useAnnounce()

  if (!ticket) return null

  return (
    <button
      onClick={() => announce(`Now serving ${ticket.ticket_number}, ${ticket.customer_name ?? 'Guest'}, please proceed to the counter.`)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]
        hover:bg-white/[0.08] active:scale-95 transition-all text-sm text-white/60"
    >
      <Volume2 size={14} />
      Announce
    </button>
  )
}

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
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 pt-8 pb-4 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-white/30 font-medium tracking-widest uppercase">QueueFlow</p>
        <h1 className="text-2xl font-black text-white mt-0.5">Admin</h1>
      </div>

      {/* Now serving */}
      <NowServingCard
        ticket={status.serving ?? null}
        queueName={status.queue?.name ?? 'General'}
      />

      {/* Announce + Call Next */}
      <div className="flex gap-3">
        <AnnounceBadge ticket={status.serving ?? null} />
        <div className="flex-1">
          <AdminCallButton
            onCallNext={callNext}
            loading={calling}
            disabled={status.total_waiting === 0}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon={Users} label="Waiting" value={status.total_waiting ?? 0} color="violet" />
        <StatPill icon={CheckCircle} label="Served" value={status.done_count ?? 0} color="emerald" />
        <StatPill icon={Clock} label="Avg" value={fmtWait(status.queue?.avg_wait_minutes ?? 5)} color="amber" />
      </div>

      {/* Waiting list */}
      {status.waiting?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 font-semibold tracking-widest uppercase px-1">Waiting</p>
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

export default ArkzenPage_QueueFlow_Admin
