// ============================================================
// ARKZEN GENERATED ISLAND — church-community/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T10:58:24.875Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Calendar, Heart, Image as ImageIcon, Loader2, MessageCircle, Moon, MoreHorizontal, Plus, Search, Send, Share2, Sun, Trash2, Upload, UserPlus, X } from 'lucide-react'
import { create } from 'zustand'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { churchCommunityAnimations, pageVariants } from '@/arkzen/generated/church-community.animations'

// Utilities, types, and helper functions from @arkzen:components
// ─── Theme tokens ─────────────────────────────────────────────────────────────

export const LIGHT = {
  bgGrad:      'linear-gradient(160deg,#e8ecf5 0%,#f2f4fc 50%,#e4e8f4 100%)',
  surface:     'rgba(255,255,255,0.92)',
  surfaceSolid:'#ffffff',
  border:      'rgba(220,224,240,0.8)',
  headerBg:    'rgba(255,255,255,0.88)',
  navBg:       'rgba(255,255,255,0.92)',
  textPrimary: '#0f0f1a',
  textSecond:  '#4a5068',
  textMuted:   '#8e98b8',
  textFaint:   '#b8c0d8',
  purple:      '#6c5ce7',
  purpleGrad:  'linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%)',
  shadow:      '0 4px 24px rgba(80,90,140,0.10)',
  shadowPurp:  '0 6px 20px rgba(108,92,231,0.28)',
  inputBg:     'rgba(240,242,248,0.95)',
  inputBorder: 'rgba(200,206,230,0.7)',
  skelA:       'rgba(200,208,230,0.5)',
  skelB:       'rgba(220,226,244,0.8)',
  heartColor:  '#e84393',
}

export const DARK = {
  bgGrad:      'linear-gradient(160deg,#0d0d14 0%,#141420 50%,#0f0f1c 100%)',
  surface:     'rgba(255,255,255,0.055)',
  surfaceSolid:'#16162a',
  border:      'rgba(255,255,255,0.075)',
  headerBg:    'rgba(13,13,20,0.92)',
  navBg:       'rgba(16,16,26,0.96)',
  textPrimary: '#ebebff',
  textSecond:  '#9090b0',
  textMuted:   '#55557a',
  textFaint:   '#333350',
  purple:      '#a29bfe',
  purpleGrad:  'linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%)',
  shadow:      '0 4px 24px rgba(0,0,0,0.45)',
  shadowPurp:  '0 6px 20px rgba(108,92,231,0.38)',
  inputBg:     'rgba(255,255,255,0.045)',
  inputBorder: 'rgba(255,255,255,0.09)',
  skelA:       'rgba(255,255,255,0.035)',
  skelB:       'rgba(255,255,255,0.07)',
  heartColor:  '#ff6b9d',
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = 'pastor' | 'elder' | 'deacon' | 'leader' | 'member'

export interface ChurchEvent {
  id: number; title: string; description: string | null
  event_date: string; cover_photo_url: string | null
  is_members_only: boolean; created_at: string
}

export interface Photo {
  id: number; event_id: number; uploader_id: number
  url: string; thumbnail_url: string | null; caption: string | null
  file_name: string; file_size: number | null; tags: string[] | null
  likes_count: number; liked?: boolean
  uploader?: { id: number; name: string }
  event?: ChurchEvent; created_at: string
}

export interface Member {
  id: number; name: string; role: Role; photo_url: string | null
  email: string | null; bio: string | null; joined_at: string | null; is_active: boolean
}

export interface Comment {
  id: number; photo_id: number; user_id: number; body: string
  user?: { id: number; name: string }; created_at: string
}

// ─── Stores ───────────────────────────────────────────────────────────────────

export const useLightboxStore = create<{
  photo: Photo | null; open: boolean; comments: Comment[]; loadingComments: boolean
  setPhoto: (p: Photo | null) => void; setOpen: (v: boolean) => void
  setComments: (c: Comment[]) => void; setLoadingComments: (v: boolean) => void
}>((set) => ({
  photo: null, open: false, comments: [], loadingComments: false,
  setPhoto: (photo) => set({ photo }),
  setOpen: (open) => set({ open }),
  setComments: (comments) => set({ comments }),
  setLoadingComments: (loadingComments) => set({ loadingComments }),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export const formatRelativeTime = (d: string) => {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

export const roleBadge: Record<Role, { bg: string; text: string }> = {
  pastor:  { bg: 'linear-gradient(135deg,#6c5ce7,#a29bfe)', text: '#fff' },
  elder:   { bg: 'linear-gradient(135deg,#0984e3,#74b9ff)', text: '#fff' },
  deacon:  { bg: 'linear-gradient(135deg,#a29bfe,#fd79a8)', text: '#fff' },
  leader:  { bg: 'linear-gradient(135deg,#00b894,#55efc4)', text: '#fff' },
  member:  { bg: 'rgba(140,150,180,0.2)', text: '#6c7a99' },
}

export const roleLabel: Record<Role, string> = {
  pastor: 'Pastor', elder: 'Elder', deacon: 'Deacon', leader: 'Leader', member: 'Member',
}

// ─── useTheme ─────────────────────────────────────────────────────────────────

export function useTheme() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    try {
      const s = localStorage.getItem('gc-theme') as 'light' | 'dark' | null
      if (s) setMode(s)
    } catch {}
  }, [])
  const toggle = () => {
    const next = mode === 'light' ? 'dark' : 'light'
    setMode(next)
    try { localStorage.setItem('gc-theme', next) } catch {}
  }
  const T = mode === 'dark' ? DARK : LIGHT
  return { mode, toggle, T }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skel({ w = '100%', h = 80, r = 12, T }: { w?: string; h?: number; r?: number; T: typeof LIGHT }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: `linear-gradient(90deg,${T.skelA} 25%,${T.skelB} 50%,${T.skelA} 75%)`,
      backgroundSize: '200% 100%', animation: 'gc-shimmer 1.8s infinite',
    }} />
  )
}

