'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PostCard
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:17.196Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'
import { timeAgo, toast } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'
import { Avatar } from './Avatar'
import { Diff } from './Diff'
import { Segmented } from './Segmented'

// ─── Post card ────────────────────────────────────────────────
export const PostCard = ({ post, meId, onProfile, onDeleted }: { post: KPost; meId?: number; onProfile?: (userId: number) => void; onDeleted?: (id: number) => void }) => {
  const [p, setP] = useState<KPost>(post)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<KComment[] | null>(null)
  const [mode, setMode] = useState<'comment' | 'fix'>('comment')
  const [text, setText] = useState('')
  const [fixed, setFixed] = useState(post.body)
  const [why, setWhy] = useState('')
  const [sel, setSel] = useState('')
  const [meaning, setMeaning] = useState('')
  const [showTr, setShowTr] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => setP(post), [post])

  const like = async () => {
    setP(x => ({ ...x, liked: !x.liked, likes_count: x.likes_count + (x.liked ? -1 : 1) }))
    try { const r = await kt<{ liked: boolean; likes_count: number }>(`/posts/${p.id}/like`, { json: {} }); setP(x => ({ ...x, liked: r.liked, likes_count: r.likes_count })) }
    catch { setP(post) }
  }
  const toggleThread = async () => {
    const next = !open
    setOpen(next)
    if (next && comments === null) {
      try { const r = await kt<{ data: KComment[] }>(`/posts/${p.id}/comments`); setComments(r.data) } catch (e) { toast('Could not load comments', 'err') }
    }
  }
  const send = async () => {
    if (!text.trim()) return
    if (mode === 'fix' && (!fixed.trim() || fixed.trim() === p.body.trim())) { toast('Edit the text to suggest a correction', 'err'); return }
    setBusy(true)
    try {
      const r = await kt<{ data: KComment }>(`/posts/${p.id}/comments`, { json: { body: text.trim(), is_correction: mode === 'fix', corrected: mode === 'fix' ? fixed.trim() : null, explanation: mode === 'fix' ? why.trim() || null : null } })
      setComments(c => [...(c ?? []), r.data])
      setP(x => ({ ...x, comments_count: x.comments_count + 1, corrections_count: x.corrections_count + (r.data.is_correction ? 1 : 0) }))
      setText(''); setWhy(''); setMode('comment'); setFixed(p.body)
      toast(r.data.is_correction ? 'Correction sent. +15 XP' : 'Comment sent. +5 XP')
    } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const accept = async (c: KComment) => {
    try { await kt(`/comments/${c.id}/accept`, { json: {} }); setComments(list => (list ?? []).map(x => x.id === c.id ? { ...x, accepted: true } : x)); toast('Correction accepted') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const capture = () => { const s = (typeof window !== 'undefined' ? window.getSelection()?.toString() : '')?.trim() ?? ''; setSel(s.length > 0 && s.length <= 80 ? s : '') }
  const save = async () => {
    if (!sel || !meaning.trim()) return
    try { await kt('/vocab', { json: { term: sel, meaning: meaning.trim(), lang: p.lang, example: p.body, source: 'feed' } }); toast(`Saved “${sel}” to your deck`); setSel(''); setMeaning('') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const remove = async () => { try { await kt(`/posts/${p.id}`, { method: 'DELETE' }); onDeleted?.(p.id) } catch (e) { toast('Could not delete', 'err') } }
  const mine = meId === p.user_id

  return (
    <article className="kt-card">
      <div className="kt-row">
        <button style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }} aria-label={`Open ${p.author_name}'s profile`} onClick={() => onProfile?.(p.user_id)}><Avatar name={p.author_name} color={p.author_color} /></button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{p.author_name}</div>
          <div className="kt-sub">Native {langName(p.author_native)} · {timeAgo(p.created_at)}</div>
        </div>
        <span className="kt-chip blue">{langName(p.lang)}</span>
        {p.kind !== 'moment' && <span className={`kt-chip ${p.kind === 'mission' ? 'orange' : 'purple'}`}>{p.kind === 'mission' ? 'Mission' : 'Question'}</span>}
      </div>
      <p onMouseUp={capture} onTouchEnd={capture} style={{ fontSize: 18, lineHeight: 1.55, margin: '14px 0 6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{p.body}</p>
      {p.translation && (
        <div style={{ marginBottom: 6 }}>
          <button className="kt-btn ghost sm" style={{ padding: 0, height: 28 }} onClick={() => setShowTr(s => !s)}><Languages size={15} />{showTr ? 'Hide translation' : 'Show translation'}</button>
          {showTr && <p className="kt-sub" style={{ margin: '4px 0 0', fontSize: 15 }}>{p.translation}</p>}
        </div>
      )}
      {sel && (
        <div className="kt-row kt-wrap" style={{ margin: '10px 0', padding: 10, borderRadius: 14, background: 'rgba(18, 18, 18, 0.1)' }}>
          <BookmarkPlus size={18} color="#121212" />
          <span style={{ fontWeight: 600 }}>“{sel}”</span>
          <input className="kt-input" style={{ flex: 1, minWidth: 140, padding: '8px 12px', fontSize: 14 }} value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="What does it mean?" onKeyDown={e => { if (e.key === 'Enter') save() }} />
          <button className="kt-btn primary sm" onClick={save} disabled={!meaning.trim()}>Save to deck</button>
        </div>
      )}
      {!sel && <div className="kt-sub" style={{ fontSize: 12, marginBottom: 8 }}>Tip: select any word or phrase to save it to your deck.</div>}
      <div className="kt-row" style={{ marginTop: 6 }}>
        <button className="kt-btn ghost sm" aria-pressed={!!p.liked} onClick={like} style={{ color: p.liked ? 'var(--kt-red)' : undefined }}><Heart size={17} fill={p.liked ? 'currentColor' : 'none'} />{p.likes_count}</button>
        <button className="kt-btn ghost sm" aria-expanded={open} onClick={toggleThread}><MessageCircle size={17} />{p.comments_count}</button>
        {p.corrections_count > 0 ? <span className="kt-chip green"><Check size={13} />{p.corrections_count} correction{p.corrections_count > 1 ? 's' : ''}</span> : !mine && <span className="kt-chip orange"><PenLine size={13} />Needs feedback</span>}
        {mine && <button className="kt-btn ghost sm" style={{ marginLeft: 'auto', color: 'var(--kt-red)' }} onClick={remove}>Delete</button>}
      </div>
      {open && (
        <div className="kt-stack" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--kt-line)' }}>
          {comments === null && <div className="kt-skel" style={{ height: 56 }} />}
          {comments?.length === 0 && <div className="kt-sub">No comments yet. Be the first to help.</div>}
          {comments?.map(c => (
            <div key={c.id} className="kt-row" style={{ alignItems: 'flex-start' }}>
              <Avatar name={c.author_name} color={c.author_color} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14 }}><b>{c.author_name}</b> <span className="kt-sub">{timeAgo(c.created_at)}</span></div>
                <div style={{ fontSize: 15, lineHeight: 1.45 }}>{c.body}</div>
                {c.is_correction && c.corrected && (
                  <div className="kt-fix">
                    <div className="kt-row" style={{ gap: 6, marginBottom: 4 }}><Wand2 size={14} /><b style={{ fontSize: 13 }}>Suggested correction</b>{c.accepted && <span className="kt-chip green">Accepted</span>}</div>
                    <Diff from={p.body} to={c.corrected} />
                    {c.explanation && <div className="kt-sub" style={{ marginTop: 6 }}>{c.explanation}</div>}
                    {mine && !c.accepted && <button className="kt-btn tint sm" style={{ marginTop: 8 }} onClick={() => accept(c)}><Check size={14} />Accept and thank</button>}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="kt-stack" style={{ gap: 8 }}>
            {!mine && <Segmented value={mode} onChange={v => setMode(v as any)} options={[{ value: 'comment', label: 'Comment' }, { value: 'fix', label: 'Suggest correction' }]} />}
            {mode === 'fix' && (
              <>
                <textarea className="kt-textarea" style={{ minHeight: 70 }} value={fixed} onChange={e => setFixed(e.target.value)} aria-label="Corrected text" />
                <input className="kt-input" value={why} onChange={e => setWhy(e.target.value)} placeholder="Why? A short explanation helps them learn" />
              </>
            )}
            <div className="kt-row">
              <input className="kt-input" value={text} onChange={e => setText(e.target.value)} placeholder={mode === 'fix' ? 'Add a friendly note' : 'Write a comment'} onKeyDown={e => { if (e.key === 'Enter') send() }} />
              <button className="kt-btn primary sm" disabled={busy || !text.trim()} onClick={send}>Send</button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

// ─── Lesson player ────────────────────────────────────────────
