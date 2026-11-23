'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — webmcp-lab
// Source: @arkzen:components (webmcp-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:40:49.845Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Draft, Service } from './types'

/*
 * WebMCP registration. Everything is inside this hook on purpose: generated hooks cannot import
 * constants or helpers from this block. The page works exactly the same when no WebMCP API exists.
 * Tools return only public facts. The booking tool never writes until the customer confirms on the page.
 */
export const useWebMcpTools = (
  askConfirm: (draft: Draft, signal?: AbortSignal) => Promise<boolean>,
  onBooked: (draft: Draft) => void,
) => {
  const [count, setCount] = useState(0)
  const confirmRef = useRef(askConfirm)
  const bookedRef = useRef(onBooked)
  confirmRef.current = askConfirm
  bookedRef.current = onBooked

  useEffect(() => {
    const ctx: any = (document as any).modelContext ?? (navigator as any).modelContext
    if (!ctx || typeof ctx.registerTool !== 'function') return
    const controller = new AbortController()
    const API = '/api/webmcp-lab'
    const SLOTS = ['09:00', '11:00', '14:00', '16:00']
    const text = (value: unknown, isError = false) => ({
      content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }],
      ...(isError ? { isError: true } : {}),
    })
    const rows = (body: any): any[] => (Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [])
    const today = () => {
      const d = new Date()
      const p = (n: number) => String(n).padStart(2, '0')
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
    }
    const loadServices = async (): Promise<Service[]> => {
      const res = await fetch(API + '/services', { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('The price list is not available right now.')
      return rows(await res.json())
    }

    const tools = [
      {
        name: 'list_services',
        description: 'List the bike workshop services with price in Indonesian rupiah and duration in minutes.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        async execute() {
          try {
            const services = await loadServices()
            return text(services.map(s => ({ name: s.name, price_idr: s.price_idr, minutes: s.minutes, note: s.note })))
          } catch (reason) {
            return text(reason instanceof Error ? reason.message : 'Could not load services.', true)
          }
        },
      },
      {
        name: 'check_repair_status',
        description: 'Look up a repair ticket by its code, for example RR-2041. Returns the bike, status and expected time. Never returns the customer name.',
        inputSchema: {
          type: 'object',
          properties: { code: { type: 'string', pattern: '^RR-[0-9]{4}$', description: 'Ticket code such as RR-2041' } },
          required: ['code'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        async execute(args: any) {
          const code = typeof args?.code === 'string' ? args.code.trim().toUpperCase() : ''
          if (!/^RR-[0-9]{4}$/.test(code)) return text('The code must look like RR-2041.', true)
          try {
            const res = await fetch(API + '/tickets?code=' + encodeURIComponent(code), { headers: { Accept: 'application/json' } })
            if (!res.ok) return text('The lookup failed. Try again later.', true)
            const found = rows(await res.json()).find((t: any) => t?.code === code)
            if (!found) return text('No ticket with code ' + code + '.', true)
            return text({ code: found.code, bike: found.bike, status: found.status, note: found.note, expected: found.ready_by })
          } catch {
            return text('The lookup failed. Try again later.', true)
          }
        },
      },
      {
        name: 'book_service',
        description: 'Ask to book a workshop slot. The customer sees the details on the page and must confirm before anything is saved. Call list_services first to get valid service names.',
        inputSchema: {
          type: 'object',
          properties: {
            service: { type: 'string', description: 'Exact service name from list_services' },
            day: { type: 'string', pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$', description: 'Date as YYYY-MM-DD, today or later' },
            slot: { type: 'string', enum: SLOTS },
            name: { type: 'string', maxLength: 80, description: 'Customer name' },
          },
          required: ['service', 'day', 'slot', 'name'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        async execute(args: any, extra: any) {
          const signal: AbortSignal | undefined = extra?.signal
          const name = typeof args?.name === 'string' ? args.name.trim() : ''
          const day = typeof args?.day === 'string' ? args.day : ''
          const slot = typeof args?.slot === 'string' ? args.slot : ''
          const wanted = typeof args?.service === 'string' ? args.service.trim().toLowerCase() : ''
          if (!name || name.length > 80) return text('A customer name of 1 to 80 characters is required.', true)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < today()) return text('The day must be YYYY-MM-DD, today or later.', true)
          if (!SLOTS.includes(slot)) return text('The slot must be one of ' + SLOTS.join(', ') + '.', true)
          let service: Service | undefined
          try {
            service = (await loadServices()).find(s => s?.name?.toLowerCase() === wanted)
          } catch (reason) {
            return text(reason instanceof Error ? reason.message : 'Could not load services.', true)
          }
          if (!service) return text('Unknown service. Call list_services for the valid names.', true)
          const draft: Draft = { service: service.name, day, slot, name }
          const approved = await confirmRef.current(draft, signal)
          if (!approved) return text('The customer did not confirm this booking. Nothing was saved.', true)
          try {
            const res = await fetch(API + '/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify(draft),
            })
            if (!res.ok) return text('The booking could not be saved. Nothing was booked.', true)
            bookedRef.current(draft)
            return text('Booked ' + draft.service + ' on ' + draft.day + ' at ' + draft.slot + ' for ' + draft.name + '.')
          } catch {
            return text('The booking could not be saved. Nothing was booked.', true)
          }
        },
      },
    ]

    let registered = 0
    // Register synchronously inside the effect. If registration were deferred, React StrictMode (which runs
    // effect, cleanup, effect) would register after the cleanup already aborted, and the tool would stay forever.
    for (const tool of tools) {
      try {
        Promise.resolve(ctx.registerTool(tool, { signal: controller.signal }))
          .then(() => { registered += 1; if (!controller.signal.aborted) setCount(registered) })
          .catch(() => {})
      } catch {
        // A browser that throws synchronously simply gets no tools. The page keeps working.
      }
    }
    return () => { controller.abort(); setCount(0) }
  }, [])

  return { count }
}
