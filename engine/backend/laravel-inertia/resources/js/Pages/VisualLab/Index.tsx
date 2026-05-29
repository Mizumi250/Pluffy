// ============================================================
// ARKZEN GENERATED PAGE — visual-lab/index [React+Inertia]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-29T02:41:51.794Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from '@/arkzen/generated/visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { visualLabAnimations, pageVariants } from '@/arkzen/generated/visual-lab.animations'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import './styles/global.css'

// Props passed from Laravel via Inertia::render()
export type VisualLabIndexProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Shared components from @arkzen:components ─────────────────────────────────
// ─── STORE ────────────────────────────────────────────────────────────────────
interface VisualLabState {
  activeSection: string
  setActiveSection: (s: string) => void
  resetKey: number
  triggerReset: () => void
  htmlCanvasSupported: boolean | null
  setHtmlCanvasSupported: (v: boolean) => void
}

export const useVisualLabStore = create<VisualLabState>((set) => ({
  activeSection: 'three-r3f',
  setActiveSection: (s) => set({ activeSection: s }),
  resetKey: 0,
  triggerReset: () => set((s) => ({ resetKey: s.resetKey + 1 })),
  htmlCanvasSupported: null,
  setHtmlCanvasSupported: (v) => set({ htmlCanvasSupported: v }),
}))

// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
export const NAV_SECTIONS = [
  { id: 'three-r3f',       label: 'Three.js / R3F',    icon: '🔺', group: '3D' },
  { id: 'babylonjs',       label: 'BabylonJS',          icon: '🏛', group: '3D' },
  { id: 'playcanvas',      label: 'PlayCanvas',         icon: '🎮', group: '3D' },
  { id: 'ogl',             label: 'OGL',                icon: '🌐', group: '3D' },
  { id: 'pixi',            label: 'PixiJS',             icon: '🟣', group: '2D' },
  { id: 'konva',           label: 'Konva',              icon: '🔷', group: '2D' },
  { id: 'fabric',          label: 'Fabric.js',          icon: '🎨', group: '2D' },
  { id: 'p5',              label: 'p5.js',              icon: '✏️', group: '2D' },
  { id: 'regl',            label: 'REGL',               icon: '▦', group: 'GL' },
  { id: 'twgl',            label: 'TWGL',               icon: '◈', group: 'GL' },
  { id: 'phaser',          label: 'Phaser',             icon: '🕹', group: 'Game' },
  { id: 'matter',          label: 'Matter.js',          icon: '⚛', group: 'Physics' },
  { id: 'rapier',          label: 'Rapier2D/3D',        icon: '🧲', group: 'Physics' },
  { id: 'particles',       label: 'tsParticles',        icon: '✨', group: 'FX' },
  { id: 'proton',          label: 'Proton Engine',      icon: '💫', group: 'FX' },
  { id: 'lottie',          label: 'Lottie',             icon: '🎞', group: 'FX' },
  { id: 'confetti',        label: 'Canvas Confetti',    icon: '🎊', group: 'FX' },
  { id: 'typed',           label: 'Typed.js',           icon: '⌨️', group: 'Text' },
  { id: 'troika',          label: 'Troika Text',        icon: '🔤', group: 'Text' },
  { id: 'splitting',       label: 'Splitting.js',       icon: '✂️', group: 'Text' },
  { id: 'rough',           label: 'Rough Notation',     icon: '✍️', group: 'Text' },
  { id: 'vanilla-tilt',    label: 'Vanilla Tilt',       icon: '⬡', group: 'UX' },
  { id: 'lenis',           label: 'Lenis Scroll',       icon: '🌊', group: 'UX' },
  { id: 'curtains',        label: 'CurtainsJS',         icon: '🪟', group: 'Shader' },
  { id: 'shaders',         label: 'Shaders',            icon: '✨', group: 'Shader' },
  { id: 'script-dsl',      label: 'Script DSL',         icon: '📜', group: 'Arkzen' },
  { id: 'html-canvas',     label: 'HTML-in-Canvas',     icon: '🧪', group: 'Arkzen' },
]

