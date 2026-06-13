// ============================================================
// ARKZEN GENERATED ISLAND — asset-hub/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T03:59:28.494Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { AssetCard } from '@/arkzen/generated/components/asset-hub/AssetCard'
import { ASSET_REGISTRY, CATEGORY_EMOJI } from '@/arkzen/generated/components/asset-hub/constants'
import type { AssetCategory } from '@/arkzen/generated/components/asset-hub/types'

// Page component code (from @arkzen:page:index)
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

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_AssetHub_Index = () => {
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

export default ArkzenIsland_AssetHub_Index