// ─── GCard ────────────────────────────────────────────────────────────────────

export function GCard({ children, style = {}, T, onClick }: {
  children: React.ReactNode; style?: React.CSSProperties
  T: typeof LIGHT; onClick?: () => void
}) {
  return (
    <div onClick={onClick} style={{
      background: T.surface, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: T.shadow,
      transition: 'background 0.35s,border-color 0.35s',
      cursor: onClick ? 'pointer' : undefined, ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ name, photoUrl, size = 36, ring, T }: {
  name: string; photoUrl?: string | null; size?: number; ring?: boolean; T: typeof LIGHT
}) {
  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name} style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
        border: ring ? `2.5px solid ${T.purple}` : `2px solid ${T.border}`,
      }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: T.purpleGrad,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.34, fontWeight: 700, flexShrink: 0,
      border: ring ? `2.5px solid ${T.purple}` : '2px solid rgba(255,255,255,0.12)',
    }}>
      {getInitials(name)}
    </div>
  )
}

// ─── Story Bubble ─────────────────────────────────────────────────────────────

export function StoryBubble({ name, photoUrl, isAdd, T }: {
  name: string; photoUrl?: string | null; isAdd?: boolean; T: typeof LIGHT
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
      <div style={{ padding: 2, borderRadius: '50%', background: isAdd ? T.inputBg : T.purpleGrad, boxShadow: isAdd ? 'none' : T.shadowPurp }}>
        {isAdd ? (
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: T.shadowPurp }}>
            <Plus size={22} />
          </div>
        ) : (
          <div style={{ padding: 2, background: T.surfaceSolid, borderRadius: '50%' }}>
            <Avatar name={name} photoUrl={photoUrl} size={52} T={T} />
          </div>
        )}
      </div>
      <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 500, maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {isAdd ? 'Add new' : name.split(' ')[0]}
      </span>
    </div>
  )
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

