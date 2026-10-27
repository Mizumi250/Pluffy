// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/feed
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
import { LANGS } from './components/constants'
import { useProfile } from './components/hooks'
import { kt, pending } from './components/utils'
import type { KPost } from './components/types'

// User screen (from @arkzen:native:page:feed)
const FeedScreen = () => {
  const { profile } = useProfile()
  const [scope, setScope] = useState(pending.feedScope ?? 'all')
  const [lang, setLang] = useState('all')
  const [posts, setPosts] = useState<KPost[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  useEffect(() => { pending.feedScope = null }, [])
  const load = useCallback(async () => {
    setError(null)
    try { const r = await kt<{ data: KPost[] }>(`/feed?scope=${scope}${lang !== 'all' ? `&lang=${lang}` : ''}`); setPosts(r.data) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load the feed'); setPosts([]) }
  }, [scope, lang])
  useEffect(() => { setPosts(null); load() }, [load])
  return (
    <Screen title="Community" subtitle="Write, get corrected, return the favour." onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} refreshing={refreshing}>
      <ComposeBox lang={profile?.learning_lang ?? 'es'} onPosted={p => setPosts(l => [p, ...(l ?? [])])} />
      <Seg value={scope} onChange={setScope} options={[{ value: 'all', label: 'For you' }, { value: 'following', label: 'Following' }, { value: 'help', label: 'Needs help' }, { value: 'mine', label: 'Mine' }]} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <Chip label="🌐 All" on={lang === 'all'} onPress={() => setLang('all')} />
        {LANGS.map(l => <Chip key={l.code} label={`${l.flag} ${l.name}`} on={lang === l.code} onPress={() => setLang(l.code)} />)}
      </ScrollView>
      {posts === null && <Skel n={3} h={160} />}
      {error && <Empty icon="📡" title="Feed unavailable" text={error}><Btn kind="primary" label="Retry" onPress={load} /></Empty>}
      {posts && !error && posts.length === 0 && <Empty icon="✍️" title="Nothing here yet" text="Be the first to post something in your target language." />}
      {posts?.map(p => <PostCard key={p.id} post={p} meId={profile?.user_id} onProfile={setViewing} onDeleted={id => setPosts(l => (l ?? []).filter(x => x.id !== id))} />)}
      <ProfileSheet userId={viewing} onClose={() => setViewing(null)} />
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Feed() {
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
        <FeedScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Feed
