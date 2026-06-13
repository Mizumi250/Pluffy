// ============================================================
// ARKZEN GENERATED COMPONENT — CSSTransitionsSection [TanStack]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:08:51.722Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── CSS TRANSITIONS SECTION ──────────────────────────────────────────────────
export const CSSTransitionsSection = () => (
  <div>
    <SectionHeader
      icon={<ChevronRight size={20} />}
      title="CSS Transitions"
      subtitle="transition property — easing functions, delay, multi-property"
      color="#f97316"
    />
    <div className="demo-grid">
      {[
        { cls: 'css-t-ease',        label: 'ease',         desc: 'default cubic-bezier' },
        { cls: 'css-t-ease-in',     label: 'ease-in',      desc: 'slow start' },
        { cls: 'css-t-ease-out',    label: 'ease-out',     desc: 'slow end' },
        { cls: 'css-t-ease-in-out', label: 'ease-in-out',  desc: 'slow both ends' },
        { cls: 'css-t-linear',      label: 'linear',       desc: 'constant speed' },
        { cls: 'css-t-bounce',      label: 'cubic-bezier', desc: 'custom bounce curve' },
        { cls: 'css-t-multi',       label: 'Multi-Prop',   desc: 'color + transform + shadow' },
        { cls: 'css-t-delay',       label: 'Delay',        desc: 'transition-delay: 0.3s' },
      ].map(({ cls, label, desc }) => (
        <DemoCard key={cls} title={label} description={desc}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className={`css-transition-box ${cls}`}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>Hover</span>
            </div>
          </div>
        </DemoCard>
      ))}
    </div>
  </div>
)

// ─── CSS TRANSFORMS ───────────────────────────────────────────────────────────
