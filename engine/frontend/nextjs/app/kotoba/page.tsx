'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/index
// Layout: +guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:47.208Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from './components/Avatar'
import { ComposeBox } from './components/ComposeBox'
import { Diff } from './components/Diff'
import { Empty } from './components/Empty'
import { InterestPicker } from './components/InterestPicker'
import { LangSelect } from './components/LangSelect'
import { LessonPlayer } from './components/LessonPlayer'
import { OnboardingSheet } from './components/OnboardingSheet'
import { PostCard } from './components/PostCard'
import { ProfileSheet } from './components/ProfileSheet'
import { Ring } from './components/Ring'
import { Segmented } from './components/Segmented'
import { Sheet } from './components/Sheet'
import { Skeletons } from './components/Skeletons'
import { useNav } from './components/hooks'
import type { Ex, KComment, KPost, KProfile } from './components/types'
import { kt } from './components/utils'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const nav = useNav()
  const rows: [string, string, string, string][] = [
    ['Real people', '✕', '✓', '✓'],
    ['Structure and a plan', '✓', '✕', '✓'],
    ['Corrections with explanations', '✕', '~', '✓'],
    ['Words saved from your own conversations', '✕', '✕', '✓'],
    ['Spaced repetition', '✓', '✕', '✓'],
    ['Conversation starters that fit your level', '✕', '✕', '✓'],
  ]
  return (
    <div className="kt-hero" style={{ minHeight: '100vh', fontFamily: 'var(--kt-font)', color: 'var(--kt-text)' }}>
      <header className="kt-row kt-between" style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 24px' }}>
        <div className="kt-brand" style={{ padding: 0 }}><div className="kt-brand-mark">言</div>Kotoba</div>
        <div className="kt-row"><button className="kt-btn ghost" onClick={() => nav.go('login')}>Sign in</button><button className="kt-btn primary" onClick={() => nav.go('register')}>Get started</button></div>
      </header>
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '72px 24px 48px', textAlign: 'center' }}>
        <span className="kt-chip blue" style={{ marginBottom: 18 }}><Sparkles size={13} />Social language learning</span>
        <h1 className="kt-title" style={{ fontSize: 'clamp(40px, 7vw, 72px)', lineHeight: 1.03 }}>Learn by talking,<br />not by tapping.</h1>
        <p className="kt-subtitle" style={{ fontSize: 21, maxWidth: 600, margin: '20px auto 0' }}>Write real posts, get corrected by native speakers, and turn every mistake into a flashcard. Kotoba is the practice that streak apps skip.</p>
        <div className="kt-row" style={{ justifyContent: 'center', marginTop: 32 }}>
          <button className="kt-btn primary" style={{ height: 52, padding: '0 28px', fontSize: 17 }} onClick={() => nav.go('register')}>Create free account</button>
          <button className="kt-btn" style={{ height: 52, padding: '0 28px', fontSize: 17 }} onClick={() => nav.go('login')}>I have an account</button>
        </div>
        <p className="kt-sub" style={{ marginTop: 14 }}>Try the demo: demo@kotoba.app / password123</p>
      </section>
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '24px' }}>
        <div className="kt-grid c3">
          {[['🎯', 'Daily mission', 'One small prompt a day, written at your level. No more blank-page panic or "hi, where are you from?"'], ['✏️', 'Corrections that teach', 'Native speakers suggest a fix with a visual diff and a reason. Accept it and it sticks.'], ['🧠', 'Your own deck', 'Select any word in any post or chat to save it. Spaced repetition brings it back right before you forget.']].map(([e, t, d]) => (
            <div key={t} className="kt-card"><div style={{ fontSize: 34 }}>{e}</div><div className="kt-h2" style={{ margin: '10px 0 6px' }}>{t}</div><p className="kt-sub" style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{d}</p></div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
        <h2 className="kt-title" style={{ fontSize: 34, textAlign: 'center', marginBottom: 24 }}>Why most apps stop working</h2>
        <div className="kt-list" style={{ overflowX: 'auto' }}>
          <div className="kt-item" style={{ cursor: 'default', fontWeight: 600, fontSize: 13 }}><span style={{ flex: 2 }} /><span style={{ flex: 1, textAlign: 'center' }}>Drill apps</span><span style={{ flex: 1, textAlign: 'center' }}>Chat-only apps</span><span style={{ flex: 1, textAlign: 'center', color: 'var(--kt-blue)' }}>Kotoba</span></div>
          {rows.map(r => <div key={r[0]} className="kt-item" style={{ cursor: 'default' }}><span style={{ flex: 2, fontSize: 15 }}>{r[0]}</span>{[1, 2, 3].map(i => <span key={i} style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: r[i] === '✓' ? '#22a847' : r[i] === '✕' ? 'var(--kt-sub)' : '#c77700' }}>{r[i]}</span>)}</div>)}
        </div>
      </section>
      <footer className="kt-sub" style={{ textAlign: 'center', padding: '32px 24px 48px' }}>Kotoba · 言葉 means “words”</footer>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_Kotoba_Index
