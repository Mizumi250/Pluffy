/* @arkzen:meta
name: pay-lab
version: 1.0.0
description: Test of a payment gateway done as custom code, not as a DSL block. A coffee roaster shop where the server works out the price, the customer pays on the provider's hosted page, and a signed webhook marks the order paid.
auth: false
*/

/* @arkzen:meta:web
title: Kopi Tiga - Three coffees, roasted every Monday
label: Kopi Tiga
description: "Three coffees from Indonesia. Pick your bags, then pay on the secure payment page."
favicon: /tatemonos/pay-lab/assets/images/favicon.svg
*/

/* @arkzen:database:products
table: products
timestamps: true
softDeletes: false
columns:
  slug:
    type: string
    length: 40
    unique: true
  name:
    type: string
    length: 60
  region:
    type: string
    length: 60
  notes:
    type: string
    length: 160
  roast:
    type: integer
  price_cents:
    type: integer
  accent:
    type: string
    length: 7
  ink:
    type: string
    length: 7
seeder:
  count: 3
  data:
    - slug: flores-bajawa
      name: Flores Bajawa
      region: Flores, East Nusa Tenggara
      notes: Orange peel, brown sugar and a clean finish
      roast: 2
      price_cents: 1800
      accent: "#f4c430"
      ink: "#15171c"
    - slug: gayo-aceh
      name: Gayo Aceh
      region: Gayo highlands, Aceh
      notes: Cocoa nib, cedar and very low acidity
      roast: 3
      price_cents: 1600
      accent: "#f08a7e"
      ink: "#15171c"
    - slug: toraja-sapan
      name: Toraja Sapan
      region: Sapan, South Sulawesi
      notes: Dark plum, tobacco leaf and a long finish
      roast: 5
      price_cents: 2100
      accent: "#0f5c63"
      ink: "#f4f5f2"
*/

/* @arkzen:database:orders
table: orders
timestamps: true
softDeletes: false
columns:
  public_id:
    type: string
    length: 64
    unique: true
  status:
    type: string
    length: 12
    default: pending
  total_cents:
    type: integer
  currency:
    type: string
    length: 3
  idempotency_key:
    type: string
    length: 64
    nullable: true
    unique: true
  fingerprint:
    type: string
    length: 400
  provider_session_id:
    type: string
    length: 80
    nullable: true
  checkout_url:
    type: string
    length: 400
    nullable: true
*/

/* @arkzen:database:order_items
table: order_items
timestamps: true
softDeletes: false
columns:
  order_id:
    type: integer
  product_slug:
    type: string
    length: 40
  name:
    type: string
    length: 60
  unit_cents:
    type: integer
  quantity:
    type: integer
*/

/* @arkzen:database:webhook_events
table: webhook_events
timestamps: true
softDeletes: false
columns:
  event_id:
    type: string
    length: 80
    unique: true
  type:
    type: string
    length: 60
  order_public_id:
    type: string
    length: 64
    nullable: true
*/

/* @arkzen:api:products
model: Product
controller: ProductController
prefix: /api/pay-lab
middleware: []
endpoints:
  index:
    method: GET
    route: /products
    description: List the coffees for sale
    query:
      per_page: integer|default:20
    response:
      type: collection
*/

/* @arkzen:api:orders
model: Order
controller: OrderController
prefix: /api/pay-lab
middleware: []
endpoints:
  checkout:
    method: POST
    route: /checkout
    description: Create an order from slugs and quantities, work out the price on the server and open the provider's hosted payment page
    response:
      type: single
  status:
    method: GET
    route: /status
    description: Read the state of one order by its unguessable reference
    query:
      o: string
    response:
      type: single
  webhook:
    method: POST
    route: /webhook
    description: Receive signed payment events from the provider
    response:
      type: single
*/

/* @arkzen:endpoint:py:checkout
*/
import asyncio
import json
import re
import secrets
import urllib.error
import urllib.parse
import urllib.request


