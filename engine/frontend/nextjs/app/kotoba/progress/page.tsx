'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/progress
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:17.862Z
// ============================================================

import React, { useEffect, useRef } from 'react'
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
import { useApi } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'

// Page component code (from @arkzen:page:progress)
const ProgressPage = () => {
  const { data, loading, error, reload } = useApi<any>('/progress')
  if (loading && !data) return <Skeletons n={4} h={140} />
  if (error || !data) return <Empty icon="wifi-off" title="Could not load progress" text={error ?? ''} action={<button className="kt-btn primary" onClick={reload}>Retry</button>} />
  const p: KProfile = data.profile
  const s = data.stats
  const series: { date: string; count: number }[] = data.series
  const max = Math.max(1, ...series.map(x => x.count))
  const activeDays = series.filter(x => x.count > 0).length
  const badges = [
    { e: 'pen-line', t: 'First post', ok: s.posts >= 1 }, { e: 'flame', t: '7-day streak', ok: p.best_streak >= 7 },
    { e: 'brain', t: '25 words', ok: s.cards >= 25 }, { e: 'graduation-cap', t: '3 lessons', ok: s.lessons >= 3 },
    { e: 'handshake', t: 'First correction', ok: s.corrections_given >= 1 }, { e: 'message-circle', t: '50 messages', ok: s.messages_sent >= 50 },
    { e: 'medal', t: 'Word master', ok: s.mastered >= 10 }, { e: 'star', t: 'Level 5', ok: data.level >= 5 },
  ]
  const tiles = [
    ['Words written', s.words_written, 'pen-line'], ['Messages sent', s.messages_sent, 'message-circle'], ['Posts', s.posts, 'file-text'], ['Lessons done', s.lessons, 'graduation-cap'],
    ['Words in deck', s.cards, 'layers'], ['Mastered', s.mastered, 'medal'], ['Corrections given', s.corrections_given, 'handshake'], ['Corrections received', s.corrections_received, 'pencil'],
  ]
  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}><div><h1 className="kt-title">Progress</h1><p className="kt-subtitle">What you produce matters more than what you tap.</p></div></div>
      <div className="kt-grid c3">
        <div className="kt-card" style={{ display: 'grid', placeItems: 'center', gap: 10, textAlign: 'center' }}>
          <Ring value={data.level_progress} max={100} size={140} stroke={14} color="#4a4a4a"><div><div style={{ fontSize: 34, fontWeight: 700 }}>{data.level}</div><div className="kt-sub">level</div></div></Ring>
          <div className="kt-sub">{p.xp} XP · {100 - data.level_progress} to next level</div>
        </div>
        <div className="kt-card" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div style={{ display: 'grid', placeItems: 'center', marginBottom: 6 }}><Ico n="flame" size={44} /></div><div style={{ fontSize: 40, fontWeight: 700 }}>{p.streak}</div><div className="kt-sub">day streak · best {p.best_streak}</div></div></div>
        <div className="kt-card" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div style={{ display: 'grid', placeItems: 'center', marginBottom: 6 }}><Ico n="calendar" size={44} /></div><div style={{ fontSize: 40, fontWeight: 700 }}>{activeDays}<span className="kt-sub" style={{ fontSize: 20 }}>/14</span></div><div className="kt-sub">active days, last two weeks</div></div></div>
      </div>
      <div className="kt-card">
        <div className="kt-row kt-between" style={{ marginBottom: 14 }}><h2 className="kt-h2">Last 14 days</h2><span className="kt-sub">posts, messages and lessons</span></div>
        <div className="kt-bars" role="img" aria-label="Activity over the last 14 days">{series.map(d => <div key={d.date} title={`${d.date}: ${d.count}`} style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.18 }} />)}</div>
        <div className="kt-row kt-between kt-sub" style={{ marginTop: 8, fontSize: 12 }}><span>{series[0]?.date.slice(5)}</span><span>today</span></div>
      </div>
      <div className="kt-grid c4 keep2">{tiles.map(t => <div key={t[0] as string} className="kt-card" style={{ padding: 16 }}><Ico n={t[2] as string} size={22} /><div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{t[1]}</div><div className="kt-sub">{t[0]}</div></div>)}</div>
      {s.corrections_received > 0 && <div className="kt-card"><div className="kt-row kt-between"><b>Corrections you accepted</b><span className="kt-sub">{s.corrections_accepted}/{s.corrections_received}</span></div><div className="kt-bar" style={{ marginTop: 10 }}><div style={{ width: `${(s.corrections_accepted / s.corrections_received) * 100}%`, background: '#3f6b4f' }} /></div><p className="kt-sub" style={{ margin: '10px 0 0' }}>Accepting a fix is how it sticks. Review the ones you skipped.</p></div>}
      <div><h2 className="kt-h2" style={{ marginBottom: 12 }}>Milestones</h2><div className="kt-grid c4 keep2">{badges.map(b => <div key={b.t} className="kt-card" style={{ padding: 16, textAlign: 'center', opacity: b.ok ? 1 : 0.4 }}><div style={{ display: 'grid', placeItems: 'center' }}><Ico n={b.e} size={30} /></div><div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{b.t}</div></div>)}</div></div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Progress = () => {
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
        <ProgressPage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Progress
