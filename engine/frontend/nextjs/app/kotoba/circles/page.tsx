'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/circles
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:58.546Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
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
import { LEVELS } from '../components/constants'
import { useApi, useNav, useProfile } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { toast } from '../components/utils'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'

// Page component code (from @arkzen:page:circles)
const CirclesPage = () => {
  const nav = useNav()
  const { profile } = useProfile()
  const [lang, setLang] = useState('all')
  const { data, loading, error, reload, setData } = useApi<{ data: any[] }>(`/circles${lang !== 'all' ? `?lang=${lang}` : ''}`, [lang])
  const [creating, setCreating] = useState(false)
  const [f, setF] = useState({ name: '', emoji: 'message-circle', lang: 'es', level: 'A1', description: '' })
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
  const emojis = ['message-circle', 'sun', 'flower', 'coffee', 'headphones', 'book-open', 'globe', 'gamepad', 'utensils', 'trophy']
  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">Circles</h1><p className="kt-subtitle">Small study groups with a shared language and level.</p></div>
        <div className="kt-row">
          <select className="kt-select" style={{ width: 'auto' }} value={lang} onChange={e => setLang(e.target.value)} aria-label="Language filter"><option value="all">All</option>{LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select>
          <button className="kt-btn primary" onClick={() => setCreating(true)}><Plus size={16} />New circle</button>
        </div>
      </div>
      {loading && !data && <Skeletons n={3} h={140} />}
      {error && <Empty icon="wifi-off" title="Could not load circles" text={error} action={<button className="kt-btn primary" onClick={reload}>Retry</button>} />}
      {data && data.data.length === 0 && <Empty icon="users" title="No circles here yet" text="Start one. Small groups with a clear goal are where people actually stick around." action={<button className="kt-btn primary" onClick={() => setCreating(true)}>Create a circle</button>} />}
      <div className="kt-grid c2">{data?.data.map(c => (
        <div key={c.id} className="kt-card kt-stack" style={{ gap: 10 }}>
          <div className="kt-row"><div className="kt-avatar" style={{ width: 52, height: 52, background: 'var(--kt-surface2)', fontSize: 26 }}><Ico n={c.emoji} size={24} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 17 }}>{c.name}</div><div className="kt-sub">{c.members_count} member{c.members_count === 1 ? '' : 's'}</div></div>
            <span className="kt-chip blue">{c.level}</span></div>
          {c.description && <p className="kt-sub" style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>{c.description}</p>}
          <div className="kt-row">
            {c.joined && <button className="kt-btn primary sm" style={{ flex: 1 }} onClick={() => nav.go(`chat#circle=${c.id}`)}><MessageCircle size={15} />Open chat</button>}
            <button className={`kt-btn sm ${c.joined ? '' : 'tint'}`} style={{ flex: c.joined ? undefined : 1 }} onClick={() => toggle(c)}>{c.joined ? 'Leave' : 'Join circle'}</button>
          </div>
        </div>
      ))}</div>
      <Sheet open={creating} onClose={() => setCreating(false)} title="New circle">
        <div className="kt-stack">
          <div><label className="kt-label">Icon</label><div className="kt-row kt-wrap">{emojis.map(e => <button key={e} className="kt-icon-btn" style={{ width: 42, height: 42, fontSize: 20, outline: f.emoji === e ? '3px solid var(--kt-text)' : 'none' }} onClick={() => setF({ ...f, emoji: e })} aria-label={`Icon ${e}`}><Ico n={e} size={20} /></button>)}</div></div>
          <div><label className="kt-label">Name</label><input className="kt-input" value={f.name} maxLength={80} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Tokyo Night Owls" /></div>
          <div className="kt-grid c2" style={{ gridTemplateColumns: '1fr 1fr' }}><LangSelect label="Language" value={f.lang} onChange={v => setF({ ...f, lang: v })} /><div><label className="kt-label">Level</label><select className="kt-select" value={f.level} onChange={e => setF({ ...f, level: e.target.value })}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div></div>
          <div><label className="kt-label">What is it for?</label><textarea className="kt-textarea" style={{ minHeight: 70 }} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Daily 5-minute check-ins, no pressure." /></div>
          <button className="kt-btn primary" disabled={busy || !f.name.trim()} onClick={create}>{busy ? 'Creating…' : 'Create circle'}</button>
        </div>
      </Sheet>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Circles = () => {
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
        <CirclesPage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Circles
