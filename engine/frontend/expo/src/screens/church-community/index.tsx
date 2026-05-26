// ============================================================
// ARKZEN GENERATED SCREEN — church-community/index [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:index instead
// Generated: 2026-05-26T09:29:47.925Z
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

export function IndexScreen() {
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
        const IndexPage = () => {
  const { T, mode, toggle } = useTheme()
  const { setPhoto, setOpen } = useLightboxStore()
  const pageRef = useRef<HTMLDivElement>(null)

  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  useEffect(() => {
    setLoadingEvents(true)
    fetch('/api/church-community/events')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d?.data ?? []
        setEvents(list)
        if (list.length > 0) setSelectedEvent(list[0])
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (!selectedEvent) return
    setLoadingPhotos(true)
    fetch(`/api/church-community/events/${selectedEvent.id}/photos`)
      .then(r => r.json())
      .then(d => setPhotos(d?.photos ?? []))
      .catch(() => {})
      .finally(() => setLoadingPhotos(false))
  }, [selectedEvent])

  const storyNames = ['Add new', 'Pastor James', 'Elder Maria', 'Ana', 'Ben', 'Clara']

  return (
    <>
      <style>{`
        @keyframes gc-shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div ref={pageRef} style={{ minHeight: '100vh', background: T.bgGrad, transition: 'background 0.35s', paddingBottom: 80 }}>

        {/* Header */}
        <div className="gc-header" style={{ position: 'sticky', top: 0, zIndex: 30, background: T.headerBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: `1px solid ${T.border}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, boxShadow: T.shadowPurp }}>✝</div>
            <span style={{ fontSize: 17, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.03em', fontFamily: 'Georgia,serif' }}>
              Grace<span style={{ color: T.purple }}>.</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={15} />
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px' }}>

          {/* Stories */}
          <div className="gc-stories">
            <GCard T={T} style={{ padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 2 }}>
                {storyNames.map((name, i) => (
                  <StoryBubble key={i} name={name} isAdd={i === 0} T={T} />
                ))}
              </div>
            </GCard>
          </div>

          {/* Post composer */}
          <GCard T={T} style={{ padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>U</div>
              <div style={{ flex: 1, padding: '10px 16px', borderRadius: 50, fontSize: 13, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.textMuted, cursor: 'pointer' }}>
                Share a blessing or moment…
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, fontSize: 13 }}>
                  <ImageIcon size={17} /> Photo
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, fontSize: 13 }}>
                  <Calendar size={17} /> Event
                </button>
              </div>
              <button style={{ background: T.purpleGrad, color: '#fff', border: 'none', borderRadius: 50, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: T.shadowPurp }}>
                Share
              </button>
            </div>
          </GCard>

          {/* Event pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
            {loadingEvents
              ? Array.from({ length: 3 }).map((_, i) => <Skel key={i} w="110px" h={34} r={50} T={T} />)
              : events.map((ev: ChurchEvent) => {
                  const active = selectedEvent?.id === ev.id
                  return (
                    <button key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ padding: '7px 18px', borderRadius: 50, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: active ? T.purpleGrad : T.surface, color: active ? '#fff' : T.textMuted, boxShadow: active ? T.shadowPurp : T.shadow }}>
                      {ev.title}
                    </button>
                  )
                })
            }
          </div>

          {/* Feed */}
          {selectedEvent ? (
            loadingPhotos
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{Array.from({ length: 2 }).map((_, i) => <Skel key={i} h={420} r={20} T={T} />)}</div>
              : photos.length === 0
                ? <div style={{ textAlign: 'center', padding: '64px 0', color: T.textMuted }}>No photos yet for this event</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {photos.map((photo: Photo) => (
                      <div key={photo.id} className="gc-card">
                        <PostCard photo={photo} T={T} onComment={() => { setPhoto(photo); setOpen(true) }} />
                      </div>
                    ))}
                  </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', color: T.textMuted }}>Select an event to see the feed</div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: T.navBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
            {[{ icon: '⌂', label: 'Feed', href: '/church-community' }, { icon: '👥', label: 'Members', href: '/church-community/members' }, { icon: '🖼', label: 'Gallery', href: '/church-community/inventory' }, { icon: '⚙', label: 'Admin', href: '/church-community/admin' }].map((n) => (
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

export default IndexScreen
