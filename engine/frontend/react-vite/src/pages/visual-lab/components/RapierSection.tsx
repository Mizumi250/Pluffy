// ============================================================
// ARKZEN GENERATED COMPONENT — RapierSection [React+Vite]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:56.357Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { ball, balls, canvas, canvasRef, colors, config, ctx, engine, gravity, groundBody, rafRef, rb, render, t, toScreen, wallL, wallR, world } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: RAPIER ─────────────────────────────────────────────────────────
export const RapierSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    cancelAnimationFrame(rafRef.current)

    import('@dimforge/rapier2d').then((RAPIER) => {
      const gravity = { x: 0.0, y: -9.81 }
      const world = new RAPIER.World(gravity)

      // Ground
      const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -2))
      world.createCollider(RAPIER.ColliderDesc.cuboid(5, 0.1), groundBody)

      // Walls
      const wallL = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(-4, 0))
      world.createCollider(RAPIER.ColliderDesc.cuboid(0.1, 3), wallL)
      const wallR = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(4, 0))
      world.createCollider(RAPIER.ColliderDesc.cuboid(0.1, 3), wallR)

      // Dynamic balls
      const colors = ['#a78bfa', '#60a5fa', '#f472b6', '#34d399']
      const balls: { body: any; color: string }[] = []
      for (let i = 0; i < 6; i++) {
        const rb = world.createRigidBody(
          RAPIER.RigidBodyDesc.dynamic().setTranslation(-2 + i * 0.8, 2 + Math.random())
        )
        world.createCollider(RAPIER.ColliderDesc.ball(0.3).setRestitution(0.7), rb)
        balls.push({ body: rb, color: colors[i % colors.length] })
      }

      const ctx = canvas.getContext('2d')!
      const W = canvas.clientWidth || 340, H = 220
      canvas.width = W; canvas.height = H

      const toScreen = (x: number, y: number) => ({
        sx: W / 2 + x * 38,
        sy: H / 2 - y * 38,
      })

      const render = () => {
        rafRef.current = requestAnimationFrame(render)
        world.step()
        ctx.clearRect(0, 0, W, H)

        // Ground line
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'
        ctx.lineWidth = 2
        const { sx: gx1, sy: gy } = toScreen(-5, -2)
        const { sx: gx2 } = toScreen(5, -2)
        ctx.beginPath(); ctx.moveTo(gx1, gy); ctx.lineTo(gx2, gy); ctx.stroke()

        // Balls
        balls.forEach(({ body, color }) => {
          const t = body.translation()
          const { sx, sy } = toScreen(t.x, t.y)
          ctx.beginPath()
          ctx.arc(sx, sy, 11, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.shadowColor = color
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.shadowBlur = 0
        })

        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = '11px monospace'
        ctx.fillText('Rapier2D — WASM physics world', 8, H - 6)
      }
      render()

      return () => { cancelAnimationFrame(rafRef.current); world.free() }
    }).catch(() => {/* WASM may need bundler config */})

    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Zap size={20} />}
        title="Rapier2D / Rapier3D"
        subtitle="@dimforge/rapier2d@0.19 · rapier3d@0.19 — WASM physics engine, RigidBody, Collider, World"
        badge="Installed ✓"
      />
      <DemoCard title="Rapier2D — WASM Bouncing Balls" status="ok" note="RAPIER.World, RigidBodyDesc.dynamic/fixed, ColliderDesc.ball/cuboid — WASM-based physics loop">
        <canvas ref={canvasRef} className="vl-canvas" />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: PARTICLES + PROTON ─────────────────────────────────────────────
