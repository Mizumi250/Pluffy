// ============================================================
// ARKZEN GENERATED ISLAND — shikaku/editor
// React island component. Hydrated with client:load in .astro page shell.
// Layout: +auth | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:14.200Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { CanvasEngine } from '@/arkzen/generated/components/shikaku/CanvasEngine'
import { LayerPanel } from '@/arkzen/generated/components/shikaku/LayerPanel'
import { PalettePanel } from '@/arkzen/generated/components/shikaku/PalettePanel'
import { DEFAULT_PALETTES, PICO8_PALETTE, TOOLS } from '@/arkzen/generated/components/shikaku/constants'
import type { Frame, Layer, Pixel, Project, Tool } from '@/arkzen/generated/components/shikaku/types'
import { createEmptyFrame, createEmptyLayer, flattenFrame, renderFrameThumb, skFetch } from '@/arkzen/generated/components/shikaku/utils'
import { pageVariants } from '@/arkzen/generated/shikaku.animations'
import { ArrowLeft, Check, ChevronDown, Circle, Copy, Crosshair, Download, Eraser, Eye, EyeOff, Film, FlipHorizontal, FlipVertical, Grid3x3, Layers, Lock, Minus, Move, PaintBucket as Bucket, Palette, Pause, Pencil, Pipette, Play, Plus, Redo2, RefreshCw, RotateCcw, Save, Settings, Share2, SkipBack, SkipForward, Sparkles, Square, Trash2, Type, Undo2, Unlock, X } from 'lucide-react'

