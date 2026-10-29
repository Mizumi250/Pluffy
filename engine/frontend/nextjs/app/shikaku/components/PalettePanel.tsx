'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PalettePanel
// Source: @arkzen:components (shikaku)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:53.484Z
// ============================================================

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/arkzen/core/stores/authStore'
import { ArrowLeft, Check, ChevronDown, Circle, Copy, Crosshair, Download, Eraser, Eye, EyeOff, Film, FlipHorizontal, FlipVertical, Grid3x3, Layers, Lock, Minus, Move, PaintBucket as Bucket, Palette, Pause, Pencil, Pipette, Play, Plus, Redo2, RefreshCw, RotateCcw, Save, Settings, Share2, SkipBack, SkipForward, Sparkles, Square, Trash2, Type, Undo2, Unlock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DEFAULT_PALETTES } from './constants'
import type { CanvasEngineProps, Frame, Layer, LayerPanelProps, PalettePanelProps, Pixel, Project, Tool } from './types'

export const PalettePanel: React.FC<PalettePanelProps> = ({
  palette, primaryColor, onSelectColor, onAddColor, activePaletteName, onChangePalette,
}) => {
  const [hexEdit, setHexEdit] = useState(primaryColor)

  useEffect(() => { setHexEdit(primaryColor) }, [primaryColor])

  return (
    <div className="sk-panel">
      <div className="sk-panel-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Palette size={11} /> Palette
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <select
            style={{ background: '#0e0e1a', border: '1px solid #1e1e32', borderRadius: 4, color: '#5555aa', fontSize: 10, padding: '2px 4px' }}
            value={activePaletteName}
            onChange={e => onChangePalette(e.target.value)}
          >
            {Object.keys(DEFAULT_PALETTES).map(n => <option key={n}>{n}</option>)}
          </select>
          <button className="sk-panel-header-add" onClick={onAddColor} title="Add color">
            <Plus size={12} />
          </button>
        </div>
      </div>
      <div className="sk-palette-grid">
        {palette.map((hex, i) => (
          <div
            key={i}
            className={`sk-pal-swatch ${hex === primaryColor ? 'selected' : ''}`}
            style={{ background: hex }}
            onClick={() => onSelectColor(hex)}
            title={hex}
          />
        ))}
      </div>
      <div className="sk-color-hex">
        <div className="sk-hex-dot" style={{ background: primaryColor }} />
        <input
          className="sk-hex-input"
          value={hexEdit}
          onChange={e => setHexEdit(e.target.value)}
          onBlur={() => {
            const clean = hexEdit.startsWith('#') ? hexEdit : `#${hexEdit}`
            if (/^#[0-9a-fA-F]{6}$/.test(clean)) onSelectColor(clean)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const clean = hexEdit.startsWith('#') ? hexEdit : `#${hexEdit}`
              if (/^#[0-9a-fA-F]{6}$/.test(clean)) onSelectColor(clean)
            }
          }}
        />
        <Pipette size={12} style={{ color: '#5555aa', cursor: 'pointer' }} />
      </div>
    </div>
  )
}

// ─── Tool definitions ──────────────────────────────────────────────────────────
