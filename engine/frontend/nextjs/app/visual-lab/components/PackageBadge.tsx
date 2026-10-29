'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PackageBadge
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:09:08.679Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from '@/arkzen/generated/visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import type { VisualLabState } from './types'

export const PackageBadge = ({ name, version }: { name: string; version?: string }) => (
  <span className="vl-pkg-badge">{name}{version ? ` ${version}` : ''}</span>
)

// ─── SECTION: THREE.JS + R3F ──────────────────────────────────────────────────
