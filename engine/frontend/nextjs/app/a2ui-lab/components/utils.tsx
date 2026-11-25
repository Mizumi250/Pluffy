// ============================================================
// ARKZEN GENERATED UTILITIES — a2ui-lab
// Source: @arkzen:components (a2ui-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-25T01:29:03.282Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Plan, Props, Service, ShowFn, Ticket } from './types'


export const idr = (value: number) => 'Rp ' + (value ?? 0).toLocaleString('id-ID')

export const listOf = (body: any): any[] => (Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [])

export const isoDay = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const p = (n: number) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
}
