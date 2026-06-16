// ============================================================
// ARKZEN GENERATED COMPONENT — FramerDragSection [React+Vite]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:38.675Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { constraintsRef, ref, scale, x, y } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── FRAMER DRAG ──────────────────────────────────────────────────────────────
export const FramerDragSection = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const constraintsRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      <SectionHeader
        icon={<Move size={20} />}
        title="Framer Motion Drag"
        subtitle="drag, dragConstraints, dragElastic, dragMomentum"
        color="#8b5cf6"
      />
      <div className="demo-grid">
        <DemoCard title="Free Drag" description="Unconstrained drag with momentum">
          <div ref={constraintsRef} style={{ height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              whileDrag={{ scale: 1.15, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)' }}
              style={{
                width: 50, height: 50, borderRadius: 10, cursor: 'grab',
                background: '#8b5cf6', position: 'absolute', top: 35, left: '50%', marginLeft: -25
              }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Drag Axis X" description="Constrained to horizontal axis">
          <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.15)', position: 'absolute' }} />
            <motion.div
              drag="x"
              dragConstraints={{ left: -80, right: 80 }}
              dragElastic={0.15}
              whileDrag={{ scale: 1.2 }}
              style={{
                width: 44, height: 44, borderRadius: '50%', cursor: 'grab',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                boxShadow: '0 4px 20px rgba(139,92,246,0.4)'
              }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Drag Snap" description="Snaps back to origin on release">
          <div style={{ display: 'flex', justifyContent: 'center', height: 80, alignItems: 'center' }}>
            <motion.div
              drag
              dragSnapToOrigin
              dragElastic={0.5}
              whileDrag={{ scale: 1.2, borderRadius: '50%' }}
              style={{
                width: 50, height: 50, borderRadius: 10, cursor: 'grab',
                background: 'linear-gradient(135deg, #10b981, #0ea5e9)'
              }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Inertia / Velocity" description="dragMomentum with inertia">
          <div style={{ display: 'flex', justifyContent: 'center', height: 80, alignItems: 'center' }}>
            <motion.div
              drag
              dragConstraints={{ left: -60, right: 60, top: -20, bottom: 20 }}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
              style={{
                width: 50, height: 50, borderRadius: '50%', cursor: 'grab',
                background: 'linear-gradient(135deg, #f59e0b, #f43f5e)'
              }}
            />
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── FRAMER SCROLL ────────────────────────────────────────────────────────────
