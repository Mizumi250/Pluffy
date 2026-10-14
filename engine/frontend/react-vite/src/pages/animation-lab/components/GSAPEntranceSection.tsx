// ============================================================
// ARKZEN GENERATED COMPONENT — GSAPEntranceSection [React+Vite]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T14:10:30.256Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { useAnimLabStore } from './hooks'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

export const GSAPEntranceSection = () => {
  const { resetKey } = useAnimLabStore()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [key, setKey] = useState(0)

  useEffect(() => { setKey(k => k + 1) }, [resetKey])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-from-demo', {
        opacity: 0, y: 60, duration: 0.8, ease: 'power3.out', delay: 0.1
      })
      gsap.fromTo('.gsap-fromto-demo',
        { opacity: 0, scaleX: 0, transformOrigin: 'left center' },
        { opacity: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
      )
      gsap.to('.gsap-to-demo', {
        x: 80, rotation: 360, duration: 0.9, ease: 'back.out(1.7)', delay: 0.5
      })
      gsap.fromTo('.gsap-blur-demo',
        { opacity: 0, filter: 'blur(20px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out', delay: 0.6 }
      )
      gsap.fromTo('.gsap-clip-demo',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power4.inOut', delay: 0.7 }
      )
      gsap.from('.gsap-scale-demo', {
        opacity: 0, scale: 0.3, duration: 0.7, ease: 'back.out(2)', delay: 0.9
      })
      gsap.fromTo('.gsap-rotate-demo',
        { opacity: 0, rotation: -90, transformOrigin: 'bottom left' },
        { opacity: 1, rotation: 0, duration: 0.8, ease: 'power3.out', delay: 1.0 }
      )
      gsap.from('.gsap-slide-right-demo', {
        opacity: 0, x: 100, duration: 0.7, ease: 'power2.out', delay: 1.1
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [key])

  const boxes = [
    { cls: 'gsap-from-demo',       label: 'gsap.from()',      color: '#6366f1', desc: 'y:60 → y:0' },
    { cls: 'gsap-fromto-demo',     label: 'gsap.fromTo()',    color: '#8b5cf6', desc: 'scaleX:0 → 1' },
    { cls: 'gsap-to-demo',         label: 'gsap.to()',        color: '#a855f7', desc: 'x:0 → 80, rotate' },
    { cls: 'gsap-blur-demo',       label: 'Blur Reveal',      color: '#c084fc', desc: 'blur(20) → 0' },
    { cls: 'gsap-clip-demo',       label: 'Clip Reveal',      color: '#d946ef', desc: 'inset clip' },
    { cls: 'gsap-scale-demo',      label: 'Scale Bloom',      color: '#e879f9', desc: 'scale:0.3 → 1' },
    { cls: 'gsap-rotate-demo',     label: 'Rotate Unfold',    color: '#f0abfc', desc: '-90° → 0' },
    { cls: 'gsap-slide-right-demo',label: 'Slide From Right', color: '#e879f9', desc: 'x:100 → 0' },
  ]

  return (
    <div ref={sectionRef} key={key}>
      <SectionHeader
        icon={<Play size={20} />}
        title="GSAP Entrance Animations"
        subtitle="gsap.from(), gsap.to(), gsap.fromTo() — all entrance variants"
        color="#6366f1"
      />
      <div className="demo-grid">
        {boxes.map(b => (
          <DemoCard key={b.cls} title={b.label} description={b.desc}>
            <div className="demo-center">
              <div className={`anim-box ${b.cls}`} style={{ background: b.color }}>
                <span style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>{b.label.split('.')[0] || b.label}</span>
              </div>
            </div>
          </DemoCard>
        ))}
      </div>
    </div>
  )
};
