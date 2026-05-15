/* @arkzen:meta
name: asset-hub
version: 1.0.0
description: The canonical Arkzen asset management hub. Drop any file into tatemonos/asset-hub/assets/ and the engine auto-copies it to the public folder. This tatemono documents every asset category (images, fonts, icons, SVG, video, audio, JSON data), shows how to reference them in code, provides a live asset browser UI, and acts as the shared asset repository for the entire Arkzen project.
auth: false
favicon: 📦
*/

/* @arkzen:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "min-h-screen bg-neutral-950"
  auth:
    className: "min-h-screen bg-neutral-950"
*/

/* @arkzen:components:shared */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image, FileVideo, Music, FileJson, Type, Hexagon,
  Upload, FolderOpen, Copy, Check, Eye, Download,
  File, Grid, List, Search, X, ChevronRight, Package
} from 'lucide-react'

// ─── TYPES ─────────────────────────────────────────────────────────────────────
export type AssetCategory = 'images' | 'fonts' | 'icons' | 'svg' | 'video' | 'audio' | 'data' | 'misc'

export interface AssetItem {
  name: string
  path: string           // public path: /tatemonos/asset-hub/assets/images/photo.jpg
  category: AssetCategory
  ext: string
  size?: string
  description?: string
  tags?: string[]
}

// ─── ZUSTAND STORE ─────────────────────────────────────────────────────────────
interface AssetHubState {
  activeCategory: AssetCategory | 'all'
  setActiveCategory: (c: AssetCategory | 'all') => void
  viewMode: 'grid' | 'list'
  setViewMode: (v: 'grid' | 'list') => void
  search: string
  setSearch: (s: string) => void
  selectedAsset: AssetItem | null
  setSelectedAsset: (a: AssetItem | null) => void
  copiedPath: string | null
  setCopiedPath: (p: string | null) => void
}

export const useAssetStore = create<AssetHubState>((set) => ({
  activeCategory: 'all',
  setActiveCategory: (c) => set({ activeCategory: c }),
  viewMode: 'grid',
  setViewMode: (v) => set({ viewMode: v }),
  search: '',
  setSearch: (s) => set({ search: s }),
  selectedAsset: null,
  setSelectedAsset: (a) => set({ selectedAsset: a }),
  copiedPath: null,
  setCopiedPath: (p) => set({ copiedPath: p }),
}))

// ─── ASSET REGISTRY ────────────────────────────────────────────────────────────
// This is the single source of truth for all assets in the project.
// Add entries here after placing files in tatemonos/asset-hub/assets/<category>/
// The engine auto-copies everything in assets/ to Next.js public/tatemonos/asset-hub/assets/
// Reference in code: /tatemonos/asset-hub/assets/<category>/<filename>