def fail(message, status):
    return response.json({'message': message}, status)


provider_url = (env('PAY_PROVIDER_URL') or '').rstrip('/')
secret_key = env('PAY_SECRET_KEY')
app_url = (env('PAY_APP_URL', 'http://localhost:3000') or '').rstrip('/')
if not provider_url or not secret_key:
    return fail('Payments are not set up yet.', 503)
parsed = urllib.parse.urlsplit(provider_url)
loopback = parsed.hostname in ('localhost', '127.0.0.1', '::1')
if not parsed.hostname or parsed.username or parsed.password or (parsed.scheme != 'https' and not (parsed.scheme == 'http' and loopback)):
    return fail('Payments are not set up yet.', 503)
allowed_hosts = {parsed.hostname}
for host in (env('PAY_CHECKOUT_HOSTS') or '').split(','):
    if host.strip():
        allowed_hosts.add(host.strip().lower())

key = request.header('idempotency-key') or ''
if not re.fullmatch(r'[A-Za-z0-9_-]{8,64}', key):
    return fail('Missing or invalid Idempotency-Key.', 400)

# The browser only sends which coffees and how many. It never sends a price.
raw_items = request.input('items')
if not isinstance(raw_items, list) or not 1 <= len(raw_items) <= 10:
    return fail('Choose at least one bag.', 422)
wanted = {}
for entry in raw_items:
    if not isinstance(entry, dict):
        return fail('Those items are not valid.', 422)
    slug = entry.get('slug')
    qty = entry.get('qty')
    if not isinstance(slug, str) or not re.fullmatch(r'[a-z0-9-]{1,40}', slug):
        return fail('Those items are not valid.', 422)
    if isinstance(qty, bool) or not isinstance(qty, int) or qty < 1 or qty > 10:
        return fail('You can order 1 to 10 bags of each coffee.', 422)
    wanted[slug] = wanted.get(slug, 0) + qty
    if wanted[slug] > 10:
        return fail('You can order 1 to 10 bags of each coffee.', 422)

rows = await Product.where_in('slug', list(wanted.keys())).get()
if len(rows) != len(wanted):
    return fail('One of those coffees is no longer available.', 422)
lines = []
total = 0
for row in rows:
    qty = wanted[row.slug]
    lines.append({'slug': row.slug, 'name': row.name, 'unit': int(row.price_cents), 'qty': qty})
    total += int(row.price_cents) * qty
if total < 100 or total > 100000:
    return fail('That order total is not allowed.', 422)
fingerprint = '|'.join(sorted(l['slug'] + ':' + str(l['qty']) for l in lines))

# Same key and same cart returns the same payment page. Same key and a different cart is refused.
existing = await Order.where('idempotency_key', key).first()
if existing:
    if existing.fingerprint != fingerprint:
        return fail('This checkout was already used for a different cart.', 409)
    if existing.status == 'pending' and existing.checkout_url:
        return response.json({'checkout_url': existing.checkout_url, 'order': existing.public_id})
    return fail('This order is already finished.', 409)

public_id = secrets.token_urlsafe(24)
order = await Order.create({
    'public_id': public_id,
    'status': 'pending',
    'total_cents': total,
    'currency': 'usd',
    'idempotency_key': key,
    'fingerprint': fingerprint,
})
for line in lines:
    await OrderItem.create({
        'order_id': order.id,
        'product_slug': line['slug'],
        'name': line['name'],
        'unit_cents': line['unit'],
        'quantity': line['qty'],
    })

payload = json.dumps({
    'client_reference_id': public_id,
    'currency': 'usd',
    'amount_total': total,
    'success_url': app_url + '/pay-lab/thanks?o=' + public_id,
    'cancel_url': app_url + '/pay-lab?cancelled=1',
    'line_items': [{'name': l['name'], 'unit_amount': l['unit'], 'quantity': l['qty']} for l in lines],
}).encode('utf-8')


