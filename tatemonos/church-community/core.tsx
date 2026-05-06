/* @arkzen:meta
name: church-community
version: 1.0.0
label: Grace Community Church
auth: true
description: Church community platform with event photo sharing, member directory, image inventory, and admin controls
*/

/* @arkzen:config
toast:
  position: top-right
  duration: 3000
*/

/* @arkzen:database:members
table: members
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 255
    nullable: false
  role:
    type: enum
    values: [pastor, elder, deacon, leader, member]
    default: member
  photo_url:
    type: string
    length: 500
    nullable: true
  email:
    type: string
    length: 255
    nullable: true
  bio:
    type: text
    nullable: true
  joined_at:
    type: date
    nullable: true
  is_active:
    type: boolean
    default: true
seeder:
  count: 6
  data:
    - name: "Pastor James Reyes"
      role: "pastor"
      email: "james.reyes@gracechurch.com"
      bio: "Lead pastor for 12 years. Passionate about community and discipleship."
      joined_at: "2013-06-01"
      is_active: true
    - name: "Elder Maria Santos"
      role: "elder"
      email: "maria.santos@gracechurch.com"
      bio: "Leads the women's ministry and Sunday school."
      joined_at: "2015-03-15"
      is_active: true
    - name: "Deacon Carlo Cruz"
      role: "deacon"
      email: "carlo.cruz@gracechurch.com"
      bio: "Oversees building and hospitality ministries."
      joined_at: "2017-09-10"
      is_active: true
    - name: "Ana Dela Rosa"
      role: "leader"
      email: "ana.delarosa@gracechurch.com"
      bio: "Youth ministry coordinator and worship team leader."
      joined_at: "2019-01-20"
      is_active: true
    - name: "Ben Villanueva"
      role: "member"
      email: "ben.villanueva@gracechurch.com"
      bio: "Active in the men's fellowship group."
      joined_at: "2020-08-05"
      is_active: true
    - name: "Clara Manalo"
      role: "member"
      email: "clara.manalo@gracechurch.com"
      bio: "Volunteers with children's church every Sunday."
      joined_at: "2021-04-18"
      is_active: true
*/

/* @arkzen:database:events
table: events
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  title:
    type: string
    length: 255
    nullable: false
  description:
    type: text
    nullable: true
  event_date:
    type: date
    nullable: false
  cover_photo_url:
    type: string
    length: 500
    nullable: true
  is_members_only:
    type: boolean
    default: false
seeder:
  count: 3
  data:
    - title: "Sunday Worship Service"
      description: "Our weekly gathering for worship, prayer, and the Word."
      event_date: "2026-05-04"
      is_members_only: false
    - title: "Youth Outreach Day"
      description: "Community service outreach led by the youth ministry."
      event_date: "2026-04-27"
      is_members_only: false
    - title: "Easter Celebration"
      description: "Sunrise service and Easter celebration with choir and children's pageant."
      event_date: "2026-04-20"
      is_members_only: false
*/

/* @arkzen:database:photos
table: photos
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  event_id:
    type: foreignId
    foreign: church_community_events.id
    nullable: false
  uploader_id:
    type: foreignId
    foreign: church_community_users.id
    nullable: false
  url:
    type: string
    length: 500
    nullable: false
  thumbnail_url:
    type: string
    length: 500
    nullable: true
  caption:
    type: string
    length: 500
    nullable: true
  file_name:
    type: string
    length: 255
    nullable: false
  file_size:
    type: integer
    nullable: true
  tags:
    type: json
    nullable: true
  likes_count:
    type: integer
    default: 0
*/

/* @arkzen:database:photo_likes
table: photo_likes
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  photo_id:
    type: foreignId
    foreign: church_community_photos.id
    nullable: false
  user_id:
    type: foreignId
    foreign: church_community_users.id
    nullable: false
*/

/* @arkzen:database:photo_comments
table: photo_comments
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  photo_id:
    type: foreignId
    foreign: church_community_photos.id
    nullable: false
  user_id:
    type: foreignId
    foreign: church_community_users.id
    nullable: false
  body:
    type: text
    nullable: false
*/

