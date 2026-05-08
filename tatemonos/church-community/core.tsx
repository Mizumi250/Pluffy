/* @arkzen:meta
name: church-community
version: 3.0.0
label: Grace Community Church
auth: true
description: Church community platform — Instagram/Zutto style UI with full dark + light mode. Event photo feed, member directory, gallery, admin panel.
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
    ->with('uploader')->orderBy('created_at', 'desc')->get();
return response()->json(['event' => $event, 'photos' => $photos]);
/* @arkzen:handler:event_photos:end */

/* @arkzen:handler:toggle_like
*/
$photoId = $params[0] ?? null;
$userId  = $request->user()->id ?? 1;
$photo = \App\Models\Arkzen\ChurchCommunity\Photo::findOrFail($photoId);
$existing = \App\Models\Arkzen\ChurchCommunity\PhotoLike::where('photo_id', $photoId)->where('user_id', $userId)->first();
if ($existing) {
    $existing->delete(); $photo->decrement('likes_count'); $liked = false;
} else {
    \App\Models\Arkzen\ChurchCommunity\PhotoLike::create(['photo_id' => $photoId, 'user_id' => $userId]);
    $photo->increment('likes_count'); $liked = true;
}
return response()->json(['liked' => $liked, 'likes_count' => $photo->fresh()->likes_count]);
/* @arkzen:handler:toggle_like:end */

/* @arkzen:handler:photo_comments
*/
$photoId = $params[0] ?? null;
$photo    = \App\Models\Arkzen\ChurchCommunity\Photo::findOrFail($photoId);
$comments = \App\Models\Arkzen\ChurchCommunity\PhotoComment::where('photo_id', $photoId)
    ->with('user')->orderBy('created_at', 'asc')->get();
return response()->json(['comments' => $comments]);
/* @arkzen:handler:photo_comments:end */

/* @arkzen:handler:add_comment
*/
$photoId = $params[0] ?? null;
$userId  = $request->user()->id ?? 1;
$body    = $request->input('body');
if (!$body) { return response()->json(['error' => 'Comment body required'], 422); }
$photo   = \App\Models\Arkzen\ChurchCommunity\Photo::findOrFail($photoId);
$comment = \App\Models\Arkzen\ChurchCommunity\PhotoComment::create(['photo_id' => $photoId, 'user_id' => $userId, 'body' => $body]);
return response()->json(['comment' => $comment->load('user')]);
/* @arkzen:handler:add_comment:end */

/* @arkzen:handler:inventory_list
*/
$tag     = $request->query('tag');
$eventId = $request->query('event_id');
$query = \App\Models\Arkzen\ChurchCommunity\Photo::with(['event', 'uploader'])->orderBy('created_at', 'desc');
if ($eventId) { $query->where('event_id', $eventId); }
if ($tag)     { $query->whereJsonContains('tags', $tag); }
$photos     = $query->paginate(20);
$totalSize  = \App\Models\Arkzen\ChurchCommunity\Photo::sum('file_size');
$totalCount = \App\Models\Arkzen\ChurchCommunity\Photo::count();
$eventCount = \App\Models\Arkzen\ChurchCommunity\Event::count();
$allTags    = \App\Models\Arkzen\ChurchCommunity\Photo::whereNotNull('tags')->pluck('tags')->flatten()->unique()->values();
return response()->json(['photos' => $photos, 'total_count' => $totalCount, 'total_size' => $totalSize, 'event_count' => $eventCount, 'all_tags' => $allTags]);
/* @arkzen:handler:inventory_list:end */

/* @arkzen:layout:app */

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Images, LayoutDashboard, Search, Bell, Sun, Moon, Plus } from 'lucide-react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

// ─── Palettes ────────────────────────────────────────────────────────────────
export const LIGHT = {
  bgGrad: 'linear-gradient(160deg,#e8ecf5 0%,#f2f4fc 50%,#e4e8f4 100%)',
  surface: 'rgba(255,255,255,0.92)', surfaceSolid: '#ffffff',
  border: 'rgba(220,224,240,0.8)', headerBg: 'rgba(255,255,255,0.88)', navBg: 'rgba(255,255,255,0.92)',
  textPrimary: '#0f0f1a', textSecond: '#4a5068', textMuted: '#8e98b8', textFaint: '#b8c0d8',
  purple: '#6c5ce7', purpleGrad: 'linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%)',
  shadow: '0 4px 24px rgba(80,90,140,0.10)', shadowPurp: '0 6px 20px rgba(108,92,231,0.28)',
  inputBg: 'rgba(240,242,248,0.95)', inputBorder: 'rgba(200,206,230,0.7)',
  skeletonA: 'rgba(200,208,230,0.5)', skeletonB: 'rgba(220,226,244,0.8)',
  heartColor: '#e84393',
}
export const DARK = {
  bgGrad: 'linear-gradient(160deg,#0d0d14 0%,#141420 50%,#0f0f1c 100%)',
  surface: 'rgba(255,255,255,0.055)', surfaceSolid: '#16162a',
  border: 'rgba(255,255,255,0.075)', headerBg: 'rgba(13,13,20,0.92)', navBg: 'rgba(16,16,26,0.96)',
  textPrimary: '#ebebff', textSecond: '#9090b0', textMuted: '#55557a', textFaint: '#333350',
  purple: '#a29bfe', purpleGrad: 'linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%)',
  shadow: '0 4px 24px rgba(0,0,0,0.45)', shadowPurp: '0 6px 20px rgba(108,92,231,0.38)',
  inputBg: 'rgba(255,255,255,0.045)', inputBorder: 'rgba(255,255,255,0.09)',
  skeletonA: 'rgba(255,255,255,0.035)', skeletonB: 'rgba(255,255,255,0.07)',
  heartColor: '#ff6b9d',
}

