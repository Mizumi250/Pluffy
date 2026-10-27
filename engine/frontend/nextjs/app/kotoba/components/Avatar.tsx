'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Avatar
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:46.528Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import { kt } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'

// ─── UI atoms ─────────────────────────────────────────────────
export const Avatar = ({ name, color = '#0a84ff', size = 40 }: { name?: string; color?: string | null; size?: number }) => (
  <div className="kt-avatar" style={{ width: size, height: size, background: color ?? '#0a84ff', fontSize: size * 0.42 }}>{(name || '?').trim().slice(0, 1).toUpperCase()}</div>
)
