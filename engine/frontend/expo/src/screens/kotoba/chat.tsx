// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/chat
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
import { useProfile, useRealtime } from './components/hooks'
import { kt, langName, pending, timeAgo, toast } from './components/utils'

// User screen (from @arkzen:native:page:chat)
const ChatScreen = () => {
  const { profile } = useProfile()
  const [tab, setTab] = useState('dm')
  const [convs, setConvs] = useState<any[]>([])
  const [circles, setCircles] = useState<any[]>([])
  const [active, setActive] = useState<{ kind: 'dm' | 'circle'; id: number; title: string; sub?: string } | null>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [fixing, setFixing] = useState<any | null>(null)
  const [fixText, setFixText] = useState('')
  const [fixNote, setFixNote] = useState('')
  const [saving, setSaving] = useState<any | null>(null)
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [sending, setSending] = useState(false)
  const scroller = useRef<ScrollView>(null)
  const me = profile?.user_id

  const loadLists = useCallback(async () => {
    try {
      const [c, ci] = await Promise.all([kt<any>('/conversations'), kt<any>('/circles')])
      const joined = ci.data.filter((x: any) => x.joined)
      setConvs(c.data); setCircles(joined)
      return { convs: c.data, circles: joined }
    } catch { return { convs: [], circles: [] } }
  }, [])
  const open = useCallback(async (a: NonNullable<typeof active>) => {
    setActive(a); setMsgs([])
    try { const r = await kt<any>(`/messages?${a.kind === 'dm' ? 'conversation_id' : 'circle_id'}=${a.id}`); setMsgs(r.data) } catch (e) { toast(e instanceof Error ? e.message : 'Could not load messages', 'err') }
  }, [])
  const fromDm = (c: any) => ({ kind: 'dm' as const, id: c.id, title: c.with.display_name, sub: `${langName(c.with.native_lang)}` })
  const fromCircle = (c: any) => ({ kind: 'circle' as const, id: c.id, title: c.name, sub: `${langName(c.lang)} · ${c.members_count} members` })

  useEffect(() => {
    loadLists().then(l => {
      const t = pending.chat
      pending.chat = null
      if (!t) return
      if (t.kind === 'dm') { const c = l.convs.find((x: any) => x.id === t.id); if (c) open(fromDm(c)) }
      else { setTab('circle'); const c = l.circles.find((x: any) => x.id === t.id); if (c) open(fromCircle(c)) }
    })
  }, [])

  useRealtime('kotoba.message-created', (raw: any) => {
    const m = raw?.data ?? raw
    if (!m) return
    const mine = active && ((active.kind === 'dm' && m.conversation_id === active.id) || (active.kind === 'circle' && m.circle_id === active.id))
    if (mine) setMsgs(list => list.some(x => x.id === m.id) ? list.map(x => x.id === m.id ? m : x) : [...list, m])
    loadLists()
  })
  useEffect(() => {
    if (!active) return
    const t = setInterval(async () => {
      const last = msgs.length ? msgs[msgs.length - 1].id : 0
      try { const r = await kt<any>(`/messages?${active.kind === 'dm' ? 'conversation_id' : 'circle_id'}=${active.id}&after_id=${last}`); if (r.data.length) setMsgs(l => [...l, ...r.data.filter((n: any) => !l.some(x => x.id === n.id))]) } catch { /* ignore */ }
    }, 7000)
    return () => clearInterval(t)
  }, [active, msgs.length])

  const send = async () => {
    if (!text.trim() || !active) return
    setSending(true)
    try {
      const r = await kt<any>('/messages', { json: { body: text.trim(), lang: profile?.learning_lang, [active.kind === 'dm' ? 'conversation_id' : 'circle_id']: active.id } })
      setMsgs(l => [...l, r.data]); setText(''); loadLists()
      setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50)
    } catch (e) { toast(e instanceof Error ? e.message : 'Message not sent', 'err') }
    finally { setSending(false) }
  }
  const sendFix = async () => {
    if (!fixing || !fixText.trim() || fixText.trim() === fixing.body.trim()) { toast('Edit the text to suggest a correction', 'err'); return }
    try { const r = await kt<any>(`/messages/${fixing.id}/correct`, { json: { corrected: fixText.trim(), note: fixNote.trim() || null } }); setMsgs(l => l.map(x => x.id === fixing.id ? r.data : x)); setFixing(null); setFixNote(''); toast('Correction sent. +10 XP') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const saveWord = async () => {
    if (!saving || !term.trim() || !meaning.trim()) return
    try { await kt('/vocab', { json: { term: term.trim(), meaning: meaning.trim(), lang: saving.lang ?? profile?.learning_lang, example: saving.body, source: 'chat' } }); toast('Saved to your deck'); setSaving(null); setTerm(''); setMeaning('') } catch { toast('Could not save', 'err') }
  }

  if (active) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: TH.card, borderBottomWidth: 1, borderBottomColor: TH.line }}>
          <TouchableOpacity onPress={() => { setActive(null); loadLists() }} accessibilityLabel="Back" style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20, color: TH.blue }}>‹</Text></TouchableOpacity>
          <View><Text style={{ fontWeight: '700', fontSize: 17, color: TH.text }}>{active.title}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>{active.sub}</Text></View>
        </View>
        <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 10 }} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })} keyboardShouldPersistTaps="handled">
          {msgs.length === 0 && <Text style={{ color: TH.sub, textAlign: 'center', marginTop: 40 }}>No messages yet. Write the first one in your target language!</Text>}
          {msgs.map(m => {
            const own = m.sender_id === me
            return (
              <View key={m.id} style={{ alignItems: own ? 'flex-end' : 'flex-start', gap: 3 }}>
                {!own && active.kind === 'circle' && <Text style={{ color: TH.sub, fontSize: 12, marginLeft: 8 }}>{m.sender_name}</Text>}
                <View style={{ maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: own ? TH.blue : TH.fill, borderBottomRightRadius: own ? 6 : 20, borderBottomLeftRadius: own ? 20 : 6 }}><Text style={{ fontSize: 16, color: own ? TH.card : TH.text }}>{m.body}</Text></View>
                {m.corrected && <View style={{ maxWidth: '80%', padding: 10, borderRadius: 14, backgroundColor: 'rgba(63, 107, 79, 0.14)', borderWidth: 1, borderColor: 'rgba(63, 107, 79, 0.35)', gap: 4 }}><Text style={{ fontSize: 12, fontWeight: '700', color: TH.text }}>Suggested</Text><Diff from={m.body} to={m.corrected} size={14} />{m.note && <Text style={{ color: TH.sub, fontSize: 13 }}>{m.note}</Text>}</View>}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: TH.sub, fontSize: 11 }}>{timeAgo(m.created_at)}</Text>
                  {!own && <Btn small kind="ghost" label="Correct" onPress={() => { setFixing(m); setFixText(m.corrected ?? m.body) }} style={{ height: 26, paddingHorizontal: 8 }} />}
                  <Btn small kind="ghost" label="Save word" onPress={() => { setSaving(m); setTerm('') ; setMeaning('') }} style={{ height: 26, paddingHorizontal: 8 }} />
                </View>
              </View>
            )
          })}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 8, padding: 10, backgroundColor: TH.card, borderTopWidth: 1, borderTopColor: TH.line, alignItems: 'center' }}>
          <View style={{ flex: 1 }}><Field value={text} onChangeText={setText} placeholder={`Write in ${langName(profile?.learning_lang)}…`} autoCap="sentences" /></View>
          <Btn kind="primary" label="Send" disabled={sending || !text.trim()} onPress={send} />
        </View>
        <Sheet open={!!fixing} onClose={() => setFixing(null)} title="Suggest a correction">
          {fixing && <><Card style={{ backgroundColor: TH.fill, shadowOpacity: 0 }}><Text style={{ color: TH.sub, fontSize: 12, fontWeight: '700' }}>ORIGINAL</Text><Text style={{ fontSize: 16, color: TH.text }}>{fixing.body}</Text></Card>
            <Field label="Your correction" value={fixText} onChangeText={setFixText} multiline autoCap="sentences" />
            <Card style={{ backgroundColor: TH.fill, shadowOpacity: 0 }}><Diff from={fixing.body} to={fixText} /></Card>
            <Field value={fixNote} onChangeText={setFixNote} placeholder="Short explanation (optional but kind)" autoCap="sentences" />
            <Btn kind="primary" label="Send correction" onPress={sendFix} /></>}
        </Sheet>
        <Sheet open={!!saving} onClose={() => setSaving(null)} title="Save a word">
          {saving && <><Text style={{ color: TH.sub, fontSize: 15 }}>“{saving.body}”</Text><Field label="Word or phrase" value={term} onChangeText={setTerm} /><Field label="Meaning" value={meaning} onChangeText={setMeaning} autoCap="sentences" /><Btn kind="primary" label="Save to deck" disabled={!term.trim() || !meaning.trim()} onPress={saveWord} /></>}
        </Sheet>
      </KeyboardAvoidingView>
    )
  }

  const list = tab === 'dm' ? convs : circles
  return (
    <Screen title="Messages" subtitle="Chat, then fix each other’s mistakes in place." onRefresh={loadLists} refreshing={false}>
      <Seg value={tab} onChange={setTab} options={[{ value: 'dm', label: 'Direct' }, { value: 'circle', label: 'Circles' }]} />
      {list.length === 0 && <Empty icon={tab === 'dm' ? 'message-circle' : 'users'} title={tab === 'dm' ? 'No chats yet' : 'No circles joined'} text={tab === 'dm' ? 'Find a partner and say hello.' : 'Join a study circle to chat in a group.'} />}
      {list.map((c: any) => (
        <Card key={`${tab}${c.id}`} onPress={() => open(tab === 'dm' ? fromDm(c) : fromCircle(c))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          {tab === 'dm' ? <Avatar name={c.with.display_name} color={c.with.avatar_color} /> : <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center' }}><Ico n={c.emoji} size={19} /></View>}
          <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 16, color: TH.text }}>{tab === 'dm' ? c.with.display_name : c.name}</Text><Text numberOfLines={1} style={{ color: TH.sub }}>{tab === 'dm' ? (c.last_message ?? 'Say hello') : `${langName(c.lang)} · ${c.members_count} members`}</Text></View>
          <Text style={{ color: TH.sub, fontSize: 22 }}>›</Text>
        </Card>
      ))}
    </Screen>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Chat() {
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
        <ChatScreen />
      </ScrollView>
      </AuthLayout>
      </ShellLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Chat