type T = typeof LIGHT
type ThemeCtx = { mode: 'light' | 'dark'; toggle: () => void; T: T }
const ThemeCtx = createContext<ThemeCtx>({ mode: 'light', toggle: () => {}, T: LIGHT })
export const useTheme = () => useContext(ThemeCtx)

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
  const [mode, setMode] = useState<'light'|'dark'>('light')

  useEffect(() => {
    const s = localStorage.getItem('gc-theme') as any
    if (s) setMode(s)
  }, [])

  const toggle = () => {
    const n = mode === 'light' ? 'dark' : 'light'
    setMode(n); localStorage.setItem('gc-theme', n)
  }
  const Tok = mode === 'dark' ? DARK : LIGHT

  const handleLogout = async () => { await logout(); router.push('/church-community/login') }

  return (
    <ThemeCtx.Provider value={{ mode, toggle, T: Tok }}>
      <div style={{ minHeight: '100vh', background: Tok.bgGrad, transition: 'background 0.35s' }}>

        {/* ── Header ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: Tok.headerBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${Tok.border}`, boxShadow: Tok.shadow, transition: 'background 0.35s',
        }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: Tok.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: Tok.shadowPurp, color: '#fff', fontSize: 15, fontWeight: 800 }}>✝</div>
              <span style={{ fontSize: 17, fontWeight: 800, color: Tok.textPrimary, letterSpacing: '-0.03em', fontFamily: 'Georgia, serif' }}>
                Grace<span style={{ color: Tok.purple }}>.</span>
              </span>
            </div>

            {/* Desktop nav */}
            <nav style={{ display: 'flex', gap: 2 }} className="hidden md:flex">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
                return (
                  <button key={href} onClick={() => router.push(href)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                    borderRadius: 50, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: active ? Tok.purpleGrad : 'transparent',
                    color: active ? '#fff' : Tok.textMuted,
                    boxShadow: active ? Tok.shadowPurp : 'none', transition: 'all 0.2s',
                  }}>
                    <Icon size={14} />{label}
                  </button>
                )
              })}
            </nav>

            {/* Right icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {[{ icon: mode === 'dark' ? Sun : Moon, action: toggle }, { icon: Search, action: () => {} }, { icon: Bell, action: () => {} }].map(({ icon: Icon, action }, i) => (
                <button key={i} onClick={action} style={{
                  width: 34, height: 34, borderRadius: '50%', border: `1px solid ${Tok.border}`,
                  background: Tok.surface, color: Tok.textMuted, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                }}><Icon size={15} /></button>
              ))}
              <div onClick={handleLogout} title="Logout" style={{
                width: 34, height: 34, borderRadius: '50%', background: Tok.purpleGrad,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: Tok.shadowPurp,
              }}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
            </div>
          </div>
        </header>

        {/* ── Mobile bottom nav ── */}
        <nav className="md:hidden" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: Tok.navBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderTop: `1px solid ${Tok.border}`, transition: 'background 0.35s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '9px 0 calc(9px + env(safe-area-inset-bottom, 0px))' }}>
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
              return (
                <button key={href} onClick={() => router.push(href)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: active ? Tok.purpleGrad : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? Tok.shadowPurp : 'none', transition: 'all 0.2s' }}>
                    <Icon size={18} style={{ color: active ? '#fff' : Tok.textFaint }} strokeWidth={active ? 2.5 : 1.8} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: active ? Tok.purple : Tok.textFaint, letterSpacing: '0.04em' }}>
                    {label.toUpperCase()}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        <main style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 16px 100px' }}>
          {children}
        </main>
      </div>
    </ThemeCtx.Provider>
  )
}

/* @arkzen:layout:app:end */

/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { create } from 'zustand'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Image as ImageIcon, Plus, Trash2, Search, X, Upload,
  Calendar, Users, Loader2, LogIn, UserPlus, Send,
} from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'
export { useTheme, LIGHT, DARK } from '@/arkzen/core/layouts/custom/church-community-app'

// ─── Types ────────────────────────────────────────────────────────────────────
export type Role = 'pastor'|'elder'|'deacon'|'leader'|'member'
export interface ChurchEvent { id:number; title:string; description:string|null; event_date:string; cover_photo_url:string|null; is_members_only:boolean; created_at:string }
export interface Photo { id:number; event_id:number; uploader_id:number; url:string; thumbnail_url:string|null; caption:string|null; file_name:string; file_size:number|null; tags:string[]|null; likes_count:number; liked?:boolean; uploader?:{id:number;name:string}; event?:ChurchEvent; created_at:string }
export interface Member { id:number; name:string; role:Role; photo_url:string|null; email:string|null; bio:string|null; joined_at:string|null; is_active:boolean }
export interface Comment { id:number; photo_id:number; user_id:number; body:string; user?:{id:number;name:string}; created_at:string }

// ─── Stores ───────────────────────────────────────────────────────────────────
export const useFeedStore = create<any>((set:any) => ({ events:[], selectedEvent:null, photos:[], loadingEvents:false, loadingPhotos:false, setEvents:(e:any)=>set({events:e}), setSelectedEvent:(e:any)=>set({selectedEvent:e}), setPhotos:(p:any)=>set({photos:p}), setLoadingEvents:(v:any)=>set({loadingEvents:v}), setLoadingPhotos:(v:any)=>set({loadingPhotos:v}) }))
export const useMemberStore = create<any>((set:any) => ({ members:[], loading:false, searchQuery:'', roleFilter:'all', setMembers:(m:any)=>set({members:m}), setLoading:(v:any)=>set({loading:v}), setSearchQuery:(q:any)=>set({searchQuery:q}), setRoleFilter:(r:any)=>set({roleFilter:r}) }))
export const useInventoryStore = create<any>((set:any) => ({ photos:[], totalCount:0, totalSize:0, eventCount:0, allTags:[], activeTag:null, loading:false, setData:(d:any)=>set((s:any)=>({...s,...d})) }))
export const useLightboxStore = create<any>((set:any) => ({ photo:null, open:false, comments:[], loadingComments:false, setPhoto:(p:any)=>set({photo:p}), setOpen:(v:any)=>set({open:v}), setComments:(c:any)=>set({comments:c}), setLoadingComments:(v:any)=>set({loadingComments:v}) }))

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatDate = (d:string) => new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})
export const formatRelativeTime = (d:string) => { const m=Math.floor((Date.now()-new Date(d).getTime())/60000); if(m<1)return'just now'; if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; return`${Math.floor(h/24)}d ago` }
export const formatFileSize = (b:number|null) => { if(!b)return'—'; if(b<1048576)return`${(b/1024).toFixed(0)} KB`; return`${(b/1048576).toFixed(1)} MB` }
export const getInitials = (n:string) => n.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()
export const roleBadge: Record<Role,{bg:string;text:string}> = { pastor:{bg:'linear-gradient(135deg,#6c5ce7,#a29bfe)',text:'#fff'}, elder:{bg:'linear-gradient(135deg,#0984e3,#74b9ff)',text:'#fff'}, deacon:{bg:'linear-gradient(135deg,#a29bfe,#fd79a8)',text:'#fff'}, leader:{bg:'linear-gradient(135deg,#00b894,#55efc4)',text:'#fff'}, member:{bg:'rgba(140,150,180,0.2)',text:'#6c7a99'} }
export const roleLabel: Record<Role,string> = { pastor:'Pastor', elder:'Elder', deacon:'Deacon', leader:'Leader', member:'Member' }

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skel: React.FC<{w?:string;h?:number;r?:number;T:any}> = ({w='100%',h=80,r=12,T}) => (
  <div style={{width:w,height:h,borderRadius:r,background:`linear-gradient(90deg,${T.skeletonA} 25%,${T.skeletonB} 50%,${T.skeletonA} 75%)`,backgroundSize:'200% 100%',animation:'shimmer 1.8s infinite'}} />
)

// ─── GCard ────────────────────────────────────────────────────────────────────
export const GCard: React.FC<{children:React.ReactNode;style?:React.CSSProperties;T:any;onClick?:()=>void}> = ({children,style={},T,onClick}) => (
  <div onClick={onClick} style={{background:T.surface,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderRadius:20,border:`1px solid ${T.border}`,boxShadow:T.shadow,transition:'background 0.35s,border-color 0.35s',cursor:onClick?'pointer':undefined,...style}}>
    {children}
  </div>
)

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar: React.FC<{name:string;photoUrl?:string|null;size?:number;ring?:boolean;T:any}> = ({name,photoUrl,size=36,ring,T}) => (
  photoUrl
    ? <img src={photoUrl} alt={name} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:ring?`2.5px solid ${T.purple}`:`2px solid ${T.border}`}} />
    : <div style={{width:size,height:size,borderRadius:'50%',background:T.purpleGrad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:size*0.34,fontWeight:700,flexShrink:0,border:ring?`2.5px solid ${T.purple}`:'2px solid rgba(255,255,255,0.12)'}}>{getInitials(name)}</div>
)

