// ============================================================
// ARKZEN GENERATED PAGE — church-community/admin [React+Inertia]
// Layout: app | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-08T02:18:54.964Z
// ============================================================

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import { AppLayout } from '@/arkzen/core/layouts/custom/church-community-app'
import { churchCommunityAnimations, pageVariants } from '@/arkzen/generated/church-community.animations'


// Props passed from Laravel via Inertia::render()
export type ChurchCommunityAdminProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Shared components from @arkzen:components:shared ──────────────────────────
import { create } from 'zustand'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send,
  Image as ImageIcon, Plus, Trash2, Search, X, Upload, Tag,
  Calendar, Users, Loader2, Eye, Check, LogIn, UserPlus, Camera,
} from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'

// ─── Design tokens (Zutto palette) ───────────────────────────────────────
export const Z = {
  bg:          'linear-gradient(135deg, #c5d0de 0%, #d4dde8 50%, #bcc8d6 100%)',
  card:        'rgba(255,255,255,0.88)',
  cardSolid:   '#ffffff',
  purple:      '#7b6cf6',
  purpleLight: '#a78bfa',
  purpleGrad:  'linear-gradient(135deg, #7b6cf6 0%, #a78bfa 100%)',
  cyanGrad:    'linear-gradient(135deg, #6ec6f5 0%, #7b6cf6 100%)',
  textDark:    '#1a1a2e',
  textMid:     '#4a5580',
  textSoft:    '#8b9cc8',
  textMuted:   '#b0bcd4',
  border:      'rgba(255,255,255,0.7)',
  shadow:      '0 8px 32px rgba(100,120,180,0.12)',
  shadowPurp:  '0 6px 20px rgba(123,108,246,0.32)',
  radius:      '20px',
  radiusSm:    '12px',
  radiusXl:    '28px',
}

// ─── Types ────────────────────────────────────────────────────────────────

export type Role = 'pastor' | 'elder' | 'deacon' | 'leader' | 'member'

export interface ChurchEvent {
  id: number
  title: string
  description: string | null
  event_date: string
  cover_photo_url: string | null
  is_members_only: boolean
  created_at: string
}

export interface Photo {
  id: number
  event_id: number
  uploader_id: number
  url: string
  thumbnail_url: string | null
  caption: string | null
  file_name: string
  file_size: number | null
  tags: string[] | null
  likes_count: number
  liked?: boolean
  uploader?: { id: number; name: string }
  event?: ChurchEvent
  created_at: string
}

export interface Member {
  id: number
  name: string
  role: Role
  photo_url: string | null
  email: string | null
  bio: string | null
  joined_at: string | null
  is_active: boolean
}

export interface Comment {
  id: number
  photo_id: number
  user_id: number
  body: string
  user?: { id: number; name: string }
  created_at: string
}

// ─── Stores ────────────────────────────────────────────────────────────────

interface FeedStore {
  events: ChurchEvent[]
  selectedEvent: ChurchEvent | null
  photos: Photo[]
  loadingEvents: boolean
  loadingPhotos: boolean
  setEvents: (e: ChurchEvent[]) => void
  setSelectedEvent: (e: ChurchEvent | null) => void
  setPhotos: (p: Photo[]) => void
  setLoadingEvents: (v: boolean) => void
  setLoadingPhotos: (v: boolean) => void
}

