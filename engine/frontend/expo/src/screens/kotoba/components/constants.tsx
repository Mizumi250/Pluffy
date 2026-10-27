// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — kotoba [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:06.966Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'


// ─── Theme (light, iOS system colors) ─────────────────────────
export const TH = {
  bg: '#f2f2f7', card: '#ffffff', fill: '#f2f2f7', text: '#1c1c1e', sub: '#8e8e93', line: 'rgba(60,60,67,0.16)',
  blue: '#0a84ff', green: '#30d158', orange: '#ff9f0a', red: '#ff453a', purple: '#bf5af2',
}

export const SHADOW = { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 }

export const LANGS = [
  { code: 'en', name: 'English', flag: '🇬🇧' }, { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' }, { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' }, { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' }, { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'zh', name: 'Mandarin', flag: '🇨🇳' }, { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
]

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const COLORS = ['#0a84ff', '#bf5af2', '#30d158', '#ff9f0a', '#ff375f', '#64d2ff', '#ac8e68']

// ─── Network + helpers ────────────────────────────────────────
// The request function is an ALL_CAPS const on purpose: the engine writes it to
// constants.tsx, which the generated hooks.tsx can import (it can NOT import
// utils.tsx, where a plain `kt` function would be emitted). `kt` stays as the
// short alias every screen already calls.
export const KT_REQUEST = async function <T = any>(path: string, opts: { method?: string; json?: any } = {}): Promise<T> {
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
