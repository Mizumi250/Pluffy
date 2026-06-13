// ============================================================
// ARKZEN GENERATED COMPONENT — ShadersSection [React+Vite]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T14:30:34.711Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import { canvas, canvasStyle, curtains, demos, label, renderDemo } from './utils'
import { SectionHeader } from './SectionHeader'

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
