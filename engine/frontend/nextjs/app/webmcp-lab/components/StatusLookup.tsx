'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — StatusLookup
// Source: @arkzen:components (webmcp-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:14:51.583Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Draft, Service } from './types'

export const StatusLookup = () => {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const labels: Record<string, string> = { waiting: 'In the queue', in_progress: 'On the stand', ready: 'Ready', picked_up: 'Picked up' }
  const check = async (event: React.FormEvent) => {
    event.preventDefault()
    const wanted = code.trim().toUpperCase()
    if (!wanted || busy) return
    setBusy(true)
    setProblem('')
    setResult(null)
    try {
      const res = await fetch('/api/webmcp-lab/tickets?code=' + encodeURIComponent(wanted), { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('The lookup failed. Try again in a moment.')
      const body = await res.json()
      const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []
      const found = list.find((t: any) => t?.code === wanted) ?? null
      if (!found) setProblem('No ticket with code ' + wanted + '. Codes look like RR-2041.')
      setResult(found)
    } catch (reason) {
      setProblem(reason instanceof Error ? reason.message : 'The lookup failed.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="wm-panel" aria-labelledby="wm-status">
      <h2 id="wm-status">Check a repair</h2>
      <form onSubmit={check} className="wm-inline">
        <label className="wm-field wm-grow">
          <span>Ticket code</span>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="RR-2041" maxLength={12} />
        </label>
        <button type="submit" className="wm-primary" disabled={busy || !code.trim()}>{busy ? 'Looking...' : 'Check'}</button>
      </form>
      {problem && <p role="alert" className="wm-err">{problem}</p>}
      {result && (
        <p className="wm-result"><strong>{result.bike}</strong>: {labels[result.status] ?? result.status}. {result.note} {result.ready_by ? '(' + result.ready_by + ')' : ''}</p>
      )}
    </section>
  )
}
