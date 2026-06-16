// ============================================================
// ARKZEN GENERATED COMPONENT — StatPill [React+Vite]
// Source: @arkzen:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T06:35:38.213Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'
import { create } from 'zustand'
import { c, colors } from './utils'

export const StatPill = ({ icon: Icon, label, value, color = 'blue' }: {
  icon: React.ElementType
  label: string
  value: string | number
  color?: 'blue' | 'green' | 'amber' | 'violet' | 'emerald'
}) => {
  const colors: Record<string, { bg: string; icon: string; text: string }> = {
    blue:    { bg: 'rgba(80,130,230,0.12)',  icon: '#4a72c8', text: '#2a3f6f' },
    violet:  { bg: 'rgba(80,130,230,0.12)',  icon: '#4a72c8', text: '#2a3f6f' },
    green:   { bg: 'rgba(52,211,153,0.12)',  icon: '#059669', text: '#1a5040' },
    emerald: { bg: 'rgba(52,211,153,0.12)',  icon: '#059669', text: '#1a5040' },
    amber:   { bg: 'rgba(245,158,11,0.12)', icon: '#d97706', text: '#7c4a00' },
  }
  const c = colors[color] ?? colors.blue
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 9, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={13} style={{ color: c.icon }} />
      </div>
      <p style={{ fontSize: 20, fontWeight: 800, color: c.text, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 9, color: '#7a9bc4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
    </div>
  )
}

// ✅ FIX: Add safe guard for missing ticket
