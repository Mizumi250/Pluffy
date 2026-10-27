'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/chat
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:48.327Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '../components/Avatar'
import { ComposeBox } from '../components/ComposeBox'
import { Diff } from '../components/Diff'
import { Empty } from '../components/Empty'
import { InterestPicker } from '../components/InterestPicker'
import { LangSelect } from '../components/LangSelect'
import { LessonPlayer } from '../components/LessonPlayer'
import { OnboardingSheet } from '../components/OnboardingSheet'
import { PostCard } from '../components/PostCard'
import { ProfileSheet } from '../components/ProfileSheet'
import { Ring } from '../components/Ring'
import { Segmented } from '../components/Segmented'
import { Sheet } from '../components/Sheet'
import { Skeletons } from '../components/Skeletons'
import { useProfile, useRealtime } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { kt, langFlag, langName, timeAgo, toast } from '../components/utils'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'

// Page component code (from @arkzen:page:chat)
const ChatPage = () => {
  const { profile } = useProfile()
  const [tab, setTab] = useState('dm')
  const [convs, setConvs] = useState<any[]>([])
  const [circles, setCircles] = useState<any[]>([])
  const [active, setActive] = useState<{ kind: 'dm' | 'circle'; id: number; title: string; sub?: string; color?: string } | null>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [fixing, setFixing] = useState<any | null>(null)
  const [fixText, setFixText] = useState('')
  const [fixNote, setFixNote] = useState('')
  const [sending, setSending] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)
  const me = profile?.user_id

  const loadLists = useCallback(async () => {
    try {
      const [c, ci] = await Promise.all([kt<any>('/conversations'), kt<any>('/circles')])
      setConvs(c.data); setCircles(ci.data.filter((x: any) => x.joined))
      return { convs: c.data, circles: ci.data.filter((x: any) => x.joined) }
    } catch { return { convs: [], circles: [] } }
  }, [])
  const open = useCallback(async (a: NonNullable<typeof active>) => {
    setActive(a); setMsgs([])
    try { const r = await kt<any>(`/messages?${a.kind === 'dm' ? 'conversation_id' : 'circle_id'}=${a.id}`); setMsgs(r.data) } catch (e) { toast(e instanceof Error ? e.message : 'Could not load messages', 'err') }
  }, [])
  const fromDm = (c: any) => ({ kind: 'dm' as const, id: c.id, title: c.with.display_name, sub: `${langFlag(c.with.native_lang)} ${langName(c.with.native_lang)}`, color: c.with.avatar_color })
  const fromCircle = (c: any) => ({ kind: 'circle' as const, id: c.id, title: `${c.emoji} ${c.name}`, sub: `${langName(c.lang)} · ${c.members_count} members`, color: '#0a84ff' })

  useEffect(() => {
    loadLists().then(l => {
      const m = window.location.hash.match(/#(c|circle)=(\d+)/)
      if (m) {
        const id = Number(m[2])
        if (m[1] === 'c') { const c = l.convs.find((x: any) => x.id === id); if (c) open(fromDm(c)) }
        else { setTab('circle'); const c = l.circles.find((x: any) => x.id === id); if (c) open(fromCircle(c)) }
      }
    })
  }, [])
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])

  useRealtime('kotoba.message-created', (raw: any) => {
    const m = raw?.data ?? raw
    if (!m) return
    const mine = active && ((active.kind === 'dm' && m.conversation_id === active.id) || (active.kind === 'circle' && m.circle_id === active.id))
    if (mine) setMsgs(list => list.some(x => x.id === m.id) ? list.map(x => x.id === m.id ? m : x) : [...list, m])
    else if (!m.updated) toast(`${m.sender_name}: ${String(m.body).slice(0, 60)}`)
    loadLists()
  })
  // Gentle polling fallback in case the socket is unavailable
  useEffect(() => {
    if (!active) return
    const t = setInterval(async () => {
      const last = msgs.length ? msgs[msgs.length - 1].id : 0
      try { const r = await kt<any>(`/messages?${active.kind === 'dm' ? 'conversation_id' : 'circle_id'}=${active.id}&after_id=${last}`); if (r.data.length) setMsgs(l => [...l, ...r.data.filter((n: any) => !l.some(x => x.id === n.id))]) } catch { /* ignore */ }
    }, 9000)
    return () => clearInterval(t)
  }, [active, msgs.length])

  const send = async () => {
    if (!text.trim() || !active) return
    setSending(true)
    try {
      const r = await kt<any>('/messages', { json: { body: text.trim(), lang: profile?.learning_lang, [active.kind === 'dm' ? 'conversation_id' : 'circle_id']: active.id } })
      setMsgs(l => [...l, r.data]); setText(''); loadLists()
    } catch (e) { toast(e instanceof Error ? e.message : 'Message not sent', 'err') }
    finally { setSending(false) }
  }
  const sendFix = async () => {
    if (!fixing || !fixText.trim() || fixText.trim() === fixing.body.trim()) { toast('Edit the text to suggest a correction', 'err'); return }
    try { const r = await kt<any>(`/messages/${fixing.id}/correct`, { json: { corrected: fixText.trim(), note: fixNote.trim() || null } }); setMsgs(l => l.map(x => x.id === fixing.id ? r.data : x)); setFixing(null); setFixNote(''); toast('Correction sent. +10 XP') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const saveWord = async (m: any) => {
    const s = window.getSelection()?.toString().trim() ?? ''
    if (!s) { toast('Select a word in the message first', 'err'); return }
    const meaning = window.prompt(`What does “${s}” mean?`)
    if (!meaning) return
    try { await kt('/vocab', { json: { term: s, meaning, lang: m.lang ?? profile?.learning_lang, example: m.body, source: 'chat' } }); toast('Saved to your deck') } catch (e) { toast('Could not save', 'err') }
  }

  const list = tab === 'dm' ? convs : circles
  return (
    <div className="kt-stack" style={{ gap: 16 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}><div><h1 className="kt-title">Messages</h1><p className="kt-subtitle">Chat, then fix each other’s mistakes in place.</p></div></div>
      <div className={`kt-chat ${active ? 'thread-open' : ''}`}>
        <div className="kt-chat-list kt-stack" style={{ gap: 10, minHeight: 0, overflowY: 'auto' }}>
          <Segmented value={tab} onChange={setTab} options={[{ value: 'dm', label: 'Direct' }, { value: 'circle', label: 'Circles' }]} />
          {list.length === 0 && <Empty icon={tab === 'dm' ? '💬' : '👥'} title={tab === 'dm' ? 'No chats yet' : 'No circles joined'} text={tab === 'dm' ? 'Find a partner and say hello.' : 'Join a study circle to chat in a group.'} />}
          <div className="kt-list">{list.map((c: any) => {
            const a = tab === 'dm' ? fromDm(c) : fromCircle(c)
            return (
              <button key={`${tab}${c.id}`} className={`kt-item ${active?.kind === a.kind && active.id === a.id ? 'on' : ''}`} onClick={() => open(a)}>
                {tab === 'dm' ? <Avatar name={c.with.display_name} color={c.with.avatar_color} /> : <div className="kt-avatar" style={{ width: 40, height: 40, background: 'var(--kt-surface2)', fontSize: 20 }}>{c.emoji}</div>}
                <div style={{ minWidth: 0, flex: 1 }}><div style={{ fontWeight: 600 }}>{tab === 'dm' ? c.with.display_name : c.name}</div><div className="kt-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab === 'dm' ? (c.last_message ?? 'Say hello 👋') : `${langName(c.lang)} · ${c.members_count} members`}</div></div>
              </button>
            )
          })}</div>
        </div>
        <div className="kt-card kt-chat-thread">
          {!active ? <div style={{ margin: 'auto', textAlign: 'center' }} className="kt-sub"><div style={{ fontSize: 40 }}>💬</div>Select a conversation</div> : (
            <>
              <div className="kt-row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--kt-line)' }}>
                <button className="kt-icon-btn kt-only-m" aria-label="Back" onClick={() => setActive(null)}>‹</button>
                <div><div style={{ fontWeight: 600 }}>{active.title}</div><div className="kt-sub">{active.sub}</div></div>
              </div>
              <div className="kt-chat-scroll">
                {msgs.length === 0 && <div className="kt-sub" style={{ margin: 'auto' }}>No messages yet. Write the first one in your target language!</div>}
                {msgs.map(m => {
                  const own = m.sender_id === me
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start', gap: 2 }}>
                      {!own && active.kind === 'circle' && <span className="kt-sub" style={{ fontSize: 12, marginLeft: 8 }}>{m.sender_name}</span>}
                      <div className={`kt-bubble ${own ? 'me' : 'them'}`}>{m.body}</div>
                      {m.corrected && <div className="kt-fix" style={{ maxWidth: '76%' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>✏️ Suggested</div><Diff from={m.body} to={m.corrected} />{m.note && <div className="kt-sub" style={{ marginTop: 4 }}>{m.note}</div>}</div>}
                      <div className="kt-row" style={{ gap: 2 }}>
                        <span className="kt-sub" style={{ fontSize: 11 }}>{timeAgo(m.created_at)}</span>
                        {!own && <button className="kt-btn ghost sm" style={{ height: 24, padding: '0 8px', fontSize: 12 }} onClick={() => { setFixing(m); setFixText(m.corrected ?? m.body) }}>Correct</button>}
                        <button className="kt-btn ghost sm" style={{ height: 24, padding: '0 8px', fontSize: 12 }} onClick={() => saveWord(m)}>Save word</button>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottom} />
              </div>
              <div className="kt-chat-input">
                <input className="kt-input" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder={`Write in ${langName(profile?.learning_lang)}…`} aria-label="Message" />
                <button className="kt-btn primary" onClick={send} disabled={sending || !text.trim()} aria-label="Send"><Send size={16} /></button>
              </div>
            </>
          )}
        </div>
      </div>
      <Sheet open={!!fixing} onClose={() => setFixing(null)} title="Suggest a correction">
        {fixing && <div className="kt-stack">
          <div className="kt-card flat"><div className="kt-label">Original</div>{fixing.body}</div>
          <div><label className="kt-label">Your correction</label><textarea className="kt-textarea" style={{ minHeight: 70 }} value={fixText} onChange={e => setFixText(e.target.value)} /></div>
          <div className="kt-card flat"><div className="kt-label">Preview</div><Diff from={fixing.body} to={fixText} /></div>
          <input className="kt-input" value={fixNote} onChange={e => setFixNote(e.target.value)} placeholder="Short explanation (optional but kind)" />
          <button className="kt-btn primary" onClick={sendFix}>Send correction</button>
        </div>}
      </Sheet>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Chat = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <ShellLayout>
    <AuthLayout requireAuth={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <ChatPage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Chat
