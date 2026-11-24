'use client'
// ============================================================
// ARKZEN GENERATED PAGE — pay-lab/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:09.378Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Bag } from './components/Bag'
import { PayBar } from './components/PayBar'
import { ProductBand } from './components/ProductBand'
import { Stepper } from './components/Stepper'
import { useCart } from './components/hooks'
import type { OrderState, Product } from './components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
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

// Wrapper for animation + layout
const ArkzenPage_PayLab_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_PayLab_Index
