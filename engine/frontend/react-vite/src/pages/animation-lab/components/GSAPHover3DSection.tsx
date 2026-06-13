// ============================================================
// ARKZEN GENERATED COMPONENT — GSAPHover3DSection [React+Vite]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T14:30:28.736Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { cardRef, handleFlip, handleMagnet, handleMagnetLeave, handleMorphEnter, handleMorphLeave, handleTilt, handleTiltLeave, magnetRef, morphRef, newFlipped, r, ref, scale, x, y } from './utils'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── GSAP HOVER & 3D ─────────────────────────────────────────────────────────
export const GSAPHover3DSection = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const magnetRef = useRef<HTMLButtonElement>(null)
  const morphRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)

  // 3D tilt card
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientY - r.top) / r.height - 0.5) * 20
    const y = ((e.clientX - r.left) / r.width - 0.5) * -20
    gsap.to(e.currentTarget, { rotationX: x, rotationY: y, duration: 0.3, ease: 'power2.out', transformPerspective: 800 })
  }
  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
  }

  // Magnetic button
  const handleMagnet = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.35
    const y = (e.clientY - r.top - r.height / 2) * 0.35
    gsap.to(magnetRef.current, { x, y, duration: 0.3, ease: 'power2.out' })
  }
  const handleMagnetLeave = () => {
    gsap.to(magnetRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
  }

  // Flip card
  const handleFlip = () => {
    const newFlipped = !flipped
    setFlipped(newFlipped)
    gsap.to(cardRef.current, {
      rotationY: newFlipped ? 180 : 0,
      duration: 0.7, ease: 'power2.inOut', transformPerspective: 1000
    })
  }

  // Morph hover
  const handleMorphEnter = () => {
    gsap.to(morphRef.current, { borderRadius: '50%', scale: 1.2, rotation: 45, duration: 0.4, ease: 'power2.inOut' })
  }
  const handleMorphLeave = () => {
    gsap.to(morphRef.current, { borderRadius: '12px', scale: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
  }

  return (
    <div>
      <SectionHeader
        icon={<Box size={20} />}
        title="GSAP Hover & 3D"
        subtitle="3D tilt, card flip, magnetic button, morph hover"
        color="#ec4899"
      />
      <div className="demo-grid">
        <DemoCard title="3D Tilt Card" description="Mouse moves card in 3D space">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              onMouseMove={handleTilt}
              onMouseLeave={handleTiltLeave}
              style={{
                width: 160, height: 100, borderRadius: 12, cursor: 'pointer',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 14,
                boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)',
              }}
            >
              Hover me!
            </div>
          </div>
        </DemoCard>

        <DemoCard title="Card Flip (3D)" description="Click to flip card on Y axis">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              ref={cardRef}
              onClick={handleFlip}
              style={{
                width: 140, height: 90, borderRadius: 12, cursor: 'pointer',
                position: 'relative', transformStyle: 'preserve-3d',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 12, backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700
              }}>Front</div>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 12, backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, transform: 'rotateY(180deg)'
              }}>Back!</div>
            </div>
          </div>
        </DemoCard>

        <DemoCard title="Magnetic Button" description="Button follows cursor magnetically">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              ref={magnetRef}
              onMouseMove={handleMagnet}
              onMouseLeave={handleMagnetLeave}
              className="play-btn"
              style={{ padding: '12px 32px', fontSize: 15 }}
            >
              🧲 Magnetic
            </button>
          </div>
        </DemoCard>

        <DemoCard title="Morph Hover" description="Shape transforms on hover">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              ref={morphRef}
              onMouseEnter={handleMorphEnter}
              onMouseLeave={handleMorphLeave}
              style={{
                width: 80, height: 80, borderRadius: 12, cursor: 'pointer',
                background: 'linear-gradient(135deg, #ec4899, #a855f7)',
              }}
            />
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── FRAMER MOTION VARIANTS ───────────────────────────────────────────────────
