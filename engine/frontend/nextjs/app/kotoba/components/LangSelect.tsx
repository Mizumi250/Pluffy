'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — LangSelect
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:46.645Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import { LANGS } from './constants'
import { kt } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'

export const LangSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) => (
  <div>
    {label && <label className="kt-label">{label}</label>}
    <select className="kt-select" value={value} onChange={e => onChange(e.target.value)}>
      {LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
    </select>
  </div>
)
