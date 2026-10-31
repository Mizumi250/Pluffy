'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/profile
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:18.234Z
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
import { COLORS, LEVELS } from '../components/constants'
import { useNav, useProfile } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { toast } from '../components/utils'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'

// Page component code (from @arkzen:page:profile)
const ProfilePage = () => {
  const { user, logout } = useAuthStore()
  const { profile, setProfile } = useProfile()
  const nav = useNav()
  const [f, setF] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) setF({ display_name: profile.display_name, bio: profile.bio ?? '', country: profile.country ?? '', native_lang: profile.native_lang, learning_lang: profile.learning_lang, level: profile.level, interests: profile.interests ?? '', avatar_color: profile.avatar_color, daily_goal: String(profile.daily_goal) }) }, [profile?.id])
  if (!f || !profile) return <Skeletons n={3} h={140} />
  const dirty = JSON.stringify(f) !== JSON.stringify({ display_name: profile.display_name, bio: profile.bio ?? '', country: profile.country ?? '', native_lang: profile.native_lang, learning_lang: profile.learning_lang, level: profile.level, interests: profile.interests ?? '', avatar_color: profile.avatar_color, daily_goal: String(profile.daily_goal) })
  const save = async () => {
    if (f.native_lang === f.learning_lang) { toast('Pick two different languages', 'err'); return }
    setBusy(true)
    try { const r = await kt<{ data: KProfile }>('/me', { method: 'PUT', json: { ...f, daily_goal: Number(f.daily_goal), bio: f.bio || null, country: f.country || null, interests: f.interests || null } }); setProfile(r.data); toast('Profile saved') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const out = async () => { try { await logout() } catch { /* ignore */ } nav.go('login') }
  return (
    <div className="kt-stack" style={{ gap: 22, maxWidth: 720 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}><div><h1 className="kt-title">Profile</h1><p className="kt-subtitle">{(user as any)?.email}</p></div></div>
      <div className="kt-card kt-stack">
        <div className="kt-row"><Avatar name={f.display_name} color={f.avatar_color} size={72} />
          <div className="kt-row kt-wrap">{COLORS.map(c => <button key={c} aria-label={`Color ${c}`} onClick={() => setF({ ...f, avatar_color: c })} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: 0, cursor: 'pointer', outline: f.avatar_color === c ? '3px solid var(--kt-text)' : 'none', outlineOffset: 2 }} />)}</div></div>
        <div><label className="kt-label">Display name</label><input className="kt-input" maxLength={60} value={f.display_name} onChange={e => setF({ ...f, display_name: e.target.value })} /></div>
        <div><label className="kt-label">Bio</label><textarea className="kt-textarea" style={{ minHeight: 76 }} maxLength={300} value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} placeholder="Tell partners what you like to talk about" /></div>
        <div><label className="kt-label">Country</label><input className="kt-input" value={f.country} onChange={e => setF({ ...f, country: e.target.value })} /></div>
      </div>
      <div className="kt-card kt-stack">
        <h2 className="kt-h2">Languages</h2>
        <div className="kt-grid c2" style={{ gridTemplateColumns: '1fr 1fr' }}><LangSelect label="I speak" value={f.native_lang} onChange={v => setF({ ...f, native_lang: v })} /><LangSelect label="I am learning" value={f.learning_lang} onChange={v => setF({ ...f, learning_lang: v })} /></div>
        <div><label className="kt-label">Level</label><Segmented value={f.level} onChange={v => setF({ ...f, level: v })} options={LEVELS.map(l => ({ value: l, label: l }))} /></div>
        <div><label className="kt-label">Daily goal</label><Segmented value={f.daily_goal} onChange={v => setF({ ...f, daily_goal: v })} options={['1', '3', '5', '10'].map(g => ({ value: g, label: g }))} /></div>
        <div><label className="kt-label">Interests</label><InterestPicker value={f.interests} onChange={v => setF({ ...f, interests: v })} /></div>
      </div>
      <div className="kt-row kt-between kt-wrap"><button className="kt-btn danger" onClick={out}>Sign out</button><button className="kt-btn primary" disabled={!dirty || busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button></div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Profile = () => {
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
        <ProfilePage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Profile
