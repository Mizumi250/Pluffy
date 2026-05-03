/* @arkzen:meta
name: queue-flow
version: 1.0.0
label: QueueFlow
auth: false
description: Real-time queue management system with PWA support
*/

/* @arkzen:config
toast:
  position: top-right
  duration: 3000
pwa:
  name: QueueFlow
  short_name: Queue
  theme_color: "#0f0f1a"
  background_color: "#0f0f1a"
  display: standalone
  icons:
    - { src: /tatemonos/queue-flow/assets/images/icon-192.png, sizes: 192x192, type: image/png }
    - { src: /tatemonos/queue-flow/assets/images/icon-512.png, sizes: 512x512, type: image/png }
    - { src: /tatemonos/queue-flow/assets/images/icon-mask.png, sizes: 512x512, type: image/png, purpose: maskable }
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
    foreign: queues.id
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

/* @arkzen:endpoint:join_queue
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

broadcast(new \App\Events\Arkzen\QueueFlow\QueueUpdated([
  'queue_id' => $queueId,
  'action'   => 'joined',
  'ticket'   => $ticket,
]))->toOthers();

return response()->json([
  'ticket'         => $ticket,
  'position'       => $waiting + 1,
  'estimated_wait' => ($waiting) * $queue->avg_wait_minutes,
]);
/* @arkzen:endpoint:join_queue:end */

/* @arkzen:endpoint:call_next
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

broadcast(new \App\Events\Arkzen\QueueFlow\QueueUpdated([
  'queue_id' => $queueId,
  'action'   => 'called',
  'ticket'   => $next,
]))->toOthers();

return response()->json(['ticket' => $next]);
/* @arkzen:endpoint:call_next:end */

/* @arkzen:endpoint:queue_status
*/
$queueId = $request->route('queue_id');

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
/* @arkzen:endpoint:queue_status:end */

/* @arkzen:endpoint:my_ticket
*/
$ticketNumber = $request->route('ticket_number');
$queueId      = $request->route('queue_id');

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
/* @arkzen:endpoint:my_ticket:end */

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
event: QueueUpdated
*/

/* @arkzen:events:queue-updated
model: Ticket
payload: [queue_id, action, ticket]
*/

/* @arkzen:layout:app */

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Ticket, Settings, Wifi, WifiOff } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">
      {/* Offline banner */}
      {!online && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2">
          <WifiOff size={13} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">Offline — data may be outdated</span>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 pb-safe">
        <div className="flex items-center justify-around max-w-sm mx-auto h-16">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              >
                <Icon
                  size={20}
                  className={active ? 'text-violet-400' : 'text-white/30'}
                />
                <span className={`text-[10px] font-medium ${active ? 'text-violet-400' : 'text-white/30'}`}>
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

/* @arkzen:layout:app:end */

/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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

/* @arkzen:components:shared:end */

/* @arkzen:components:admin */

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

/* @arkzen:components:admin:end */

/* @arkzen:page:index */
/* @arkzen:page:layout:app */

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

      // Auto-announce when serving changes
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

  // Show loading indicator if status is not yet loaded
  if (!status) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-4 max-w-sm mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/30 font-medium tracking-widest uppercase">QueueFlow</p>
          <h1 className="text-2xl font-black text-white mt-0.5">Live Display</h1>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Now serving */}
      <NowServingCard
        ticket={status.serving ?? null}
        queueName={status.queue?.name ?? 'General'}
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon={Users} label="Waiting" value={status.total_waiting ?? 0} color="violet" />
        <StatPill icon={CheckCircle} label="Served" value={status.done_count ?? 0} color="emerald" />
        <StatPill icon={Clock} label="Avg Wait" value={fmtWait(status.queue?.avg_wait_minutes ?? 5)} color="amber" />
      </div>

      {/* Waiting list */}
      {status.waiting?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 font-semibold tracking-widest uppercase px-1">Up Next</p>
          {status.waiting.slice(0, 6).map((t, i) => (
            <TicketRow key={t.id} ticket={t} position={i + 1} />
          ))}
          {status.waiting.length > 6 && (
            <p className="text-center text-xs text-white/20 py-2">
              +{status.waiting.length - 6} more in queue
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* @arkzen:page:index:end */

/* @arkzen:page:join */
/* @arkzen:page:layout:app */

const JoinPage = () => {
  const { myTicket, setMyTicket } = useQueueStore()
  const [name, setName] = useState('')
  const [queueId] = useState(1)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'ticket'>('form')

  useEffect(() => {
    // Restore saved ticket from localStorage
    const saved = localStorage.getItem('queueflow_ticket')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MyTicketResponse
        setMyTicket(parsed)
        setStep('ticket')
      } catch {}
    }
  }, [])

  const refreshTicket = useCallback(async (qid: number, tnum: string) => {
    try {
      const res = await arkzenFetch(`/api/queue-flow/my-ticket/${qid}/${tnum}`)
      const data = await res.json() as MyTicketResponse
      setMyTicket(data)
      localStorage.setItem('queueflow_ticket', JSON.stringify(data))
    } catch {}
  }, [])

  useEffect(() => {
    if (!myTicket || step !== 'ticket') return
    const t = myTicket.ticket
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

  if (step === 'ticket' && myTicket) {
    return (
      <div className="max-w-sm mx-auto">
        <div className="px-4 pt-8">
          <p className="text-xs text-white/30 font-medium tracking-widest uppercase">QueueFlow</p>
          <h1 className="text-2xl font-black text-white mt-0.5">Your Ticket</h1>
        </div>
        <BigTicketDisplay data={myTicket} />
        {!myTicket.is_done && !myTicket.is_serving && (
          <div className="px-6">
            <button
              onClick={leave}
              className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400 text-sm font-semibold
                hover:bg-red-500/10 active:scale-95 transition-all"
            >
              Leave Queue
            </button>
          </div>
        )}
        {(myTicket.is_done) && (
          <div className="px-6 mt-4">
            <button
              onClick={leave}
              className="w-full py-3 rounded-2xl bg-violet-600 text-white text-sm font-semibold
                hover:bg-violet-500 active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-6 pt-12 pb-8 flex flex-col min-h-[80vh]">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-white/30 font-medium tracking-widest uppercase">QueueFlow</p>
        <h1 className="text-3xl font-black text-white mt-1">Join Queue</h1>
        <p className="text-white/40 text-sm mt-2">Enter your name to get your ticket</p>
      </div>

      {/* Form */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2 block">
            Your Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && join()}
            placeholder="e.g. Maria Santos"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-4
              text-white placeholder-white/20 text-base focus:outline-none focus:border-violet-500/40
              focus:bg-white/[0.06] transition-all"
          />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={join}
        disabled={!name.trim() || loading}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl mt-8
          bg-violet-600 hover:bg-violet-500 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all font-bold text-white text-base"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
        Get My Ticket
      </button>
    </div>
  )
}

/* @arkzen:page:join:end */

/* @arkzen:page:admin */
/* @arkzen:page:layout:app */

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

/* @arkzen:page:admin:end */

/* @arkzen:error:404 */

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-6">
    <div className="text-center">
      <p className="text-6xl font-black text-violet-500/20 mb-4">404</p>
      <p className="text-white/40 text-sm">Page not found</p>
    </div>
  </div>
)

/* @arkzen:error:404:end */