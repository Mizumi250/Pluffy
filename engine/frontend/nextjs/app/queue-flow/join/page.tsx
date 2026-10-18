'use client'
// ============================================================
// ARKZEN GENERATED PAGE — queue-flow/join
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:15:06.508Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AdminCallButton } from '../components/AdminCallButton'
import { AnnounceBadge } from '../components/AnnounceBadge'
import { BigTicketDisplay } from '../components/BigTicketDisplay'
import { CircularRing } from '../components/CircularRing'
import { NowServingCard } from '../components/NowServingCard'
import { StatPill } from '../components/StatPill'
import { TicketRow } from '../components/TicketRow'
import { useQueueStore } from '../components/hooks'
import type { MyTicketResponse, Queue, QueueStatus, QueueStore, Ticket } from '../components/types'
import { AppLayout } from '@/arkzen/core/layouts/custom/queue-flow-app'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'

// Page component code (from @arkzen:page:join)
const JoinPage = () => {
  const { myTicket, setMyTicket } = useQueueStore()
  const [name, setName] = useState('')
  const [queueId] = useState(1)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'ticket'>('form')

  useEffect(() => {
    const saved = localStorage.getItem('queueflow_ticket')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MyTicketResponse
        if (parsed && parsed.ticket) {
          setMyTicket(parsed)
          setStep('ticket')
        } else {
          localStorage.removeItem('queueflow_ticket')
        }
      } catch {
        localStorage.removeItem('queueflow_ticket')
      }
    }
  }, [])

  const refreshTicket = useCallback(async (qid: number, tnum: string) => {
    try {
      const res = await arkzenFetch(`/api/queue-flow/my-ticket/${qid}/${tnum}`)
      const data = await res.json() as MyTicketResponse
      if (data && data.ticket) {
        setMyTicket(data)
        localStorage.setItem('queueflow_ticket', JSON.stringify(data))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!myTicket || step !== 'ticket') return
    const t = myTicket.ticket
    if (!t) return
    const interval = setInterval(() => refreshTicket(t.queue_id, t.ticket_number), 5000)
    return () => clearInterval(interval)
  }, [myTicket, step])

  const join = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await arkzenFetch('/api/queue-flow/join', {
        method: 'POST',
        body: JSON.stringify({ queue_id: queueId, customer_name: name }),
      })
      const data = await res.json()
      const ticketData: MyTicketResponse = {
        ticket: data.ticket,
        position: data.position,
        estimated_wait: data.estimated_wait,
        is_serving: false,
        is_done: false,
      }
      setMyTicket(ticketData)
      localStorage.setItem('queueflow_ticket', JSON.stringify(ticketData))
      setStep('ticket')
    } catch {} finally { setLoading(false) }
  }

  const leave = () => {
    setMyTicket(null)
    localStorage.removeItem('queueflow_ticket')
    setStep('form')
    setName('')
  }

  if (step === 'ticket' && myTicket && myTicket.ticket) {
    return (
      <div style={{ maxWidth: 390, margin: '0 auto' }}>
        <div style={{ padding: '32px 20px 0' }}>
          <p style={{ fontSize: 10, color: '#7aaace', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>QueueFlow</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f2050', marginTop: 2, letterSpacing: '-0.5px' }}>Your Ticket</h1>
        </div>
        <BigTicketDisplay data={myTicket} />
        {!myTicket.is_done && !myTicket.is_serving && (
          <div style={{ padding: '0 24px' }}>
            <button onClick={leave} style={{ width: '100%', padding: '14px', borderRadius: 18, background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Leave Queue
            </button>
          </div>
        )}
        {myTicket.is_done && (
          <div style={{ padding: '16px 24px 0' }}>
            <button onClick={leave} style={{ width: '100%', padding: '16px', borderRadius: 18, background: 'linear-gradient(135deg, #4a72d8, #3a5fc8)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(74,114,216,0.30)' }}>
              Done
            </button>
          </div>
        )}
      </div>
    )
  }

  // Join form
  return (
    <div style={{ maxWidth: 390, margin: '0 auto', padding: '48px 24px 32px', display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 10, color: '#7aaace', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>QueueFlow</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f2050', marginTop: 4, letterSpacing: '-0.5px' }}>Join Queue</h1>
        <p style={{ color: '#7a9bc4', fontSize: 14, marginTop: 8 }}>Enter your name to get your ticket</p>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#7a9bc4', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Your Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && join()}
          placeholder="e.g. Maria Santos"
          style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 18, padding: '16px 18px', fontSize: 16, color: '#0f2050', outline: 'none', backdropFilter: 'blur(8px)' }}
        />
      </div>
      <button
        onClick={join}
        disabled={!name.trim() || loading}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px', borderRadius: 18, marginTop: 32, background: 'linear-gradient(135deg, #4a72d8, #3a5fc8)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: !name.trim() || loading ? 'not-allowed' : 'pointer', opacity: !name.trim() || loading ? 0.5 : 1, boxShadow: '0 8px 24px rgba(74,114,216,0.30)', transition: 'all 0.2s' }}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
        Get My Ticket
      </button>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_QueueFlow_Join = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <AppLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <JoinPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_QueueFlow_Join