// ─── SHARED UI ────────────────────────────────────────────────────────────────
export const SectionHeader = ({ icon, title, subtitle, badge }: {
  icon: React.ReactNode; title: string; subtitle: string; badge?: string
}) => (
  <div className="vl-section-header">
    <div className="vl-section-icon">{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 className="vl-section-title">{title}</h2>
        {badge && <span className="vl-badge">{badge}</span>}
      </div>
      <p className="vl-section-sub">{subtitle}</p>
    </div>
  </div>
)

export const DemoCard = ({ title, children, status, note }: {
  title: string; children: React.ReactNode; status?: 'ok' | 'warn' | 'info'; note?: string
}) => (
  <div className="vl-demo-card">
    <div className="vl-demo-card-header">
      <span className="vl-demo-card-title">{title}</span>
      {status === 'ok'   && <Check size={13} color="#4ade80" />}
      {status === 'warn' && <AlertCircle size={13} color="#facc15" />}
      {status === 'info' && <Info size={13} color="#60a5fa" />}
    </div>
    <div className="vl-demo-stage">{children}</div>
    {note && <p className="vl-demo-note">{note}</p>}
  </div>
)

export const ResetBtn = ({ onClick }: { onClick: () => void }) => (
  <button className="vl-reset-btn" onClick={onClick}><RefreshCw size={13} /></button>
)

export const PackageBadge = ({ name, version }: { name: string; version?: string }) => (
  <span className="vl-pkg-badge">{name}{version ? ` ${version}` : ''}</span>
)

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
export const PixiSection = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    mount.innerHTML = ''

    import('pixi.js').then(async (PIXI) => {
      const app = new PIXI.Application()
      appRef.current = app
      await app.init({
        width: mount.clientWidth || 320,
        height: 220,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio,
      })
      mount.appendChild(app.canvas)

      // Animated polygons
      const colors = [0xa78bfa, 0x60a5fa, 0xf472b6, 0x34d399]
      const shapes: any[] = []
      for (let i = 0; i < 4; i++) {
        const g = new PIXI.Graphics()
        g.regularPoly(0, 0, 28 + i * 8, 3 + i)
        g.fill({ color: colors[i], alpha: 0.85 })
        g.x = 60 + i * 70
        g.y = 110
        app.stage.addChild(g)
        shapes.push({ g, speed: 0.02 + i * 0.01, phase: i * 0.8 })
      }

      // Text
      const label = new PIXI.Text({
        text: 'PixiJS v8 — WebGPU/WebGL2',
        style: { fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }
      })
      label.x = 10; label.y = 195
      app.stage.addChild(label)

      let t = 0
      app.ticker.add(() => {
        t += 0.04
        shapes.forEach(({ g, speed, phase }) => {
          g.rotation += speed
          g.y = 110 + Math.sin(t + phase) * 18
        })
      })

      return () => app.destroy(true)
    })

    return () => appRef.current?.destroy(true)
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Square size={20} />}
        title="PixiJS"
        subtitle="pixi.js@8.18 — WebGPU-first 2D renderer, Graphics API, Sprite, Text, Filters"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="PixiJS v8 — Animated Polygons" status="ok" note="Application v8 API, Graphics.regularPoly(), Ticker, Text — WebGPU/WebGL2 auto-select">
          <div ref={mountRef} className="vl-canvas-mount" />
        </DemoCard>
        <DemoCard title="PixiJS Features" status="info">
          <div className="vl-feature-list">
            {['WebGPU-first renderer', 'WebGL2 fallback', 'Graphics v8 API', 'Sprite batching', 'Filter system', 'Particle Container', 'Tween via gsap', 'Text/BitmapText'].map(f => (
              <div key={f} className="vl-feature-item"><Check size={12} color="#4ade80" /> {f}</div>
            ))}
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: KONVA ───────────────────────────────────────────────────────────
export const KonvaSection = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    import('konva').then((Konva) => {
      const K = (Konva as any).default || Konva
      if (stageRef.current) stageRef.current.destroy()

      const stage = new K.Stage({ container: mount, width: mount.clientWidth || 320, height: 220 })
      stageRef.current = stage
      const layer = new K.Layer()
      stage.add(layer)

      // Draggable star
      const star = new K.Star({
        x: 80, y: 110, numPoints: 6,
        innerRadius: 25, outerRadius: 50,
        fill: '#a78bfa', stroke: '#7c3aed', strokeWidth: 2,
        draggable: true,
        shadowBlur: 10, shadowColor: '#a78bfa',
      })

      // Draggable circle
      const circle = new K.Circle({
        x: 200, y: 110, radius: 45,
        fillRadialGradientStartPoint: { x: 0, y: 0 },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndPoint: { x: 0, y: 0 },
        fillRadialGradientEndRadius: 45,
        fillRadialGradientColorStops: [0, '#60a5fa', 1, '#7c3aed'],
        draggable: true,
        shadowBlur: 12, shadowColor: '#60a5fa',
      })

      // Rect with transform
      const rect = new K.Rect({
        x: 260, y: 80, width: 50, height: 50,
        fill: '#f472b6', cornerRadius: 8,
        draggable: true, rotation: 20,
      })

      const label = new K.Text({
        x: 10, y: 200, text: 'Drag shapes • Konva@10.3',
        fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontFamily: 'monospace'
      })

      layer.add(star, circle, rect, label)

      // Animate star
      const anim = new K.Animation((frame: any) => {
        star.rotation(frame.time * 0.05)
      }, layer)
      anim.start()

      return () => { anim.stop(); stage.destroy() }
    })

    return () => stageRef.current?.destroy()
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Layers size={20} />}
        title="Konva + react-konva"
        subtitle="konva@10.3 · react-konva@19 — 2D canvas stage/layer system, draggable shapes, animations"
        badge="Installed ✓"
      />
      <DemoCard title="Konva Stage — Draggable Star, Circle, Rect" status="ok" note="Stage, Layer, Star, Circle, Rect, Text, Animation — all draggable">
        <div ref={mountRef} className="vl-canvas-mount" />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: FABRIC.JS ───────────────────────────────────────────────────────
