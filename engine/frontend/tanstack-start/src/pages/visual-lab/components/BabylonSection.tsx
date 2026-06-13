// ============================================================
// ARKZEN GENERATED COMPONENT — BabylonSection [TanStack]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:27:13.848Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useVisualLabStore } from './hooks'
import { box, boxMat, camera, canvas, canvasRef, engine, engineRef, light, mat, mesh, onResize, render, scene, sphere } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: BABYLONJS ───────────────────────────────────────────────────────
export const BabylonSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    import('@babylonjs/core').then(({ Engine, Scene, HemisphericLight, MeshBuilder, StandardMaterial, Color3, Color4, Vector3, ArcRotateCamera }) => {
      const engine = new Engine(canvas, true, { preserveDrawingBuffer: true })
      engineRef.current = engine
      const scene = new Scene(engine)
      scene.clearColor = new Color4(0, 0, 0, 0)

      const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 5, Vector3.Zero(), scene)

      const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
      light.intensity = 0.9

      const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 1.5, segments: 32 }, scene)
      const mat = new StandardMaterial('mat', scene)
      mat.diffuseColor = new Color3(0.6, 0.4, 1)
      mat.specularColor = new Color3(0.4, 0.6, 1)
      sphere.material = mat

      const box = MeshBuilder.CreateBox('box', { size: 0.8 }, scene)
      box.position.x = 1.8
      const boxMat = new StandardMaterial('boxMat', scene)
      boxMat.diffuseColor = new Color3(0.3, 0.7, 0.9)
      box.material = boxMat

      scene.registerBeforeRender(() => {
        sphere.rotation.y += 0.01
        box.rotation.x += 0.012
        box.rotation.y += 0.008
      })

      engine.runRenderLoop(() => scene.render())
      const onResize = () => engine.resize()
      window.addEventListener('resize', onResize)

      return () => {
        window.removeEventListener('resize', onResize)
        engine.dispose()
      }
    })

    return () => { engineRef.current?.dispose() }
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Box size={20} />}
        title="BabylonJS"
        subtitle="@babylonjs/core@9.9 — WebGL 2 scene, ArcRotateCamera, PBR materials, mesh builder"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="BabylonJS Scene — Sphere + Box" status="ok" note="Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, StandardMaterial all verified">
          <canvas ref={canvasRef} className="vl-canvas" />
        </DemoCard>
        <DemoCard title="BabylonJS Feature Set" status="info">
          <div className="vl-feature-list">
            {['PBR Materials', 'Physics (Rapier integration)', 'GUI System', 'Particle System', 'Post-processing', 'Audio Engine', 'WebXR Ready', 'Node Material Editor'].map(f => (
              <div key={f} className="vl-feature-item"><Check size={12} color="#4ade80" /> {f}</div>
            ))}
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: PLAYCANVAS ──────────────────────────────────────────────────────
