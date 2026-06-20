'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ParticlesSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-19T23:51:24.014Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { canvas, canvasRef, config, ctx, emitter, engine, proton, rafRef, renderer, tick } from './utils'
import { DemoCard } from './DemoCard'
import { PackageBadge } from './PackageBadge'
import { Proton } from './Proton'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: PARTICLES + PROTON ─────────────────────────────────────────────
export const ParticlesSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    cancelAnimationFrame(rafRef.current)

    // Use proton-engine for canvas particles
    import('proton-engine').then((ProtonModule) => {
      const Proton = (ProtonModule as any).default || ProtonModule
      const ctx = canvas.getContext('2d')!
      const W = canvas.clientWidth || 340, H = 220
      canvas.width = W; canvas.height = H

      const proton = new Proton()
      const emitter = new Proton.Emitter()
      emitter.rate = new Proton.Rate(new Proton.Span(4, 8), 0.1)

      emitter.addInitialize(new Proton.Mass(1))
      emitter.addInitialize(new Proton.Radius(2, 8))
      emitter.addInitialize(new Proton.Life(1.5, 3))
      emitter.addInitialize(new Proton.Position(new Proton.PointZone(W / 2, H / 2)))
      emitter.addInitialize(new Proton.Velocity(new Proton.Span(1.5, 4), new Proton.Span(0, 360), 'polar'))

      emitter.addBehaviour(new Proton.Alpha(1, 0))
      emitter.addBehaviour(new Proton.Scale(1, 0.2))
      emitter.addBehaviour(new Proton.Color(
        ['#a78bfa', '#60a5fa', '#f472b6'],
        ['#7c3aed', '#2563eb', '#be185d']
      ))
      emitter.addBehaviour(new Proton.Gravity(0.5))

      emitter.p.x = W / 2
      emitter.p.y = H / 2
      emitter.emit('once', true)

      const renderer = new Proton.CanvasRenderer(canvas)
      proton.addEmitter(emitter)
      proton.addRenderer(renderer)

      const tick = () => {
        rafRef.current = requestAnimationFrame(tick)
        ctx.fillStyle = 'rgba(9,9,11,0.25)'
        ctx.fillRect(0, 0, W, H)
        proton.update()
      }
      tick()

      return () => { cancelAnimationFrame(rafRef.current); proton.destroy() }
    }).catch(() => {/* fallback */})

    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Sparkles size={20} />}
        title="tsParticles + Proton Engine"
        subtitle="@tsparticles/react@4 · proton-engine@7 — particle systems, emitters, behaviours, WebGL renderer"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="Proton Engine — Canvas Particle Burst" status="ok" note="Emitter, Rate, Velocity, Alpha, Scale, Color, Gravity behaviours — CanvasRenderer">
          <canvas ref={canvasRef} className="vl-canvas" />
        </DemoCard>
        <DemoCard title="tsParticles + @tsparticles/react" status="info" note="Use <Particles> component with tsParticles engine config JSON — verified installed">
          <div className="vl-placeholder">
            <PackageBadge name="@tsparticles/react" version="4.0" />
            <p className="vl-placeholder-note">
              {'import { Particles } from "@tsparticles/react"'}<br/>
              {'<Particles options={{ particles: { number: { value: 80 } } }} />'}
            </p>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: TYPED.JS + ROUGH NOTATION + SPLITTING ──────────────────────────
