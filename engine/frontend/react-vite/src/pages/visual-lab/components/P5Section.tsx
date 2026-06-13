// ============================================================
// ARKZEN GENERATED COMPONENT — P5Section [React+Vite]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T09:05:00.498Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { angle, mount, mountRef, n, point, pts, sketchRef, t } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: P5.JS ───────────────────────────────────────────────────────────
export const P5Section = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (sketchRef.current) { sketchRef.current.remove(); sketchRef.current = null }

    import('p5').then(({ default: P5 }) => {
      sketchRef.current = new P5((p: any) => {
        let t = 0
        const pts: { x: number; y: number; a: number; s: number }[] = []
        p.setup = () => {
          p.createCanvas(mount.clientWidth || 340, 220)
          p.colorMode(p.HSB, 360, 100, 100, 100)
          for (let i = 0; i < 60; i++) {
            pts.push({ x: p.random(p.width), y: p.random(p.height), a: p.random(360), s: p.random(0.5, 2) })
          }
        }
        p.draw = () => {
          p.background(240, 20, 8, 15)
          t += 0.015
          pts.forEach((pt, i) => {
            const n = p.noise(pt.x * 0.003, pt.y * 0.003, t)
            const angle = n * p.TWO_PI * 3
            pt.x += p.cos(angle) * pt.s
            pt.y += p.sin(angle) * pt.s
            if (pt.x < 0 || pt.x > p.width) pt.x = p.random(p.width)
            if (pt.y < 0 || pt.y > p.height) pt.y = p.random(p.height)
            p.stroke((i * 6 + t * 30) % 360, 80, 90, 70)
            p.strokeWeight(pt.s + 0.5)
            p.point(pt.x, pt.y)
          })
          p.noStroke()
          p.fill(0, 0, 100, 30)
          p.textSize(11)
          p.textFont('monospace')
          p.text('p5.js v2 — Perlin noise flow field', 8, p.height - 6)
        }
      }, mount)
    })

    return () => { sketchRef.current?.remove() }
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Activity size={20} />}
        title="p5.js"
        subtitle="p5@2.2 — creative coding, Perlin noise, flow fields, color modes, setup/draw loop"
        badge="Installed ✓"
      />
      <DemoCard title="p5.js — Perlin Noise Flow Field" status="ok" note="p5 v2 instance mode — noise(), colorMode(HSB), 60 particles following noise-driven angles">
        <div ref={mountRef} style={{ width: '100%' }} />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: OGL ─────────────────────────────────────────────────────────────
