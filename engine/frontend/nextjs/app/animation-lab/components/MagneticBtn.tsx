'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — MagneticBtn
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:26:40.284Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { r, springX, springY, x, y } from './utils'

export const MagneticBtn = () => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <motion.button
        style={{ x: springX, y: springY }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          x.set((e.clientX - r.left - r.width / 2) * 0.3)
          y.set((e.clientY - r.top - r.height / 2) * 0.3)
        }}
        onMouseLeave={() => { x.set(0); y.set(0) }}
        className="play-btn"
      >
        🧲 FM Magnetic
      </motion.button>
    </div>
  )
}

// ─── FRAMER LAYOUT ────────────────────────────────────────────────────────────