export const ASSET_REGISTRY: AssetItem[] = [
  // ── IMAGES ──
  {
    name: 'logo.png',
    path: '/tatemonos/asset-hub/assets/images/logo.png',
    category: 'images',
    ext: 'png',
    description: 'Primary project logo (transparent background)',
    tags: ['brand', 'logo'],
  },
  {
    name: 'hero-bg.jpg',
    path: '/tatemonos/asset-hub/assets/images/hero-bg.jpg',
    category: 'images',
    ext: 'jpg',
    description: 'Hero section background image',
    tags: ['background', 'hero'],
  },
    {
    name: 'sample',
    path: '/tatemonos/asset-hub/assets/images/default-2.png',
    category: 'images',
    ext: 'png',
    description: 'samples',
    tags: ['samples', 'background'],
  },
  {
    name: 'avatar-placeholder.png',
    path: '/tatemonos/asset-hub/assets/images/avatar-placeholder.png',
    category: 'images',
    ext: 'png',
    description: 'Default user avatar placeholder',
    tags: ['user', 'avatar', 'placeholder'],
  },
  {
    name: 'og-image.jpg',
    path: '/tatemonos/asset-hub/assets/images/og-image.jpg',
    category: 'images',
    ext: 'jpg',
    description: 'Open Graph image for social sharing (1200×630)',
    tags: ['og', 'seo', 'social'],
  },

  // ── SVG ──
  {
    name: 'icon-sprite.svg',
    path: '/tatemonos/asset-hub/assets/svg/icon-sprite.svg',
    category: 'svg',
    ext: 'svg',
    description: 'SVG sprite sheet — reference with <use href="#icon-name" />',
    tags: ['icons', 'sprite'],
  },
  {
    name: 'logo.svg',
    path: '/tatemonos/asset-hub/assets/svg/logo.svg',
    category: 'svg',
    ext: 'svg',
    description: 'SVG version of primary logo — scalable, no quality loss',
    tags: ['brand', 'logo', 'scalable'],
  },
  {
    name: 'bg-pattern.svg',
    path: '/tatemonos/asset-hub/assets/svg/bg-pattern.svg',
    category: 'svg',
    ext: 'svg',
    description: 'Repeatable SVG background pattern',
    tags: ['background', 'pattern', 'decoration'],
  },

  // ── FONTS ──
  {
    name: 'Inter-Regular.woff2',
    path: '/tatemonos/asset-hub/assets/fonts/Inter-Regular.woff2',
    category: 'fonts',
    ext: 'woff2',
    description: 'Inter Regular 400 — primary body font',
    tags: ['inter', 'regular', 'body'],
  },
  {
    name: 'Inter-Bold.woff2',
    path: '/tatemonos/asset-hub/assets/fonts/Inter-Bold.woff2',
    category: 'fonts',
    ext: 'woff2',
    description: 'Inter Bold 700 — headings and emphasis',
    tags: ['inter', 'bold', 'heading'],
  },
  {
    name: 'GeistMono-Regular.woff2',
    path: '/tatemonos/asset-hub/assets/fonts/GeistMono-Regular.woff2',
    category: 'fonts',
    ext: 'woff2',
    description: 'Geist Mono — code blocks, monospace labels',
    tags: ['mono', 'code', 'geist'],
  },

  // ── VIDEO ──
  {
    name: 'hero-loop.mp4',
    path: '/tatemonos/asset-hub/assets/video/hero-loop.mp4',
    category: 'video',
    ext: 'mp4',
    description: 'Looping hero background video (no audio, auto-play)',
    tags: ['hero', 'loop', 'background'],
  },
  {
    name: 'demo-walkthrough.webm',
    path: '/tatemonos/asset-hub/assets/video/demo-walkthrough.webm',
    category: 'video',
    ext: 'webm',
    description: 'Product demo walkthrough video (WebM for smaller size)',
    tags: ['demo', 'walkthrough'],
  },

  // ── AUDIO ──
  {
    name: 'notification.mp3',
    path: '/tatemonos/asset-hub/assets/audio/notification.mp3',
    category: 'audio',
    ext: 'mp3',
    description: 'Notification sound effect',
    tags: ['notification', 'sfx'],
  },
  {
    name: 'success.mp3',
    path: '/tatemonos/asset-hub/assets/audio/success.mp3',
    category: 'audio',
    ext: 'mp3',
    description: 'Success / completion sound',
    tags: ['success', 'sfx'],
  },

  // ── DATA ──
  {
    name: 'translations.json',
    path: '/tatemonos/asset-hub/assets/data/translations.json',
    category: 'data',
    ext: 'json',
    description: 'i18n translation strings',
    tags: ['i18n', 'translations', 'localization'],
  },
  {
    name: 'config.json',
    path: '/tatemonos/asset-hub/assets/data/config.json',
    category: 'data',
    ext: 'json',
    description: 'Frontend runtime config (feature flags, constants)',
    tags: ['config', 'settings', 'flags'],
  },
  {
    name: 'seed-data.json',
    path: '/tatemonos/asset-hub/assets/data/seed-data.json',
    category: 'data',
    ext: 'json',
    description: 'Static seed / fixture data for frontend demos',
    tags: ['seed', 'fixture', 'demo'],
  },

  // ── MISC ──
  {
    name: 'manifest.json',
    path: '/tatemonos/asset-hub/assets/misc/manifest.json',
    category: 'misc',
    ext: 'json',
    description: 'PWA web app manifest',
    tags: ['pwa', 'manifest'],
  },
  {
    name: 'favicon.ico',
    path: '/tatemonos/asset-hub/assets/misc/favicon.ico',
    category: 'misc',
    ext: 'ico',
    description: 'Browser tab favicon (fallback for non-emoji favicons)',
    tags: ['favicon', 'icon'],
  },
]

