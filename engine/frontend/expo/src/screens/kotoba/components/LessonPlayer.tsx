// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — LessonPlayer [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.493Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'
import { kt, norm, shuffle, toast } from './utils'
import { Bar } from './Bar'
import { Btn } from './Btn'
import { Chip } from './Chip'
import { Empty } from './Empty'
import { Field } from './Field'

// ─── Lesson player ────────────────────────────────────────────
export const LessonPlayer = ({ lesson, onClose, onDone }: { lesson: any; onClose: () => void; onDone: () => void }) => {
  const data = useMemo(() => { try { return JSON.parse(lesson.content) } catch { return { ex: [], v: [] } } }, [lesson])
  const ex: any[] = data.ex ?? []
  const [i, setI] = useState(0)
  const [status, setStatus] = useState<'idle' | 'right' | 'wrong'>('idle')
  const [correct, setCorrect] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [picked, setPicked] = useState<number[]>([])
  const [left, setLeft] = useState<number | null>(null)
  const [done, setDone] = useState<number[]>([])
  const [result, setResult] = useState<{ xp: number; cards_added: number; score: number } | null>(null)
  const cur = ex[i]
  const order = useMemo<number[]>(() => shuffle<number>((cur?.o ?? cur?.w ?? []).map((_: any, k: number) => k)), [i, lesson])
  const rightOrder = useMemo<number[]>(() => shuffle<number>((cur?.p ?? []).map((_: any, k: number) => k)), [i, lesson])
  const reset = () => { setStatus('idle'); setSel(null); setTyped(''); setPicked([]); setLeft(null); setDone([]) }
  const verdict = (ok: boolean) => { setStatus(ok ? 'right' : 'wrong'); if (ok) setCorrect(c => c + 1) }
  const check = () => {
    if (cur.t === 'choose') verdict(sel === cur.a)
    else if (cur.t === 'type') verdict((cur.a as string[]).some(x => norm(x) === norm(typed)))
    else if (cur.t === 'order') verdict(picked.map(k => cur.w[k]).join('').replace(/\s/g, '') === String(cur.a).replace(/\s/g, ''))
  }
  const next = async () => {
    if (i + 1 < ex.length) { setI(i + 1); reset(); return }
    const score = Math.round((correct / Math.max(1, ex.length)) * 100)
    try { const r = await kt<{ xp: number; cards_added: number }>(`/lessons/${lesson.id}/complete`, { json: { score } }); setResult({ ...r, score }) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not save progress', 'err'); setResult({ xp: 0, cards_added: 0, score }) }
  }
  const pickMatch = (side: 'l' | 'r', k: number) => {
    if (status !== 'idle' || done.includes(k)) return
    if (side === 'l') { setLeft(k); return }
    if (left === null) return
    if (left === k) { const nd = [...done, k]; setDone(nd); setLeft(null); if (nd.length === cur.p.length) verdict(true) }
    else { setLeft(null); toast('Not a match, try again', 'err') }
  }
  const canCheck = cur?.t === 'choose' ? sel !== null : cur?.t === 'type' ? typed.trim().length > 0 : cur?.t === 'order' ? picked.length === cur.w.length : false
  const answerText = !cur ? '' : cur.t === 'choose' ? cur.o[cur.a] : cur.t === 'type' ? cur.a[0] : String(cur.a ?? '')

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: TH.bg, paddingTop: Platform.OS === 'ios' ? 54 : 30 }}>
        {result ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 10 }}>
            <Text style={{ fontSize: 64 }}>{result.score >= 70 ? '🎉' : '💪'}</Text>
            <Text style={{ fontSize: 44, fontWeight: '800', color: TH.text }}>{result.score}%</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: TH.text }}>{result.score >= 70 ? 'Nicely done!' : 'Good effort!'}</Text>
            <Text style={{ color: TH.sub, fontSize: 16, textAlign: 'center' }}>+{result.xp} XP{result.cards_added > 0 ? ` · ${result.cards_added} new words in your deck` : ''}</Text>
            <Btn kind="primary" label="Continue" onPress={onDone} style={{ alignSelf: 'stretch', marginTop: 20 }} />
          </View>
        ) : !cur ? <Empty title="This lesson is empty"><Btn label="Close" onPress={onClose} /></Empty> : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 10 }}>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Quit lesson" style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: TH.card, alignItems: 'center', justifyContent: 'center' }}><Text>✕</Text></TouchableOpacity>
              <View style={{ flex: 1 }}><Bar value={i} max={ex.length} /></View>
              <Text style={{ color: TH.sub }}>{i + 1}/{ex.length}</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: 26, fontWeight: '800', color: TH.text, marginBottom: 10 }}>{cur.q}</Text>
              {cur.t === 'choose' && order.map((k: number) => (
                <TouchableOpacity key={k} disabled={status !== 'idle'} onPress={() => setSel(k)} style={{ backgroundColor: TH.card, borderRadius: 16, padding: 18, borderWidth: 2, borderColor: sel === k ? TH.blue : 'transparent' }}><Text style={{ fontSize: 18, color: TH.text }}>{cur.o[k]}</Text></TouchableOpacity>
              ))}
              {cur.t === 'type' && <Field value={typed} onChangeText={setTyped} placeholder="Type your answer" />}
              {cur.t === 'order' && (
                <>
                  <View style={{ minHeight: 70, backgroundColor: TH.card, borderRadius: 16, padding: 10, flexDirection: 'row', flexWrap: 'wrap' }}>{picked.map((k, n) => <Chip key={n} on label={cur.w[k]} onPress={() => status === 'idle' && setPicked(picked.filter((_, m) => m !== n))} />)}</View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{order.filter((k: number) => !picked.includes(k)).map((k: number) => <Btn key={k} label={cur.w[k]} onPress={() => status === 'idle' && setPicked([...picked, k])} />)}</View>
                </>
              )}
              {cur.t === 'match' && (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 10 }}>{cur.p.map((pair: string[], k: number) => <TouchableOpacity key={k} disabled={done.includes(k)} onPress={() => pickMatch('l', k)} style={{ backgroundColor: TH.card, borderRadius: 14, padding: 16, opacity: done.includes(k) ? 0.35 : 1, borderWidth: 2, borderColor: left === k ? TH.blue : 'transparent' }}><Text style={{ fontSize: 16, textAlign: 'center', color: TH.text }}>{pair[0]}</Text></TouchableOpacity>)}</View>
                  <View style={{ flex: 1, gap: 10 }}>{rightOrder.map((k: number) => <TouchableOpacity key={k} disabled={done.includes(k)} onPress={() => pickMatch('r', k)} style={{ backgroundColor: TH.card, borderRadius: 14, padding: 16, opacity: done.includes(k) ? 0.35 : 1 }}><Text style={{ fontSize: 16, textAlign: 'center', color: TH.text }}>{cur.p[k][1]}</Text></TouchableOpacity>)}</View>
                </View>
              )}
            </ScrollView>
            <View style={{ padding: 20, paddingBottom: 34, backgroundColor: status === 'right' ? 'rgba(48,209,88,0.2)' : status === 'wrong' ? 'rgba(255,69,58,0.16)' : TH.card, gap: 10 }}>
              {status === 'right' && <Text style={{ color: '#1f9c43', fontWeight: '800', fontSize: 18 }}>Correct!</Text>}
              {status === 'wrong' && <View><Text style={{ color: TH.red, fontWeight: '800', fontSize: 18 }}>Not quite</Text>{cur.t !== 'match' && <Text style={{ color: TH.sub }}>Answer: {answerText}</Text>}</View>}
              {status === 'idle' ? (cur.t === 'match' ? <Btn label="Skip" onPress={() => verdict(false)} /> : <Btn kind="primary" label="Check" disabled={!canCheck} onPress={check} />) : <Btn kind="primary" label={i + 1 < ex.length ? 'Continue' : 'Finish'} onPress={next} />}
            </View>
          </>
        )}
      </View>
    </Modal>
  )
}

// ─── Profile + onboarding sheets ──────────────────────────────
