// ============================================================
// ARKZEN GENERATED PAGE — church-community/register [React+Inertia]
// Layout: guest | Auth: false | Guest-only: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-08T02:18:54.969Z
// ============================================================

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { churchCommunityAnimations, pageVariants } from '@/arkzen/generated/church-community.animations'


// Props passed from Laravel via Inertia::render()
export type ChurchCommunityRegisterProps = {
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

// ── Page component from @arkzen:page:register ─────────────────────────────
const RegisterPage = () => {
  const { register } = useAuthStore()
  const { showToast } = useToast()
  const router = useArkzenRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { showToast('All fields required', 'error'); return }
    if (form.password !== form.password_confirmation) { showToast('Passwords do not match', 'error'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation)
      router('/church-community')
    } catch { showToast('Registration failed', 'error') }
    finally { setLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 14, border: '1.5px solid rgba(200,210,230,0.6)',
    background: 'rgba(255,255,255,0.7)', color: Z.textDark, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'linear-gradient(135deg, #c5d0de 0%, #d4dde8 50%, #bcc8d6 100%)',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 28, boxShadow: '0 20px 60px rgba(100,120,180,0.18)',
          border: '1px solid rgba(255,255,255,0.8)',
          padding: 40, width: '100%', maxWidth: 420,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: Z.purpleGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
            boxShadow: Z.shadowPurp, fontSize: 20, color: '#fff',
          }}>✝</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: Z.textDark, letterSpacing: '-0.03em' }}>Create Account</h1>
          <p style={{ fontSize: 13, color: Z.textSoft, marginTop: 4 }}>Join our church community</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} />
          <input type="password" placeholder="Confirm Password" value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} style={inputStyle} />
          <button
            onClick={handleRegister} disabled={loading}
            style={{ width: '100%', padding: 13, borderRadius: 14, background: Z.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: Z.shadowPurp, marginTop: 4 }}
          >
            {loading ? <Loader2 size={18} style={{ display: 'inline', animation: 'spin 1s linear infinite' }} /> : 'Create Account'}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: Z.textSoft, marginTop: 20 }}>
          Already have an account?{' '}
          <a href="/church-community/login" style={{ color: Z.purple, fontWeight: 700, textDecoration: 'none' }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_ChurchCommunity_Register() {
  const props   = usePage<ChurchCommunityRegisterProps>().props
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
      <RegisterPage {...props} />
    </motion.div>
  )

  return <GuestLayout guestOnly={true}>{content}</GuestLayout>
}

export default ArkzenPage_ChurchCommunity_Register