export const useFeedStore = create<FeedStore>((set) => ({
  events: [], selectedEvent: null, photos: [],
  loadingEvents: false, loadingPhotos: false,
  setEvents: (events) => set({ events }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setPhotos: (photos) => set({ photos }),
  setLoadingEvents: (loadingEvents) => set({ loadingEvents }),
  setLoadingPhotos: (loadingPhotos) => set({ loadingPhotos }),
}))

interface MemberStore {
  members: Member[]
  loading: boolean
  searchQuery: string
  roleFilter: string
  setMembers: (m: Member[]) => void
  setLoading: (v: boolean) => void
  setSearchQuery: (q: string) => void
  setRoleFilter: (r: string) => void
}

export const useMemberStore = create<MemberStore>((set) => ({
  members: [], loading: false, searchQuery: '', roleFilter: 'all',
  setMembers: (members) => set({ members }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setRoleFilter: (roleFilter) => set({ roleFilter }),
}))

interface InventoryStore {
  photos: Photo[]
  totalCount: number
  totalSize: number
  eventCount: number
  allTags: string[]
  activeTag: string | null
  loading: boolean
  setData: (d: Partial<InventoryStore>) => void
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  photos: [], totalCount: 0, totalSize: 0, eventCount: 0,
  allTags: [], activeTag: null, loading: false,
  setData: (d) => set((s) => ({ ...s, ...d })),
}))

// ─── Utilities ────────────────────────────────────────────────────────────

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export const formatRelativeTime = (d: string) => {
  const diffMs = Date.now() - new Date(d).getTime()
  const m = Math.floor(diffMs / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '—'
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export const roleBadge: Record<Role, { bg: string; text: string }> = {
  pastor:  { bg: 'linear-gradient(135deg,#7b6cf6,#a78bfa)', text: '#fff' },
  elder:   { bg: 'linear-gradient(135deg,#6ec6f5,#7b6cf6)', text: '#fff' },
  deacon:  { bg: 'linear-gradient(135deg,#a78bfa,#c084fc)', text: '#fff' },
  leader:  { bg: 'linear-gradient(135deg,#818cf8,#6ec6f5)', text: '#fff' },
  member:  { bg: 'rgba(176,188,212,0.5)',                   text: '#4a5580' },
}

export const roleLabel: Record<Role, string> = {
  pastor: 'Pastor', elder: 'Elder', deacon: 'Deacon', leader: 'Leader', member: 'Member',
}

export const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

// ─── Skeleton ─────────────────────────────────────────────────────────────

export const SkeletonBox: React.FC<{ width?: string; height?: number; radius?: number }> = ({
  width = '100%', height = 80, radius = 12,
}) => (
  <div
    style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(200,210,230,0.5) 25%, rgba(220,228,242,0.8) 50%, rgba(200,210,230,0.5) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.8s infinite',
    }}
  />
)

// ─── ZCard ────────────────────────────────────────────────────────────────

export const ZCard: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children, className = '', style = {}
}) => (
  <div
    className={className}
    style={{
      background: Z.card,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: Z.radius,
      border: `1px solid ${Z.border}`,
      boxShadow: Z.shadow,
      ...style,
    }}
  >
    {children}
  </div>
)

// ─── ZButton ──────────────────────────────────────────────────────────────

