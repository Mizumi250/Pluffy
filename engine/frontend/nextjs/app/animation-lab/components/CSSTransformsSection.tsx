'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — CSSTransformsSection
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:20:32.382Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import type { AnimLabState } from './types'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── CSS TRANSFORMS ───────────────────────────────────────────────────────────
export const CSSTransformsSection = () => (
  <div>
    <SectionHeader
      icon={<Eye size={20} />}
      title="CSS Transforms"
      subtitle="translate, rotate, scale, skew, perspective, matrix — hover activated"
      color="#a855f7"
    />
    <div className="demo-grid">
      {[
        { cls: 'css-tr-translate',    label: 'translate()',       desc: 'X/Y translate on hover' },
        { cls: 'css-tr-rotate',       label: 'rotate()',          desc: '45deg on hover' },
        { cls: 'css-tr-scale',        label: 'scale()',           desc: '1.3x on hover' },
        { cls: 'css-tr-skew',         label: 'skew()',            desc: 'skewX(15deg) on hover' },
        { cls: 'css-tr-origin',       label: 'transform-origin',  desc: 'scale from bottom-left' },
        { cls: 'css-tr-perspective',  label: 'perspective()',     desc: '3D tilt via CSS only' },
        { cls: 'css-tr-matrix',       label: 'matrix3d()',        desc: '3D matrix transform' },
        { cls: 'css-tr-combo',        label: 'Combined',          desc: 'scale + rotate + translate' },
      ].map(({ cls, label, desc }) => (
        <DemoCard key={cls} title={label} description={desc}>
          <div style={{ display: 'flex', justifyContent: 'center', height: 70, alignItems: 'center' }}>
            <div className={`css-transform-box ${cls}`} />
          </div>
        </DemoCard>
      ))}
    </div>
  </div>
)

// ─── CSS CUSTOM PROPERTIES ────────────────────────────────────────────────────
