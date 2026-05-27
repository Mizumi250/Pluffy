/* @arkzen:meta
name: queue-flow
version: 1.0.0
auth: false
description: Real-time queue management system with PWA support
*/

/* @arkzen:meta:web
label: QueueFlow
title: QueueFlow
favicon: ⏳
pwa:
  name: QueueFlow
  short_name: Queue
  theme_color: "#a4c5f5"
  background_color: "#daeeff"
  display: standalone
  icons:
    - { src: /tatemonos/queue-flow/assets/images/icon-192.png, sizes: 192x192, type: image/png }
    - { src: /tatemonos/queue-flow/assets/images/icon-512.png, sizes: 512x512, type: image/png }
    - { src: /tatemonos/queue-flow/assets/images/icon-mask.png, sizes: 512x512, type: image/png, purpose: maskable }
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
*/

/* @arkzen:database:queues
table: queues
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    nullable: false
  description:
    type: string
    nullable: true
  prefix:
    type: string
    length: 5
    default: "Q"
  is_active:
    type: boolean
    default: true
  avg_wait_minutes:
    type: integer
    default: 5
seeder:
  count: 2
  data:
    - name: "General"
      description: "General service queue"
      prefix: "G"
      is_active: true
      avg_wait_minutes: 5
    - name: "Priority"
      description: "Priority service queue"
      prefix: "P"
      is_active: true
      avg_wait_minutes: 3
*/

/* @arkzen:database:tickets
table: tickets
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  queue_id:
    type: foreignId
    foreign: queue_flow_queues.id
    nullable: false
  ticket_number:
    type: string
    nullable: false
  customer_name:
    type: string
    nullable: true
  status:
    type: enum
    values: [waiting, serving, done, skipped]
    default: waiting
  position:
    type: integer
    default: 0
  called_at:
    type: datetime
    nullable: true
  served_at:
    type: datetime
    nullable: true
*/

/* @arkzen:api:queues
model: Queue
controller: QueueController
prefix: /api/queue-flow
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /queues
    description: Get all queues
    response:
      type: collection
  show:
    method: GET
    route: /queues/{id}
    description: Get a single queue
    response:
      type: single
  store:
    method: POST
    route: /queues
    description: Create a new queue
    validation:
      name: required|string|max:255
      description: nullable|string
      prefix: required|string|max:5
      avg_wait_minutes: sometimes|integer|min:1
    response:
      type: single
  update:
    method: PUT
    route: /queues/{id}
    description: Update a queue
    validation:
      name: sometimes|string|max:255
      is_active: sometimes|boolean
      avg_wait_minutes: sometimes|integer|min:1
    response:
      type: single
  destroy:
    method: DELETE
    route: /queues/{id}
    description: Delete a queue
    response:
      type: message
      value: Queue deleted
*/

/* @arkzen:api:tickets
model: Ticket
controller: TicketController
prefix: /api/queue-flow
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /tickets
    description: Get all tickets
    response:
      type: collection
  store:
    method: POST
    route: /tickets
    description: Create a new ticket
    validation:
      queue_id: required|integer|exists:queues,id
      customer_name: nullable|string|max:255
    response:
      type: single
  update:
    method: PUT
    route: /tickets/{id}
    description: Update ticket status
    validation:
      status: sometimes|in:waiting,serving,done,skipped
    response:
      type: single
*/

/* @arkzen:handler:join_queue
*/
$queueId      = $request->input('queue_id');
$customerName = $request->input('customer_name', 'Guest');

$queue = \App\Models\Arkzen\QueueFlow\Queue::findOrFail($queueId);

$lastPosition = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
  ->whereIn('status', ['waiting', 'serving'])
  ->max('position') ?? 0;

$ticket = \App\Models\Arkzen\QueueFlow\Ticket::create([
  'queue_id'      => $queueId,
  'ticket_number' => $queue->prefix . '-' . str_pad($lastPosition + 1, 3, '0', STR_PAD_LEFT),
  'customer_name' => $customerName,
  'status'        => 'waiting',
  'position'      => $lastPosition + 1,
]);

$waiting = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
  ->where('status', 'waiting')
  ->where('position', '<', $ticket->position)
  ->count();

try {
  broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([
    'queue_id' => $queueId,
    'action'   => 'joined',
    'ticket'   => $ticket,
  ]))->toOthers();
} catch (\Throwable $e) {
  \Illuminate\Support\Facades\Log::warning('[QueueFlow] broadcast failed: ' . $e->getMessage());
}

return response()->json([
  'ticket'         => $ticket,
  'position'       => $waiting + 1,
  'estimated_wait' => ($waiting) * $queue->avg_wait_minutes,
]);
/* @arkzen:handler:join_queue:end */

/* @arkzen:handler:call_next
*/
$queueId = $request->input('queue_id');

