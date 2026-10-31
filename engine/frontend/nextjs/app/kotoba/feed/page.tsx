'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kotoba/feed
// Layout: +auth:shell | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:15.158Z
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
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/kotoba-shell'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'

// Page component code (from @arkzen:page:feed)
const FeedPage = () => {
  const { profile } = useProfile()
  const [scope, setScope] = useState('all')
  const [lang, setLang] = useState('all')
  const [posts, setPosts] = useState<KPost[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)

  useEffect(() => { if (window.location.hash === '#help') setScope('help') }, [])
  const load = useCallback(async () => {
    setError(null)
    try { const r = await kt<{ data: KPost[] }>(`/feed?scope=${scope}${lang !== 'all' ? `&lang=${lang}` : ''}`); setPosts(r.data) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load the feed'); setPosts([]) }
  }, [scope, lang])
  useEffect(() => { setPosts(null); load() }, [load])

  return (
    <div className="kt-stack" style={{ gap: 20 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">Community</h1><p className="kt-subtitle">Write, get corrected, return the favour.</p></div>
      </div>
      <ComposeBox lang={profile?.learning_lang ?? 'es'} onPosted={p => setPosts(list => [p, ...(list ?? [])])} />
      <div className="kt-row kt-between kt-wrap">
        <Segmented value={scope} onChange={setScope} options={[{ value: 'all', label: 'For you' }, { value: 'following', label: 'Following' }, { value: 'help', label: `Needs ${langName(profile?.native_lang) || 'help'} help` }, { value: 'mine', label: 'Mine' }]} />
        <select className="kt-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 14 }} value={lang} onChange={e => setLang(e.target.value)} aria-label="Filter by language">
          <option value="all">All languages</option>{LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>
      {posts === null && <Skeletons n={3} h={170} />}
      {error && <Empty icon="wifi-off" title="Feed unavailable" text={error} action={<button className="kt-btn primary" onClick={load}>Retry</button>} />}
      {posts && !error && posts.length === 0 && <Empty icon="pen-line" title="Nothing here yet" text={scope === 'help' ? `No unanswered ${langName(profile?.native_lang)} posts right now. Check back soon.` : 'Be the first to post something in your target language.'} />}
      <div className="kt-stack" style={{ gap: 16 }}>{posts?.map(p => <PostCard key={p.id} post={p} meId={profile?.user_id} onProfile={setViewing} onDeleted={id => setPosts(l => (l ?? []).filter(x => x.id !== id))} />)}</div>
      <ProfileSheet userId={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Kotoba_Feed = () => {
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
        <FeedPage />
      </motion.div>
    </AuthLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_Kotoba_Feed
