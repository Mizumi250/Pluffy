'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — CanvasEngine
// Source: @arkzen:components (shikaku)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:46.695Z
// ============================================================

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, ChevronDown, Circle, Copy, Crosshair, Download, Eraser, Eye, EyeOff, Film, FlipHorizontal, FlipVertical, Grid3x3, Layers, Lock, Minus, Move, PaintBucket as Bucket, Palette, Pause, Pencil, Pipette, Play, Plus, Redo2, RefreshCw, RotateCcw, Save, Settings, Share2, SkipBack, SkipForward, Sparkles, Square, Trash2, Type, Undo2, Unlock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { drawLine, flattenFrame, floodFill } from './utils'
import type { CanvasEngineProps, Frame, Layer, LayerPanelProps, PalettePanelProps, Pixel, Project, Tool } from './types'

export const CanvasEngine: React.FC<CanvasEngineProps> = ({
  frames, currentFrameIdx, currentLayerIdx,
  tool, primaryColor, zoom, pan,
  onPanChange, onZoomChange, onPixelChange, onColorPick, onZoomInfo,
  width, height, showGrid, onionSkin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<[number,number] | null>(null)
  const lineStart = useRef<[number,number] | null>(null)
  const spaceDown = useRef(false)
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)
  const lastTouches = useRef<React.TouchList | null>(null)
  const lastPinchDist = useRef<number | null>(null)

  const pixelAt = useCallback((clientX: number, clientY: number): [number, number] | null => {
    const c = canvasRef.current
    if (!c) return null
    const rect = c.getBoundingClientRect()
    const px = Math.floor((clientX - rect.left) / zoom)
    const py = Math.floor((clientY - rect.top) / zoom)
    if (px < 0 || py < 0 || px >= width || py >= height) return null
    return [px, py]
  }, [zoom, width, height])

  // ── Render ─────────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const c = canvasRef.current
    if (!c) return
    c.width = width
    c.height = height
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    // Onion skin: previous frame ghost
    if (onionSkin && currentFrameIdx > 0) {
      const prev = frames[currentFrameIdx - 1]
      const id = flattenFrame(prev, width, height)
      const tmp = document.createElement('canvas')
      tmp.width = width; tmp.height = height
      tmp.getContext('2d')!.putImageData(id, 0, 0)
      ctx.globalAlpha = 0.25
      ctx.drawImage(tmp, 0, 0)
      ctx.globalAlpha = 1
    }

    const frame = frames[currentFrameIdx]
    if (frame) {
      const id = flattenFrame(frame, width, height)
      ctx.putImageData(id, 0, 0)
    }

    // Grid
    if (showGrid && zoom >= 4) {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 0.5 / zoom
      for (let x = 0; x <= width; x++) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
      }
      for (let y = 0; y <= height; y++) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
      }
      ctx.restore()
    }
  }, [frames, currentFrameIdx, zoom, showGrid, onionSkin, width, height])

  // ── Draw ───────────────────────────────────────────────────────────────────
  const applyTool = useCallback((px: number, py: number, endPx?: number, endPy?: number) => {
    const frame = frames[currentFrameIdx]
    if (!frame) return
    const layer = frame.layers[currentLayerIdx]
    if (!layer || layer.locked) return
    const key = `${px},${py}`

    let newPixels = { ...layer.pixels }

    if (tool === 'pencil') {
      if (endPx !== undefined && endPy !== undefined) {
        drawLine(px, py, endPx, endPy).forEach(([x,y]) => {
          newPixels[`${x},${y}`] = primaryColor
        })
      } else {
        newPixels[key] = primaryColor
      }
    } else if (tool === 'eraser') {
      if (endPx !== undefined && endPy !== undefined) {
        drawLine(px, py, endPx, endPy).forEach(([x,y]) => {
          delete newPixels[`${x},${y}`]
        })
      } else {
        delete newPixels[key]
      }
    } else if (tool === 'fill') {
      const target = layer.pixels[key]
      newPixels = floodFill(newPixels, px, py, target, primaryColor, width, height)
    } else if (tool === 'eyedropper') {
      const color = layer.pixels[key] || '#00000000'
      onColorPick(color.startsWith('#') ? color : primaryColor)
      return
    } else if (tool === 'line') {
      if (lineStart.current) {
        newPixels = { ...layer.pixels }
        drawLine(lineStart.current[0], lineStart.current[1], px, py).forEach(([x,y]) => {
          newPixels[`${x},${y}`] = primaryColor
        })
      }
    } else if (tool === 'rect') {
      if (lineStart.current) {
        newPixels = { ...layer.pixels }
        const [sx,sy] = lineStart.current
        for (let x = Math.min(sx,px); x <= Math.max(sx,px); x++) {
          newPixels[`${x},${sy}`] = primaryColor
          newPixels[`${x},${py}`] = primaryColor
        }
        for (let y = Math.min(sy,py); y <= Math.max(sy,py); y++) {
          newPixels[`${sx},${y}`] = primaryColor
          newPixels[`${px},${y}`] = primaryColor
        }
      }
    }

    onPixelChange(currentFrameIdx, currentLayerIdx, newPixels)
  }, [frames, currentFrameIdx, currentLayerIdx, tool, primaryColor, width, height, onColorPick, onPixelChange])

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || spaceDown.current) {
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
      return
    }
    drawing.current = true
    const pos = pixelAt(e.clientX, e.clientY)
    if (!pos) return
    lastPos.current = pos
    if (tool === 'line' || tool === 'rect') {
      lineStart.current = pos
    }
    applyTool(pos[0], pos[1])
  }, [pan, pixelAt, tool, applyTool])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (panStart.current) {
      const dx = e.clientX - panStart.current.mx
      const dy = e.clientY - panStart.current.my
      onPanChange({ x: panStart.current.px + dx, y: panStart.current.py + dy })
      return
    }
    const pos = pixelAt(e.clientX, e.clientY)
    if (pos) {
      onZoomInfo({ x: pos[0], y: pos[1], zoom })
    }
    if (!drawing.current || !pos) return
    if (tool === 'pencil' || tool === 'eraser') {
      if (lastPos.current) {
        applyTool(lastPos.current[0], lastPos.current[1], pos[0], pos[1])
      }
    } else if (tool === 'line' || tool === 'rect') {
      applyTool(pos[0], pos[1])
    }
    lastPos.current = pos
  }, [pixelAt, drawing, pan, zoom, tool, applyTool, onPanChange, onZoomInfo])

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    panStart.current = null
    drawing.current = false
    lineStart.current = null
    lastPos.current = null
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 1.2 : 0.85
    const next = Math.min(64, Math.max(1, zoom * delta))
    onZoomChange(next)
  }, [zoom, onZoomChange])

  // Touch (pinch-to-zoom + draw)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    lastTouches.current = e.touches
    if (e.touches.length === 1) {
      drawing.current = true
      const t = e.touches[0]
      const pos = pixelAt(t.clientX, t.clientY)
      if (pos) { lastPos.current = pos; applyTool(pos[0], pos[1]) }
    } else if (e.touches.length === 2) {
      drawing.current = false
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.hypot(dx, dy)
    }
  }, [pixelAt, applyTool])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2 && lastPinchDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const ratio = dist / lastPinchDist.current
      const next = Math.min(64, Math.max(1, zoom * ratio))
      onZoomChange(next)
      lastPinchDist.current = dist
    } else if (e.touches.length === 1 && drawing.current) {
      const t = e.touches[0]
      const pos = pixelAt(t.clientX, t.clientY)
      if (!pos) return
      if (lastPos.current && (tool === 'pencil' || tool === 'eraser')) {
        applyTool(lastPos.current[0], lastPos.current[1], pos[0], pos[1])
      } else {
        applyTool(pos[0], pos[1])
      }
      lastPos.current = pos
    }
  }, [zoom, pixelAt, tool, applyTool, onZoomChange])

  const onTouchEnd = useCallback(() => {
    drawing.current = false
    lastPos.current = null
    lastPinchDist.current = null
  }, [])

  return (
    <div
      ref={containerRef}
      className="sk-canvas-area"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ cursor: tool === 'move' ? 'grab' : tool === 'eyedropper' ? 'crosshair' : 'crosshair' }}
    >
      <div
        className="sk-canvas-wrap"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          animation: 'sk-pixel-scatter 0.4s ease-out',
        }}
      >
        <canvas
          ref={canvasRef}
          className="sk-canvas-main"
          style={{
            width: width * zoom,
            height: height * zoom,
            imageRendering: 'pixelated',
          }}
        />
      </div>
    </div>
  )
}

// ─── Layer Panel ───────────────────────────────────────────────────────────────
