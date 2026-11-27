'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — BookingForm
// Source: @arkzen:components (webmcp-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T06:52:00.346Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Draft, Service } from './types'

export const BookingForm = ({ service, onService, onDone }: { service: string; onService: (value: string) => void; onDone: (message: string) => void }) => {
  const SLOT_LIST = ['09:00', '11:00', '14:00', '16:00']
  const dayOf = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const p = (n: number) => String(n).padStart(2, '0')
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
  }
  const [services, setServices] = useState<Service[]>([])
  const [day, setDay] = useState(dayOf(1))
  const [slot, setSlot] = useState(SLOT_LIST[0])
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  useEffect(() => {
    let alive = true
    fetch('/api/webmcp-lab/services', { headers: { Accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('x'))))
      .then(body => { if (alive) setServices(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setProblem('')
    try {
      const res = await fetch('/api/webmcp-lab/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), service, day, slot }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const first = body?.errors ? (Object.values(body.errors) as any[])?.[0]?.[0] : null
        throw new Error(first ?? body?.message ?? 'The booking was not saved.')
      }
      onDone('Booked ' + service + ' on ' + day + ' at ' + slot + ' for ' + name.trim() + '.')
      setName('')
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The booking was not saved.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="wm-panel" aria-labelledby="wm-book">
      <h2 id="wm-book">Book a service</h2>
      <form onSubmit={submit} className="wm-form">
        <label className="wm-field">
          <span>Service</span>
          <select required value={service} onChange={e => onService(e.target.value)}>
            <option value="">Choose one</option>
            {services.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <div className="wm-two">
          <label className="wm-field">
            <span>Day</span>
            <input type="date" required value={day} min={dayOf(0)} onChange={e => setDay(e.target.value)} />
          </label>
          <label className="wm-field">
            <span>Time</span>
            <select value={slot} onChange={e => setSlot(e.target.value)}>
              {SLOT_LIST.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <label className="wm-field">
          <span>Your name</span>
          <input required maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
        </label>
        {problem && <p role="alert" className="wm-err">{problem}</p>}
        <button type="submit" className="wm-primary" disabled={busy || !service || !name.trim()}>{busy ? 'Saving...' : 'Book it'}</button>
      </form>
    </section>
  )
}
