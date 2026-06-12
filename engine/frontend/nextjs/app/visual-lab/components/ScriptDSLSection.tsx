'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ScriptDSLSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T09:10:11.255Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'

// ─── SECTION: SCRIPT DSL ──────────────────────────────────────────────────────
export const ScriptDSLSection = () => {
  // These results come FROM the @arkzen:script and @arkzen:script:name blocks below.
  // The global script exports `visualLabSceneSetup` and `VisualLabColors`.
  // The named scripts export `threeSceneHelper` (three-scene) and `particleConfig` (particles-config).
  const [tab, setTab] = useState<'global' | 'named'>('global')

  const globalCode = `/* @arkzen:script */
// Global scene constants — shared across all visual-lab pages
const VisualLabColors = {
  primary:   '#a78bfa',
  secondary: '#60a5fa',
  accent:    '#f472b6',
  success:   '#34d399',
}

// Factory: build a reusable Three.js scene with standard lighting
function visualLabSceneSetup(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight)
  camera.position.z = 4

  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  const point   = new THREE.PointLight(VisualLabColors.primary, 3, 10)
  point.position.set(2, 3, 4)
  scene.add(ambient, point)

  return { renderer, scene, camera }
}
/* @arkzen:script:end */`

  const namedCode = `/* @arkzen:script:three-scene */
// Named helper — imported as: visual-lab.three-scene.script.ts
export function makeIcosahedron(scene: THREE.Scene) {
  const geo = new THREE.IcosahedronGeometry(1, 1)
  const mat = new THREE.MeshStandardMaterial({
    color: VisualLabColors.primary,
    roughness: 0.3,
    metalness: 0.6,
  })
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)
  return mesh
}
/* @arkzen:script:three-scene:end */

/* @arkzen:script:particles-config */
// Named helper — imported as: visual-lab.particles-config.script.ts
export const defaultParticleConfig = {
  count:    200,
  size:     { min: 2, max: 6 },
  speed:    { min: 0.5, max: 2 },
  lifetime: { min: 1.5, max: 3.5 },
  colors:   ['#a78bfa', '#60a5fa', '#f472b6', '#34d399'],
}

export function getEmitterConfig(origin: { x: number; y: number }) {
  return { ...defaultParticleConfig, origin }
}
/* @arkzen:script:particles-config:end */`

  return (
    <div>
      <SectionHeader
        icon={<Code2 size={20} />}
        title="@arkzen:script DSL Blocks"
        subtitle="Two new DSL blocks — global script (one per tatemono) + named scripts (multiple). Both parsed by the shared parser and emitted as .ts files."
        badge="New in v6.5"
      />
      <div className="vl-script-tabs">
        <button className={`vl-tab ${tab === 'global' ? 'active' : ''}`} onClick={() => setTab('global')}>
          Global Script Block
        </button>
        <button className={`vl-tab ${tab === 'named' ? 'active' : ''}`} onClick={() => setTab('named')}>
          Named Script Blocks
        </button>
      </div>
      {tab === 'global' && (
        <div className="vl-script-panel">
          <div className="vl-script-meta">
            <div className="vl-script-meta-item">
              <strong>DSL Tag</strong>
              <code>{`/* @arkzen:script */`}</code>
            </div>
            <div className="vl-script-meta-item">
              <strong>Generated File</strong>
              <code>visual-lab.scripts.ts</code>
            </div>
            <div className="vl-script-meta-item">
              <strong>Count per tatemono</strong>
              <code>One (1)</code>
            </div>
            <div className="vl-script-meta-item">
              <strong>Use for</strong>
              <code>Three.js scenes, shared utils, canvas setup, constants too heavy for @arkzen:components</code>
            </div>
          </div>
          <pre className="vl-code-block">{globalCode}</pre>
          <div className="vl-script-note">
            <Info size={13} />
            <span>The parser calls <code>parseGlobalScript()</code> → stored in <code>tatemono.script</code>. The router emits <code>visual-lab.scripts.ts</code> via <code>generateScriptFile()</code>. Import in your page: <code>import {'{ visualLabSceneSetup }'} from '@/arkzen/generated/visual-lab.scripts'</code></span>
          </div>
        </div>
      )}
      {tab === 'named' && (
        <div className="vl-script-panel">
          <div className="vl-script-meta">
            <div className="vl-script-meta-item">
              <strong>DSL Tag</strong>
              <code>{`/* @arkzen:script:name */`}</code>
            </div>
            <div className="vl-script-meta-item">
              <strong>Generated Files</strong>
              <code>visual-lab.three-scene.script.ts<br/>visual-lab.particles-config.script.ts</code>
            </div>
            <div className="vl-script-meta-item">
              <strong>Count per tatemono</strong>
              <code>Multiple (unlimited)</code>
            </div>
            <div className="vl-script-meta-item">
              <strong>Use for</strong>
              <code>Per-component JS, per-feature helpers, lazily imported heavy logic</code>
            </div>
          </div>
          <pre className="vl-code-block">{namedCode}</pre>
          <div className="vl-script-note">
            <Info size={13} />
            <span>Parser calls <code>parseAllNamedScripts()</code> → stored in <code>tatemono.scripts[]</code>. Router calls <code>generateNamedScriptFiles()</code> — one file per named block. Import: <code>import {'{ makeIcosahedron }'} from '@/arkzen/generated/visual-lab.three-scene.script'</code></span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SECTION: LOTTIE ─────────────────────────────────────────────────────────
