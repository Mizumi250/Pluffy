// ============================================================
// ARKZEN GENERATED COMPONENT — NowServingCard
// Source: @arkzen:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:28:16.010Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'
import { create } from 'zustand'
import type { Queue, Ticket } from './types'

// ─── Components ───────────────────────────────────────────────────────────────

export const NowServingCard = ({ ticket, queueName }: { ticket: Ticket | null; queueName: string }) => (
  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.80)', backdropFilter: 'blur(16px)', padding: '18px 20px', boxShadow: '0 8px 32px rgba(80,130,200,0.12)' }}>
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#7aabde', textTransform: 'uppercase', marginBottom: 14 }}>
      Now Serving · {queueName}
    </p>
    {ticket ? (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#1a3060', letterSpacing: '-2px', lineHeight: 1 }}>{ticket.ticket_number}</div>
          <p style={{ color: '#7a9bc4', fontSize: 13, marginTop: 4 }}>{ticket.customer_name ?? 'Guest'}</p>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={26} style={{ color: '#10b981' }} />
        </div>
      </div>
    ) : (
      <div style={{ color: '#a0b8d8', fontSize: 16, fontWeight: 500 }}>Queue is empty</div>
    )}
  </div>
)
