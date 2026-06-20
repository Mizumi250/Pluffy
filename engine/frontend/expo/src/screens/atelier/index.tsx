// ============================================================
// ARKZEN GENERATED SCREEN — atelier/index
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Dimensions, FlatList, Image, Pressable, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NBadge } from './components/NBadge'
import { NContinuationCard } from './components/NContinuationCard'
import { NProgressBar } from './components/NProgressBar'
import { NSectionHead } from './components/NSectionHead'
import { NTabBar } from './components/NTabBar'
import { C, N_CONTINUATIONS, N_LIVE, N_MESSAGES, N_PEOPLE, N_SPACES, N_USER, SCREEN_W } from './components/constants'

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [refreshing, setRefreshing] = useState(false)
  const [witnessing, setWitnessing] = useState<number[]>([1])
  const [spaces, setSpaces] = useState(N_SPACES)
  const [chatMsg, setChatMsg] = useState('')
  const [messages, setMessages] = useState(N_MESSAGES)
  const [selectedCont, setSelectedCont] = useState<typeof N_CONTINUATIONS[0] | null>(null)
 
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }, [])
 
  const toggleWitness = (id: number) =>
    setWitnessing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
 
  const sendMsg = () => {
    if (!chatMsg.trim()) return
    setMessages(prev => [...prev, { id: prev.length + 1, from: 'Mizu', avatar: N_USER.avatar, text: chatMsg, time: 'now', own: true }])
    setChatMsg('')
  }
 
  // ── HOME ──────────────────────────────────────────────────────────────────────
  const HomeTab = () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
    >
      {/* Header */}
      <View style={{ backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 11, color: C.muted, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 }}>ATELIER</Text>
            <Text style={{ fontSize: 22, fontWeight: '300', color: C.text }}>Welcome back, <Text style={{ fontWeight: '700', color: C.gold }}>{N_USER.name}</Text></Text>
          </View>
          <Image source={{ uri: N_USER.avatar }} style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: C.gold }} />
        </View>
        <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>What will you continue today?</Text>
      </View>
 
      <View style={{ padding: 20 }}>
        {/* Continue Working */}
        <NSectionHead title="Continue Working" onMore={() => setActiveTab('continuations')} />
 
        {/* Featured */}
        <NContinuationCard c={N_CONTINUATIONS[0]} onPress={() => { setSelectedCont(N_CONTINUATIONS[0]); setActiveTab('continuations') }} />
 
        {/* Live Studios strip */}
        <NSectionHead title="Live Studios" onMore={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {N_LIVE.map(s => (
            <Pressable key={s.artist} style={{ marginRight: 12, width: 180, backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border }}>
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: s.thumb }} style={{ width: 180, height: 100, resizeMode: 'cover' }} />
                <View style={{ position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(14,13,12,0.75)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#ef4444' }} />
                  <Text style={{ fontSize: 9, fontWeight: '700', color: C.text }}>LIVE</Text>
                </View>
                <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(14,13,12,0.75)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 9, color: C.text }}>{s.viewers} watching</Text>
                </View>
              </View>
              <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={{ uri: s.avatar }} style={{ width: 22, height: 22, borderRadius: 11 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.text }}>{s.artist}</Text>
                  <Text style={{ fontSize: 10, color: C.muted }}>{s.type}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
 
        {/* People You Witness */}
        <NSectionHead title="People You Witness" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {N_PEOPLE.map(p => (
            <View key={p.name} style={{ marginRight: 16, alignItems: 'center', gap: 5 }}>
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: p.avatar }} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: p.online ? C.green : 'transparent' }} />
                {p.online && <View style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: 5, backgroundColor: C.green, borderWidth: 1.5, borderColor: C.bg }} />}
              </View>
              <Text style={{ fontSize: 11, color: C.textDim }}>{p.name}</Text>
              <Text style={{ fontSize: 9, color: C.muted }}>{p.role}</Text>
            </View>
          ))}
        </ScrollView>
 
        {/* Absence note */}
        <View style={{ backgroundColor: `${C.gold}0a`, borderLeftWidth: 2, borderLeftColor: C.goldDim, borderRadius: 6, padding: 12, marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', lineHeight: 18 }}>The system never punishes absence. Return when you're ready and simply continue.</Text>
        </View>
      </View>
    </ScrollView>
  )
 
  // ── JOURNEY (Continuations) ───────────────────────────────────────────────────
  const JourneyTab = () => {
    if (selectedCont) return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <Image source={{ uri: selectedCont.thumb }} style={{ width: '100%', height: 240, resizeMode: 'cover' }} />
 
        <View style={{ padding: 20 }}>
          {/* Back */}
          <Pressable onPress={() => setSelectedCont(null)} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: C.gold }}>← Back to Continuations</Text>
          </Pressable>
 
          {/* Artist + meta */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Image source={{ uri: selectedCont.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>{selectedCont.title}</Text>
              <Text style={{ fontSize: 12, color: C.muted }}>{selectedCont.handle} · {selectedCont.lastUpdate}</Text>
            </View>
            <Pressable
              onPress={() => toggleWitness(selectedCont.id)}
              style={{ backgroundColor: witnessing.includes(selectedCont.id) ? `${C.green}18` : `${C.gold}12`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: witnessing.includes(selectedCont.id) ? `${C.green}35` : C.border }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: witnessing.includes(selectedCont.id) ? C.green : C.gold }}>
                {witnessing.includes(selectedCont.id) ? 'Witnessing' : 'Witness'}
              </Text>
            </Pressable>
          </View>
 
          {/* Tags */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
            {selectedCont.tags.map(t => <NBadge key={t} label={t} />)}
          </View>
 
          {/* Progress */}
          <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Progress</Text>
            <NProgressBar pct={selectedCont.progress} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 11, color: C.muted }}>v{selectedCont.version}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{selectedCont.progress}%</Text>
            </View>
          </View>
 
          {/* Artist note */}
          <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Artist Note</Text>
            <Text style={{ fontSize: 13, color: C.text, lineHeight: 20 }}>{selectedCont.note}</Text>
          </View>
 
          {/* Witnesses */}
          <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: `${C.green}90` }} />
              <Text style={{ fontSize: 12, color: C.muted }}>{selectedCont.witnesses} people are here witnessing</Text>
            </View>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 6, fontStyle: 'italic', lineHeight: 17 }}>
              We simply co-exist in the space.
            </Text>
          </View>
        </View>
      </ScrollView>
    )
 
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.text }}>Continuations</Text>
          <Pressable style={{ backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>+ New</Text>
          </Pressable>
        </View>
 
        {N_CONTINUATIONS.map(c => (
          <NContinuationCard key={c.id} c={c} onPress={() => setSelectedCont(c)} />
        ))}
      </ScrollView>
    )
  }
 
  // ── SPACES ──────────────────────────────────────────────────────────────────
  const SpacesTab = () => (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 20 }}>Spaces</Text>
 
      <NSectionHead title="Your Spaces" />
      {spaces.filter(s => s.joined).map(s => (
        <View key={s.id} style={{ backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 10 }}>
          <Image source={{ uri: s.thumb }} style={{ width: '100%', height: 80, resizeMode: 'cover' }} />
          <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>{s.name}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{s.members} members</Text>
            </View>
            <Pressable
              onPress={() => setSpaces(prev => prev.map(sp => sp.id === s.id ? { ...sp, joined: false } : sp))}
              style={{ backgroundColor: `${C.gold}14`, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: C.border }}
            >
              <Text style={{ fontSize: 12, color: C.gold }}>Joined</Text>
            </Pressable>
          </View>
        </View>
      ))}
 
      <View style={{ marginTop: 12 }}>
        <NSectionHead title="Discover Spaces" />
        {spaces.filter(s => !s.joined).map(s => (
          <View key={s.id} style={{ backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 10 }}>
            <Image source={{ uri: s.thumb }} style={{ width: '100%', height: 80, resizeMode: 'cover' }} />
            <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>{s.name}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{s.members} members</Text>
              </View>
              <Pressable
                onPress={() => setSpaces(prev => prev.map(sp => sp.id === s.id ? { ...sp, joined: true } : sp))}
                style={{ backgroundColor: C.gold, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Join</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
 
  // ── COMMON ROOM ──────────────────────────────────────────────────────────────
  const CommonRoomTab = () => (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 }}>Common Room</Text>
      <Text style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>A space where artists are just people.</Text>
 
      {/* Post item */}
      {[
        { author: 'Yuki', handle: '@yuki_draw', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face', time: '26m ago', content: 'When the ref and the final look nothing alike', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&h=340&fit=crop', hearts: 129, comments: 24 },
        { author: 'Daro', handle: '@daro_env',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', time: '1h ago',  content: "Every artist's nightmare.",               image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=500&h=340&fit=crop', hearts: 76,  comments: 12 },
      ].map((post, i) => (
        <View key={i} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Image source={{ uri: post.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.text }}>{post.author}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{post.handle} · {post.time}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, color: C.text, marginBottom: 12, lineHeight: 20 }}>{post.content}</Text>
          <Image source={{ uri: post.image }} style={{ width: '100%', height: 180, borderRadius: 8, resizeMode: 'cover', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ fontSize: 13, color: C.muted }}>♥</Text>
              <Text style={{ fontSize: 12, color: C.muted }}>{post.hearts}</Text>
            </Pressable>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ fontSize: 13, color: C.muted }}>◎</Text>
              <Text style={{ fontSize: 12, color: C.muted }}>{post.comments}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  )
 
  // ── PROFILE ──────────────────────────────────────────────────────────────────
  const ProfileTab = () => {
    const [tab, setTab] = useState<'journey' | 'about'>('journey')
 
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Cover */}
        <Image source={{ uri: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=800&h=200&fit=crop' }} style={{ width: '100%', height: 120, resizeMode: 'cover' }} />
 
        <View style={{ paddingHorizontal: 20 }}>
          {/* Avatar */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -28, marginBottom: 12 }}>
            <Image source={{ uri: N_USER.avatar }} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, borderColor: C.surface }} />
            <Pressable style={{ backgroundColor: `${C.gold}14`, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.border, marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.gold }}>Edit Profile</Text>
            </Pressable>
          </View>
 
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.text }}>{N_USER.name}</Text>
          <Text style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>{N_USER.handle} · {N_USER.role}</Text>
          <Text style={{ fontSize: 13, color: C.textDim, marginBottom: 14, lineHeight: 20 }}>I draw slow, murals, and stories.</Text>
 
          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}>
            {[['4', 'Continuations'], ['326', 'Followers'], ['51', 'Following']].map(([v, l]) => (
              <View key={l}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>{v}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{l}</Text>
              </View>
            ))}
          </View>
 
          {/* Tab switcher */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 16 }}>
            {([['journey', 'Journey'], ['about', 'About']] as const).map(([v, l]) => (
              <Pressable key={v} onPress={() => setTab(v)} style={{ paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: tab === v ? C.gold : 'transparent' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: tab === v ? C.gold : C.muted }}>{l}</Text>
              </Pressable>
            ))}
          </View>
 
          {tab === 'journey' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {[
                'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=160&h=160&fit=crop',
              ].map((img, i) => {
                const size = (SCREEN_W - 48) / 3
                return <Image key={i} source={{ uri: img }} style={{ width: size, height: size, borderRadius: 6, resizeMode: 'cover' }} />
              })}
            </View>
          )}
 
          {tab === 'about' && (
            <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: C.border }}>
              {[['Location', 'Cloud City'], ['Role', 'Artist'], ['Member since', '2023']].map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                  <Text style={{ fontSize: 13, color: C.muted }}>{k}</Text>
                  <Text style={{ fontSize: 13, color: C.text, fontWeight: '500' }}>{v}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    )
  }
 
  // ── Render active tab ─────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'home':          return <HomeTab />
      case 'continuations': return <JourneyTab />
      case 'spaces':        return <SpacesTab />
      case 'common-room':   return <CommonRoomTab />
      case 'profile':       return <ProfileTab />
      default:              return <HomeTab />
    }
  }
 
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {renderTab()}
      <NTabBar active={activeTab} onNav={(v) => { setActiveTab(v); setSelectedCont(null) }} />
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_Atelier_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('atelier')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_Atelier_Index
