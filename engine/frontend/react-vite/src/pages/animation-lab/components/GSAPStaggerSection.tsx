// ============================================================
// ARKZEN GENERATED COMPONENT — GSAPStaggerSection [React+Vite]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T13:13:33.814Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { ctx, i, opacity, ref, scale, x, y } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── GSAP STAGGER ─────────────────────────────────────────────────────────────
export const GSAPStaggerSection = () => {
  const [key, setKey] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Linear stagger
      gsap.from('.stagger-linear .stg-item', { opacity: 0, y: 30, duration: 0.5, stagger: 0.08, ease: 'power3.out' })
      // From center stagger
      gsap.from('.stagger-center .stg-item', { opacity: 0, scale: 0, duration: 0.5, stagger: { each: 0.07, from: 'center' }, ease: 'back.out(2)', delay: 0.3 })
      // From end stagger
      gsap.from('.stagger-end .stg-item', { opacity: 0, x: 40, duration: 0.5, stagger: { each: 0.06, from: 'end' }, ease: 'power2.out', delay: 0.6 })
      // Grid stagger
      gsap.from('.stagger-grid .stg-item', {
        opacity: 0, scale: 0.3, rotation: 45, duration: 0.4,
        stagger: { amount: 0.8, grid: [3, 4], from: 'center' },
        ease: 'back.out(2)', delay: 0.9
      })
      // Yoyo repeat stagger
      gsap.fromTo('.stagger-yoyo .stg-item',
        { opacity: 0.2, scaleY: 0.3 },
        {
          opacity: 1, scaleY: 1, duration: 0.4, stagger: { each: 0.07, yoyo: true, repeat: 2 },
          ease: 'power2.inOut', delay: 1.2
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [key])

  return (
    <div ref={ref} key={key}>
      <SectionHeader
        icon={<Layers size={20} />}
        title="GSAP Stagger"
        subtitle="from: linear, center, end, grid — with yoyo and repeat"
        color="#f59e0b"
      />
      <div className="demo-grid">
        {[
          { cls: 'stagger-linear', label: 'Linear (default)', items: 6 },
          { cls: 'stagger-center', label: 'From Center',      items: 7 },
          { cls: 'stagger-end',    label: 'From End',         items: 6 },
          { cls: 'stagger-yoyo',   label: 'Yoyo Repeat',     items: 8 },
        ].map(({ cls, label, items }) => (
          <DemoCard key={cls} title={label} description={`stagger { from: '${cls.split('-')[1]}' }`}>
            <div className={`${cls}`} style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: items }, (_, i) => (
                <div key={i} className="stg-item" style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: `hsl(${40 + i * 15}, 90%, 55%)`, flexShrink: 0
                }} />
              ))}
            </div>
          </DemoCard>
        ))}
        <DemoCard title="Grid Stagger (3×4)" description="2D grid stagger from center">
          <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="stg-item" style={{
                aspectRatio: '1', borderRadius: 8,
                background: `hsl(${i * 25}, 80%, 60%)`,
              }} />
            ))}
          </div>
        </DemoCard>
        <DemoCard title="Reset" description="Re-run all stagger demos">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
            <button className="play-btn" onClick={() => setKey(k => k + 1)}>
              <RotateCcw size={14} /> Replay All
            </button>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── GSAP HOVER & 3D ─────────────────────────────────────────────────────────