export function PostCard({ photo, onComment, T }: {
  photo: Photo; onComment: () => void; T: typeof LIGHT
}) {
  const [liked, setLiked] = useState(photo.liked ?? false)
  const [cnt, setCnt] = useState(photo.likes_count)

  const handleLike = async () => {
    const n = !liked
    setLiked(n)
    setCnt(p => n ? p + 1 : p - 1)
    try {
      await fetch(`/api/church-community/photos/${photo.id}/like`, { method: 'POST' })
    } catch {
      setLiked(!n)
      setCnt(p => n ? p - 1 : p + 1)
    }
  }

  return (
    <GCard T={T} style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Avatar name={photo.uploader?.name ?? 'Member'} size={36} T={T} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, lineHeight: 1.2 }}>
              {photo.uploader?.name ?? 'Church Member'}
            </p>
            <p style={{ fontSize: 11, color: T.textMuted }}>{formatRelativeTime(photo.created_at)}</p>
          </div>
        </div>
        <button style={{ color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
          <MoreHorizontal size={17} />
        </button>
      </div>

      {/* Image */}
      <div onClick={onComment} style={{ position: 'relative', aspectRatio: '1', background: T.inputBg, cursor: 'pointer', overflow: 'hidden' }}>
        {photo.url
          ? <img src={photo.url} alt={photo.caption ?? ''} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.textFaint }}><ImageIcon size={36} /></div>
        }
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? T.heartColor : T.textMuted }}>
            <Heart size={21} fill={liked ? T.heartColor : 'none'} />
            {cnt > 0 && <span style={{ fontSize: 12, fontWeight: 700 }}>{cnt.toLocaleString()}</span>}
          </button>
          <button onClick={onComment} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted }}>
            <MessageCircle size={21} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted }}>
            <Share2 size={21} />
          </button>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted }}>
          <Bookmark size={21} />
        </button>
      </div>

      {/* Caption + tags */}
      <div style={{ padding: '4px 14px 14px' }}>
        {photo.caption && (
          <p style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: T.textPrimary, marginRight: 6 }}>{photo.uploader?.name ?? 'Member'}</span>
            {photo.caption}
          </p>
        )}
        {photo.tags && photo.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {photo.tags.map((tag: string) => (
              <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: T.inputBg, color: T.purple }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </GCard>
  )
}

// ─── PhotoLightbox ────────────────────────────────────────────────────────────

export function PhotoLightbox({ T }: { T: typeof LIGHT }) {
  const { photo, open, comments, loadingComments, setOpen, setComments, setLoadingComments } = useLightboxStore()
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!photo || !open) return
    setLocalLikes(photo.likes_count)
    setLiked(photo.liked ?? false)
    setLoadingComments(true)
    fetch(`/api/church-community/photos/${photo.id}/comments`)
      .then(r => r.json())
      .then(d => setComments(d?.comments ?? []))
      .catch(() => {})
      .finally(() => setLoadingComments(false))
  }, [photo, open])

  const handleLike = async () => {
    if (!photo) return
    const n = !liked
    setLiked(n)
    setLocalLikes(p => n ? p + 1 : p - 1)
    try { await fetch(`/api/church-community/photos/${photo.id}/like`, { method: 'POST' }) }
    catch { setLiked(!n); setLocalLikes(p => n ? p - 1 : p + 1) }
  }

  const handleComment = async () => {
    if (!photo || !commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/church-community/photos/${photo.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText }),
      })
      const data = await res.json()
      setComments([...comments, data.comment])
      setCommentText('')
    } catch {}
    finally { setSubmitting(false) }
  }

  if (!open || !photo) return null

  return (
    <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', maxWidth: 960, width: '100%', maxHeight: '92vh', borderRadius: 24, overflow: 'hidden', background: T.surfaceSolid, boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
        {/* Photo */}
        <div style={{ flex: '0 0 58%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photo.url
            ? <img src={photo.url} alt="" style={{ maxWidth: '100%', maxHeight: '92vh', objectFit: 'contain' }} />
            : <div style={{ color: 'rgba(255,255,255,0.1)' }}><ImageIcon size={48} /></div>
          }
        </div>
        {/* Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Avatar name={photo.uploader?.name ?? 'Member'} size={34} T={T} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{photo.uploader?.name ?? 'Member'}</p>
                <p style={{ fontSize: 11, color: T.textMuted }}>{formatRelativeTime(photo.created_at)}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          {photo.caption && (
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: T.textPrimary, marginRight: 6 }}>{photo.uploader?.name ?? 'Member'}</span>
                {photo.caption}
              </p>
            </div>
          )}
          <div style={{ padding: '10px 16px', display: 'flex', gap: 16, borderBottom: `1px solid ${T.border}` }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 5, color: liked ? T.heartColor : T.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              <Heart size={18} fill={liked ? T.heartColor : 'none'} /> {localLikes}
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: T.textMuted, fontSize: 13 }}>
              <MessageCircle size={18} /> {comments.length}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loadingComments
              ? <Skel h={50} T={T} />
              : comments.map((c: Comment) => (
                <div key={c.id}>
                  <p style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700, color: T.textPrimary, marginRight: 6 }}>{c.user?.name ?? 'Member'}</span>
                    {c.body}
                  </p>
                  <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{formatRelativeTime(c.created_at)}</p>
                </div>
              ))
            }
          </div>
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="Add a comment…"
              style={{ flex: 1, padding: '9px 14px', borderRadius: 50, fontSize: 13, outline: 'none', background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.textPrimary }}
            />
            <button onClick={handleComment} disabled={submitting} style={{ background: T.purpleGrad, color: '#fff', border: 'none', borderRadius: 50, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <><Send size={13} /> Post</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const { T, mode, toggle } = useTheme()
  const { setPhoto, setOpen } = useLightboxStore()
  const pageRef = useRef<HTMLDivElement>(null)

  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  useEffect(() => {
    setLoadingEvents(true)
    fetch('/api/church-community/events')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d?.data ?? []
        setEvents(list)
        if (list.length > 0) setSelectedEvent(list[0])
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (!selectedEvent) return
    setLoadingPhotos(true)
    fetch(`/api/church-community/events/${selectedEvent.id}/photos`)
      .then(r => r.json())
      .then(d => setPhotos(d?.photos ?? []))
      .catch(() => {})
      .finally(() => setLoadingPhotos(false))
  }, [selectedEvent])

  const storyNames = ['Add new', 'Pastor James', 'Elder Maria', 'Ana', 'Ben', 'Clara']

  return (
    <>
      <style>{`
        @keyframes gc-shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div ref={pageRef} style={{ minHeight: '100vh', background: T.bgGrad, transition: 'background 0.35s', paddingBottom: 80 }}>

        {/* Header */}
        <div className="gc-header" style={{ position: 'sticky', top: 0, zIndex: 30, background: T.headerBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: `1px solid ${T.border}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, boxShadow: T.shadowPurp }}>✝</div>
            <span style={{ fontSize: 17, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', fontFamily: 'Georgia,serif' }}>
              Grace<span style={{ color: T.purple }}>.</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={15} />
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px' }}>

          {/* Stories */}
          <div className="gc-stories">
            <GCard T={T} style={{ padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 2 }}>
                {storyNames.map((name, i) => (
                  <StoryBubble key={i} name={name} isAdd={i === 0} T={T} />
                ))}
              </div>
            </GCard>
          </div>

          {/* Post composer */}
          <GCard T={T} style={{ padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>U</div>
              <div style={{ flex: 1, padding: '10px 16px', borderRadius: 50, fontSize: 13, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.textMuted, cursor: 'pointer' }}>
                Share a blessing or moment…
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, fontSize: 13 }}>
                  <ImageIcon size={17} /> Photo
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, fontSize: 13 }}>
                  <Calendar size={17} /> Event
                </button>
              </div>
              <button style={{ background: T.purpleGrad, color: '#fff', border: 'none', borderRadius: 50, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: T.shadowPurp }}>
                Share
              </button>
            </div>
          </GCard>

          {/* Event pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
            {loadingEvents
              ? Array.from({ length: 3 }).map((_, i) => <Skel key={i} w="110px" h={34} r={50} T={T} />)
              : events.map((ev: ChurchEvent) => {
                  const active = selectedEvent?.id === ev.id
                  return (
                    <button key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ padding: '7px 18px', borderRadius: 50, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: active ? T.purpleGrad : T.surface, color: active ? '#fff' : T.textMuted, boxShadow: active ? T.shadowPurp : T.shadow }}>
                      {ev.title}
                    </button>
                  )
                })
            }
          </div>

          {/* Feed */}
          {selectedEvent ? (
            loadingPhotos
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{Array.from({ length: 2 }).map((_, i) => <Skel key={i} h={420} r={20} T={T} />)}</div>
              : photos.length === 0
                ? <div style={{ textAlign: 'center', padding: '64px 0', color: T.textMuted }}>No photos yet for this event</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {photos.map((photo: Photo) => (
                      <div key={photo.id} className="gc-card">
                        <PostCard photo={photo} T={T} onComment={() => { setPhoto(photo); setOpen(true) }} />
                      </div>
                    ))}
                  </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', color: T.textMuted }}>Select an event to see the feed</div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: T.navBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
            {[{ icon: '⌂', label: 'Feed', href: '/church-community' }, { icon: '👥', label: 'Members', href: '/church-community/members' }, { icon: '🖼', label: 'Gallery', href: '/church-community/inventory' }, { icon: '⚙', label: 'Admin', href: '/church-community/admin' }].map((n) => (
              <a key={n.href} href={n.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: T.textFaint }}>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em' }}>{n.label.toUpperCase()}</span>
              </a>
            ))}
          </div>
        </nav>

        <PhotoLightbox T={T} />
      </div>
    </>
  )
}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_ChurchCommunity_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = churchCommunityAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenIsland_ChurchCommunity_Index
