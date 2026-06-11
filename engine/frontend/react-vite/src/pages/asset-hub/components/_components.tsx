// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — asset-hub [React+Vite]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-11T03:25:47.039Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

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

export const CATEGORY_EMOJI: Record<AssetCategory, string> = {
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