def _create_session():
    req = urllib.request.Request(
        provider_url + '/v1/checkout/sessions',
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + secret_key,
            'Idempotency-Key': 'order-' + public_id,
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=15) as result:
        return json.loads(result.read().decode('utf-8'))


try:
    loop = asyncio.get_running_loop()
    session = await loop.run_in_executor(None, _create_session)
    session_id = session.get('id')
    url = session.get('url')
    link = urllib.parse.urlsplit(url) if isinstance(url, str) else None
    good = (
        isinstance(session_id, str) and 0 < len(session_id) <= 80
        and link is not None and (link.hostname or '').lower() in allowed_hosts
        and (link.scheme == 'https' or (link.scheme == 'http' and loopback))
    )
    if not good:
        raise ValueError('unexpected session')
except Exception:
    await Order.where('id', order.id).update({'status': 'failed'})
    return fail('The payment page could not be opened. Try again in a moment.', 502)

await Order.where('id', order.id).update({'provider_session_id': session_id, 'checkout_url': url})
return response.json({'checkout_url': url, 'order': public_id}, 201)
/* @arkzen:endpoint:py:checkout:end */

/* @arkzen:endpoint:py:status
*/
import re

ref = request.input('o') or ''
if not isinstance(ref, str) or not re.fullmatch(r'[A-Za-z0-9_-]{20,64}', ref):
    return response.json({'message': 'Not found'}, 404)
order = await Order.where('public_id', ref).first()
if not order:
    return response.json({'message': 'Not found'}, 404)
items = await OrderItem.where('order_id', order.id).get()
return response.json({
    'ref': ref[:8],
    'status': order.status,
    'total_cents': order.total_cents,
    'currency': order.currency,
    'items': [{'name': i.name, 'quantity': i.quantity, 'unit_cents': i.unit_cents} for i in items],
})
/* @arkzen:endpoint:py:status:end */

/* @arkzen:endpoint:py:webhook
*/
import hashlib
import hmac
import json
import time

secret = env('PAY_WEBHOOK_SECRET')
if not secret:
    return response.json({'message': 'Webhooks are not set up.'}, 503)

# Read the exact bytes the provider signed. Never re-encode the parsed JSON before checking.
raw = await request.raw.body()
if len(raw) > 65536:
    return response.json({'message': 'Too large.'}, 413)

header = request.header('x-pay-signature') or ''
parts = {}
for piece in header.split(','):
    name, _, value = piece.strip().partition('=')
    if name and value:
        parts.setdefault(name, []).append(value)
stamp = (parts.get('t') or [''])[0]
bad = response.json({'message': 'Invalid signature.'}, 400)
if not stamp.isdigit() or abs(time.time() - int(stamp)) > 300:
    return bad
expected = hmac.new(secret.encode('utf-8'), stamp.encode('utf-8') + b'.' + raw, hashlib.sha256).hexdigest().encode('utf-8')
if not any(hmac.compare_digest(expected, candidate.encode('utf-8', 'ignore')) for candidate in parts.get('v1', [])):
    return bad

try:
    event = json.loads(raw.decode('utf-8'))
    event_id = event['id']
    event_type = event['type']
    data = event['data']
    if not isinstance(event_id, str) or not isinstance(event_type, str) or not isinstance(data, dict):
        raise ValueError('shape')
except Exception:
    return response.json({'message': 'Invalid event.'}, 400)
event_id = event_id[:80]

if await WebhookEvent.where('event_id', event_id).first():
    return response.json({'received': True, 'duplicate': True})

session_id = data.get('session_id')
reference = data.get('client_reference_id')
order = None
if isinstance(session_id, str) and isinstance(reference, str):
    order = await Order.where('provider_session_id', session_id).first()
    # Both ids must point at the same order, or the event is ignored.
    if order and order.public_id != reference:
        order = None