// Mark current serving as done
\App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
  ->where('status', 'serving')
  ->update(['status' => 'done', 'served_at' => now()]);

// Get next waiting ticket
$next = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
  ->where('status', 'waiting')
  ->orderBy('position')
  ->first();

if (!$next) {
  return response()->json(['message' => 'No more tickets in queue', 'ticket' => null]);
}

$next->update(['status' => 'serving', 'called_at' => now()]);

try {
  broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([
    'queue_id' => $queueId,
    'action'   => 'called',
    'ticket'   => $next,
  ]))->toOthers();
} catch (\Throwable $e) {
  \Illuminate\Support\Facades\Log::warning('[QueueFlow] broadcast failed: ' . $e->getMessage());
}

return response()->json(['ticket' => $next]);
/* @arkzen:handler:call_next:end */

/* @arkzen:handler:queue_status
*/
$queueId = $params[0] ?? null;

$queue = \App\Models\Arkzen\QueueFlow\Queue::findOrFail($queueId);

$serving = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
  ->where('status', 'serving')
  ->first();

$waiting = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
  ->where('status', 'waiting')
  ->orderBy('position')
  ->get();

$done_count = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
  ->where('status', 'done')
  ->count();

return response()->json([
  'queue'      => $queue,
  'serving'    => $serving,
  'waiting'    => $waiting,
  'done_count' => $done_count,
  'total_waiting' => $waiting->count(),
]);
/* @arkzen:handler:queue_status:end */

/* @arkzen:handler:my_ticket
*/
$ticketNumber = $params[1] ?? null;
$queueId      = $params[0] ?? null;

$ticket = \App\Models\Arkzen\QueueFlow\Ticket::where('ticket_number', $ticketNumber)
  ->where('queue_id', $queueId)
  ->firstOrFail();

$ahead = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
  ->where('status', 'waiting')
  ->where('position', '<', $ticket->position)
  ->count();

$queue = \App\Models\Arkzen\QueueFlow\Queue::find($queueId);

return response()->json([
  'ticket'         => $ticket,
  'position'       => $ticket->status === 'waiting' ? $ahead + 1 : 0,
  'estimated_wait' => $ahead * ($queue->avg_wait_minutes ?? 5),
  'is_serving'     => $ticket->status === 'serving',
  'is_done'        => $ticket->status === 'done',
]);
/* @arkzen:handler:my_ticket:end */

/* @arkzen:routes
controller: QueueController
middleware: []
routes:
  - method: POST
    route: /api/queue-flow/join
    handler: join_queue
  - method: POST
    route: /api/queue-flow/call-next
    handler: call_next
  - method: GET
    route: /api/queue-flow/status/{queue_id}
    handler: queue_status
  - method: GET
    route: /api/queue-flow/my-ticket/{queue_id}/{ticket_number}
    handler: my_ticket
*/

/* @arkzen:realtime:queue-flow.{queueId}
type: public
*/

/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */

/* @arkzen:web:layout:app */

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Ticket, Settings, WifiOff } from 'lucide-react'

