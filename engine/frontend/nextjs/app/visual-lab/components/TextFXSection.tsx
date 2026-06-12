'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — TextFXSection
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
