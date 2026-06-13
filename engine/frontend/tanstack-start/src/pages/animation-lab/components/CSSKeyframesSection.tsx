// ============================================================
// ARKZEN GENERATED COMPONENT — CSSKeyframesSection [TanStack]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:08:51.720Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { opacity, scale, x, y } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── CSS KEYFRAMES SECTION ────────────────────────────────────────────────────
export const CSSKeyframesSection = () => (
  <div>
    <SectionHeader
      icon={<Type size={20} />}
      title="CSS Keyframe Animations"
      subtitle="@keyframes animations — spin, bounce, shake, pulse, ping, typewriter, and more"
      color="#22c55e"
    />
    <div className="demo-grid">
      {[
        { cls: 'css-spin',      label: 'Spin',      desc: 'rotate 360deg infinite' },
        { cls: 'css-bounce',    label: 'Bounce',    desc: 'y keyframes up/down' },
        { cls: 'css-pulse',     label: 'Pulse',     desc: 'opacity + scale oscillate' },
        { cls: 'css-shake',     label: 'Shake',     desc: 'x oscillation fast' },
        { cls: 'css-ping',      label: 'Ping',      desc: 'scale+opacity ripple' },
        { cls: 'css-float',     label: 'Float',     desc: 'gentle y movement' },
        { cls: 'css-shimmer',   label: 'Shimmer',   desc: 'background-position sweep' },
        { cls: 'css-gradient',  label: 'Gradient',  desc: 'background-position shift' },
        { cls: 'css-blink',     label: 'Blink',     desc: 'opacity 1→0→1 cursor' },
        { cls: 'css-heartbeat', label: 'Heartbeat', desc: 'double scale pulse' },
        { cls: 'css-wiggle',    label: 'Wiggle',    desc: 'rotate ±10deg fast' },
        { cls: 'css-flip',      label: 'Flip',      desc: 'rotateY 0→360' },
      ].map(({ cls, label, desc }) => (
        <DemoCard key={cls} title={label} description={desc}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 70 }}>
            {cls === 'css-shimmer' ? (
              <div className={cls} style={{ width: 120, height: 40, borderRadius: 8 }} />
            ) : cls === 'css-gradient' ? (
              <div className={cls} style={{ width: 100, height: 50, borderRadius: 10 }} />
            ) : cls === 'css-blink' ? (
              <span style={{ fontSize: 24, fontWeight: 700, color: '#22c55e', fontFamily: 'monospace' }}>
                cursor<span className={cls}>|</span>
              </span>
            ) : cls === 'css-ping' ? (
              <div style={{ position: 'relative', width: 40, height: 40 }}>
                <div className={cls} style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.4)'
                }} />
                <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: '#22c55e' }} />
              </div>
            ) : (
              <div className={cls} style={{
                width: 48, height: 48, borderRadius: 10,
                background: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} />
            )}
          </div>
        </DemoCard>
      ))}
    </div>
  </div>
)

// ─── CSS TRANSITIONS SECTION ──────────────────────────────────────────────────
