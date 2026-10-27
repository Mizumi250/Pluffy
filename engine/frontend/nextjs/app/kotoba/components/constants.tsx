// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — kotoba
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:46.490Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'


// ─── Languages ────────────────────────────────────────────────
export const LANGS = [
  { code: 'en', name: 'English', flag: '🇬🇧' }, { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' }, { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' }, { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' }, { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'zh', name: 'Mandarin', flag: '🇨🇳' }, { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
]

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const COLORS = ['#0a84ff', '#bf5af2', '#30d158', '#ff9f0a', '#ff375f', '#64d2ff', '#ac8e68']