// ─── CATEGORY CONFIG ───────────────────────────────────────────────────────────
export const CATEGORIES: { id: AssetCategory | 'all'; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'all',    label: 'All Assets', icon: <Package size={15} />,  color: '#a78bfa' },
  { id: 'images', label: 'Images',     icon: <Image size={15} />,    color: '#0ea5e9' },
  { id: 'svg',    label: 'SVG',        icon: <Hexagon size={15} />,  color: '#f59e0b' },
  { id: 'fonts',  label: 'Fonts',      icon: <Type size={15} />,     color: '#10b981' },
  { id: 'video',  label: 'Video',      icon: <FileVideo size={15} />,color: '#f43f5e' },
  { id: 'audio',  label: 'Audio',      icon: <Music size={15} />,    color: '#ec4899' },
  { id: 'data',   label: 'Data / JSON',icon: <FileJson size={15} />, color: '#22c55e' },
  { id: 'misc',   label: 'Misc',       icon: <File size={15} />,     color: '#94a3b8' },
]

// ─── EXT ICON MAP ──────────────────────────────────────────────────────────────
export const extColor = (ext: string): string => {
  const map: Record<string, string> = {
    png: '#0ea5e9', jpg: '#0ea5e9', jpeg: '#0ea5e9', webp: '#0ea5e9', gif: '#0ea5e9', avif: '#0ea5e9',
    svg: '#f59e0b',
    woff2: '#10b981', woff: '#10b981', ttf: '#10b981', otf: '#10b981',
    mp4: '#f43f5e', webm: '#f43f5e', mov: '#f43f5e',
    mp3: '#ec4899', ogg: '#ec4899', wav: '#ec4899',
    json: '#22c55e',
    ico: '#94a3b8', pdf: '#94a3b8',
  }
  return map[ext.toLowerCase()] || '#64748b'
}

