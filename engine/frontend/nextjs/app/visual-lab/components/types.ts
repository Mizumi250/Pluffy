// ============================================================
// ARKZEN GENERATED TYPES — visual-lab
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:00:03.054Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from '@/arkzen/generated/visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'

// ─── STORE ────────────────────────────────────────────────────────────────────
export interface VisualLabState {
  activeSection: string
  setActiveSection: (s: string) => void
  resetKey: number
  triggerReset: () => void
  htmlCanvasSupported: boolean | null
  setHtmlCanvasSupported: (v: boolean) => void
}