// Page component code (from @arkzen:page:editor)
const EditorPage = () => {
  const router = useArkzenRouter()

  // ── State ──────────────────────────────────────────────────────────────────
  const [project, setProject] = useState<Project | null>(null)
  const [frames, setFrames] = useState<Frame[]>([])
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
  const [currentLayerIdx, setCurrentLayerIdx] = useState(0)
  const [tool, setTool] = useState<Tool>('pencil')
  const [primaryColor, setPrimaryColor] = useState('#4f8ef7')
  const [secondaryColor, setSecondaryColor] = useState('#000000')
  const [zoom, setZoom] = useState(8)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [palette, setPalette] = useState<string[]>(PICO8_PALETTE)
  const [activePalette, setActivePalette] = useState('Pico-8')
  const [showGrid, setShowGrid] = useState(true)
  const [onionSkin, setOnionSkin] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'draw'|'animate'|'tiles'|'fx'|'preview'>('draw')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [undoStack, setUndoStack] = useState<Frame[][]>([])
  const [redoStack, setRedoStack] = useState<Frame[][]>([])
  const [canvasInfo, setCanvasInfo] = useState({ x: 0, y: 0, zoom: 8 })
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Get project id from URL ────────────────────────────────────────────────
  const projectId = typeof window !== 'undefined'
    ? window.location.pathname.split('/').pop()
    : null

  // ── Load project ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return
    skFetch(`/api/shikaku/projects/${projectId}`)
      .then(d => {
        const p = d.data ?? d
        setProject(p)
        return skFetch(`/api/shikaku/projects/${projectId}/latest`)
      })
      .then(s => {
        if (s?.data?.frames_json) {
          try {
            const parsed = JSON.parse(s.data.frames_json)
            setFrames(parsed)
          } catch {
            initBlankCanvas()
          }
        } else {
          initBlankCanvas()
        }
      })
      .catch(() => initBlankCanvas())
  }, [projectId])

  const initBlankCanvas = () => {
    setFrames([createEmptyFrame(32, 32)])
  }

  // ── Auto-save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setSaved(false)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => { handleSave() }, 3000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [frames])

  const handleSave = async () => {
    if (!projectId || !project) return
    setSaving(true)
    try {
      const thumb = frames[0] && project
        ? renderFrameThumb(frames[0], project.width, project.height, 128)
        : null
      await skFetch(`/api/shikaku/projects/${projectId}/save`, {
        method: 'POST',
        body: JSON.stringify({ frames_json: JSON.stringify(frames) }),
      })
      if (thumb) {
        await skFetch(`/api/shikaku/projects/${projectId}`, {
          method: 'PUT',
          body: JSON.stringify({ thumbnail: thumb }),
        })
      }
      setSaved(true)
    } catch {}
    setSaving(false)
  }

  // ── Undo/Redo ──────────────────────────────────────────────────────────────
  const pushUndo = (prev: Frame[]) => {
    setUndoStack(s => [...s.slice(-40), prev])
    setRedoStack([])
  }

  const undo = () => {
    if (!undoStack.length) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack(s => [frames, ...s])
    setFrames(prev)
    setUndoStack(s => s.slice(0, -1))
  }

  const redo = () => {
    if (!redoStack.length) return
    const next = redoStack[0]
    setUndoStack(s => [...s, frames])
    setFrames(next)
    setRedoStack(s => s.slice(1))
  }

  // ── Pixel change ───────────────────────────────────────────────────────────
  const onPixelChange = useCallback((frameIdx: number, layerIdx: number, pixels: Pixel) => {
    setFrames(prev => {
      pushUndo(prev)
      const next = prev.map((f, fi) => fi !== frameIdx ? f : {
        ...f,
        layers: f.layers.map((l, li) => li !== layerIdx ? l : { ...l, pixels }),
      })
      return next
    })
  }, [])

  // ── Layer ops ──────────────────────────────────────────────────────────────
  const addLayer = () => {
    setFrames(prev => {
      pushUndo(prev)
      return prev.map((f, fi) => fi !== currentFrameIdx ? f : {
        ...f,
        layers: [...f.layers, createEmptyLayer(`Layer ${f.layers.length + 1}`)],
      })
    })
  }

  const deleteLayer = (idx: number) => {
    const frame = frames[currentFrameIdx]
    if (frame.layers.length <= 1) return
    setFrames(prev => {
      pushUndo(prev)
      return prev.map((f, fi) => fi !== currentFrameIdx ? f : {
        ...f,
        layers: f.layers.filter((_, li) => li !== idx),
      })
    })
    if (currentLayerIdx >= idx && currentLayerIdx > 0) setCurrentLayerIdx(i => i - 1)
  }

  const toggleVisible = (idx: number) => {
    setFrames(prev => prev.map((f, fi) => fi !== currentFrameIdx ? f : {
      ...f,
      layers: f.layers.map((l, li) => li !== idx ? l : { ...l, visible: !l.visible }),
    }))
  }

  const toggleLock = (idx: number) => {
    setFrames(prev => prev.map((f, fi) => fi !== currentFrameIdx ? f : {
      ...f,
      layers: f.layers.map((l, li) => li !== idx ? l : { ...l, locked: !l.locked }),
    }))
  }

  const setBlendMode = (idx: number, mode: string) => {
    setFrames(prev => prev.map((f, fi) => fi !== currentFrameIdx ? f : {
      ...f,
      layers: f.layers.map((l, li) => li !== idx ? l : { ...l, blendMode: mode }),
    }))
  }

  const setOpacity = (idx: number, v: number) => {
    setFrames(prev => prev.map((f, fi) => fi !== currentFrameIdx ? f : {
      ...f,
      layers: f.layers.map((l, li) => li !== idx ? l : { ...l, opacity: v }),
    }))
  }

  // ── Frame ops ──────────────────────────────────────────────────────────────
  const addFrame = () => {
    const w = project?.width ?? 32
    const h = project?.height ?? 32
    setFrames(prev => {
      pushUndo(prev)
      return [...prev, createEmptyFrame(w, h)]
    })
    setCurrentFrameIdx(frames.length)
  }

  const deleteFrame = (idx: number) => {
    if (frames.length <= 1) return
    setFrames(prev => {
      pushUndo(prev)
      return prev.filter((_, i) => i !== idx)
    })
    if (currentFrameIdx >= idx && currentFrameIdx > 0) setCurrentFrameIdx(i => i - 1)
  }

  // ── Playback ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        setCurrentFrameIdx(i => (i + 1) % frames.length)
      }, frames[currentFrameIdx]?.duration ?? 100)
    } else {
      if (playTimer.current) clearInterval(playTimer.current)
    }
    return () => { if (playTimer.current) clearInterval(playTimer.current) }
  }, [isPlaying, frames.length, currentFrameIdx])

  // ── Palette ops ────────────────────────────────────────────────────────────
  const onChangePalette = (name: string) => {
    setActivePalette(name)
    setPalette(DEFAULT_PALETTES[name] ?? PICO8_PALETTE)
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey||e.ctrlKey) && e.key==='z') { e.preventDefault(); if(e.shiftKey) redo(); else undo() }
      if (!e.metaKey && !e.ctrlKey) {
        if (e.key==='b') setTool('pencil')
        if (e.key==='e') setTool('eraser')
        if (e.key==='g') setTool('fill')
        if (e.key==='i') setTool('eyedropper')
        if (e.key==='v') setTool('move')
        if (e.key==='l') setTool('line')
        if (e.key==='u') setTool('rect')
        if (e.key==='t') setTool('text')
        if (e.key==='[') setZoom(z => Math.max(1, Math.round(z / 1.5)))
        if (e.key===']') setZoom(z => Math.min(64, Math.round(z * 1.5)))
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [undoStack, redoStack])

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportPng = () => {
    const w = project?.width ?? 32
    const h = project?.height ?? 32
    const frame = frames[currentFrameIdx]
    if (!frame) return
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const ctx = c.getContext('2d')!
    ctx.putImageData(flattenFrame(frame, w, h), 0, 0)
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `${project?.name ?? 'shikaku'}.png`
    a.click()
  }

  const currentFrame = frames[currentFrameIdx]

  if (!project) {
    return <div className="sk-loading"><div className="sk-spinner" /></div>
  }

  return (
    <div className="sk-editor">
      {/* ── Topbar ── */}
      <div className="sk-editor-topbar">
        <div className="sk-editor-topbar-left">
          <button className="sk-topbar-btn" onClick={() => router.push('/shikaku')} title="Back">
            <ArrowLeft size={15} />
          </button>
          <div className="sk-save-dot" style={{ background: saved ? '#22c55e' : '#f59e0b' }} title={saved ? 'Saved' : 'Unsaved changes'} />
        </div>

        <div className="sk-editor-topbar-center">
          <button className="sk-topbar-btn" onClick={undo} disabled={!undoStack.length} title="Undo (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button className="sk-topbar-btn" onClick={redo} disabled={!redoStack.length} title="Redo (Ctrl+Shift+Z)">
            <Redo2 size={14} />
          </button>
          <input
            className="sk-project-title-input"
            value={project.name}
            onChange={e => setProject(p => p ? { ...p, name: e.target.value } : p)}
            onBlur={async e => {
              try {
                await skFetch(`/api/shikaku/projects/${projectId}`, {
                  method: 'PUT',
                  body: JSON.stringify({ name: e.target.value }),
                })
              } catch {}
            }}
          />
        </div>

        <div className="sk-editor-topbar-right">
          <button className="sk-topbar-btn" onClick={() => setShowGrid(g => !g)} title="Toggle grid">
            <Grid3x3 size={14} style={{ color: showGrid ? '#4f8ef7' : undefined }} />
          </button>
          <button className="sk-topbar-btn" onClick={exportPng} title="Export PNG">
            <Download size={14} />
          </button>
          <button
            className="sk-topbar-btn"
            onClick={handleSave}
            title="Save"
            style={{ color: saving ? '#4f8ef7' : undefined }}
          >
            {saving ? <RefreshCw size={14} style={{ animation: 'sk-spin 1s linear infinite' }} /> : <Save size={14} />}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="sk-editor-body">
        {/* ── Left: Toolbar ── */}
        <div className="sk-toolbar">
          {TOOLS.map((t, i) => (
            <React.Fragment key={t.id}>
              {i === 4 && <div className="sk-tool-sep" />}
              <button
                className={`sk-tool-btn ${tool === t.id ? 'active' : ''}`}
                onClick={() => setTool(t.id)}
                title={t.label}
              >
                {t.icon}
              </button>
            </React.Fragment>
          ))}

          <div className="sk-tool-sep" />

          {/* Color swatches */}
          <div className="sk-color-swatches">
            <div
              className="sk-swatch-secondary"
              style={{ background: secondaryColor }}
              onClick={() => { const tmp = primaryColor; setPrimaryColor(secondaryColor); setSecondaryColor(tmp) }}
              title="Secondary color (click to swap)"
            />
            <div
              className="sk-swatch-primary"
              style={{ background: primaryColor }}
              title="Primary color"
            />
          </div>
        </div>

        {/* ── Center: Canvas ── */}
        {currentFrame && (
          <CanvasEngine
            frames={frames}
            currentFrameIdx={currentFrameIdx}
            currentLayerIdx={currentLayerIdx}
            tool={tool}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            zoom={zoom}
            pan={pan}
            onPanChange={setPan}
            onZoomChange={setZoom}
            onPixelChange={onPixelChange}
            onColorPick={setPrimaryColor}
            onZoomInfo={setCanvasInfo}
            width={project.width}
            height={project.height}
            showGrid={showGrid}
            onionSkin={onionSkin}
          />
        )}

        {/* ── Info bar overlay ── */}
        <div className="sk-canvas-info" style={{ position: 'absolute', bottom: 130, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
          <span>{canvasInfo.x},{canvasInfo.y}</span>
          <span>{project.width}×{project.height}</span>
          <span>{Math.round(zoom)}×</span>
        </div>

        {/* ── Right: Panels ── */}
        <div className="sk-panels">
          <PalettePanel
            palette={palette}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onSelectColor={setPrimaryColor}
            onAddColor={() => setPalette(p => [...p, primaryColor])}
            activePaletteName={activePalette}
            onChangePalette={onChangePalette}
          />
          {currentFrame && (
            <LayerPanel
              layers={currentFrame.layers}
              currentIdx={currentLayerIdx}
              onSelect={setCurrentLayerIdx}
              onToggleVisible={toggleVisible}
              onToggleLock={toggleLock}
              onAdd={addLayer}
              onDelete={deleteLayer}
              onDuplicate={idx => {}}
              onOpacityChange={setOpacity}
              onBlendChange={setBlendMode}
            />
          )}
        </div>
      </div>

      {/* ── Bottom: Tabs + Timeline ── */}
      <div className="sk-editor-bottom">
        <div className="sk-bottom-tabs">
          {(['draw','animate','tiles','fx','preview'] as const).map(tab => (
            <button
              key={tab}
              className={`sk-bottom-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'draw' && <Pencil size={11} />}
              {tab === 'animate' && <Film size={11} />}
              {tab === 'tiles' && <Grid3x3 size={11} />}
              {tab === 'fx' && <Sparkles size={11} />}
              {tab === 'preview' && <Play size={11} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="sk-timeline">
          <div className="sk-timeline-controls">
            <button className="sk-tl-btn" onClick={() => setCurrentFrameIdx(0)} title="First frame">
              <SkipBack size={13} />
            </button>
            <button
              className={`sk-tl-btn ${isPlaying ? 'playing' : ''}`}
              onClick={() => setIsPlaying(p => !p)}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button className="sk-tl-btn" onClick={() => setCurrentFrameIdx(frames.length - 1)} title="Last frame">
              <SkipForward size={13} />
            </button>
          </div>

          <button
            className={`sk-onion-btn ${onionSkin ? 'on' : ''}`}
            onClick={() => setOnionSkin(o => !o)}
            title="Onion skinning"
          >
            👁 Onion
          </button>

          <div className="sk-frames-row">
            {frames.map((frame, idx) => (
              <div
                key={frame.id}
                className={`sk-frame-thumb ${idx === currentFrameIdx ? 'active' : ''}`}
                onClick={() => setCurrentFrameIdx(idx)}
                onContextMenu={e => { e.preventDefault(); deleteFrame(idx) }}
                title={`Frame ${idx + 1} — right-click to delete`}
              >
                <span className="sk-frame-num">{idx + 1}</span>
              </div>
            ))}
            <button className="sk-frame-add" onClick={addFrame} title="Add frame">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_Shikaku_Editor = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <AuthLayout requireAuth={true}>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <EditorPage />
      </motion.div>
    </AuthLayout>
  )
}

export default ArkzenIsland_Shikaku_Editor
