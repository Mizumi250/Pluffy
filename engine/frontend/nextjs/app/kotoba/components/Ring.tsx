'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Ring
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:10.017Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langFlag, langName } from '@/arkzen/generated/kotoba.scripts'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'

export const Ring = ({ value, max, size = 120, stroke = 12, color = '#0a84ff', children }: { value: number; max: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode }) => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, max ? value / max : 0))
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--kt-surface2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.2,0.8,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  )
}
