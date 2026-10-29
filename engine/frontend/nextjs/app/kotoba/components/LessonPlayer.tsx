'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — LessonPlayer
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:33.853Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'
import { norm, shuffle, toast } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'
import { Empty } from './Empty'
import { Ring } from './Ring'
import { Sheet } from './Sheet'

export const LessonPlayer = ({ lesson, onClose, onDone }: { lesson: any; onClose: () => void; onDone: () => void }) => {
  const data = useMemo(() => { try { return JSON.parse(lesson.content) } catch { return { ex: [], v: [] } } }, [lesson])
  const ex: Ex[] = data.ex ?? []
  const [i, setI] = useState(0)
  const [status, setStatus] = useState<'idle' | 'right' | 'wrong'>('idle')
  const [correct, setCorrect] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [picked, setPicked] = useState<number[]>([])
  const [left, setLeft] = useState<number | null>(null)
  const [done, setDone] = useState<number[]>([])
  const [result, setResult] = useState<{ xp: number; cards_added: number; score: number } | null>(null)
  const cur = ex[i]
  const order = useMemo(() => shuffle((cur?.o ?? cur?.w ?? cur?.p?.map((_, k) => k) ?? []).map((_: any, k: number) => k)), [i, lesson])
  const rightOrder = useMemo(() => shuffle((cur?.p ?? []).map((_, k) => k)), [i, lesson])

  const reset = () => { setStatus('idle'); setSel(null); setTyped(''); setPicked([]); setLeft(null); setDone([]) }
  const verdict = (ok: boolean) => { setStatus(ok ? 'right' : 'wrong'); if (ok) setCorrect(c => c + 1) }
  const check = () => {
    if (!cur) return
    if (cur.t === 'choose') verdict(sel === cur.a)
    else if (cur.t === 'type') verdict((cur.a as string[]).some(x => norm(x) === norm(typed)))
    else if (cur.t === 'order') verdict(picked.map(k => cur.w![k]).join('').replace(/\s/g, '') === String(cur.a).replace(/\s/g, ''))
  }
  const next = async () => {
    if (i + 1 < ex.length) { setI(i + 1); reset(); return }
    const score = Math.round((correct / Math.max(1, ex.length)) * 100)
    try { const r = await kt<{ xp: number; cards_added: number }>(`/lessons/${lesson.id}/complete`, { json: { score } }); setResult({ ...r, score }) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not save progress', 'err'); setResult({ xp: 0, cards_added: 0, score }) }
  }
  const pickMatch = (side: 'l' | 'r', k: number) => {
    if (status !== 'idle' || done.includes(k)) return
    if (side === 'l') { setLeft(k); return }
    if (left === null) return
    if (left === k) {
      const nd = [...done, k]; setDone(nd); setLeft(null)
      if (nd.length === cur.p!.length) verdict(true)
    } else { setLeft(null); toast('Not a match, try again', 'err') }
  }

  if (!ex.length) return <Sheet open onClose={onClose} title={lesson.title}><Empty title="This lesson is empty" /></Sheet>
  if (result) return (
    <div className="kt-sheet-back"><div className="kt-sheet" style={{ textAlign: 'center', padding: 32 }}>
      <Ring value={result.score} max={100} size={140} color={result.score >= 70 ? '#3f6b4f' : '#8a6a2f'}><div><div style={{ fontSize: 34, fontWeight: 700 }}>{result.score}%</div><div className="kt-sub">score</div></div></Ring>
      <h2 className="kt-h2" style={{ marginTop: 18 }}>{result.score >= 70 ? 'Nicely done!' : 'Good effort!'}</h2>
      <p className="kt-sub">+{result.xp} XP{result.cards_added > 0 ? ` · ${result.cards_added} new words added to your deck` : ''}</p>
      <div className="kt-row" style={{ justifyContent: 'center', marginTop: 18 }}><button className="kt-btn primary" onClick={onDone}><Trophy size={16} />Continue</button></div>
    </div></div>
  )
  const canCheck = cur.t === 'choose' ? sel !== null : cur.t === 'type' ? typed.trim().length > 0 : cur.t === 'order' ? picked.length === cur.w!.length : false
  const answerText = cur.t === 'choose' ? cur.o![cur.a] : cur.t === 'type' ? (cur.a as string[])[0] : String(cur.a ?? '')

  return (
    <div className="kt-sheet-back" style={{ alignItems: 'stretch', padding: 0 }}>
      <div style={{ background: 'var(--kt-bg)', width: '100%', display: 'flex', flexDirection: 'column', animation: 'kt-fade 0.25s' }}>
        <div className="kt-row" style={{ padding: '16px 20px', maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <button className="kt-icon-btn" aria-label="Quit lesson" onClick={onClose}><X size={18} /></button>
          <div className="kt-bar" style={{ flex: 1 }}><div style={{ width: `${(i / ex.length) * 100}%` }} /></div>
          <span className="kt-sub">{i + 1}/{ex.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 30px', maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <h2 className="kt-title" style={{ fontSize: 26, marginBottom: 22 }}>{cur.q}</h2>
          {cur.t === 'choose' && <div className="kt-stack" style={{ gap: 10 }}>{order.map(k => (
            <button key={k} disabled={status !== 'idle'} className="kt-card" onClick={() => setSel(k)} style={{ textAlign: 'left', cursor: 'pointer', fontSize: 18, fontFamily: 'inherit', color: 'inherit', borderColor: sel === k ? '#121212' : undefined, boxShadow: sel === k ? '0 0 0 3px rgba(18, 18, 18, 0.25)' : undefined }}>{cur.o![k]}</button>
          ))}</div>}
          {cur.t === 'type' && <input autoFocus className="kt-input" style={{ fontSize: 20 }} value={typed} disabled={status !== 'idle'} onChange={e => setTyped(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && canCheck && status === 'idle') check() }} placeholder="Type your answer" aria-label="Your answer" />}
          {cur.t === 'order' && (
            <div className="kt-stack">
              <div className="kt-card flat kt-row kt-wrap" style={{ minHeight: 70 }}>{picked.map((k, n) => <button key={n} disabled={status !== 'idle'} className="kt-chip blue" style={{ fontSize: 18, padding: '8px 14px', border: 0, cursor: 'pointer' }} onClick={() => setPicked(picked.filter((_, m) => m !== n))}>{cur.w![k]}</button>)}</div>
              <div className="kt-row kt-wrap">{order.filter(k => !picked.includes(k)).map(k => <button key={k} disabled={status !== 'idle'} className="kt-btn" onClick={() => setPicked([...picked, k])}>{cur.w![k]}</button>)}</div>
            </div>
          )}
          {cur.t === 'match' && (
            <div className="kt-grid c2" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="kt-stack" style={{ gap: 10 }}>{cur.p!.map((pair, k) => <button key={k} disabled={done.includes(k)} className="kt-btn" style={{ height: 54, fontSize: 17, opacity: done.includes(k) ? 0.35 : 1, outline: left === k ? '3px solid #121212' : 'none' }} onClick={() => pickMatch('l', k)}>{pair[0]}</button>)}</div>
              <div className="kt-stack" style={{ gap: 10 }}>{rightOrder.map(k => <button key={k} disabled={done.includes(k)} className="kt-btn" style={{ height: 54, fontSize: 17, opacity: done.includes(k) ? 0.35 : 1 }} onClick={() => pickMatch('r', k)}>{cur.p![k][1]}</button>)}</div>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 20px calc(16px + env(safe-area-inset-bottom))', background: status === 'right' ? 'rgba(63, 107, 79, 0.18)' : status === 'wrong' ? 'rgba(155, 59, 52, 0.16)' : 'var(--kt-glass)', borderTop: '1px solid var(--kt-line)' }}>
          <div className="kt-row kt-between" style={{ maxWidth: 720, margin: '0 auto' }}>
            <div>
              {status === 'right' && <b style={{ color: '#3f6b4f', fontSize: 18 }}>Correct!</b>}
              {status === 'wrong' && <div><b style={{ color: 'var(--kt-red)', fontSize: 18 }}>Not quite</b>{cur.t !== 'match' && <div className="kt-sub">Answer: {answerText}</div>}</div>}
            </div>
            {status === 'idle' ? (cur.t === 'match' ? <button className="kt-btn" onClick={() => { verdict(false) }}>Skip</button> : <button className="kt-btn primary" disabled={!canCheck} onClick={check}>Check</button>) : <button className="kt-btn primary" onClick={next}>{i + 1 < ex.length ? 'Continue' : 'Finish'}</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile sheet ────────────────────────────────────────────
