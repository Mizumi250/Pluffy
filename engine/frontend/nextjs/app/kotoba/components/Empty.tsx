'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Empty
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:46.583Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import { kt } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'

export const Empty = ({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) => (
  <div className="kt-card flat" style={{ textAlign: 'center', padding: '44px 24px' }}>
    <div style={{ fontSize: 40, marginBottom: 10 }}>{icon ?? '🌱'}</div>
    <div className="kt-h2" style={{ fontSize: 19 }}>{title}</div>
    {text && <p className="kt-sub" style={{ margin: '6px auto 16px', maxWidth: 360 }}>{text}</p>}
    {action}
  </div>
)