// ─── Story bubble ─────────────────────────────────────────────────────────────
export const StoryBubble: React.FC<{name:string;photoUrl?:string|null;isAdd?:boolean;T:any}> = ({name,photoUrl,isAdd,T}) => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',flexShrink:0}}>
    <div style={{padding:2,borderRadius:'50%',background:isAdd?T.inputBg:T.purpleGrad,boxShadow:isAdd?'none':T.shadowPurp}}>
      {isAdd
        ? <div style={{width:52,height:52,borderRadius:'50%',background:T.purpleGrad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:T.shadowPurp}}><Plus size={22}/></div>
        : <div style={{padding:2,background:T.surfaceSolid,borderRadius:'50%'}}><Avatar name={name} photoUrl={photoUrl} size={52} T={T}/></div>
      }
    </div>
    <span style={{fontSize:10,color:T.textMuted,fontWeight:500,maxWidth:60,textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
      {isAdd?'Add new':name.split(' ')[0]}
    </span>
  </div>
)

// ─── PostCard ─────────────────────────────────────────────────────────────────
export const PostCard: React.FC<{photo:Photo;onLike:()=>void;onComment:()=>void;T:any}> = ({photo,onLike,onComment,T}) => {
  const [liked,setLiked]=useState(photo.liked??false)
  const [cnt,setCnt]=useState(photo.likes_count)
  const {showToast}=useToast()

  const handleLike=async()=>{
    const n=!liked; setLiked(n); setCnt(p=>n?p+1:p-1)
    try{ await arkzenFetch(`/api/church-community/photos/${photo.id}/like`,{method:'POST'}); onLike() }
    catch{ setLiked(!n); setCnt(p=>n?p-1:p+1); showToast('Failed to like','error') }
  }

  return (
    <GCard T={T} style={{overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <Avatar name={photo.uploader?.name??'Member'} size={36} T={T}/>
          <div>
            <p style={{fontSize:13,fontWeight:700,color:T.textPrimary,lineHeight:1.2}}>{photo.uploader?.name??'Church Member'}</p>
            <p style={{fontSize:11,color:T.textMuted}}>{formatRelativeTime(photo.created_at)}</p>
          </div>
        </div>
        <button style={{color:T.textMuted,background:'none',border:'none',cursor:'pointer'}}><MoreHorizontal size={17}/></button>
      </div>

      {/* Image */}
      <div onClick={onComment} style={{position:'relative',aspectRatio:'1',background:T.inputBg,cursor:'pointer',overflow:'hidden'}}>
        {photo.url
          ? <img src={photo.url} alt={photo.caption??''} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:T.textFaint}}><ImageIcon size={36}/></div>
        }
      </div>

      {/* Actions */}
      <div style={{padding:'10px 14px 4px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <button onClick={handleLike} style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:liked?T.heartColor:T.textMuted,transition:'transform 0.15s'}}>
            <Heart size={21} fill={liked?T.heartColor:'none'}/>
            {cnt>0&&<span style={{fontSize:12,fontWeight:700}}>{cnt.toLocaleString()}</span>}
          </button>
          <button onClick={onComment} style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:T.textMuted}}><MessageCircle size={21}/></button>
          <button style={{background:'none',border:'none',cursor:'pointer',color:T.textMuted}}><Share2 size={21}/></button>
        </div>
        <button style={{background:'none',border:'none',cursor:'pointer',color:T.textMuted}}><Bookmark size={21}/></button>
      </div>

      {/* Caption + tags */}
      <div style={{padding:'4px 14px 14px'}}>
        {photo.caption&&<p style={{fontSize:13,color:T.textSecond,lineHeight:1.5}}><span style={{fontWeight:700,color:T.textPrimary,marginRight:6}}>{photo.uploader?.name??'Member'}</span>{photo.caption}</p>}
        {photo.tags&&photo.tags.length>0&&(
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:6}}>
            {photo.tags.map((tag:string)=><span key={tag} style={{fontSize:11,fontWeight:600,padding:'2px 9px',borderRadius:20,background:T.inputBg,color:T.purple}}>#{tag}</span>)}
          </div>
        )}
      </div>
    </GCard>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
export const PhotoLightbox: React.FC<{T:any}> = ({T}) => {
  const {photo,open,comments,loadingComments,setOpen,setComments,setLoadingComments}=useLightboxStore()
  const {showToast}=useToast()
  const [commentText,setCommentText]=useState('')
  const [submitting,setSubmitting]=useState(false)
  const [localLikes,setLocalLikes]=useState(0)
  const [liked,setLiked]=useState(false)

  useEffect(()=>{
    if(!photo||!open)return
    setLocalLikes(photo.likes_count); setLiked(photo.liked??false); setLoadingComments(true)
    arkzenFetch(`/api/church-community/photos/${photo.id}/comments`).then((d:any)=>setComments(d?.comments??[])).catch(()=>{}).finally(()=>setLoadingComments(false))
  },[photo,open])

  const handleLike=async()=>{ if(!photo)return; const n=!liked; setLiked(n); setLocalLikes((p:number)=>n?p+1:p-1); try{await arkzenFetch(`/api/church-community/photos/${photo.id}/like`,{method:'POST'})}catch{setLiked(!n);setLocalLikes((p:number)=>n?p-1:p+1)} }

  const handleComment=async()=>{
    if(!photo||!commentText.trim())return; setSubmitting(true)
    try{ const res=await arkzenFetch(`/api/church-community/photos/${photo.id}/comments`,{method:'POST',body:{body:commentText}}); setComments([...comments,res.comment]); setCommentText('') }
    catch{ showToast('Failed to post comment','error') } finally{ setSubmitting(false) }
  }

  if(!open||!photo)return null

  return (
    <div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={(e:any)=>e.stopPropagation()} style={{display:'flex',maxWidth:960,width:'100%',maxHeight:'92vh',borderRadius:24,overflow:'hidden',background:T.surfaceSolid,boxShadow:'0 40px 100px rgba(0,0,0,0.5)'}}>
        {/* Photo panel */}
        <div style={{flex:'0 0 58%',background:'#000',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {photo.url?<img src={photo.url} alt="" style={{maxWidth:'100%',maxHeight:'92vh',objectFit:'contain'}}/>:<div style={{color:'rgba(255,255,255,0.1)'}}><ImageIcon size={48}/></div>}
        </div>
        {/* Info panel */}
        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
          <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <Avatar name={photo.uploader?.name??'Member'} size={34} T={T}/>
              <div><p style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>{photo.uploader?.name??'Member'}</p><p style={{fontSize:11,color:T.textMuted}}>{formatRelativeTime(photo.created_at)}</p></div>
            </div>
            <button onClick={()=>setOpen(false)} style={{color:T.textMuted,background:'none',border:'none',cursor:'pointer'}}><X size={18}/></button>
          </div>
          {photo.caption&&<div style={{padding:'10px 16px',borderBottom:`1px solid ${T.border}`}}><p style={{fontSize:13,color:T.textSecond,lineHeight:1.5}}><span style={{fontWeight:700,color:T.textPrimary,marginRight:6}}>{photo.uploader?.name??'Member'}</span>{photo.caption}</p></div>}
          <div style={{padding:'10px 16px',display:'flex',gap:16,borderBottom:`1px solid ${T.border}`}}>
            <button onClick={handleLike} style={{display:'flex',alignItems:'center',gap:5,color:liked?T.heartColor:T.textMuted,background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:700}}><Heart size={18} fill={liked?T.heartColor:'none'}/>{localLikes}</button>
            <button style={{display:'flex',alignItems:'center',gap:5,color:T.textMuted,background:'none',border:'none',cursor:'pointer',fontSize:13}}><MessageCircle size={18}/>{comments.length}</button>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'12px 16px',display:'flex',flexDirection:'column',gap:12}}>
            {loadingComments?<Skel h={50} T={T}/>:comments.map((c:Comment)=>(
              <div key={c.id}><p style={{fontSize:13,color:T.textSecond,lineHeight:1.5}}><span style={{fontWeight:700,color:T.textPrimary,marginRight:6}}>{c.user?.name??'Member'}</span>{c.body}</p><p style={{fontSize:10,color:T.textMuted,marginTop:2}}>{formatRelativeTime(c.created_at)}</p></div>
            ))}
          </div>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${T.border}`,display:'flex',gap:8,alignItems:'center'}}>
            <input value={commentText} onChange={(e:any)=>setCommentText(e.target.value)} onKeyDown={(e:any)=>e.key==='Enter'&&handleComment()} placeholder="Add a comment…"
              style={{flex:1,padding:'9px 14px',borderRadius:50,fontSize:13,outline:'none',background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textPrimary}}/>
            <button onClick={handleComment} disabled={submitting} style={{background:T.purpleGrad,color:'#fff',border:'none',borderRadius:50,padding:'9px 16px',fontSize:13,fontWeight:700,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.5:1,display:'flex',alignItems:'center',gap:4}}>
              {submitting?<Loader2 size={13} className="animate-spin"/>:<><Send size={13}/> Post</>}
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
  const {events,selectedEvent,photos,loadingEvents,loadingPhotos,setEvents,setSelectedEvent,setPhotos,setLoadingEvents,setLoadingPhotos}=useFeedStore()
  const {showToast}=useToast()
  const {setPhoto,setOpen}=useLightboxStore()
  const {T}=useTheme()

  useEffect(()=>{
    const load=async()=>{
      setLoadingEvents(true)
      try{ const data=await arkzenFetch('/api/church-community/events'); const list=Array.isArray(data)?data:data?.data??[]; setEvents(list); if(list.length>0&&!selectedEvent)setSelectedEvent(list[0]) }
      catch{ showToast('Failed to load events','error') } finally{ setLoadingEvents(false) }
    }; load()
  },[])

  useEffect(()=>{
    if(!selectedEvent)return
    const load=async()=>{
      setLoadingPhotos(true)
      try{ const data=await arkzenFetch(`/api/church-community/events/${selectedEvent.id}/photos`); setPhotos(data?.photos??[]) }
      catch{ showToast('Failed to load photos','error') } finally{ setLoadingPhotos(false) }
    }; load()
  },[selectedEvent])

  const storyNames=['Add new','Pastor James','Elder Maria','Ana','Ben','Clara']

  return (
    <div style={{maxWidth:600,margin:'0 auto'}}>
      {/* App header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
        <h1 style={{fontSize:24,fontWeight:800,color:T.textPrimary,letterSpacing:'-0.03em',fontFamily:'Georgia, serif'}}>
          Grace<span style={{color:T.purple}}>Community</span>
        </h1>
        <button style={{background:'none',border:'none',cursor:'pointer',color:T.textMuted}}><Search size={22}/></button>
      </div>

      {/* Stories */}
      <GCard T={T} style={{padding:'14px 16px',marginBottom:20}}>
        <div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:2}}>
          {storyNames.map((name,i)=><StoryBubble key={i} name={name} isAdd={i===0} T={T}/>)}
        </div>
      </GCard>

      {/* Post composer */}
      <GCard T={T} style={{padding:'14px 16px',marginBottom:20}}>
        <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}>
          <div style={{width:38,height:38,borderRadius:'50%',background:T.purpleGrad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14,fontWeight:700,flexShrink:0}}>U</div>
          <div style={{flex:1,padding:'10px 16px',borderRadius:50,fontSize:13,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textMuted,cursor:'pointer'}}>
            Share a blessing or moment…
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:16}}>
            <button style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',cursor:'pointer',color:T.textMuted,fontSize:13}}><ImageIcon size={17}/> Photo</button>
            <button style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',cursor:'pointer',color:T.textMuted,fontSize:13}}><Calendar size={17}/> Event</button>
          </div>
          <button style={{background:T.purpleGrad,color:'#fff',border:'none',borderRadius:50,padding:'8px 20px',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:T.shadowPurp}}>Share</button>
        </div>
      </GCard>

      {/* Event filter pills */}
      <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:6,marginBottom:16}}>
        {loadingEvents
          ? Array.from({length:3}).map((_,i)=><Skel key={i} w="110px" h={34} r={50} T={T}/>)
          : events.map((ev:ChurchEvent)=>{
              const active=selectedEvent?.id===ev.id
              return (
                <button key={ev.id} onClick={()=>setSelectedEvent(ev)} style={{padding:'7px 18px',borderRadius:50,fontSize:12,fontWeight:700,whiteSpace:'nowrap',border:'none',cursor:'pointer',transition:'all 0.2s',background:active?T.purpleGrad:T.surface,color:active?'#fff':T.textMuted,boxShadow:active?T.shadowPurp:T.shadow}}>
                  {ev.title}
                </button>
              )
            })
        }
      </div>

      {/* Feed */}
      {selectedEvent ? (
        loadingPhotos
          ? <div style={{display:'flex',flexDirection:'column',gap:20}}>{Array.from({length:2}).map((_,i)=><Skel key={i} h={420} r={20} T={T}/>)}</div>
          : photos.length===0
            ? <div style={{textAlign:'center',padding:'64px 0',color:T.textMuted}}>No photos yet for this event</div>
            : <div style={{display:'flex',flexDirection:'column',gap:16}}>{photos.map((photo:Photo)=><PostCard key={photo.id} photo={photo} T={T} onLike={()=>{}} onComment={()=>{setPhoto(photo);setOpen(true)}}/>)}</div>
      ) : (
        <div style={{textAlign:'center',padding:'64px 0',color:T.textMuted}}>Select an event to see the feed</div>
      )}
      <PhotoLightbox T={T}/>
    </div>
  )
}

/* @arkzen:page:index:end */

/* @arkzen:page:members */
/* @arkzen:page:layout:app */

const MembersPage = () => {
  const {members,loading,searchQuery,roleFilter,setMembers,setLoading,setSearchQuery,setRoleFilter}=useMemberStore()
  const {showToast}=useToast()
  const {T}=useTheme()
  const [selected,setSelected]=useState<Member|null>(null)

  useEffect(()=>{
    const load=async()=>{
      setLoading(true)
      try{ const data=await arkzenFetch('/api/church-community/members'); setMembers(Array.isArray(data)?data:data?.data??[]) }
      catch{ showToast('Failed to load members','error') } finally{ setLoading(false) }
    }; load()
  },[])

  const filtered=members.filter((m:Member)=>{
    const matchRole=roleFilter==='all'||m.role===roleFilter
    const matchSearch=!searchQuery||m.name.toLowerCase().includes(searchQuery.toLowerCase())||(m.email??'').toLowerCase().includes(searchQuery.toLowerCase())
    return matchRole&&matchSearch&&m.is_active
  })

  return (
    <div>
      {/* Search */}
      <div style={{marginBottom:16,position:'relative'}}>
        <Search style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:T.textMuted}} size={15}/>
        <input type="text" value={searchQuery} onChange={(e:any)=>setSearchQuery(e.target.value)} placeholder="Search members…"
          style={{width:'100%',padding:'11px 16px 11px 40px',borderRadius:50,fontSize:14,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textPrimary,outline:'none',boxSizing:'border-box'}}/>
      </div>

      {/* Role pills */}
      <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:6,marginBottom:20}}>
        {['all','pastor','elder','deacon','leader','member'].map((role:string)=>{
          const active=roleFilter===role
          return <button key={role} onClick={()=>setRoleFilter(role)} style={{padding:'6px 16px',borderRadius:50,fontSize:12,fontWeight:700,whiteSpace:'nowrap',border:'none',cursor:'pointer',transition:'all 0.2s',background:active?T.purpleGrad:T.surface,color:active?'#fff':T.textMuted,boxShadow:active?T.shadowPurp:'none'}}>{role==='all'?'All':roleLabel[role as Role]}</button>
        })}
      </div>

      {/* Grid */}
      {loading
        ? <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12}}>{Array.from({length:6}).map((_,i)=><Skel key={i} h={190} r={20} T={T}/>)}</div>
        : filtered.length===0
          ? <div style={{textAlign:'center',padding:'48px 0',color:T.textMuted}}>No members found</div>
          : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12}}>
              {filtered.map((m:Member)=>(
                <GCard key={m.id} T={T} style={{padding:18,textAlign:'center',transition:'transform 0.2s'}} onClick={()=>setSelected(m)}>
                  <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><Avatar name={m.name} photoUrl={m.photo_url} size={62} ring T={T}/></div>
                  <p style={{fontSize:13,fontWeight:700,color:T.textPrimary,marginBottom:5,lineHeight:1.3}}>{m.name}</p>
                  <span style={{fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:50,background:roleBadge[m.role].bg,color:roleBadge[m.role].text,display:'inline-block'}}>{roleLabel[m.role]}</span>
                  {m.bio&&<p style={{fontSize:11,color:T.textMuted,marginTop:7,lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{m.bio}</p>}
                  <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
                    <div style={{textAlign:'center'}}><p style={{fontSize:13,fontWeight:800,color:T.textPrimary}}>—</p><p style={{fontSize:9,color:T.textMuted}}>Posts</p></div>
                    <div style={{textAlign:'center'}}><p style={{fontSize:13,fontWeight:800,color:T.textPrimary}}>{m.joined_at?new Date(m.joined_at).getFullYear():'—'}</p><p style={{fontSize:9,color:T.textMuted}}>Since</p></div>
                  </div>
                </GCard>
              ))}
            </div>
      }

      {/* Member modal — Anne Adams profile style */}
      {selected&&(
        <div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.72)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={(e:any)=>e.stopPropagation()} style={{background:T.surfaceSolid,borderRadius:28,padding:32,maxWidth:380,width:'100%',boxShadow:'0 40px 80px rgba(0,0,0,0.4)'}}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <Avatar name={selected.name} photoUrl={selected.photo_url} size={80} ring T={T}/>
              <h3 style={{fontSize:20,fontWeight:800,color:T.textPrimary,marginTop:12,letterSpacing:'-0.02em'}}>{selected.name}</h3>
              {selected.email&&<p style={{fontSize:12,color:T.textMuted,marginTop:2}}>@{selected.email.split('@')[0]}</p>}
              <span style={{display:'inline-block',marginTop:8,fontSize:11,fontWeight:700,padding:'4px 14px',borderRadius:50,background:roleBadge[selected.role].bg,color:roleBadge[selected.role].text}}>{roleLabel[selected.role]}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-around',marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${T.border}`}}>
              {[['Fans','—'],['Following','—'],['Posts','—']].map(([l,v])=>(
                <div key={l} style={{textAlign:'center'}}><p style={{fontSize:18,fontWeight:800,color:T.textPrimary}}>{v}</p><p style={{fontSize:11,color:T.textMuted}}>{l}</p></div>
              ))}
            </div>
            {selected.bio&&<p style={{fontSize:13,color:T.textSecond,textAlign:'center',lineHeight:1.6,marginBottom:20}}>{selected.bio}</p>}
            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:'11px',borderRadius:14,background:T.purpleGrad,color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',boxShadow:T.shadowPurp}}>Follow</button>
              <button style={{flex:1,padding:'11px',borderRadius:14,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textSecond,fontWeight:700,fontSize:14,cursor:'pointer'}}>Message</button>
            </div>
            <button onClick={()=>setSelected(null)} style={{width:'100%',marginTop:10,padding:'10px',borderRadius:14,background:'none',border:'none',color:T.textMuted,cursor:'pointer',fontSize:13}}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* @arkzen:page:members:end */

/* @arkzen:page:inventory */
/* @arkzen:page:layout:app */

const InventoryPage = () => {
  const {photos,totalCount,totalSize,eventCount,allTags,activeTag,loading,setData}=useInventoryStore()
  const {showToast}=useToast()
  const {setPhoto,setOpen}=useLightboxStore()
  const {T}=useTheme()

  const load=useCallback(async(tag?:string|null)=>{
    setData({loading:true,activeTag:tag??null})
    try{
      const params=tag?`?tag=${encodeURIComponent(tag)}`:''
      const data=await arkzenFetch(`/api/church-community/inventory${params}`)
      setData({photos:data?.photos?.data??[],totalCount:data?.total_count??0,totalSize:data?.total_size??0,eventCount:data?.event_count??0,allTags:data?.all_tags??[],loading:false})
    }catch{ showToast('Failed to load gallery','error'); setData({loading:false}) }
  },[])

  useEffect(()=>{load(null)},[])

  const stats=[['Photos',totalCount],['Events',eventCount],['Storage',`${(totalSize/1048576).toFixed(1)} MB`],['Tags',allTags.length]]

  return (
    <div>
      {/* Tab row — Anne Adams style */}
      <div style={{display:'flex',borderBottom:`2px solid ${T.border}`,marginBottom:20}}>
        {['Photo','Video','Events','Tags'].map((tab,i)=>(
          <button key={tab} style={{padding:'10px 20px',fontSize:13,fontWeight:700,border:'none',cursor:'pointer',background:'none',color:i===0?T.purple:T.textMuted,borderBottom:i===0?`2px solid ${T.purple}`:'2px solid transparent',marginBottom:-2,transition:'color 0.2s'}}>{tab}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {stats.map(([l,v])=>(
          <GCard key={String(l)} T={T} style={{padding:'14px 10px',textAlign:'center'}}>
            <p style={{fontSize:20,fontWeight:800,background:T.purpleGrad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{v}</p>
            <p style={{fontSize:10,color:T.textMuted,marginTop:2,fontWeight:600}}>{l}</p>
          </GCard>
        ))}
      </div>

      {/* Tag filters */}
      {allTags.length>0&&(
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:18}}>
          {['All',...allTags].map((tag:string,i:number)=>{
            const isAll=i===0; const active=isAll?!activeTag:activeTag===tag
            return <button key={tag} onClick={()=>load(isAll?null:tag)} style={{padding:'5px 14px',borderRadius:50,fontSize:12,fontWeight:700,border:'none',cursor:'pointer',background:active?T.purpleGrad:T.surface,color:active?'#fff':T.textMuted,boxShadow:active?T.shadowPurp:'none',transition:'all 0.2s'}}>{isAll?'All':`#${tag}`}</button>
          })}
        </div>
      )}

      {/* 3-col Instagram grid */}
      {loading
        ? <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>{Array.from({length:9}).map((_,i)=><Skel key={i} h={120} r={0} T={T}/>)}</div>
        : photos.length===0
          ? <div style={{textAlign:'center',padding:'48px 0',color:T.textMuted}}>No photos found</div>
          : <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,borderRadius:16,overflow:'hidden'}}>
              {photos.map((photo:Photo)=>(
                <div key={photo.id} onClick={()=>{setPhoto(photo);setOpen(true)}} style={{position:'relative',aspectRatio:'1',overflow:'hidden',cursor:'pointer',background:T.inputBg}}>
                  <img src={photo.url} alt="" loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s'}}
                    onMouseEnter={(e:any)=>e.currentTarget.style.transform='scale(1.06)'}
                    onMouseLeave={(e:any)=>e.currentTarget.style.transform='scale(1)'}/>
                  <div style={{position:'absolute',inset:0,background:'rgba(108,92,231,0)',display:'flex',alignItems:'center',justifyContent:'center',gap:16,transition:'background 0.2s'}}
                    onMouseEnter={(e:any)=>e.currentTarget.style.background='rgba(108,92,231,0.35)'}
                    onMouseLeave={(e:any)=>e.currentTarget.style.background='rgba(108,92,231,0)'}>
                    <span style={{color:'#fff',display:'flex',alignItems:'center',gap:4,fontWeight:700,fontSize:13}}><Heart size={16} fill="#fff"/>{photo.likes_count}</span>
                  </div>
                </div>
              ))}
            </div>
      }
      <PhotoLightbox T={T}/>
    </div>
  )
}

/* @arkzen:page:inventory:end */

/* @arkzen:page:admin */
/* @arkzen:page:layout:app */

const AdminPage = () => {
  const {showToast}=useToast()
  const {T}=useTheme()
  const [events,setEvents]=useState<ChurchEvent[]>([])
  const [members,setMembers]=useState<Member[]>([])
  const [tab,setTab]=useState<'events'|'members'|'upload'>('events')
  const [photoForm,setPhotoForm]=useState({event_id:'',url:'',caption:'',file_name:'',tags:''})
  const [uploading,setUploading]=useState(false)
  const [eventForm,setEventForm]=useState({title:'',description:'',event_date:'',is_members_only:false})
  const [creatingEvent,setCreatingEvent]=useState(false)
  const [memberForm,setMemberForm]=useState({name:'',role:'member' as Role,email:'',bio:''})
  const [creatingMember,setCreatingMember]=useState(false)

  useEffect(()=>{
    arkzenFetch('/api/church-community/events').then((d:any)=>setEvents(Array.isArray(d)?d:d?.data??[])).catch(()=>{})
    arkzenFetch('/api/church-community/members').then((d:any)=>setMembers(Array.isArray(d)?d:d?.data??[])).catch(()=>{})
  },[])

  const handleUpload=async()=>{
    if(!photoForm.event_id||!photoForm.url||!photoForm.file_name){showToast('Event, URL, and filename required','error');return}
    setUploading(true)
    try{ const tags=photoForm.tags?photoForm.tags.split(',').map((t:string)=>t.trim()).filter(Boolean):[]; await arkzenFetch('/api/church-community/photos',{method:'POST',body:{...photoForm,event_id:Number(photoForm.event_id),tags}}); showToast('Photo uploaded','success'); setPhotoForm({event_id:'',url:'',caption:'',file_name:'',tags:''}) }
    catch{ showToast('Upload failed','error') } finally{ setUploading(false) }
  }
  const handleCreateEvent=async()=>{
    if(!eventForm.title||!eventForm.event_date){showToast('Title and date required','error');return}
    setCreatingEvent(true)
    try{ const ev=await arkzenFetch('/api/church-community/events',{method:'POST',body:eventForm}); setEvents((p:any)=>[ev,...p]); showToast('Event created','success'); setEventForm({title:'',description:'',event_date:'',is_members_only:false}) }
    catch{ showToast('Failed','error') } finally{ setCreatingEvent(false) }
  }
  const handleDeleteEvent=async(id:number)=>{
    if(!confirm('Delete event and all its photos?'))return
    try{ await arkzenFetch(`/api/church-community/events/${id}`,{method:'DELETE'}); setEvents((p:any)=>p.filter((e:any)=>e.id!==id)); showToast('Deleted','success') }
    catch{ showToast('Failed','error') }
  }
  const handleCreateMember=async()=>{
    if(!memberForm.name){showToast('Name required','error');return}
    setCreatingMember(true)
    try{ const m=await arkzenFetch('/api/church-community/members',{method:'POST',body:memberForm}); setMembers((p:any)=>[m,...p]); showToast('Member added','success'); setMemberForm({name:'',role:'member',email:'',bio:''}) }
    catch{ showToast('Failed','error') } finally{ setCreatingMember(false) }
  }
  const handleDeleteMember=async(id:number)=>{
    if(!confirm('Remove this member?'))return
    try{ await arkzenFetch(`/api/church-community/members/${id}`,{method:'DELETE'}); setMembers((p:any)=>p.filter((m:any)=>m.id!==id)); showToast('Removed','success') }
    catch{ showToast('Failed','error') }
  }

  const inp:React.CSSProperties={width:'100%',padding:'11px 14px',borderRadius:14,fontSize:13,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textPrimary,outline:'none',boxSizing:'border-box',transition:'background 0.35s'}

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{fontSize:24,fontWeight:800,color:T.textPrimary,letterSpacing:'-0.03em',fontFamily:'Georgia, serif'}}>Admin<span style={{color:T.purple}}>.</span></h2>
        <p style={{fontSize:13,color:T.textMuted,marginTop:2}}>Manage your church community</p>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:`2px solid ${T.border}`,marginBottom:24}}>
        {([['events','Events'],['members','Members'],['upload','Upload']] as const).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'10px 22px',fontSize:13,fontWeight:700,border:'none',cursor:'pointer',background:'none',color:tab===k?T.purple:T.textMuted,borderBottom:tab===k?`2px solid ${T.purple}`:'2px solid transparent',marginBottom:-2,transition:'color 0.2s'}}>{l}</button>
        ))}
      </div>

      {/* Events tab */}
      {tab==='events'&&(
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <GCard T={T} style={{padding:20}}>
            <p style={{fontSize:14,fontWeight:700,color:T.textPrimary,marginBottom:14}}>Create New Event</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
              <input placeholder="Event Title" value={eventForm.title} onChange={(e:any)=>setEventForm((f:any)=>({...f,title:e.target.value}))} style={inp}/>
              <input type="date" value={eventForm.event_date} onChange={(e:any)=>setEventForm((f:any)=>({...f,event_date:e.target.value}))} style={inp}/>
              <input placeholder="Description" value={eventForm.description} onChange={(e:any)=>setEventForm((f:any)=>({...f,description:e.target.value}))} style={inp}/>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" id="mo" checked={eventForm.is_members_only} onChange={(e:any)=>setEventForm((f:any)=>({...f,is_members_only:e.target.checked}))} style={{accentColor:T.purple,width:16,height:16}}/>
                <label htmlFor="mo" style={{fontSize:13,color:T.textSecond,cursor:'pointer'}}>Members only</label>
              </div>
            </div>
            <div style={{marginTop:14}}>
              <button onClick={handleCreateEvent} disabled={creatingEvent} style={{display:'flex',alignItems:'center',gap:6,padding:'10px 22px',borderRadius:50,background:T.purpleGrad,color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:creatingEvent?'not-allowed':'pointer',opacity:creatingEvent?0.6:1,boxShadow:T.shadowPurp}}>
                {creatingEvent?<Loader2 size={14} className="animate-spin"/>:<><Plus size={14}/> Create Event</>}
              </button>
            </div>
          </GCard>
          <GCard T={T} style={{overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:`1px solid ${T.border}`}}><p style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>Events ({events.length})</p></div>
            <div>{events.map((ev:ChurchEvent,i:number)=>(
              <div key={ev.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 18px',borderBottom:i<events.length-1?`1px solid ${T.border}`:'none'}}>
                <div><p style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>{ev.title}</p><p style={{fontSize:11,color:T.textMuted}}>{formatDate(ev.event_date)}</p></div>
                <button onClick={()=>handleDeleteEvent(ev.id)} style={{color:'#ef4444',background:'none',border:'none',cursor:'pointer',padding:6}}><Trash2 size={15}/></button>
              </div>
            ))}</div>
          </GCard>
        </div>
      )}

      {/* Members tab */}
      {tab==='members'&&(
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <GCard T={T} style={{padding:20}}>
            <p style={{fontSize:14,fontWeight:700,color:T.textPrimary,marginBottom:14}}>Add New Member</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <input placeholder="Full Name" value={memberForm.name} onChange={(e:any)=>setMemberForm((f:any)=>({...f,name:e.target.value}))} style={inp}/>
              <select value={memberForm.role} onChange={(e:any)=>setMemberForm((f:any)=>({...f,role:e.target.value}))} style={inp}>
                {(['pastor','elder','deacon','leader','member'] as Role[]).map((r:Role)=><option key={r} value={r}>{roleLabel[r]}</option>)}
              </select>
              <input type="email" placeholder="Email" value={memberForm.email} onChange={(e:any)=>setMemberForm((f:any)=>({...f,email:e.target.value}))} style={inp}/>
              <textarea placeholder="Bio" rows={3} value={memberForm.bio} onChange={(e:any)=>setMemberForm((f:any)=>({...f,bio:e.target.value}))} style={{...inp,resize:'vertical'}}/>
              <button onClick={handleCreateMember} disabled={creatingMember} style={{display:'flex',alignItems:'center',gap:6,padding:'10px 22px',borderRadius:50,background:T.purpleGrad,color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:creatingMember?'not-allowed':'pointer',opacity:creatingMember?0.6:1,boxShadow:T.shadowPurp}}>
                {creatingMember?<Loader2 size={14} className="animate-spin"/>:<><UserPlus size={14}/> Add Member</>}
              </button>
            </div>
          </GCard>
          <GCard T={T} style={{overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:`1px solid ${T.border}`}}><p style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>Members ({members.length})</p></div>
            <div>{members.map((m:Member,i:number)=>(
              <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 18px',borderBottom:i<members.length-1?`1px solid ${T.border}`:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <Avatar name={m.name} size={32} T={T}/>
                  <div><p style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>{m.name}</p><span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:50,background:roleBadge[m.role].bg,color:roleBadge[m.role].text}}>{roleLabel[m.role]}</span></div>
                </div>
                <button onClick={()=>handleDeleteMember(m.id)} style={{color:'#ef4444',background:'none',border:'none',cursor:'pointer',padding:6}}><Trash2 size={15}/></button>
              </div>
            ))}</div>
          </GCard>
        </div>
      )}

      {/* Upload tab */}
      {tab==='upload'&&(
        <GCard T={T} style={{padding:24}}>
          <p style={{fontSize:14,fontWeight:700,color:T.textPrimary,marginBottom:16}}>Upload Photo</p>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <select value={photoForm.event_id} onChange={(e:any)=>setPhotoForm((f:any)=>({...f,event_id:e.target.value}))} style={inp}>
              <option value="">Select event</option>
              {events.map((ev:ChurchEvent)=><option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
            <input placeholder="Photo URL" value={photoForm.url} onChange={(e:any)=>setPhotoForm((f:any)=>({...f,url:e.target.value}))} style={inp}/>
            <input placeholder="Filename (e.g. worship.jpg)" value={photoForm.file_name} onChange={(e:any)=>setPhotoForm((f:any)=>({...f,file_name:e.target.value}))} style={inp}/>
            <input placeholder="Caption" value={photoForm.caption} onChange={(e:any)=>setPhotoForm((f:any)=>({...f,caption:e.target.value}))} style={inp}/>
            <input placeholder="Tags (comma separated)" value={photoForm.tags} onChange={(e:any)=>setPhotoForm((f:any)=>({...f,tags:e.target.value}))} style={inp}/>
            <button onClick={handleUpload} disabled={uploading} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'12px',borderRadius:50,background:T.purpleGrad,color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:uploading?'not-allowed':'pointer',opacity:uploading?0.6:1,boxShadow:T.shadowPurp}}>
              {uploading?<Loader2 size={15} className="animate-spin"/>:<><Upload size={15}/> Upload Photo</>}
            </button>
          </div>
        </GCard>
      )}
    </div>
  )
}

