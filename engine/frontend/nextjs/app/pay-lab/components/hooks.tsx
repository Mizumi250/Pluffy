'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — pay-lab
// Source: @arkzen:components (pay-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:51.745Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { OrderState, Product } from './types'

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
