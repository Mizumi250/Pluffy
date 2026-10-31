'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/review
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:17.885Z
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
import { useProfile } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { shuffle, toast } from '../components/utils'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'

// Page component code (from @arkzen:page:review)
const ReviewPage = () => {
  const { profile } = useProfile()
  const [tab, setTab] = useState('review')
  const [q, setQ] = useState('')
  const [queue, setQueue] = useState<any[]>([])
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ total: 0, due: 0 })
  const [deck, setDeck] = useState<any[]>([])
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [lang, setLang] = useState('es')
  useEffect(() => { if (profile) setLang(profile.learning_lang) }, [profile?.id])

  const loadDue = useCallback(async () => {
    setLoading(true)
    try { const r = await kt<any>('/vocab?due=1'); setQueue(shuffle(r.data)); setCounts({ total: r.total, due: r.due_count }); setFlipped(false); setReviewed(0) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not load cards', 'err') }
    finally { setLoading(false) }
  }, [])
  const loadDeck = useCallback(async () => {
    try { const r = await kt<any>(`/vocab${q ? `?q=${encodeURIComponent(q)}` : ''}`); setDeck(r.data); setCounts({ total: r.total, due: r.due_count }) } catch { /* ignore */ }
  }, [q])
  useEffect(() => { loadDue() }, [loadDue])
  useEffect(() => { if (tab === 'deck') loadDeck() }, [tab, loadDeck])

  const card = queue[0]
  const grade = async (g: number) => {
    if (!card) return
    const c = card
    setQueue(list => g === 0 ? [...list.slice(1), c] : list.slice(1)); setFlipped(false); if (g > 0) setReviewed(n => n + 1)
    try { await kt(`/vocab/${c.id}/review`, { json: { grade: g } }) } catch (e) { toast('Could not save that review', 'err') }
  }
  useEffect(() => {
    if (tab !== 'review') return
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f) }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade(Number(e.key) - 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })
  const add = async () => {
    if (!term.trim() || !meaning.trim()) return
    try { const r = await kt<any>('/vocab', { json: { term: term.trim(), meaning: meaning.trim(), example: example.trim() || null, lang, source: 'manual' } }); toast(r.created ? 'Added to your deck' : 'Already in your deck', r.created ? 'ok' : 'err'); setTerm(''); setMeaning(''); setExample(''); loadDeck() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const remove = async (id: number) => { try { await kt(`/vocab/${id}`, { method: 'DELETE' }); setDeck(d => d.filter(x => x.id !== id)) } catch { toast('Could not delete', 'err') } }
  const hints = card ? [['Again', '#9b3b34', 'now'], ['Hard', '#8a6a2f', card.reps === 0 ? '1d' : 'soon'], ['Good', '#121212', card.reps === 0 ? '1d' : card.reps === 1 ? '4d' : `${Math.max(1, Math.round((card.interval_days || 1) * card.ease))}d`], ['Easy', '#3f6b4f', card.reps === 0 ? '3d' : card.reps === 1 ? '7d' : `${Math.max(2, Math.round((card.interval_days || 1) * card.ease * 1.3))}d`]] : []

  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">Review</h1><p className="kt-subtitle">{counts.due} due · {counts.total} words in your deck</p></div>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'review', label: 'Review' }, { value: 'deck', label: 'Deck' }, { value: 'add', label: 'Add word' }]} />
      </div>

      {tab === 'review' && (loading ? <Skeletons n={1} h={280} /> : card ? (
        <div className="kt-stack" style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <div className="kt-bar"><div style={{ width: `${(reviewed / Math.max(1, reviewed + queue.length)) * 100}%` }} /></div>
          <button className="kt-card dark kt-card-flip" onClick={() => setFlipped(f => !f)} aria-label="Flip card" style={{ fontFamily: 'inherit', color: 'inherit' }}>
            <div>
              <span className="kt-chip">{langName(card.lang)}</span>
              <div style={{ fontSize: 44, fontWeight: 700, margin: '18px 0 6px', letterSpacing: '-0.02em', fontFamily: ['ja', 'zh', 'ko'].includes(card.lang) ? 'var(--kt-serif)' : undefined }}>{card.term}</div>
              {flipped ? <div><div style={{ fontSize: 24, opacity: 0.75 }}>{card.meaning}</div>{card.example && <p className="kt-sub" style={{ maxWidth: 420, margin: '14px auto 0', fontStyle: 'italic' }}>“{card.example.slice(0, 160)}”</p>}</div> : <div className="kt-sub">Tap or press space to reveal</div>}
            </div>
          </button>
          {flipped ? <div className="kt-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>{hints.map((h, n) => <button key={h[0]} className="kt-btn" style={{ height: 62, flexDirection: 'column', gap: 2, color: h[1] }} onClick={() => grade(n)}><span>{h[0]}</span><span className="kt-sub" style={{ fontSize: 11 }}>{h[2]}</span></button>)}</div> : <button className="kt-btn primary block" onClick={() => setFlipped(true)}>Show answer</button>}
        </div>
      ) : (
        <Empty icon="party-popper" title={counts.total === 0 ? 'Your deck is empty' : 'All caught up!'} text={counts.total === 0 ? 'Finish a lesson, select words in the community feed, or add your own.' : `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}. Come back tomorrow, your next cards are scheduled.`} action={<button className="kt-btn primary" onClick={() => setTab('add')}>Add a word</button>} />
      ))}

      {tab === 'deck' && (
        <div className="kt-stack">
          <input className="kt-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search your deck" aria-label="Search deck" />
          {deck.length === 0 ? <Empty icon="layers" title="No cards found" /> : <div className="kt-list">{deck.map(c => (
            <div key={c.id} className="kt-item" style={{ cursor: 'default' }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600 }}>{c.term} <span className="kt-chip">{c.lang.toUpperCase()}</span></div><div className="kt-sub">{c.meaning}</div></div>
              <span className={`kt-chip ${c.reps >= 4 ? 'green' : c.reps > 0 ? 'blue' : ''}`}>{c.reps >= 4 ? 'Mastered' : c.reps > 0 ? `${c.reps}x` : 'New'}</span>
              <button className="kt-icon-btn" aria-label={`Delete ${c.term}`} onClick={() => remove(c.id)}><X size={16} /></button>
            </div>
          ))}</div>}
        </div>
      )}

      {tab === 'add' && (
        <div className="kt-card kt-stack" style={{ maxWidth: 560 }}>
          <LangSelect label="Language" value={lang} onChange={setLang} />
          <div><label className="kt-label">Word or phrase</label><input className="kt-input" value={term} onChange={e => setTerm(e.target.value)} /></div>
          <div><label className="kt-label">Meaning</label><input className="kt-input" value={meaning} onChange={e => setMeaning(e.target.value)} /></div>
          <div><label className="kt-label">Example sentence (optional)</label><input className="kt-input" value={example} onChange={e => setExample(e.target.value)} /></div>
          <button className="kt-btn primary" onClick={add} disabled={!term.trim() || !meaning.trim()}><Plus size={16} />Add to deck</button>
        </div>
      )}
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Review = () => {
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
        <ReviewPage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Review
