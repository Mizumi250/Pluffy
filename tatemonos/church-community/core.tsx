/* @arkzen:meta
name: church-community
version: 2.0.0
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

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Images, LayoutDashboard, LogOut, Search, Bell } from 'lucide-react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

const NAV = [
  { href: '/church-community',           icon: Home,            label: 'Feed' },
  { href: '/church-community/members',   icon: Users,           label: 'Members' },
  { href: '/church-community/inventory', icon: Images,          label: 'Gallery' },
  { href: '/church-community/admin',     icon: LayoutDashboard, label: 'Admin' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push('/church-community/login')
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #c5d0de 0%, #d4dde8 50%, #bcc8d6 100%)' }}
    >
      {/* Desktop header */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 2px 20px rgba(100,120,160,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #7b6cf6, #a78bfa)' }}
              >
                <span className="text-white text-sm font-bold">✝</span>
              </div>
              <h1 className="text-lg font-bold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
                Grace Community
              </h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
                return (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: active ? 'linear-gradient(135deg, #7b6cf6, #a78bfa)' : 'transparent',
                      color: active ? '#fff' : '#6b7db3',
                      boxShadow: active ? '0 4px 15px rgba(123,108,246,0.35)' : 'none',
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center transition"
                style={{ background: 'rgba(255,255,255,0.8)', color: '#8b9cc8' }}
              >
                <Search size={16} />
              </button>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.8)', color: '#8b9cc8' }}
              >
                <Bell size={16} />
              </button>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7b6cf6, #6ec6f5)' }}
                onClick={handleLogout}
                title="Logout"
              >
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 -4px 20px rgba(100,120,160,0.1)',
        }}
      >
        <div className="flex justify-around items-center py-3">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex flex-col items-center gap-1 transition"
              >
                <Icon
                  size={22}
                  style={{ color: active ? '#7b6cf6' : '#b0bcd4' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? '#7b6cf6' : '#b0bcd4' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}

/* @arkzen:layout:app:end */

/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
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

/* @arkzen:components:shared:end */

/* @arkzen:page:index */
/* @arkzen:page:layout:app */

const IndexPage = () => {
  const { events, selectedEvent, photos, loadingEvents, loadingPhotos, setEvents, setSelectedEvent, setPhotos, setLoadingEvents, setLoadingPhotos } = useFeedStore()
  const { showToast } = useToast()
  const { setPhoto, setOpen } = useLightboxStore()

  useEffect(() => {
    const load = async () => {
      setLoadingEvents(true)
      try {
        const data = await arkzenFetch('/api/church-community/events')
        const list = Array.isArray(data) ? data : data?.data ?? []
        setEvents(list)
        if (list.length > 0 && !selectedEvent) setSelectedEvent(list[0])
      } catch { showToast('Failed to load events', 'error') }
      finally { setLoadingEvents(false) }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedEvent) return
    const load = async () => {
      setLoadingPhotos(true)
      try {
        const data = await arkzenFetch(`/api/church-community/events/${selectedEvent.id}/photos`)
        setPhotos(data?.photos ?? [])
      } catch { showToast('Failed to load photos', 'error') }
      finally { setLoadingPhotos(false) }
    }
    load()
  }, [selectedEvent])

  return (
    <div className="animate-fadeIn">
      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: Z.textDark, letterSpacing: '-0.03em' }}>Community Feed</h2>
        <p style={{ fontSize: 14, color: Z.textSoft, marginTop: 2 }}>Moments from our church family</p>
      </div>

      {/* Event pill selector */}
      <div style={{ overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {loadingEvents
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonBox key={i} width={110} height={36} radius={20} />)
            : events.map(ev => {
                const active = selectedEvent?.id === ev.id
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    style={{
                      padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                      background: active ? Z.purpleGrad : 'rgba(255,255,255,0.75)',
                      color: active ? '#fff' : Z.textMid,
                      border: active ? 'none' : '1.5px solid rgba(200,210,230,0.6)',
                      boxShadow: active ? Z.shadowPurp : Z.shadow,
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {ev.title}
                  </button>
                )
              })
          }
        </div>
      </div>

      {/* Photo grid */}
      {selectedEvent ? (
        loadingPhotos ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonBox key={i} height={360} radius={20} />)}
          </div>
        ) : photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: Z.textMuted }}>No photos yet for this event</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {photos.map(photo => (
              <PostCard key={photo.id} photo={photo} onLike={() => {}} onComment={() => { setPhoto(photo); setOpen(true) }} />
            ))}
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 0', color: Z.textMuted }}>Select an event to see the feed</div>
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
      } catch { showToast('Failed to load members', 'error') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = members.filter(m => {
    const matchRole = roleFilter === 'all' || m.role === roleFilter
    const matchSearch = !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchRole && matchSearch && m.is_active
  })

  const roles = ['all', 'pastor', 'elder', 'deacon', 'leader', 'member']

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: Z.textDark, letterSpacing: '-0.03em' }}>Members</h2>
        <p style={{ fontSize: 14, color: Z.textSoft, marginTop: 2 }}>Our church family directory</p>
      </div>

      {/* Search + role filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: Z.textMuted }} size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            style={{
              width: '100%', padding: '10px 16px 10px 40px', borderRadius: 16,
              border: '1.5px solid rgba(200,210,230,0.6)',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              color: Z.textDark, fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {roles.map(role => {
            const active = roleFilter === role
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                  background: active ? Z.purpleGrad : 'rgba(255,255,255,0.75)',
                  color: active ? '#fff' : Z.textMid,
                  border: active ? 'none' : '1.5px solid rgba(200,210,230,0.6)',
                  boxShadow: active ? Z.shadowPurp : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {role === 'all' ? 'All' : roleLabel[role as Role]}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonBox key={i} height={200} radius={20} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: Z.textMuted }}>No members found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {filtered.map(member => (
            <ZCard
              key={member.id}
              style={{ padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              className="hover:scale-[1.02]"
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <Avatar name={member.name} photoUrl={member.photo_url} size={64} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: Z.textDark, marginBottom: 6 }}>{member.name}</p>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                background: roleBadge[member.role].bg,
                color: roleBadge[member.role].text,
                display: 'inline-block',
              }}>
                {roleLabel[member.role]}
              </span>
              {member.bio && (
                <p style={{ fontSize: 11, color: Z.textSoft, marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {member.bio}
                </p>
              )}
            </ZCard>
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
    setData({ loading: true, activeTag: tag ?? null })
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

  const stats = [
    { label: 'Total Photos', value: totalCount },
    { label: 'Events', value: eventCount },
    { label: 'Storage', value: `${(totalSize / 1048576).toFixed(1)} MB` },
    { label: 'Tags', value: allTags.length },
  ]

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: Z.textDark, letterSpacing: '-0.03em' }}>Photo Gallery</h2>
        <p style={{ fontSize: 14, color: Z.textSoft, marginTop: 2 }}>Full image inventory</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(s => (
          <ZCard key={s.label} style={{ padding: '14px 12px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 800, background: Z.purpleGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: Z.textMuted, marginTop: 2 }}>{s.label}</p>
          </ZCard>
        ))}
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => load(null)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: !activeTag ? Z.purpleGrad : 'rgba(255,255,255,0.7)',
              color: !activeTag ? '#fff' : Z.textMid,
              border: !activeTag ? 'none' : '1.5px solid rgba(200,210,230,0.6)',
              boxShadow: !activeTag ? Z.shadowPurp : 'none',
            }}
          >All</button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => load(tag)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeTag === tag ? Z.purpleGrad : 'rgba(255,255,255,0.7)',
                color: activeTag === tag ? '#fff' : Z.textMid,
                border: activeTag === tag ? 'none' : '1.5px solid rgba(200,210,230,0.6)',
                boxShadow: activeTag === tag ? Z.shadowPurp : 'none',
              }}
            >#{tag}</button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {Array.from({ length: 9 }).map((_, i) => <SkeletonBox key={i} height={130} radius={0} />)}
        </div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: Z.textMuted }}>No photos found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, borderRadius: 20, overflow: 'hidden' }}>
          {photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => { setPhoto(photo); setOpen(true) }}
              style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', background: 'rgba(200,210,230,0.3)' }}
              className="group"
            >
              <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} loading="lazy" className="group-hover:scale-105" />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(123,108,246,0)', transition: 'background 0.3s' }} className="group-hover:bg-[rgba(123,108,246,0.2)]" />
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
    } catch { showToast('Invalid credentials', 'error') }
    finally { setLoading(false) }
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: Z.purpleGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
            boxShadow: Z.shadowPurp, fontSize: 20, color: '#fff',
          }}>✝</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: Z.textDark, letterSpacing: '-0.03em' }}>Grace Community</h1>
          <p style={{ fontSize: 13, color: Z.textSoft, marginTop: 4 }}>Sign in to your account</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1.5px solid rgba(200,210,230,0.6)', background: 'rgba(255,255,255,0.7)', color: Z.textDark, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1.5px solid rgba(200,210,230,0.6)', background: 'rgba(255,255,255,0.7)', color: Z.textDark, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleLogin} disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 14, background: Z.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: Z.shadowPurp, marginTop: 4 }}
          >
            {loading ? <Loader2 size={18} style={{ display: 'inline', animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: Z.textSoft, marginTop: 20 }}>
          Don't have an account?{' '}
          <a href="/church-community/register" style={{ color: Z.purple, fontWeight: 700, textDecoration: 'none' }}>Register</a>
        </p>
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

/* @arkzen:page:register:end */

/* @arkzen:error:404 */

const NotFoundPage = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #c5d0de 0%, #d4dde8 50%, #bcc8d6 100%)',
  }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 80, fontWeight: 800, background: Z.purpleGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</p>
      <p style={{ color: Z.textMid, marginTop: 8, fontSize: 15 }}>Page not found</p>
      <a href="/church-community" style={{
        display: 'inline-block', marginTop: 20, padding: '10px 28px', borderRadius: 20,
        background: Z.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 14,
        textDecoration: 'none', boxShadow: Z.shadowPurp,
      }}>Go home</a>
    </div>
  </div>
)

/* @arkzen:error:404:end */

/* @arkzen:error:500 */

'use client'

function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #c5d0de 0%, #d4dde8 50%, #bcc8d6 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 80, fontWeight: 800, background: Z.purpleGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>500</p>
        <p style={{ color: Z.textMid, marginTop: 8, fontSize: 15 }}>Something went wrong</p>
        <button
          onClick={reset}
          style={{
            display: 'inline-block', marginTop: 20, padding: '10px 28px', borderRadius: 20,
            background: Z.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 14,
            border: 'none', cursor: 'pointer', boxShadow: Z.shadowPurp,
          }}
        >Try again</button>
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
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
    )
    gsap.fromTo('[data-zcard]',
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06 }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

/* @arkzen:animation:end */