if order and event_type == 'checkout.session.completed':
    try:
        amount_ok = int(data.get('amount_total', -1)) == int(order.total_cents)
    except (TypeError, ValueError):
        amount_ok = False
    currency_ok = str(data.get('currency', '')).lower() == order.currency
    if data.get('payment_status') != 'paid':
        pass  # still processing at the provider, keep waiting
    elif not (amount_ok and currency_ok):
        # Money does not match what we asked for. Never mark it paid.
        await Order.where('id', order.id).where('status', 'pending').update({'status': 'review'})
    else:
        # Only the first writer can move pending to paid, so repeats and races are harmless.
        moved = await Order.where('id', order.id).where('status', 'pending').update({'status': 'paid'})
        if not moved:
            await Order.where('id', order.id).where('status', 'failed').update({'status': 'review'})
elif order and event_type == 'checkout.session.expired':
    await Order.where('id', order.id).where('status', 'pending').update({'status': 'failed'})

try:
    await WebhookEvent.create({'event_id': event_id, 'type': event_type[:60], 'order_public_id': order.public_id if order else None})
except Exception:
    pass  # a parallel delivery already recorded it
return response.json({'received': True})
/* @arkzen:endpoint:py:webhook:end */

/* @arkzen:web:components:shared */
'use client'

import React, { useEffect, useState } from 'react'

export type Product = {
  id: number
  slug: string
  name: string
  region: string
  notes: string
  roast: number
  price_cents: number
  accent: string
  ink: string
}

export type OrderState = {
  phase: 'loading' | 'ready' | 'missing'
  order: { ref: string; status: string; total_cents: number; items: { name: string; quantity: number; unit_cents: number }[] } | null
  waited: boolean
}

/* Cart lives in this hook. It is self-contained because generated hooks cannot import helpers from this block. */
export const useCart = (products: Product[]) => {
  const [qty, setQty] = useState<Record<string, number>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ready || products.length === 0) return
    try {
      const saved = JSON.parse(window.localStorage.getItem('kopi-tiga-cart') ?? '{}')
      const next: Record<string, number> = {}
      for (const item of products) {
        const n = Number(saved?.[item.slug])
        if (Number.isInteger(n) && n > 0 && n <= 10) next[item.slug] = n
      }
      setQty(next)
    } catch {
      // storage can be blocked, the cart simply starts empty
    }
    setReady(true)
  }, [products, ready])

  useEffect(() => {
    if (!ready) return
    try { window.localStorage.setItem('kopi-tiga-cart', JSON.stringify(qty)) } catch { /* ignore */ }
  }, [qty, ready])

  const set = (slug: string, n: number) =>
    setQty(current => {
      const next = { ...current }
      const value = Math.max(0, Math.min(10, Math.round(n)))
      if (value === 0) delete next[slug]
      else next[slug] = value
      return next
    })

  const lines = products.filter(item => (qty[item.slug] ?? 0) > 0).map(item => ({ product: item, qty: qty[item.slug] }))
  const count = lines.reduce((sum, line) => sum + line.qty, 0)
  const total = lines.reduce((sum, line) => sum + line.product.price_cents * line.qty, 0)
  return { qty, set, lines, count, total }
}

/* Polls one order until the webhook has moved it out of "pending", then stops. */
export const useOrderStatus = (ref: string): OrderState => {
  const [state, setState] = useState<OrderState>({ phase: 'loading', order: null, waited: false })
  useEffect(() => {
    if (!ref) { setState({ phase: 'missing', order: null, waited: false }); return }
    let alive = true
    let tries = 0
    let timer: number | undefined
    const tick = async () => {
      tries += 1
      try {
        const res = await fetch('/api/pay-lab/status?o=' + encodeURIComponent(ref), { headers: { Accept: 'application/json' } })
        if (!alive) return
        if (res.status === 404) { setState({ phase: 'missing', order: null, waited: false }); return }
        if (!res.ok) throw new Error('status')
        const body = await res.json()
        if (!alive) return
        setState({ phase: 'ready', order: body, waited: tries >= 20 })
        if (body?.status === 'pending' && tries < 20) timer = window.setTimeout(tick, 1500)
      } catch {
        if (alive && tries < 20) timer = window.setTimeout(tick, 3000)
      }
    }
    tick()
    return () => { alive = false; if (timer) window.clearTimeout(timer) }
  }, [ref])
  return state
}

