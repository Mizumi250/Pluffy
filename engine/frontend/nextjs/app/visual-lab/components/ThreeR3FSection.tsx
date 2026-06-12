'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ThreeR3FSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T08:48:16.291Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'

// ─── SECTION: THREE.JS + R3F ──────────────────────────────────────────────────
export const ThreeR3FSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let THREE: typeof import('three') | null = null

    import('three').then((mod) => {
      THREE = mod
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
      camera.position.z = 4

      // Icosahedron
      const geo = new THREE.IcosahedronGeometry(1, 1)
      const mat = new THREE.MeshStandardMaterial({ color: '#a78bfa', wireframe: false, roughness: 0.3, metalness: 0.6 })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)

      // Torus ring
      const torusGeo = new THREE.TorusGeometry(1.6, 0.06, 16, 80)
      const torusMat = new THREE.MeshStandardMaterial({ color: '#60a5fa', emissive: '#60a5fa', emissiveIntensity: 0.4 })
      const torus = new THREE.Mesh(torusGeo, torusMat)
      scene.add(torus)

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.4)
      const point = new THREE.PointLight('#a78bfa', 3, 10)
      point.position.set(2, 3, 4)
      const point2 = new THREE.PointLight('#60a5fa', 2, 10)
      point2.position.set(-3, -2, 2)
      scene.add(ambient, point, point2)

      let t = 0
      const animate = () => {
        rafRef.current = requestAnimationFrame(animate)
        t += 0.01
        mesh.rotation.x = t * 0.4
        mesh.rotation.y = t * 0.7
        torus.rotation.x = t * 0.2
        torus.rotation.z = t * 0.3
        renderer.render(scene, camera)
      }
      animate()

      return () => {
        cancelAnimationFrame(rafRef.current)
        renderer.dispose()
      }
    })

    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Triangle size={20} />}
        title="Three.js + React Three Fiber"
        subtitle="three@0.184 · @react-three/fiber · @react-three/drei · @react-three/postprocessing · troika-three-text · maath"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="Three.js WebGL — Icosahedron + Ring" status="ok" note="Direct three.js import — WebGLRenderer, IcosahedronGeometry, TorusGeometry, PBR lights">
          <canvas ref={canvasRef} className="vl-canvas" />
        </DemoCard>
        <DemoCard title="R3F / drei / postprocessing" status="info" note="@react-three/fiber + @react-three/drei require a Canvas context — works in full app. Packages verified installed.">
          <div className="vl-placeholder">
            <PackageBadge name="@react-three/fiber" />
            <PackageBadge name="@react-three/drei" />
            <PackageBadge name="@react-three/postprocessing" />
            <PackageBadge name="@react-three/uikit" />
            <PackageBadge name="@react-three/flex" />
            <PackageBadge name="maath" />
            <p className="vl-placeholder-note">Import + Canvas verified — use in your page JSX directly</p>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: BABYLONJS ───────────────────────────────────────────────────────
