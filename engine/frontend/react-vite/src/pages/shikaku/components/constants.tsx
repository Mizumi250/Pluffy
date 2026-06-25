// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — shikaku [React+Vite]
// Source: @arkzen:components (shikaku)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T01:17:01.427Z
// ============================================================

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Bucket, Check, ChevronDown, Circle, Copy, Crosshair, Download, Eraser, Eye, EyeOff, Film, FlipHorizontal, FlipVertical, Grid3x3, Layers, Lock, Minus, Move, Palette, Pause, Pencil, Pipette, Play, Plus, Redo2, RefreshCw, RotateCcw, Save, Settings, Share2, SkipBack, SkipForward, Sparkles, Square, Trash2, Type, Undo2, Unlock, X } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

export const PICO8_PALETTE = [
  '#000000','#1D2B53','#7E2553','#008751',
  '#AB5236','#5F574F','#C2C3C7','#FFF1E8',
  '#FF004D','#FFA300','#FFEC27','#00E436',
  '#29ADFF','#83769C','#FF77A8','#FFCCAA',
]

export const SWEETIE16_PALETTE = [
  '#1a1c2c','#5d275d','#b13e53','#ef7d57',
  '#ffcd75','#a7f070','#38b764','#257179',
  '#29366f','#3b5dc9','#41a6f6','#73eff7',
  '#f4f4f4','#94b0c2','#566c86','#333c57',
]

export const NES_PALETTE = [
  '#000000','#fcfcfc','#f8f8f8','#bcbcbc',
  '#7c7c7c','#a4e4fc','#3cbcfc','#0078f8',
  '#0000fc','#b8b8f8','#6888fc','#0058f8',
  '#00e8d8','#f8d878','#f83800','#e40058',
]

export const DEFAULT_PALETTES: Record<string, string[]> = {
  'Pico-8': PICO8_PALETTE,
  'Sweetie-16': SWEETIE16_PALETTE,
  'NES': NES_PALETTE,
}

// ─── Utils ────────────────────────────────────────────────────────────────────

// ─── Tool definitions ──────────────────────────────────────────────────────────

export const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'pencil',     icon: <Pencil size={15} />,       label: 'Pencil (B)' },
  { id: 'eraser',     icon: <Eraser size={15} />,       label: 'Eraser (E)' },
  { id: 'fill',       icon: <Bucket size={15} />,       label: 'Fill (G)' },
  { id: 'eyedropper', icon: <Pipette size={15} />,      label: 'Eyedropper (I)' },
  { id: 'move',       icon: <Move size={15} />,         label: 'Move (V)' },
  { id: 'line',       icon: <Minus size={15} />,        label: 'Line (L)' },
  { id: 'rect',       icon: <Square size={15} />,       label: 'Rectangle (U)' },
  { id: 'text',       icon: <Type size={15} />,         label: 'Text (T)' },
]