export const FabricSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return

    import('fabric').then(({ Canvas, Rect, Circle, Ellipse, IText, FabricText, Gradient }) => {
      if (fabricRef.current) fabricRef.current.dispose()

      const canvas = new Canvas(el, { width: 400, height: 220, backgroundColor: 'transparent' })
      fabricRef.current = canvas

      // Gradient rect
      const rect = new Rect({
        left: 20, top: 60, width: 100, height: 80,
        fill: new Gradient({
          type: 'linear',
          coords: { x1: 0, y1: 0, x2: 100, y2: 0 },
          colorStops: [{ offset: 0, color: '#a78bfa' }, { offset: 1, color: '#60a5fa' }]
        }),
        rx: 12, ry: 12, selectable: true,
        shadow: { color: 'rgba(167,139,250,0.5)', blur: 12, offsetX: 0, offsetY: 4 } as any,
      })

      const circle = new Circle({
        left: 150, top: 70, radius: 45,
        fill: '#f472b6', opacity: 0.85,
        selectable: true,
      })

      const ellipse = new Ellipse({
        left: 250, top: 80, rx: 55, ry: 35,
        fill: '#34d399', opacity: 0.7,
        angle: -15, selectable: true,
      })

      const itext = new IText('Click to edit ✏️', {
        left: 20, top: 170, fontSize: 13,
        fill: 'rgba(255,255,255,0.6)',
        fontFamily: 'monospace',
      })

      canvas.add(rect, circle, ellipse, itext)
      canvas.renderAll()

      return () => canvas.dispose()
    })

    return () => fabricRef.current?.dispose()
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Palette size={20} />}
        title="Fabric.js"
        subtitle="fabric@7.4 — interactive object canvas, IText, Gradient, Shadow, Groups, Filters"
        badge="Installed ✓"
      />
      <DemoCard title="Fabric Canvas — Gradient Rect, Circle, Ellipse, IText" status="ok" note="Click shapes to select/transform. Double-click the text to edit inline.">
        <canvas ref={canvasRef} />
      </DemoCard>
    </div>
  )
}

// ─── SECTION: P5.JS ───────────────────────────────────────────────────────────
export const P5Section = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (sketchRef.current) { sketchRef.current.remove(); sketchRef.current = null }

    import('p5').then(({ default: P5 }) => {
      sketchRef.current = new P5((p: any) => {
        let t = 0
        const pts: { x: number; y: number; a: number; s: number }[] = []
        p.setup = () => {
          p.createCanvas(mount.clientWidth || 340, 220)
          p.colorMode(p.HSB, 360, 100, 100, 100)
          for (let i = 0; i < 60; i++) {
            pts.push({ x: p.random(p.width), y: p.random(p.height), a: p.random(360), s: p.random(0.5, 2) })
          }
        }
        p.draw = () => {
          p.background(240, 20, 8, 15)
          t += 0.015
          pts.forEach((pt, i) => {
            const n = p.noise(pt.x * 0.003, pt.y * 0.003, t)
            const angle = n * p.TWO_PI * 3
            pt.x += p.cos(angle) * pt.s
            pt.y += p.sin(angle) * pt.s
            if (pt.x < 0 || pt.x > p.width) pt.x = p.random(p.width)
            if (pt.y < 0 || pt.y > p.height) pt.y = p.random(p.height)
            p.stroke((i * 6 + t * 30) % 360, 80, 90, 70)
            p.strokeWeight(pt.s + 0.5)
            p.point(pt.x, pt.y)
          })
          p.noStroke()
          p.fill(0, 0, 100, 30)
          p.textSize(11)
          p.textFont('monospace')
          p.text('p5.js v2 — Perlin noise flow field', 8, p.height - 6)
        }
      }, mount)
    })

    return () => { sketchRef.current?.remove() }
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Activity size={20} />}
        title="p5.js"
        subtitle="p5@2.2 — creative coding, Perlin noise, flow fields, color modes, setup/draw loop"
        badge="Installed ✓"
      />
      <DemoCard title="p5.js — Perlin Noise Flow Field" status="ok" note="p5 v2 instance mode — noise(), colorMode(HSB), 60 particles following noise-driven angles">
        <div ref={mountRef} style={{ width: '100%' }} />
      </DemoCard>
    </div>
  )
}

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
export const ParticlesSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    cancelAnimationFrame(rafRef.current)

    // Use proton-engine for canvas particles
    import('proton-engine').then((ProtonModule) => {
      const Proton = (ProtonModule as any).default || ProtonModule
      const ctx = canvas.getContext('2d')!
      const W = canvas.clientWidth || 340, H = 220
      canvas.width = W; canvas.height = H

      const proton = new Proton()
      const emitter = new Proton.Emitter()
      emitter.rate = new Proton.Rate(new Proton.Span(4, 8), 0.1)

      emitter.addInitialize(new Proton.Mass(1))
      emitter.addInitialize(new Proton.Radius(2, 8))
      emitter.addInitialize(new Proton.Life(1.5, 3))
      emitter.addInitialize(new Proton.Position(new Proton.PointZone(W / 2, H / 2)))
      emitter.addInitialize(new Proton.Velocity(new Proton.Span(1.5, 4), new Proton.Span(0, 360), 'polar'))

      emitter.addBehaviour(new Proton.Alpha(1, 0))
      emitter.addBehaviour(new Proton.Scale(1, 0.2))
      emitter.addBehaviour(new Proton.Color(
        ['#a78bfa', '#60a5fa', '#f472b6'],
        ['#7c3aed', '#2563eb', '#be185d']
      ))
      emitter.addBehaviour(new Proton.Gravity(0.5))

      emitter.p.x = W / 2
      emitter.p.y = H / 2
      emitter.emit('once', true)

      const renderer = new Proton.CanvasRenderer(canvas)
      proton.addEmitter(emitter)
      proton.addRenderer(renderer)

      const tick = () => {
        rafRef.current = requestAnimationFrame(tick)
        ctx.fillStyle = 'rgba(9,9,11,0.25)'
        ctx.fillRect(0, 0, W, H)
        proton.update()
      }
      tick()

      return () => { cancelAnimationFrame(rafRef.current); proton.destroy() }
    }).catch(() => {/* fallback */})

    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Sparkles size={20} />}
        title="tsParticles + Proton Engine"
        subtitle="@tsparticles/react@4 · proton-engine@7 — particle systems, emitters, behaviours, WebGL renderer"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="Proton Engine — Canvas Particle Burst" status="ok" note="Emitter, Rate, Velocity, Alpha, Scale, Color, Gravity behaviours — CanvasRenderer">
          <canvas ref={canvasRef} className="vl-canvas" />
        </DemoCard>
        <DemoCard title="tsParticles + @tsparticles/react" status="info" note="Use <Particles> component with tsParticles engine config JSON — verified installed">
          <div className="vl-placeholder">
            <PackageBadge name="@tsparticles/react" version="4.0" />
            <p className="vl-placeholder-note">
              {'import { Particles } from "@tsparticles/react"'}<br/>
              {'<Particles options={{ particles: { number: { value: 80 } } }} />'}
            </p>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: TYPED.JS + ROUGH NOTATION + SPLITTING ──────────────────────────
