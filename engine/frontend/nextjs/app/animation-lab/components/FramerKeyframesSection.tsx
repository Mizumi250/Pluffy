'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — FramerKeyframesSection
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:32:54.296Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import type { AnimLabState } from './types'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── FRAMER KEYFRAMES ─────────────────────────────────────────────────────────
export const FramerKeyframesSection = () => {
  return (
    <div>
      <SectionHeader
        icon={<Wind size={20} />}
        title="Framer Motion Keyframes"
        subtitle="Array-based keyframes, custom timing, orchestration"
        color="#f43f5e"
      />
      <div className="demo-grid">
        <DemoCard title="Pulse Keyframes" description="opacity cycles [1, 0.3, 1]">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 60, height: 60, borderRadius: '50%', background: '#f43f5e' }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Bounce Path" description="y keyframes: [0, -40, 0, -20, 0]">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              animate={{ y: [0, -40, 0, -20, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.3, 0.6, 0.8, 1] }}
              style={{ width: 40, height: 40, borderRadius: '50%', background: '#f97316' }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Color Cycle" description="Background cycles through color spectrum">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              animate={{ background: ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#a855f7', '#f43f5e'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Border Radius Morph" description="Shape morphs between values">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              animate={{ borderRadius: ['12px', '50%', '12px 50%', '50% 12px', '12px'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 70, height: 70, background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Wave Bars" description="Staggered height keyframes">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 6, height: 60 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                style={{
                  width: 10, height: 50, borderRadius: 5, transformOrigin: 'bottom',
                  background: `hsl(${200 + i * 30}, 80%, 60%)`
                }}
              />
            ))}
          </div>
        </DemoCard>
        <DemoCard title="Orbit" description="x/y keyframes create circular path">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80, position: 'relative' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', position: 'absolute' }} />
            <motion.div
              animate={{ x: [40, 0, -40, 0, 40], y: [0, 40, 0, -40, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 16, height: 16, borderRadius: '50%', background: '#eab308', position: 'absolute' }}
            />
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── FRAMER DRAG ──────────────────────────────────────────────────────────────
