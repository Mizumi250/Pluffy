'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — OnboardingSheet
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:46.714Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { BookmarkPlus, Check, Heart, Languages, MessageCircle, PenLine, Plus, Send, Sparkles, Trophy, Wand2, X } from 'lucide-react'
import { LEVELS } from './constants'
import { kt, toast } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'
import { InterestPicker } from './InterestPicker'
import { LangSelect } from './LangSelect'
import { Segmented } from './Segmented'
import { Sheet } from './Sheet'

export const OnboardingSheet = ({ open, profile, onDone }: { open: boolean; profile?: KProfile; onDone: () => void }) => {
  const [native, setNative] = useState('en')
  const [learning, setLearning] = useState('es')
  const [level, setLevel] = useState('A1')
  const [interests, setInterests] = useState('')
  const [goal, setGoal] = useState('3')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) { setNative(profile.native_lang); setLearning(profile.learning_lang); setLevel(profile.level) } }, [profile?.id])
  const save = async () => {
    if (native === learning) { toast('Pick two different languages', 'err'); return }
    setBusy(true)
    try { await kt('/me', { method: 'PUT', json: { native_lang: native, learning_lang: learning, level, interests, daily_goal: Number(goal), onboarded: true } }); toast('You are all set. Let us begin!'); onDone() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  return (
    <Sheet open={open} onClose={() => {}} title="Welcome to Kotoba">
      <div className="kt-stack">
        <p className="kt-sub" style={{ margin: 0 }}>Two quick questions so we can match you with the right people, missions and lessons.</p>
        <div className="kt-grid c2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <LangSelect label="I speak" value={native} onChange={setNative} />
          <LangSelect label="I am learning" value={learning} onChange={setLearning} />
        </div>
        <div><label className="kt-label">My level</label><Segmented value={level} onChange={setLevel} options={LEVELS.map(l => ({ value: l, label: l }))} /></div>
        <div><label className="kt-label">Things I like talking about</label><InterestPicker value={interests} onChange={setInterests} /></div>
        <div><label className="kt-label">Daily goal (posts, messages or lessons)</label><Segmented value={goal} onChange={setGoal} options={['1', '3', '5', '10'].map(g => ({ value: g, label: g }))} /></div>
        <button className="kt-btn primary block" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Start learning'}</button>
      </div>
    </Sheet>
  )
}
