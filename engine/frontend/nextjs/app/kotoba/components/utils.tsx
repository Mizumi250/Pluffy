// ============================================================
// ARKZEN GENERATED UTILITIES — kotoba
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:09.488Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'

export function toast(message: string, kind: 'ok' | 'err' = 'ok') {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kotoba:toast', { detail: { message, kind } }))
}

// ─── Utils ────────────────────────────────────────────────────
export function timeAgo(ts?: string | null) {
  if (!ts) return ''
  const s = Math.max(1, Math.floor((Date.now() - new Date(ts).getTime()) / 1000))
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  return new Date(ts).toLocaleDateString()
}

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()

export const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }

export function diffText(a: string, b: string) {
  const split = (s: string) => (/\s/.test(s) ? s.split(/(\s+)/).filter(Boolean) : Array.from(s))
  const x = split(a), y = split(b)
  const dp: number[][] = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0))
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: { t: 'same' | 'del' | 'add'; s: string }[] = []
  let i = 0, j = 0
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { out.push({ t: 'same', s: x[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: 'del', s: x[i] }); i++ }
    else { out.push({ t: 'add', s: y[j] }); j++ }
  }
  while (i < x.length) out.push({ t: 'del', s: x[i++] })
  while (j < y.length) out.push({ t: 'add', s: y[j++] })
  return out
}

// ─── UI atoms ─────────────────────────────────────────────────
