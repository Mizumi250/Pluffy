'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — DemoCard
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:36.232Z
// ============================================================

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VisualLabColors } from '@/arkzen/generated/visual-lab.scripts'
import { gsap } from 'gsap'
import { Activity, AlertCircle, Atom, Box, Check, ChevronRight, Circle, Code2, Cpu, Eye, FlaskConical, Globe, Info, Layers, Monitor, MousePointer2, Palette, Play, RefreshCw, Sparkles, Square, Triangle, Wind, X, Zap } from 'lucide-react'
import * as THREE from 'three'
import { create } from 'zustand'
import type { VisualLabState } from './types'

export const DemoCard = ({ title, children, status, note }: {
  title: string; children: React.ReactNode; status?: 'ok' | 'warn' | 'info'; note?: string
}) => (
  <div className="vl-demo-card">
    <div className="vl-demo-card-header">
      <span className="vl-demo-card-title">{title}</span>
      {status === 'ok'   && <Check size={13} color="#4ade80" />}
      {status === 'warn' && <AlertCircle size={13} color="#facc15" />}
      {status === 'info' && <Info size={13} color="#60a5fa" />}
    </div>
    <div className="vl-demo-stage">{children}</div>
    {note && <p className="vl-demo-note">{note}</p>}
  </div>
)
