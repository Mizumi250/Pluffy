/* @arkzen:meta
name: a2ui-lab
version: 1.0.0
description: Test of the "agent drops the interface" pattern. A bicycle workshop assistant that can only show three registered screens (booking form, price list, repair status) and falls back to plain words plus starter choices when nothing fits.
auth: false
*/

/* @arkzen:meta:web
title: Bengkel Rahayu - Bike workshop counter
label: Bengkel Rahayu
description: "Tell the workshop what your bike needs and get the right small screen: book a service, see prices, check a repair."
favicon: /tatemonos/a2ui-lab/assets/images/favicon.svg
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

/* @arkzen:database:unmet_requests
table: unmet_requests
timestamps: true
softDeletes: false
columns:
  message:
    type: string
    length: 500
  source:
    type: string
    length: 10
*/

/* @arkzen:api:services
model: Service
controller: ServiceController
prefix: /api/a2ui-lab
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
prefix: /api/a2ui-lab
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
prefix: /api/a2ui-lab
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

/* @arkzen:api:unmet_requests
model: UnmetRequest
controller: AssistantController
prefix: /api/a2ui-lab
middleware: []
endpoints:
  plan:
    method: POST
    route: /plan
    description: Pick one registered screen for the visitor's message, or none
    validation:
      message: required|string|max:500
    response:
      type: single
*/

/* @arkzen:endpoint:py:plan
*/
import asyncio
import ipaddress
import json
import re
import urllib.parse
import urllib.error
import urllib.request

validated = await request.validate({'message': 'required|string|max:500'})
text = validated['message'].strip()

MENU = {
    'booking_form': {
        'allowed': ['service'],
        'use': 'Book a workshop slot. Use when the visitor wants to book, schedule or reserve. Optional prop "service": one of Basic tune-up, Chain replacement, Brake adjustment, Puncture repair, Full overhaul, only if they named it.',
    },
    'price_list': {
        'allowed': [],
        'use': 'Show the service price list. Use when the visitor asks about price, cost or how much.',
    },
    'repair_status': {
        'allowed': ['code'],
        'use': 'Look up a repair ticket. Use when the visitor asks whether their bike is ready or about a repair. Optional prop "code" like RR-2041, only if they gave it.',
    },
}
SUGGESTIONS = ['Book a service', 'How much is a tune-up?', 'Is my bike ready?']
SERVICE_WORDS = [
    (r'tune', 'Basic tune-up'),
    (r'chain', 'Chain replacement'),
    (r'brake', 'Brake adjustment'),
    (r'puncture|flat|tire|tyre', 'Puncture repair'),
    (r'overhaul|full', 'Full overhaul'),
]
SAY = {
    'booking_form': 'Pick a service and a time.',
    'price_list': 'Here are the current prices.',
    'repair_status': 'Enter your ticket code and I will look it up.',
    'none': 'I can only help with booking, prices and repair status here. Pick one of these.',
}

def rule_plan(message):
    low = message.lower()
    found = re.search(r'\brr-\d{4}\b', low)
    if found:
        return 'repair_status', {'code': found.group(0).upper()}
    if re.search(r'\b(ready|status|ticket|picked up|pick up|collect)\b', low):
        return 'repair_status', {}
    if re.search(r'\b(book|booking|schedule|appointment|reserve|slot)\b', low):
        props = {}
        for pattern, name in SERVICE_WORDS:
            if re.search(pattern, low):
                props['service'] = name
                break
        return 'booking_form', props
    if re.search(r'\b(price|prices|cost|costs|how much|rate|rates|fee)\b', low):
        return 'price_list', {}
    return 'none', {}

def clean_plan(component, props, say):
    if component not in MENU:
        return 'none', {}, SAY['none']
    allowed = MENU[component]['allowed']
    safe = {}
    if isinstance(props, dict):
        for key in allowed:
            value = props.get(key)
            if isinstance(value, str) and value.strip():
                safe[key] = value.strip()[:60]
    if not isinstance(say, str) or not say.strip():
        say = SAY[component]
    return component, safe, say.strip()[:160]

client_ip = request.ip()
try:
    is_local_client = client_ip is not None and ipaddress.ip_address(client_ip).is_loopback
except ValueError:
    is_local_client = False

