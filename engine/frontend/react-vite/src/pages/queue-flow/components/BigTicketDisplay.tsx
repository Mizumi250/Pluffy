// ============================================================
// ARKZEN GENERATED COMPONENT — BigTicketDisplay [React+Vite]
// Source: @arkzen:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T14:10:33.795Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'
import { create } from 'zustand'
import { fmtWait } from './utils'
import type { MyTicketResponse } from './types'

export const BigTicketDisplay = ({ data }: { data: MyTicketResponse }) => {
  if (!data || !data.ticket) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Loader2 size={24} style={{ color: '#4a72c8', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }
  const { ticket, position, estimated_wait, is_serving, is_done } = data
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px 32px' }}>
      <div style={{ position: 'relative', width: 192, height: 192, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, background: is_serving ? 'rgba(52,211,153,0.10)' : is_done ? 'rgba(200,220,240,0.20)' : 'rgba(100,150,240,0.12)', border: `2px solid ${is_serving ? 'rgba(52,211,153,0.40)' : is_done ? 'rgba(180,200,220,0.40)' : 'rgba(100,150,240,0.30)'}`, boxShadow: is_serving ? '0 0 48px rgba(52,211,153,0.18)' : '0 0 48px rgba(100,150,240,0.14)' }}>
        {is_serving && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(52,211,153,0.25)', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: is_serving ? '#059669' : is_done ? '#aac0d8' : '#1a3060' }}>{is_done ? '✓' : position}</span>
          <span style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: is_serving ? '#059669' : '#7a9bc4', letterSpacing: '0.12em' }}>{is_serving ? 'YOUR TURN' : is_done ? 'SERVED' : 'position'}</span>
        </div>
      </div>
      <p style={{ fontSize: 36, fontWeight: 900, color: '#1a3060', letterSpacing: '-1px' }}>{ticket.ticket_number}</p>
      <p style={{ color: '#8aabc8', fontSize: 13, marginTop: 4 }}>{ticket.customer_name ?? 'Guest'}</p>
      <div style={{ marginTop: 24, padding: '16px 24px', borderRadius: 20, width: '100%', maxWidth: 280, background: is_serving ? 'rgba(52,211,153,0.10)' : is_done ? 'rgba(200,220,240,0.20)' : 'rgba(100,150,240,0.10)', border: `1px solid ${is_serving ? 'rgba(52,211,153,0.25)' : is_done ? 'rgba(180,200,220,0.30)' : 'rgba(100,150,240,0.20)'}` }}>
        {is_serving ? <p style={{ color: '#059669', fontWeight: 600, fontSize: 14 }}>Please proceed to the counter</p>
          : is_done ? <p style={{ color: '#8aabc8', fontWeight: 500, fontSize: 14 }}>Thank you for your patience</p>
          : <><p style={{ color: '#4a72c8', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Estimated wait</p><p style={{ color: '#7a9bc4', fontSize: 13 }}>{fmtWait(estimated_wait)}</p></>}
      </div>
    </div>
  )
};
