// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/circles
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
import { LANGS, LEVELS, TH } from './components/constants'
import { useApi, useNav, useProfile } from './components/hooks'
import { kt, langFlag, pending, toast } from './components/utils'

// User screen (from @arkzen:native:page:circles)
const CirclesScreen = () => {
  const nav = useNav()
  const { profile } = useProfile()
  const [lang, setLang] = useState('all')
  const { data, loading, error, reload, setData } = useApi<{ data: any[] }>(`/circles${lang !== 'all' ? `?lang=${lang}` : ''}`, [lang])
  const [creating, setCreating] = useState(false)
  const [f, setF] = useState({ name: '', emoji: '💬', lang: 'es', level: 'A1', description: '' })
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) setF(x => ({ ...x, lang: profile.learning_lang, level: profile.level })) }, [profile?.id])
  const toggle = async (c: any) => {
    try {
      const r = await kt<{ joined: boolean; members_count: number }>(`/circles/${c.id}/join`, { json: {} })
      setData(d => d ? { data: d.data.map(x => x.id === c.id ? { ...x, joined: r.joined, members_count: r.members_count } : x) } : d)
      toast(r.joined ? `Joined ${c.name}` : `Left ${c.name}`)
    } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const create = async () => {
    if (!f.name.trim()) return
    setBusy(true)
    try { await kt('/circles', { json: { ...f, name: f.name.trim(), description: f.description.trim() || null } }); setCreating(false); setF(x => ({ ...x, name: '', description: '' })); toast('Circle created'); reload() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const emojis = ['💬', '☀️', '🌸', '☕', '🎧', '📚', '🌍', '🎮', '🍜', '⚽']
  return (
    <Screen title="Circles" subtitle="Small study groups with a shared language." onRefresh={reload} refreshing={loading && !!data}
      right={<Btn small kind="primary" label="+ New" onPress={() => setCreating(true)} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <Chip label="🌐 All" on={lang === 'all'} onPress={() => setLang('all')} />
        {LANGS.map(l => <Chip key={l.code} label={`${l.flag} ${l.name}`} on={lang === l.code} onPress={() => setLang(l.code)} />)}
      </ScrollView>
      {loading && !data && <Skel n={3} h={130} />}
      {error && <Empty icon="📡" title="Could not load circles" text={error}><Btn kind="primary" label="Retry" onPress={reload} /></Empty>}
      {data && data.data.length === 0 && <Empty icon="👥" title="No circles here yet" text="Start one. Small groups with a clear goal are where people stick around."><Btn kind="primary" label="Create a circle" onPress={() => setCreating(true)} /></Empty>}
      {data?.data.map(c => (
        <Card key={c.id} style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 26 }}>{c.emoji}</Text></View>
            <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 17, color: TH.text }}>{c.name}</Text><Text style={{ color: TH.sub }}>{c.members_count} member{c.members_count === 1 ? '' : 's'}</Text></View>
            <Chip tone="blue" label={`${langFlag(c.lang)} ${c.level}`} />
          </View>
          {c.description && <Text style={{ color: TH.sub, fontSize: 15, lineHeight: 21 }}>{c.description}</Text>}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {c.joined && <Btn small kind="primary" label="Open chat" onPress={() => { pending.chat = { kind: 'circle', id: c.id }; nav.go('chat') }} style={{ flex: 1 }} />}
            <Btn small kind={c.joined ? 'fill' : 'tint'} label={c.joined ? 'Leave' : 'Join circle'} onPress={() => toggle(c)} style={c.joined ? undefined : { flex: 1 }} />
          </View>
        </Card>
      ))}
      <Sheet open={creating} onClose={() => setCreating(false)} title="New circle">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{emojis.map(e => <TouchableOpacity key={e} accessibilityLabel={`Icon ${e}`} onPress={() => setF({ ...f, emoji: e })} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: f.emoji === e ? TH.blue : 'transparent' }}><Text style={{ fontSize: 20 }}>{e}</Text></TouchableOpacity>)}</View>
        <Field label="Name" value={f.name} onChangeText={v => setF({ ...f, name: v })} placeholder="Tokyo Night Owls" autoCap="words" />
        <LangPicker label="Language" value={f.lang} onChange={v => setF({ ...f, lang: v })} />
        <View><Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>Level</Text><Seg value={f.level} onChange={v => setF({ ...f, level: v })} options={LEVELS.map(l => ({ value: l, label: l }))} /></View>
        <Field label="What is it for?" value={f.description} onChangeText={v => setF({ ...f, description: v })} multiline autoCap="sentences" placeholder="Daily 5-minute check-ins, no pressure." />
        <Btn kind="primary" label={busy ? 'Creating…' : 'Create circle'} disabled={busy || !f.name.trim()} onPress={create} />
      </Sheet>
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Circles() {
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
        <CirclesScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Circles