export const TextFXSection = () => {
  const typedRef = useRef<HTMLSpanElement>(null)
  const roughRef = useRef<HTMLSpanElement>(null)
  const splitRef = useRef<HTMLDivElement>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const el = typedRef.current
    if (!el) return
    let instance: any = null

    import('typed.js').then(({ default: Typed }) => {
      instance = new Typed(el, {
        strings: [
          'Three.js scenes^500',
          'BabylonJS worlds^500',
          'PlayCanvas games^500',
          'PixiJS sprites^500',
          'Rapier physics^500',
          'Canvas APIs^500',
        ],
        typeSpeed: 45,
        backSpeed: 25,
        backDelay: 900,
        loop: true,
        showCursor: true,
        cursorChar: '█',
      })
    })

    return () => instance?.destroy()
  }, [resetKey])

  useEffect(() => {
    const el = roughRef.current
    if (!el) return

    import('rough-notation').then(({ annotate, annotationGroup }) => {
      const a1 = annotate(el, { type: 'highlight', color: 'rgba(167,139,250,0.35)', animate: true, animationDuration: 800 })
      setTimeout(() => a1.show(), 400)
    })
  }, [resetKey])

  useEffect(() => {
    const el = splitRef.current
    if (!el) return

    import('splitting').then(({ default: Splitting }) => {
      Splitting({ target: el, by: 'chars' })
      const chars = el.querySelectorAll('.char')
      chars.forEach((c, i) => {
        const ch = c as HTMLElement
        ch.style.cssText = `
          display: inline-block;
          animation: splitChar 0.6s ${i * 0.04}s both;
          color: hsl(${260 + i * 8}, 80%, 70%);
        `
      })
    })
  }, [resetKey])

  return (
    <div>
      <SectionHeader
        icon={<Code2 size={20} />}
        title="Text FX — Typed.js · Rough Notation · Splitting.js"
        subtitle="typed.js@3 · rough-notation@0.5 · splitting@1.1 — animated typewriter, hand-drawn annotations, char splits"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="Typed.js — Typewriter" status="ok" note="strings[], typeSpeed, backSpeed, loop, cursorChar — dynamic string cycling">
          <div className="vl-text-demo">
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Visual Lab renders </span>
            <span ref={typedRef} style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14 }} />
          </div>
        </DemoCard>
        <DemoCard title="Rough Notation — Hand-drawn Highlight" status="ok" note="annotate(), type: highlight — SVG-based hand-drawn annotation with animation">
          <div className="vl-text-demo">
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 2 }}>
              The{' '}
              <span ref={roughRef} style={{ padding: '0 4px' }}>
                Arkzen Visual Lab
              </span>{' '}
              tests all packages.
            </p>
          </div>
        </DemoCard>
        <DemoCard title="Splitting.js — Char Animation" status="ok" note="Splitting({ by: 'chars' }) — injects .char spans, per-char CSS animation with color gradient">
          <div className="vl-text-demo">
            <div ref={splitRef} className="vl-split-text">
              VISUAL LAB
            </div>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── SECTION: VANILLA TILT + LENIS + CONFETTI ─────────────────────────────────