/* @arkzen:page:admin:end */

/* @arkzen:page:login */
/* @arkzen:page:layout:guest */

const LoginPage = () => {
  const {login}=useAuthStore()
  const {showToast}=useToast()
  const router=useRouter()
  const [form,setForm]=useState({email:'',password:''})
  const [loading,setLoading]=useState(false)
  const [mode,setMode]=useState<'light'|'dark'>('light')

  useEffect(()=>{ const s=localStorage.getItem('gc-theme') as any; if(s)setMode(s) },[])
  const T=mode==='dark'?DARK:LIGHT

  const handleLogin=async()=>{
    if(!form.email||!form.password){showToast('All fields required','error');return}
    setLoading(true)
    try{await login(form.email,form.password);router.push('/church-community')}
    catch{showToast('Invalid credentials','error')}finally{setLoading(false)}
  }

  const inp:React.CSSProperties={width:'100%',padding:'13px 16px',borderRadius:14,fontSize:14,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textPrimary,outline:'none',boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:T.bgGrad,transition:'background 0.35s'}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:T.purpleGrad,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:T.shadowPurp,fontSize:22,color:'#fff'}}>✝</div>
          <h1 style={{fontSize:26,fontWeight:800,color:T.textPrimary,letterSpacing:'-0.04em',fontFamily:'Georgia, serif'}}>Grace<span style={{color:T.purple}}>Community</span></h1>
          <p style={{fontSize:13,color:T.textMuted,marginTop:4}}>Sign in to your account</p>
        </div>
        <div style={{background:T.surface,backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderRadius:24,border:`1px solid ${T.border}`,padding:'28px 24px',boxShadow:T.shadow}}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <input type="email" placeholder="Email address" value={form.email} onChange={(e:any)=>setForm((f:any)=>({...f,email:e.target.value}))} style={inp}/>
            <input type="password" placeholder="Password" value={form.password} onChange={(e:any)=>setForm((f:any)=>({...f,password:e.target.value}))} onKeyDown={(e:any)=>e.key==='Enter'&&handleLogin()} style={inp}/>
            <button onClick={handleLogin} disabled={loading} style={{width:'100%',padding:'13px',borderRadius:50,background:T.purpleGrad,color:'#fff',fontWeight:800,fontSize:15,border:'none',cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1,boxShadow:T.shadowPurp,marginTop:4,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading?<><Loader2 size={16} className="animate-spin"/> Signing in…</>:<><LogIn size={16}/> Sign In</>}
            </button>
          </div>
          <p style={{textAlign:'center',fontSize:13,color:T.textMuted,marginTop:18}}>Don't have an account?{' '}<a href="/church-community/register" style={{color:T.purple,fontWeight:700,textDecoration:'none'}}>Register</a></p>
        </div>
      </div>
    </div>
  )
}

