'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PayBar
// Source: @arkzen:components (pay-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:04:37.111Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { OrderState, Product } from './types'

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
