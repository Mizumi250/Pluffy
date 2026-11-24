'use client'
// ============================================================
// ARKZEN GENERATED PAGE — a2ui-lab/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T07:19:15.117Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BookingForm } from './components/BookingForm'
import { PriceList } from './components/PriceList'
import { RepairStatus } from './components/RepairStatus'
import { StubCard } from './components/StubCard'
import { API } from './components/constants'
import type { Plan, Props, Service, ShowFn, Ticket } from './components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
/* The registry is the whole menu. A name that is not here can never be drawn. */
const REGISTRY: Record<string, { Component: React.ComponentType<{ props: Props; onShow: ShowFn }>; allowed: string[] }> = {
  booking_form: { Component: BookingForm, allowed: ['service'] },
  price_list: { Component: PriceList, allowed: [] },
  repair_status: { Component: RepairStatus, allowed: ['code'] },
}

const FALLBACK_SAY = 'I can only help with booking, prices and repair status here. Pick one of these.'
const STARTERS = ['Book a service', 'How much is a tune-up?', 'Is my bike ready?']

const acceptPlan = (raw: any): Plan => {
  const name = typeof raw?.component === 'string' ? raw.component : 'none'
  const entry = REGISTRY[name]
  const suggestions: string[] = Array.isArray(raw?.suggestions) ? raw.suggestions.filter((s: any) => typeof s === 'string').slice(0, 4) : []
  const say = typeof raw?.say === 'string' && raw.say.trim() ? raw.say.trim().slice(0, 160) : ''
  if (!entry) return { component: 'none', props: {}, say: FALLBACK_SAY, suggestions: suggestions.length ? suggestions : STARTERS }
  const props: Props = {}
  for (const key of entry.allowed) {
    const value = raw?.props?.[key]
    if (typeof value === 'string' && value.trim()) props[key] = value.trim().slice(0, 60)
  }
  return { component: name, props, say, suggestions: [] }
}

type Message = { id: number; role: 'user' | 'assistant'; text: string; component?: string; props?: Props; suggestions?: string[] }

const IndexPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bottom = React.useRef<HTMLDivElement>(null)

  useEffect(() => { bottom.current?.scrollIntoView?.({ block: 'end' }) }, [messages, busy])

  const push = (items: Omit<Message, 'id'>[]) =>
    setMessages(current => [...current, ...items.map((item, i) => ({ ...item, id: current.length + i + 1 }))])

  const show: ShowFn = plan => {
    const clean = acceptPlan(plan)
    push([{ role: 'assistant', text: clean.say, component: clean.component === 'none' ? undefined : clean.component, props: clean.props, suggestions: clean.suggestions }])
  }

  const ask = async (value: string) => {
    const message = value.trim()
    if (!message || busy) return
    setText('')
    setError('')
    push([{ role: 'user', text: message }])
    setBusy(true)
    try {
      const res = await fetch(API + '/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.message ?? 'The counter is not answering. Try again.')
      show(body)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The counter is not answering. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="a2-root flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-4 pt-6">
        <header>
          <h1 className="text-xl font-bold">Bengkel Rahayu</h1>
        </header>

        <div className="flex-1 space-y-4 py-5" role="log" aria-live="polite">
          {messages.length === 0 && (
            <div className="space-y-4 pt-6">
              <p className="text-2xl font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What does your bike need?</p>
              <div className="chips">
                {STARTERS.map(item => (
                  <button key={item} type="button" className="chip" onClick={() => ask(item)}>{item}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map(message => {
            const entry = message.component ? REGISTRY[message.component] : undefined
            if (message.role === 'user') return <p key={message.id} className="bubble-user">{message.text}</p>
            return (
              <div key={message.id} className="space-y-3">
                {message.text && <p>{message.text}</p>}
                {entry && <entry.Component props={message.props ?? {}} onShow={show} />}
                {(message.suggestions?.length ?? 0) > 0 && (
                  <div className="chips">
                    {message.suggestions?.map(item => (
                      <button key={item} type="button" className="chip" onClick={() => ask(item)}>{item}</button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {busy && <p className="muted">One moment...</p>}
          {error && <p role="alert" className="err">{error}</p>}
          <div ref={bottom} />
        </div>

        <form className="composer" onSubmit={e => { e.preventDefault(); ask(text) }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={500}
            aria-label="Tell the workshop what you need"
            placeholder="Book a tune-up, check RR-2041..."
          />
          <button type="submit" className="primary" disabled={busy || !text.trim()}>Send</button>
        </form>
      </div>
    </main>
  )
}

// Wrapper for animation + layout
const ArkzenPage_A2uiLab_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_A2uiLab_Index
