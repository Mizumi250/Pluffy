'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — DemoCard
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T01:34:01.608Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'

// ─── SHARED DEMO WRAPPER ──────────────────────────────────────────────────────
export const DemoCard = ({
  title, description, children, className = ''
}: {
  title: string; description: string; children: React.ReactNode; className?: string
}) => (
  <div className={`demo-card ${className}`}>
    <div className="demo-card-header">
      <h3 className="demo-card-title">{title}</h3>
      <p className="demo-card-desc">{description}</p>
    </div>
    <div className="demo-card-stage">{children}</div>
  </div>
)

// ─── RESET BUTTON ─────────────────────────────────────────────────────────
