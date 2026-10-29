'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — FabricSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:09:08.695Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from '@/arkzen/generated/visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import type { VisualLabState } from './types'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: FABRIC.JS ───────────────────────────────────────────────────────
export const FabricSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return

    import('fabric').then(({ Canvas, Rect, Circle, Ellipse, IText, FabricText, Gradient }) => {
      if (fabricRef.current) fabricRef.current.dispose()

      const canvas = new Canvas(el, { width: 400, height: 220, backgroundColor: 'transparent' })
      fabricRef.current = canvas

      // Gradient rect
      const rect = new Rect({
        left: 20, top: 60, width: 100, height: 80,
        fill: new Gradient({
          type: 'linear',
          coords: { x1: 0, y1: 0, x2: 100, y2: 0 },
          colorStops: [{ offset: 0, color: '#a78bfa' }, { offset: 1, color: '#60a5fa' }]
        }),
        rx: 12, ry: 12, selectable: true,
        shadow: { color: 'rgba(167,139,250,0.5)', blur: 12, offsetX: 0, offsetY: 4 } as any,
      })

      const circle = new Circle({
        left: 150, top: 70, radius: 45,
        fill: '#f472b6', opacity: 0.85,
        selectable: true,
      })

      const ellipse = new Ellipse({
        left: 250, top: 80, rx: 55, ry: 35,
        fill: '#34d399', opacity: 0.7,
        angle: -15, selectable: true,
      })

      const itext = new IText('Click to edit ✏️', {
        left: 20, top: 170, fontSize: 13,
        fill: 'rgba(255,255,255,0.6)',
        fontFamily: 'monospace',
      })

      canvas.add(rect, circle, ellipse, itext)
      canvas.renderAll()

      return () => canvas.dispose()
    })

    return () => fabricRef.current?.dispose()
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Palette size={20} />}
        title="Fabric.js"
        subtitle="fabric@7.4 — interactive object canvas, IText, Gradient, Shadow, Groups, Filters"
        badge="Installed ✓"
      />
      <DemoCard title="Fabric Canvas — Gradient Rect, Circle, Ellipse, IText" status="ok" note="Click shapes to select/transform. Double-click the text to edit inline.">
        <canvas ref={canvasRef} />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: P5.JS ───────────────────────────────────────────────────────────
