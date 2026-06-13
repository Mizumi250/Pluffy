// ============================================================
// ARKZEN GENERATED COMPONENT — AnnounceBadge
// Source: @arkzen:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T03:59:31.150Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'
import { create } from 'zustand'
import { useAnnounce } from './hooks'
import { announce } from './utils'

export const AnnounceBadge = ({ ticket }: { ticket: { ticket_number: string; customer_name: string | null } | null }) => {
  const announce = useAnnounce()
  if (!ticket) return null
  return (
    <button
      onClick={() => announce(`Now serving ${ticket.ticket_number}, ${ticket.customer_name ?? 'Guest'}, please proceed to the counter.`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.45)',
        border: '1px solid rgba(255,255,255,0.70)',
        fontSize: 13, color: '#4a72c8', fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      <Volume2 size={14} />
      Announce
    </button>
  )
}
