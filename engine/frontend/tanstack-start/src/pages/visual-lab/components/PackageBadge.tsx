// ============================================================
// ARKZEN GENERATED COMPONENT — PackageBadge [TanStack]
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:29:01.663Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'

export const PackageBadge = ({ name, version }: { name: string; version?: string }) => (
  <span className="vl-pkg-badge">{name}{version ? ` ${version}` : ''}</span>
)

// ─── SECTION: THREE.JS + R3F ──────────────────────────────────────────────────
