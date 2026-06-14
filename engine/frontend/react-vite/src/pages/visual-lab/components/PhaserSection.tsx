// ============================================================
// ARKZEN GENERATED COMPONENT — PhaserSection [React+Vite]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:56.354Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { ball, config, gameRef, gfx, mount, mountRef, scene, txt } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: PHASER ──────────────────────────────────────────────────────────
export const PhaserSection = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null }

    import('phaser').then((Phaser) => {
      const P = (Phaser as any).default || Phaser
      const config = {
        type: P.AUTO,
        width: mount.clientWidth || 340,
        height: 220,
        parent: mount,
        backgroundColor: '#0a0a10',
        scene: {
          create(this: any) {
            const gfx = this.add.graphics()
            // Grid
            gfx.lineStyle(1, 0x2a2a4a, 0.5)
            for (let x = 0; x < 400; x += 40) gfx.lineBetween(x, 0, x, 220)
            for (let y = 0; y < 220; y += 40) gfx.lineBetween(0, y, 400, y)
            // Bouncing ball
            const ball = this.add.graphics()
            ball.fillStyle(0xa78bfa, 1)
            ball.fillCircle(0, 0, 20)
            ball.x = 80; ball.y = 110
            // Score text
            const txt = this.add.text(10, 196, 'Phaser 4 — WebGL auto | Press space to reset', {
              fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace'
            })
            let vx = 2.8, vy = 2.2
            this.time.addEvent({
              delay: 16, loop: true, callback: () => {
                ball.x += vx; ball.y += vy
                if (ball.x > (config.width as number) - 20 || ball.x < 20) vx *= -1
                if (ball.y > 200 || ball.y < 20) vy *= -1
              }
            })
          }
        }
      }
      gameRef.current = new P.Game(config)
    })

    return () => { gameRef.current?.destroy(true) }
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Play size={20} />}
        title="Phaser"
        subtitle="phaser@4.1 — game framework, Scene system, Graphics, Text, Tweens, Physics"
        badge="Installed ✓"
      />
      <DemoCard title="Phaser 4 — Bouncing Ball Scene" status="ok" note="Game config, Scene.create, Graphics, Text, time.addEvent — Phaser 4 WebGL auto-select">
        <div ref={mountRef} />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: MATTER.JS ───────────────────────────────────────────────────────
