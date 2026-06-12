'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — CurtainsSection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T08:48:16.293Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'

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
