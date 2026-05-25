// ============================================================
// ARKZEN GENERATED SCREEN — asset-hub/index [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:index instead
// Generated: 2026-05-25T08:28:08.516Z
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
      <GuestLayout tatSlug="asset-hub" dashboardRoute="/asset-hub/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const IndexPage = () => {
  const {
    activeCategory, setActiveCategory,
    viewMode, setViewMode,
    search, setSearch,
    selectedAsset,
  } = useAssetStore()

  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = assetHubAnimations(pageRef)
    return cleanup
  }, [])

  // Filter assets
  const filtered = ASSET_REGISTRY.filter(a => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  // Count per category
  const counts = ASSET_REGISTRY.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1
    return acc
  }, {})

  return (
    <div ref={pageRef} className="asset-hub-root">
      {/* Header */}
      <div className="asset-hub-header">
        <div>
          <h1 className="asset-hub-title">📦 Asset Hub</h1>
          <p className="asset-hub-sub">Central asset registry — all static files, fonts, SVG, media, and data for this project</p>
          <div className="asset-stats">
            <div className="asset-stat">Total: <strong>{ASSET_REGISTRY.length}</strong></div>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => counts[c.id] ? (
              <div key={c.id} className="asset-stat" style={{ color: c.color, opacity: 0.8 }}>
                {c.label}: <strong>{counts[c.id]}</strong>
              </div>
            ) : null)}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="asset-toolbar">
        <div className="asset-search">
          <Search size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            placeholder="Search assets…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
              <X size={13} />
            </button>
          )}
        </div>
        <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
          <Grid size={15} />
        </button>
        <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
          <List size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="asset-hub-body">
        {/* Category sidebar */}
        <aside className="asset-sidebar">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`asset-cat-btn ${activeCategory === c.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.id)}
              style={activeCategory === c.id ? { borderLeftColor: c.color } : {}}
            >
              <span style={{ color: activeCategory === c.id ? c.color : undefined }}>{c.icon}</span>
              {c.label}
              <span className="cat-count">
                {c.id === 'all' ? ASSET_REGISTRY.length : (counts[c.id] || 0)}
              </span>
            </button>
          ))}
        </aside>

        {/* Asset content */}
        <main className="asset-content">
          {/* Drop zone guide (shown when no assets match or as info) */}
          {activeCategory === 'all' && !search && <DropZoneGuide />}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p>No assets found{search ? ` for "${search}"` : ' in this category'}.</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>Drop files into the assets folder and register them in ASSET_REGISTRY.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="asset-grid">
              <AnimatePresence>
                {filtered.map(a => (
                  <motion.div
                    key={a.path}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AssetCard asset={a} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="asset-list">
              <AnimatePresence>
                {filtered.map(a => (
                  <motion.div
                    key={a.path}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <AssetRow asset={a} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Detail panel */}
      {selectedAsset && <AssetDetailPanel />}
    </div>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default IndexScreen
