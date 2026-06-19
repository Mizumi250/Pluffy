'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — TWGLSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-19T13:52:58.448Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { arrays, bufferInfo, canvas, canvasRef, fs, gl, programInfo, rafRef, render, t, vs } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: TWGL ────────────────────────────────────────────────────────────
export const TWGLSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    import('twgl.js').then((twgl) => {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) return

      const vs = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0, 1); }
      `
      const fs = `
        precision mediump float;
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          float d = length(uv - 0.5) * 2.0;
          float ring = smoothstep(0.05, 0.0, abs(d - (0.4 + 0.2 * sin(time))));
          vec3 col = mix(vec3(0.37,0.27,0.98), vec3(0.37,0.64,0.98), vUv.x);
          gl_FragColor = vec4(col * ring + col * 0.05, 1.0);
        }
      `
      const programInfo = (twgl as any).createProgramInfo(gl, [vs, fs])
      const arrays = { position: [-1,-1, 1,-1, -1,1, 1,1] }
      const bufferInfo = (twgl as any).createBufferInfoFromArrays(gl, arrays)

      let t = 0
      const render = () => {
        rafRef.current = requestAnimationFrame(render)
        t += 0.03
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.useProgram(programInfo.program)
        ;(twgl as any).setBuffersAndAttributes(gl, programInfo, bufferInfo)
        ;(twgl as any).setUniforms(programInfo, { time: t })
        ;(twgl as any).drawBufferInfo(gl, bufferInfo, (gl as WebGL2RenderingContext).TRIANGLE_STRIP)
      }
      render()

      return () => cancelAnimationFrame(rafRef.current)
    })

    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Monitor size={20} />}
        title="TWGL.js"
        subtitle="twgl.js@7 — Tiny WebGL helper, programInfo, bufferInfo, setUniforms, drawBufferInfo"
        badge="Installed ✓"
      />
      <DemoCard title="TWGL — Animated Ring Shader" status="ok" note="createProgramInfo, createBufferInfoFromArrays, setUniforms, drawBufferInfo — animated SDF ring">
        <canvas ref={canvasRef} className="vl-canvas" />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: PHASER ──────────────────────────────────────────────────────────
