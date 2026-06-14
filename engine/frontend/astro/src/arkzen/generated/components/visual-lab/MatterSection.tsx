// ============================================================
// ARKZEN GENERATED COMPONENT — MatterSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:28:18.151Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from '@/arkzen/generated/visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: MATTER.JS ───────────────────────────────────────────────────────
export const MatterSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    import('matter-js').then((Matter) => {
      const { Engine, Render, Runner, Bodies, Composite, Body } = Matter
      const engine = Engine.create({ gravity: { y: 1 } })
      const render = Render.create({
        canvas,
        engine,
        options: {
          width: canvas.clientWidth || 340,
          height: 220,
          wireframes: false,
          background: 'transparent',
        }
      })
      const runner = Runner.create()

      const ground = Bodies.rectangle(170, 210, 340, 20, { isStatic: true, render: { fillStyle: '#374151' } })
      const wallL  = Bodies.rectangle(0, 110, 20, 220, { isStatic: true, render: { fillStyle: '#374151' } })
      const wallR  = Bodies.rectangle(340, 110, 20, 220, { isStatic: true, render: { fillStyle: '#374151' } })

      const colors = ['#a78bfa', '#60a5fa', '#f472b6', '#34d399', '#fb923c']
      const boxes = Array.from({ length: 8 }, (_, i) =>
        Bodies.rectangle(60 + i * 32, 20 + Math.random() * 40, 28, 28, {
          restitution: 0.5,
          render: { fillStyle: colors[i % colors.length] }
        })
      )

      Composite.add(engine.world, [ground, wallL, wallR, ...boxes])
      Render.run(render)
      Runner.run(runner, engine)

      return () => {
        Runner.stop(runner)
        Render.stop(render)
        Engine.clear(engine)
      }
    })
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Atom size={20} />}
        title="Matter.js"
        subtitle="matter-js@0.19 — 2D rigid body physics, Engine, Bodies, Composite, Render, Runner"
        badge="Installed ✓"
      />
      <DemoCard title="Matter.js — Falling Boxes Physics" status="ok" note="Engine, Render, Runner, Bodies.rectangle, Composite.add — gravity + restitution">
        <canvas ref={canvasRef} className="vl-canvas" />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: RAPIER ─────────────────────────────────────────────────────────
