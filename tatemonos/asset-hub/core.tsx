/* @arkzen:meta
name: asset-hub
version: 2.1.0
description: Tests how assets are placed in the tatemono folder and distributed by the engine. Drop any file into tatemonos/asset-hub/assets/<category>/ — the engine auto-copies everything to the public folder. Web page shows all registered assets live. Native screen mirrors the same test.
auth: false
*/

/* @arkzen:meta:web
favicon: 📦
title: Asset Hub
description: Arkzen asset placement and distribution test.
*/

/* @arkzen:meta:native
label: Asset Hub
description: Asset placement and distribution test — native mirror
expo:
  bundle_id: com.arkzen.assethub
  scheme: assethub
  version: 1.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:native:config
theme:
  primary: "#6366f1"
  background: "#fafafa"
  surface: "#ffffff"
  text: "#0f172a"
  muted: "#94a3b8"
*/

/* @arkzen:web:config
layout:
  guest:
    className: "ah-root"
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState } from 'react'

// ─── ASSET REGISTRY ───────────────────────────────────────────────────────────
// Add an entry here after dropping a file into tatemonos/asset-hub/assets/<category>/
// The engine copies everything in assets/ → public/tatemonos/asset-hub/assets/
// Reference in code: /tatemonos/asset-hub/assets/<category>/<filename>

export type AssetCategory = 'images' | 'fonts' | 'icons' | 'svg' | 'video' | 'audio' | 'data'

export interface AssetItem {
  name: string
  path: string
  category: AssetCategory
  ext: string
}

export const ASSET_REGISTRY: AssetItem[] = [
  // ── Drop files in tatemonos/asset-hub/assets/images/ ──
  { name: 'logo.png',    path: '/tatemonos/asset-hub/assets/images/logo.png',    category: 'images', ext: 'png' },
  { name: 'hero-bg.jpg', path: '/tatemonos/asset-hub/assets/images/hero-bg.jpg', category: 'images', ext: 'jpg' },
  { name: 'baby.jpg',    path: '/tatemonos/asset-hub/assets/images/baby.jpg',    category: 'images', ext: 'jpg' },

  // ── Drop files in tatemonos/asset-hub/assets/svg/ ──
  { name: 'icon.svg',    path: '/tatemonos/asset-hub/assets/svg/icon.svg',       category: 'svg',    ext: 'svg' },

  // ── Drop files in tatemonos/asset-hub/assets/fonts/ ──
  { name: 'custom.ttf',  path: '/tatemonos/asset-hub/assets/fonts/custom.ttf',   category: 'fonts',  ext: 'ttf' },

  // ── Drop files in tatemonos/asset-hub/assets/data/ ──
  { name: 'sample.json', path: '/tatemonos/asset-hub/assets/data/sample.json',   category: 'data',   ext: 'json' },
]

const CATEGORY_EMOJI: Record<AssetCategory, string> = {
  images: '🖼',
  fonts:  '🔤',
  icons:  '🔷',
  svg:    '✏️',
  video:  '🎬',
  audio:  '🎵',
  data:   '📄',
}

export const AssetCard = ({ asset }: { asset: AssetItem }) => (
  <div className="ah-card">
    <span className="ah-card-emoji">{CATEGORY_EMOJI[asset.category]}</span>
    <div className="ah-card-info">
      <p className="ah-card-name">{asset.name}</p>
      <p className="ah-card-path">{asset.path}</p>
    </div>
    <span className="ah-card-ext">.{asset.ext}</span>
  </div>
)

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.ah-root {
  min-height: 100vh;
  background: #fafafa;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.ah-wrap {
  max-width: 760px;
  margin: 0 auto;
  padding: 64px 24px 80px;
}

.ah-header { margin-bottom: 48px; }

.ah-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: #ede9fe;
  color: #6d28d9;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.ah-title {
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 12px;
}

.ah-subtitle {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  max-width: 520px;
}

.ah-guide {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 40px;
}

.ah-guide-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 16px;
}

.ah-guide-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.ah-guide-row:last-child { border-bottom: none; }

.ah-guide-folder {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #6366f1;
  flex: 1;
}

.ah-guide-desc {
  font-size: 12px;
  color: #94a3b8;
}

.ah-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.ah-tab {
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  transition: all 0.15s;
}

.ah-tab:hover { border-color: #6366f1; color: #6366f1; }
.ah-tab.active { background: #6366f1; color: #fff; border-color: #6366f1; }

.ah-list { display: flex; flex-direction: column; gap: 10px; }

.ah-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 18px;
  transition: border-color 0.15s;
}

.ah-card:hover { border-color: #6366f1; }
.ah-card-emoji { font-size: 22px; flex-shrink: 0; }
.ah-card-info { flex: 1; min-width: 0; }

.ah-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ah-card-path {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ah-card-ext {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: #6366f1;
  background: #ede9fe;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.ah-empty {
  text-align: center;
  padding: 48px 24px;
  color: #94a3b8;
  font-size: 14px;
  background: #fff;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
}
/* @arkzen:web:style:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [active, setActive] = useState<AssetCategory | 'all'>('all')

  const categories = ['all', ...Array.from(new Set(ASSET_REGISTRY.map(a => a.category)))] as (AssetCategory | 'all')[]

  const filtered = active === 'all'
    ? ASSET_REGISTRY
    : ASSET_REGISTRY.filter(a => a.category === active)

  return (
    <div className="ah-wrap">

      <div className="ah-header">
        <span className="ah-badge">📦 Asset Hub</span>
        <h1 className="ah-title">Asset Placement &amp; Distribution</h1>
        <p className="ah-subtitle">
          Drop files into <code>tatemonos/asset-hub/assets/&lt;category&gt;/</code> — the engine copies them to public automatically. Register them below to verify the distribution works.
        </p>
      </div>

      <div className="ah-guide">
        <p className="ah-guide-title">Where to drop assets</p>
        {([
          ['tatemonos/asset-hub/assets/images/', 'jpg, png, webp, gif'],
          ['tatemonos/asset-hub/assets/svg/',    'svg files'],
          ['tatemonos/asset-hub/assets/fonts/',  'ttf, otf, woff, woff2'],
          ['tatemonos/asset-hub/assets/icons/',  'ico, png icons'],
          ['tatemonos/asset-hub/assets/audio/',  'mp3, wav, ogg'],
          ['tatemonos/asset-hub/assets/video/',  'mp4, webm'],
          ['tatemonos/asset-hub/assets/data/',   'json, csv, xml'],
        ] as [string, string][]).map(([folder, desc]) => (
          <div className="ah-guide-row" key={folder}>
            <span className="ah-guide-folder">{folder}</span>
            <span className="ah-guide-desc">{desc}</span>
          </div>
        ))}
      </div>

      <div className="ah-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`ah-tab${active === cat ? ' active' : ''}`}
            onClick={() => setActive(cat)}
          >
            {cat === 'all' ? 'All' : `${CATEGORY_EMOJI[cat as AssetCategory]} ${cat}`}
          </button>
        ))}
      </div>

      <div className="ah-list">
        {filtered.length === 0 ? (
          <div className="ah-empty">No assets registered in this category yet.</div>
        ) : (
          filtered.map(asset => <AssetCard key={asset.path} asset={asset} />)
        )}
      </div>

    </div>
  )
}
/* @arkzen:web:page:index:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React from 'react'
import { Image, View, Text, ScrollView } from 'react-native'

// ─── NATIVE ASSET REGISTRY ────────────────────────────────────────────────────
// Metro requires static require() calls — dynamic require() is not supported.
// Pattern: add a require() entry here when you drop a new file, then reference
// it by key from NATIVE_ASSET_REGISTRY. The registry stays data-driven;
// only NATIVE_ASSET_REQUIRE_MAP needs a new line per file.
//
// Distributed to: engine/frontend/expo/assets/tatemonos/asset-hub/
// require() depth: src/screens/asset-hub/index.tsx → ../../assets/tatemonos/asset-hub/

export const NATIVE_ASSET_REQUIRE_MAP: Record<string, any> = {
  // ── Add a require() here for every file you drop ──
  // Metro needs static require() calls — only list files that actually exist
  'images/baby.jpg': require('../../../assets/tatemonos/asset-hub/images/baby.jpg'),
}
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React from 'react'
import { Image, View, Text, ScrollView } from 'react-native'

// ─── NATIVE ASSET REGISTRY ────────────────────────────────────────────────────
// Metro requires static require() calls — dynamic require() is not supported.
// Pattern: add a require() entry here when you drop a new file, then reference
// it by key from NATIVE_ASSET_REGISTRY. The registry stays data-driven;
// only NATIVE_ASSET_REQUIRE_MAP needs a new line per file.
//
// Distributed to: engine/frontend/react-native/assets/tatemonos/asset-hub/
// require() depth: src/screens/asset-hub/index.tsx → ../../assets/tatemonos/asset-hub/

export const NATIVE_ASSET_REQUIRE_MAP: Record<string, any> = {
  // ── Add a require() here for every file you drop ──
  // Metro needs static require() calls — only list files that actually exist
  'images/baby.jpg': require('../../../assets/tatemonos/asset-hub/images/baby.jpg'),
}
/* @arkzen:import:rn:end */

