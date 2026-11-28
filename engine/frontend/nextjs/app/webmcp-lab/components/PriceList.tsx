'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PriceList
// Source: @arkzen:components (webmcp-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:54:12.696Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Draft, Service } from './types'

export const PriceList = ({ onPick }: { onPick: (service: string) => void }) => {
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    fetch('/api/webmcp-lab/services', { headers: { Accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('The prices did not load.'))))
      .then(body => { if (alive) setServices(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []) })
      .catch(reason => { if (alive) setError(reason instanceof Error ? reason.message : 'The prices did not load.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])
  return (
    <section className="wm-panel" aria-labelledby="wm-prices">
      <h2 id="wm-prices">Prices</h2>
      {loading && <p className="wm-muted">Loading prices...</p>}
      {error && <p role="alert" className="wm-err">{error}</p>}
      <ul className="wm-rows">
        {services.map(item => (
          <li key={item.id} className="wm-row">
            <div>
              <p className="wm-name">{item.name}</p>
              <p className="wm-muted wm-small">{item.minutes} min</p>
            </div>
            <p className="wm-price">{'Rp ' + (item.price_idr ?? 0).toLocaleString('id-ID')}</p>
            <button type="button" className="wm-ghost" aria-label={'Choose ' + item.name} onClick={() => onPick(item.name)}>Choose</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
