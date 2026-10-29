'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — CircularRing
// Source: @arkzen:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:09:04.182Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'
import { create } from 'zustand'
import type { MyTicketResponse, Queue, QueueStatus, QueueStore, Ticket } from './types'

// ─── Circular Ring ────────────────────────────────────────────────────────────

export const CircularRing = ({ label, sublabel }: { label: string; sublabel: string }) => {
  const [angle, setAngle] = useState(45)
  useEffect(() => {
    const id = setInterval(() => setAngle(a => (a + 0.3) % 360), 50)
    return () => clearInterval(id)
  }, [])
  const r = 80, cx = 100, cy = 100
  const circumference = 2 * Math.PI * r
  const progress = 0.35
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180)
  const arcEndX = cx + r * Math.cos(toRad(angle + progress * 360))
  const arcEndY = cy + r * Math.sin(toRad(angle + progress * 360))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 8px' }}>
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,170,255,0.20) 0%, rgba(100,150,255,0.08) 60%, transparent 80%)' }} />
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: `rotate(${angle}deg)` }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(180,210,255,0.35)" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="3"
            strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }} />
          <circle cx={arcEndX} cy={arcEndY} r="5" fill="white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,1))' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.5px' }}>{label}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{sublabel}</span>
          <div style={{ marginTop: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pause size={10} style={{ color: 'rgba(255,255,255,0.8)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Components ───────────────────────────────────────────────────────────────
