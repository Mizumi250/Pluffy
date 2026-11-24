'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Bag
// Source: @arkzen:components (pay-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:09.333Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { OrderState, Product } from './types'

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
