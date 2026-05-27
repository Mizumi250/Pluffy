// ============================================================
// ARKZEN GENERATED SCREEN — church-community/admin [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:admin instead
// Generated: 2026-05-27T12:27:33.836Z
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GuestLayout } from '@/layouts/GuestLayout'

export function AdminScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="church-community" dashboardRoute="/church-community/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default AdminScreen
