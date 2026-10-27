// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — kotoba
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:09.976Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langFlag, langName } from '@/arkzen/generated/kotoba.scripts'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'


// ─── Levels & palette ─────────────────────────────────────────
// (LANGS, langName, langFlag and kt live in the web:script block above)
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const COLORS = ['#0a84ff', '#bf5af2', '#30d158', '#ff9f0a', '#ff375f', '#64d2ff', '#ac8e68']
