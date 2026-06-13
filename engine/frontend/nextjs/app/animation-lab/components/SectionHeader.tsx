'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — SectionHeader
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T02:03:39.739Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export const SectionHeader = ({
  icon, title, subtitle, color
}: {
  icon: React.ReactNode; title: string; subtitle: string; color: string
}) => (
  <div className="section-header" style={{ '--accent': color } as React.CSSProperties}>
    <div className="section-header-icon">{icon}</div>
    <div>
      <h2 className="section-header-title">{title}</h2>
      <p className="section-header-sub">{subtitle}</p>
    </div>
  </div>
)

// ─── GSAP ENTRANCE DEMOS ──────────────────────────────────────────────────────
