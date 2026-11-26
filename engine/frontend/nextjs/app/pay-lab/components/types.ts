// ============================================================
// ARKZEN GENERATED TYPES — pay-lab
// Source: @arkzen:components (pay-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:58.353Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

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
