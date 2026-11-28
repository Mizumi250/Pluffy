'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — a2ui-lab
// Source: @arkzen:components (a2ui-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:53:34.518Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Plan, Props, Service, ShowFn, Ticket } from './types'

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetch('/api/a2ui-lab/services', { headers: { Accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('The price list did not load.'))))
      .then(body => { if (alive) setServices(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []) })
      .catch(reason => { if (alive) setError(reason instanceof Error ? reason.message : 'The price list did not load.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [tick])
  return { services, loading, error, retry: () => setTick(value => value + 1) }
}
