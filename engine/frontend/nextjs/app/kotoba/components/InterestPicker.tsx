'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — InterestPicker
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:10.058Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langFlag, langName } from '@/arkzen/generated/kotoba.scripts'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'

// ─── Onboarding sheet ─────────────────────────────────────────
export const InterestPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const all = ['travel', 'food', 'music', 'anime', 'football', 'books', 'coffee', 'photography', 'gaming', 'movies', 'fitness', 'tech']
  const cur = value.split(',').map(s => s.trim()).filter(Boolean)
  const flip = (i: string) => onChange((cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i]).join(','))
  return <div className="kt-row kt-wrap">{all.map(i => <button key={i} type="button" className={`kt-chip ${cur.includes(i) ? 'blue' : ''}`} style={{ border: 0, cursor: 'pointer', padding: '8px 14px', fontSize: 14 }} onClick={() => flip(i)}>{i}</button>)}</div>
}
