'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — animation-lab
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:06.938Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import type { AnimLabState } from './types'

export const useAnimLabStore = create<AnimLabState>((set) => ({
  activeSection: 'gsap-entrance',
  setActiveSection: (s) => set({ activeSection: s }),
  playingDemo: null,
  setPlayingDemo: (id) => set({ playingDemo: id }),
  resetKey: 0,
  triggerReset: () => set((s) => ({ resetKey: s.resetKey + 1 })),
}))

// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