export const Bag = ({ body, label, roast }: { body: string; label: string; roast: number }) => (
  <svg viewBox="0 0 160 200" role="img" aria-label={'Coffee bag, roast ' + roast + ' of 5'} className="kt-bag">
    <path d="M30 28h100l12 158c.6 7-4 12-11 12H29c-7 0-11.600-5-11-12z" fill={body} />
    <path d="M30 28h100l-2 20H32z" fill={label} opacity="0.3" />
    <rect x="36" y="76" width="88" height="64" rx="3" fill={label} />
    {[0, 1, 2, 3, 4].map(i => (
      <circle key={i} cx={52 + i * 14} cy={166} r="4.5" fill={i < roast ? label : 'none'} stroke={label} strokeWidth="1.6" />
    ))}
  </svg>
)

export const Stepper = ({ name, value, onChange }: { name: string; value: number; onChange: (next: number) => void }) => {
  if (value === 0) {
    return (
      <button type="button" className="kt-add" onClick={() => onChange(1)} aria-label={'Add ' + name}>Add a bag</button>
    )
  }
  return (
    <div className="kt-stepper" role="group" aria-label={name + ' quantity'}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label={'Remove one ' + name}>-</button>
      <output aria-live="polite" key={value} className="kt-qty">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= 10} aria-label={'Add one more ' + name}>+</button>
    </div>
  )
}

export const ProductBand = ({ item, qty, onChange }: { item: Product; qty: number; onChange: (next: number) => void }) => {
  const money = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  return (
    <section className="kt-band" style={{ ['--band' as any]: item.accent, ['--on' as any]: item.ink }} aria-labelledby={'kt-' + item.slug}>
      <div className="kt-band-text">
        <h2 id={'kt-' + item.slug} className="kt-name">{item.name}</h2>
        <p className="kt-region">{item.region}, roast {item.roast} of 5</p>
        <p className="kt-notes">{item.notes}</p>
        <div className="kt-buy">
          <p className="kt-price">{money(item.price_cents)}<span> for 250 g</span></p>
          <Stepper name={item.name} value={qty} onChange={onChange} />
        </div>
      </div>
      <div className="kt-band-art" aria-hidden={false}>
        <Bag body={item.ink} label={item.accent} roast={item.roast} />
      </div>
    </section>
  )
}

