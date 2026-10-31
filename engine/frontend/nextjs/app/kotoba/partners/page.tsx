'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/partners
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:17.979Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '../components/Avatar'
import { ComposeBox } from '../components/ComposeBox'
import { Diff } from '../components/Diff'
import { Empty } from '../components/Empty'
import { Ico } from '../components/Ico'
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
import { useNav } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { toast } from '../components/utils'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'

// Page component code (from @arkzen:page:partners)
const PartnersPage = () => {
  const nav = useNav()
  const [mode, setMode] = useState('exchange')
  const [q, setQ] = useState('')
  const [list, setList] = useState<KProfile[] | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const load = useCallback(async () => {
    try { const r = await kt<{ data: KProfile[] }>(`/partners?mode=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}`); setList(r.data) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not load partners', 'err'); setList([]) }
  }, [mode, q])
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [load])
  const hello = async (p: KProfile) => {
    try { const r = await kt<{ data: { id: number } }>('/conversations', { json: { user_id: p.user_id } }); nav.go(`chat#c=${r.data.id}`) }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const follow = async (p: KProfile) => {
    try { const r = await kt<{ following: boolean }>(`/follow/${p.user_id}`, { json: {} }); setList(l => (l ?? []).map(x => x.user_id === p.user_id ? { ...x, following: r.following } : x)) }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}><div><h1 className="kt-title">Partners</h1><p className="kt-subtitle">People who speak what you are learning, and want what you speak.</p></div></div>
      <div className="kt-row kt-between kt-wrap">
        <Segmented value={mode} onChange={setMode} options={[{ value: 'exchange', label: 'Language exchange' }, { value: 'all', label: 'Everyone' }]} />
        <input className="kt-input" style={{ maxWidth: 280 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, interest or country" aria-label="Search partners" />
      </div>
      {list === null && <Skeletons n={3} h={150} />}
      {list && list.length === 0 && <Empty icon="compass" title="No matches yet" text="Try the Everyone tab, or invite a friend who speaks your target language." />}
      <div className="kt-grid c2">{list?.map(p => (
        <div key={p.id} className="kt-card kt-stack" style={{ gap: 12 }}>
          <div className="kt-row">
            <button style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }} aria-label={`Open ${p.display_name}`} onClick={() => setViewing(p.user_id)}><Avatar name={p.display_name} color={p.avatar_color} size={52} /></button>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 17 }}>{p.display_name}</div><div className="kt-sub">{p.country ?? '—'} · {p.streak} day streak</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 700, color: (p.score ?? 0) >= 70 ? '#3f6b4f' : 'var(--kt-blue)' }}>{p.score}%</div><div className="kt-sub" style={{ fontSize: 11 }}>match</div></div>
          </div>
          <div className="kt-row kt-wrap"><span className="kt-chip green">Speaks {langName(p.native_lang)}</span><span className="kt-chip blue">Learning {p.level}</span>{p.shared?.slice(0, 3).map(s => <span key={s} className="kt-chip purple">{s}</span>)}</div>
          {p.bio && <p className="kt-sub" style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>{p.bio}</p>}
          <div className="kt-row"><button className="kt-btn primary sm" style={{ flex: 1 }} onClick={() => hello(p)}><MessageCircle size={15} />Say hello</button><button className="kt-btn sm" onClick={() => follow(p)}>{p.following ? 'Following' : 'Follow'}</button></div>
        </div>
      ))}</div>
      <ProfileSheet userId={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Partners = () => {
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
        <PartnersPage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Partners
