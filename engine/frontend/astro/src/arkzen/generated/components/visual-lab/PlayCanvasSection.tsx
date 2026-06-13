// ============================================================
// ARKZEN GENERATED COMPONENT — PlayCanvasSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T06:43:57.156Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { DemoCard } from './DemoCard'
import { PackageBadge } from './PackageBadge'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: PLAYCANVAS ──────────────────────────────────────────────────────
export const PlayCanvasSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    import('playcanvas').then((pc) => {
      const app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas),
      })
      appRef.current = app
      app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW)
      app.setCanvasResolution(pc.RESOLUTION_AUTO)
      app.start()

      // Camera
      const camera = new pc.Entity('camera')
      camera.addComponent('camera', { clearColor: new pc.Color(0.04, 0.04, 0.06) })
      camera.setPosition(0, 0, 5)
      app.root.addChild(camera)

      // Light
      const light = new pc.Entity('light')
      light.addComponent('light', { type: pc.LIGHTTYPE_DIRECTIONAL, color: new pc.Color(0.7, 0.5, 1), intensity: 2 })
      light.setEulerAngles(45, 30, 0)
      app.root.addChild(light)

      // Sphere
      const sphere = new pc.Entity('sphere')
      sphere.addComponent('render', { type: 'sphere' })
      const mat = new pc.StandardMaterial()
      mat.diffuse = new pc.Color(0.5, 0.3, 0.9)
      mat.specular = new pc.Color(0.4, 0.6, 1)
      mat.update()
      sphere.render!.meshInstances[0].material = mat
      sphere.setPosition(-1, 0, 0)
      app.root.addChild(sphere)

      // Box
      const box = new pc.Entity('box')
      box.addComponent('render', { type: 'box' })
      const boxMat = new pc.StandardMaterial()
      boxMat.diffuse = new pc.Color(0.2, 0.7, 0.9)
      boxMat.update()
      box.render!.meshInstances[0].material = boxMat
      box.setPosition(1, 0, 0)
      app.root.addChild(box)

      app.on('update', (dt: number) => {
        sphere.rotate(0, 45 * dt, 0)
        box.rotate(30 * dt, 45 * dt, 0)
      })

      return () => app.destroy()
    }).catch(() => {/* playcanvas may need full browser context */})

    return () => appRef.current?.destroy()
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Cpu size={20} />}
        title="PlayCanvas"
        subtitle="playcanvas@2.18 · @playcanvas/react@0.11 — Entity-Component scene graph, PBR, physics"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="PlayCanvas App — Sphere + Box" status="ok" note="Application, Entity, render component, StandardMaterial, camera + directional light">
          <canvas ref={canvasRef} className="vl-canvas" />
        </DemoCard>
        <DemoCard title="@playcanvas/react" status="info" note="React bindings — use <Application>, <Entity>, <Camera>, <Light>, <Render> components in JSX">
          <div className="vl-placeholder">
            <PackageBadge name="playcanvas" version="2.18" />
            <PackageBadge name="@playcanvas/react" version="0.11" />
            <p className="vl-placeholder-note">HTML-in-Canvas (Google API) — PlayCanvas ships native support via htmlTexture.setSource(el)</p>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: PIXI.JS ─────────────────────────────────────────────────────────
