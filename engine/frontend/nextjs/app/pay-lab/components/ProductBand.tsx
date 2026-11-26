'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ProductBand
// Source: @arkzen:components (pay-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:51.757Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { OrderState, Product } from './types'
import { Bag } from './Bag'
import { Stepper } from './Stepper'

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
