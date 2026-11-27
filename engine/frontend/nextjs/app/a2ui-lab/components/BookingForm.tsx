'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — BookingForm
// Source: @arkzen:components (a2ui-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:14:27.772Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { API, SLOTS } from './constants'
import { useServices } from './hooks'
import { idr, isoDay } from './utils'
import type { Plan, Props, Service, ShowFn, Ticket } from './types'
import { StubCard } from './StubCard'

export const BookingForm = ({ props }: { props: Props; onShow: ShowFn }) => {
  const { services, loading, error, retry } = useServices()
  const [service, setService] = useState(props?.service ?? '')
  const [day, setDay] = useState(isoDay(1))
  const [slot, setSlot] = useState(SLOTS[0])
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [done, setDone] = useState('')

  useEffect(() => {
    if (services.length > 0 && !services.some(item => item?.name?.toLowerCase() === service.toLowerCase())) setService('')
    else if (services.length > 0) setService(services.find(item => item?.name?.toLowerCase() === service.toLowerCase())?.name ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setProblem('')
    try {
      const res = await fetch(API + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), service, day, slot }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const first = body?.errors ? (Object.values(body.errors) as any[])?.[0]?.[0] : null
        throw new Error(first ?? body?.message ?? 'The booking was not saved.')
      }
      setDone(service + ', ' + day + ' at ' + slot + '. See you, ' + name.trim().split(' ')[0] + '.')
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The booking was not saved.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <StubCard title="Booked">
        <p className="done">{done}</p>
      </StubCard>
    )
  }

  return (
    <StubCard title="Book a service">
      {error && <p role="alert" className="err">{error} <button type="button" className="link" onClick={retry}>Try again</button></p>}
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Service</span>
          <select required value={service} onChange={e => setService(e.target.value)} disabled={loading}>
            <option value="">{loading ? 'Loading...' : 'Choose one'}</option>
            {services.map(item => (
              <option key={item.id} value={item.name}>{item.name} ({idr(item.price_idr)})</option>
            ))}
          </select>
        </label>
        <div className="two">
          <label className="field">
            <span>Day</span>
            <input type="date" required value={day} min={isoDay(0)} onChange={e => setDay(e.target.value)} />
          </label>
          <label className="field">
            <span>Time</span>
            <select value={slot} onChange={e => setSlot(e.target.value)}>
              {SLOTS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Your name</span>
          <input required maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
        </label>
        {problem && <p role="alert" className="err">{problem}</p>}
        <button type="submit" className="primary" disabled={busy || !service || !name.trim()}>
          {busy ? 'Saving...' : 'Book it'}
        </button>
      </form>
    </StubCard>
  )
}
