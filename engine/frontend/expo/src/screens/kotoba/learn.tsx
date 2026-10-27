// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/learn
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
import { useApi, useProfile } from './components/hooks'
import { langFlag, langName } from './components/utils'

// User screen (from @arkzen:native:page:learn)
const LearnScreen = () => {
  const { profile } = useProfile()
  const [lang, setLang] = useState<string | null>(null)
  const active = lang ?? profile?.learning_lang ?? null
  const { data, loading, error, reload } = useApi<{ data: any[] }>(active ? `/lessons?lang=${active}` : null)
  const [playing, setPlaying] = useState<any | null>(null)
  const lessons = data?.data ?? []
  const units = Array.from(new Set(lessons.map(l => l.unit)))
  const doneCount = lessons.filter(l => l.done).length
  return (
    <Screen title="Learn" subtitle="Short lessons built around phrases you will actually say." onRefresh={reload} refreshing={loading && !!data}>
      <LangPicker value={active ?? 'es'} onChange={setLang} />
      {lessons.length > 0 && <Card style={{ gap: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: '700', color: TH.text }}>{langFlag(active)} {langName(active)} path</Text><Text style={{ color: TH.sub }}>{doneCount}/{lessons.length}</Text></View><Bar value={doneCount} max={lessons.length} /></Card>}
      {loading && !data && <Skel n={3} h={90} />}
      {error && <Empty icon="📡" title="Could not load lessons" text={error}><Btn kind="primary" label="Retry" onPress={reload} /></Empty>}
      {data && lessons.length === 0 && <Empty icon="🌍" title={`Lessons for ${langName(active)} are on the way`} text="Meanwhile, write in the community, chat with a partner and build your deck. Spanish, Japanese and English have lessons today." />}
      {units.map(u => (
        <View key={u as string} style={{ gap: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: TH.text }}>{u as string}</Text>
          {lessons.filter(l => l.unit === u).map(l => (
            <Card key={l.id} onPress={() => setPlaying(l)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={{ fontSize: 34 }}>{l.emoji ?? '📘'}</Text>
              <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 17, color: TH.text }}>{l.title}</Text><View style={{ flexDirection: 'row', marginTop: 6 }}><Chip label={l.level} /><Chip tone="orange" label={`+${l.xp} XP`} />{l.done && <Chip tone="green" label={`✓ ${l.best}%`} />}</View></View>
              <Text style={{ color: TH.sub, fontSize: 22 }}>›</Text>
            </Card>
          ))}
        </View>
      ))}
      {playing && <LessonPlayer lesson={playing} onClose={() => setPlaying(null)} onDone={() => { setPlaying(null); reload() }} />}
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Learn() {
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
        <LearnScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Learn
