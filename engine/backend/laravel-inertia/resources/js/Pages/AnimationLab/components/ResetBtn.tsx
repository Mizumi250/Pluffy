// ============================================================
// ARKZEN GENERATED COMPONENT — ResetBtn [React+Inertia]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:27:16.857Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'

// ─── RESET BUTTON ─────────────────────────────────────────────────────────────
export const ResetBtn = ({ onClick }: { onClick: () => void }) => (
  <button className="reset-btn" onClick={onClick} title="Reset animation">
    <RotateCcw size={14} />
  </button>
)

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