/* @arkzen:api:events
model: Event
controller: EventController
prefix: /api/church-community
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /events
    description: Get all events ordered by event_date desc
    response:
      type: collection
  store:
    method: POST
    route: /events
    description: Create a new church event
    validation:
      title: required|string|max:255
      description: sometimes|string
      event_date: required|date
      is_members_only: sometimes|boolean
    response:
      type: single
  show:
    method: GET
    route: /events/{id}
    description: Get a single event with its photos
    response:
      type: single
  update:
    method: PUT
    route: /events/{id}
    description: Update an existing event
    validation:
      title: sometimes|string|max:255
      description: sometimes|string
      event_date: sometimes|date
      is_members_only: sometimes|boolean
    response:
      type: single
  destroy:
    method: DELETE
    route: /events/{id}
    description: Delete an event and its associated photos
    response:
      type: message
      value: Event deleted
*/

/* @arkzen:api:members
model: Member
controller: MemberController
prefix: /api/church-community
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /members
    description: Get all active members optionally filtered by role
    response:
      type: collection
  store:
    method: POST
    route: /members
    description: Create a new member record
    validation:
      name: required|string|max:255
      role: required|in:pastor,elder,deacon,leader,member
      email: sometimes|email|max:255
      bio: sometimes|string
      joined_at: sometimes|date
    response:
      type: single
  show:
    method: GET
    route: /members/{id}
    description: Get a single member record
    response:
      type: single
  update:
    method: PUT
    route: /members/{id}
    description: Update a member record
    validation:
      name: sometimes|string|max:255
      role: sometimes|in:pastor,elder,deacon,leader,member
      email: sometimes|email
      bio: sometimes|string
      is_active: sometimes|boolean
    response:
      type: single
  destroy:
    method: DELETE
    route: /members/{id}
    description: Remove a member from the directory
    response:
      type: message
      value: Member removed
*/

/* @arkzen:api:photos
model: Photo
controller: PhotoController
prefix: /api/church-community
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /photos
    description: Get all photos with optional event_id or tag filter
    response:
      type: collection
  store:
    method: POST
    route: /photos
    description: Upload a new photo and associate it with an event
    validation:
      event_id: required|integer|exists:church_community_events,id
      url: required|string|max:500
      caption: sometimes|string|max:500
      file_name: required|string|max:255
      file_size: sometimes|integer
      tags: sometimes|array
    response:
      type: single
  show:
    method: GET
    route: /photos/{id}
    description: Get a single photo with comments
    response:
      type: single
  update:
    method: PUT
    route: /photos/{id}
    description: Update photo caption or tags
    validation:
      caption: sometimes|string|max:500
      tags: sometimes|array
    response:
      type: single
  destroy:
    method: DELETE
    route: /photos/{id}
    description: Delete a photo (admin only)
    response:
      type: message
      value: Photo deleted
*/

/* @arkzen:routes
controller: ChurchController
middleware: []
routes:
  - method: GET
    route: /api/church-community/events/{event_id}/photos
    handler: event_photos
  - method: POST
    route: /api/church-community/photos/{photo_id}/like
    handler: toggle_like
  - method: GET
    route: /api/church-community/photos/{photo_id}/comments
    handler: photo_comments
  - method: POST
    route: /api/church-community/photos/{photo_id}/comments
    handler: add_comment
  - method: GET
    route: /api/church-community/inventory
    handler: inventory_list
*/

/* @arkzen:handler:event_photos
*/
$eventId = $params[0] ?? null;

$event = \App\Models\Arkzen\ChurchCommunity\Event::findOrFail($eventId);

$photos = \App\Models\Arkzen\ChurchCommunity\Photo::where('event_id', $eventId)
    ->with('uploader')
    ->orderBy('created_at', 'desc')
    ->get();

return response()->json([
    'event'  => $event,
    'photos' => $photos,
]);
/* @arkzen:handler:event_photos:end */

/* @arkzen:handler:toggle_like
*/
$photoId = $params[0] ?? null;
$userId  = $request->user()->id ?? 1;

$photo = \App\Models\Arkzen\ChurchCommunity\Photo::findOrFail($photoId);

$existing = \App\Models\Arkzen\ChurchCommunity\PhotoLike::where('photo_id', $photoId)
    ->where('user_id', $userId)
    ->first();

if ($existing) {
    $existing->delete();
    $photo->decrement('likes_count');
    $liked = false;
} else {
    \App\Models\Arkzen\ChurchCommunity\PhotoLike::create([
        'photo_id' => $photoId,
        'user_id'  => $userId,
    ]);
    $photo->increment('likes_count');
    $liked = true;
}

return response()->json([
    'liked'       => $liked,
    'likes_count' => $photo->fresh()->likes_count,
]);
/* @arkzen:handler:toggle_like:end */