api_key = env('PLUFF_AI_API_KEY')
base_url = (env('PLUFF_AI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/') or '').rstrip('/')
model = env('PLUFF_AI_MODEL', 'gemini-3.6-flash')
parsed_url = urllib.parse.urlsplit(base_url)
url_ok = (
    parsed_url.scheme in ('https', 'http') and bool(parsed_url.hostname)
    and not parsed_url.username and not parsed_url.password and not parsed_url.query and not parsed_url.fragment
    and (parsed_url.scheme == 'https' or parsed_url.hostname in ('localhost', '127.0.0.1', '::1'))
)

source = 'rules'
component, props = rule_plan(text)
say = SAY[component]
if component == 'repair_status' and props.get('code'):
    say = 'Looking up ' + props['code'] + '.'

if api_key and is_local_client and url_ok:
    system = (
        'You choose ONE screen for a bicycle workshop assistant. Reply with JSON only, no markdown: '
        '{"component": "<name or none>", "props": {}, "say": "<one short plain sentence>"}. '
        'Use "none" when no screen fits. Never invent component names. Screens: '
        + json.dumps({name: item['use'] for name, item in MENU.items()})
    )
    payload = json.dumps({
        'model': model,
        'stream': False,
        'messages': [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': text},
        ],
    }).encode('utf-8')

    def _ask_model():
        req = urllib.request.Request(
            base_url + '/chat/completions',
            data=payload,
            headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=20) as result:
            return json.loads(result.read().decode('utf-8'))

    try:
        loop = asyncio.get_running_loop()
        answer = await loop.run_in_executor(None, _ask_model)
        raw = (((answer.get('choices') or [{}])[0]).get('message') or {}).get('content') or ''
        start, end = raw.find('{'), raw.rfind('}')
        decoded = json.loads(raw[start:end + 1])
        component, props, say = clean_plan(decoded.get('component'), decoded.get('props'), decoded.get('say'))
        source = 'model'
    except Exception:
        source = 'rules'

if component == 'none':
    await UnmetRequest.create({'message': text, 'source': source})

return response.json({
    'component': component,
    'props': props,
    'say': say,
    'suggestions': SUGGESTIONS if component == 'none' else [],
    'source': source,
})
/* @arkzen:endpoint:py:plan:end */

/* @arkzen:web:components:shared */
'use client'

import React, { useEffect, useState } from 'react'

type Props = Record<string, string>
type Plan = { component: string; props: Props; say: string; suggestions: string[] }
type ShowFn = (plan: Plan) => void
type Service = { id: number; name: string; price_idr: number; minutes: number; note: string | null }
type Ticket = { code: string; customer: string; bike: string; status: string; note: string | null; ready_by: string | null }

const API = '/api/a2ui-lab'
const SLOTS = ['09:00', '11:00', '14:00', '16:00']
const STEPS = [
  { key: 'waiting', label: 'In the queue' },
  { key: 'in_progress', label: 'On the stand' },
  { key: 'ready', label: 'Ready' },
  { key: 'picked_up', label: 'Picked up' },
]

const idr = (value: number) => 'Rp ' + (value ?? 0).toLocaleString('id-ID')
const listOf = (body: any): any[] => (Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [])
const isoDay = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const p = (n: number) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
}

const StubCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="stub slide-in">
    <h2 className="stub-head">{title}</h2>
    <div className="stub-body">{children}</div>
  </section>
)

