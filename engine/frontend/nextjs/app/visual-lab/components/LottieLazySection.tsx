'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — LottieLazySection
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T13:50:41.238Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from '@/arkzen/generated/visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import type { VisualLabState } from './types'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: LOTTIE ─────────────────────────────────────────────────────────
export const LottieLazySection = () => {
  const [LottieComp, setLottieComp] = useState<React.ComponentType<any> | null>(null)
  const [animData, setAnimData] = useState<any>(null)
  const [playing, setPlaying] = useState(true)
  const lottieRef = useRef<any>(null)

  useEffect(() => {
    import('lottie-react').then(mod => setLottieComp(() => mod.Lottie))
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
