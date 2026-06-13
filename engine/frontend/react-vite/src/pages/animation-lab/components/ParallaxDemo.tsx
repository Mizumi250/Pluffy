// ============================================================
// ARKZEN GENERATED COMPONENT — ParallaxDemo [React+Vite]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:43:48.126Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { y, y1, y2 } from './utils'

export const ParallaxDemo = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -80])
  const y2 = useTransform(scrollY, [0, 1000], [0, -160])
  return (
    <div style={{ height: 80, position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
      <motion.div style={{ y: y1, position: 'absolute', inset: 0, background: 'rgba(14,165,233,0.2)', borderRadius: 10 }} />
      <motion.div style={{ y: y2, position: 'absolute', inset: 12, background: 'rgba(168,85,247,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Faster</span>
      </motion.div>
    </div>
  )
}

// ─── CSS KEYFRAMES SECTION ────────────────────────────────────────────────────
