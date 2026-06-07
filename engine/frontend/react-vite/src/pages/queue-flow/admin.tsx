// ============================================================
// ARKZEN GENERATED PAGE — queue-flow/admin [React+Vite]
// Layout: app | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-07T01:05:07.592Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'
import { create } from 'zustand'
import { AppLayout } from '@/arkzen/core/layouts/custom/queue-flow-app'
import { useNavigate } from 'react-router'

// ── Shared components from @arkzen:components ─────────────────────────────────
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

// ─── Circular Ring ────────────────────────────────────────────────────────────

const CircularRing = ({ label, sublabel }: { label: string; sublabel: string }) => {
  const [angle, setAngle] = useState(45)
  useEffect(() => {
    const id = setInterval(() => setAngle(a => (a + 0.3) % 360), 50)
    return () => clearInterval(id)
  }, [])
  const r = 80, cx = 100, cy = 100
  const circumference = 2 * Math.PI * r
  const progress = 0.35
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180)
  const arcEndX = cx + r * Math.cos(toRad(angle + progress * 360))
  const arcEndY = cy + r * Math.sin(toRad(angle + progress * 360))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 8px' }}>
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,170,255,0.20) 0%, rgba(100,150,255,0.08) 60%, transparent 80%)' }} />
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: `rotate(${angle}deg)` }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(180,210,255,0.35)" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="3"
            strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }} />
          <circle cx={arcEndX} cy={arcEndY} r="5" fill="white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,1))' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.5px' }}>{label}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{sublabel}</span>
          <div style={{ marginTop: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pause size={10} style={{ color: 'rgba(255,255,255,0.8)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Components ───────────────────────────────────────────────────────────────

export const NowServingCard = ({ ticket, queueName }: { ticket: Ticket | null; queueName: string }) => (
  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.80)', backdropFilter: 'blur(16px)', padding: '18px 20px', boxShadow: '0 8px 32px rgba(80,130,200,0.12)' }}>
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#7aabde', textTransform: 'uppercase', marginBottom: 14 }}>
      Now Serving · {queueName}
    </p>
    {ticket ? (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#1a3060', letterSpacing: '-2px', lineHeight: 1 }}>{ticket.ticket_number}</div>
          <p style={{ color: '#7a9bc4', fontSize: 13, marginTop: 4 }}>{ticket.customer_name ?? 'Guest'}</p>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={26} style={{ color: '#10b981' }} />
        </div>
      </div>
    ) : (
      <div style={{ color: '#a0b8d8', fontSize: 16, fontWeight: 500 }}>Queue is empty</div>
    )}
  </div>
)

export const TicketRow = ({ ticket, position }: { ticket: Ticket; position: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
    <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(100,150,230,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#5a82c8' }}>#{position}</span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#2a3f6f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.ticket_number}</p>
      <p style={{ fontSize: 11, color: '#7a9bc4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.customer_name ?? 'Guest'}</p>
    </div>
    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: ticket.status === 'serving' ? 'rgba(52,211,153,0.15)' : 'rgba(100,150,230,0.12)', color: ticket.status === 'serving' ? '#059669' : '#4a72c8', border: `1px solid ${ticket.status === 'serving' ? 'rgba(52,211,153,0.3)' : 'rgba(100,150,230,0.25)'}` }}>
      {ticket.status}
    </span>
  </div>
)

export const StatPill = ({ icon: Icon, label, value, color = 'blue' }: {
  icon: React.ElementType
  label: string
  value: string | number
  color?: 'blue' | 'green' | 'amber' | 'violet' | 'emerald'
}) => {
  const colors: Record<string, { bg: string; icon: string; text: string }> = {
    blue:    { bg: 'rgba(80,130,230,0.12)',  icon: '#4a72c8', text: '#2a3f6f' },
    violet:  { bg: 'rgba(80,130,230,0.12)',  icon: '#4a72c8', text: '#2a3f6f' },
    green:   { bg: 'rgba(52,211,153,0.12)',  icon: '#059669', text: '#1a5040' },
    emerald: { bg: 'rgba(52,211,153,0.12)',  icon: '#059669', text: '#1a5040' },
    amber:   { bg: 'rgba(245,158,11,0.12)', icon: '#d97706', text: '#7c4a00' },
  }
  const c = colors[color] ?? colors.blue
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 9, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={13} style={{ color: c.icon }} />
      </div>
      <p style={{ fontSize: 20, fontWeight: 800, color: c.text, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 9, color: '#7a9bc4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
    </div>
  )
}

// ✅ FIX: Add safe guard for missing ticket
export const BigTicketDisplay = ({ data }: { data: MyTicketResponse }) => {
  // If data or data.ticket is missing, show loading fallback
  if (!data || !data.ticket) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Loader2 size={24} style={{ color: '#4a72c8', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }
  const { ticket, position, estimated_wait, is_serving, is_done } = data
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px 32px' }}>
      <div style={{ position: 'relative', width: 192, height: 192, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, background: is_serving ? 'rgba(52,211,153,0.10)' : is_done ? 'rgba(200,220,240,0.20)' : 'rgba(100,150,240,0.12)', border: `2px solid ${is_serving ? 'rgba(52,211,153,0.40)' : is_done ? 'rgba(180,200,220,0.40)' : 'rgba(100,150,240,0.30)'}`, boxShadow: is_serving ? '0 0 48px rgba(52,211,153,0.18)' : '0 0 48px rgba(100,150,240,0.14)' }}>
        {is_serving && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(52,211,153,0.25)', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: is_serving ? '#059669' : is_done ? '#aac0d8' : '#1a3060' }}>{is_done ? '✓' : position}</span>
          <span style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: is_serving ? '#059669' : '#7a9bc4', letterSpacing: '0.12em' }}>{is_serving ? 'YOUR TURN' : is_done ? 'SERVED' : 'position'}</span>
        </div>
      </div>
      <p style={{ fontSize: 36, fontWeight: 900, color: '#1a3060', letterSpacing: '-1px' }}>{ticket.ticket_number}</p>
      <p style={{ color: '#8aabc8', fontSize: 13, marginTop: 4 }}>{ticket.customer_name ?? 'Guest'}</p>
      <div style={{ marginTop: 24, padding: '16px 24px', borderRadius: 20, width: '100%', maxWidth: 280, background: is_serving ? 'rgba(52,211,153,0.10)' : is_done ? 'rgba(200,220,240,0.20)' : 'rgba(100,150,240,0.10)', border: `1px solid ${is_serving ? 'rgba(52,211,153,0.25)' : is_done ? 'rgba(180,200,220,0.30)' : 'rgba(100,150,240,0.20)'}` }}>
        {is_serving ? <p style={{ color: '#059669', fontWeight: 600, fontSize: 14 }}>Please proceed to the counter</p>
          : is_done ? <p style={{ color: '#8aabc8', fontWeight: 500, fontSize: 14 }}>Thank you for your patience</p>
          : <><p style={{ color: '#4a72c8', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Estimated wait</p><p style={{ color: '#7a9bc4', fontSize: 13 }}>{fmtWait(estimated_wait)}</p></>}
      </div>
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
    style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      padding: '16px', borderRadius: 18,
      background: 'linear-gradient(135deg, #4a72d8, #3a5fc8)',
      border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      boxShadow: '0 8px 24px rgba(74,114,216,0.30)',
      transition: 'all 0.2s',
    }}
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
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.45)',
        border: '1px solid rgba(255,255,255,0.70)',
        fontSize: 13, color: '#4a72c8', fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      <Volume2 size={14} />
      Announce
    </button>
  )
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
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
