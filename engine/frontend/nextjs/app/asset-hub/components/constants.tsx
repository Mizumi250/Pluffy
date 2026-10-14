// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — asset-hub
// Source: @arkzen:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T13:50:33.038Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { AssetCategory, AssetItem } from './types'


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
