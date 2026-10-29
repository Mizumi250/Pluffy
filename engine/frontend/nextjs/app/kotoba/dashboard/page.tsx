'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/dashboard
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:35.491Z
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
import { useApi, useNav } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'

// Page component code (from @arkzen:page:dashboard)
const DashboardPage = () => {
  const nav = useNav()
  const { data, loading, error, reload } = useApi<any>('/home')
  const [writing, setWriting] = useState(false)
  const [onb, setOnb] = useState(false)
  const p: KProfile | undefined = data?.profile
  useEffect(() => { if (p && !p.onboarded) setOnb(true) }, [p?.id, p?.onboarded])
  const h = new Date().getHours()
  const hi = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const goal = p?.daily_goal ?? 3
  const today = data?.today_activity ?? 0

  if (loading && !data) return <Skeletons n={4} h={110} />
  if (error && !data) return <Empty icon="wifi-off" title="Cannot reach Kotoba" text={error} action={<button className="kt-btn primary" onClick={reload}>Try again</button>} />

  const plan = [
    { emoji: 'target', title: data?.mission?.title ?? 'Daily mission', text: data?.mission_done ? 'Done for today. Nice work!' : data?.mission?.prompt, done: !!data?.mission_done, cta: 'Write', run: () => setWriting(true) },
    { emoji: 'book-open', title: data?.next_lesson ? `Lesson: ${data.next_lesson.title}` : 'Lessons', text: data?.next_lesson ? `Next up in ${data.next_lesson.unit}` : 'You finished every lesson for this language. Try a mission or chat.', done: !data?.next_lesson, cta: 'Start', run: () => nav.go('learn') },
    { emoji: 'brain', title: `Review ${data?.due ?? 0} card${data?.due === 1 ? '' : 's'}`, text: data?.due ? 'Right before you forget them.' : 'Nothing due. Save new words from posts and chats.', done: !data?.due, cta: 'Review', run: () => nav.go('review') },
    { emoji: 'handshake', title: 'Help a learner', text: `${data?.help_needed ?? 0} post${data?.help_needed === 1 ? '' : 's'} in ${langName(p?.native_lang)} could use your eyes. Teaching is the fastest way to stay humble.`, done: !data?.help_needed, cta: 'Help', run: () => nav.go('feed#help') },
  ]
  return (
    <div className="kt-stack" style={{ gap: 24 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">{hi}, {p?.display_name?.split(' ')[0] ?? 'friend'}</h1><p className="kt-subtitle">Learning {langName(p?.learning_lang)} · Level {p?.level}</p></div>
        <div className="kt-row kt-wrap"><span className="kt-chip orange" style={{ fontSize: 14, padding: '8px 14px' }}><Ico n="flame" size={15} />{p?.streak ?? 0} day streak</span><span className="kt-chip blue" style={{ fontSize: 14, padding: '8px 14px' }}><Ico n="star" size={15} />{p?.xp ?? 0} XP</span></div>
      </div>

      <div className="kt-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        <div className="kt-card">
          <div className="kt-row kt-between" style={{ marginBottom: 12 }}><h2 className="kt-h2">Today’s plan</h2><span className="kt-sub">{plan.filter(x => x.done).length}/{plan.length} done</span></div>
          <div className="kt-list" style={{ border: 0, borderRadius: 0 }}>{plan.map(s => (
            <div key={s.title} className="kt-item" style={{ cursor: 'default', padding: '14px 0', opacity: s.done ? 0.6 : 1 }}>
              <div style={{ width: 44, display: 'grid', placeItems: 'center' }}><Ico n={s.done ? 'check' : s.emoji} size={26} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600 }}>{s.title}</div><div className="kt-sub" style={{ marginTop: 2 }}>{s.text}</div></div>
              <button className={`kt-btn sm ${s.done ? '' : 'tint'}`} onClick={s.run}>{s.cta}</button>
            </div>
          ))}</div>
        </div>
        <div className="kt-card" style={{ display: 'grid', placeItems: 'center', gap: 12, textAlign: 'center' }}>
          <Ring value={Math.min(today, goal)} max={goal} size={150} stroke={14} color={today >= goal ? '#3f6b4f' : 'currentColor'}><div><div style={{ fontSize: 36, fontWeight: 700 }}>{today}<span className="kt-sub" style={{ fontSize: 18 }}>/{goal}</span></div><div className="kt-sub">today</div></div></Ring>
          <div className="kt-sub">{today >= goal ? 'Daily goal reached' : `${goal - today} more to hit your goal`}</div>
        </div>
      </div>

      <div className="kt-grid c4 keep2">
        {[['Partners', 'compass', 'Find people to practice with', 'partners'], ['Circles', 'users', `${data?.circles ?? 0} joined`, 'circles'], ['Progress', 'trending-up', 'See how you are growing', 'progress'], ['Messages', 'message-circle', 'Pick up a conversation', 'chat']].map(([t, e, s, k]) => (
          <button key={t} className="kt-card" style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }} onClick={() => nav.go(k)}><Ico n={e} size={26} /><div style={{ fontWeight: 700, marginTop: 10 }}>{t}</div><div className="kt-sub">{s}</div></button>
        ))}
      </div>

      <Sheet open={writing} onClose={() => setWriting(false)} title={data?.mission?.title ?? 'Daily mission'} wide>
        <p style={{ margin: '0 0 6px', fontSize: 16, lineHeight: 1.5 }}>{data?.mission?.prompt}</p>
        {data?.mission?.hint && <p className="kt-sub" style={{ margin: '0 0 14px' }}>Hint: {data.mission.hint}</p>}
        <ComposeBox lang={p?.learning_lang ?? 'es'} kind="mission" missionId={data?.mission?.id} onPosted={() => { setWriting(false); reload() }} placeholder={`Write your answer in ${langName(p?.learning_lang)}…`} />
      </Sheet>
      <OnboardingSheet open={onb} profile={p} onDone={() => { setOnb(false); reload() }} />
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Dashboard = () => {
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
        <DashboardPage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Dashboard
