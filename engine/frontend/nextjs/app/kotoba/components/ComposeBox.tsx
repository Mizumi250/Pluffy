'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ComposeBox
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:10.035Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langFlag, langName } from '@/arkzen/generated/kotoba.scripts'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import { toast } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'

// ─── Compose box ──────────────────────────────────────────────
export const ComposeBox = ({ lang: initialLang, kind = 'moment', missionId, placeholder, onPosted, compact }: {
  lang: string; kind?: 'moment' | 'question' | 'mission'; missionId?: number | null; placeholder?: string; onPosted?: (p: KPost) => void; compact?: boolean
}) => {
  const [body, setBody] = useState('')
  const [lang, setLang] = useState(initialLang)
  const [tr, setTr] = useState('')
  const [showTr, setShowTr] = useState(false)
  const [asKind, setAsKind] = useState<'moment' | 'question' | 'mission'>(kind)
  const [busy, setBusy] = useState(false)
  useEffect(() => setLang(initialLang), [initialLang])
  const submit = async () => {
    if (!body.trim()) return
    setBusy(true)
    try {
      const r = await kt<{ data: KPost }>('/posts', { json: { body: body.trim(), lang, kind: asKind, mission_id: missionId ?? null, translation: tr.trim() || null } })
      setBody(''); setTr(''); setShowTr(false)
      toast(asKind === 'mission' ? 'Mission complete! +20 XP' : 'Posted! +10 XP')
      onPosted?.(r.data)
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not post', 'err') }
    finally { setBusy(false) }
  }
  return (
    <div className="kt-card" style={{ padding: compact ? 14 : 20 }}>
      <textarea className="kt-textarea" style={{ minHeight: compact ? 72 : 96 }} value={body} onChange={e => setBody(e.target.value)} placeholder={placeholder ?? `Write in ${langName(lang)}. Mistakes are welcome, that is how we learn.`} aria-label="Write a post" maxLength={1500} />
      {showTr && <textarea className="kt-textarea" style={{ minHeight: 60, marginTop: 10 }} value={tr} onChange={e => setTr(e.target.value)} placeholder="Add a translation so learners can follow along (optional)" aria-label="Translation" />}
      <div className="kt-row kt-between kt-wrap" style={{ marginTop: 12 }}>
        <div className="kt-row kt-wrap">
          <select className="kt-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 14 }} value={lang} onChange={e => setLang(e.target.value)} aria-label="Post language">
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
          {kind !== 'mission' && (
            <select className="kt-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 14 }} value={asKind} onChange={e => setAsKind(e.target.value as any)} aria-label="Post type">
              <option value="moment">Moment</option><option value="question">Question</option>
            </select>
          )}
          <button className="kt-btn ghost sm" onClick={() => setShowTr(s => !s)}><Languages size={16} />{showTr ? 'Hide translation' : 'Add translation'}</button>
        </div>
        <button className="kt-btn primary sm" disabled={busy || !body.trim()} onClick={submit}><Send size={15} />{busy ? 'Posting…' : kind === 'mission' ? 'Complete mission' : 'Post'}</button>
      </div>
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────