export interface NativeAssetItem {
  name:     string
  key:      string   // matches NATIVE_ASSET_REQUIRE_MAP key
  category: string
  ext:      string
}

export const NATIVE_ASSET_REGISTRY: NativeAssetItem[] = [
  // ── Add an entry here alongside every new NATIVE_ASSET_REQUIRE_MAP entry ──
  { name: 'baby.jpg', key: 'images/baby.jpg', category: 'images', ext: 'jpg' },
]

const NATIVE_CATEGORY_EMOJI: Record<string, string> = {
  images: '🖼', fonts: '🔤', icons: '🔷', svg: '✏️', video: '🎬', audio: '🎵', data: '📄',
}

// ── Category badge ────────────────────────────────────────────
const CatBadge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600 tracking-wide">{label}</Text>
  </View>
)

// ── Asset row ─────────────────────────────────────────────────
// Shows image preview for image assets, plain row for everything else
const AssetRow = ({ asset }: { asset: NativeAssetItem }) => {
  const source   = NATIVE_ASSET_REQUIRE_MAP[asset.key]
  const isImage  = asset.category === 'images'

  return (
    <View className="bg-white border border-neutral-100 rounded-2xl px-4 py-3 mb-2">
      <View className="flex-row items-center">
        <Text className="text-xl mr-3">{NATIVE_CATEGORY_EMOJI[asset.category] ?? '📁'}</Text>
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-semibold text-neutral-800" numberOfLines={1}>{asset.name}</Text>
          <Text className="text-xs text-neutral-400 font-mono mt-0.5" numberOfLines={1}>
            assets/tatemonos/asset-hub/{asset.key}
          </Text>
        </View>
        <View className="bg-indigo-50 px-2 py-0.5 rounded">
          <Text className="text-xs font-semibold text-indigo-500 font-mono">.{asset.ext}</Text>
        </View>
      </View>
      {isImage && source && (
        <Image
          source={source}
          className="w-full h-40 rounded-xl mt-3"
          resizeMode="cover"
        />
      )}
    </View>
  )
}

