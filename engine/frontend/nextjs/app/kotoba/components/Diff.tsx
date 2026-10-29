'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Diff
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:57.977Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'
import { diffText } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'

export const Diff = ({ from, to }: { from: string; to: string }) => (
  <span className="kt-diff">
    {diffText(from, to).map((p, i) => p.t === 'same' ? <span key={i}>{p.s}</span> : p.t === 'del' ? <del key={i}>{p.s}</del> : <ins key={i}>{p.s}</ins>)}
  </span>
)

// ─── Compose box ──────────────────────────────────────────────
