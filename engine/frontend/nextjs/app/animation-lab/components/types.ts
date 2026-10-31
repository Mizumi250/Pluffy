// ============================================================
// ARKZEN GENERATED TYPES — animation-lab
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:20:31.978Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'

// ─── ZUSTAND STORE ────────────────────────────────────────────────────────────
export interface AnimLabState {
  activeSection: string
  setActiveSection: (s: string) => void
  playingDemo: string | null
  setPlayingDemo: (id: string | null) => void
  resetKey: number
  triggerReset: () => void
}
