'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Diff
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:46.661Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import { diffText, kt } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'

export const Diff = ({ from, to }: { from: string; to: string }) => (
  <span className="kt-diff">
    {diffText(from, to).map((p, i) => p.t === 'same' ? <span key={i}>{p.s}</span> : p.t === 'del' ? <del key={i}>{p.s}</del> : <ins key={i}>{p.s}</ins>)}
  </span>
)

// ─── Compose box ──────────────────────────────────────────────
