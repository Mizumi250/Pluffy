// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/dashboard
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
import { useApi, useNav } from './components/hooks'
import { langFlag, langName, pending } from './components/utils'
import type { KProfile } from './components/types'

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const nav = useNav()
  const { data, loading, error, reload } = useApi<any>('/home')
  const [writing, setWriting] = useState(false)
  const [onb, setOnb] = useState(false)
  const p: KProfile | undefined = data?.profile
  useEffect(() => { if (p && !p.onboarded) setOnb(true) }, [p?.id, p?.onboarded])
  const h = new Date().getHours()
  const hi = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const goal = p?.daily_goal ?? 3
  const today = data?.today_activity ?? 0

  const plan = [
    { e: '🎯', t: data?.mission?.title ?? 'Daily mission', s: data?.mission_done ? 'Done for today. Nice work!' : data?.mission?.prompt, done: !!data?.mission_done, cta: 'Write', run: () => setWriting(true) },
    { e: '📚', t: data?.next_lesson ? `Lesson: ${data.next_lesson.title}` : 'Lessons', s: data?.next_lesson ? `Next up in ${data.next_lesson.unit}` : 'All lessons done for this language.', done: !data?.next_lesson, cta: 'Start', run: () => nav.go('learn') },
    { e: '🧠', t: `Review ${data?.due ?? 0} card${data?.due === 1 ? '' : 's'}`, s: data?.due ? 'Right before you forget them.' : 'Nothing due right now.', done: !data?.due, cta: 'Review', run: () => nav.go('review') },
    { e: '🤝', t: 'Help a learner', s: `${data?.help_needed ?? 0} post${data?.help_needed === 1 ? '' : 's'} in ${langName(p?.native_lang)} need your eyes.`, done: !data?.help_needed, cta: 'Help', run: () => { pending.feedScope = 'help'; nav.go('feed') } },
  ]
  return (
    <Screen title={`${hi}, ${p?.display_name?.split(' ')[0] ?? 'friend'}`} subtitle={p ? `${langFlag(p.learning_lang)} Learning ${langName(p.learning_lang)} · ${p.level}` : undefined} onRefresh={reload} refreshing={loading && !!data}>
      {loading && !data && <Skel n={3} h={110} />}
      {error && !data && <Empty icon="📡" title="Cannot reach Kotoba" text={error}><Btn kind="primary" label="Try again" onPress={reload} /></Empty>}
      {data && (
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Card style={{ flex: 1, alignItems: 'center', padding: 14 }}><Text style={{ fontSize: 26 }}>🔥</Text><Text style={{ fontSize: 24, fontWeight: '800', color: TH.text }}>{p?.streak ?? 0}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>day streak</Text></Card>
            <Card style={{ flex: 1, alignItems: 'center', padding: 14 }}><Text style={{ fontSize: 26 }}>⭐</Text><Text style={{ fontSize: 24, fontWeight: '800', color: TH.text }}>{p?.xp ?? 0}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>XP</Text></Card>
            <Card style={{ flex: 1, alignItems: 'center', padding: 14 }}><Text style={{ fontSize: 26 }}>🎯</Text><Text style={{ fontSize: 24, fontWeight: '800', color: TH.text }}>{Math.min(today, goal)}/{goal}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>today</Text></Card>
          </View>
          <Card style={{ gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: TH.text, marginBottom: 6 }}>Today’s plan</Text>
            {plan.map((s, i) => (
              <View key={s.t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: TH.line, opacity: s.done ? 0.6 : 1 }}>
                <Text style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{s.done ? '✅' : s.e}</Text>
                <View style={{ flex: 1 }}><Text style={{ fontWeight: '600', fontSize: 16, color: TH.text }}>{s.t}</Text><Text numberOfLines={2} style={{ color: TH.sub, fontSize: 14, marginTop: 2 }}>{s.s}</Text></View>
                <Btn small kind={s.done ? 'fill' : 'tint'} label={s.cta} onPress={s.run} />
              </View>
            ))}
          </Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[['Partners', '🧭', 'Find people', 'partners'], ['Circles', '👥', `${data.circles ?? 0} joined`, 'circles'], ['Progress', '📈', 'See growth', 'progress']].map(([t, e, s, k]) => (
              <Card key={t} onPress={() => nav.go(k)} style={{ flexGrow: 1, flexBasis: '30%' }}><Text style={{ fontSize: 26 }}>{e}</Text><Text style={{ fontWeight: '700', marginTop: 6, color: TH.text }}>{t}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>{s}</Text></Card>
            ))}
          </View>
        </>
      )}
      <Sheet open={writing} onClose={() => setWriting(false)} title={data?.mission?.title ?? 'Daily mission'}>
        <Text style={{ fontSize: 16, lineHeight: 23, color: TH.text }}>{data?.mission?.prompt}</Text>
        {data?.mission?.hint && <Text style={{ color: TH.sub }}>💡 {data.mission.hint}</Text>}
        <ComposeBox lang={p?.learning_lang ?? 'es'} kind="mission" missionId={data?.mission?.id} onPosted={() => { setWriting(false); reload() }} placeholder={`Write your answer in ${langName(p?.learning_lang)}…`} />
      </Sheet>
      <OnboardingSheet open={onb} profile={p} onDone={() => { setOnb(false); reload() }} />
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Dashboard() {
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
        <DashboardScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Dashboard
