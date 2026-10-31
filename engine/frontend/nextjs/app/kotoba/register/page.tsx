'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/register
// Layout: +guest | Auth guard: false | Guest-only: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:17.507Z
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
import { useNav } from '../components/hooks'
import type { Ex, KComment, KPost, KProfile } from '../components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'

// Page component code (from @arkzen:page:register)
const RegisterPage = () => {
  const nav = useNav()
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try { await register(name, email, password, confirm) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create account') }
  }
  return (
    <div className="kt-hero kt-split" style={{ minHeight: '100vh', color: 'var(--kt-text)' }}>
      <div style={{ display: 'grid', placeItems: 'center', padding: 20 }}>
      <form onSubmit={submit} className="kt-card" style={{ width: '100%', maxWidth: 420, padding: 36, borderRadius: 36 }}>
        <div className="kt-brand" style={{ padding: 0, marginBottom: 18 }}><img className="kt-logo" src="https://api.iconify.design/lucide/languages.svg?color=%23121212" alt="" width={28} height={28} />Kotoba</div>
        <h1 className="kt-title" style={{ fontSize: 28 }}>Create your account</h1>
        <p className="kt-sub" style={{ margin: '6px 0 20px' }}>Free forever. Takes under a minute.</p>
        {error && <div role="alert" className="kt-chip" style={{ display: 'flex', background: 'rgba(155, 59, 52, 0.12)', color: 'var(--kt-red)', padding: '10px 14px', borderRadius: 16, marginBottom: 14, fontSize: 14 }}>{error}</div>}
        <div className="kt-stack">
          <div><label className="kt-label" htmlFor="kt-name">Name</label><input id="kt-name" className="kt-input" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label className="kt-label" htmlFor="kt-email">Email</label><input id="kt-email" className="kt-input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label className="kt-label" htmlFor="kt-pass">Password</label><input id="kt-pass" className="kt-input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></div>
          <div><label className="kt-label" htmlFor="kt-conf">Confirm password</label><input id="kt-conf" className="kt-input" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
          <button className="kt-btn primary block" type="submit" disabled={isLoading}>{isLoading ? 'Creating…' : 'Create account'}</button>
        </div>
        <p className="kt-sub" style={{ textAlign: 'center', marginTop: 18 }}>Already learning with us? <a style={{ color: 'var(--kt-blue)', cursor: 'pointer' }} onClick={() => nav.go('login')}>Sign in</a></p>
      </form>
      </div>
      <div className="kt-hide-m" style={{ padding: 20 }}><div className="kt-hero-art" style={{ height: '100%', aspectRatio: 'auto' }}><img className="kt-photo" src="https://picsum.photos/seed/kotoba-words/900/1125?grayscale" alt="" /></div></div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Register = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout guestOnly={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <RegisterPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_Kotoba_Register