/* @arkzen:handler:photo_comments
*/
$photoId = $params[0] ?? null;

$photo    = \App\Models\Arkzen\ChurchCommunity\Photo::findOrFail($photoId);
$comments = \App\Models\Arkzen\ChurchCommunity\PhotoComment::where('photo_id', $photoId)
    ->with('user')
    ->orderBy('created_at', 'asc')
    ->get();

return response()->json(['comments' => $comments]);
/* @arkzen:handler:photo_comments:end */

/* @arkzen:handler:add_comment
*/
$photoId = $params[0] ?? null;
$userId  = $request->user()->id ?? 1;
$body    = $request->input('body');

if (!$body) {
    return response()->json(['error' => 'Comment body required'], 422);
}

$photo   = \App\Models\Arkzen\ChurchCommunity\Photo::findOrFail($photoId);
$comment = \App\Models\Arkzen\ChurchCommunity\PhotoComment::create([
    'photo_id' => $photoId,
    'user_id'  => $userId,
    'body'     => $body,
]);

return response()->json(['comment' => $comment->load('user')]);
/* @arkzen:handler:add_comment:end */

/* @arkzen:handler:inventory_list
*/
$tag     = $request->query('tag');
$eventId = $request->query('event_id');

$query = \App\Models\Arkzen\ChurchCommunity\Photo::with(['event', 'uploader'])
    ->orderBy('created_at', 'desc');

if ($eventId) {
    $query->where('event_id', $eventId);
}

if ($tag) {
    $query->whereJsonContains('tags', $tag);
}

$photos = $query->paginate(20);

$totalSize  = \App\Models\Arkzen\ChurchCommunity\Photo::sum('file_size');
$totalCount = \App\Models\Arkzen\ChurchCommunity\Photo::count();
$eventCount = \App\Models\Arkzen\ChurchCommunity\Event::count();

$allTags = \App\Models\Arkzen\ChurchCommunity\Photo::whereNotNull('tags')
    ->pluck('tags')
    ->flatten()
    ->unique()
    ->values();

return response()->json([
    'photos'      => $photos,
    'total_count' => $totalCount,
    'total_size'  => $totalSize,
    'event_count' => $eventCount,
    'all_tags'    => $allTags,
]);
/* @arkzen:handler:inventory_list:end */

/* @arkzen:layout:app */

'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, FolderImage, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