export const UXSection = () => {
  const tiltRef = useRef<HTMLDivElement>(null)
  const { resetKey } = useVisualLabStore()

  useEffect(() => {
    const el = tiltRef.current
    if (!el) return
    let instance: any = null

    import('vanilla-tilt').then((VT) => {
      const VanillaTilt = (VT as any).default || VT
      VanillaTilt.init(el, {
        max: 25, speed: 400, glare: true, 'max-glare': 0.35,
        perspective: 800, scale: 1.04,
      })
      instance = (el as any).vanillaTilt
    })

    return () => instance?.destroy()
  }, [resetKey])

  const fireConfetti = useCallback(() => {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#a78bfa', '#60a5fa', '#f472b6', '#34d399'] })
      setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }), 250)
      setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 400)
    })
  }, [])

  const initLenis = useCallback(() => {
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
      const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
      requestAnimationFrame(raf)
      // Destroy after 3s to not conflict with page scroll
      setTimeout(() => lenis.destroy(), 3000)
    })
  }, [])

  return (
    <div>
      <SectionHeader
        icon={<MousePointer2 size={20} />}
        title="Vanilla Tilt · Lenis · Canvas Confetti"
        subtitle="vanilla-tilt@1.8 · lenis@1.3 · canvas-confetti@1.9 — 3D tilt, smooth scroll, celebration FX"
        badge="Installed ✓"
      />
      <div className="vl-demo-grid">
        <DemoCard title="Vanilla Tilt — 3D Card Tilt" status="ok" note="VanillaTilt.init — max, speed, glare, perspective, scale options. Hover the card.">
          <div className="vl-tilt-stage">
            <div ref={tiltRef} className="vl-tilt-card">
              <div className="vl-tilt-inner">
                <Box size={32} style={{ opacity: 0.8, color: '#a78bfa' }} />
                <p>Hover me</p>
                <small>vanilla-tilt</small>
              </div>
            </div>
          </div>
        </DemoCard>
        <DemoCard title="Canvas Confetti" status="ok" note="confetti() — particleCount, spread, origin, colors — multi-cannon burst">
          <div className="vl-btn-stage">
            <button className="vl-action-btn" onClick={fireConfetti}>
              🎊 Fire Confetti
            </button>
          </div>
        </DemoCard>
        <DemoCard title="Lenis Smooth Scroll" status="ok" note="new Lenis({ duration, easing }) + raf loop — silky smooth scroll physics. Activates for 3s.">
          <div className="vl-btn-stage">
            <button className="vl-action-btn" onClick={initLenis}>
              🌊 Init Lenis
            </button>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

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
export const LottieLazySection = () => {
  const [LottieComp, setLottieComp] = useState<React.ComponentType<any> | null>(null)
  const [animData, setAnimData] = useState<any>(null)
  const [playing, setPlaying] = useState(true)
  const lottieRef = useRef<any>(null)

  useEffect(() => {
    import('lottie-react').then(mod => setLottieComp(() => mod.default))
    // Built-in demo animation — a simple spinning arc (no external fetch needed)
    setAnimData({
      v: '5.5.7', fr: 60, ip: 0, op: 120, w: 200, h: 200, nm: 'Spinner', ddd: 0,
      assets: [],
      layers: [{
        ddd: 0, ind: 1, ty: 4, nm: 'Arc', sr: 1, ks: {
          o: { a: 0, k: 100 }, r: { a: 1, k: [{ i: { x: [0.83], y: [0.83] }, o: { x: [0.17], y: [0.17] }, t: 0, s: [0] }, { t: 120, s: [360] }] },
          p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0, shapes: [{
          ty: 'gr', it: [
            { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [120, 120] }, nm: 'Ellipse' },
            { ty: 'st', c: { a: 1, k: [{ t: 0, s: [0.4, 0.6, 1, 1] }, { t: 60, s: [0.8, 0.4, 1, 1] }, { t: 120, s: [0.4, 0.6, 1, 1] }] }, o: { a: 0, k: 100 }, w: { a: 0, k: 10 }, lc: 2, lj: 2, nm: 'Stroke' },
            { ty: 'tm', s: { a: 0, k: 10 }, e: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [10] }, { t: 60, s: [90] }, { t: 120, s: [10] }] }, o: { a: 0, k: 0 }, nm: 'Trim' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ], nm: 'Arc Group',
        }],
        ip: 0, op: 120, st: 0, bm: 0,
      }],
    })
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <SectionHeader icon="🎞" title="Lottie" subtitle="lottie-react — JSON-driven vector animations" badge="lottie-react" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
        {LottieComp && animData ? (
          <>
            <LottieComp
              lottieRef={lottieRef}
              animationData={animData}
              loop={true}
              autoplay={playing}
              style={{ width: 200, height: 200 }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => { setPlaying(p => !p); playing ? lottieRef.current?.pause() : lottieRef.current?.play() }}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}
              >
                {playing ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={() => lottieRef.current?.stop()}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}
              >
                ⏹ Stop
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Built-in demo animation — drop any Lottie JSON via <code>animationData</code> prop</p>
          </>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading lottie-react…</p>
        )}
      </div>
    </div>
  )
}

// ─── SECTION: SHADERS (shaders.com) ──────────────────────────────────────────
export const ShadersSection = () => {
  const [ShaderMod, setShaderMod] = useState<any>(null)
  const [activeDemo, setActiveDemo] = useState<'aurora' | 'plasma' | 'cursor' | 'glitch'>('aurora')
  const [speed, setSpeed] = useState(5)
  const [intensity, setIntensity] = useState(80)

  useEffect(() => {
    import('shaders/react').then(mod => setShaderMod(mod))
  }, [])

  const demos = [
    { id: 'aurora',  label: '🌌 Aurora',         desc: 'Aurora borealis — layered curtains + vertical rays' },
    { id: 'plasma',  label: '🔮 Plasma',          desc: 'Flowing plasma field — organic colour wave' },
    { id: 'cursor',  label: '🖱 Cursor Trail',    desc: 'FlowingGradient + interactive CursorTrail overlay' },
    { id: 'glitch',  label: '📺 Glitch',          desc: 'FractalNoise base + Glitch + CRTScreen stylize stack' },
  ] as const

  const renderDemo = () => {
    if (!ShaderMod) return <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingTop: '6rem' }}>Loading WebGPU shaders…</p>
    const { Shader, Aurora, Plasma, FlowingGradient, CursorTrail, FractalNoise, Glitch, CRTScreen, Vignette } = ShaderMod

    const canvasStyle = { width: '100%', height: '100%', borderRadius: '12px' }

    switch (activeDemo) {
      case 'aurora':
        return (
          <Shader style={canvasStyle}>
            <Aurora intensity={intensity} speed={speed} curtainCount={4} waviness={60} colorA="#a533f8" colorB="#22ee88" colorC="#1694e8" />
            <Vignette />
          </Shader>
        )
      case 'plasma':
        return (
          <Shader style={canvasStyle}>
            <Plasma speed={speed} intensity={intensity} colorA="#7c3aed" colorB="#db2777" colorC="#0ea5e9" />
            <Vignette />
          </Shader>
        )
      case 'cursor':
        return (
          <Shader style={canvasStyle}>
            <FlowingGradient speed={speed} colorA="#0f172a" colorB="#7c3aed" colorC="#06b6d4" />
            <CursorTrail />
          </Shader>
        )
      case 'glitch':
        return (
          <Shader style={canvasStyle}>
            <FractalNoise colorA="#0f172a" colorB="#1e1b4b" />
            <Glitch intensity={intensity * 0.5} speed={speed} />
            <CRTScreen />
            <Vignette />
          </Shader>
        )
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <SectionHeader icon="✨" title="Shaders" subtitle="shaders.com — declarative WebGPU effects for React" badge="shaders" />

      {/* Demo picker */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1.5rem 0 1rem' }}>
        {demos.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDemo(d.id)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', cursor: 'pointer',
              background: activeDemo === d.id ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.07)',
              border: activeDemo === d.id ? '1px solid rgba(124,58,237,0.8)' : '1px solid rgba(255,255,255,0.15)',
              color: '#fff', transition: 'all 0.2s',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ width: '100%', height: '340px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0f' }}>
        {renderDemo()}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          Speed — {speed}
          <input type="range" min={1} max={20} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ accentColor: '#7c3aed' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          Intensity — {intensity}
          <input type="range" min={10} max={100} value={intensity} onChange={e => setIntensity(Number(e.target.value))} style={{ accentColor: '#7c3aed' }} />
        </label>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '1rem' }}>
        {demos.find(d => d.id === activeDemo)?.desc} · Renders to a single {'<canvas>'} via WebGPU (falls back to WebGLv2)
      </p>
    </div>
  )
}

