// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — animation-lab
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:06.932Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import type { AnimLabState } from './types'


// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
export const NAV_SECTIONS = [
  { id: 'gsap-entrance',    label: 'GSAP Entrance',      icon: '▶' },
  { id: 'gsap-scroll',      label: 'GSAP ScrollTrigger', icon: '↕' },
  { id: 'gsap-timeline',    label: 'GSAP Timeline',      icon: '⏱' },
  { id: 'gsap-stagger',     label: 'GSAP Stagger',       icon: '⠿' },
  { id: 'gsap-hover-3d',    label: 'GSAP Hover / 3D',    icon: '⟲' },
  { id: 'framer-variants',  label: 'FM Variants',        icon: '✦' },
  { id: 'framer-gestures',  label: 'FM Gestures',        icon: '👆' },
  { id: 'framer-layout',    label: 'FM Layout',          icon: '⊞' },
  { id: 'framer-keyframes', label: 'FM Keyframes',       icon: '◈' },
  { id: 'framer-drag',      label: 'FM Drag',            icon: '↔' },
  { id: 'framer-scroll',    label: 'FM Scroll',          icon: '⟳' },
  { id: 'css-keyframes',    label: 'CSS Keyframes',      icon: '⊛' },
  { id: 'css-transitions',  label: 'CSS Transitions',    icon: '⇄' },
  { id: 'css-transforms',   label: 'CSS Transforms',     icon: '⬡' },
  { id: 'css-custom-props', label: 'CSS Variables',      icon: '◇' },
]

// ─── SHARED DEMO WRAPPER ──────────────────────────────────────────────────────
