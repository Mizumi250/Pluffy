'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — FramerVariantsSection
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T00:54:01.939Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { containerVariants, fadeSlide, itemVariants, opacity, rotateIn, scale, scaleBounce, x, y } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

/DemoCard>
      </div>
    </div>
  )
}

// ─── FRAMER MOTION VARIANTS ───────────────────────────────────────────────────
export const FramerVariantsSection = () => {
  const [visible, setVisible] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -16, scale: 0.9 }
  }

  const fadeSlide = {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
  }

  const scaleBounce = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
    exit: { scale: 0, opacity: 0 }
  }

  const rotateIn = {
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 200 } },
    exit: { rotate: 180, opacity: 0 }
  }

  return (
    <div>
      <SectionHeader
        icon={<Sparkles size={20} />}
        title="Framer Motion Variants"
        subtitle="Stagger containers, orchestrated children, AnimatePresence"
        color="#f59e0b"
      />
      <DemoCard title="Stagger Container" description="Parent orchestrates children with staggerChildren">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <button className="play-btn" onClick={() => setVisible(v => !v)}>
            {visible ? 'Hide' : 'Animate In'}
          </button>
        </div>
        <AnimatePresence>
          {visible && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map(w => (
                <motion.div
                  key={w}
                  variants={itemVariants}
                  className="anim-pill"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  {w}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </DemoCard>
      <div className="demo-grid">
        {[
          { label: 'Fade + Slide', vars: fadeSlide, bg: '#3b82f6' },
          { label: 'Scale Bounce', vars: scaleBounce, bg: '#10b981' },
          { label: 'Rotate In',   vars: rotateIn, bg: '#a855f7' },
        ].map(({ label, vars, bg }) => {
          const [on, setOn] = useState(true)
          return (
            <DemoCard key={label} title={label} description="AnimatePresence entrance/exit">
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <button className="play-btn" onClick={() => setOn(v => !v)} style={{ fontSize: 12, padding: '6px 14px' }}>
                  Toggle
                </button>
              </div>
              <div style={{ height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                  {on && (
                    <motion.div
                      key={label}
                      initial={vars.initial}
                      animate={vars.animate}
                      exit={vars.exit}
                      style={{ width: 80, height: 40, borderRadius: 8, background: bg }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </DemoCard>
          )
        })}
      </div>
    </div>
  )
}

// ─── FRAMER GESTURES ──────────────────
