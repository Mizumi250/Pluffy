'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — kotoba
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:09.982Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langFlag, langName } from '@/arkzen/generated/kotoba.scripts'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'

export function useApi<T = any>(path: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(!!path)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    if (!path) return
    setLoading(true); setError(null)
    try { setData(await kt<T>(path)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setLoading(false) }
  }, [path])
  useEffect(() => { load() }, [load, ...deps])
  return { data, loading, error, reload: load, setData }
}

export function useRealtime(event: string, cb: (data: any) => void) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    const h = (e: any) => { if (e.detail?.event === event) ref.current(e.detail.data) }
    window.addEventListener('kotoba:rt', h)
    return () => window.removeEventListener('kotoba:rt', h)
  }, [event])
}

export const useNav = () => {
  const r = useArkzenRouter()
  return { go: (p: string) => r.push(p ? `/kotoba/${p}` : '/kotoba') }
}

export function useProfile() {
  const [profile, setProfile] = useState<KProfile | null>(null)
  const load = useCallback(async () => {
    try { const r = await kt<{ data: KProfile }>('/me'); setProfile(r.data) } catch { /* handled by auth layout */ }
  }, [])
  useEffect(() => { load() }, [load])
  return { profile, setProfile, reload: load }
}

// ─── Utils ────────────────────────────────────────────────────
