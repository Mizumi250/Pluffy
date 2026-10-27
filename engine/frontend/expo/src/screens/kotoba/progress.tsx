// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/progress
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { InterestPicker } from './components/InterestPicker'
import { LangPicker } from './components/LangPicker'
import { LessonPlayer } from './components/LessonPlayer'
import { OnboardingSheet } from './components/OnboardingSheet'
import { PostCard } from './components/PostCard'
import { ProfileSheet } from './components/ProfileSheet'
import { Screen } from './components/Screen'
import { Seg } from './components/Seg'
import { Sheet } from './components/Sheet'
import { Skel } from './components/Skel'
import { TH } from './components/constants'
import { useApi } from './components/hooks'
import type { KProfile } from './components/types'

// User screen (from @arkzen:native:page:progress)
const ProgressScreen = () => {
  const { data, loading, error, reload } = useApi<any>('/progress')
  if (loading && !data) return <Screen title="Progress"><Skel n={3} h={130} /></Screen>
  if (error || !data) return <Screen title="Progress"><Empty icon="📡" title="Could not load progress" text={error ?? ''}><Btn kind="primary" label="Retry" onPress={reload} /></Empty></Screen>
  const p: KProfile = data.profile
  const s = data.stats
  const series: { date: string; count: number }[] = data.series
  const max = Math.max(1, ...series.map(x => x.count))
  const activeDays = series.filter(x => x.count > 0).length
  const badges = [
    ['✍️', 'First post', s.posts >= 1], ['🔥', '7-day streak', p.best_streak >= 7], ['🧠', '25 words', s.cards >= 25], ['🎓', '3 lessons', s.lessons >= 3],
    ['🤝', 'First correction', s.corrections_given >= 1], ['💬', '50 messages', s.messages_sent >= 50], ['🏅', 'Word master', s.mastered >= 10], ['🌟', 'Level 5', data.level >= 5],
  ] as [string, string, boolean][]
  const tiles = [['Words written', s.words_written, '✍️'], ['Messages sent', s.messages_sent, '💬'], ['Posts', s.posts, '📝'], ['Lessons done', s.lessons, '🎓'], ['Words in deck', s.cards, '🗂️'], ['Mastered', s.mastered, '🏅'], ['Corrections given', s.corrections_given, '🤝'], ['Corrections received', s.corrections_received, '✏️']]
  return (
    <Screen title="Progress" subtitle="What you produce matters more than what you tap." onRefresh={reload} refreshing={loading}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}><View><Text style={{ color: TH.sub, fontWeight: '600' }}>LEVEL</Text><Text style={{ fontSize: 44, fontWeight: '800', color: TH.text }}>{data.level}</Text></View><Text style={{ color: TH.sub }}>{p.xp} XP · {100 - data.level_progress} to next</Text></View>
        <Bar value={data.level_progress} max={100} color={TH.purple} />
      </Card>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 34 }}>🔥</Text><Text style={{ fontSize: 30, fontWeight: '800', color: TH.text }}>{p.streak}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>streak · best {p.best_streak}</Text></Card>
        <Card style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: 34 }}>📅</Text><Text style={{ fontSize: 30, fontWeight: '800', color: TH.text }}>{activeDays}/14</Text><Text style={{ color: TH.sub, fontSize: 12 }}>active days</Text></Card>
      </View>
      <Card style={{ gap: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: TH.text }}>Last 14 days</Text>
        <View accessibilityLabel="Activity over the last 14 days" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 110 }}>{series.map(d => <View key={d.date} style={{ flex: 1, height: `${Math.max(4, (d.count / max) * 100)}%`, borderRadius: 5, backgroundColor: TH.blue, opacity: d.count ? 1 : 0.18 }} />)}</View>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{tiles.map(t => <Card key={t[0] as string} style={{ width: '47.5%', padding: 14 }}><Text style={{ fontSize: 22 }}>{t[2]}</Text><Text style={{ fontSize: 26, fontWeight: '800', color: TH.text }}>{t[1]}</Text><Text style={{ color: TH.sub, fontSize: 13 }}>{t[0]}</Text></Card>)}</View>
      {s.corrections_received > 0 && <Card style={{ gap: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: '700', color: TH.text }}>Corrections you accepted</Text><Text style={{ color: TH.sub }}>{s.corrections_accepted}/{s.corrections_received}</Text></View><Bar value={s.corrections_accepted} max={s.corrections_received} color={TH.green} /></Card>}
      <Text style={{ fontSize: 22, fontWeight: '700', color: TH.text }}>Milestones</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{badges.map(b => <Card key={b[1]} style={{ width: '47.5%', alignItems: 'center', padding: 14, opacity: b[2] ? 1 : 0.4 }}><Text style={{ fontSize: 32 }}>{b[0]}</Text><Text style={{ fontWeight: '600', fontSize: 13, marginTop: 4, color: TH.text }}>{b[1]}</Text></Card>)}</View>
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Progress() {
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
        <ProgressScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Progress
