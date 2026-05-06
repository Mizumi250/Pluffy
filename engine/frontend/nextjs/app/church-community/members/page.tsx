'use client'
// ============================================================
// ARKZEN GENERATED PAGE — church-community/members
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T11:18:01.311Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/church-community-app'
import { churchCommunityAnimations, pageVariants } from '@/arkzen/generated/church-community.animations'

// Utilities, types, and helper functions from @arkzen:components
import { create } from 'zustand'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send,
  Image as ImageIcon, Plus, Trash2, Edit2, Search, X, Upload, Tag,
  Calendar, Users, Archive, ChevronDown, Loader2, Eye, Filter, Check,
  AlertCircle, LogIn, LogOut, UserPlus, Camera, Settings
} from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'
import { Modal } from '@/arkzen/core/components/Modal'

// ─── Types ────────────────────────────────────────────────────────────────

export type Role = 'pastor' | 'elder' | 'deacon' | 'leader' | 'member'

export interface ChurchEvent {
  id: number
  title: string
  description: string | null
  event_date: string
  cover_photo_url: string | null
  is_members_only: boolean
  photo_count?: number
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
  events: [],
  selectedEvent: null,
  photos: [],
  loadingEvents: false,
  loadingPhotos: false,
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
  members: [],
  loading: false,
  searchQuery: '',
  roleFilter: 'all',
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
  photos: [],
  totalCount: 0,
  totalSize: 0,
  eventCount: 0,
  allTags: [],
  activeTag: null,
  loading: false,
  setData: (d) => set((s) => ({ ...s, ...d })),
}))

// ─── Utilities ────────────────────────────────────────────────────────────

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export const formatRelativeTime = (d: string) => {
  const now = new Date()
  const date = new Date(d)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return formatDate(d)
}

export const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const roleColors: Record<Role, string> = {
  pastor: 'bg-amber-800',
  elder: 'bg-emerald-700',
  deacon: 'bg-blue-700',
  leader: 'bg-purple-700',
  member: 'bg-stone-500',
}

export const roleLabel: Record<Role, string> = {
  pastor: 'Pastor',
  elder: 'Elder',
  deacon: 'Deacon',
  leader: 'Leader',
  member: 'Member',
}

export const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

// ─── Skeleton ─────────────────────────────────────────────────────────────

export const SkeletonBox: React.FC<{ width?: string; height?: number; radius?: number }> = ({
  width = '100%', height = 80, radius = 8,
}) => (
  <div style={{
    width,
    height,
    borderRadius: radius,
    background: 'linear-gradient(90deg, #f3ede5 25%, #e6dac8 50%, #f3ede5 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.8s infinite',
  }} />
)

