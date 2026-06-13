// ============================================================
// ARKZEN GENERATED COMPONENT — SectionHeader
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T06:25:14.592Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from './visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'

// ─── SHARED UI ────────────────────────────────────────────────────────────────
export const SectionHeader = ({ icon, title, subtitle, badge }: {
  icon: React.ReactNode; title: string; subtitle: string; badge?: string
}) => (
  <div className="vl-section-header">
    <div className="vl-section-icon">{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 className="vl-section-title">{title}</h2>
        {badge && <span className="vl-badge">{badge}</span>}
      </div>
      <p className="vl-section-sub">{subtitle}</p>
    </div>
  </div>
)
