// ============================================================
// ARKZEN GENERATED COMPONENT — TicketRow [React+Vite]
// Source: @arkzen:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T03:19:10.368Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'
import { create } from 'zustand'
import type { Ticket } from './types'

export const TicketRow = ({ ticket, position }: { ticket: Ticket; position: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
    <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(100,150,230,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#5a82c8' }}>#{position}</span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#2a3f6f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.ticket_number}</p>
      <p style={{ fontSize: 11, color: '#7a9bc4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.customer_name ?? 'Guest'}</p>
    </div>
    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: ticket.status === 'serving' ? 'rgba(52,211,153,0.15)' : 'rgba(100,150,230,0.12)', color: ticket.status === 'serving' ? '#059669' : '#4a72c8', border: `1px solid ${ticket.status === 'serving' ? 'rgba(52,211,153,0.3)' : 'rgba(100,150,230,0.25)'}` }}>
      {ticket.status}
    </span>
  </div>
)
