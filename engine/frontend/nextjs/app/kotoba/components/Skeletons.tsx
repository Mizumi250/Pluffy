'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Skeletons
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:10.014Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langFlag, langName } from '@/arkzen/generated/kotoba.scripts'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'

export const Skeletons = ({ n = 3, h = 120 }: { n?: number; h?: number }) => (
  <div className="kt-stack">{Array.from({ length: n }).map((_, i) => <div key={i} className="kt-skel" style={{ height: h }} />)}</div>
)
