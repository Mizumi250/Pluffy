// ============================================================
// ARKZEN GENERATED COMPONENT — PixiSection [React+Inertia]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:27:24.434Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from '@/arkzen/generated/visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { app, appRef, canvas, colors, g, label, mount, mountRef, renderer, shapes, stage, t } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: PIXI.JS ─────────────────────────────────────────────────────────
export const PixiSection = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    mount.innerHTML = ''

    import('pixi.js').then(async (PIXI) => {
      const app = new PIXI.Application()
      appRef.current = app
      await app.init({
        width: mount.clientWidth || 320,
        height: 220,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio,
      })
      mount.appendChild(app.canvas)

      // Animated polygons
      const colors = [0xa78bfa, 0x60a5fa, 0xf472b6, 0x34d399]
      const shapes: any[] = []
      for (let i = 0; i < 4; i++) {
        const g = new PIXI.Graphics()
        g.regularPoly(0, 0, 28 + i * 8, 3 + i)
        g.fill({ color: colors[i], alpha: 0.85 })
        g.x = 60 + i * 70
        g.y = 110
        app.stage.addChild(g)
        shapes.push({ g, speed: 0.02 + i * 0.01, phase: i * 0.8 })
      }

      // Text
      const label = new PIXI.Text({
        text: 'PixiJS v8 — WebGPU/WebGL2',
        style: { fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }
      })
      label.x = 10; label.y = 195
      app.stage.addChild(label)

      let t = 0
      app.ticker.add(() => {
        t += 0.04
        shapes.forEach(({ g, speed, phase }) => {
          g.rotation += speed
          g.y = 110 + Math.sin(t + phase) * 18
        })
      })

      return () => app.destroy(true)
    })

    return () => appRef.current?.destroy(true)
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Square size={20} />}
        title="PixiJS"
        subtitle="pixi.js@8.18 — WebGPU-first 2D renderer, Graphics API, Sprite, Text, Filters"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="PixiJS v8 — Animated Polygons" status="ok" note="Application v8 API, Graphics.regularPoly(), Ticker, Text — WebGPU/WebGL2 auto-select">
          <div ref={mountRef} className="vl-canvas-mount" />
        </DemoCard>
        <DemoCard title="PixiJS Features" status="info">
          <div className="vl-feature-list">
            {['WebGPU-first renderer', 'WebGL2 fallback', 'Graphics v8 API', 'Sprite batching', 'Filter system', 'Particle Container', 'Tween via gsap', 'Text/BitmapText'].map(f => (
              <div key={f} className="vl-feature-item"><Check size={12} color="#4ade80" /> {f}</div>
            ))}
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: KONVA ───────────────────────────────────────────────────────────
