'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — UXSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T08:48:16.293Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'

// ─── SECTION: VANILLA TILT + LENIS + CONFETTI ─────────────────────────────────
export const UXSection = () => {
  const tiltRef = useRef<HTMLDivElement>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const el = tiltRef.current
    if (!el) return
    let instance: any = null

    import('vanilla-tilt').then((VT) => {
      const VanillaTilt = (VT as any).default || VT
      VanillaTilt.init(el, {
        max: 25, speed: 400, glare: true, 'max-glare': 0.35,
        perspective: 800, scale: 1.04,
      })
      instance = (el as any).vanillaTilt
    })

    return () => instance?.destroy()
  }, [resetKey])

  const fireConfetti = useCallback(() => {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#a78bfa', '#60a5fa', '#f472b6', '#34d399'] })
      setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }), 250)
      setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 400)
    })
  }, [])

  const initLenis = useCallback(() => {
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
      const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
      requestAnimationFrame(raf)
      // Destroy after 3s to not conflict with page scroll
      setTimeout(() => lenis.destroy(), 3000)
    })
  }, [])

  return (
    <div>
      <SectionHeader
        icon={<MousePointer2 size={20} />}
        title="Vanilla Tilt · Lenis · Canvas Confetti"
        subtitle="vanilla-tilt@1.8 · lenis@1.3 · canvas-confetti@1.9 — 3D tilt, smooth scroll, celebration FX"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="Vanilla Tilt — 3D Card Tilt" status="ok" note="VanillaTilt.init — max, speed, glare, perspective, scale options. Hover the card.">
          <div className="vl-tilt-stage">
            <div ref={tiltRef} className="vl-tilt-card">
              <div className="vl-tilt-inner">
                <Box size={32} style={{ opacity: 0.8, color: '#a78bfa' }} />
                <p>Hover me</p>
                <small>vanilla-tilt</small>
              </div>
            </div>
          </div>
        </DemoCard>
        <DemoCard title="Canvas Confetti" status="ok" note="confetti() — particleCount, spread, origin, colors — multi-cannon burst">
          <div className="vl-btn-stage">
            <button className="vl-action-btn" onClick={fireConfetti}>
              🎊 Fire Confetti
            </button>
          </div>
        </DemoCard>
        <DemoCard title="Lenis Smooth Scroll" status="ok" note="new Lenis({ duration, easing }) + raf loop — silky smooth scroll physics. Activates for 3s.">
          <div className="vl-btn-stage">
            <button className="vl-action-btn" onClick={initLenis}>
              🌊 Init Lenis
            </button>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: SCRIPT DSL ──────────────────────────────────────────────────────
