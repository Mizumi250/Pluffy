/* @arkzen:meta
name: webmcp-lab
version: 1.0.0
description: Test of WebMCP, where a website tells the browser's own AI agent what it can do. A bicycle workshop desk with a normal booking page that also registers three tools for browser agents. Reading tools answer directly. The booking tool always waits for the customer to confirm on the page.
auth: false
*/

/* @arkzen:meta:web
title: Bengkel Rahayu - Book a service
label: Bengkel Rahayu
description: "Book a bike service, see prices and check a repair. Browser assistants can do the same through tools, but you confirm every booking."
favicon: /tatemonos/webmcp-lab/assets/images/favicon.svg
*/

/* @arkzen:database:services
table: services
timestamps: true
softDeletes: false
columns:
  name:
    type: string
    length: 80
  price_idr:
    type: integer
  minutes:
    type: integer
  note:
    type: string
    length: 160
    nullable: true
seeder:
  count: 5
  data:
    - name: Basic tune-up
      price_idr: 75000
      minutes: 45
      note: Gears, brakes and tire pressure checked
    - name: Chain replacement
      price_idr: 120000
      minutes: 30
      note: Chain only, parts included
    - name: Brake adjustment
      price_idr: 50000
      minutes: 20
      note: Both wheels
    - name: Puncture repair
      price_idr: 25000
      minutes: 15
      note: Tube patch, one wheel
    - name: Full overhaul
      price_idr: 250000
      minutes: 180
      note: Strip down, clean, rebuild
*/

/* @arkzen:database:repair_tickets
table: repair_tickets
timestamps: true
softDeletes: false
columns:
  code:
    type: string
    length: 12
  customer:
    type: string
    length: 80
  bike:
    type: string
    length: 80
  status:
    type: string
    length: 20
    default: waiting
  note:
    type: string
    length: 160
    nullable: true
  ready_by:
    type: string
    length: 40
    nullable: true
seeder:
  count: 4
  data:
    - code: RR-2041
      customer: Haruto Nakamura
      bike: Green commuter, 26 inch
      status: in_progress
      note: Waiting for the new chain to be fitted
      ready_by: Tomorrow, 15:00
    - code: RR-2042
      customer: Dmitri Sokolov
      bike: Black folding bike
      status: ready
      note: Brakes adjusted, ready for pickup
      ready_by: Today
    - code: RR-2043
      customer: Siti Rahmawati
      bike: Red city bike
      status: waiting
      note: In the queue
      ready_by: In 2 days
    - code: RR-2044
      customer: Jonas Keller
      bike: Grey road bike
      status: picked_up
      note: Collected
      ready_by: Done
*/

/* @arkzen:database:bookings
table: bookings
timestamps: true
softDeletes: false
columns:
  name:
    type: string
    length: 80
  service:
    type: string
    length: 80
  day:
    type: string
    length: 10
  slot:
    type: string
    length: 5
*/

/* @arkzen:api:services
model: Service
controller: ServiceController
prefix: /api/webmcp-lab
middleware: []
endpoints:
  index:
    method: GET
    route: /services
    description: List the workshop services and prices
    query:
      per_page: integer|default:50
    response:
      type: collection
*/

/* @arkzen:api:repair_tickets
model: RepairTicket
controller: RepairTicketController
prefix: /api/webmcp-lab
middleware: []
endpoints:
  index:
    method: GET
    route: /tickets
    description: Look up repair tickets, filtered by code
    query:
      code: string
      per_page: integer|default:5
    response:
      type: collection
*/

/* @arkzen:api:bookings
model: Booking
controller: BookingController
prefix: /api/webmcp-lab
middleware: []
endpoints:
  store:
    method: POST
    route: /bookings
    description: Book a workshop slot
    validation:
      name: required|string|max:80
      service: required|string|max:80
      day: required|string|max:10
      slot: required|string|max:5
    response:
      type: single
*/

/* @arkzen:web:components:shared */
'use client'

