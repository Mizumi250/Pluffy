'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/index
// Layout: +guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:58.063Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from './components/Avatar'
import { ComposeBox } from './components/ComposeBox'
import { Diff } from './components/Diff'
import { Empty } from './components/Empty'
import { Ico } from './components/Ico'
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
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const nav = useNav()
  // y = yes, n = no, p = partial
  const rows: [string, string, string, string][] = [
    ['Real people', 'n', 'y', 'y'],
    ['Structure and a plan', 'y', 'n', 'y'],
    ['Corrections with explanations', 'n', 'p', 'y'],
    ['Words saved from your own conversations', 'n', 'n', 'y'],
    ['Spaced repetition', 'y', 'n', 'y'],
    ['Conversation starters that fit your level', 'n', 'n', 'y'],
  ]
  const mark = (v: string) => (v === 'y' ? <Check size={18} /> : v === 'n' ? <X size={18} /> : <Minus size={18} />)
  return (
    <div className="kt-hero" style={{ minHeight: '100vh', color: 'var(--kt-text)' }}>
      <header className="kt-row kt-between" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px' }}>
        <div className="kt-brand" style={{ padding: 0 }}><img className="kt-logo" src="https://api.iconify.design/lucide/languages.svg?color=%23121212" alt="" width={28} height={28} />Kotoba</div>
        <div className="kt-row"><button className="kt-btn ghost" onClick={() => nav.go('login')}>Sign in</button><button className="kt-btn primary" onClick={() => nav.go('register')}>Get started</button></div>
      </header>
      <section className="kt-hero-grid" style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 64px' }}>
        <div>
          <span className="kt-label" style={{ marginLeft: 0 }}>Social language learning</span>
          <h1 className="kt-title" style={{ fontSize: 'clamp(46px, 7vw, 84px)', lineHeight: 1, marginTop: 6 }}>Learn by talking, not by tapping.</h1>
          <p className="kt-subtitle" style={{ fontSize: 19, maxWidth: 520, margin: '24px 0 0' }}>Write real posts, get corrected by native speakers, and turn every mistake into a flashcard. Kotoba is the practice that streak apps skip.</p>
          <div className="kt-row kt-wrap" style={{ marginTop: 32 }}>
            <button className="kt-btn primary" style={{ height: 54, padding: '0 30px', fontSize: 16 }} onClick={() => nav.go('register')}>Create free account</button>
            <button className="kt-btn tint" style={{ height: 54, padding: '0 30px', fontSize: 16 }} onClick={() => nav.go('login')}>I have an account</button>
          </div>
          <p className="kt-sub" style={{ marginTop: 16 }}>Try the demo: demo@kotoba.app / password123</p>
        </div>
        <div className="kt-hero-art">
          <img className="kt-photo" src="https://picsum.photos/seed/kotoba-words/900/1125?grayscale" alt="" />
          <div className="kt-dark-card">
            <div><div className="kt-sub" style={{ opacity: 0.6, color: 'inherit' }}>kotoba</div><div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Words</div></div>
            <div className="kt-cjk" style={{ fontSize: 44, lineHeight: 1 }}>言葉</div>
            <button className="kt-fab" style={{ background: 'var(--kt-on-dark)', color: 'var(--kt-dark)', width: 52, height: 52 }} aria-label="Get started" onClick={() => nav.go('register')}><ArrowRight size={20} /></button>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '24px' }}>
        <div className="kt-grid c3">
          {[['target', 'Daily mission', 'One small prompt a day, written at your level. No more blank-page panic or "hi, where are you from?"'], ['pencil', 'Corrections that teach', 'Native speakers suggest a fix with a visual diff and a reason. Accept it and it sticks.'], ['brain', 'Your own deck', 'Select any word in any post or chat to save it. Spaced repetition brings it back right before you forget.']].map(([e, t, d]) => (
            <div key={t} className="kt-card" style={{ padding: 28 }}><div className="kt-icon-btn" style={{ width: 48, height: 48, background: 'var(--kt-dark)', color: 'var(--kt-on-dark)' }}><Ico n={e} size={22} /></div><div className="kt-h2" style={{ margin: '20px 0 8px' }}>{t}</div><p className="kt-sub" style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>{d}</p></div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px' }}>
        <h2 className="kt-title" style={{ fontSize: 36, textAlign: 'center', marginBottom: 28 }}>Why most apps stop working</h2>
        <div className="kt-list" style={{ overflowX: 'auto' }}>
          <div className="kt-item" style={{ cursor: 'default', fontWeight: 600, fontSize: 13 }}><span style={{ flex: 2 }} /><span style={{ flex: 1, textAlign: 'center' }}>Drill apps</span><span style={{ flex: 1, textAlign: 'center' }}>Chat-only apps</span><span style={{ flex: 1, textAlign: 'center' }}>Kotoba</span></div>
          {rows.map(r => <div key={r[0]} className="kt-item" style={{ cursor: 'default' }}><span style={{ flex: 2, fontSize: 15 }}>{r[0]}</span>{[1, 2, 3].map(i => <span key={i} style={{ flex: 1, display: 'grid', placeItems: 'center', color: r[i] === 'y' ? 'var(--kt-green)' : r[i] === 'n' ? 'var(--kt-sub)' : 'var(--kt-orange)' }}>{mark(r[i])}</span>)}</div>)}
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