export const ZButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'purple' | 'cyan' | 'ghost' | 'outline'
  className?: string
  fullWidth?: boolean
}> = ({ children, onClick, disabled, variant = 'purple', className = '', fullWidth }) => {
  const styles: Record<string, React.CSSProperties> = {
    purple:  { background: Z.purpleGrad, color: '#fff', boxShadow: Z.shadowPurp },
    cyan:    { background: Z.cyanGrad,   color: '#fff', boxShadow: '0 6px 20px rgba(110,198,245,0.3)' },
    ghost:   { background: 'rgba(123,108,246,0.08)', color: Z.purple },
    outline: { background: 'transparent', color: Z.textMid, border: `1px solid rgba(180,190,215,0.6)` },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 font-semibold rounded-full transition-all ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        padding: '10px 24px',
        fontSize: 14,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

// ─── ZInput ───────────────────────────────────────────────────────────────

export const ZInput: React.FC<{
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
}> = ({ value, onChange, placeholder, type = 'text', onKeyDown }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    style={{
      width: '100%',
      padding: '10px 16px',
      borderRadius: '12px',
      border: '1.5px solid rgba(200,210,230,0.6)',
      background: 'rgba(255,255,255,0.7)',
      color: Z.textDark,
      fontSize: 14,
      outline: 'none',
    }}
    onFocus={e => { e.target.style.borderColor = Z.purple; e.target.style.boxShadow = `0 0 0 3px rgba(123,108,246,0.12)` }}
    onBlur={e => { e.target.style.borderColor = 'rgba(200,210,230,0.6)'; e.target.style.boxShadow = 'none' }}
  />
)

// ─── Avatar ───────────────────────────────────────────────────────────────

export const Avatar: React.FC<{ name: string; photoUrl?: string | null; size?: number }> = ({
  name, photoUrl, size = 36,
}) => (
  photoUrl ? (
    <img
      src={photoUrl}
      alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)' }}
    />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: Z.purpleGrad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: size * 0.33, fontWeight: 700,
        border: '2px solid rgba(255,255,255,0.8)',
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
  )
)

// ─── Post Card (Zutto style) ──────────────────────────────────────────────

interface PostCardProps {
  photo: Photo
  onLike: () => void
  onComment: () => void
}

export const PostCard: React.FC<PostCardProps> = ({ photo, onLike, onComment }) => {
  const [liked, setLiked] = useState(photo.liked ?? false)
  const [likesCount, setLikesCount] = useState(photo.likes_count)
  const { showToast } = useToast()

  const handleLike = async () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1)
    try {
      await arkzenFetch(`/api/church-community/photos/${photo.id}/like`, { method: 'POST' })
      onLike()
    } catch {
      setLiked(!newLiked)
      setLikesCount(prev => newLiked ? prev - 1 : prev + 1)
      showToast('Failed to like', 'error')
    }
  }

  return (
    <ZCard style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
      className="hover:scale-[1.01]"
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={photo.uploader?.name ?? 'Member'} size={36} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: Z.textDark }}>{photo.uploader?.name ?? 'Church Member'}</p>
            <p style={{ fontSize: 11, color: Z.textMuted }}>{formatRelativeTime(photo.created_at)}</p>
          </div>
        </div>
        <button style={{ color: Z.textMuted }}><MoreHorizontal size={18} /></button>
      </div>

      {/* Image */}
      <div
        style={{ position: 'relative', aspectRatio: '1', background: 'rgba(200,210,230,0.3)', cursor: 'pointer' }}
        onClick={onComment}
      >
        {photo.url ? (
          <img src={photo.url} alt={photo.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: Z.textMuted }}>
            <ImageIcon size={40} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 5, color: liked ? '#ef4444' : Z.textSoft, transition: 'transform 0.15s' }} className="hover:scale-110">
            <Heart size={20} fill={liked ? '#ef4444' : 'none'} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{likesCount > 0 ? likesCount.toLocaleString() : ''}</span>
          </button>
          <button onClick={onComment} style={{ display: 'flex', alignItems: 'center', gap: 5, color: Z.textSoft }}>
            <MessageCircle size={20} />
          </button>
          <button style={{ color: Z.textSoft }}><Share2 size={20} /></button>
        </div>
        <button style={{ color: Z.textSoft }}><Bookmark size={20} /></button>
      </div>

      {/* Caption */}
      {photo.caption && (
        <div style={{ padding: '0 16px 10px' }}>
          <p style={{ fontSize: 13, color: Z.textMid }}>
            <span style={{ fontWeight: 700, color: Z.textDark, marginRight: 6 }}>{photo.uploader?.name ?? 'Member'}</span>
            {photo.caption}
          </p>
        </div>
      )}

      {/* Tags */}
      {photo.tags && photo.tags.length > 0 && (
        <div style={{ padding: '0 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {photo.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
              background: 'rgba(123,108,246,0.1)', color: Z.purple,
            }}>#{tag}</span>
          ))}
        </div>
      )}
    </ZCard>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────

interface LightboxState {
  photo: Photo | null
  open: boolean
  comments: Comment[]
  loadingComments: boolean
  setPhoto: (p: Photo | null) => void
  setOpen: (v: boolean) => void
  setComments: (c: Comment[]) => void
  setLoadingComments: (v: boolean) => void
}

