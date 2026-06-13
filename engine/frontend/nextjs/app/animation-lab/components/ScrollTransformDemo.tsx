'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ScrollTransformDemo
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T00:54:01.955Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { opacity, ref, scale } from './utils'
import { DemoCard } from './DemoCard'
import { ParallaxDemo } from './ParallaxDemo'

<ParallaxDemo />
        </DemoCard>
      </div>
    </div>
  )
}

export const ScrollTransformDemo = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5])
  return (
    <div ref={ref} style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div style={{ opacity, scale, width: 80, height
