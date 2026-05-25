// ============================================================
// ARKZEN GENERATED SCREEN — church-community/inventory [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:inventory instead
// Generated: 2026-05-25T07:15:04.028Z
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

export function InventoryScreen() {
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
        const InventoryPage = () => {
  const { T, mode, toggle } = useTheme()
  const { setPhoto, setOpen } = useLightboxStore()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalSize, setTotalSize] = useState(0)
  const [eventCount, setEventCount] = useState(0)
  const [allTags, setAllTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = (tag: string | null) => {
    setLoading(true)
    setActiveTag(tag)
    const params = tag ? `?tag=${encodeURIComponent(tag)}` : ''
    fetch(`/api/church-community/inventory${params}`)
      .then(r => r.json())
      .then(d => {
        setPhotos(d?.photos?.data ?? [])
        setTotalCount(d?.total_count ?? 0)
        setTotalSize(d?.total_size ?? 0)
        setEventCount(d?.event_count ?? 0)
        setAllTags(d?.all_tags ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(null) }, [])

  const stats = [['Photos', totalCount], ['Events', eventCount], ['Storage', `${(totalSize / 1048576).toFixed(1)} MB`], ['Tags', allTags.length]]

  return (
    <>
      <style>{`@keyframes gc-shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }`}</style>
      <div style={{ minHeight: '100vh', background: T.bgGrad, transition: 'background 0.35s', paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: T.headerBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: `1px solid ${T.border}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', fontFamily: 'Georgia,serif' }}>Gallery</span>
          <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>

          {/* Tab row */}
          <div style={{ display: 'flex', borderBottom: `2px solid ${T.border}`, marginBottom: 20 }}>
            {['Photo', 'Video', 'Events', 'Tags'].map((tab, i) => (
              <button key={tab} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'none', color: i === 0 ? T.purple : T.textMuted, borderBottom: i === 0 ? `2px solid ${T.purple}` : '2px solid transparent', marginBottom: -2 }}>{tab}</button>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
            {stats.map(([l, v]) => (
              <GCard key={String(l)} T={T} style={{ padding: '14px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 800, background: T.purpleGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</p>
                <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2, fontWeight: 600 }}>{l}</p>
              </GCard>
            ))}
          </div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {['All', ...allTags].map((tag, i) => {
                const isAll = i === 0
                const active = isAll ? !activeTag : activeTag === tag
                return (
                  <button key={tag} onClick={() => load(isAll ? null : tag)} style={{ padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: active ? T.purpleGrad : T.surface, color: active ? '#fff' : T.textMuted, boxShadow: active ? T.shadowPurp : 'none', transition: 'all 0.2s' }}>
                    {isAll ? 'All' : `#${tag}`}
                  </button>
                )
              })}
            </div>
          )}

          {/* 3-col grid */}
          {loading
            ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>{Array.from({ length: 9 }).map((_, i) => <Skel key={i} h={120} r={0} T={T} />)}</div>
            : photos.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px 0', color: T.textMuted }}>No photos found</div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, borderRadius: 16, overflow: 'hidden' }}>
                  {photos.map((photo: Photo) => (
                    <div key={photo.id} onClick={() => { setPhoto(photo); setOpen(true) }} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', background: T.inputBg }}>
                      <img src={photo.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
          }
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

        <PhotoLightbox T={T} />
      </div>
    </>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default InventoryScreen
