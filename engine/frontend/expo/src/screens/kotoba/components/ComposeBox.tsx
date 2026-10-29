// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ComposeBox [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.751Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { kt, langName, toast } from './utils'
import type { KPost } from './types'
import { Btn } from './Btn'
import { Card } from './Card'
import { Field } from './Field'
import { LangPicker } from './LangPicker'

// ─── Compose box ──────────────────────────────────────────────
export const ComposeBox = ({ lang: initialLang, kind = 'moment', missionId, placeholder, onPosted }: { lang: string; kind?: 'moment' | 'question' | 'mission'; missionId?: number | null; placeholder?: string; onPosted?: (p: KPost) => void }) => {
  const [body, setBody] = useState('')
  const [lang, setLang] = useState(initialLang)
  const [tr, setTr] = useState('')
  const [showTr, setShowTr] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => setLang(initialLang), [initialLang])
  const submit = async () => {
    if (!body.trim()) return
    setBusy(true)
    try {
      const r = await kt<{ data: KPost }>('/posts', { json: { body: body.trim(), lang, kind, mission_id: missionId ?? null, translation: tr.trim() || null } })
      setBody(''); setTr(''); setShowTr(false)
      toast(kind === 'mission' ? 'Mission complete! +20 XP' : 'Posted! +10 XP')
      onPosted?.(r.data)
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not post', 'err') }
    finally { setBusy(false) }
  }
  return (
    <Card style={{ gap: 12 }}>
      <Field value={body} onChangeText={setBody} multiline autoCap="sentences" placeholder={placeholder ?? `Write in ${langName(lang)}. Mistakes are welcome.`} />
      {showTr && <Field value={tr} onChangeText={setTr} multiline autoCap="sentences" placeholder="Add a translation (optional)" />}
      <LangPicker value={lang} onChange={setLang} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Btn small kind="ghost" label={showTr ? 'Hide translation' : 'Add translation'} onPress={() => setShowTr(s => !s)} />
        <Btn small kind="primary" label={busy ? 'Posting…' : kind === 'mission' ? 'Complete mission' : 'Post'} disabled={busy || !body.trim()} onPress={submit} />
      </View>
    </Card>
  )
}

// ─── Post card ────────────────────────────────────────────────