const NAV = [
  { href: '/church-community',           icon: Home,           label: 'Feed' },
  { href: '/church-community/members',   icon: Users,          label: 'Members' },
  { href: '/church-community/inventory', icon: FolderImage,    label: 'Inventory' },
  { href: '/church-community/admin',     icon: LayoutDashboard,label: 'Admin' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/church-community/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white">
      {/* Desktop header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">✝</span>
              </div>
              <h1 className="text-xl font-semibold text-amber-900 tracking-tight">Grace Community Church</h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
                return (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      active
                        ? 'bg-amber-100 text-amber-800 shadow-sm'
                        : 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-sm text-amber-600 hidden sm:inline">{user?.name ?? 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 transition"
              >
                <LogOut size={14} /> Logout
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-amber-100"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-amber-100 z-40">
        <div className="flex justify-around items-center py-2">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
            return (
              <button
                key={href}
                onClick={() => { router.push(href); setMobileMenuOpen(false) }}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-full transition ${
                  active ? 'text-amber-700' : 'text-amber-400'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  )
}

/* @arkzen:layout:app:end */

/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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

/* @arkzen:components:shared:end */

/* @arkzen:page:index */
/* @arkzen:page:layout:app */

const IndexPage = () => {
  const { events, selectedEvent, photos, loadingEvents, loadingPhotos, setEvents, setSelectedEvent, setPhotos, setLoadingEvents, setLoadingPhotos } = useFeedStore()
  const { showToast } = useToast()
  const { setPhoto, setOpen } = useLightboxStore()

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true)
      try {
        const data = await arkzenFetch('/api/church-community/events')
        const list = Array.isArray(data) ? data : data?.data ?? []
        setEvents(list)
        if (list.length > 0 && !selectedEvent) setSelectedEvent(list[0])
      } catch {
        showToast('Failed to load events', 'error')
      } finally {
        setLoadingEvents(false)
      }
    }
    loadEvents()
  }, [])

  useEffect(() => {
    if (!selectedEvent) return
    const loadPhotos = async () => {
      setLoadingPhotos(true)
      try {
        const data = await arkzenFetch(`/api/church-community/events/${selectedEvent.id}/photos`)
        setPhotos(data?.photos ?? [])
      } catch {
        showToast('Failed to load photos', 'error')
      } finally {
        setLoadingPhotos(false)
      }
    }
    loadPhotos()
  }, [selectedEvent])

  const handlePhotoClick = (photo: Photo) => {
    setPhoto(photo)
    setOpen(true)
  }

  return (
    <div className="animate-fadeIn">
      {/* Event selector (horizontal scroll on mobile) */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {loadingEvents ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonBox key={i} width={120} height={40} radius={20} />)
          ) : (
            events.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  selectedEvent?.id === ev.id
                    ? 'bg-amber-700 text-white shadow-md'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                {ev.title}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Instagram feed - 3 column grid on desktop, single column on mobile */}
      {selectedEvent ? (
        <div className="space-y-4">
          {loadingPhotos ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonBox key={i} height={400} radius={16} />)
          ) : photos.length === 0 ? (
            <div className="text-center py-16 text-amber-400">No photos yet for this event</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map(photo => (
                <PostCard key={photo.id} photo={photo} onLike={() => {}} onComment={() => handlePhotoClick(photo)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-amber-400">Select an event to see the feed</div>
      )}

      <PhotoLightbox />
    </div>
  )
}

/* @arkzen:page:index:end */

/* @arkzen:page:members */
/* @arkzen:page:layout:app */

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

/* @arkzen:page:members:end */

/* @arkzen:page:inventory */
/* @arkzen:page:layout:app */

const InventoryPage = () => {
  const { photos, totalCount, totalSize, eventCount, allTags, activeTag, loading, setData } = useInventoryStore()
  const { showToast } = useToast()
  const { setPhoto, setOpen } = useLightboxStore()

  const load = useCallback(async (tag?: string | null) => {
    setData({ loading: true })
    try {
      const params = tag ? `?tag=${encodeURIComponent(tag)}` : ''
      const data = await arkzenFetch(`/api/church-community/inventory${params}`)
      setData({
        photos: data?.photos?.data ?? [],
        totalCount: data?.total_count ?? 0,
        totalSize: data?.total_size ?? 0,
        eventCount: data?.event_count ?? 0,
        allTags: data?.all_tags ?? [],
        loading: false,
      })
    } catch {
      showToast('Failed to load inventory', 'error')
      setData({ loading: false })
    }
  }, [])

  useEffect(() => { load(null) }, [])

  const sizeMB = (totalSize / (1024 * 1024)).toFixed(1)

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl text-center border border-amber-100">
          <p className="text-2xl font-bold text-amber-800">{totalCount}</p>
          <p className="text-xs text-amber-400">Total Photos</p>
        </div>
        <div className="bg-white p-3 rounded-xl text-center border border-amber-100">
          <p className="text-2xl font-bold text-amber-800">{eventCount}</p>
          <p className="text-xs text-amber-400">Events</p>
        </div>
        <div className="bg-white p-3 rounded-xl text-center border border-amber-100">
          <p className="text-2xl font-bold text-amber-800">{sizeMB} MB</p>
          <p className="text-xs text-amber-400">Storage</p>
        </div>
        <div className="bg-white p-3 rounded-xl text-center border border-amber-100">
          <p className="text-2xl font-bold text-amber-800">{allTags.length}</p>
          <p className="text-xs text-amber-400">Tags</p>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => load(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              !activeTag ? 'bg-amber-700 text-white' : 'bg-white text-amber-700 border border-amber-200'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => load(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                activeTag === tag ? 'bg-amber-700 text-white' : 'bg-white text-amber-700 border border-amber-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonBox key={i} height={120} radius={0} />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 text-amber-400">No photos found</div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {photos.map(photo => (
            <button key={photo.id} onClick={() => { setPhoto(photo); setOpen(true) }} className="relative aspect-square bg-amber-50 overflow-hidden group">
              <img src={photo.url} alt="" className="w-full h-full object-cover transition group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
            </button>
          ))}
        </div>
      )}
      <PhotoLightbox />
    </div>
  )
}

/* @arkzen:page:inventory:end */

