'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Stepper
// Source: @arkzen:components (pay-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:58.359Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { OrderState, Product } from './types'

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
