// ============================================================
// ARKZEN GENERATED COMPONENT — OGLSection [React+Vite]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T08:07:19.761Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { animate, camera, canvas, canvasRef, fragment, geo, gl, light, mesh, prog, rafRef, render, renderer, scene, t, vertex } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: OGL ─────────────────────────────────────────────────────────────
export const OGLSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    import('ogl').then(({ Renderer, Camera, Transform, Mesh, Sphere, Program, Color }) => {
      const renderer = new Renderer({ canvas, width: canvas.clientWidth || 320, height: 220, alpha: true })
      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)

      const camera = new Camera(gl, { fov: 45 })
      camera.position.z = 4

      const scene = new Transform()

      const vertex = /* glsl */`
        attribute vec3 position;
        attribute vec3 normal;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `
      const fragment = /* glsl */`
        precision highp float;
        varying vec3 vNormal;
        void main() {
          float light = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;
          gl_FragColor = vec4(mix(vec3(0.37, 0.27, 0.98), vec3(0.37, 0.64, 0.98), light), 1.0);
        }
      `

      const geo = new Sphere(gl, { radius: 1, widthSegments: 32, heightSegments: 32 })
      const prog = new Program(gl, { vertex, fragment })
      const mesh = new Mesh(gl, { geometry: geo, program: prog })
      mesh.setParent(scene)

      let t = 0
      const animate = () => {
        rafRef.current = requestAnimationFrame(animate)
        t += 0.01
        mesh.rotation.y = t * 0.6
        mesh.rotation.x = t * 0.3
        renderer.render({ scene, camera })
      }
      animate()

      return () => { cancelAnimationFrame(rafRef.current); renderer.gl.getExtension('WEBGL_lose_context')?.loseContext() }
    })

    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Globe size={20} />}
        title="OGL"
        subtitle="ogl@1.0 — minimal WebGL2 library, custom GLSL shaders, Renderer, Mesh, Program"
        badge="Installed ✓"
      />
      <DemoCard title="OGL — Custom GLSL Sphere" status="ok" note="Renderer, Camera, Transform, Sphere, Program — custom vertex/fragment GLSL with normal-based shading">
        <canvas ref={canvasRef} className="vl-canvas" />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: REGL ────────────────────────────────────────────────────────────
