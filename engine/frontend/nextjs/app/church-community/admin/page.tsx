'use client'
// ============================================================
// ARKZEN GENERATED PAGE — church-community/admin
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-13T10:04:46.117Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { churchCommunityAnimations, pageVariants } from '@/arkzen/generated/church-community.animations'

// Utilities, types, and helper functions from @arkzen:components
import { create } from 'zustand'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Image as ImageIcon, Plus, Trash2, Search, X, Upload, Calendar, Loader2, Send, Sun, Moon, UserPlus } from 'lucide-react'

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

// Page component code (from @arkzen:page:admin)
const AdminPage = () => {
  const { T, mode, toggle } = useTheme()
  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [tab, setTab] = useState<'events' | 'members' | 'upload'>('events')
  const [photoForm, setPhotoForm] = useState({ event_id: '', url: '', caption: '', file_name: '', tags: '' })
  const [uploading, setUploading] = useState(false)
  const [eventForm, setEventForm] = useState({ title: '', description: '', event_date: '', is_members_only: false })
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [memberForm, setMemberForm] = useState({ name: '', role: 'member' as Role, email: '', bio: '' })
  const [creatingMember, setCreatingMember] = useState(false)

  useEffect(() => {
    fetch('/api/church-community/events').then(r => r.json()).then(d => setEvents(Array.isArray(d) ? d : d?.data ?? [])).catch(() => {})
    fetch('/api/church-community/members').then(r => r.json()).then(d => setMembers(Array.isArray(d) ? d : d?.data ?? [])).catch(() => {})
  }, [])

  const handleUpload = async () => {
    if (!photoForm.event_id || !photoForm.url || !photoForm.file_name) return
    setUploading(true)
    try {
      const tags = photoForm.tags ? photoForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      await fetch('/api/church-community/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...photoForm, event_id: Number(photoForm.event_id), tags }) })
      setPhotoForm({ event_id: '', url: '', caption: '', file_name: '', tags: '' })
    } catch {}
    finally { setUploading(false) }
  }

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.event_date) return
    setCreatingEvent(true)
    try {
      const res = await fetch('/api/church-community/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventForm) })
      const ev = await res.json()
      setEvents(p => [ev, ...p])
      setEventForm({ title: '', description: '', event_date: '', is_members_only: false })
    } catch {}
    finally { setCreatingEvent(false) }
  }

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Delete event and all its photos?')) return
    try { await fetch(`/api/church-community/events/${id}`, { method: 'DELETE' }); setEvents(p => p.filter(e => e.id !== id)) } catch {}
  }

  const handleCreateMember = async () => {
    if (!memberForm.name) return
    setCreatingMember(true)
    try {
      const res = await fetch('/api/church-community/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(memberForm) })
      const m = await res.json()
      setMembers(p => [m, ...p])
      setMemberForm({ name: '', role: 'member', email: '', bio: '' })
    } catch {}
    finally { setCreatingMember(false) }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Remove this member?')) return
    try { await fetch(`/api/church-community/members/${id}`, { method: 'DELETE' }); setMembers(p => p.filter(m => m.id !== id)) } catch {}
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 14, fontSize: 13, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.textPrimary, outline: 'none', boxSizing: 'border-box' }

  return (
    <>
      <style>{`@keyframes gc-shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }`}</style>
      <div style={{ minHeight: '100vh', background: T.bgGrad, transition: 'background 0.35s', paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: T.headerBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: `1px solid ${T.border}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', fontFamily: 'Georgia,serif' }}>Admin</span>
          <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
            {([['events', 'Events'], ['members', 'Members'], ['upload', 'Upload']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 22px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'none', color: tab === k ? T.purple : T.textMuted, borderBottom: tab === k ? `2px solid ${T.purple}` : '2px solid transparent', marginBottom: -2, transition: 'color 0.2s' }}>{l}</button>
            ))}
          </div>

          {/* Events tab */}
          {tab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <GCard T={T} style={{ padding: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 14 }}>Create New Event</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
                  <input placeholder="Event Title" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} style={inp} />
                  <input type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} style={inp} />
                  <input placeholder="Description" value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} style={inp} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.textSecond, cursor: 'pointer' }}>
                    <input type="checkbox" checked={eventForm.is_members_only} onChange={e => setEventForm(f => ({ ...f, is_members_only: e.target.checked }))} style={{ accentColor: T.purple }} />
                    Members only
                  </label>
                </div>
                <button onClick={handleCreateEvent} disabled={creatingEvent} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 50, background: T.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: creatingEvent ? 'not-allowed' : 'pointer', opacity: creatingEvent ? 0.6 : 1, boxShadow: T.shadowPurp }}>
                  {creatingEvent ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Create Event</>}
                </button>
              </GCard>
              <GCard T={T} style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Events ({events.length})</p>
                </div>
                {events.map((ev: ChurchEvent, i: number) => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: i < events.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{ev.title}</p>
                      <p style={{ fontSize: 11, color: T.textMuted }}>{formatDate(ev.event_date)}</p>
                    </div>
                    <button onClick={() => handleDeleteEvent(ev.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </GCard>
            </div>
          )}

          {/* Members tab */}
          {tab === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <GCard T={T} style={{ padding: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 14 }}>Add New Member</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input placeholder="Full Name" value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} style={inp} />
                  <select value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value as Role }))} style={inp}>
                    {(['pastor', 'elder', 'deacon', 'leader', 'member'] as Role[]).map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
                  </select>
                  <input type="email" placeholder="Email" value={memberForm.email} onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))} style={inp} />
                  <textarea placeholder="Bio" rows={3} value={memberForm.bio} onChange={e => setMemberForm(f => ({ ...f, bio: e.target.value }))} style={{ ...inp, resize: 'vertical' }} />
                  <button onClick={handleCreateMember} disabled={creatingMember} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 50, background: T.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: creatingMember ? 'not-allowed' : 'pointer', opacity: creatingMember ? 0.6 : 1, boxShadow: T.shadowPurp }}>
                    {creatingMember ? <Loader2 size={14} className="animate-spin" /> : <><UserPlus size={14} /> Add Member</>}
                  </button>
                </div>
              </GCard>
              <GCard T={T} style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Members ({members.length})</p>
                </div>
                {members.map((m: Member, i: number) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderBottom: i < members.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={m.name} size={32} T={T} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{m.name}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: roleBadge[m.role].bg, color: roleBadge[m.role].text }}>{roleLabel[m.role]}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteMember(m.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </GCard>
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <GCard T={T} style={{ padding: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 16 }}>Upload Photo</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select value={photoForm.event_id} onChange={e => setPhotoForm(f => ({ ...f, event_id: e.target.value }))} style={inp}>
                  <option value="">Select event</option>
                  {events.map((ev: ChurchEvent) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
                <input placeholder="Photo URL" value={photoForm.url} onChange={e => setPhotoForm(f => ({ ...f, url: e.target.value }))} style={inp} />
                <input placeholder="Filename (e.g. worship.jpg)" value={photoForm.file_name} onChange={e => setPhotoForm(f => ({ ...f, file_name: e.target.value }))} style={inp} />
                <input placeholder="Caption" value={photoForm.caption} onChange={e => setPhotoForm(f => ({ ...f, caption: e.target.value }))} style={inp} />
                <input placeholder="Tags (comma separated)" value={photoForm.tags} onChange={e => setPhotoForm(f => ({ ...f, tags: e.target.value }))} style={inp} />
                <button onClick={handleUpload} disabled={uploading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 50, background: T.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, boxShadow: T.shadowPurp }}>
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <><Upload size={15} /> Upload Photo</>}
                </button>
              </div>
            </GCard>
          )}
        </div>

        {/* Bottom nav */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: T.navBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
            {[{ icon: '⌂', label: 'Feed', href: '/church-community' }, { icon: '👥', label: 'Members', href: '/church-community/members' }, { icon: '🖼', label: 'Gallery', href: '/church-community/inventory' }, { icon: '⚙', label: 'Admin', href: '/church-community/admin' }].map(n => (
              <a key={n.href} href={n.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: T.textFaint }}>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em' }}>{n.label.toUpperCase()}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}

// Wrapper for animation + layout
const ArkzenPage_ChurchCommunity_Admin = () => {
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
        <AdminPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_ChurchCommunity_Admin
