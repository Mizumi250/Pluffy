'use client'
// ============================================================
// ARKZEN GENERATED PAGE — pay-lab/thanks
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-25T01:29:34.467Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Bag } from '../components/Bag'
import { PayBar } from '../components/PayBar'
import { ProductBand } from '../components/ProductBand'
import { Stepper } from '../components/Stepper'
import { useOrderStatus } from '../components/hooks'
import type { OrderState, Product } from '../components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:thanks)
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

// Wrapper for animation + layout
const ArkzenPage_PayLab_Thanks = () => {
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
        <ThanksPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_PayLab_Thanks