// ─── Instagram‑style Post Card ───────────────────────────────────────────

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
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-bold">
            {photo.uploader?.name ? getInitials(photo.uploader.name) : '👤'}
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">{photo.uploader?.name ?? 'Church Member'}</p>
            <p className="text-xs text-amber-400">{formatRelativeTime(photo.created_at)}</p>
          </div>
        </div>
        <button className="text-amber-300 hover:text-amber-500">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Image */}
      <div className="relative bg-amber-50 aspect-square cursor-pointer" onClick={onComment}>
        {photo.url ? (
          <img src={photo.url} alt={photo.caption ?? photo.file_name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="flex items-center justify-center h-full text-amber-300"><ImageIcon size={48} /></div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="transition hover:scale-105">
            <Heart size={22} className={liked ? 'fill-red-500 text-red-500' : 'text-amber-400'} />
          </button>
          <button onClick={onComment} className="text-amber-400 hover:text-amber-600"><MessageCircle size={22} /></button>
          <button className="text-amber-400 hover:text-amber-600"><Share2 size={22} /></button>
        </div>
        <button className="text-amber-400 hover:text-amber-600"><Bookmark size={22} /></button>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <p className="text-sm font-semibold text-amber-800">{likesCount.toLocaleString()} likes</p>
      </div>

      {/* Caption */}
      {photo.caption && (
        <div className="px-3 pb-2">
          <p className="text-sm">
            <span className="font-semibold text-amber-800 mr-2">{photo.uploader?.name ?? 'Member'}</span>
            <span className="text-stone-600">{photo.caption}</span>
          </p>
        </div>
      )}

      {/* Tags */}
      {photo.tags && photo.tags.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {photo.tags.map(tag => (
            <span key={tag} className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Photo Grid (simple) ──────────────────────────────────────────────────

export const SimplePhotoGrid: React.FC<{ photos: Photo[]; loading?: boolean; onPhotoClick: (photo: Photo) => void }> = ({
  photos, loading, onPhotoClick
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => <SkeletonBox key={i} height={120} radius={0} />)}
      </div>
    )
  }
  if (photos.length === 0) {
    return <div className="text-center py-12 text-amber-400">No photos yet</div>
  }
  return (
    <div className="grid grid-cols-3 gap-1">
      {photos.map(photo => (
        <button key={photo.id} onClick={() => onPhotoClick(photo)} className="relative aspect-square bg-amber-50 overflow-hidden group">
          {photo.url ? (
            <img src={photo.url} alt="" className="w-full h-full object-cover transition group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex items-center justify-center h-full text-amber-300"><ImageIcon size={24} /></div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
        </button>
      ))}
    </div>
  )
}

// ─── Lightbox (Instagram style) ──────────────────────────────────────────

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
  photo: null,
  open: false,
  comments: [],
  loadingComments: false,
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
        method: 'POST',
        body: { body: commentText },
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
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
        {/* Image */}
        <div className="md:w-2/3 bg-black flex items-center justify-center min-h-[300px]">
          {photo.url ? (
            <img src={photo.url} alt={photo.caption ?? ''} className="max-w-full max-h-[70vh] object-contain" />
          ) : (
            <div className="text-white/30"><ImageIcon size={48} /></div>
          )}
        </div>

        {/* Info */}
        <div className="md:w-1/3 flex flex-col bg-white">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                {photo.uploader?.name ? getInitials(photo.uploader.name) : '👤'}
              </div>
              <div>
                <p className="text-sm font-semibold">{photo.uploader?.name ?? 'Member'}</p>
                <p className="text-xs text-amber-400">{formatRelativeTime(photo.created_at)}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
          </div>

          {photo.caption && (
            <div className="p-4 border-b">
              <p className="text-sm"><span className="font-semibold mr-2">{photo.uploader?.name ?? 'Member'}</span>{photo.caption}</p>
            </div>
          )}

          {photo.tags && photo.tags.length > 0 && (
            <div className="px-4 py-2 border-b flex flex-wrap gap-1">
              {photo.tags.map(tag => <span key={tag} className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">#{tag}</span>)}
            </div>
          )}

          <div className="p-4 border-b flex items-center gap-6">
            <button onClick={handleLike} className="flex items-center gap-1 text-stone-600 hover:text-red-500">
              <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : ''} /> {localLikes}
            </button>
            <button className="flex items-center gap-1 text-stone-600"><MessageCircle size={20} /> {comments.length}</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingComments ? <SkeletonBox height={60} /> : comments.map(c => (
              <div key={c.id}>
                <p className="text-sm"><span className="font-semibold mr-2">{c.user?.name ?? 'Member'}</span>{c.body}</p>
                <p className="text-xs text-amber-300 mt-0.5">{formatRelativeTime(c.created_at)}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 rounded-full border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm"
            />
            <button onClick={handleComment} disabled={submitting} className="text-amber-600 font-semibold text-sm disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Page component code (from @arkzen:page:members)
const MembersPage = () => {
  const { members, loading, searchQuery, roleFilter, setMembers, setLoading, setSearchQuery, setRoleFilter } = useMemberStore()
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await arkzenFetch('/api/church-community/members')
        setMembers(Array.isArray(data) ? data : data?.data ?? [])
      } catch {
        showToast('Failed to load members', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = members.filter(m => {
    const matchRole = roleFilter === 'all' || m.role === roleFilter
    const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchRole && matchSearch && m.is_active
  })

  const roles = ['all', 'pastor', 'elder', 'deacon', 'leader', 'member']

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                roleFilter === role
                  ? 'bg-amber-700 text-white'
                  : 'bg-white text-amber-700 border border-amber-200'
              }`}
            >
              {role === 'all' ? 'All' : roleLabel[role as Role]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonBox key={i} height={200} radius={16} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-amber-400">No members found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 text-center hover:shadow-md transition">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-200" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-2xl text-amber-600">
                  {getInitials(member.name)}
                </div>
              )}
              <h3 className="mt-3 font-semibold text-amber-900">{member.name}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs text-white ${roleColors[member.role]}`}>
                {roleLabel[member.role]}
              </span>
              {member.bio && <p className="text-xs text-stone-400 mt-2 line-clamp-2">{member.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_ChurchCommunity_Members = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = churchCommunityAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <AppLayout>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <MembersPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_ChurchCommunity_Members
