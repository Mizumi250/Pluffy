// ============================================================
// ARKZEN GENERATED HOOKS — visual-lab [React+Vite]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T06:35:39.988Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'

export const useVisualLabStore = create<VisualLabState>((set) => ({
  activeSection: 'three-r3f',
  setActiveSection: (s) => set({ activeSection: s }),
  resetKey: 0,
  triggerReset: () => set((s) => ({ resetKey: s.resetKey + 1 })),
  htmlCanvasSupported: null,
  setHtmlCanvasSupported: (v) => set({ htmlCanvasSupported: v }),
}))

// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
