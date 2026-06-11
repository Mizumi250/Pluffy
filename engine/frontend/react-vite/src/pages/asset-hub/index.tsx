// ============================================================
// ARKZEN GENERATED PAGE — asset-hub/index [React+Vite]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-11T12:58:10.158Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import './styles/global.css'

// ── Shared components from @arkzen:components ─────────────────────────────────
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

// ── Page component from @arkzen:page:index ─────────────────────────────
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_AssetHub_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_AssetHub_Index
