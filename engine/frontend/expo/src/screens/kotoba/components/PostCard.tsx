// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — PostCard [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:07.220Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'
import { kt, langFlag, langName, timeAgo, toast } from './utils'
import type { KComment, KPost } from './types'
import { Avatar } from './Avatar'
import { Btn } from './Btn'
import { Card } from './Card'
import { Chip } from './Chip'
import { Diff } from './Diff'
import { Field } from './Field'
import { Seg } from './Seg'
import { Sheet } from './Sheet'

// ─── Post card ────────────────────────────────────────────────
export const PostCard = ({ post, meId, onProfile, onDeleted }: { post: KPost; meId?: number; onProfile?: (id: number) => void; onDeleted?: (id: number) => void }) => {
  const [p, setP] = useState<KPost>(post)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<KComment[] | null>(null)
  const [mode, setMode] = useState('comment')
  const [text, setText] = useState('')
  const [fixed, setFixed] = useState(post.body)
  const [why, setWhy] = useState('')
  const [showTr, setShowTr] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => setP(post), [post])
  const mine = meId === p.user_id

  const like = async () => {
    setP(x => ({ ...x, liked: !x.liked, likes_count: x.likes_count + (x.liked ? -1 : 1) }))
    try { const r = await kt<{ liked: boolean; likes_count: number }>(`/posts/${p.id}/like`, { json: {} }); setP(x => ({ ...x, liked: r.liked, likes_count: r.likes_count })) } catch { setP(post) }
  }
  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && comments === null) { try { const r = await kt<{ data: KComment[] }>(`/posts/${p.id}/comments`); setComments(r.data) } catch { toast('Could not load comments', 'err') } }
  }
  const send = async () => {
    if (!text.trim()) return
    if (mode === 'fix' && (!fixed.trim() || fixed.trim() === p.body.trim())) { toast('Edit the text to suggest a correction', 'err'); return }
    setBusy(true)
    try {
      const r = await kt<{ data: KComment }>(`/posts/${p.id}/comments`, { json: { body: text.trim(), is_correction: mode === 'fix', corrected: mode === 'fix' ? fixed.trim() : null, explanation: mode === 'fix' ? why.trim() || null : null } })
      setComments(c => [...(c ?? []), r.data])
      setP(x => ({ ...x, comments_count: x.comments_count + 1, corrections_count: x.corrections_count + (r.data.is_correction ? 1 : 0) }))
      setText(''); setWhy(''); setMode('comment'); setFixed(p.body)
      toast(r.data.is_correction ? 'Correction sent. +15 XP' : 'Comment sent. +5 XP')
    } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const accept = async (c: KComment) => {
    try { await kt(`/comments/${c.id}/accept`, { json: {} }); setComments(l => (l ?? []).map(x => x.id === c.id ? { ...x, accepted: true } : x)); toast('Correction accepted') } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const save = async () => {
    if (!term.trim() || !meaning.trim()) return
    try { await kt('/vocab', { json: { term: term.trim(), meaning: meaning.trim(), lang: p.lang, example: p.body, source: 'feed' } }); toast(`Saved “${term.trim()}”`); setSaveOpen(false); setTerm(''); setMeaning('') } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const remove = async () => { try { await kt(`/posts/${p.id}`, { method: 'DELETE' }); onDeleted?.(p.id) } catch { toast('Could not delete', 'err') } }
  const words = /\s/.test(p.body) ? p.body.split(/(\s+)/) : [p.body]

  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={() => onProfile?.(p.user_id)} accessibilityLabel={`Open ${p.author_name}`}><Avatar name={p.author_name} color={p.author_color} /></TouchableOpacity>
        <View style={{ flex: 1 }}><Text style={{ fontWeight: '600', fontSize: 16, color: TH.text }}>{p.author_name}</Text><Text style={{ color: TH.sub, fontSize: 13 }}>Native {langName(p.author_native)} · {timeAgo(p.created_at)}</Text></View>
        <Chip tone="blue" label={`${langFlag(p.lang)} ${langName(p.lang)}`} />
      </View>
      <Text style={{ fontSize: 18, lineHeight: 27, color: TH.text }}>
        {words.map((w, i) => /^\s+$/.test(w) || w.length > 40 ? <Text key={i}>{w}</Text> : <Text key={i} onPress={() => { setTerm(w.replace(/[.,!?¡¿;:()"“”]/g, '')); setSaveOpen(true) }}>{w}</Text>)}
      </Text>
      {p.translation && <TouchableOpacity onPress={() => setShowTr(s => !s)}><Text style={{ color: TH.blue, fontSize: 14, fontWeight: '600' }}>{showTr ? 'Hide translation' : 'Show translation'}</Text>{showTr && <Text style={{ color: TH.sub, fontSize: 15, marginTop: 4 }}>{p.translation}</Text>}</TouchableOpacity>}
      <Text style={{ color: TH.sub, fontSize: 12 }}>Tip: tap any word to save it to your deck.</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Btn small kind="ghost" label={`${p.liked ? '❤️' : '🤍'} ${p.likes_count}`} onPress={like} />
        <Btn small kind="ghost" label={`💬 ${p.comments_count}`} onPress={toggle} />
        {p.corrections_count > 0 ? <Chip tone="green" label={`✓ ${p.corrections_count} correction${p.corrections_count > 1 ? 's' : ''}`} /> : !mine ? <Chip tone="orange" label="Needs feedback" /> : null}
        {mine && <Btn small kind="ghost" label="Delete" onPress={remove} />}
      </View>
      {open && (
        <View style={{ gap: 12, borderTopWidth: 1, borderTopColor: TH.line, paddingTop: 12 }}>
          {comments === null && <ActivityIndicator />}
          {comments?.length === 0 && <Text style={{ color: TH.sub }}>No comments yet. Be the first to help.</Text>}
          {comments?.map(c => (
            <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
              <Avatar name={c.author_name} color={c.author_color} size={30} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 14, color: TH.text }}><Text style={{ fontWeight: '700' }}>{c.author_name}</Text> <Text style={{ color: TH.sub }}>{timeAgo(c.created_at)}</Text></Text>
                <Text style={{ fontSize: 15, color: TH.text }}>{c.body}</Text>
                {c.is_correction && c.corrected && (
                  <View style={{ backgroundColor: 'rgba(48,209,88,0.14)', borderRadius: 14, padding: 10, gap: 6, borderWidth: 1, borderColor: 'rgba(48,209,88,0.35)' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: TH.text }}>✏️ Suggested correction {c.accepted ? '· Accepted' : ''}</Text>
                    <Diff from={p.body} to={c.corrected} />
                    {c.explanation && <Text style={{ color: TH.sub, fontSize: 14 }}>{c.explanation}</Text>}
                    {mine && !c.accepted && <Btn small kind="tint" label="Accept and thank" onPress={() => accept(c)} />}
                  </View>
                )}
              </View>
            </View>
          ))}
          {!mine && <Seg value={mode} onChange={setMode} options={[{ value: 'comment', label: 'Comment' }, { value: 'fix', label: 'Suggest correction' }]} />}
          {mode === 'fix' && <><Field value={fixed} onChangeText={setFixed} multiline autoCap="sentences" /><Field value={why} onChangeText={setWhy} placeholder="Why? A short explanation helps" autoCap="sentences" /></>}
          <Field value={text} onChangeText={setText} placeholder={mode === 'fix' ? 'Add a friendly note' : 'Write a comment'} autoCap="sentences" />
          <Btn kind="primary" label={busy ? 'Sending…' : 'Send'} disabled={busy || !text.trim()} onPress={send} />
        </View>
      )}
      <Sheet open={saveOpen} onClose={() => setSaveOpen(false)} title="Save to your deck">
        <Field label="Word or phrase" value={term} onChangeText={setTerm} />
        <Field label="Meaning" value={meaning} onChangeText={setMeaning} autoCap="sentences" />
        <Btn kind="primary" label="Save" disabled={!term.trim() || !meaning.trim()} onPress={save} />
      </Sheet>
    </Card>
  )
}

// ─── Lesson player ────────────────────────────────────────────