export const PayBar = ({ count, total, busy, error, onPay }: { count: number; total: number; busy: boolean; error: string; onPay: () => void }) => {
  const money = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  return (
    <div className={'kt-bar' + (count > 0 ? ' kt-bar-on' : '')} aria-hidden={count === 0}>
      <div className="kt-bar-inner">
        <p className="kt-bar-sum">
          <strong>{count} {count === 1 ? 'bag' : 'bags'}</strong>
          <span>{money(total)}</span>
        </p>
        {error && <p role="alert" className="kt-bar-err">{error}</p>}
        <button type="button" className="kt-pay" onClick={onPay} disabled={busy || count === 0} tabIndex={count === 0 ? -1 : 0}>
          {busy ? 'Opening payment page...' : 'Pay ' + money(total)}
        </button>
      </div>
    </div>
  )
}
/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
@import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;700&display=swap');
:root { --kt-paper: #eef0f3; --kt-ink: #15171c; --kt-sub: #4d5360; --kt-sun: #f4c430; --kt-bad: #a63d36; }
.kt-root { background: var(--kt-paper); color: var(--kt-ink); font-family: 'Familjen Grotesk', system-ui, sans-serif; font-size: 1.0625rem; line-height: 1.5; min-height: 100vh; }
.kt-root :focus-visible { outline: 3px solid var(--kt-ink); outline-offset: 3px; }
.kt-head { display: flex; justify-content: space-between; align-items: baseline; padding: 1.25rem clamp(1rem, 4vw, 3rem); }
.kt-logo { font-weight: 700; font-size: 1.25rem; letter-spacing: -0.01em; }
.kt-hero { padding: clamp(2rem, 7vw, 5rem) clamp(1rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem); max-width: 70rem; }
.kt-h1, .kt-done h1 { text-wrap: balance; }
.kt-h1 { font-weight: 700; font-size: clamp(2.6rem, 9vw, 6.5rem); line-height: 0.95; letter-spacing: -0.035em; max-width: 14ch; }
.kt-lede { margin-top: 1.25rem; font-size: 1.1875rem; color: var(--kt-sub); max-width: 34rem; }
.kt-notice { margin: 0 clamp(1rem, 4vw, 3rem) 1.5rem; font-weight: 500; }
.kt-band { background: var(--band); color: var(--on); display: grid; gap: 1.5rem; padding: clamp(1.5rem, 5vw, 3.5rem) clamp(1rem, 4vw, 3rem); }
.kt-band :focus-visible { outline-color: var(--on); }
.kt-band-text { display: grid; align-content: space-between; gap: 1.25rem; min-width: 0; }
.kt-name { font-weight: 700; font-size: clamp(2.2rem, 7vw, 5rem); line-height: 0.98; letter-spacing: -0.03em; overflow-wrap: anywhere; }
.kt-region { font-weight: 500; opacity: 0.85; }
.kt-notes { font-size: 1.1875rem; max-width: 26rem; }
.kt-buy { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.75rem; }
.kt-price { font-size: 1.75rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.kt-price span { font-size: 1rem; font-weight: 400; opacity: 0.85; margin-left: 0.4rem; }
.kt-band-art { display: grid; place-items: center; }
.kt-bag { width: clamp(9rem, 26vw, 15rem); height: auto; transform: rotate(-5deg); }
.kt-add { background: var(--on); color: var(--band); font-weight: 700; padding: 0 1.5rem; min-height: 3rem; border-radius: 0.5rem; transition: transform 0.15s; }
.kt-add:active { transform: scale(0.97); }
.kt-stepper { display: inline-flex; align-items: center; border: 2px solid var(--on); border-radius: 0.5rem; }
.kt-stepper button { width: 3rem; height: 3rem; font-size: 1.5rem; font-weight: 500; }
.kt-stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
.kt-qty { min-width: 2.5rem; text-align: center; font-weight: 700; font-size: 1.25rem; font-variant-numeric: tabular-nums; animation: kt-pop 0.18s ease-out; }
@keyframes kt-pop { from { transform: translateY(-6px); opacity: 0.2; } to { transform: translateY(0); opacity: 1; } }
.kt-skel { min-height: 20rem; background: #dde0e6; }
.kt-foot { padding: 2rem clamp(1rem, 4vw, 3rem) 3rem; color: var(--kt-sub); max-width: 40rem; }
.kt-room { padding-bottom: 7rem; }
.kt-bar { position: fixed; left: 0; right: 0; bottom: 0; background: var(--kt-ink); color: #f4f5f2; transform: translateY(105%); visibility: hidden; transition: transform 0.3s ease-out, visibility 0s linear 0.3s; z-index: 20; }
.kt-bar-on { transform: translateY(0); visibility: visible; transition: transform 0.3s ease-out, visibility 0s; }
.kt-bar-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.5rem; padding: 0.9rem clamp(1rem, 4vw, 3rem); max-width: 80rem; margin: 0 auto; }
.kt-bar-sum { display: flex; gap: 1rem; align-items: baseline; font-variant-numeric: tabular-nums; }
.kt-bar-sum span { opacity: 0.8; }
.kt-bar-err { flex-basis: 100%; color: #ffb4a8; font-weight: 500; order: 3; }
.kt-pay { background: var(--kt-sun); color: var(--kt-ink); font-weight: 700; min-height: 3rem; padding: 0 1.75rem; border-radius: 0.5rem; }
.kt-pay:disabled { opacity: 0.6; cursor: progress; }
.kt-bar :focus-visible { outline-color: var(--kt-sun); }
.kt-done { padding: clamp(2rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem); max-width: 44rem; }
.kt-done h1 { font-weight: 700; font-size: clamp(2.4rem, 8vw, 5rem); line-height: 0.98; letter-spacing: -0.03em; }
.kt-done p { margin-top: 1rem; color: var(--kt-sub); }
.kt-lines { list-style: none; padding: 0; margin: 2rem 0 0; border-top: 2px solid var(--kt-ink); }
.kt-lines li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.7rem 0; border-bottom: 1px solid rgba(21, 23, 28, 0.2); font-variant-numeric: tabular-nums; }
.kt-lines .kt-total { font-weight: 700; border-bottom: 0; }
.kt-link { display: inline-block; margin-top: 2rem; background: var(--kt-ink); color: #f4f5f2; padding: 0.8rem 1.4rem; border-radius: 0.5rem; font-weight: 700; }
.kt-wait { height: 6px; background: rgba(21, 23, 28, 0.15); margin-top: 1.5rem; overflow: hidden; border-radius: 3px; }
.kt-wait::after { content: ''; display: block; height: 100%; width: 35%; background: var(--kt-ink); animation: kt-slide 1.3s ease-in-out infinite; }
@keyframes kt-slide { from { transform: translateX(-100%); } to { transform: translateX(290%); } }
@media (max-width: 51.99rem) { .kt-band-art { order: -1; justify-items: start; } .kt-bag { width: 5.5rem; } .kt-band { gap: 1rem; } }
@media (min-width: 52rem) { .kt-band { grid-template-columns: 1.4fr 1fr; align-items: stretch; min-height: 26rem; } }
@media (prefers-reduced-motion: reduce) { .kt-bar, .kt-bar-on { transition: none; } .kt-qty, .kt-wait::after { animation: none; } .kt-add { transition: none; } }
/* @arkzen:web:style:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [cancelled, setCancelled] = useState(false)
  const attempt = React.useRef<{ fingerprint: string; key: string } | null>(null)
  const cart = useCart(products)

  useEffect(() => {
    let alive = true
    fetch('/api/pay-lab/products', { headers: { Accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('The coffees did not load.'))))
      .then(body => { if (alive) setProducts(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []) })
      .catch(reason => { if (alive) setLoadError(reason instanceof Error ? reason.message : 'The coffees did not load.') })
      .finally(() => { if (alive) setLoading(false) })
    setCancelled(new URLSearchParams(window.location.search).get('cancelled') === '1')
    // Coming back with the browser Back button from the payment page must not leave the button stuck.
    const reset = () => setBusy(false)
    window.addEventListener('pageshow', reset)
    return () => { alive = false; window.removeEventListener('pageshow', reset) }
  }, [])

  const pay = async () => {
    if (busy || cart.count === 0) return
    setBusy(true)
    setProblem('')
    // The same cart reuses one key, so a double click or a retry cannot create two orders.
    const fingerprint = cart.lines.map(line => line.product.slug + ':' + line.qty).sort().join('|')
    if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
      const random = (window.crypto as Crypto | undefined)?.randomUUID?.() ?? String(Date.now()) + Math.random().toString(36).slice(2)
      attempt.current = { fingerprint, key: 'kt-' + random }
    }
    try {
      const res = await fetch('/api/pay-lab/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Idempotency-Key': attempt.current.key },
        body: JSON.stringify({ items: cart.lines.map(line => ({ slug: line.product.slug, qty: line.qty })) }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || typeof body?.checkout_url !== 'string') {
        attempt.current = null
        throw new Error(body?.message ?? 'The payment page could not be opened. Try again.')
      }
      window.location.assign(body.checkout_url)
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The payment page could not be opened. Try again.')
      setBusy(false)
    }
  }

  return (
    <main className={'kt-root' + (cart.count > 0 ? ' kt-room' : '')}>
      <header className="kt-head">
        <p className="kt-logo">Kopi Tiga</p>
      </header>
      <section className="kt-hero">
        <h1 className="kt-h1">Three coffees, roasted every Monday.</h1>
        <p className="kt-lede">Choose your bags below. You pay on the next screen, on our payment provider's secure page.</p>
      </section>
      {cancelled && <p className="kt-notice" role="status">Payment cancelled. Your bags are still here.</p>}
      {loadError && <p className="kt-notice kt-err" role="alert">{loadError}</p>}
      {loading && [0, 1, 2].map(i => <div key={i} className="kt-skel" aria-hidden="true" style={{ marginBottom: 0 }} />)}
      {products.map(item => (
        <ProductBand key={item.slug} item={item} qty={cart.qty[item.slug] ?? 0} onChange={next => cart.set(item.slug, next)} />
      ))}
      <footer className="kt-foot">
        <p>We never see your card. Payment happens on the provider's page and we only hear back whether it worked.</p>
      </footer>
      <PayBar count={cart.count} total={cart.total} busy={busy} error={problem} onPay={pay} />
    </main>
  )
}
/* @arkzen:web:page:index:end */

/* @arkzen:web:page:thanks */
/* @arkzen:web:page:layout:guest */
const ThanksPage = () => {
  const ref = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('o') ?? ''
  const state = useOrderStatus(ref)
  const money = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const order = state.order
  const status = order?.status ?? ''

  let title = 'Checking your payment'
  let note = 'This usually takes a few seconds.'
  if (state.phase === 'missing') { title = 'We could not find that order'; note = 'Check the link you were sent, or start again from the shop.' }
  else if (status === 'paid') { title = 'Paid. Thank you.'; note = 'Your order reference is ' + order?.ref + '. Keep it if you need to contact us.' }
  else if (status === 'failed') { title = 'The payment did not go through'; note = 'You have not been charged for this order. Your bags are still in the shop.' }
  else if (status === 'review') { title = 'We could not confirm this payment'; note = 'Contact us with the reference ' + order?.ref + ' and we will sort it out.' }
  else if (state.waited) { title = 'Still waiting for confirmation'; note = 'This is taking longer than usual. Reload this page in a minute. If you paid, the order will update here.' }
  else if (status === 'pending') { title = 'Waiting for the payment provider'; note = 'Do not pay again. This page updates by itself.' }

  return (
    <main className="kt-root">
      <header className="kt-head"><p className="kt-logo">Kopi Tiga</p></header>
      <section className="kt-done" aria-live="polite">
        <h1>{title}</h1>
        <p>{note}</p>
        {state.phase === 'loading' || (status === 'pending' && !state.waited) ? <div className="kt-wait" aria-hidden="true" /> : null}
        {status === 'paid' && order && (
          <ul className="kt-lines">
            {order.items.map(line => (
              <li key={line.name}><span>{line.quantity} x {line.name}</span><span>{money(line.unit_cents * line.quantity)}</span></li>
            ))}
            <li className="kt-total"><span>Total</span><span>{money(order.total_cents)}</span></li>
          </ul>
        )}
        {state.phase !== 'loading' && status !== 'pending' && <a className="kt-link" href="/pay-lab">Back to the shop</a>}
      </section>
    </main>
  )
}
/* @arkzen:web:page:thanks:end */