// ─── ASSET CARD ────────────────────────────────────────────────────────────────
export const AssetCard = ({ asset }: { asset: AssetItem }) => {
  const { setSelectedAsset, setCopiedPath, copiedPath } = useAssetStore()

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(asset.path)
    setCopiedPath(asset.path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const copied = copiedPath === asset.path
  const color = extColor(asset.ext)

  return (
    <motion.div
      className="asset-card"
      onClick={() => setSelectedAsset(asset)}
      whileHover={{ y: -3, borderColor: `${color}44` }}
      transition={{ duration: 0.18 }}
    >
      <div className="asset-card-icon" style={{ background: `${color}18`, borderColor: `${color}30`, color }}>
        <span className="asset-ext-badge" style={{ background: color }}>{asset.ext.toUpperCase()}</span>
      </div>
      <div className="asset-card-body">
        <div className="asset-card-name">{asset.name}</div>
        {asset.description && (
          <div className="asset-card-desc">{asset.description}</div>
        )}
        {asset.tags && (
          <div className="asset-card-tags">
            {asset.tags.slice(0, 3).map(t => (
              <span key={t} className="asset-tag">{t}</span>
            ))}
          </div>
        )}
      </div>
      <button
        className={`asset-copy-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title="Copy path"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </motion.div>
  )
}

// ─── ASSET ROW (list view) ─────────────────────────────────────────────────────
export const AssetRow = ({ asset }: { asset: AssetItem }) => {
  const { setSelectedAsset, setCopiedPath, copiedPath } = useAssetStore()
  const color = extColor(asset.ext)
  const copied = copiedPath === asset.path

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(asset.path)
    setCopiedPath(asset.path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  return (
    <motion.div
      className="asset-row"
      onClick={() => setSelectedAsset(asset)}
      whileHover={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <span className="asset-ext-badge" style={{ background: color, flexShrink: 0 }}>{asset.ext.toUpperCase()}</span>
      <span className="asset-row-name">{asset.name}</span>
      <span className="asset-row-path">{asset.path}</span>
      <button className={`asset-copy-btn small ${copied ? 'copied' : ''}`} onClick={handleCopy}>
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </motion.div>
  )
}

// ─── ASSET DETAIL PANEL ────────────────────────────────────────────────────────
export const AssetDetailPanel = () => {
  const { selectedAsset, setSelectedAsset, setCopiedPath, copiedPath } = useAssetStore()
  if (!selectedAsset) return null

  const color = extColor(selectedAsset.ext)
  const copied = copiedPath === selectedAsset.path

  const snippets = {
    'Next.js img': `<img src="${selectedAsset.path}" alt="${selectedAsset.name}" />`,
    'Next.js Image': `import Image from 'next/image'\n<Image src="${selectedAsset.path}" alt="${selectedAsset.name}" width={800} height={600} />`,
    'CSS background': `background-image: url('${selectedAsset.path}');`,
    'React style': `style={{ backgroundImage: \`url(${selectedAsset.path})\` }}`,
  }

  const fontSnippets = {
    '@font-face': `@font-face {\n  font-family: 'CustomFont';\n  src: url('${selectedAsset.path}') format('woff2');\n  font-weight: normal;\n  font-style: normal;\n  font-display: swap;\n}`,
    'CSS var': `--font-primary: 'CustomFont', sans-serif;`,
  }

  const dataSnippets = {
    'fetch()': `const data = await fetch('${selectedAsset.path}').then(r => r.json())`,
    'import': `import data from '${selectedAsset.path}'`,
  }

  const videoSnippets = {
    '<video>': `<video autoPlay loop muted playsInline>\n  <source src="${selectedAsset.path}" type="video/${selectedAsset.ext}" />\n</video>`,
  }

  const audioSnippets = {
    'Audio API': `const audio = new Audio('${selectedAsset.path}')\naudio.play()`,
  }

  const activeSnippets =
    selectedAsset.category === 'fonts' ? fontSnippets :
    selectedAsset.category === 'data'  ? dataSnippets :
    selectedAsset.category === 'video' ? videoSnippets :
    selectedAsset.category === 'audio' ? audioSnippets :
    snippets

  const [activeSnippet, setActiveSnippet] = useState(Object.keys(activeSnippets)[0])
  const [snippetCopied, setSnippetCopied] = useState(false)

  const handleCopySnippet = (code: string) => {
    navigator.clipboard.writeText(code)
    setSnippetCopied(true)
    setTimeout(() => setSnippetCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="asset-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedAsset(null)}
      >
        <motion.div
          className="asset-detail-panel"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="detail-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="asset-ext-badge" style={{ background: color, fontSize: 12, padding: '3px 10px' }}>
                {selectedAsset.ext.toUpperCase()}
              </div>
              <span className="detail-name">{selectedAsset.name}</span>
            </div>
            <button className="detail-close" onClick={() => setSelectedAsset(null)}>
              <X size={18} />
            </button>
          </div>

          {/* Path copy */}
          <div className="detail-path-block">
            <span className="detail-path">{selectedAsset.path}</span>
            <button
              className={`asset-copy-btn ${copied ? 'copied' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(selectedAsset.path)
                setCopiedPath(selectedAsset.path)
                setTimeout(() => setCopiedPath(null), 2000)
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Path'}
            </button>
          </div>

          {/* Description */}
          {selectedAsset.description && (
            <p className="detail-desc">{selectedAsset.description}</p>
          )}

          {/* Tags */}
          {selectedAsset.tags && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {selectedAsset.tags.map(t => (
                <span key={t} className="asset-tag">{t}</span>
              ))}
            </div>
          )}

          {/* Code snippets */}
          <div className="detail-section-label">Usage Snippets</div>
          <div className="snippet-tabs">
            {Object.keys(activeSnippets).map(k => (
              <button
                key={k}
                className={`snippet-tab ${activeSnippet === k ? 'active' : ''}`}
                onClick={() => setActiveSnippet(k)}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="snippet-block">
            <pre className="snippet-code">{activeSnippets[activeSnippet]}</pre>
            <button
              className={`snippet-copy ${snippetCopied ? 'copied' : ''}`}
              onClick={() => handleCopySnippet(activeSnippets[activeSnippet])}
            >
              {snippetCopied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>

          {/* Distribution info */}
          <div className="detail-section-label" style={{ marginTop: 20 }}>Engine Distribution</div>
          <div className="distribution-info">
            <div className="dist-step">
              <div className="dist-num">1</div>
              <div>
                <div className="dist-step-title">Source Location</div>
                <code className="dist-path">tatemonos/asset-hub/assets/{selectedAsset.category}/{selectedAsset.name}</code>
              </div>
            </div>
            <div className="dist-arrow">↓ Arkzen Engine copies on build</div>
            <div className="dist-step">
              <div className="dist-num">2</div>
              <div>
                <div className="dist-step-title">Public Output</div>
                <code className="dist-path">public{selectedAsset.path}</code>
              </div>
            </div>
            <div className="dist-arrow">↓ Next.js serves statically</div>
            <div className="dist-step">
              <div className="dist-num">3</div>
              <div>
                <div className="dist-step-title">Reference in Code</div>
                <code className="dist-path">{selectedAsset.path}</code>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── DROP ZONE ─────────────────────────────────────────────────────────────────
export const DropZoneGuide = () => (
  <div className="drop-zone-guide">
    <Upload size={28} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 8 }} />
    <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>
      How to Add Assets
    </p>
    <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.6 }}>
      Place files in <code className="inline-code">tatemonos/asset-hub/assets/&lt;category&gt;/</code>
      {' '}then register them in <code className="inline-code">ASSET_REGISTRY</code> inside <code className="inline-code">core.tsx</code>.
      {' '}The Arkzen engine auto-copies all files to the Next.js public folder on every build.
    </p>
    <div className="drop-structure">
      {[
        ['images/', 'JPG · PNG · WebP · AVIF · GIF'],
        ['svg/',    'SVG files, sprites, illustrations'],
        ['fonts/',  'WOFF2 · WOFF · TTF · OTF'],
        ['video/',  'MP4 · WebM · MOV'],
        ['audio/',  'MP3 · OGG · WAV'],
        ['data/',   'JSON · CSV · YAML'],
        ['misc/',   'ICO · PDF · Manifest · Other'],
      ].map(([dir, types]) => (
        <div key={dir} className="drop-row">
          <span className="drop-dir"><FolderOpen size={13} /> {dir}</span>
          <span className="drop-types">{types}</span>
        </div>
      ))}
    </div>
  </div>
)

/* @arkzen:components:shared:end */

/* @arkzen:style */
/* Asset Hub Styles */

.asset-hub-root {
  min-height: 100vh;
  background: #09090b;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
}

/* ─── HEADER ──────────────────── */
.asset-hub-header {
  padding: 28px 32px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.asset-hub-title {
  font-size: 22px;
  font-weight: 900;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 4px;
}

.asset-hub-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin: 0;
}

/* ─── TOOLBAR ─────────────────── */
.asset-toolbar {
  padding: 14px 32px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-wrap: wrap;
}

.asset-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px 12px;
  flex: 1;
  max-width: 320px;
}

.asset-search input {
  background: none;
  border: none;
  outline: none;
  color: white;
  font-size: 13px;
  width: 100%;
}

.asset-search input::placeholder { color: rgba(255,255,255,0.3); }

.view-btn {
  padding: 8px 10px;
  border-radius: 7px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.15s;
}
.view-btn.active, .view-btn:hover {
  background: rgba(167,139,250,0.15);
  border-color: rgba(167,139,250,0.3);
  color: #a78bfa;
}

/* ─── BODY ────────────────────── */
.asset-hub-body {
  display: flex;
  min-height: calc(100vh - 130px);
}

/* ─── SIDEBAR ─────────────────── */
.asset-sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 16px 0;
}

.asset-cat-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.15s;
  width: 100%;
  background: none;
  border-top: none;
  border-right: none;
  border-bottom: none;
  text-align: left;
}
.asset-cat-btn:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.04); }
.asset-cat-btn.active { color: white; border-left-color: #a78bfa; background: rgba(167,139,250,0.07); }

.cat-count {
  margin-left: auto;
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.07);
  padding: 2px 7px;
  border-radius: 10px;
}

/* ─── CONTENT ─────────────────── */
.asset-content {
  flex: 1;
  padding: 20px 24px;
  overflow: hidden;
}

/* ─── ASSET GRID ──────────────── */
.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

/* ─── ASSET CARD ──────────────── */
.asset-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s;
}

.asset-card-icon {
  width: 42px; height: 42px;
  border-radius: 8px;
  border: 1px solid;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px;
}

.asset-card-name {
  font-size: 13px; font-weight: 700;
  color: rgba(255,255,255,0.9);
  margin-bottom: 4px;
  word-break: break-all;
}

.asset-card-desc {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  line-height: 1.5;
  margin-bottom: 8px;
}

.asset-card-body { flex: 1; }

.asset-card-tags {
  display: flex; gap: 4px; flex-wrap: wrap;
}

/* ─── ASSET ROW (list view) ────── */
.asset-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.asset-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.asset-row-name {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.85);
  min-width: 180px;
}

.asset-row-path {
  font-size: 11px; color: rgba(255,255,255,0.3);
  font-family: monospace;
  flex: 1;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ─── SHARED ──────────────────── */
.asset-ext-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: white;
}

.asset-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.45);
}

.asset-copy-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 7px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 12px; cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.asset-copy-btn:hover { background: rgba(255,255,255,0.12); color: white; }
.asset-copy-btn.copied { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: #22c55e; }
.asset-copy-btn.small { padding: 4px 8px; }

/* ─── DETAIL PANEL ────────────── */
.asset-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.asset-detail-panel {
  width: 440px;
  max-width: 100vw;
  background: #141416;
  border-left: 1px solid rgba(255,255,255,0.1);
  padding: 24px;
  overflow-y: auto;
  height: 100vh;
}

.detail-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}

.detail-name {
  font-size: 15px; font-weight: 800;
  color: white;
  word-break: break-all;
}

.detail-close {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.detail-close:hover { background: rgba(255,255,255,0.12); }

.detail-path-block {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
}

.detail-path {
  flex: 1;
  font-size: 11.5px;
  font-family: monospace;
  color: rgba(255,255,255,0.6);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.detail-desc {
  font-size: 13px; color: rgba(255,255,255,0.5);
  margin: 0 0 16px;
  line-height: 1.6;
}

.detail-section-label {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 10px;
}

/* ─── SNIPPET BLOCK ───────────── */
.snippet-tabs {
  display: flex; gap: 4px; flex-wrap: wrap;
  margin-bottom: 8px;
}

.snippet-tab {
  padding: 5px 12px; border-radius: 6px;
  font-size: 11px; font-weight: 600;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.45);
  cursor: pointer; transition: all 0.15s;
}
.snippet-tab.active {
  background: rgba(167,139,250,0.15);
  border-color: rgba(167,139,250,0.3);
  color: #a78bfa;
}

.snippet-block {
  position: relative;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  overflow: hidden;
}

.snippet-code {
  font-family: 'GeistMono', 'Fira Code', monospace;
  font-size: 11.5px;
  color: rgba(255,255,255,0.75);
  line-height: 1.6;
  margin: 0;
  padding: 14px 14px 14px;
  overflow-x: auto;
  white-space: pre;
}

.snippet-copy {
  position: absolute; top: 8px; right: 8px;
  display: flex; align-items: center; gap: 4px;
  padding: 4px 8px; border-radius: 6px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 11px; cursor: pointer;
  transition: all 0.15s;
}
.snippet-copy:hover { background: rgba(255,255,255,0.14); }
.snippet-copy.copied { background: rgba(34,197,94,0.15); color: #22c55e; }

/* ─── DISTRIBUTION INFO ───────── */
.distribution-info {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 16px;
}

.dist-step {
  display: flex; gap: 12px; align-items: flex-start;
}

.dist-num {
  width: 22px; height: 22px;
  border-radius: '50%'; border-radius: 50%;
  background: rgba(167,139,250,0.2);
  border: 1px solid rgba(167,139,250,0.3);
  color: #a78bfa;
  font-size: 11px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.dist-step-title {
  font-size: 12px; font-weight: 700;
  color: rgba(255,255,255,0.6);
  margin-bottom: 4px;
}

.dist-path {
  font-family: monospace; font-size: 11px;
  color: rgba(255,255,255,0.4);
  word-break: break-all;
}

.dist-arrow {
  font-size: 11px;
  color: rgba(255,255,255,0.2);
  text-align: center;
  padding: 8px 0;
}

/* ─── DROP ZONE GUIDE ─────────── */
.drop-zone-guide {
  margin: 24px 0;
  padding: 24px;
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.12);
  border-radius: 14px;
  text-align: center;
}

.drop-structure {
  margin-top: 16px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drop-row {
  display: flex; align-items: center; gap: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255,255,255,0.03);
}

.drop-dir {
  display: flex; align-items: center; gap: 6px;
  font-family: monospace; font-size: 12px;
  color: #a78bfa; font-weight: 700;
  min-width: 90px;
}

.drop-types {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
}

.inline-code {
  font-family: monospace;
  font-size: 12px;
  background: rgba(255,255,255,0.08);
  padding: 1px 6px;
  border-radius: 4px;
  color: #a78bfa;
}

/* ─── EMPTY STATE ─────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
  text-align: center;
}

.empty-state p { font-size: 14px; margin: 8px 0 0; }

/* ─── STATS BAR ───────────────── */
.asset-stats {
  display: flex; gap: 16px; flex-wrap: wrap;
  margin-top: 4px;
}

.asset-stat {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: rgba(255,255,255,0.4);
}

.asset-stat strong { color: rgba(255,255,255,0.75); }

/* ─── MOBILE ──────────────────── */
@media (max-width: 768px) {
  .asset-sidebar { display: none; }
  .asset-hub-header, .asset-toolbar { padding-left: 16px; padding-right: 16px; }
  .asset-content { padding: 16px; }
  .asset-grid { grid-template-columns: 1fr 1fr; }
  .asset-detail-panel { width: 100vw; }
}
/* @arkzen:style:end */

/* @arkzen:animation */
import { gsap } from 'gsap'
import React from 'react'

const assetHubAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.asset-hub-header',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.05 }
    )
    gsap.fromTo('.asset-cat-btn',
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out', delay: 0.2 }
    )
    gsap.fromTo('.asset-card',
      { opacity: 0, y: 16, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.35 }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
/* @arkzen:animation:end */

/* @arkzen:page:index */
/* @arkzen:page:layout:guest */

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

/* @arkzen:page:index:end */