// ─── SECTION: CURTAINS ───────────────────────────────────────────────────────
export const CurtainsSection = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const curtainsRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let destroyed = false
    import('curtainsjs').then(({ Curtains, Plane }) => {
      if (destroyed || !mountRef.current) return
      try {
        const curtains = new Curtains({ container: mountRef.current, watchScroll: false })
        curtainsRef.current = curtains

        const vs = `
          precision mediump float;
          attribute vec3 aVertexPosition;
          attribute vec2 aTextureCoord;
          uniform mat4 uMVMatrix, uPMatrix;
          uniform mat4 planeTextureMatrix;
          varying vec3 vVertexPosition;
          varying vec2 vTextureCoord;
          uniform float uTime;
          void main() {
            vec3 pos = aVertexPosition;
            pos.z += sin(pos.x * 3.14159 + uTime * 0.05) * 0.1;
            vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
            vVertexPosition = pos;
            gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
          }`

        const fs = `
          precision mediump float;
          varying vec3 vVertexPosition;
          varying vec2 vTextureCoord;
          uniform float uTime;
          void main() {
            vec2 uv = vTextureCoord;
            vec3 col = 0.5 + 0.5 * cos(uTime * 0.03 + uv.xyx + vec3(0.0, 2.0, 4.0));
            gl_FragColor = vec4(col, 1.0);
          }`

        const planeEl = mountRef.current.querySelector('.curtains-plane') as HTMLElement
        if (planeEl) {
          new Plane(curtains, planeEl, {
            vertexShader: vs, fragmentShader: fs,
            uniforms: { uTime: { name: 'uTime', type: '1f', value: 0 } },
          })
        }
        curtains.onRender(() => {
          curtains.planes?.forEach((p: any) => { if (p.uniforms?.uTime) p.uniforms.uTime.value++ })
        })
        setLoaded(true)
      } catch (e: any) {
        setError(e.message)
      }
    }).catch(e => setError(e.message))
    return () => { destroyed = true; curtainsRef.current?.dispose() }
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <SectionHeader icon="🌊" title="CurtainsJS" subtitle="WebGL shader planes on HTML elements" badge="curtainsjs" />
      <div ref={mountRef} style={{ position: 'relative', width: '100%', height: '400px', marginTop: '2rem', borderRadius: '12px', overflow: 'hidden' }}>
        <div
          className="curtains-plane"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        {!loaded && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
            Initialising WebGL…
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>
            ⚠ {error}
          </div>
        )}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
        GLSL vertex wave + fragment colour cycle — no textures needed
      </p>
    </div>
  )
}