import React, { useEffect, useRef, useState } from 'react'

export type Service = { id: number; name: string; price_idr: number; minutes: number; note: string | null }
export type Draft = { service: string; day: string; slot: string; name: string }

/*
 * WebMCP registration. Everything is inside this hook on purpose: generated hooks cannot import
 * constants or helpers from this block. The page works exactly the same when no WebMCP API exists.
 * Tools return only public facts. The booking tool never writes until the customer confirms on the page.
 */
export const useWebMcpTools = (
  askConfirm: (draft: Draft, signal?: AbortSignal) => Promise<boolean>,
  onBooked: (draft: Draft) => void,
) => {
  const [count, setCount] = useState(0)
  const confirmRef = useRef(askConfirm)
  const bookedRef = useRef(onBooked)
  confirmRef.current = askConfirm
  bookedRef.current = onBooked

  useEffect(() => {
    const ctx: any = (document as any).modelContext ?? (navigator as any).modelContext
    if (!ctx || typeof ctx.registerTool !== 'function') return
    const controller = new AbortController()
    const API = '/api/webmcp-lab'
    const SLOTS = ['09:00', '11:00', '14:00', '16:00']
    const text = (value: unknown, isError = false) => ({
      content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }],
      ...(isError ? { isError: true } : {}),
    })
    const rows = (body: any): any[] => (Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [])
    const today = () => {
      const d = new Date()
      const p = (n: number) => String(n).padStart(2, '0')
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
    }
    const loadServices = async (): Promise<Service[]> => {
      const res = await fetch(API + '/services', { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('The price list is not available right now.')
      return rows(await res.json())
    }

    const tools = [
      {
        name: 'list_services',
        description: 'List the bike workshop services with price in Indonesian rupiah and duration in minutes.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        async execute() {
          try {
            const services = await loadServices()
            return text(services.map(s => ({ name: s.name, price_idr: s.price_idr, minutes: s.minutes, note: s.note })))
          } catch (reason) {
            return text(reason instanceof Error ? reason.message : 'Could not load services.', true)
          }
        },
      },
      {
        name: 'check_repair_status',
        description: 'Look up a repair ticket by its code, for example RR-2041. Returns the bike, status and expected time. Never returns the customer name.',
        inputSchema: {
          type: 'object',
          properties: { code: { type: 'string', pattern: '^RR-[0-9]{4}$', description: 'Ticket code such as RR-2041' } },
          required: ['code'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        async execute(args: any) {
          const code = typeof args?.code === 'string' ? args.code.trim().toUpperCase() : ''
          if (!/^RR-[0-9]{4}$/.test(code)) return text('The code must look like RR-2041.', true)
          try {
            const res = await fetch(API + '/tickets?code=' + encodeURIComponent(code), { headers: { Accept: 'application/json' } })
            if (!res.ok) return text('The lookup failed. Try again later.', true)
            const found = rows(await res.json()).find((t: any) => t?.code === code)
            if (!found) return text('No ticket with code ' + code + '.', true)
            return text({ code: found.code, bike: found.bike, status: found.status, note: found.note, expected: found.ready_by })
          } catch {
            return text('The lookup failed. Try again later.', true)
          }
        },
      },
      {
        name: 'book_service',
        description: 'Ask to book a workshop slot. The customer sees the details on the page and must confirm before anything is saved. Call list_services first to get valid service names.',
        inputSchema: {
          type: 'object',
          properties: {
            service: { type: 'string', description: 'Exact service name from list_services' },
            day: { type: 'string', pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$', description: 'Date as YYYY-MM-DD, today or later' },
            slot: { type: 'string', enum: SLOTS },
            name: { type: 'string', maxLength: 80, description: 'Customer name' },
          },
          required: ['service', 'day', 'slot', 'name'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        async execute(args: any, extra: any) {
          const signal: AbortSignal | undefined = extra?.signal
          const name = typeof args?.name === 'string' ? args.name.trim() : ''
          const day = typeof args?.day === 'string' ? args.day : ''
          const slot = typeof args?.slot === 'string' ? args.slot : ''
          const wanted = typeof args?.service === 'string' ? args.service.trim().toLowerCase() : ''
          if (!name || name.length > 80) return text('A customer name of 1 to 80 characters is required.', true)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < today()) return text('The day must be YYYY-MM-DD, today or later.', true)
          if (!SLOTS.includes(slot)) return text('The slot must be one of ' + SLOTS.join(', ') + '.', true)
          let service: Service | undefined
          try {
            service = (await loadServices()).find(s => s?.name?.toLowerCase() === wanted)
          } catch (reason) {
            return text(reason instanceof Error ? reason.message : 'Could not load services.', true)
          }
          if (!service) return text('Unknown service. Call list_services for the valid names.', true)
          const draft: Draft = { service: service.name, day, slot, name }
          const approved = await confirmRef.current(draft, signal)
          if (!approved) return text('The customer did not confirm this booking. Nothing was saved.', true)
          try {
            const res = await fetch(API + '/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify(draft),
            })
            if (!res.ok) return text('The booking could not be saved. Nothing was booked.', true)
            bookedRef.current(draft)
            return text('Booked ' + draft.service + ' on ' + draft.day + ' at ' + draft.slot + ' for ' + draft.name + '.')
          } catch {
            return text('The booking could not be saved. Nothing was booked.', true)
          }
        },
      },
    ]

    let registered = 0
    // Register synchronously inside the effect. If registration were deferred, React StrictMode (which runs
    // effect, cleanup, effect) would register after the cleanup already aborted, and the tool would stay forever.
    for (const tool of tools) {
      try {
        Promise.resolve(ctx.registerTool(tool, { signal: controller.signal }))
          .then(() => { registered += 1; if (!controller.signal.aborted) setCount(registered) })
          .catch(() => {})
      } catch {
        // A browser that throws synchronously simply gets no tools. The page keeps working.
      }
    }
    return () => { controller.abort(); setCount(0) }
  }, [])

  return { count }
}

export const ConfirmDialog = ({ draft, onAnswer }: { draft: Draft; onAnswer: (ok: boolean) => void }) => {
  const confirmButton = useRef<HTMLButtonElement>(null)
  useEffect(() => { confirmButton.current?.focus() }, [])
  return (
    <div className="wm-scrim" role="presentation">
      <div className="wm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="wm-confirm-title">
        <h2 id="wm-confirm-title">Confirm this booking?</h2>
        <p className="wm-sub">A browser assistant asked for this. Nothing is saved until you confirm.</p>
        <dl className="wm-facts">
          <div><dt>Service</dt><dd>{draft.service}</dd></div>
          <div><dt>Day</dt><dd>{draft.day}</dd></div>
          <div><dt>Time</dt><dd>{draft.slot}</dd></div>
          <div><dt>Name</dt><dd>{draft.name}</dd></div>
        </dl>
        <div className="wm-actions">
          <button type="button" className="wm-ghost" onClick={() => onAnswer(false)}>Decline</button>
          <button type="button" className="wm-primary" ref={confirmButton} onClick={() => onAnswer(true)}>Confirm booking</button>
        </div>
      </div>
    </div>
  )
}

export const PriceList = ({ onPick }: { onPick: (service: string) => void }) => {
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    fetch('/api/webmcp-lab/services', { headers: { Accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('The prices did not load.'))))
      .then(body => { if (alive) setServices(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []) })
      .catch(reason => { if (alive) setError(reason instanceof Error ? reason.message : 'The prices did not load.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])
  return (
    <section className="wm-panel" aria-labelledby="wm-prices">
      <h2 id="wm-prices">Prices</h2>
      {loading && <p className="wm-muted">Loading prices...</p>}
      {error && <p role="alert" className="wm-err">{error}</p>}
      <ul className="wm-rows">
        {services.map(item => (
          <li key={item.id} className="wm-row">
            <div>
              <p className="wm-name">{item.name}</p>
              <p className="wm-muted wm-small">{item.minutes} min</p>
            </div>
            <p className="wm-price">{'Rp ' + (item.price_idr ?? 0).toLocaleString('id-ID')}</p>
            <button type="button" className="wm-ghost" aria-label={'Choose ' + item.name} onClick={() => onPick(item.name)}>Choose</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export const BookingForm = ({ service, onService, onDone }: { service: string; onService: (value: string) => void; onDone: (message: string) => void }) => {
  const SLOT_LIST = ['09:00', '11:00', '14:00', '16:00']
  const dayOf = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const p = (n: number) => String(n).padStart(2, '0')
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
  }
  const [services, setServices] = useState<Service[]>([])
  const [day, setDay] = useState(dayOf(1))
  const [slot, setSlot] = useState(SLOT_LIST[0])
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  useEffect(() => {
    let alive = true
    fetch('/api/webmcp-lab/services', { headers: { Accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('x'))))
      .then(body => { if (alive) setServices(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setProblem('')
    try {
      const res = await fetch('/api/webmcp-lab/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), service, day, slot }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const first = body?.errors ? (Object.values(body.errors) as any[])?.[0]?.[0] : null
        throw new Error(first ?? body?.message ?? 'The booking was not saved.')
      }
      onDone('Booked ' + service + ' on ' + day + ' at ' + slot + ' for ' + name.trim() + '.')
      setName('')
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The booking was not saved.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="wm-panel" aria-labelledby="wm-book">
      <h2 id="wm-book">Book a service</h2>
      <form onSubmit={submit} className="wm-form">
        <label className="wm-field">
          <span>Service</span>
          <select required value={service} onChange={e => onService(e.target.value)}>
            <option value="">Choose one</option>
            {services.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <div className="wm-two">
          <label className="wm-field">
            <span>Day</span>
            <input type="date" required value={day} min={dayOf(0)} onChange={e => setDay(e.target.value)} />
          </label>
          <label className="wm-field">
            <span>Time</span>
            <select value={slot} onChange={e => setSlot(e.target.value)}>
              {SLOT_LIST.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <label className="wm-field">
          <span>Your name</span>
          <input required maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
        </label>
        {problem && <p role="alert" className="wm-err">{problem}</p>}
        <button type="submit" className="wm-primary" disabled={busy || !service || !name.trim()}>{busy ? 'Saving...' : 'Book it'}</button>
      </form>
    </section>
  )
}

export const StatusLookup = () => {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const labels: Record<string, string> = { waiting: 'In the queue', in_progress: 'On the stand', ready: 'Ready', picked_up: 'Picked up' }
  const check = async (event: React.FormEvent) => {
    event.preventDefault()
    const wanted = code.trim().toUpperCase()
    if (!wanted || busy) return
    setBusy(true)
    setProblem('')
    setResult(null)
    try {
      const res = await fetch('/api/webmcp-lab/tickets?code=' + encodeURIComponent(wanted), { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('The lookup failed. Try again in a moment.')
      const body = await res.json()
      const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []
      const found = list.find((t: any) => t?.code === wanted) ?? null
      if (!found) setProblem('No ticket with code ' + wanted + '. Codes look like RR-2041.')
      setResult(found)
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The lookup failed.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="wm-panel" aria-labelledby="wm-status">
      <h2 id="wm-status">Check a repair</h2>
      <form onSubmit={check} className="wm-inline">
        <label className="wm-field wm-grow">
          <span>Ticket code</span>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="RR-2041" maxLength={12} />
        </label>
        <button type="submit" className="wm-primary" disabled={busy || !code.trim()}>{busy ? 'Looking...' : 'Check'}</button>
      </form>
      {problem && <p role="alert" className="wm-err">{problem}</p>}
      {result && (
        <p className="wm-result"><strong>{result.bike}</strong>: {labels[result.status] ?? result.status}. {result.note} {result.ready_by ? '(' + result.ready_by + ')' : ''}</p>
      )}
    </section>
  )
}
/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Karla:wght@400;600&display=swap');
:root { --wm-bg: #e6eceb; --wm-surface: #f4f7f6; --wm-ink: #13262a; --wm-sub: #53666a; --wm-line: rgba(19, 38, 42, 0.2); --wm-chain: #f0c02f; --wm-ok: #2f7a52; --wm-bad: #a63d36; }
.wm-root { background: var(--wm-bg); color: var(--wm-ink); font-family: 'Karla', sans-serif; font-size: 1rem; line-height: 1.5; min-height: 100vh; }
.wm-root h1, .wm-root h2, .wm-root .wm-name { font-family: 'Bricolage Grotesque', sans-serif; }
.wm-root :focus-visible { outline: 3px solid var(--wm-chain); outline-offset: 2px; }
.wm-panel { background: var(--wm-surface); border: 1.5px solid var(--wm-ink); border-radius: 6px; padding: 1rem; display: grid; gap: 0.8rem; align-content: start; }
.wm-panel h2 { font-size: 1.1rem; font-weight: 700; padding-bottom: 0.5rem; border-bottom: 2px dashed var(--wm-line); }
.wm-rows { list-style: none; padding: 0; margin: 0; display: grid; }
.wm-row { display: grid; grid-template-columns: 1fr auto auto; gap: 0.75rem; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--wm-line); }
.wm-row:last-child { border-bottom: 0; }
.wm-name { font-weight: 700; }
.wm-price { font-weight: 600; white-space: nowrap; }
.wm-muted { color: var(--wm-sub); }
.wm-small { font-size: 0.875rem; }
.wm-field { display: grid; gap: 0.25rem; font-weight: 600; font-size: 0.9rem; }
.wm-field input, .wm-field select { border: 1.5px solid var(--wm-ink); border-radius: 4px; background: var(--wm-surface); padding: 0.6rem 0.7rem; font: inherit; color: var(--wm-ink); min-height: 2.75rem; }
.wm-form { display: grid; gap: 0.8rem; }
.wm-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.wm-inline { display: flex; gap: 0.6rem; align-items: end; }
.wm-grow { flex: 1; }
.wm-primary { background: var(--wm-ink); color: var(--wm-surface); border-radius: 4px; padding: 0.6rem 1.1rem; min-height: 2.75rem; font-weight: 600; }
.wm-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.wm-ghost { border: 1.5px solid var(--wm-ink); border-radius: 4px; padding: 0.35rem 0.8rem; min-height: 2.25rem; font-weight: 600; background: transparent; }
.wm-ghost:hover { background: var(--wm-chain); }
.wm-err { color: var(--wm-bad); font-weight: 600; }
.wm-notice { color: var(--wm-ok); font-weight: 600; }
.wm-result { padding-top: 0.2rem; }
.wm-scrim { position: fixed; inset: 0; background: rgba(19, 38, 42, 0.55); display: grid; place-items: center; padding: 1rem; z-index: 50; }
.wm-dialog { background: var(--wm-surface); border: 1.5px solid var(--wm-ink); border-radius: 6px; padding: 1.2rem; max-width: 26rem; width: 100%; display: grid; gap: 0.8rem; }
.wm-dialog h2 { font-size: 1.2rem; font-weight: 700; }
.wm-sub { color: var(--wm-sub); }
.wm-facts { display: grid; gap: 0.3rem; margin: 0; }
.wm-facts div { display: grid; grid-template-columns: 5rem 1fr; gap: 0.5rem; }
.wm-facts dt { color: var(--wm-sub); font-weight: 600; }
.wm-facts dd { margin: 0; font-weight: 600; overflow-wrap: anywhere; }
.wm-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }
@media (max-width: 30rem) { .wm-two { grid-template-columns: 1fr; } .wm-actions { flex-direction: column-reverse; } }
/* @arkzen:web:style:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
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
/* @arkzen:web:page:index:end */
