// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — kotoba [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.348Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LANGS } from './constants'

export const langName = (c?: string | null) => LANGS.find(l => l.code === c)?.name ?? (c ?? '')

export const langFlag = (c?: string | null) => LANGS.find(l => l.code === c)?.flag ?? '🌐'

// Tiny cross-screen state (RN has no URL hash)

// Tiny cross-screen state (RN has no URL hash)
export const pending: { chat: { kind: 'dm' | 'circle'; id: number } | null; feedScope: string | null } = { chat: null, feedScope: null }

// ─── Network + helpers ────────────────────────────────────────

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()

export const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }

// ─── Network + helpers ────────────────────────────────────────
export async function kt<T = any>(path: string, opts: { method?: string; json?: any } = {}): Promise<T> {
  const init: RequestInit = { method: opts.method ?? (opts.json !== undefined ? 'POST' : 'GET') }
  if (opts.json !== undefined) init.body = JSON.stringify(opts.json)
  const res = await arkzenFetch(`/api/kotoba${path}`, init)
  let data: any = null
  try { data = await res.json() } catch { data = null }
  if (!res.ok) {
    const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : undefined
    throw new Error(first ?? data?.message ?? `Request failed (${res.status})`)
  }
  return data as T
}

export function toast(message: string, kind: 'ok' | 'err' = 'ok') {
  const bus = (globalThis as any).__ktToast
  if (typeof bus === 'function') bus(message, kind)
}

export function timeAgo(ts?: string | null) {
  if (!ts) return ''
  const s = Math.max(1, Math.floor((Date.now() - new Date(ts).getTime()) / 1000))
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

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