const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetch('/api/a2ui-lab/services', { headers: { Accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('The price list did not load.'))))
      .then(body => { if (alive) setServices(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []) })
      .catch(reason => { if (alive) setError(reason instanceof Error ? reason.message : 'The price list did not load.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [tick])
  return { services, loading, error, retry: () => setTick(value => value + 1) }
}

const PriceList = ({ onShow }: { props: Props; onShow: ShowFn }) => {
  const { services, loading, error, retry } = useServices()
  return (
    <StubCard title="Price list">
      {loading && <p className="muted">Loading prices...</p>}
      {error && (
        <p role="alert" className="err">{error} <button type="button" className="link" onClick={retry}>Try again</button></p>
      )}
      <ul className="rows">
        {services.map(item => (
          <li key={item.id} className="row">
            <div>
              <p className="row-name">{item?.name}</p>
              <p className="muted small">{item?.minutes} min{item?.note ? ', ' + item.note : ''}</p>
            </div>
            <p className="price">{idr(item?.price_idr)}</p>
            <button
              type="button"
              className="ghost"
              aria-label={'Book ' + item?.name}
              onClick={() => onShow({ component: 'booking_form', props: { service: item?.name ?? '' }, say: 'Pick a day for ' + item?.name + '.', suggestions: [] })}
            >
              Book
            </button>
          </li>
        ))}
      </ul>
    </StubCard>
  )
}

const BookingForm = ({ props }: { props: Props; onShow: ShowFn }) => {
  const { services, loading, error, retry } = useServices()
  const [service, setService] = useState(props?.service ?? '')
  const [day, setDay] = useState(isoDay(1))
  const [slot, setSlot] = useState(SLOTS[0])
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [done, setDone] = useState('')

  useEffect(() => {
    if (services.length > 0 && !services.some(item => item?.name?.toLowerCase() === service.toLowerCase())) setService('')
    else if (services.length > 0) setService(services.find(item => item?.name?.toLowerCase() === service.toLowerCase())?.name ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setProblem('')
    try {
      const res = await fetch(API + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), service, day, slot }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const first = body?.errors ? (Object.values(body.errors) as any[])?.[0]?.[0] : null
        throw new Error(first ?? body?.message ?? 'The booking was not saved.')
      }
      setDone(service + ', ' + day + ' at ' + slot + '. See you, ' + name.trim().split(' ')[0] + '.')
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The booking was not saved.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <StubCard title="Booked">
        <p className="done">{done}</p>
      </StubCard>
    )
  }

  return (
    <StubCard title="Book a service">
      {error && <p role="alert" className="err">{error} <button type="button" className="link" onClick={retry}>Try again</button></p>}
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Service</span>
          <select required value={service} onChange={e => setService(e.target.value)} disabled={loading}>
            <option value="">{loading ? 'Loading...' : 'Choose one'}</option>
            {services.map(item => (
              <option key={item.id} value={item.name}>{item.name} ({idr(item.price_idr)})</option>
            ))}
          </select>
        </label>
        <div className="two">
          <label className="field">
            <span>Day</span>
            <input type="date" required value={day} min={isoDay(0)} onChange={e => setDay(e.target.value)} />
          </label>
          <label className="field">
            <span>Time</span>
            <select value={slot} onChange={e => setSlot(e.target.value)}>
              {SLOTS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Your name</span>
          <input required maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
        </label>
        {problem && <p role="alert" className="err">{problem}</p>}
        <button type="submit" className="primary" disabled={busy || !service || !name.trim()}>
          {busy ? 'Saving...' : 'Book it'}
        </button>
      </form>
    </StubCard>
  )
}

const RepairStatus = ({ props }: { props: Props; onShow: ShowFn }) => {
  const [code, setCode] = useState(props?.code ?? '')
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  const lookup = async (value: string) => {
    const wanted = value.trim().toUpperCase()
    if (!wanted || busy) return
    setBusy(true)
    setProblem('')
    setTicket(null)
    try {
      const res = await fetch(API + '/tickets?code=' + encodeURIComponent(wanted), { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('The lookup failed. Try again in a moment.')
      const found = listOf(await res.json()).find((item: Ticket) => item?.code === wanted) ?? null
      if (!found) setProblem('No ticket with code ' + wanted + '. Codes look like RR-2041.')
      setTicket(found)
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The lookup failed.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (props?.code) lookup(props.code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const at = STEPS.findIndex(step => step.key === ticket?.status)
  return (
    <StubCard title="Repair status">
      <form onSubmit={e => { e.preventDefault(); lookup(code) }} className="inline">
        <label className="field grow">
          <span>Ticket code</span>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="RR-2041" maxLength={12} />
        </label>
        <button type="submit" className="primary" disabled={busy || !code.trim()}>{busy ? 'Looking...' : 'Check'}</button>
      </form>
      {problem && <p role="alert" className="err">{problem}</p>}
      {ticket && (
        <div className="result">
          <p className="row-name">{ticket.bike}</p>
          <ol className="track" aria-label="Repair progress">
            {STEPS.map((step, index) => (
              <li key={step.key} className={index <= at ? 'on' : ''} aria-current={index === at ? 'step' : undefined}>{step.label}</li>
            ))}
          </ol>
          <p>{ticket.note}</p>
          {ticket.ready_by && <p className="muted small">Expected: {ticket.ready_by}</p>}
        </div>
      )}
    </StubCard>
  )
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Karla:wght@400;600&display=swap');
:root {
  --bg: #e6eceb; --surface: #f4f7f6; --ink: #13262a; --sub: #53666a; --line: rgba(19, 38, 42, 0.2);
  --chain: #f0c02f; --ok: #2f7a52; --bad: #a63d36;
}
.a2-root { background: var(--bg); color: var(--ink); font-family: 'Karla', sans-serif; font-size: 1rem; line-height: 1.5; }
.a2-root h1, .a2-root h2, .a2-root .row-name { font-family: 'Bricolage Grotesque', sans-serif; }
.a2-root :focus-visible { outline: 3px solid var(--chain); outline-offset: 2px; }
.stub { background: var(--surface); border: 1.5px solid var(--ink); border-radius: 6px; max-width: 34rem; position: relative; }
.stub::before, .stub::after { content: ''; position: absolute; top: 2.55rem; width: 0.9rem; height: 0.9rem; border-radius: 50%; background: var(--bg); border: 1.5px solid var(--ink); }
.stub::before { left: -0.5rem; clip-path: inset(0 0 0 50%); }
.stub::after { right: -0.5rem; clip-path: inset(0 50% 0 0); }
.stub-head { font-size: 1.05rem; font-weight: 700; padding: 0.7rem 1rem 0.6rem; border-bottom: 2px dashed var(--line); }
.stub-body { padding: 1rem; display: grid; gap: 0.8rem; }
.rows { display: grid; gap: 0.1rem; list-style: none; padding: 0; margin: 0; }
.row { display: grid; grid-template-columns: 1fr auto auto; gap: 0.75rem; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--line); }
.row:last-child { border-bottom: 0; }
.row-name { font-weight: 700; }
.price { font-weight: 600; white-space: nowrap; }
.muted { color: var(--sub); }
.small { font-size: 0.875rem; }
.field { display: grid; gap: 0.25rem; font-weight: 600; font-size: 0.9rem; }
.field input, .field select, .composer input { border: 1.5px solid var(--ink); border-radius: 4px; background: var(--surface); padding: 0.6rem 0.7rem; font: inherit; color: var(--ink); min-height: 2.75rem; }
.form { display: grid; gap: 0.8rem; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.inline { display: flex; gap: 0.6rem; align-items: end; }
.grow { flex: 1; }
.primary { background: var(--ink); color: var(--surface); border-radius: 4px; padding: 0.6rem 1.1rem; min-height: 2.75rem; font-weight: 600; }
.primary:disabled { opacity: 0.45; cursor: not-allowed; }
.ghost { border: 1.5px solid var(--ink); border-radius: 4px; padding: 0.35rem 0.8rem; min-height: 2.25rem; font-weight: 600; background: transparent; }
.ghost:hover { background: var(--chain); }
.link { text-decoration: underline; font-weight: 600; }
.err { color: var(--bad); font-weight: 600; }
.done { font-weight: 600; color: var(--ok); }
.track { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem; list-style: none; padding: 0; margin: 0.5rem 0; font-size: 0.8rem; }
.track li { border-top: 5px solid var(--line); padding-top: 0.3rem; color: var(--sub); }
.track li.on { border-top-color: var(--ink); color: var(--ink); font-weight: 600; }
.track li[aria-current='step'] { border-top-color: var(--chain); }
.chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.chip { border: 1.5px solid var(--ink); border-radius: 999px; padding: 0.45rem 0.9rem; min-height: 2.5rem; background: var(--surface); font-weight: 600; }
.chip:hover { background: var(--chain); }
.bubble-user { margin-left: auto; max-width: 85%; background: var(--ink); color: var(--surface); border-radius: 14px 14px 2px 14px; padding: 0.55rem 0.9rem; }
.composer { display: flex; gap: 0.6rem; }
.composer input { flex: 1; min-width: 0; }
.slide-in { animation: a2-slide 0.28s ease-out both; }
@keyframes a2-slide { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) { .slide-in { animation: none; } }
@media (max-width: 30rem) { .row { grid-template-columns: 1fr auto; } .row > div { grid-column: 1; } .row .price { grid-column: 1; grid-row: 2; } .row .ghost { grid-column: 2; grid-row: 1 / span 2; align-self: center; } .two { grid-template-columns: 1fr; } }
/* @arkzen:web:style:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
/* The registry is the whole menu. A name that is not here can never be drawn. */
const REGISTRY: Record<string, { Component: React.ComponentType<{ props: Props; onShow: ShowFn }>; allowed: string[] }> = {
  booking_form: { Component: BookingForm, allowed: ['service'] },
  price_list: { Component: PriceList, allowed: [] },
  repair_status: { Component: RepairStatus, allowed: ['code'] },
}

const FALLBACK_SAY = 'I can only help with booking, prices and repair status here. Pick one of these.'
const STARTERS = ['Book a service', 'How much is a tune-up?', 'Is my bike ready?']

const acceptPlan = (raw: any): Plan => {
  const name = typeof raw?.component === 'string' ? raw.component : 'none'
  const entry = REGISTRY[name]
  const suggestions: string[] = Array.isArray(raw?.suggestions) ? raw.suggestions.filter((s: any) => typeof s === 'string').slice(0, 4) : []
  const say = typeof raw?.say === 'string' && raw.say.trim() ? raw.say.trim().slice(0, 160) : ''
  if (!entry) return { component: 'none', props: {}, say: FALLBACK_SAY, suggestions: suggestions.length ? suggestions : STARTERS }
  const props: Props = {}
  for (const key of entry.allowed) {
    const value = raw?.props?.[key]
    if (typeof value === 'string' && value.trim()) props[key] = value.trim().slice(0, 60)
  }
  return { component: name, props, say, suggestions: [] }
}

type Message = { id: number; role: 'user' | 'assistant'; text: string; component?: string; props?: Props; suggestions?: string[] }

const IndexPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bottom = React.useRef<HTMLDivElement>(null)

  useEffect(() => { bottom.current?.scrollIntoView?.({ block: 'end' }) }, [messages, busy])

  const push = (items: Omit<Message, 'id'>[]) =>
    setMessages(current => [...current, ...items.map((item, i) => ({ ...item, id: current.length + i + 1 }))])

  const show: ShowFn = plan => {
    const clean = acceptPlan(plan)
    push([{ role: 'assistant', text: clean.say, component: clean.component === 'none' ? undefined : clean.component, props: clean.props, suggestions: clean.suggestions }])
  }

  const ask = async (value: string) => {
    const message = value.trim()
    if (!message || busy) return
    setText('')
    setError('')
    push([{ role: 'user', text: message }])
    setBusy(true)
    try {
      const res = await fetch(API + '/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.message ?? 'The counter is not answering. Try again.')
      show(body)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The counter is not answering. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="a2-root flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-4 pt-6">
        <header>
          <h1 className="text-xl font-bold">Bengkel Rahayu</h1>
        </header>

        <div className="flex-1 space-y-4 py-5" role="log" aria-live="polite">
          {messages.length === 0 && (
            <div className="space-y-4 pt-6">
              <p className="text-2xl font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What does your bike need?</p>
              <div className="chips">
                {STARTERS.map(item => (
                  <button key={item} type="button" className="chip" onClick={() => ask(item)}>{item}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map(message => {
            const entry = message.component ? REGISTRY[message.component] : undefined
            if (message.role === 'user') return <p key={message.id} className="bubble-user">{message.text}</p>
            return (
              <div key={message.id} className="space-y-3">
                {message.text && <p>{message.text}</p>}
                {entry && <entry.Component props={message.props ?? {}} onShow={show} />}
                {(message.suggestions?.length ?? 0) > 0 && (
                  <div className="chips">
                    {message.suggestions?.map(item => (
                      <button key={item} type="button" className="chip" onClick={() => ask(item)}>{item}</button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {busy && <p className="muted">One moment...</p>}
          {error && <p role="alert" className="err">{error}</p>}
          <div ref={bottom} />
        </div>

        <form className="composer" onSubmit={e => { e.preventDefault(); ask(text) }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={500}
            aria-label="Tell the workshop what you need"
            placeholder="Book a tune-up, check RR-2041..."
          />
          <button type="submit" className="primary" disabled={busy || !text.trim()}>Send</button>
        </form>
      </div>
    </main>
  )
}
/* @arkzen:web:page:index:end */
