// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/review
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
import { SHADOW, TH } from './components/constants'
import { useProfile } from './components/hooks'
import { kt, langFlag, langName, shuffle, toast } from './components/utils'

// User screen (from @arkzen:native:page:review)
const ReviewScreen = () => {
  const { profile } = useProfile()
  const [tab, setTab] = useState('review')
  const [q, setQ] = useState('')
  const [queue, setQueue] = useState<any[]>([])
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ total: 0, due: 0 })
  const [deck, setDeck] = useState<any[]>([])
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [lang, setLang] = useState('es')
  useEffect(() => { if (profile) setLang(profile.learning_lang) }, [profile?.id])

  const loadDue = useCallback(async () => {
    setLoading(true)
    try { const r = await kt<any>('/vocab?due=1'); setQueue(shuffle(r.data)); setCounts({ total: r.total, due: r.due_count }); setFlipped(false); setReviewed(0) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not load cards', 'err') }
    finally { setLoading(false) }
  }, [])
  const loadDeck = useCallback(async () => {
    try { const r = await kt<any>(`/vocab${q ? `?q=${encodeURIComponent(q)}` : ''}`); setDeck(r.data); setCounts({ total: r.total, due: r.due_count }) } catch { /* ignore */ }
  }, [q])
  useEffect(() => { loadDue() }, [loadDue])
  useEffect(() => { if (tab === 'deck') loadDeck() }, [tab, loadDeck])

  const card = queue[0]
  const grade = async (g: number) => {
    if (!card) return
    const c = card
    setQueue(list => g === 0 ? [...list.slice(1), c] : list.slice(1)); setFlipped(false); if (g > 0) setReviewed(n => n + 1)
    try { await kt(`/vocab/${c.id}/review`, { json: { grade: g } }) } catch { toast('Could not save that review', 'err') }
  }
  const add = async () => {
    if (!term.trim() || !meaning.trim()) return
    try { const r = await kt<any>('/vocab', { json: { term: term.trim(), meaning: meaning.trim(), example: example.trim() || null, lang, source: 'manual' } }); toast(r.created ? 'Added to your deck' : 'Already in your deck', r.created ? 'ok' : 'err'); setTerm(''); setMeaning(''); setExample('') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const remove = async (id: number) => { try { await kt(`/vocab/${id}`, { method: 'DELETE' }); setDeck(d => d.filter(x => x.id !== id)) } catch { toast('Could not delete', 'err') } }
  const grades: [string, string][] = [['Again', TH.red], ['Hard', TH.orange], ['Good', TH.blue], ['Easy', TH.green]]

  return (
    <Screen title="Review" subtitle={`${counts.due} due · ${counts.total} words`} onRefresh={tab === 'deck' ? loadDeck : loadDue} refreshing={false}>
      <Seg value={tab} onChange={setTab} options={[{ value: 'review', label: 'Review' }, { value: 'deck', label: 'Deck' }, { value: 'add', label: 'Add word' }]} />
      {tab === 'review' && (loading ? <Skel n={1} h={260} /> : card ? (
        <View style={{ gap: 14 }}>
          <Bar value={reviewed} max={reviewed + queue.length} />
          <TouchableOpacity activeOpacity={0.9} onPress={() => setFlipped(f => !f)} accessibilityLabel="Flip card">
            <Card style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }}>
              <Chip tone="blue" label={`${langFlag(card.lang)} ${langName(card.lang)}`} />
              <Text style={{ fontSize: 38, fontWeight: '800', color: TH.text, textAlign: 'center' }}>{card.term}</Text>
              {flipped ? <><Text style={{ fontSize: 24, color: TH.blue, textAlign: 'center' }}>{card.meaning}</Text>{card.example && <Text style={{ color: TH.sub, fontStyle: 'italic', textAlign: 'center' }}>“{String(card.example).slice(0, 140)}”</Text>}</> : <Text style={{ color: TH.sub }}>Tap to reveal</Text>}
            </Card>
          </TouchableOpacity>
          {flipped ? <View style={{ flexDirection: 'row', gap: 8 }}>{grades.map(([l, c], n) => <TouchableOpacity key={l} accessibilityLabel={l} onPress={() => grade(n)} style={{ flex: 1, height: 54, borderRadius: 14, backgroundColor: TH.card, alignItems: 'center', justifyContent: 'center', ...SHADOW }}><Text style={{ color: c, fontWeight: '700' }}>{l}</Text></TouchableOpacity>)}</View> : <Btn kind="primary" label="Show answer" onPress={() => setFlipped(true)} />}
        </View>
      ) : (
        <Empty icon="🎉" title={counts.total === 0 ? 'Your deck is empty' : 'All caught up!'} text={counts.total === 0 ? 'Finish a lesson, tap words in the feed, or add your own.' : `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}. Your next cards are scheduled.`}><Btn kind="primary" label="Add a word" onPress={() => setTab('add')} /></Empty>
      ))}
      {tab === 'deck' && (
        <View style={{ gap: 12 }}>
          <Field value={q} onChangeText={setQ} placeholder="Search your deck" />
          {deck.length === 0 ? <Empty icon="🗂️" title="No cards found" /> : deck.map(c => (
            <Card key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
              <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 16, color: TH.text }}>{c.term} {langFlag(c.lang)}</Text><Text style={{ color: TH.sub }}>{c.meaning}</Text></View>
              <Chip tone={c.reps >= 4 ? 'green' : c.reps > 0 ? 'blue' : 'gray'} label={c.reps >= 4 ? 'Mastered' : c.reps > 0 ? `${c.reps}x` : 'New'} />
              <TouchableOpacity accessibilityLabel={`Delete ${c.term}`} onPress={() => remove(c.id)}><Text style={{ color: TH.sub, fontSize: 18 }}>✕</Text></TouchableOpacity>
            </Card>
          ))}
        </View>
      )}
      {tab === 'add' && (
        <Card style={{ gap: 14 }}>
          <LangPicker label="Language" value={lang} onChange={setLang} />
          <Field label="Word or phrase" value={term} onChangeText={setTerm} />
          <Field label="Meaning" value={meaning} onChangeText={setMeaning} autoCap="sentences" />
          <Field label="Example sentence (optional)" value={example} onChangeText={setExample} autoCap="sentences" />
          <Btn kind="primary" label="Add to deck" disabled={!term.trim() || !meaning.trim()} onPress={add} />
        </Card>
      )}
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Review() {
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
        <ReviewScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Review