const NAV = [
  { href: '/queue-flow',        icon: LayoutGrid, label: 'Display'  },
  { href: '/queue-flow/join',   icon: Ticket,     label: 'Join'     },
  { href: '/queue-flow/admin',  icon: Settings,   label: 'Admin'    },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router   = useRouter()
  const [online, setOnline] = React.useState(true)

  React.useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    setOnline(navigator.onLine)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(165deg, #e8f2ff 0%, #d0e5ff 18%, #b8d4f8 36%, #a4c5f5 52%, #b0cef7 68%, #c4daff 84%, #daeeff 100%)' }}
    >
      {/* Offline banner */}
      {!online && (
        <div style={{ background: 'rgba(251,191,36,0.12)', borderBottom: '1px solid rgba(251,191,36,0.25)' }} className="px-4 py-2 flex items-center gap-2">
          <WifiOff size={13} style={{ color: '#d97706' }} />
          <span style={{ color: '#d97706' }} className="text-xs font-medium">Offline — data may be outdated</span>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 px-4"
        style={{
          background: 'rgba(255,255,255,0.60)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 -4px 24px rgba(80,130,210,0.10)',
        }}
      >
        <div className="flex items-center justify-around max-w-sm mx-auto h-16">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'rgba(80,130,230,0.15)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  <Icon size={20} style={{ color: active ? '#3a6fd8' : '#8aabcf' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#3a6fd8' : '#8aabcf', letterSpacing: '0.02em' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/* @arkzen:web:layout:app:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { create } from 'zustand'
import {
  Users, Clock, CheckCircle,
  SkipForward, Volume2,
  Loader2, ArrowRight, Pause, Calendar
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

/* @arkzen:web:components:shared:end */

/* @arkzen:web:components:admin */

'use client'

import React, { useCallback } from 'react'
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

/* @arkzen:web:components:admin:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:app */

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

/* @arkzen:web:page:index:end */

/* @arkzen:web:page:join */
/* @arkzen:web:page:layout:app */

const JoinPage = () => {
  const { myTicket, setMyTicket } = useQueueStore()
  const [name, setName] = useState('')
  const [queueId] = useState(1)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'ticket'>('form')

  useEffect(() => {
    const saved = localStorage.getItem('queueflow_ticket')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MyTicketResponse
        // ✅ Only set if ticket exists
        if (parsed && parsed.ticket) {
          setMyTicket(parsed)
          setStep('ticket')
        } else {
          localStorage.removeItem('queueflow_ticket')
        }
      } catch {
        localStorage.removeItem('queueflow_ticket')
      }
    }
  }, [])

  const refreshTicket = useCallback(async (qid: number, tnum: string) => {
    try {
      const res = await arkzenFetch(`/api/queue-flow/my-ticket/${qid}/${tnum}`)
      const data = await res.json() as MyTicketResponse
      if (data && data.ticket) {
        setMyTicket(data)
        localStorage.setItem('queueflow_ticket', JSON.stringify(data))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!myTicket || step !== 'ticket') return
    const t = myTicket.ticket
    if (!t) return
    const interval = setInterval(() => refreshTicket(t.queue_id, t.ticket_number), 5000)
    return () => clearInterval(interval)
  }, [myTicket, step])

  const join = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await arkzenFetch('/api/queue-flow/join', {
        method: 'POST',
        body: JSON.stringify({ queue_id: queueId, customer_name: name }),
      })
      const data = await res.json()
      const ticketData: MyTicketResponse = {
        ticket: data.ticket,
        position: data.position,
        estimated_wait: data.estimated_wait,
        is_serving: false,
        is_done: false,
      }
      setMyTicket(ticketData)
      localStorage.setItem('queueflow_ticket', JSON.stringify(ticketData))
      setStep('ticket')
    } catch {} finally { setLoading(false) }
  }

  const leave = () => {
    setMyTicket(null)
    localStorage.removeItem('queueflow_ticket')
    setStep('form')
    setName('')
  }

  // ✅ Extra safety: only render BigTicketDisplay when ticket exists
  if (step === 'ticket' && myTicket && myTicket.ticket) {
    return (
      <div style={{ maxWidth: 390, margin: '0 auto' }}>
        <div style={{ padding: '32px 20px 0' }}>
          <p style={{ fontSize: 10, color: '#7aaace', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>QueueFlow</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f2050', marginTop: 2, letterSpacing: '-0.5px' }}>Your Ticket</h1>
        </div>
        <BigTicketDisplay data={myTicket} />
        {!myTicket.is_done && !myTicket.is_serving && (
          <div style={{ padding: '0 24px' }}>
            <button onClick={leave} style={{ width: '100%', padding: '14px', borderRadius: 18, background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Leave Queue
            </button>
          </div>
        )}
        {myTicket.is_done && (
          <div style={{ padding: '16px 24px 0' }}>
            <button onClick={leave} style={{ width: '100%', padding: '16px', borderRadius: 18, background: 'linear-gradient(135deg, #4a72d8, #3a5fc8)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(74,114,216,0.30)' }}>
              Done
            </button>
          </div>
        )}
      </div>
    )
  }

  // Join form
  return (
    <div style={{ maxWidth: 390, margin: '0 auto', padding: '48px 24px 32px', display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 10, color: '#7aaace', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>QueueFlow</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f2050', marginTop: 4, letterSpacing: '-0.5px' }}>Join Queue</h1>
        <p style={{ color: '#7a9bc4', fontSize: 14, marginTop: 8 }}>Enter your name to get your ticket</p>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#7a9bc4', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Your Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && join()}
          placeholder="e.g. Maria Santos"
          style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 18, padding: '16px 18px', fontSize: 16, color: '#0f2050', outline: 'none', backdropFilter: 'blur(8px)' }}
        />
      </div>
      <button
        onClick={join}
        disabled={!name.trim() || loading}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px', borderRadius: 18, marginTop: 32, background: 'linear-gradient(135deg, #4a72d8, #3a5fc8)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: !name.trim() || loading ? 'not-allowed' : 'pointer', opacity: !name.trim() || loading ? 0.5 : 1, boxShadow: '0 8px 24px rgba(74,114,216,0.30)', transition: 'all 0.2s' }}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
        Get My Ticket
      </button>
    </div>
  )
}

/* @arkzen:web:page:join:end */

/* @arkzen:web:page:admin */
/* @arkzen:web:page:layout:app */

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

/* @arkzen:web:page:admin:end */

/* @arkzen:web:error:404 */

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(74,114,216,0.20)', marginBottom: 16 }}>404</p>
      <p style={{ color: '#7a9bc4', fontSize: 14 }}>Page not found</p>
    </div>
  </div>
)

/* @arkzen:web:error:404:end */