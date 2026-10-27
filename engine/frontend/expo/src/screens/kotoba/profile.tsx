// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/profile
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
import { COLORS, LEVELS, TH } from './components/constants'
import { useNav, useProfile } from './components/hooks'
import { kt, toast } from './components/utils'
import type { KProfile } from './components/types'

// User screen (from @arkzen:native:page:profile)
const ProfileScreen = () => {
  const { user, logout } = useAuthStore()
  const nav = useNav()
  const { profile, setProfile } = useProfile()
  const [f, setF] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const snapshot = (p: KProfile) => ({ display_name: p.display_name, bio: p.bio ?? '', country: p.country ?? '', native_lang: p.native_lang, learning_lang: p.learning_lang, level: p.level, interests: p.interests ?? '', avatar_color: p.avatar_color, daily_goal: String(p.daily_goal) })
  useEffect(() => { if (profile) setF(snapshot(profile)) }, [profile?.id])
  if (!f || !profile) return <Screen title="Profile"><Skel n={3} h={130} /></Screen>
  const dirty = JSON.stringify(f) !== JSON.stringify(snapshot(profile))
  const save = async () => {
    if (f.native_lang === f.learning_lang) { toast('Pick two different languages', 'err'); return }
    setBusy(true)
    try { const r = await kt<{ data: KProfile }>('/me', { method: 'PUT', json: { ...f, daily_goal: Number(f.daily_goal), bio: f.bio || null, country: f.country || null, interests: f.interests || null } }); setProfile(r.data); toast('Profile saved') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const label = (t: string) => <Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t}</Text>
  return (
    <Screen title="Profile" subtitle={(user as any)?.email}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['🧭', 'Partners', 'partners'], ['👥', 'Circles', 'circles'], ['📈', 'Progress', 'progress']].map(([e, t, k]) => <Card key={t} onPress={() => nav.go(k)} style={{ flex: 1, alignItems: 'center', padding: 12 }}><Text style={{ fontSize: 24 }}>{e}</Text><Text style={{ fontWeight: '600', fontSize: 13, color: TH.text, marginTop: 4 }}>{t}</Text></Card>)}
      </View>
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={f.display_name} color={f.avatar_color} size={70} />
          <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{COLORS.map(c => <TouchableOpacity key={c} accessibilityLabel={`Color ${c}`} onPress={() => setF({ ...f, avatar_color: c })} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, borderWidth: 3, borderColor: f.avatar_color === c ? TH.text : 'transparent' }} />)}</View>
        </View>
        <Field label="Display name" value={f.display_name} onChangeText={v => setF({ ...f, display_name: v })} autoCap="words" />
        <Field label="Bio" value={f.bio} onChangeText={v => setF({ ...f, bio: v })} multiline autoCap="sentences" />
        <Field label="Country" value={f.country} onChangeText={v => setF({ ...f, country: v })} autoCap="words" />
      </Card>
      <Card style={{ gap: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: TH.text }}>Languages</Text>
        <LangPicker label="I speak" value={f.native_lang} onChange={v => setF({ ...f, native_lang: v })} />
        <LangPicker label="I am learning" value={f.learning_lang} onChange={v => setF({ ...f, learning_lang: v })} />
        <View>{label('Level')}<Seg value={f.level} onChange={v => setF({ ...f, level: v })} options={LEVELS.map(l => ({ value: l, label: l }))} /></View>
        <View>{label('Daily goal')}<Seg value={f.daily_goal} onChange={v => setF({ ...f, daily_goal: v })} options={['1', '3', '5', '10'].map(g => ({ value: g, label: g }))} /></View>
        <View>{label('Interests')}<InterestPicker value={f.interests} onChange={v => setF({ ...f, interests: v })} /></View>
      </Card>
      <Btn kind="primary" label={busy ? 'Saving…' : 'Save changes'} disabled={!dirty || busy} onPress={save} />
      <Btn kind="danger" label="Sign out" onPress={async () => { try { await logout() } catch { /* ignore */ } nav.go('login') }} />
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Profile() {
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
        <ProfileScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Profile
