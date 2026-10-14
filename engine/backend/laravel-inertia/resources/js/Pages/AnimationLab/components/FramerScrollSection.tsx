// ============================================================
// ARKZEN GENERATED COMPONENT — FramerScrollSection [React+Inertia]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:19.581Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { DemoCard } from './DemoCard'
import { ParallaxDemo } from './ParallaxDemo'
import { ScrollTransformDemo } from './ScrollTransformDemo'
import { SectionHeader } from './SectionHeader'

// ─── FRAMER SCROLL ────────────────────────────────────────────────────────────
export const FramerScrollSection = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <div>
      <SectionHeader
        icon={<ArrowDown size={20} />}
        title="Framer Motion Scroll"
        subtitle="useScroll, useTransform, useSpring — scroll-linked animations"
        color="#0ea5e9"
      />
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, #0ea5e9, #a855f7)',
          transformOrigin: '0%', scaleX, zIndex: 999,
        }}
      />
      <div className="demo-grid">
        <DemoCard title="Scroll Progress Bar" description="Fixed progress indicator using useScroll + useSpring">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' }}>
            See the blue bar at the top of the page — it fills as you scroll.
          </p>
        </DemoCard>
        <DemoCard title="useTransform Range" description="Map scroll 0→1 to opacity 0→1 and scale">
          <ScrollTransformDemo />
        </DemoCard>
        <DemoCard title="Parallax Layers" description="Different layers scroll at different speeds">
          <ParallaxDemo />
        </DemoCard>
      </div>
    </div>
  )
}