/* @arkzen:page:login:end */

/* @arkzen:page:register */
/* @arkzen:page:layout:guest */

const RegisterPage = () => {
  const {register}=useAuthStore()
  const {showToast}=useToast()
  const router=useRouter()
  const [form,setForm]=useState({name:'',email:'',password:'',password_confirmation:''})
  const [loading,setLoading]=useState(false)
  const [mode,setMode]=useState<'light'|'dark'>('light')

  useEffect(()=>{ const s=localStorage.getItem('gc-theme') as any; if(s)setMode(s) },[])
  const T=mode==='dark'?DARK:LIGHT

  const handleRegister=async()=>{
    if(!form.name||!form.email||!form.password){showToast('All fields required','error');return}
    if(form.password!==form.password_confirmation){showToast('Passwords do not match','error');return}
    setLoading(true)
    try{await register(form.name,form.email,form.password,form.password_confirmation);router.push('/church-community')}
    catch{showToast('Registration failed','error')}finally{setLoading(false)}
  }

  const inp:React.CSSProperties={width:'100%',padding:'13px 16px',borderRadius:14,fontSize:14,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textPrimary,outline:'none',boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:T.bgGrad}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:T.purpleGrad,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:T.shadowPurp,fontSize:22,color:'#fff'}}>✝</div>
          <h1 style={{fontSize:26,fontWeight:800,color:T.textPrimary,letterSpacing:'-0.04em',fontFamily:'Georgia, serif'}}>Join<span style={{color:T.purple}}>Grace</span></h1>
          <p style={{fontSize:13,color:T.textMuted,marginTop:4}}>Create your church account</p>
        </div>
        <div style={{background:T.surface,backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderRadius:24,border:`1px solid ${T.border}`,padding:'28px 24px',boxShadow:T.shadow}}>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <input type="text" placeholder="Full Name" value={form.name} onChange={(e:any)=>setForm((f:any)=>({...f,name:e.target.value}))} style={inp}/>
            <input type="email" placeholder="Email address" value={form.email} onChange={(e:any)=>setForm((f:any)=>({...f,email:e.target.value}))} style={inp}/>
            <input type="password" placeholder="Password" value={form.password} onChange={(e:any)=>setForm((f:any)=>({...f,password:e.target.value}))} style={inp}/>
            <input type="password" placeholder="Confirm Password" value={form.password_confirmation} onChange={(e:any)=>setForm((f:any)=>({...f,password_confirmation:e.target.value}))} style={inp}/>
            <button onClick={handleRegister} disabled={loading} style={{width:'100%',padding:'13px',borderRadius:50,background:T.purpleGrad,color:'#fff',fontWeight:800,fontSize:15,border:'none',cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1,boxShadow:T.shadowPurp,marginTop:4,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading?<><Loader2 size={16} className="animate-spin"/> Creating…</>:<><UserPlus size={16}/> Create Account</>}
            </button>
          </div>
          <p style={{textAlign:'center',fontSize:13,color:T.textMuted,marginTop:18}}>Already a member?{' '}<a href="/church-community/login" style={{color:T.purple,fontWeight:700,textDecoration:'none'}}>Sign in</a></p>
        </div>
      </div>
    </div>
  )
}

