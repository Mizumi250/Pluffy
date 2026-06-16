// ============================================================
// ARKZEN GENERATED COMPONENT — FramerGesturesSection [React+Vite]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T11:23:22.011Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { opacity, scale, y } from './utils'
import { DemoCard } from './DemoCard'
import { MagneticBtn } from './MagneticBtn'
import { SectionHeader } from './SectionHeader'

// ─── FRAMER GESTURES ─────────────────────────────────────────────────────────
export const FramerGesturesSection = () => {
  return (
    <div>
      <SectionHeader
        icon={<MousePointer2 size={20} />}
        title="Framer Motion Gestures"
        subtitle="whileHover, whileTap, whileFocus, whileDrag — interactive gesture states"
        color="#0ea5e9"
      />
      <div className="demo-grid">
        <DemoCard title="whileHover Scale" description="Scale + shadow on hover">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.15, boxShadow: '0 16px 40px rgba(14,165,233,0.4)', y: -6 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{ width: 100, height: 60, borderRadius: 10, background: '#0ea5e9', cursor: 'pointer' }}
            />
          </div>
        </DemoCard>
        <DemoCard title="whileTap Press" description="Scale down + color shift on press">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92, background: '#dc2626' }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="play-btn"
            >
              Press Me
            </motion.button>
          </div>
        </DemoCard>
        <DemoCard title="Icon Rotate" description="360° spin on hover">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(14,165,233,0.15)', borderRadius: '50%', cursor: 'pointer' }}
            >
              <RefreshCw size={28} style={{ color: '#0ea5e9' }} />
            </motion.div>
          </div>
        </DemoCard>
        <DemoCard title="Ripple Tap" description="Pulse expand on tap">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              whileTap={{ scale: [1, 1.3, 0.95, 1], transition: { duration: 0.4 } }}
              style={{ width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', cursor: 'pointer' }}
            />
          </div>
        </DemoCard>
        <DemoCard title="whileInView" description="Fades in when entering viewport">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: '-20px' }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ width: 100, height: 50, borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700 }}
            >
              In View!
            </motion.div>
          </div>
        </DemoCard>
        <DemoCard title="Magnetic Hover" description="Position-aware cursor tracking">
          <MagneticBtn />
        </DemoCard>
      </div>
    </div>
  )
}
