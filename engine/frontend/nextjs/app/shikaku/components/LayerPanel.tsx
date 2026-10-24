'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — LayerPanel
// Source: @arkzen:components (shikaku)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:53.678Z
// ============================================================

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/arkzen/core/stores/authStore'
import { ArrowLeft, Check, ChevronDown, Circle, Copy, Crosshair, Download, Eraser, Eye, EyeOff, Film, FlipHorizontal, FlipVertical, Grid3x3, Layers, Lock, Minus, Move, PaintBucket as Bucket, Palette, Pause, Pencil, Pipette, Play, Plus, Redo2, RefreshCw, RotateCcw, Save, Settings, Share2, SkipBack, SkipForward, Sparkles, Square, Trash2, Type, Undo2, Unlock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { CanvasEngineProps, Frame, Layer, LayerPanelProps, PalettePanelProps, Pixel, Project, Tool } from './types'

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers, currentIdx, onSelect, onToggleVisible, onToggleLock,
  onAdd, onDelete, onDuplicate, onOpacityChange, onBlendChange,
}) => {
  return (
    <div className="sk-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="sk-panel-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Layers size={11} /> Layers
        </span>
        <button className="sk-panel-header-add" onClick={onAdd} title="Add layer">
          <Plus size={12} />
        </button>
      </div>
      <div className="sk-layers-list">
        {layers.map((layer, idx) => (
          <div
            key={layer.id}
            className={`sk-layer-item ${idx === currentIdx ? 'active' : ''}`}
            onClick={() => onSelect(idx)}
          >
            <button
              className="sk-layer-eye"
              onClick={e => { e.stopPropagation(); onToggleVisible(idx) }}
            >
              {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <div className="sk-layer-thumb" />
            <span className="sk-layer-name">{layer.name}</span>
            <span className="sk-layer-opacity">{layer.opacity}%</span>
          </div>
        ))}
      </div>
      {layers[currentIdx] && (
        <div className="sk-blend-row">
          <span className="sk-blend-label">Blend</span>
          <select
            className="sk-blend-select"
            value={layers[currentIdx].blendMode}
            onChange={e => onBlendChange(currentIdx, e.target.value)}
          >
            {['normal','multiply','screen','overlay','add','difference'].map(m => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

// ─── Palette Panel ─────────────────────────────────────────────────────────────
