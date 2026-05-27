// ============================================================
// ARKZEN GENERATED SCREEN — church-community/members [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:members instead
// Generated: 2026-05-27T13:42:15.276Z
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

export function MembersScreen() {
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
        const MembersPage = () => {
  const { T, mode, toggle } = useTheme()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selected, setSelected] = useState<Member | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/church-community/members')
      .then(r => r.json())
      .then(d => setMembers(Array.isArray(d) ? d : d?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter(m => {
    const matchRole = roleFilter === 'all' || m.role === roleFilter
    const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || (m.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchRole && matchSearch && m.is_active
  })

  return (
    <>
      <style>{`@keyframes gc-shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }`}</style>
      <div style={{ minHeight: '100vh', background: T.bgGrad, transition: 'background 0.35s', paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: T.headerBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: `1px solid ${T.border}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', fontFamily: 'Georgia,serif' }}>Members</span>
          <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} size={15} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search members…"
              style={{ width: '100%', padding: '11px 16px 11px 40px', borderRadius: 50, fontSize: 14, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.textPrimary, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Role pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 20 }}>
            {['all', 'pastor', 'elder', 'deacon', 'leader', 'member'].map(role => {
              const active = roleFilter === role
              return (
                <button key={role} onClick={() => setRoleFilter(role)} style={{ padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: active ? T.purpleGrad : T.surface, color: active ? '#fff' : T.textMuted, boxShadow: active ? T.shadowPurp : 'none' }}>
                  {role === 'all' ? 'All' : roleLabel[role as Role]}
                </button>
              )
            })}
          </div>

          {/* Grid */}
          {loading
            ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>{Array.from({ length: 6 }).map((_, i) => <Skel key={i} h={190} r={20} T={T} />)}</div>
            : filtered.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px 0', color: T.textMuted }}>No members found</div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
                  {filtered.map(m => (
                    <GCard key={m.id} T={T} style={{ padding: 18, textAlign: 'center' }} onClick={() => setSelected(m)}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                        <Avatar name={m.name} photoUrl={m.photo_url} size={62} ring T={T} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 5, lineHeight: 1.3 }}>{m.name}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: roleBadge[m.role].bg, color: roleBadge[m.role].text, display: 'inline-block' }}>
                        {roleLabel[m.role]}
                      </span>
                      {m.bio && <p style={{ fontSize: 11, color: T.textMuted, marginTop: 7, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.bio}</p>}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary }}>—</p>
                          <p style={{ fontSize: 9, color: T.textMuted }}>Posts</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary }}>{m.joined_at ? new Date(m.joined_at).getFullYear() : '—'}</p>
                          <p style={{ fontSize: 9, color: T.textMuted }}>Since</p>
                        </div>
                      </div>
                    </GCard>
                  ))}
                </div>
          }
        </div>

        {/* Member modal */}
        {selected && (
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: T.surfaceSolid, borderRadius: 28, padding: 32, maxWidth: 380, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Avatar name={selected.name} photoUrl={selected.photo_url} size={80} ring T={T} />
                <h3 style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, marginTop: 12, letterSpacing: '-0.02em' }}>{selected.name}</h3>
                {selected.email && <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>@{selected.email.split('@')[0]}</p>}
                <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 50, background: roleBadge[selected.role].bg, color: roleBadge[selected.role].text }}>{roleLabel[selected.role]}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
                {[['Fans', '—'], ['Following', '—'], ['Posts', '—']].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary }}>{v}</p>
                    <p style={{ fontSize: 11, color: T.textMuted }}>{l}</p>
                  </div>
                ))}
              </div>
              {selected.bio && <p style={{ fontSize: 13, color: T.textSecond, textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>{selected.bio}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: 11, borderRadius: 14, background: T.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: T.shadowPurp }}>Follow</button>
                <button style={{ flex: 1, padding: 11, borderRadius: 14, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.textSecond, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Message</button>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: 10, padding: 10, borderRadius: 14, background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 13 }}>Close</button>
            </div>
          </div>
        )}

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

export default MembersScreen