export const useLightboxStore = create<LightboxState>((set) => ({
  photo: null, open: false, comments: [], loadingComments: false,
  setPhoto: (photo) => set({ photo }),
  setOpen: (open) => set({ open }),
  setComments: (comments) => set({ comments }),
  setLoadingComments: (loadingComments) => set({ loadingComments }),
}))

export const PhotoLightbox: React.FC = () => {
  const { photo, open, comments, loadingComments, setOpen, setComments, setLoadingComments } = useLightboxStore()
  const { showToast } = useToast()
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!photo || !open) return
    setLocalLikes(photo.likes_count)
    setLiked(photo.liked ?? false)
    setLoadingComments(true)
    arkzenFetch(`/api/church-community/photos/${photo.id}/comments`)
      .then(d => setComments(d?.comments ?? []))
      .catch(() => {})
      .finally(() => setLoadingComments(false))
  }, [photo, open])

  const handleLike = async () => {
    if (!photo) return
    const newLiked = !liked
    setLiked(newLiked)
    setLocalLikes(prev => newLiked ? prev + 1 : prev - 1)
    try {
      await arkzenFetch(`/api/church-community/photos/${photo.id}/like`, { method: 'POST' })
    } catch {
      setLiked(!newLiked)
      setLocalLikes(prev => newLiked ? prev - 1 : prev + 1)
    }
  }

  const handleComment = async () => {
    if (!photo || !commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await arkzenFetch(`/api/church-community/photos/${photo.id}/comments`, {
        method: 'POST', body: { body: commentText },
      })
      setComments([...comments, res.comment])
      setCommentText('')
    } catch {
      showToast('Failed to post comment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || !photo) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,20,40,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          position: 'relative', maxWidth: 900, width: '100%', maxHeight: '90vh',
          background: '#fff', borderRadius: 24, overflow: 'hidden',
          display: 'flex', flexDirection: 'row',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div style={{ flex: '0 0 60%', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          {photo.url
            ? <img src={photo.url} alt={photo.caption ?? ''} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
            : <div style={{ color: 'rgba(255,255,255,0.2)' }}><ImageIcon size={48} /></div>
          }
        </div>

        {/* Info panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f2f8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={photo.uploader?.name ?? 'Member'} size={34} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: Z.textDark }}>{photo.uploader?.name ?? 'Member'}</p>
                <p style={{ fontSize: 11, color: Z.textMuted }}>{formatRelativeTime(photo.created_at)}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: Z.textMuted }}><X size={20} /></button>
          </div>

          {photo.caption && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f2f8' }}>
              <p style={{ fontSize: 13, color: Z.textMid }}>{photo.caption}</p>
            </div>
          )}

          {photo.tags && photo.tags.length > 0 && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f2f8', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {photo.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(123,108,246,0.08)', color: Z.purple, fontWeight: 600 }}>#{tag}</span>
              ))}
            </div>
          )}

          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f2f8', display: 'flex', gap: 20 }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 5, color: liked ? '#ef4444' : Z.textSoft, fontSize: 13 }}>
              <Heart size={18} fill={liked ? '#ef4444' : 'none'} /> {localLikes}
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, color: Z.textSoft, fontSize: 13 }}>
              <MessageCircle size={18} /> {comments.length}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loadingComments ? <SkeletonBox height={50} /> : comments.map(c => (
              <div key={c.id}>
                <p style={{ fontSize: 13, color: Z.textMid }}>
                  <span style={{ fontWeight: 700, color: Z.textDark, marginRight: 6 }}>{c.user?.name ?? 'Member'}</span>
                  {c.body}
                </p>
                <p style={{ fontSize: 10, color: Z.textMuted, marginTop: 2 }}>{formatRelativeTime(c.created_at)}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f2f8', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="Add a comment..."
              style={{ flex: 1, padding: '8px 14px', borderRadius: 20, border: '1.5px solid #e8eaf6', fontSize: 13, outline: 'none', background: '#f8f9ff', color: Z.textDark }}
            />
            <button
              onClick={handleComment}
              disabled={submitting}
              style={{ background: Z.purpleGrad, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1 }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page component from @arkzen:page:admin ─────────────────────────────
const AdminPage = () => {
  const { showToast } = useToast()
  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)

  const [photoForm, setPhotoForm] = useState({ event_id: '', url: '', caption: '', file_name: '', tags: '' })
  const [uploading, setUploading] = useState(false)

  const [eventForm, setEventForm] = useState({ title: '', description: '', event_date: '', is_members_only: false })
  const [creatingEvent, setCreatingEvent] = useState(false)

  const [memberForm, setMemberForm] = useState({ name: '', role: 'member' as Role, email: '', bio: '' })
  const [creatingMember, setCreatingMember] = useState(false)

  useEffect(() => {
    setLoadingEvents(true)
    arkzenFetch('/api/church-community/events')
      .then(d => setEvents(Array.isArray(d) ? d : d?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingEvents(false))

    setLoadingMembers(true)
    arkzenFetch('/api/church-community/members')
      .then(d => setMembers(Array.isArray(d) ? d : d?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingMembers(false))
  }, [])

  const handleUpload = async () => {
    if (!photoForm.event_id || !photoForm.url || !photoForm.file_name) {
      showToast('Event, URL, and filename are required', 'error'); return
    }
    setUploading(true)
    try {
      const tags = photoForm.tags ? photoForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      await arkzenFetch('/api/church-community/photos', {
        method: 'POST', body: { ...photoForm, event_id: Number(photoForm.event_id), tags },
      })
      showToast('Photo uploaded successfully', 'success')
      setPhotoForm({ event_id: '', url: '', caption: '', file_name: '', tags: '' })
    } catch { showToast('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.event_date) { showToast('Title and date are required', 'error'); return }
    setCreatingEvent(true)
    try {
      const ev = await arkzenFetch('/api/church-community/events', { method: 'POST', body: eventForm })
      setEvents(prev => [ev, ...prev])
      showToast('Event created', 'success')
      setEventForm({ title: '', description: '', event_date: '', is_members_only: false })
    } catch { showToast('Failed to create event', 'error') }
    finally { setCreatingEvent(false) }
  }

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Delete this event and all its photos?')) return
    try {
      await arkzenFetch(`/api/church-community/events/${id}`, { method: 'DELETE' })
      setEvents(prev => prev.filter(e => e.id !== id))
      showToast('Event deleted', 'success')
    } catch { showToast('Failed to delete', 'error') }
  }

  const handleCreateMember = async () => {
    if (!memberForm.name) { showToast('Name is required', 'error'); return }
    setCreatingMember(true)
    try {
      const m = await arkzenFetch('/api/church-community/members', { method: 'POST', body: memberForm })
      setMembers(prev => [m, ...prev])
      showToast('Member added', 'success')
      setMemberForm({ name: '', role: 'member', email: '', bio: '' })
    } catch { showToast('Failed to add member', 'error') }
    finally { setCreatingMember(false) }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Remove this member?')) return
    try {
      await arkzenFetch(`/api/church-community/members/${id}`, { method: 'DELETE' })
      setMembers(prev => prev.filter(m => m.id !== id))
      showToast('Member removed', 'success')
    } catch { showToast('Failed to remove', 'error') }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 14,
    border: '1.5px solid rgba(200,210,230,0.6)',
    background: 'rgba(255,255,255,0.7)', color: Z.textDark, outline: 'none', boxSizing: 'border-box',
  }

  const SectionCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <ZCard style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(200,210,230,0.3)', background: 'rgba(123,108,246,0.04)' }}>
        <span style={{ color: Z.purple }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: Z.textDark }}>{title}</span>
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </ZCard>
  )

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: Z.textDark, letterSpacing: '-0.03em' }}>Admin Panel</h2>
        <p style={{ fontSize: 14, color: Z.textSoft, marginTop: 2 }}>Manage your church community</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Upload Photo */}
        <SectionCard icon={<Upload size={16} />} title="Upload Photo">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={photoForm.event_id} onChange={e => setPhotoForm(f => ({ ...f, event_id: e.target.value }))} style={inputStyle}>
              <option value="">Select event</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
            <input type="text" placeholder="Photo URL" value={photoForm.url} onChange={e => setPhotoForm(f => ({ ...f, url: e.target.value }))} style={inputStyle} />
            <input type="text" placeholder="Filename" value={photoForm.file_name} onChange={e => setPhotoForm(f => ({ ...f, file_name: e.target.value }))} style={inputStyle} />
            <input type="text" placeholder="Caption" value={photoForm.caption} onChange={e => setPhotoForm(f => ({ ...f, caption: e.target.value }))} style={inputStyle} />
            <input type="text" placeholder="Tags (comma separated)" value={photoForm.tags} onChange={e => setPhotoForm(f => ({ ...f, tags: e.target.value }))} style={inputStyle} />
            <ZButton onClick={handleUpload} disabled={uploading} fullWidth>
              {uploading ? <Loader2 size={15} className="animate-spin" /> : 'Upload Photo'}
            </ZButton>
          </div>
        </SectionCard>

        {/* Add Member */}
        <SectionCard icon={<UserPlus size={16} />} title="Add Member">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" placeholder="Full Name" value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <select value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value as Role }))} style={inputStyle}>
              {(['pastor','elder','deacon','leader','member'] as Role[]).map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
            </select>
            <input type="email" placeholder="Email" value={memberForm.email} onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
            <textarea placeholder="Bio" rows={3} value={memberForm.bio} onChange={e => setMemberForm(f => ({ ...f, bio: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
            <ZButton onClick={handleCreateMember} disabled={creatingMember} fullWidth>
              {creatingMember ? <Loader2 size={15} className="animate-spin" /> : 'Add Member'}
            </ZButton>
          </div>
        </SectionCard>
      </div>

      {/* Create Event */}
      <SectionCard icon={<Calendar size={16} />} title="Create Event">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <input type="text" placeholder="Event Title" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
          <input type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} style={inputStyle} />
          <textarea placeholder="Description" rows={1} value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="mo" checked={eventForm.is_members_only} onChange={e => setEventForm(f => ({ ...f, is_members_only: e.target.checked }))} style={{ accentColor: Z.purple }} />
            <label htmlFor="mo" style={{ fontSize: 13, color: Z.textMid, cursor: 'pointer' }}>Members only</label>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <ZButton onClick={handleCreateEvent} disabled={creatingEvent}>
            {creatingEvent ? <Loader2 size={15} className="animate-spin" /> : 'Create Event'}
          </ZButton>
        </div>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Manage Events */}
        <SectionCard icon={<Calendar size={16} />} title={`Events (${events.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.map(ev => (
              <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(200,210,230,0.3)' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: Z.textDark }}>{ev.title}</p>
                  <p style={{ fontSize: 11, color: Z.textMuted }}>{formatDate(ev.event_date)}</p>
                </div>
                <button onClick={() => handleDeleteEvent(ev.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Manage Members */}
        <SectionCard icon={<Users size={16} />} title={`Members (${members.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(200,210,230,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={m.name} size={28} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: Z.textDark }}>{m.name}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: roleBadge[m.role].bg, color: roleBadge[m.role].text }}>
                      {roleLabel[m.role]}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDeleteMember(m.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_ChurchCommunity_Admin() {
  const props   = usePage<ChurchCommunityAdminProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = churchCommunityAnimations(pageRef)
    return cleanup
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AdminPage {...props} />
    </motion.div>
  )

  return <AppLayout>{content}</AppLayout>
}

export default ArkzenPage_ChurchCommunity_Admin