// ── Guide row ─────────────────────────────────────────────────
const GuideRow = ({ folder, desc }: { folder: string; desc: string }) => (
  <View className="py-2.5 border-b border-neutral-100">
    <Text className="text-xs font-mono text-indigo-500 mb-0.5">{folder}</Text>
    <Text className="text-xs text-neutral-400">{desc}</Text>
  </View>
)

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:index */

const NativeIndexScreen = () => {
  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 48 }}>

      <CatBadge label="📦 Asset Hub" />

      <Text className="text-3xl font-bold text-neutral-900 mt-4 mb-2 leading-tight">
        Asset Distribution
      </Text>
      <Text className="text-sm text-neutral-500 leading-6 mb-8">
        Drop files into{' '}
        <Text className="font-mono text-indigo-500">tatemonos/asset-hub/assets/</Text>
        {' '}— engine distributes to{' '}
        <Text className="font-mono text-indigo-500">expo/assets/tatemonos/asset-hub/</Text>
        . Registered assets render below.
      </Text>

      {/* Drop guide */}
      <View className="bg-white border border-neutral-100 rounded-2xl px-4 py-3 mb-8">
        <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
          Where to drop
        </Text>
        <GuideRow folder="assets/images/" desc="jpg, png, webp, gif" />
        <GuideRow folder="assets/svg/"    desc="svg files" />
        <GuideRow folder="assets/fonts/"  desc="ttf, otf, woff2" />
        <GuideRow folder="assets/audio/"  desc="mp3, wav, ogg" />
        <GuideRow folder="assets/video/"  desc="mp4, webm" />
        <View className="py-2.5">
          <Text className="text-xs font-mono text-indigo-500 mb-0.5">assets/data/</Text>
          <Text className="text-xs text-neutral-400">json, csv, xml</Text>
        </View>
      </View>

      {/* Registered assets */}
      <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        Registered assets
      </Text>
      {NATIVE_ASSET_REGISTRY.map(a => <AssetRow key={a.key} asset={a} />)}

    </ScrollView>
  )
}

