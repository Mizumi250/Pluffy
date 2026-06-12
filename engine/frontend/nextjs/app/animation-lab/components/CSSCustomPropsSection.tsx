'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — CSSCustomPropsSection
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T09:10:02.190Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'

// ─── CSS CUSTOM PROPERTIES ────────────────────────────────────────────────────
export const CSSCustomPropsSection = () => {
  const [hue, setHue] = useState(240)
  const [speed, setSpeed] = useState(2)

  return (
    <div>
      <SectionHeader
        icon={<Zap size={20} />}
        title="CSS Custom Properties (Variables)"
        subtitle="Animating via CSS variables, @property, dynamic theming"
        color="#eab308"
      />
      <DemoCard title="Live CSS Variable Control" description="Sliders update CSS custom properties in real time">
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            Hue: {hue}°
            <input type="range" min={0} max={360} value={hue} onChange={e => setHue(+e.target.value)}
              style={{ flex: 1 }} />
          </label>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            Speed: {speed}s
            <input type="range" min={0.5} max={5} step={0.5} value={speed} onChange={e => setSpeed(+e.target.value)}
              style={{ flex: 1 }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[0, 60, 120, 180, 240, 300].map(offset => (
            <div key={offset} style={{
              width: 44, height: 44, borderRadius: 10,
              background: `hsl(${(hue + offset) % 360}, 80%, 55%)`,
              animation: `css-spin ${speed}s linear ${offset / 600}s infinite`,
            }} />
          ))}
        </div>
      </DemoCard>
      <div className="demo-grid">
        <DemoCard title="@property (typed variable)" description="CSS @property registers typed custom props with interpolation">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="css-custom-prop-demo" style={{ '--hue': `${hue}deg` } as React.CSSProperties} />
          </div>
        </DemoCard>
        <DemoCard title="Variable Cascade" description="Child overrides parent variable">
          <div style={{ '--base-color': `hsl(${hue}, 70%, 55%)` } as React.CSSProperties}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[0, 0.7, 0.5, 0.3, 0.15].map((alpha, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `hsla(${(hue + i * 40) % 360}, 70%, 55%, ${alpha + 0.2})`,
                }} />
              ))}
            </div>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}
