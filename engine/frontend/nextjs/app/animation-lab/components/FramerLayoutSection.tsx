'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — FramerLayoutSection
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:44.936Z
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

// ─── FRAMER LAYOUT ────────────────────────────────────────────────────────────
export const FramerLayoutSection = () => {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [showExtra, setShowExtra] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const COLORS = ['#6366f1','#f59e0b','#10b981','#ec4899','#0ea5e9']

  return (
    <div>
      <SectionHeader
        icon={<Maximize2 size={20} />}
        title="Framer Motion Layout Animations"
        subtitle="layoutId, layout prop — shared element transitions"
        color="#10b981"
      />
      <div className="demo-grid">
        <DemoCard title="Expand / Collapse" description="layout prop animates size changes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                layout
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  borderRadius: 10, cursor: 'pointer', overflow: 'hidden',
                  background: `hsl(${200 + i * 40}, 70%, 55%)`,
                  padding: expanded === i ? '20px' : '12px 16px',
                }}
              >
                <motion.div layout style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                  Item {i + 1} {expanded === i ? '▲' : '▼'}
                </motion.div>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 8 }}
                    >
                      Expanded content for item {i + 1}. Layout animation handles the resize smoothly!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </DemoCard>
        <DemoCard title="Shared layoutId" description="Element teleports between positions">
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {COLORS.map((c, i) => (
                <div
                  key={i}
                  onClick={() => toggleSelect(`item-${i}`)}
                  style={{ position: 'relative', width: 40, height: 40, borderRadius: 8, background: c, cursor: 'pointer' }}
                >
                  {!selected.includes(`item-${i}`) && (
                    <motion.div layoutId={`dot-${i}`}
                      style={{ position: 'absolute', inset: 0, borderRadius: 8, background: c }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ minHeight: 44, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 6,
              display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selected.map(id => {
                const i = parseInt(id.split('-')[1])
                return (
                  <motion.div
                    key={id}
                    layoutId={`dot-${i}`}
                    onClick={() => toggleSelect(id)}
                    style={{ width: 32, height: 32, borderRadius: 8, background: COLORS[i], cursor: 'pointer' }}
                  />
                )
              })}
            </div>
          </div>
        </DemoCard>
        <DemoCard title="List Reorder" description="Items animate when added/removed">
          <div>
            <button className="play-btn" onClick={() => setShowExtra(v => !v)} style={{ marginBottom: 10 }}>
              {showExtra ? 'Remove Item' : 'Add Item'}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <AnimatePresence>
                {['Always First', ...(showExtra ? ['Dynamic Item'] : []), 'Always Last'].map(item => (
                  <motion.div
                    key={item}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    style={{
                      padding: '10px 16px', borderRadius: 8,
                      background: item === 'Dynamic Item' ? '#10b981' : 'rgba(255,255,255,0.08)',
                      color: 'white', fontSize: 13, fontWeight: 600
                    }}
                  >
                    {item}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── FRAMER KEYFRAMES ─────────────────────────────────────────────────────────