/* @arkzen:native:page:index:end */

/* @arkzen:native:components:lynx:shared */

import { View, Text, ScrollView, Image } from '@lynx-js/react'
import { useState } from '@lynx-js/react'

// ─── LYNX ASSET REGISTRY ──────────────────────────────────────────────────────
// Lynx uses URI-based asset references — no Metro static require() needed.
// Assets are served from the Lynx dev server or bundled as URI strings.
// Drop files into tatemonos/asset-hub/assets/<category>/ and register here.

export interface LynxAssetItem {
  name:     string
  uri:      string   // relative URI served by Lynx asset pipeline
  category: string
  ext:      string
}

export const LYNX_ASSET_REGISTRY: LynxAssetItem[] = [
  // ── Add an entry here for every file you drop ──
  { name: 'baby.jpg', uri: '/assets/tatemonos/asset-hub/images/baby.jpg', category: 'images', ext: 'jpg' },
]

const LYNX_CATEGORY_EMOJI: Record<string, string> = {
  images: '🖼', fonts: '🔤', icons: '🔷', svg: '✏️', video: '🎬', audio: '🎵', data: '📄',
}

// ── Category badge ─────────────────────────────────────────────
const CatBadge = ({ label }: { label: string }) => (
  <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#ede9fe', borderRadius: 99, alignSelf: 'flex-start' }}>
    <Text style={{ fontSize: 11, fontWeight: '600', color: '#6d28d9', letterSpacing: 1 }}>{label}</Text>
  </View>
)

// ── Asset row ──────────────────────────────────────────────────
const AssetRow = ({ asset }: { asset: LynxAssetItem }) => {
  const isImage = asset.category === 'images'

  return (
    <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, marginRight: 12 }}>{LYNX_CATEGORY_EMOJI[asset.category] ?? '📁'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#0f172a' }}>{asset.name}</Text>
          <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#94a3b8', marginTop: 2 }}>
            {asset.uri}
          </Text>
        </View>
        <View style={{ backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#6366f1', fontFamily: 'monospace' }}>.{asset.ext}</Text>
        </View>
      </View>
      {isImage && (
        <Image
          src={asset.uri}
          style={{ width: '100%', height: 160, borderRadius: 12, marginTop: 12 }}
        />
      )}
    </View>
  )
}

// ── Guide row ──────────────────────────────────────────────────
const GuideRow = ({ folder, desc }: { folder: string; desc: string }) => (
  <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
    <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#6366f1', marginBottom: 2 }}>{folder}</Text>
    <Text style={{ fontSize: 11, color: '#94a3b8' }}>{desc}</Text>
  </View>
)

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:index */

const IndexScreen = () => (
  <ScrollView style={{ flex: 1, backgroundColor: '#fafafa' }} contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 48 }}>

    <CatBadge label="📦 Asset Hub" />

    <Text style={{ fontSize: 28, fontWeight: '700', color: '#0f172a', marginTop: 16, marginBottom: 8, lineHeight: 34 }}>
      Asset Distribution
    </Text>
    <Text style={{ fontSize: 13, color: '#64748b', lineHeight: 22, marginBottom: 32 }}>
      Drop files into{' '}
      <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>tatemonos/asset-hub/assets/</Text>
      {' '}— engine distributes to the Lynx asset pipeline. Registered assets render below.
    </Text>

    {/* Drop guide */}
    <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 32 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
        Where to drop
      </Text>
      <GuideRow folder="assets/images/" desc="jpg, png, webp, gif" />
      <GuideRow folder="assets/svg/"    desc="svg files" />
      <GuideRow folder="assets/fonts/"  desc="ttf, otf, woff2" />
      <GuideRow folder="assets/audio/"  desc="mp3, wav, ogg" />
      <GuideRow folder="assets/video/"  desc="mp4, webm" />
      <View style={{ paddingVertical: 10 }}>
        <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#6366f1', marginBottom: 2 }}>assets/data/</Text>
        <Text style={{ fontSize: 11, color: '#94a3b8' }}>json, csv, xml</Text>
      </View>
    </View>

    {/* Registered assets */}
    <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 12 }}>
      Registered assets
    </Text>
    {LYNX_ASSET_REGISTRY.map(a => <AssetRow key={a.uri} asset={a} />)}

  </ScrollView>
)

/* @arkzen:native:page:lynx:index:end */