/* @arkzen:page:admin */
/* @arkzen:page:layout:app */

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
      showToast('Event, URL, and filename are required', 'error')
      return
    }
    setUploading(true)
    try {
      const tags = photoForm.tags ? photoForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      await arkzenFetch('/api/church-community/photos', {
        method: 'POST',
        body: { ...photoForm, event_id: Number(photoForm.event_id), tags },
      })
      showToast('Photo uploaded successfully', 'success')
      setPhotoForm({ event_id: '', url: '', caption: '', file_name: '', tags: '' })
    } catch {
      showToast('Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.event_date) {
      showToast('Title and date are required', 'error')
      return
    }
    setCreatingEvent(true)
    try {
      const ev = await arkzenFetch('/api/church-community/events', { method: 'POST', body: eventForm })
      setEvents(prev => [ev, ...prev])
      showToast('Event created', 'success')
      setEventForm({ title: '', description: '', event_date: '', is_members_only: false })
    } catch {
      showToast('Failed to create event', 'error')
    } finally {
      setCreatingEvent(false)
    }
  }

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Delete this event and all its photos?')) return
    try {
      await arkzenFetch(`/api/church-community/events/${id}`, { method: 'DELETE' })
      setEvents(prev => prev.filter(e => e.id !== id))
      showToast('Event deleted', 'success')
    } catch {
      showToast('Failed to delete event', 'error')
    }
  }

  const handleCreateMember = async () => {
    if (!memberForm.name) { showToast('Name is required', 'error'); return }
    setCreatingMember(true)
    try {
      const m = await arkzenFetch('/api/church-community/members', { method: 'POST', body: memberForm })
      setMembers(prev => [m, ...prev])
      showToast('Member added', 'success')
      setMemberForm({ name: '', role: 'member', email: '', bio: '' })
    } catch {
      showToast('Failed to add member', 'error')
    } finally {
      setCreatingMember(false)
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Remove this member?')) return
    try {
      await arkzenFetch(`/api/church-community/members/${id}`, { method: 'DELETE' })
      setMembers(prev => prev.filter(m => m.id !== id))
      showToast('Member removed', 'success')
    } catch {
      showToast('Failed to remove member', 'error')
    }
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Photo */}
        <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-2">
            <Upload size={16} className="text-amber-600" /> <span className="font-medium">Upload Photo</span>
          </div>
          <div className="p-5 space-y-3">
            <select value={photoForm.event_id} onChange={e => setPhotoForm(f => ({ ...f, event_id: e.target.value }))} className="w-full p-2 border rounded-lg">
              <option value="">Select event</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
            <input type="text" placeholder="Photo URL" value={photoForm.url} onChange={e => setPhotoForm(f => ({ ...f, url: e.target.value }))} className="w-full p-2 border rounded-lg" />
            <input type="text" placeholder="Filename" value={photoForm.file_name} onChange={e => setPhotoForm(f => ({ ...f, file_name: e.target.value }))} className="w-full p-2 border rounded-lg" />
            <input type="text" placeholder="Caption" value={photoForm.caption} onChange={e => setPhotoForm(f => ({ ...f, caption: e.target.value }))} className="w-full p-2 border rounded-lg" />
            <input type="text" placeholder="Tags (comma separated)" value={photoForm.tags} onChange={e => setPhotoForm(f => ({ ...f, tags: e.target.value }))} className="w-full p-2 border rounded-lg" />
            <button onClick={handleUpload} disabled={uploading} className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition disabled:opacity-50">
              {uploading ? <Loader2 size={16} className="animate-spin inline" /> : 'Upload'}
            </button>
          </div>
        </div>

        {/* Add Member */}
        <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-2">
            <UserPlus size={16} className="text-amber-600" /> <span className="font-medium">Add Member</span>
          </div>
          <div className="p-5 space-y-3">
            <input type="text" placeholder="Name" value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} className="w-full p-2 border rounded-lg" />
            <select value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value as Role }))} className="w-full p-2 border rounded-lg">
              {(['pastor','elder','deacon','leader','member'] as Role[]).map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
            </select>
            <input type="email" placeholder="Email" value={memberForm.email} onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))} className="w-full p-2 border rounded-lg" />
            <textarea placeholder="Bio" rows={2} value={memberForm.bio} onChange={e => setMemberForm(f => ({ ...f, bio: e.target.value }))} className="w-full p-2 border rounded-lg" />
            <button onClick={handleCreateMember} disabled={creatingMember} className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition disabled:opacity-50">
              {creatingMember ? <Loader2 size={16} className="animate-spin inline" /> : 'Add Member'}
            </button>
          </div>
        </div>
      </div>

      {/* Create Event */}
      <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
        <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-2">
          <Calendar size={16} className="text-amber-600" /> <span className="font-medium">Create Event</span>
        </div>
        <div className="p-5 space-y-3">
          <input type="text" placeholder="Title" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} className="w-full p-2 border rounded-lg" />
          <input type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} className="w-full p-2 border rounded-lg" />
          <textarea placeholder="Description" rows={2} value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} className="w-full p-2 border rounded-lg" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={eventForm.is_members_only} onChange={e => setEventForm(f => ({ ...f, is_members_only: e.target.checked }))} /> Members only</label>
          <button onClick={handleCreateEvent} disabled={creatingEvent} className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition disabled:opacity-50">
            {creatingEvent ? <Loader2 size={16} className="animate-spin inline" /> : 'Create Event'}
          </button>
        </div>
      </div>

      {/* Manage Events */}
      <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
        <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-2">
          <Calendar size={16} className="text-amber-600" /> <span className="font-medium">Manage Events ({events.length})</span>
        </div>
        <div className="divide-y">
          {events.map(ev => (
            <div key={ev.id} className="flex justify-between items-center p-3">
              <div><p className="font-medium">{ev.title}</p><p className="text-xs text-amber-400">{formatDate(ev.event_date)}</p></div>
              <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Members */}
      <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
        <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-2">
          <Users size={16} className="text-amber-600" /> <span className="font-medium">Manage Members ({members.length})</span>
        </div>
        <div className="divide-y">
          {members.map(m => (
            <div key={m.id} className="flex justify-between items-center p-3">
              <div><p className="font-medium">{m.name}</p><span className={`text-xs text-white px-2 py-0.5 rounded-full ${roleColors[m.role]}`}>{roleLabel[m.role]}</span></div>
              <button onClick={() => handleDeleteMember(m.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* @arkzen:page:admin:end */

/* @arkzen:page:login */
/* @arkzen:page:layout:guest */

const LoginPage = () => {
  const { login } = useAuthStore()
  const { showToast } = useToast()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!form.email || !form.password) { showToast('All fields required', 'error'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      router.push('/church-community')
    } catch {
      showToast('Invalid credentials', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-white">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-amber-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">✝</span>
          </div>
          <h1 className="text-2xl font-semibold text-amber-900">Grace Community Church</h1>
          <p className="text-amber-500 text-sm">Sign in to your account</p>
        </div>
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-amber-400" />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-amber-400" />
          <button onClick={handleLogin} disabled={loading} className="w-full bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 transition disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin inline" /> : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* @arkzen:page:login:end */

/* @arkzen:page:register */
/* @arkzen:page:layout:guest */

const RegisterPage = () => {
  const { register } = useAuthStore()
  const { showToast } = useToast()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { showToast('All fields required', 'error'); return }
    if (form.password !== form.password_confirmation) { showToast('Passwords do not match', 'error'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation)
      router.push('/church-community')
    } catch {
      showToast('Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-white">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-amber-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">✝</span>
          </div>
          <h1 className="text-2xl font-semibold text-amber-900">Create Account</h1>
        </div>
        <div className="space-y-3">
          <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full p-3 border rounded-lg" />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full p-3 border rounded-lg" />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full p-3 border rounded-lg" />
          <input type="password" placeholder="Confirm Password" value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} className="w-full p-3 border rounded-lg" />
          <button onClick={handleRegister} disabled={loading} className="w-full bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 transition disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin inline" /> : 'Register'}
          </button>
        </div>
        <p className="text-center text-sm text-amber-400 mt-4">Already have an account? <a href="/church-community/login" className="text-amber-700">Sign in</a></p>
      </div>
    </div>
  )
}

/* @arkzen:page:register:end */

/* @arkzen:error:404 */

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
    <div className="text-center">
      <p className="text-7xl font-light text-amber-300">404</p>
      <p className="text-amber-700 mt-2">Page not found</p>
      <a href="/church-community" className="inline-block mt-4 px-4 py-2 bg-amber-700 text-white rounded-full text-sm">Go home</a>
    </div>
  </div>
)

/* @arkzen:error:404:end */

/* @arkzen:error:500 */

'use client'

function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
      <div className="text-center">
        <p className="text-7xl font-light text-amber-300">500</p>
        <p className="text-amber-700 mt-2">Something went wrong</p>
        <button onClick={reset} className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-full text-sm">Try again</button>
      </div>
    </div>
  )
}

/* @arkzen:error:500:end */

/* @arkzen:animation */

import { gsap } from 'gsap'

const churchCommunityAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.animate-fadeIn',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

/* @arkzen:animation:end */