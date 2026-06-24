// ============================================================
// ARKZEN GENERATED UTILITIES — shikaku [React+Vite]
// Source: @arkzen:components (shikaku)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-24T16:49:36.992Z
// ============================================================

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Bucket, Check, ChevronDown, Circle, Copy, Crosshair, Download, Eraser, Eye, EyeOff, Film, FlipHorizontal, FlipVertical, Grid3x3, Layers, Lock, Minus, Move, Palette, Pause, Pencil, Pipette, Play, Plus, Redo2, RefreshCw, RotateCcw, Save, Settings, Share2, SkipBack, SkipForward, Sparkles, Square, Trash2, Type, Undo2, Unlock, X } from 'lucide-react'

// ─── Utils ────────────────────────────────────────────────────────────────────

export function createEmptyLayer(name: string, id?: string): Layer {
  return {
    id: id ?? `layer-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    name,
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    pixels: {},
  }
}

export function createEmptyFrame(width: number, height: number, id?: string): Frame {
  return {
    id: id ?? `frame-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    duration: 100,
    layers: [
      createEmptyLayer('Color'),
      createEmptyLayer('Line'),
    ],
  }
}

export function floodFill(
  pixels: Pixel,
  x: number,
  y: number,
  targetColor: string | undefined,
  fillColor: string,
  width: number,
  height: number
): Pixel {
  if (targetColor === fillColor) return pixels
  const result = { ...pixels }
  const stack = [[x, y]]
  const key = (cx: number, cy: number) => `${cx},${cy}`
  const visited = new Set<string>()
  while (stack.length) {
    const [cx, cy] = stack.pop()!
    const k = key(cx, cy)
    if (visited.has(k)) continue
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue
    const cur = result[k]
    if (cur !== targetColor) continue
    visited.add(k)
    result[k] = fillColor
    stack.push([cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1])
  }
  return result
}

export function drawLine(x0: number, y0: number, x1: number, y1: number): [number,number][] {
  const pts: [number,number][] = []
  let dx = Math.abs(x1-x0), dy = Math.abs(y1-y0)
  let sx = x0<x1?1:-1, sy = y0<y1?1:-1, err = dx-dy
  while(true) {
    pts.push([x0,y0])
    if(x0===x1&&y0===y1) break
    let e2=2*err
    if(e2>-dy){err-=dy;x0+=sx}
    if(e2<dx){err+=dx;y0+=sy}
  }
  return pts
}

// Render all visible layers to a flat RGBA Uint8ClampedArray

// Render all visible layers to a flat RGBA Uint8ClampedArray
export function flattenFrame(frame: Frame, width: number, height: number): ImageData {
  const buf = new Uint8ClampedArray(width * height * 4)
  // Checkerboard
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y*width+x)*4
      const light = (x+y)%2===0
      buf[i]   = light ? 200 : 160
      buf[i+1] = light ? 200 : 160
      buf[i+2] = light ? 200 : 160
      buf[i+3] = 255
    }
  }
  for (const layer of [...frame.layers].reverse()) {
    if (!layer.visible) continue
    const alpha = layer.opacity / 100
    for (const [key, hex] of Object.entries(layer.pixels)) {
      const [x, y] = key.split(',').map(Number)
      if (x<0||y<0||x>=width||y>=height) continue
      const i=(y*width+x)*4
      const r=parseInt(hex.slice(1,3),16)
      const g=parseInt(hex.slice(3,5),16)
      const b=parseInt(hex.slice(5,7),16)
      buf[i]  =Math.round(buf[i]*(1-alpha)+r*alpha)
      buf[i+1]=Math.round(buf[i+1]*(1-alpha)+g*alpha)
      buf[i+2]=Math.round(buf[i+2]*(1-alpha)+b*alpha)
      buf[i+3]=255
    }
  }
  return new ImageData(buf, width, height)
}

// Render a frame to a small canvas for thumbnails

// Render a frame to a small canvas for thumbnails
export function renderFrameThumb(frame: Frame, width: number, height: number, size: number): string {
  const c = document.createElement('canvas')
  c.width = width; c.height = height
  const ctx = c.getContext('2d')!
  const id = flattenFrame(frame, width, height)
  ctx.putImageData(id, 0, 0)
  const out = document.createElement('canvas')
  out.width = size; out.height = size
  const oc = out.getContext('2d')!
  oc.imageSmoothingEnabled = false
  oc.drawImage(c, 0, 0, width, height, 0, 0, size, size)
  return out.toDataURL('image/png')
}

// arkzen fetch helper

// arkzen fetch helper
export async function skFetch(url: string, options?: RequestInit) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const token = typeof window !== 'undefined' ? localStorage.getItem('shikaku_token') : null
  const res = await fetch(`${base}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
