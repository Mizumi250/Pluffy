// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — OnboardingSheet [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.503Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LEVELS, TH } from './constants'
import { kt, toast } from './utils'
import type { KProfile } from './types'
import { Btn } from './Btn'
import { InterestPicker } from './InterestPicker'
import { LangPicker } from './LangPicker'
import { Seg } from './Seg'
import { Sheet } from './Sheet'

export const OnboardingSheet = ({ open, profile, onDone }: { open: boolean; profile?: KProfile; onDone: () => void }) => {
  const [native, setNative] = useState('en')
  const [learning, setLearning] = useState('es')
  const [level, setLevel] = useState('A1')
  const [interests, setInterests] = useState('')
  const [goal, setGoal] = useState('3')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) { setNative(profile.native_lang); setLearning(profile.learning_lang); setLevel(profile.level) } }, [profile?.id])
  const save = async () => {
    if (native === learning) { toast('Pick two different languages', 'err'); return }
    setBusy(true)
    try { await kt('/me', { method: 'PUT', json: { native_lang: native, learning_lang: learning, level, interests, daily_goal: Number(goal), onboarded: true } }); toast('You are all set!'); onDone() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  return (
    <Sheet open={open} onClose={() => {}} title="Welcome to Kotoba">
      <Text style={{ color: TH.sub, fontSize: 15 }}>Two quick questions so we can match you with the right people, missions and lessons.</Text>
      <LangPicker label="I speak" value={native} onChange={setNative} />
      <LangPicker label="I am learning" value={learning} onChange={setLearning} />
      <View><Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>My level</Text><Seg value={level} onChange={setLevel} options={LEVELS.map(l => ({ value: l, label: l }))} /></View>
      <View><Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>Things I like talking about</Text><InterestPicker value={interests} onChange={setInterests} /></View>
      <View><Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>Daily goal</Text><Seg value={goal} onChange={setGoal} options={['1', '3', '5', '10'].map(g => ({ value: g, label: g }))} /></View>
      <Btn kind="primary" label={busy ? 'Saving…' : 'Start learning'} disabled={busy} onPress={save} />
    </Sheet>
  )
}
