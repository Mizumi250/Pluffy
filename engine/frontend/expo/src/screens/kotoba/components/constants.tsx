// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — kotoba [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.711Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'


// ─── Theme (paper + ink) ──────────────────────────────────────
export const TH = {
  bg: '#e9e4da', card: '#f5f1e9', fill: '#e0d9cb', text: '#121212', sub: '#6b655b', line: 'rgba(18,18,18,0.14)',
  blue: '#121212', green: '#3f6b4f', orange: '#8a6a2f', red: '#9b3b34', purple: '#4a4a4a',
}

export const SHADOW = { shadowColor: '#121212', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 }

export const LANGS = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' }, { code: 'fr', name: 'French' },
  { code: 'ko', name: 'Korean' }, { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }, { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Mandarin' }, { code: 'tl', name: 'Filipino' },
]

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const COLORS = ['#121212', '#4a4a4a', '#3f6b4f', '#8a6a2f', '#7a3b34', '#4a5a6a', '#6b5a7a']

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
