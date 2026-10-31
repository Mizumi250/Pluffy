'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/learn
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:15.510Z
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
import { useApi, useProfile } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'

// Page component code (from @arkzen:page:learn)
const LearnPage = () => {
  const { profile } = useProfile()
  const [lang, setLang] = useState<string | null>(null)
  const active = lang ?? profile?.learning_lang ?? null
  const { data, loading, error, reload } = useApi<{ data: any[] }>(active ? `/lessons?lang=${active}` : null)
  const [playing, setPlaying] = useState<any | null>(null)
  const lessons = data?.data ?? []
  const units = Array.from(new Set(lessons.map(l => l.unit)))
  const doneCount = lessons.filter(l => l.done).length

  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">Learn</h1><p className="kt-subtitle">Short lessons built around phrases you will actually say.</p></div>
        <select className="kt-select" style={{ width: 'auto' }} value={active ?? ''} onChange={e => setLang(e.target.value)} aria-label="Language">
          {LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>
      {lessons.length > 0 && <div className="kt-card"><div className="kt-row kt-between"><b>{langName(active)} path</b><span className="kt-sub">{doneCount}/{lessons.length} lessons</span></div><div className="kt-bar" style={{ marginTop: 10 }}><div style={{ width: `${(doneCount / lessons.length) * 100}%` }} /></div></div>}
      {(loading && !data) && <Skeletons n={3} h={100} />}
      {error && <Empty icon="wifi-off" title="Could not load lessons" text={error} action={<button className="kt-btn primary" onClick={reload}>Retry</button>} />}
      {data && lessons.length === 0 && <Empty icon="globe" title={`Lessons for ${langName(active)} are on the way`} text="Meanwhile the fastest way to learn is to write in the community, chat with a partner and build your deck. Or try a language with lessons available." action={<div className="kt-row" style={{ justifyContent: 'center' }}>{['es', 'ja', 'en'].map(c => <button key={c} className="kt-btn tint sm" onClick={() => setLang(c)}>{langName(c)}</button>)}</div>} />}
      {units.map(u => (
        <section key={u as string}>
          <h2 className="kt-h2" style={{ marginBottom: 12 }}>{u as string}</h2>
          <div className="kt-grid c3">{lessons.filter(l => l.unit === u).map(l => (
            <button key={l.id} className="kt-card" onClick={() => setPlaying(l)} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', position: 'relative' }}>
              <Ico n={l.emoji ?? 'book'} size={30} />
              <div style={{ fontWeight: 600, fontSize: 17, margin: '8px 0 4px' }}>{l.title}</div>
              <div className="kt-row kt-wrap"><span className="kt-chip">{l.level}</span><span className="kt-chip orange">+{l.xp} XP</span>{l.done && <span className="kt-chip green"><Check size={12} />Best {l.best}%</span>}</div>
            </button>
          ))}</div>
        </section>
      ))}
      {playing && <LessonPlayer lesson={playing} onClose={() => setPlaying(null)} onDone={() => { setPlaying(null); reload() }} />}
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Learn = () => {
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
        <LearnPage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Learn