// ─── SECTION: HTML-IN-CANVAS (Google Chrome 148+) ────────────────────────────
export const HTMLCanvasSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [supported, setSupported] = useState<boolean | null>(null)
  const [mode, setMode] = useState<'2d' | 'webgl' | 'webgpu'>('2d')
  const [isRunning, setIsRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const rafRef = useRef<number>(0)

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-6), msg])

  useEffect(() => {
    // Detect support — canvas.onpaint and layoutsubtree are the signals
    const canvas = document.createElement('canvas')
    const has = 'onpaint' in canvas || (canvas as any).layoutsubtree !== undefined
    // Also check for drawElementImage
    const ctx2d = canvas.getContext('2d') as any
    const hasDrawElement = ctx2d && typeof ctx2d.drawElementImage === 'function'
    setSupported(has || hasDrawElement)
    addLog(hasDrawElement ? '✓ drawElementImage detected — Chrome 148+' : '⚠ HTML-in-Canvas not available in this browser. Needs Chrome 148+ with flag enabled.')
  }, [])

  const run2D = useCallback(() => {
    const canvas = canvasRef.current
    const formEl = formRef.current
    if (!canvas || !formEl) return
    cancelAnimationFrame(rafRef.current)

    const ctx = canvas.getContext('2d') as any
    if (!ctx?.drawElementImage) {
      addLog('✗ ctx.drawElementImage not available — enable chrome://flags/#canvas-draw-element in Chrome 148+')
      return
    }

    setIsRunning(true)
    addLog('▶ Running HTML-in-Canvas 2D mode')

    // Step 1: Add layoutsubtree attribute
    canvas.setAttribute('layoutsubtree', '')
    addLog('✓ layoutsubtree attribute set on <canvas>')

    // Step 3: Size canvas to device pixel ratio
    const dpr = window.devicePixelRatio || 1
    canvas.width  = canvas.clientWidth  * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.scale(dpr, dpr)
    addLog(`✓ Canvas sized to ${canvas.width}×${canvas.height} (DPR ${dpr})`)

    let angle = 0
    const paint = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

      // Background
      ctx.fillStyle = '#0a0a10'
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

      // Rotating gradient ring (pure 2D context, behind the DOM element)
      ctx.save()
      ctx.translate(canvas.clientWidth / 2, canvas.clientHeight / 2)
      ctx.rotate(angle)
      const grad = ctx.createLinearGradient(-80, 0, 80, 0)
      grad.addColorStop(0, 'rgba(167,139,250,0.6)')
      grad.addColorStop(1, 'rgba(96,165,250,0.6)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(0, 0, 80, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      angle += 0.02

      // Step 2: Draw the DOM element INTO the canvas
      const transform = ctx.drawElementImage(formEl, canvas.clientWidth / 2 - 100, canvas.clientHeight / 2 - 50)

      // Step 3: Apply transform so browser knows element's screen position (for events)
      if (transform) {
        formEl.style.transform = transform.toString()
        addLog(`✓ transform applied: ${transform.toString().slice(0, 40)}…`)
      }
    }

    // canvas.onpaint fires whenever the element redraws (input, focus, hover, etc.)
    ;(canvas as any).onpaint = paint
    addLog('✓ canvas.onpaint handler registered')

    // Kick off first render
    paint()
  }, [])

  const stopDemo = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setIsRunning(false)
    const canvas = canvasRef.current
    if (canvas) (canvas as any).onpaint = null
    addLog('■ Demo stopped')
  }, [])

  return (
    <div>
      <SectionHeader
        icon={<FlaskConical size={20} />}
        title="HTML-in-Canvas API"
        subtitle="Chrome Origin Trial — Chrome 148+ · chrome://flags/#canvas-draw-element · ctx.drawElementImage() / texElementImage2D / copyElementImageToTexture"
        badge="Experimental"
      />

      {/* Support indicator */}
      <div className={`vl-support-banner ${supported === true ? 'ok' : supported === false ? 'warn' : 'neutral'}`}>
        {supported === true  && <><Check size={15} /> HTML-in-Canvas API detected in this browser</>}
        {supported === false && <><AlertCircle size={15} /> Not detected — enable chrome://flags/#canvas-draw-element in Chrome 148+</>}
        {supported === null  && <><Info size={15} /> Checking browser support…</>}
      </div>

      {/* What is this? */}
      <div className="vl-hic-explainer">
        <h3>What is the HTML-in-Canvas API?</h3>
        <p>
          A new Chrome experiment (origin trial, Chrome 148–150) that lets you draw DOM content
          directly into a 2D canvas or WebGL/WebGPU texture while keeping it <strong>interactive,
          accessible, and indexable</strong>. No more choosing between DOM richness and canvas performance.
        </p>
        <div className="vl-hic-grid">
          <div className="vl-hic-col">
            <h4>Three shapes</h4>
            {[
              { api: 'ctx.drawElementImage(el, x, y)', ctx: '2D Canvas' },
              { api: 'gl.texElementImage2D(target, …, el)', ctx: 'WebGL' },
              { api: 'device.queue.copyElementImageToTexture(el, …)', ctx: 'WebGPU' },
            ].map(({ api, ctx }) => (
              <div key={api} className="vl-hic-api-row">
                <code>{api}</code>
                <span className="vl-badge">{ctx}</span>
              </div>
            ))}
          </div>
          <div className="vl-hic-col">
            <h4>What you get for free</h4>
            {[
              'Text selection & copy/paste inside 3D scenes',
              'Find-in-page (Ctrl+F) searches canvas text',
              'Screen reader / accessibility tree',
              'Browser extensions (translate, autofill)',
              'DevTools inspector for WebGL textures',
              'AI agent & crawler indexability',
            ].map(f => (
              <div key={f} className="vl-feature-item"><Check size={11} color="#4ade80" /> {f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Three phases explained */}
      <div className="vl-hic-steps">
        <h3>Three phases (per Google's docs)</h3>
        <div className="vl-step">
          <span className="vl-step-num">1</span>
          <div>
            <strong>Canvas setup</strong> — add <code>layoutsubtree</code> attribute to <code>&lt;canvas&gt;</code>,
            resize to device pixel ratio via <code>ResizeObserver</code>
          </div>
        </div>
        <div className="vl-step">
          <span className="vl-step-num">2</span>
          <div>
            <strong>Render DOM into canvas</strong> — call <code>ctx.drawElementImage(domElement, x, y)</code>
            inside <code>canvas.onpaint</code> (fires on repaint). For WebGL: <code>gl.texElementImage2D()</code>.
            For WebGPU: <code>device.queue.copyElementImageToTexture()</code>
          </div>
        </div>
        <div className="vl-step">
          <span className="vl-step-num">3</span>
          <div>
            <strong>Sync CSS transform</strong> — apply the return value of <code>drawElementImage()</code>
            to <code>element.style.transform</code> so the browser maps click/hover zones correctly
          </div>
        </div>
      </div>

      {/* Live demo */}
      <DemoCard
        title="Live 2D Context Demo — Form element rendered into canvas"
        status={supported ? 'ok' : 'warn'}
        note="Requires Chrome 148+ with chrome://flags/#canvas-draw-element enabled"
      >
        <div className="vl-hic-demo">
          {/* The DOM element that gets drawn INTO the canvas */}
          <div
            ref={formRef}
            className="vl-hic-form"
            style={{ position: 'absolute', zIndex: -1, pointerEvents: isRunning ? 'auto' : 'none' }}
          >
            <label>Name</label>
            <input type="text" placeholder="Type here (stays interactive!)" defaultValue="Arkzen" />
            <label>Role</label>
            <select defaultValue="dev">
              <option value="dev">Developer</option>
              <option value="designer">Designer</option>
            </select>
          </div>

          {/* The canvas that receives the drawn DOM */}
          <canvas
            ref={canvasRef}
            className="vl-hic-canvas"
            style={{ width: '100%', height: 220 }}
          />

          <div className="vl-hic-controls">
            <div className="vl-mode-tabs">
              {(['2d', 'webgl', 'webgpu'] as const).map(m => (
                <button
                  key={m}
                  className={`vl-tab ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            {!isRunning
              ? <button className="vl-action-btn" onClick={run2D} disabled={mode !== '2d'}>
                  ▶ Run {mode.toUpperCase()} Demo
                </button>
              : <button className="vl-action-btn danger" onClick={stopDemo}>■ Stop</button>
            }
          </div>

          {/* PlayCanvas note */}
          {mode === 'webgl' && (
            <div className="vl-script-note">
              <Info size={13} />
              <span>
                PlayCanvas ships native HTML-in-Canvas support via <code>htmlTexture.setSource(domElement)</code> + the <code>paint</code> event.
                See <code>PlayCanvasSection</code> above — <code>canvas.addEventListener('paint', () =&gt; htmlTexture.setSource(el))</code>
              </span>
            </div>
          )}
          {mode === 'webgpu' && (
            <div className="vl-script-note">
              <Info size={13} />
              <span>
                WebGPU variant: <code>device.queue.copyElementImageToTexture(domElement, {'{ texture: targetTexture }'})</code>
                — analogous to <code>copyExternalImageToTexture</code>
              </span>
            </div>
          )}

          {/* Debug log */}
          <div className="vl-log">
            {log.map((l, i) => <div key={i} className="vl-log-line">{l}</div>)}
          </div>
        </div>
      </DemoCard>

      {/* Limitations */}
      <div className="vl-hic-limits">
        <h4>Known Limitations</h4>
        <div className="vl-feature-item"><AlertCircle size={12} color="#facc15" /> Cross-origin iframes: not supported (security)</div>
        <div className="vl-feature-item"><AlertCircle size={12} color="#facc15" /> Scrolling is JS-driven — no off-thread scroll like normal DOM</div>
        <div className="vl-feature-item"><Info size={12} color="#60a5fa" /> Only Chrome 148–150 origin trial for now (May 2026)</div>
        <div className="vl-feature-item"><Info size={12} color="#60a5fa" /> Three.js THREE.HTMLTexture and PlayCanvas htmlTexture already ship support</div>
      </div>
    </div>
  )
}

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  const { activeSection, setActiveSection } = useVisualLabStore()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = visualLabAnimations(pageRef)
    return cleanup
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'three-r3f':    return <ThreeR3FSection />
      case 'babylonjs':    return <BabylonSection />
      case 'playcanvas':   return <PlayCanvasSection />
      case 'ogl':          return <OGLSection />
      case 'pixi':         return <PixiSection />
      case 'konva':        return <KonvaSection />
      case 'fabric':       return <FabricSection />
      case 'p5':           return <P5Section />
      case 'regl':         return <REGLSection />
      case 'twgl':         return <TWGLSection />
      case 'phaser':       return <PhaserSection />
      case 'matter':       return <MatterSection />
      case 'rapier':       return <RapierSection />
      case 'particles':    return <ParticlesSection />
      case 'proton':       return <ParticlesSection />
      case 'lottie':       return <LottieLazySection />
      case 'confetti':     return <UXSection />
      case 'typed':        return <TextFXSection />
      case 'troika':       return <TextFXSection />
      case 'splitting':    return <TextFXSection />
      case 'rough':        return <TextFXSection />
      case 'vanilla-tilt': return <UXSection />
      case 'lenis':        return <UXSection />
      case 'curtains':     return <CurtainsSection />
      case 'shaders':      return <ShadersSection />
      case 'script-dsl':   return <ScriptDSLSection />
      case 'html-canvas':  return <HTMLCanvasSection />
      default:             return <ThreeR3FSection />
    }
  }

  // Group nav items
  const groups = [...new Set(NAV_SECTIONS.map(s => s.group))]

  return (
    <div ref={pageRef} className="vl-root">
      {/* Sidebar */}
      <aside className="vl-sidebar">
        <div className="vl-logo">
          <h1>🔬 Visual Lab</h1>
          <p>All graphics packages · Script DSL · HTML-in-Canvas</p>
        </div>
        {groups.map(group => (
          <div key={group}>
            <div className="vl-nav-group">{group}</div>
            {NAV_SECTIONS.filter(s => s.group === group).map(s => (
              <div
                key={s.id}
                className={`vl-nav-item ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span style={{ fontSize: 13 }}>{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="vl-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_VisualLab_Index() {
  const props   = usePage<VisualLabIndexProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = visualLabAnimations(pageRef)
    return cleanup
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <IndexPage {...props} />
    </motion.div>
  )

  return <GuestLayout>{content}</GuestLayout>
}

export default ArkzenPage_VisualLab_Index
