'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — RepairStatus
// Source: @arkzen:components (a2ui-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:53:34.534Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { API, STEPS } from './constants'
import { listOf } from './utils'
import type { Plan, Props, Service, ShowFn, Ticket } from './types'
import { StubCard } from './StubCard'

export const RepairStatus = ({ props }: { props: Props; onShow: ShowFn }) => {
  const [code, setCode] = useState(props?.code ?? '')
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  const lookup = async (value: string) => {
    const wanted = value.trim().toUpperCase()
    if (!wanted || busy) return
    setBusy(true)
    setProblem('')
    setTicket(null)
    try {
      const res = await fetch(API + '/tickets?code=' + encodeURIComponent(wanted), { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('The lookup failed. Try again in a moment.')
      const found = listOf(await res.json()).find((item: Ticket) => item?.code === wanted) ?? null
      if (!found) setProblem('No ticket with code ' + wanted + '. Codes look like RR-2041.')
      setTicket(found)
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The lookup failed.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (props?.code) lookup(props.code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const at = STEPS.findIndex(step => step.key === ticket?.status)
  return (
    <StubCard title="Repair status">
      <form onSubmit={e => { e.preventDefault(); lookup(code) }} className="inline">
        <label className="field grow">
          <span>Ticket code</span>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="RR-2041" maxLength={12} />
        </label>
        <button type="submit" className="primary" disabled={busy || !code.trim()}>{busy ? 'Looking...' : 'Check'}</button>
      </form>
      {problem && <p role="alert" className="err">{problem}</p>}
      {ticket && (
        <div className="result">
          <p className="row-name">{ticket.bike}</p>
          <ol className="track" aria-label="Repair progress">
            {STEPS.map((step, index) => (
              <li key={step.key} className={index <= at ? 'on' : ''} aria-current={index === at ? 'step' : undefined}>{step.label}</li>
            ))}
          </ol>
          <p>{ticket.note}</p>
          {ticket.ready_by && <p className="muted small">Expected: {ticket.ready_by}</p>}
        </div>
      )}
    </StubCard>
  )
}
