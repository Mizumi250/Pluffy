'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — REGLSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T01:14:39.887Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { canvas, canvasRef, drawTriangle, fragment, rafRef, regl, t, vertex } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: REGL ────────────────────────────────────────────────────────────
export const REGLSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    import('regl').then(({ default: createREGL }) => {
      const regl = createREGL({ canvas })
      const drawTriangle = regl({
        frag: `
          precision mediump float;
          uniform float t;
          varying vec2 vUv;
          void main() {
            gl_FragColor = vec4(
              0.5 + 0.5 * sin(t + vUv.x * 6.28),
              0.37 + 0.4 * cos(t * 1.3 + vUv.y * 6.28),
              0.85 + 0.15 * sin(t * 0.7),
              1.0
            );
          }
        `,
        vert: `
          precision mediump float;
          attribute vec2 position;
          uniform float t;
          varying vec2 vUv;
          void main() {
            vUv = position * 0.5 + 0.5;
            float s = 0.7 + 0.15 * sin(t);
            gl_Position = vec4(position * s, 0, 1);
          }
        `,
        attributes: {
          position: [[-1, -0.8], [0, 1], [1, -0.8]]
        },
        uniforms: {
          t: regl.prop<any, any>('t')
        },
        count: 3
      })

      let t = 0
      rafRef.current = regl.frame(() => {
        t += 0.025
        regl.clear({ color: [0.04, 0.04, 0.06, 1], depth: 1 })
        drawTriangle({ t })
      })

      return () => { rafRef.current?.cancel(); regl.destroy() }
    })

    return () => rafRef.current?.cancel()
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Code2 size={20} />}
        title="REGL"
        subtitle="regl@2.1 — functional WebGL, draw commands, uniforms/attributes, frame loop"
        badge="Installed ✓"
      />
      <DemoCard title="REGL — Animated Triangle GLSL" status="ok" note="createREGL, draw command, custom vertex+fragment GLSL, regl.frame() loop, uniform time">
        <canvas ref={canvasRef} className="vl-canvas" />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: TWGL ────────────────────────────────────────────────────────────
