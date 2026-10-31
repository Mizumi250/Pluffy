'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ProfileSheet
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:17.202Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'
import { useNav } from './hooks'
import { toast } from './utils'
import type { Ex, KComment, KPost, KProfile } from './types'
import { Avatar } from './Avatar'
import { Ico } from './Ico'
import { Sheet } from './Sheet'
import { Skeletons } from './Skeletons'

// ─── Profile sheet ────────────────────────────────────────────
export const ProfileSheet = ({ userId, onClose }: { userId: number | null; onClose: () => void }) => {
  const nav = useNav()
  const [d, setD] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setD(null)
    if (userId) kt(`/profile/${userId}`).then(setD).catch(e => { toast(e instanceof Error ? e.message : 'Profile not found', 'err'); onClose() })
  }, [userId])
  const follow = async () => {
    setBusy(true)
    try { const r = await kt<{ following: boolean }>(`/follow/${userId}`, { json: {} }); setD((x: any) => ({ ...x, following: r.following, followers: x.followers + (r.following ? 1 : -1) })) }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const message = async () => {
    try { const r = await kt<{ data: { id: number } }>('/conversations', { json: { user_id: userId } }); onClose(); nav.go(`chat#c=${r.data.id}`) }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const p: KProfile | undefined = d?.data
  return (
    <Sheet open={!!userId} onClose={onClose} title="Profile">
      {!p ? <Skeletons n={2} h={90} /> : (
        <div className="kt-stack">
          <div className="kt-row"><Avatar name={p.display_name} color={p.avatar_color} size={64} />
            <div><div className="kt-h2">{p.display_name}</div><div className="kt-sub">{p.country ?? 'Somewhere on Earth'}</div></div></div>
          <div className="kt-row kt-wrap">
            <span className="kt-chip green">Speaks {langName(p.native_lang)}</span>
            <span className="kt-chip blue">Learning {langName(p.learning_lang)} · {p.level}</span>
            <span className="kt-chip orange"><Ico n="flame" size={13} />{p.streak} day streak</span>
          </div>
          {p.bio && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{p.bio}</p>}
          {p.interests && <div className="kt-row kt-wrap">{p.interests.split(',').filter(Boolean).map(i => <span key={i} className="kt-chip">{i.trim()}</span>)}</div>}
          <div className="kt-grid c3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[['Posts', d.post_count], ['Followers', d.followers], ['Following', d.following_count]].map(([k, v]) => <div key={k as string} className="kt-card flat" style={{ textAlign: 'center', padding: 12 }}><div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div><div className="kt-sub">{k}</div></div>)}
          </div>
          <div className="kt-row"><button className="kt-btn primary" style={{ flex: 1 }} onClick={message}><MessageCircle size={16} />Message</button><button className="kt-btn" disabled={busy} onClick={follow}>{d.following ? 'Following' : 'Follow'}</button></div>
          {d.posts?.length > 0 && <div><div className="kt-label">Recent posts</div><div className="kt-list">{d.posts.map((x: KPost) => <div key={x.id} className="kt-item" style={{ cursor: 'default', display: 'block' }}><span className="kt-chip" style={{ marginBottom: 4 }}>{langName(x.lang)}</span><div style={{ fontSize: 15 }}>{x.body}</div></div>)}</div></div>}
        </div>
      )}
    </Sheet>
  )
}

// ─── Onboarding sheet ─────────────────────────────────────────