/* @arkzen:page:register:end */

/* @arkzen:error:404 */

const NotFoundPage = () => (
  <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#e8ecf5,#f2f4fc)'}}>
    <div style={{textAlign:'center'}}>
      <p style={{fontSize:80,fontWeight:800,background:'linear-gradient(135deg,#6c5ce7,#a29bfe)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1}}>404</p>
      <p style={{color:'#8e98b8',marginTop:8,fontSize:15}}>Page not found</p>
      <a href="/church-community" style={{display:'inline-flex',alignItems:'center',marginTop:20,padding:'11px 28px',borderRadius:50,background:'linear-gradient(135deg,#6c5ce7,#a29bfe)',color:'#fff',fontWeight:700,fontSize:14,textDecoration:'none',boxShadow:'0 6px 20px rgba(108,92,231,0.28)'}}>Go home</a>
    </div>
  </div>
)

/* @arkzen:error:404:end */

/* @arkzen:error:500 */

'use client'

function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#0d0d14,#141420)'}}>
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:80,fontWeight:800,background:'linear-gradient(135deg,#6c5ce7,#a29bfe)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1}}>500</p>
        <p style={{color:'#9090b0',marginTop:8,fontSize:15}}>Something went wrong</p>
        <button onClick={reset} style={{display:'inline-flex',alignItems:'center',marginTop:20,padding:'11px 28px',borderRadius:50,background:'linear-gradient(135deg,#6c5ce7,#a29bfe)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>Try again</button>
      </div>
    </div>
  )
}

/* @arkzen:error:500:end */

/* @arkzen:animation */

import { gsap } from 'gsap'

const churchCommunityAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('[data-page]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' })
    gsap.fromTo('[data-card]', { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06 })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

/* @arkzen:animation:end */