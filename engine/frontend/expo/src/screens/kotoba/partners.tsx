// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/partners
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { ShellLayout } from '../../../arkzen/core/layouts/custom/kotoba-shell'
import { AuthLayout }  from '@/layouts/AuthLayout'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { Avatar } from './components/Avatar'
import { Bar } from './components/Bar'
import { Btn } from './components/Btn'
import { Card } from './components/Card'
import { Chip } from './components/Chip'
import { ComposeBox } from './components/ComposeBox'
import { Diff } from './components/Diff'
import { Empty } from './components/Empty'
import { Field } from './components/Field'
import { Ico } from './components/Ico'
import { InterestPicker } from './components/InterestPicker'
import { LangPicker } from './components/LangPicker'
import { LessonPlayer } from './components/LessonPlayer'
import { Logo } from './components/Logo'
import { OnboardingSheet } from './components/OnboardingSheet'
import { PostCard } from './components/PostCard'
import { ProfileSheet } from './components/ProfileSheet'
import { Screen } from './components/Screen'
import { Seg } from './components/Seg'
import { Sheet } from './components/Sheet'
import { ShellFx } from './components/ShellFx'
import { Skel } from './components/Skel'
import { TH } from './components/constants'
import { useNav } from './components/hooks'
import { kt, langName, pending, toast } from './components/utils'
import type { KProfile } from './components/types'

// User screen (from @arkzen:native:page:partners)
const PartnersScreen = () => {
  const nav = useNav()
  const [mode, setMode] = useState('exchange')
  const [q, setQ] = useState('')
  const [list, setList] = useState<KProfile[] | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const load = useCallback(async () => {
    try { const r = await kt<{ data: KProfile[] }>(`/partners?mode=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}`); setList(r.data) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not load partners', 'err'); setList([]) }
  }, [mode, q])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])
  const hello = async (p: KProfile) => {
    try { const r = await kt<{ data: { id: number } }>('/conversations', { json: { user_id: p.user_id } }); pending.chat = { kind: 'dm', id: r.data.id }; nav.go('chat') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const follow = async (p: KProfile) => {
    try { const r = await kt<{ following: boolean }>(`/follow/${p.user_id}`, { json: {} }); setList(l => (l ?? []).map(x => x.user_id === p.user_id ? { ...x, following: r.following } : x)) } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  return (
    <Screen title="Partners" subtitle="People who speak what you learn, and want what you speak." onRefresh={load} refreshing={false}>
      <Seg value={mode} onChange={setMode} options={[{ value: 'exchange', label: 'Language exchange' }, { value: 'all', label: 'Everyone' }]} />
      <Field value={q} onChangeText={setQ} placeholder="Search name, interest or country" />
      {list === null && <Skel n={3} h={140} />}
      {list && list.length === 0 && <Empty icon="compass" title="No matches yet" text="Try the Everyone tab, or invite a friend who speaks your target language." />}
      {list?.map(p => (
        <Card key={p.id} style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setViewing(p.user_id)} accessibilityLabel={`Open ${p.display_name}`}><Avatar name={p.display_name} color={p.avatar_color} size={50} /></TouchableOpacity>
            <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 17, color: TH.text }}>{p.display_name}</Text><Text style={{ color: TH.sub }}>{p.country ?? '—'} · {p.streak} day streak</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={{ fontSize: 22, fontWeight: '800', color: (p.score ?? 0) >= 70 ? '#3f6b4f' : TH.blue }}>{p.score}%</Text><Text style={{ color: TH.sub, fontSize: 11 }}>match</Text></View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}><Chip tone="green" label={`Speaks ${langName(p.native_lang)}`} /><Chip tone="blue" label={`Learning ${p.level}`} />{p.shared?.slice(0, 3).map(s => <Chip key={s} tone="purple" label={s} />)}</View>
          {p.bio && <Text style={{ color: TH.sub, fontSize: 15, lineHeight: 21 }}>{p.bio}</Text>}
          <View style={{ flexDirection: 'row', gap: 10 }}><Btn small kind="primary" label="Say hello" onPress={() => hello(p)} style={{ flex: 1 }} /><Btn small label={p.following ? 'Following' : 'Follow'} onPress={() => follow(p)} /></View>
        </Card>
      ))}
      <ProfileSheet userId={viewing} onClose={() => setViewing(null)} />
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Partners() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('kotoba')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ArkzenStatusBar style="dark" />
      <ShellLayout>
      <AuthLayout tatSlug="kotoba" loginRoute="/kotoba/login">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PartnersScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Partners
