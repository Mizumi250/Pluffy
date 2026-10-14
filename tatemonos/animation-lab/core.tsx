/* @arkzen:meta
name: animation-lab
version: 1.0.0
description: Full animation testing lab — GSAP (entrance, exit, scroll trigger, timeline, stagger, morph, 3D, magnetic), Framer Motion (variants, gestures, layout, AnimatePresence, keyframes, drag), and CSS animations (keyframes, transitions, transforms, custom properties). The definitive Arkzen animation reference.
auth: false
*/

/* @arkzen:meta:web
favicon: 🎬
*/

/* @arkzen:meta:native
label: Animation Lab
description: Full animation testing lab — Reanimated, Moti, Spring, Easing
expo:
  bundle_id: com.arkzen.animationlab
  scheme: animationlab
  version: 1.0.0
  orientation: portrait
  status_bar_style: light
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: 2xl
  backdrop: blur
  animation: fadeScale
layout:
  guest:
    className: "min-h-screen bg-neutral-950"
  auth:
    className: "min-h-screen bg-neutral-950"
*/

/* @arkzen:native:config
theme:
  primary: "#6366f1"
  secondary: "#a855f7"
  accent: "#10b981"
  background: "#09090b"
  surface: "#1e293b"
  text: "#ffffff"
  muted: "rgba(255,255,255,0.4)"
*/

// ─────────────────────────────────────────────────────────────────────────────
// WEB SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useScroll, useInView } from 'framer-motion'
import {
  Play, Pause, RotateCcw, Layers, Zap, Wind, MousePointer2,
  ArrowDown, Cpu, Sparkles, Box, Move, Type, Eye, ChevronRight,
  RefreshCw, Maximize2
} from 'lucide-react'

// ─── ZUSTAND STORE ────────────────────────────────────────────────────────────
interface AnimLabState {
  activeSection: string
  setActiveSection: (s: string) => void
  playingDemo: string | null
  setPlayingDemo: (id: string | null) => void
  resetKey: number
  triggerReset: () => void
}

export const useAnimLabStore = create<AnimLabState>((set) => ({
  activeSection: 'gsap-entrance',
  setActiveSection: (s) => set({ activeSection: s }),
  playingDemo: null,
  setPlayingDemo: (id) => set({ playingDemo: id }),
  resetKey: 0,
  triggerReset: () => set((s) => ({ resetKey: s.resetKey + 1 })),
}))

// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
export const NAV_SECTIONS = [
  { id: 'gsap-entrance',    label: 'GSAP Entrance',      icon: '▶' },
  { id: 'gsap-scroll',      label: 'GSAP ScrollTrigger', icon: '↕' },
  { id: 'gsap-timeline',    label: 'GSAP Timeline',      icon: '⏱' },
  { id: 'gsap-stagger',     label: 'GSAP Stagger',       icon: '⠿' },
  { id: 'gsap-hover-3d',    label: 'GSAP Hover / 3D',    icon: '⟲' },
  { id: 'framer-variants',  label: 'FM Variants',        icon: '✦' },
  { id: 'framer-gestures',  label: 'FM Gestures',        icon: '👆' },
  { id: 'framer-layout',    label: 'FM Layout',          icon: '⊞' },
  { id: 'framer-keyframes', label: 'FM Keyframes',       icon: '◈' },
  { id: 'framer-drag',      label: 'FM Drag',            icon: '↔' },
  { id: 'framer-scroll',    label: 'FM Scroll',          icon: '⟳' },
  { id: 'css-keyframes',    label: 'CSS Keyframes',      icon: '⊛' },
  { id: 'css-transitions',  label: 'CSS Transitions',    icon: '⇄' },
  { id: 'css-transforms',   label: 'CSS Transforms',     icon: '⬡' },
  { id: 'css-custom-props', label: 'CSS Variables',      icon: '◇' },
]

// ─── SHARED DEMO WRAPPER ──────────────────────────────────────────────────────
export const DemoCard = ({
  title, description, children, className = ''
}: {
  title: string; description: string; children: React.ReactNode; className?: string
}) => (
  <div className={`demo-card ${className}`}>
    <div className="demo-card-header">
      <h3 className="demo-card-title">{title}</h3>
      <p className="demo-card-desc">{description}</p>
    </div>
    <div className="demo-card-stage">{children}</div>
  </div>
)

// ─── RESET BUTTON ─────────────────────────────────────────────────────────────
export const ResetBtn = ({ onClick }: { onClick: () => void }) => (
  <button className="reset-btn" onClick={onClick} title="Reset animation">
    <RotateCcw size={14} />
  </button>
)

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export const SectionHeader = ({
  icon, title, subtitle, color
}: {
  icon: React.ReactNode; title: string; subtitle: string; color: string
}) => (
  <div className="section-header" style={{ '--accent': color } as React.CSSProperties}>
    <div className="section-header-icon">{icon}</div>
    <div>
      <h2 className="section-header-title">{title}</h2>
      <p className="section-header-sub">{subtitle}</p>
    </div>
  </div>
)

// ─── GSAP ENTRANCE DEMOS ──────────────────────────────────────────────────────
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
}

// ─── GSAP SCROLL TRIGGER ──────────────────────────────────────────────────────
export const GSAPScrollSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo('.scroll-fade-item',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: '.scroll-fade-group', start: 'top 85%', toggleActions: 'play none none reset' }
        }
      )
      gsap.to('.scroll-parallax-bg', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.scroll-parallax-wrap',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      })
      gsap.fromTo('.scroll-pin-text',
        { opacity: 0, letterSpacing: '0.5em' },
        {
          opacity: 1, letterSpacing: '0em', duration: 1,
          scrollTrigger: {
            trigger: '.scroll-pin-wrap',
            start: 'top 75%',
            toggleActions: 'play none none reset',
          }
        }
      )
      gsap.fromTo('.scroll-scale-card',
        { scale: 0.6, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)', stagger: 0.12,
          scrollTrigger: { trigger: '.scroll-scale-group', start: 'top 80%', toggleActions: 'play none none reset' }
        }
      )
      const hTrack = document.querySelector('.scroll-h-track')
      if (hTrack) {
        gsap.to('.scroll-h-inner', {
          xPercent: -66,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scroll-h-track',
            start: 'top center',
            end: '+=400',
            scrub: 1,
          }
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef}>
      <SectionHeader
        icon={<ArrowDown size={20} />}
        title="GSAP ScrollTrigger"
        subtitle="Scroll-driven animations — scrub, pin, stagger reveal, parallax"
        color="#10b981"
      />
      <DemoCard title="Scroll Stagger Reveal" description="Elements fade in staggered as they enter viewport">
        <div className="scroll-fade-group" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'].map(w => (
            <div key={w} className="scroll-fade-item anim-pill" style={{ background: '#10b981' }}>{w}</div>
          ))}
        </div>
      </DemoCard>
      <DemoCard title="Parallax Scrub" description="Background moves at different speed (scrub:true)">
        <div className="scroll-parallax-wrap" style={{ height: 120, overflow: 'hidden', borderRadius: 12, position: 'relative' }}>
          <div className="scroll-parallax-bg" style={{
            position: 'absolute', inset: '-30% 0', height: '160%',
            background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 18, opacity: 0.5 }}>Parallax Layer</span>
          </div>
        </div>
      </DemoCard>
      <DemoCard title="Letter Spacing Reveal" description="Text compresses into view on scroll">
        <div className="scroll-pin-wrap" style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
          <h3 className="scroll-pin-text" style={{ fontSize: 28, fontWeight: 900, color: '#10b981', letterSpacing: '0.5em' }}>
            SCROLL REVEAL
          </h3>
        </div>
      </DemoCard>
      <DemoCard title="Scale Entrance on Scroll" description="Cards scale + fade in as they enter viewport">
        <div className="scroll-scale-group" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Card 1', 'Card 2', 'Card 3'].map(c => (
            <div key={c} className="scroll-scale-card" style={{
              width: 90, height: 90, borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 13, opacity: 0
            }}>{c}</div>
          ))}
        </div>
      </DemoCard>
      <DemoCard title="Horizontal Scroll (Scrub)" description="Scrubs horizontal slide as user scrolls vertically">
        <div className="scroll-h-track" style={{ overflow: 'hidden', borderRadius: 10 }}>
          <div className="scroll-h-inner" style={{ display: 'flex', gap: 12, width: 'max-content' }}>
            {['#f43f5e','#f97316','#eab308','#22c55e','#0ea5e9','#6366f1','#a855f7','#ec4899'].map((c, i) => (
              <div key={i} style={{
                width: 80, height: 60, borderRadius: 8, background: c, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 12
              }}>#{i + 1}</div>
            ))}
          </div>
        </div>
      </DemoCard>
    </div>
  )
}

// ─── GSAP TIMELINE ────────────────────────────────────────────────────────────
export const GSAPTimelineSection = () => {
  const stageRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const buildTimeline = useCallback(() => {
    if (tlRef.current) tlRef.current.kill()
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, onComplete: () => setPlaying(false) })
      tl.fromTo('.tl-bg', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' })
      tl.fromTo('.tl-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, '+=0.1')
      tl.fromTo('.tl-dot', { scale: 0 }, { scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(3)' }, '-=0.2')
      tl.fromTo('.tl-bar', { scaleX: 0 }, { scaleX: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', transformOrigin: 'left' }, '-=0.3')
      tl.fromTo('.tl-badge', { opacity: 0, scale: 0.5, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, '+=0.1')
      tl.to('.tl-title', { color: '#a78bfa', duration: 0.4 })
      tl.to('.tl-bg', { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', duration: 0.6, ease: 'power2.inOut' }, '-=0.3')
      tlRef.current = tl
    }, stageRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => { buildTimeline() }, [buildTimeline])

  const handlePlay = () => {
    setPlaying(true)
    tlRef.current?.restart()
  }

  const handleReset = () => {
    setPlaying(false)
    tlRef.current?.pause(0)
    buildTimeline()
  }

  return (
    <div ref={stageRef}>
      <SectionHeader
        icon={<Cpu size={20} />}
        title="GSAP Timeline"
        subtitle="Sequential, overlapping, and label-based animation orchestration"
        color="#a78bfa"
      />
      <DemoCard title="Chained Timeline Sequence" description="Multiple animations queued and overlapped on a single timeline">
        <div style={{ textAlign: 'center', marginBottom: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="play-btn" onClick={handlePlay} disabled={playing}>
            <Play size={14} /> {playing ? 'Playing...' : 'Play Timeline'}
          </button>
          <button className="reset-btn" onClick={handleReset}><RotateCcw size={14} /></button>
        </div>
        <div className="tl-bg" style={{
          borderRadius: 16, padding: 24, minHeight: 160,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          transform: 'scaleX(0)', transformOrigin: 'left'
        }}>
          <h3 className="tl-title" style={{ color: 'white', fontSize: 22, fontWeight: 800, opacity: 0 }}>
            Timeline Magic ✨
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {['●','●','●','●','●'].map((d, i) => (
              <span key={i} className="tl-dot" style={{ color: '#a78bfa', fontSize: 20, transform: 'scale(0)' }}>{d}</span>
            ))}
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[70, 85, 55, 90].map((w, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div className="tl-bar" style={{
                  width: `${w}%`, height: '100%', borderRadius: 4,
                  background: `hsl(${250 + i * 20}, 80%, 65%)`, transform: 'scaleX(0)'
                }} />
              </div>
            ))}
          </div>
          <div className="tl-badge" style={{
            background: '#a78bfa', color: 'white', borderRadius: 24,
            padding: '6px 20px', fontWeight: 700, fontSize: 13, opacity: 0
          }}>Complete!</div>
        </div>
      </DemoCard>
    </div>
  )
}

// ─── GSAP STAGGER ─────────────────────────────────────────────────────────────
export const GSAPStaggerSection = () => {
  const [key, setKey] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stagger-linear .stg-item', { opacity: 0, y: 30, duration: 0.5, stagger: 0.08, ease: 'power3.out' })
      gsap.from('.stagger-center .stg-item', { opacity: 0, scale: 0, duration: 0.5, stagger: { each: 0.07, from: 'center' }, ease: 'back.out(2)', delay: 0.3 })
      gsap.from('.stagger-end .stg-item', { opacity: 0, x: 40, duration: 0.5, stagger: { each: 0.06, from: 'end' }, ease: 'power2.out', delay: 0.6 })
      gsap.from('.stagger-grid .stg-item', {
        opacity: 0, scale: 0.3, rotation: 45, duration: 0.4,
        stagger: { amount: 0.8, grid: [3, 4], from: 'center' },
        ease: 'back.out(2)', delay: 0.9
      })
      gsap.fromTo('.stagger-yoyo .stg-item',
        { opacity: 0.2, scaleY: 0.3 },
        {
          opacity: 1, scaleY: 1, duration: 0.4, stagger: { each: 0.07, yoyo: true, repeat: 2 },
          ease: 'power2.inOut', delay: 1.2
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [key])

  return (
    <div ref={ref} key={key}>
      <SectionHeader
        icon={<Layers size={20} />}
        title="GSAP Stagger"
        subtitle="from: linear, center, end, grid — with yoyo and repeat"
        color="#f59e0b"
      />
      <div className="demo-grid">
        {[
          { cls: 'stagger-linear', label: 'Linear (default)', items: 6 },
          { cls: 'stagger-center', label: 'From Center',      items: 7 },
          { cls: 'stagger-end',    label: 'From End',         items: 6 },
          { cls: 'stagger-yoyo',   label: 'Yoyo Repeat',     items: 8 },
        ].map(({ cls, label, items }) => (
          <DemoCard key={cls} title={label} description={`stagger { from: '${cls.split('-')[1]}' }`}>
            <div className={`${cls}`} style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: items }, (_, i) => (
                <div key={i} className="stg-item" style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: `hsl(${40 + i * 15}, 90%, 55%)`, flexShrink: 0
                }} />
              ))}
            </div>
          </DemoCard>
        ))}
        <DemoCard title="Grid Stagger (3×4)" description="2D grid stagger from center">
          <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="stg-item" style={{
                aspectRatio: '1', borderRadius: 8,
                background: `hsl(${i * 25}, 80%, 60%)`,
              }} />
            ))}
          </div>
        </DemoCard>
        <DemoCard title="Reset" description="Re-run all stagger demos">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
            <button className="play-btn" onClick={() => setKey(k => k + 1)}>
              <RotateCcw size={14} /> Replay All
            </button>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── GSAP HOVER & 3D ─────────────────────────────────────────────────────────
export const GSAPHover3DSection = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const magnetRef = useRef<HTMLButtonElement>(null)
  const morphRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientY - r.top) / r.height - 0.5) * 20
    const y = ((e.clientX - r.left) / r.width - 0.5) * -20
    gsap.to(e.currentTarget, { rotationX: x, rotationY: y, duration: 0.3, ease: 'power2.out', transformPerspective: 800 })
  }
  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
  }

  const handleMagnet = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.35
    const y = (e.clientY - r.top - r.height / 2) * 0.35
    gsap.to(magnetRef.current, { x, y, duration: 0.3, ease: 'power2.out' })
  }
  const handleMagnetLeave = () => {
    gsap.to(magnetRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
  }

  const handleFlip = () => {
    const newFlipped = !flipped
    setFlipped(newFlipped)
    gsap.to(cardRef.current, {
      rotationY: newFlipped ? 180 : 0,
      duration: 0.7, ease: 'power2.inOut', transformPerspective: 1000
    })
  }

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
export const FramerVariantsSection = () => {
  const [visible, setVisible] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -16, scale: 0.9 }
  } as const

  const fadeSlide = {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
  } as const

  const scaleBounce = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
    exit: { scale: 0, opacity: 0 }
  } as const

  const rotateIn = {
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 200 } },
    exit: { rotate: 180, opacity: 0 }
  } as const

  return (
    <div>
      <SectionHeader
        icon={<Sparkles size={20} />}
        title="Framer Motion Variants"
        subtitle="Stagger containers, orchestrated children, AnimatePresence"
        color="#f59e0b"
      />
      <DemoCard title="Stagger Container" description="Parent orchestrates children with staggerChildren">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <button className="play-btn" onClick={() => setVisible(v => !v)}>
            {visible ? 'Hide' : 'Animate In'}
          </button>
        </div>
        <AnimatePresence>
          {visible && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map(w => (
                <motion.div
                  key={w}
                  variants={itemVariants}
                  className="anim-pill"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                >
                  {w}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </DemoCard>
      <div className="demo-grid">
        {[
          { label: 'Fade + Slide', vars: fadeSlide, bg: '#3b82f6' },
          { label: 'Scale Bounce', vars: scaleBounce, bg: '#10b981' },
          { label: 'Rotate In',   vars: rotateIn, bg: '#a855f7' },
        ].map(({ label, vars, bg }) => {
          const [on, setOn] = useState(true)
          return (
            <DemoCard key={label} title={label} description="AnimatePresence entrance/exit">
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <button className="play-btn" onClick={() => setOn(v => !v)} style={{ fontSize: 12, padding: '6px 14px' }}>
                  Toggle
                </button>
              </div>
              <div style={{ height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                  {on && (
                    <motion.div
                      key={label}
                      initial={vars.initial}
                      animate={vars.animate}
                      exit={vars.exit}
                      style={{ width: 80, height: 40, borderRadius: 8, background: bg }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </DemoCard>
          )
        })}
      </div>
    </div>
  )
}

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

const MagneticBtn = () => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <motion.button
        style={{ x: springX, y: springY }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          x.set((e.clientX - r.left - r.width / 2) * 0.3)
          y.set((e.clientY - r.top - r.height / 2) * 0.3)
        }}
        onMouseLeave={() => { x.set(0); y.set(0) }}
        className="play-btn"
      >
        🧲 FM Magnetic
      </motion.button>
    </div>
  )
}

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
export const FramerKeyframesSection = () => {
  return (
    <div>
      <SectionHeader
        icon={<Wind size={20} />}
        title="Framer Motion Keyframes"
        subtitle="Array-based keyframes, custom timing, orchestration"
        color="#f43f5e"
      />
      <div className="demo-grid">
        <DemoCard title="Pulse Keyframes" description="opacity cycles [1, 0.3, 1]">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 60, height: 60, borderRadius: '50%', background: '#f43f5e' }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Bounce Path" description="y keyframes: [0, -40, 0, -20, 0]">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              animate={{ y: [0, -40, 0, -20, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.3, 0.6, 0.8, 1] }}
              style={{ width: 40, height: 40, borderRadius: '50%', background: '#f97316' }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Color Cycle" description="Background cycles through color spectrum">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              animate={{ background: ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#a855f7', '#f43f5e'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Border Radius Morph" description="Shape morphs between values">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              animate={{ borderRadius: ['12px', '50%', '12px 50%', '50% 12px', '12px'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 70, height: 70, background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Wave Bars" description="Staggered height keyframes">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 6, height: 60 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                style={{
                  width: 10, height: 50, borderRadius: 5, transformOrigin: 'bottom',
                  background: `hsl(${200 + i * 30}, 80%, 60%)`
                }}
              />
            ))}
          </div>
        </DemoCard>
        <DemoCard title="Orbit" description="x/y keyframes create circular path">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80, position: 'relative' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', position: 'absolute' }} />
            <motion.div
              animate={{ x: [40, 0, -40, 0, 40], y: [0, 40, 0, -40, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 16, height: 16, borderRadius: '50%', background: '#eab308', position: 'absolute' }}
            />
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── FRAMER DRAG ──────────────────────────────────────────────────────────────
export const FramerDragSection = () => {
  const constraintsRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      <SectionHeader
        icon={<Move size={20} />}
        title="Framer Motion Drag"
        subtitle="drag, dragConstraints, dragElastic, dragMomentum"
        color="#8b5cf6"
      />
      <div className="demo-grid">
        <DemoCard title="Free Drag" description="Unconstrained drag with momentum">
          <div ref={constraintsRef} style={{ height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              whileDrag={{ scale: 1.15, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)' }}
              style={{
                width: 50, height: 50, borderRadius: 10, cursor: 'grab',
                background: '#8b5cf6', position: 'absolute', top: 35, left: '50%', marginLeft: -25
              }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Drag Axis X" description="Constrained to horizontal axis">
          <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.15)', position: 'absolute' }} />
            <motion.div
              drag="x"
              dragConstraints={{ left: -80, right: 80 }}
              dragElastic={0.15}
              whileDrag={{ scale: 1.2 }}
              style={{
                width: 44, height: 44, borderRadius: '50%', cursor: 'grab',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                boxShadow: '0 4px 20px rgba(139,92,246,0.4)'
              }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Drag Snap" description="Snaps back to origin on release">
          <div style={{ display: 'flex', justifyContent: 'center', height: 80, alignItems: 'center' }}>
            <motion.div
              drag
              dragSnapToOrigin
              dragElastic={0.5}
              whileDrag={{ scale: 1.2, borderRadius: '50%' }}
              style={{
                width: 50, height: 50, borderRadius: 10, cursor: 'grab',
                background: 'linear-gradient(135deg, #10b981, #0ea5e9)'
              }}
            />
          </div>
        </DemoCard>
        <DemoCard title="Inertia / Velocity" description="dragMomentum with inertia">
          <div style={{ display: 'flex', justifyContent: 'center', height: 80, alignItems: 'center' }}>
            <motion.div
              drag
              dragConstraints={{ left: -60, right: 60, top: -20, bottom: 20 }}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
              style={{
                width: 50, height: 50, borderRadius: '50%', cursor: 'grab',
                background: 'linear-gradient(135deg, #f59e0b, #f43f5e)'
              }}
            />
          </div>
        </DemoCard>
      </div>
    </div>
  )
}

// ─── FRAMER SCROLL ────────────────────────────────────────────────────────────
export const FramerScrollSection = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <div>
      <SectionHeader
        icon={<ArrowDown size={20} />}
        title="Framer Motion Scroll"
        subtitle="useScroll, useTransform, useSpring — scroll-linked animations"
        color="#0ea5e9"
      />
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, #0ea5e9, #a855f7)',
          transformOrigin: '0%', scaleX, zIndex: 999,
        }}
      />
      <div className="demo-grid">
        <DemoCard title="Scroll Progress Bar" description="Fixed progress indicator using useScroll + useSpring">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' }}>
            See the blue bar at the top of the page — it fills as you scroll.
          </p>
        </DemoCard>
        <DemoCard title="useTransform Range" description="Map scroll 0→1 to opacity 0→1 and scale">
          <ScrollTransformDemo />
        </DemoCard>
        <DemoCard title="Parallax Layers" description="Different layers scroll at different speeds">
          <ParallaxDemo />
        </DemoCard>
      </div>
    </div>
  )
}

const ScrollTransformDemo = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5])
  return (
    <div ref={ref} style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div style={{ opacity, scale, width: 80, height: 50, borderRadius: 10, background: '#0ea5e9' }} />
    </div>
  )
}

const ParallaxDemo = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -80])
  const y2 = useTransform(scrollY, [0, 1000], [0, -160])
  return (
    <div style={{ height: 80, position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
      <motion.div style={{ y: y1, position: 'absolute', inset: 0, background: 'rgba(14,165,233,0.2)', borderRadius: 10 }} />
      <motion.div style={{ y: y2, position: 'absolute', inset: 12, background: 'rgba(168,85,247,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Faster</span>
      </motion.div>
    </div>
  )
}

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

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
/* Animation Lab Global Styles */

/* ─── LAYOUT ─────────────────── */
.anim-lab-root {
  min-height: 100vh;
  background: #09090b;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
}

.anim-lab-sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: 220px;
  background: rgba(255,255,255,0.03);
  border-right: 1px solid rgba(255,255,255,0.07);
  overflow-y: auto;
  z-index: 40;
  padding: 20px 0 40px;
}

.anim-lab-content {
  margin-left: 220px;
  padding: 32px 28px 80px;
  max-width: 1100px;
}

.anim-lab-logo {
  padding: 0 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 12px;
}

.anim-lab-logo h1 {
  font-size: 16px;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.anim-lab-logo p {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  margin: 2px 0 0;
}

/* ─── NAV ────────────────────── */
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.2s;
  user-select: none;
}

.nav-item:hover {
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.04);
}

.nav-item.active {
  color: white;
  border-left-color: #a78bfa;
  background: rgba(167,139,250,0.08);
}

.nav-item-icon {
  font-size: 13px;
  width: 16px;
  flex-shrink: 0;
}

/* ─── SECTION HEADER ─────────── */
.section-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 24px;
  border-radius: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 20px;
}

.section-header-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent, #a78bfa) 20%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent, #a78bfa) 30%, transparent);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent, #a78bfa);
  flex-shrink: 0;
}

.section-header-title {
  font-size: 18px; font-weight: 800; margin: 0 0 4px;
  background: linear-gradient(135deg, white, rgba(255,255,255,0.7));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.section-header-sub {
  font-size: 13px; color: rgba(255,255,255,0.45); margin: 0;
}

/* ─── DEMO CARD ──────────────── */
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.demo-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.demo-card:hover {
  border-color: rgba(255,255,255,0.14);
}

.demo-card-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.demo-card-title {
  font-size: 13px; font-weight: 700;
  color: rgba(255,255,255,0.9); margin: 0 0 3px;
}

.demo-card-desc {
  font-size: 11px; color: rgba(255,255,255,0.35); margin: 0;
}

.demo-card-stage {
  padding: 20px 16px;
  min-height: 90px;
  display: flex; flex-direction: column; justify-content: center;
}

.demo-center {
  display: flex; justify-content: center; align-items: center;
}

/* ─── ANIMATION PRIMITIVES ───── */
.anim-box {
  width: 60px; height: 40px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 10px; color: white;
}

.anim-pill {
  padding: 8px 18px;
  border-radius: 24px;
  color: white;
  font-weight: 700;
  font-size: 13px;
}

/* ─── BUTTONS ────────────────── */
.play-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white; font-weight: 700; font-size: 13px;
  border: none; cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.play-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.play-btn:active { transform: translateY(0); }
.play-btn:disabled { opacity: 0.5; cursor: default; }

.reset-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 12px; border-radius: 8px;
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.6); font-size: 12px;
  border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
  transition: background 0.2s;
}
.reset-btn:hover { background: rgba(255,255,255,0.12); }

/* ─── CSS KEYFRAME ANIMATIONS ─── */
@keyframes css-spin {
  to { transform: rotate(360deg); }
}
@keyframes css-bounce {
  0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: translateY(-20px); animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
@keyframes css-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.9); }
}
@keyframes css-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
  20%, 40%, 60%, 80% { transform: translateX(6px); }
}
@keyframes css-ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes css-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes css-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes css-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes css-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes css-heartbeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.2); }
  28% { transform: scale(1); }
  42% { transform: scale(1.15); }
  70% { transform: scale(1); }
}
@keyframes css-wiggle {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-10deg); }
  30% { transform: rotate(10deg); }
  45% { transform: rotate(-8deg); }
  60% { transform: rotate(8deg); }
  75% { transform: rotate(-4deg); }
  90% { transform: rotate(4deg); }
}
@keyframes css-flip-anim {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

.css-spin      { animation: css-spin      1.2s linear infinite; }
.css-bounce    { animation: css-bounce    1s ease-in-out infinite; }
.css-pulse     { animation: css-pulse     1.5s ease-in-out infinite; }
.css-shake     { animation: css-shake     0.6s ease-in-out infinite; }
.css-ping      { animation: css-ping      1.5s ease-out infinite; }
.css-float     { animation: css-float     3s ease-in-out infinite; }
.css-blink     { animation: css-blink     1s step-end infinite; }
.css-heartbeat { animation: css-heartbeat 1.5s ease-in-out infinite; }
.css-wiggle    { animation: css-wiggle    0.8s ease-in-out infinite; }
.css-flip      { animation: css-flip-anim 2s ease-in-out infinite; }

.css-shimmer {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: css-shimmer 2s linear infinite;
}

.css-gradient {
  background: linear-gradient(-45deg, #f43f5e, #f97316, #eab308, #22c55e, #0ea5e9, #a855f7);
  background-size: 400% 400%;
  animation: css-gradient-shift 4s ease infinite;
}

/* ─── CSS TRANSITIONS ─────────── */
.css-transition-box {
  width: 100px; height: 50px;
  border-radius: 8px;
  background: #334155;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}

.css-t-ease:hover        { background: #6366f1; transform: translateY(-6px); transition: all 0.4s ease; }
.css-t-ease-in:hover     { background: #f43f5e; transform: translateY(-6px); transition: all 0.4s ease-in; }
.css-t-ease-out:hover    { background: #10b981; transform: translateY(-6px); transition: all 0.4s ease-out; }
.css-t-ease-in-out:hover { background: #0ea5e9; transform: translateY(-6px); transition: all 0.4s ease-in-out; }
.css-t-linear:hover      { background: #f59e0b; transform: translateY(-6px); transition: all 0.4s linear; }
.css-t-bounce:hover      { background: #a855f7; transform: translateY(-6px); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.css-t-multi:hover       {
  background: #ec4899;
  transform: translateY(-6px) scale(1.08);
  box-shadow: 0 10px 30px rgba(236,72,153,0.4);
  transition: background 0.3s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
}
.css-t-delay:hover       { background: #22c55e; transform: translateY(-6px); transition: all 0.4s ease 0.25s; }

/* ─── CSS TRANSFORMS ─────────── */
.css-transform-box {
  width: 56px; height: 56px;
  border-radius: 10px;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  cursor: pointer;
  transition: transform 0.35s ease;
}

.css-tr-translate:hover   { transform: translate(10px, -10px); }
.css-tr-rotate:hover      { transform: rotate(45deg); }
.css-tr-scale:hover       { transform: scale(1.3); }
.css-tr-skew:hover        { transform: skewX(15deg); }
.css-tr-origin {
  transform-origin: bottom left;
}
.css-tr-origin:hover      { transform: scale(1.3); }
.css-tr-perspective {
  transform-style: preserve-3d;
  perspective: 600px;
}
.css-tr-perspective:hover { transform: perspective(200px) rotateY(30deg) rotateX(20deg); }
.css-tr-matrix:hover      { transform: matrix3d(0.866, 0.5, 0, 0, -0.5, 0.866, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
.css-tr-combo:hover       { transform: translateY(-8px) rotate(12deg) scale(1.15); }

/* ─── CSS CUSTOM PROPS ────────── */
@property --hue {
  syntax: '<angle>';
  initial-value: 240deg;
  inherits: false;
}

.css-custom-prop-demo {
  width: 80px; height: 80px; border-radius: 50%;
  background: conic-gradient(
    hsl(var(--hue, 240deg), 80%, 55%),
    hsl(calc(var(--hue, 240deg) + 120deg), 80%, 55%),
    hsl(calc(var(--hue, 240deg) + 240deg), 80%, 55%),
    hsl(var(--hue, 240deg), 80%, 55%)
  );
  transition: --hue 0.3s ease;
  animation: css-spin 4s linear infinite;
}

/* ─── MOBILE ─────────────────── */
@media (max-width: 768px) {
  .anim-lab-sidebar {
    display: none;
  }
  .anim-lab-content {
    margin-left: 0;
    padding: 20px 16px 60px;
  }
  .demo-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
/* @arkzen:web:style:end */

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import React from 'react'

const animationLabAnimations = (pageRef: React.RefObject<HTMLDivElement | null>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.anim-lab-logo',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.05 }
    )
    gsap.fromTo('.nav-item',
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.2 }
    )
    gsap.fromTo('.section-header',
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.5 }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
/* @arkzen:web:animation:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => {
  const { activeSection, setActiveSection } = useAnimLabStore()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = animationLabAnimations(pageRef)
    return cleanup
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'gsap-entrance':   return <GSAPEntranceSection />
      case 'gsap-scroll':     return <GSAPScrollSection />
      case 'gsap-timeline':   return <GSAPTimelineSection />
      case 'gsap-stagger':    return <GSAPStaggerSection />
      case 'gsap-hover-3d':   return <GSAPHover3DSection />
      case 'framer-variants': return <FramerVariantsSection />
      case 'framer-gestures': return <FramerGesturesSection />
      case 'framer-layout':   return <FramerLayoutSection />
      case 'framer-keyframes':return <FramerKeyframesSection />
      case 'framer-drag':     return <FramerDragSection />
      case 'framer-scroll':   return <FramerScrollSection />
      case 'css-keyframes':   return <CSSKeyframesSection />
      case 'css-transitions': return <CSSTransitionsSection />
      case 'css-transforms':  return <CSSTransformsSection />
      case 'css-custom-props':return <CSSCustomPropsSection />
      default:                return <GSAPEntranceSection />
    }
  }

  return (
    <div ref={pageRef} className="anim-lab-root">
      <aside className="anim-lab-sidebar">
        <div className="anim-lab-logo">
          <h1>🎬 Animation Lab</h1>
          <p>GSAP · Framer Motion · CSS</p>
        </div>
        {NAV_SECTIONS.map(s => (
          <div
            key={s.id}
            className={`nav-item ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            <span className="nav-item-icon">{s.icon}</span>
            {s.label}
          </div>
        ))}
      </aside>

      <main className="anim-lab-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

/* @arkzen:web:page:index:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE SHARED COMPONENTS (Expo + RN bare)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MotiView, MotiText } from 'moti'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  Extrapolation,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated'
import { Play, RotateCcw } from 'lucide-react-native'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MotiView, MotiText } from 'moti'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  Extrapolation,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated'
import { Play, RotateCcw } from 'lucide-react-native'
import { create } from 'zustand'
/* @arkzen:import:rn:end */

// ─── ZUSTAND STORE ────────────────────────────────────────────────────────────
interface AnimLabState {
  activeSection: string
  setActiveSection: (s: string) => void
  playingDemo: string | null
  setPlayingDemo: (id: string | null) => void
  resetKey: number
  triggerReset: () => void
}

export const useAnimLabStore = create<AnimLabState>((set) => ({
  activeSection: 'entrance',
  setActiveSection: (s) => set({ activeSection: s }),
  playingDemo: null,
  setPlayingDemo: (id) => set({ playingDemo: id }),
  resetKey: 0,
  triggerReset: () => set((s) => ({ resetKey: s.resetKey + 1 })),
}))

// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
export const NAV_SECTIONS_NATIVE = [
  { id: 'entrance',    label: 'Entrance',     icon: '▶', color: '#6366f1' },
  { id: 'timeline',    label: 'Timeline',     icon: '⏱', color: '#a78bfa' },
  { id: 'stagger',     label: 'Stagger',      icon: '⠿', color: '#f59e0b' },
  { id: 'press',       label: 'Press / Tap',  icon: '👆', color: '#0ea5e9' },
  { id: 'moti',        label: 'Moti Variants',icon: '✦', color: '#f59e0b' },
  { id: 'keyframes',   label: 'Keyframes',    icon: '◈', color: '#f43f5e' },
  { id: 'loop',        label: 'Loop / Repeat',icon: '⟳', color: '#10b981' },
  { id: 'transforms',  label: 'Transforms',   icon: '⬡', color: '#a855f7' },
  { id: 'spring',      label: 'Spring',       icon: '⟲', color: '#ec4899' },
  { id: 'easing',      label: 'Easing',       icon: '⇄', color: '#f97316' },
]

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
export const nativeStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#a78bfa',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  navScroll: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  navScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 4,
  },
  navTabActive: {
    borderBottomColor: '#a78bfa',
  },
  navTabIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  navTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  navTabLabelActive: {
    color: 'white',
  },
  sectionScroll: {
    flex: 1,
  },
  sectionBottomPad: {
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    margin: 16,
    marginBottom: 12,
  },
  sectionHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
    marginBottom: 2,
  },
  sectionHeaderSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  demoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    overflow: 'hidden',
    width: '46%',
    margin: '2%',
  },
  demoCardFull: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  demoCardHeader: {
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  demoCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  demoCardDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  demoCardStage: {
    padding: 18,
    paddingVertical: 14,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animBox: {
    width: 56,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animBoxLabel: {
    fontWeight: '700',
    fontSize: 9,
    color: 'white',
  },
  animPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
  },
  animPillLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  animCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  gestureTarget: {
    width: 90,
    height: 56,
    borderRadius: 10,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  playBtnLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resetBtnLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  staggerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tlStage: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    width: '100%',
  },
  tlTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  tlDotsRow: {
    flexDirection: 'row',
  },
  tlDot: {
    fontSize: 18,
    color: '#a78bfa',
    marginHorizontal: 4,
  },
  tlBarWrap: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  tlBarFill: {
    height: 8,
    borderRadius: 4,
  },
  tlBadge: {
    backgroundColor: '#a78bfa',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  tlBadgeLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
  },
})

/* @arkzen:native:components:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE ANIMATION HOOKS (Expo)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:animation:expo */

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  Extrapolation,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated'

// ─── ENTRANCE HOOKS ───────────────────────────────────────────────────────────

export function useFadeIn(durationMs = 350) {
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const play = () => { opacity.value = withTiming(1, { duration: durationMs }) }
  const reset = () => { opacity.value = 0 }
  return { style, play, reset }
}

export function useSlideUp(durationMs = 400) {
  const translateY = useSharedValue(24)
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))
  const play = () => {
    translateY.value = withTiming(0, { duration: durationMs, easing: Easing.out(Easing.cubic) })
    opacity.value = withTiming(1, { duration: durationMs })
  }
  const reset = () => { translateY.value = 24; opacity.value = 0 }
  return { style, play, reset }
}

export function useSlideRight() {
  const translateX = useSharedValue(60)
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }))
  const play = () => {
    translateX.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    opacity.value = withTiming(1, { duration: 500 })
  }
  const reset = () => { translateX.value = 60; opacity.value = 0 }
  return { style, play, reset }
}

export function useScaleBloom() {
  const scale = useSharedValue(0.3)
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))
  const play = () => {
    scale.value = withSpring(1, { damping: 8, stiffness: 200 })
    opacity.value = withTiming(1, { duration: 300 })
  }
  const reset = () => { scale.value = 0.3; opacity.value = 0 }
  return { style, play, reset }
}

export function useRotateIn() {
  const rotate = useSharedValue(-90)
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }))
  const play = () => {
    rotate.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    opacity.value = withTiming(1, { duration: 400 })
  }
  const reset = () => { rotate.value = -90; opacity.value = 0 }
  return { style, play, reset }
}

export function useElasticScale() {
  const scaleX = useSharedValue(0)
  const opacity = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleX: scaleX.value }],
    opacity: opacity.value,
  }))
  const play = () => {
    scaleX.value = withSpring(1, { damping: 6, stiffness: 150 })
    opacity.value = withTiming(1, { duration: 300 })
  }
  const reset = () => { scaleX.value = 0; opacity.value = 0 }
  return { style, play, reset }
}

// ─── LOOP HOOKS ──────────────────────────────────────────────────────────────

export function useSpin() {
  const rotate = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }))
  const play = () => { rotate.value = withRepeat(withTiming(360, { duration: 1200, easing: Easing.linear }), -1) }
  const reset = () => { cancelAnimation(rotate); rotate.value = 0 }
  return { style, play, reset }
}

export function useBounce() {
  const translateY = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))
  const play = () => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }),
      ), -1
    )
  }
  const reset = () => { cancelAnimation(translateY); translateY.value = 0 }
  return { style, play, reset }
}

export function usePulse() {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))
  const play = () => {
    scale.value = withRepeat(withSequence(withTiming(0.9, { duration: 750 }), withTiming(1, { duration: 750 })), -1)
    opacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 750 }), withTiming(1, { duration: 750 })), -1)
  }
  const reset = () => { cancelAnimation(scale); cancelAnimation(opacity); scale.value = 1; opacity.value = 1 }
  return { style, play, reset }
}

export function useShake() {
  const translateX = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
  const play = () => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 60 }), withTiming(6, { duration: 60 }),
        withTiming(-6, { duration: 60 }), withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      ), -1
    )
  }
  const reset = () => { cancelAnimation(translateX); translateX.value = 0 }
  return { style, play, reset }
}

export function useFloat() {
  const translateY = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))
  const play = () => {
    translateY.value = withRepeat(
      withSequence(withTiming(-10, { duration: 1500 }), withTiming(0, { duration: 1500 })), -1
    )
  }
  const reset = () => { cancelAnimation(translateY); translateY.value = 0 }
  return { style, play, reset }
}

export function useHeartbeat() {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const play = () => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 140 }),
        withTiming(1, { duration: 140 }),
        withTiming(1.15, { duration: 140 }),
        withTiming(1, { duration: 420 }),
      ), -1
    )
  }
  const reset = () => { cancelAnimation(scale); scale.value = 1 }
  return { style, play, reset }
}

export function useWiggle() {
  const rotate = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }))
  const play = () => {
    rotate.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 80 }), withTiming(10, { duration: 80 }),
        withTiming(-8, { duration: 80 }), withTiming(8, { duration: 80 }),
        withTiming(0, { duration: 80 }),
      ), -1
    )
  }
  const reset = () => { cancelAnimation(rotate); rotate.value = 0 }
  return { style, play, reset }
}

// ─── TIMELINE HOOK ────────────────────────────────────────────────────────────

export function useTimeline(onComplete?: () => void) {
  const bgOpacity = useSharedValue(0)
  const titleY = useSharedValue(30)
  const titleOp = useSharedValue(0)
  const dotsScale = useSharedValue(0)
  const bar1 = useSharedValue(0)
  const bar2 = useSharedValue(0)
  const bar3 = useSharedValue(0)
  const bar4 = useSharedValue(0)
  const badgeOp = useSharedValue(0)
  const badgeScale = useSharedValue(0.5)

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }))
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value, transform: [{ translateY: titleY.value }] }))
  const dotsStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotsScale.value }] }))
  const bar1Style = useAnimatedStyle(() => ({ width: `${bar1.value * 100}%` }))
  const bar2Style = useAnimatedStyle(() => ({ width: `${bar2.value * 100}%` }))
  const bar3Style = useAnimatedStyle(() => ({ width: `${bar3.value * 100}%` }))
  const bar4Style = useAnimatedStyle(() => ({ width: `${bar4.value * 100}%` }))
  const badgeStyle = useAnimatedStyle(() => ({ opacity: badgeOp.value, transform: [{ scale: badgeScale.value }] }))

  const barStyles = [bar1Style, bar2Style, bar3Style, bar4Style]

  const play = () => {
    bgOpacity.value = withTiming(1, { duration: 400 })
    titleOp.value = withDelay(450, withTiming(1, { duration: 400 }))
    titleY.value = withDelay(450, withSpring(0, { damping: 14 }))
    dotsScale.value = withDelay(700, withSpring(1, { damping: 8, stiffness: 200 }))
    bar1.value = withDelay(900, withTiming(0.70, { duration: 500 }))
    bar2.value = withDelay(1050, withTiming(0.85, { duration: 500 }))
    bar3.value = withDelay(1200, withTiming(0.55, { duration: 500 }))
    bar4.value = withDelay(1350, withTiming(0.90, { duration: 500 }))
    badgeOp.value = withDelay(1900, withTiming(1, { duration: 400 }))
    badgeScale.value = withDelay(1900, withSpring(1, { damping: 8, stiffness: 150 }))
    if (onComplete) {
      badgeOp.value = withDelay(1900, withTiming(1, { duration: 400 }, (finished) => {
        if (finished) runOnJS(onComplete)()
      }))
    }
  }

  const reset = () => {
    bgOpacity.value = 0; titleY.value = 30; titleOp.value = 0
    dotsScale.value = 0; bar1.value = 0; bar2.value = 0; bar3.value = 0; bar4.value = 0
    badgeOp.value = 0; badgeScale.value = 0.5
  }

  return { bgStyle, titleStyle, dotsStyle, barStyles, badgeStyle, play, reset }
}

// ─── STAGGER HOOK ─────────────────────────────────────────────────────────────

export function useStaggerItems(count: number, delayPerItem = 80) {
  const values = Array.from({ length: count }, () => ({
    op: useSharedValue(0),
    y: useSharedValue(20),
  }))
  const styles = values.map(v => useAnimatedStyle(() => ({
    opacity: v.op.value,
    transform: [{ translateY: v.y.value }],
  })))
  const play = () => {
    values.forEach((v, i) => {
      v.op.value = withDelay(i * delayPerItem, withTiming(1, { duration: 350 }))
      v.y.value = withDelay(i * delayPerItem, withSpring(0, { damping: 14 }))
    })
  }
  const reset = () => { values.forEach(v => { v.op.value = 0; v.y.value = 20 }) }
  return { styles, play, reset }
}

// ─── GESTURE HOOKS ────────────────────────────────────────────────────────────

export function usePressBounce() {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const onPressIn = () => { scale.value = withSpring(0.92, { damping: 10 }) }
  const onPressOut = () => { scale.value = withSpring(1, { damping: 10 }) }
  return { style, onPressIn, onPressOut }
}

export function usePressColor() {
  const progress = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0.6], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.95], Extrapolation.CLAMP) }],
  }))
  const onPressIn = () => { progress.value = withTiming(1, { duration: 100 }) }
  const onPressOut = () => { progress.value = withTiming(0, { duration: 200 }) }
  return { style, onPressIn, onPressOut }
}

export function useHoverRotate() {
  const rotate = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }))
  const onPressIn = () => { rotate.value = withTiming(360, { duration: 600 }) }
  const onPressOut = () => { rotate.value = withTiming(0, { duration: 0 }) }
  return { style, onPressIn, onPressOut }
}

export function useScale(to = 1.3) {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const play = () => { scale.value = withSpring(to, { damping: 10, stiffness: 120 }) }
  const reset = () => { scale.value = withSpring(1) }
  return { style, play, reset }
}

// ─── EASING DEMO HOOK ─────────────────────────────────────────────────────────

export function useEasingDemo(easingFn: any) {
  const translateX = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }))
  const play = () => { translateX.value = withTiming(80, { duration: 700, easing: easingFn }) }
  const reset = () => { translateX.value = 0 }
  return { style, play, reset }
}

// ─── COMBINED TRANSFORM HOOK ─────────────────────────────────────────────────

export function useCombinedTransform() {
  const sv = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    opacity: sv.value,
    transform: [
      { translateY: (1 - sv.value) * 30 },
      { scale: 0.4 + sv.value * 0.6 },
      { rotate: `${(1 - sv.value) * -45}deg` },
    ],
  }))
  const play = () => { sv.value = withSpring(1, { damping: 10, stiffness: 120 }) }
  const reset = () => { sv.value = 0 }
  return { style, play, reset }
}

/* @arkzen:native:animation:expo:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE ANIMATION HOOKS (Bare RN)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:animation:rn */

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  Extrapolation,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated'

// Same hooks as Expo version, re-exported for Bare RN
// (In a real implementation, these would be the same since both use reanimated)

export {
  useFadeIn,
  useSlideUp,
  useSlideRight,
  useScaleBloom,
  useRotateIn,
  useElasticScale,
  useSpin,
  useBounce,
  usePulse,
  useShake,
  useFloat,
  useHeartbeat,
  useWiggle,
  useTimeline,
  useStaggerItems,
  usePressBounce,
  usePressColor,
  useHoverRotate,
  useScale,
  useEasingDemo,
  useCombinedTransform,
} from '@arkzen:native:animation:expo'

/* @arkzen:native:animation:rn:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE PAGES (Expo)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:page:index + @arkzen:import:expo */
/* @arkzen:import:expo */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const IndexPageExpo = () => {
  const { activeSection, setActiveSection } = useAnimLabStore()
  const [key, setKey] = useState(0)

  const renderSection = () => {
    switch (activeSection) {
      case 'entrance':   return <EntranceSection />
      case 'timeline':   return <TimelineSection />
      case 'stagger':    return <StaggerSection />
      case 'press':      return <PressSection />
      case 'moti':       return <MotiSection />
      case 'keyframes':  return <KeyframesSection />
      case 'loop':       return <LoopSection />
      case 'transforms': return <TransformsSection />
      case 'spring':     return <SpringSection />
      case 'easing':     return <EasingSection />
      default:           return <EntranceSection />
    }
  }

  return (
    <SafeAreaView style={nativeStyles.root}>
      <View style={nativeStyles.header}>
        <Text style={nativeStyles.headerTitle}>🎬 Animation Lab</Text>
        <Text style={nativeStyles.headerSub}>Reanimated · Moti · Spring · Easing</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={nativeStyles.navScroll}
        contentContainerStyle={nativeStyles.navScrollContent}
      >
        {NAV_SECTIONS_NATIVE.map(({ id, label, icon, color }) => {
          const active = activeSection === id
          return (
            <TouchableOpacity
              key={id}
              style={[nativeStyles.navTab, active && nativeStyles.navTabActive]}
              onPress={() => setActiveSection(id)}
              activeOpacity={0.7}
            >
              <Text style={nativeStyles.navTabIcon}>{icon}</Text>
              <Text style={[nativeStyles.navTabLabel, active && nativeStyles.navTabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <MotiView
        key={activeSection + key}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 220 }}
        style={nativeStyles.sectionScroll}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderSection()}
          <View style={nativeStyles.sectionBottomPad} />
        </ScrollView>
      </MotiView>
    </SafeAreaView>
  )
}

export default IndexPageExpo
/* @arkzen:native:page:index:end */


// ─────────────────────────────────────────────────────────────────────────────
// NATIVE PAGES (Bare RN)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:page:index + @arkzen:import:rn */
/* @arkzen:import:rn */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const IndexPageRN = () => {
  const { activeSection, setActiveSection } = useAnimLabStore()
  const [key, setKey] = useState(0)

  const renderSection = () => {
    switch (activeSection) {
      case 'entrance':   return <EntranceSection />
      case 'timeline':   return <TimelineSection />
      case 'stagger':    return <StaggerSection />
      case 'press':      return <PressSection />
      case 'moti':       return <MotiSection />
      case 'keyframes':  return <KeyframesSection />
      case 'loop':       return <LoopSection />
      case 'transforms': return <TransformsSection />
      case 'spring':     return <SpringSection />
      case 'easing':     return <EasingSection />
      default:           return <EntranceSection />
    }
  }

  return (
    <SafeAreaView style={nativeStyles.root}>
      <View style={nativeStyles.header}>
        <Text style={nativeStyles.headerTitle}>🎬 Animation Lab</Text>
        <Text style={nativeStyles.headerSub}>Reanimated · Moti · Spring · Easing</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={nativeStyles.navScroll}
        contentContainerStyle={nativeStyles.navScrollContent}
      >
        {NAV_SECTIONS_NATIVE.map(({ id, label, icon, color }) => {
          const active = activeSection === id
          return (
            <TouchableOpacity
              key={id}
              style={[nativeStyles.navTab, active && nativeStyles.navTabActive]}
              onPress={() => setActiveSection(id)}
              activeOpacity={0.7}
            >
              <Text style={nativeStyles.navTabIcon}>{icon}</Text>
              <Text style={[nativeStyles.navTabLabel, active && nativeStyles.navTabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <MotiView
        key={activeSection + key}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          opacity: { type: 'timing', duration: 220 },
          translateY: { type: 'timing', duration: 220 },
        }}
        style={nativeStyles.sectionScroll}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderSection()}
          <View style={nativeStyles.sectionBottomPad} />
        </ScrollView>
      </MotiView>
    </SafeAreaView>
  )
}

export default IndexPageRN
/* @arkzen:native:page:index:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE SECTION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:sections */

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

const SectionHeaderNative = ({
  icon, title, subtitle, color
}: {
  icon: string; title: string; subtitle: string; color: string
}) => (
  <View style={nativeStyles.sectionHeader}>
    <View style={[nativeStyles.sectionHeaderIcon, { backgroundColor: `${color}22` }]}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={nativeStyles.sectionHeaderTitle}>{title}</Text>
      <Text style={nativeStyles.sectionHeaderSub}>{subtitle}</Text>
    </View>
  </View>
)

// ─── DEMO CARD ─────────────────────────────────────────────────────────────────

const DemoCardNative = ({ title, desc, full = false, children }: {
  title: string; desc: string; full?: boolean; children: React.ReactNode
}) => (
  <View style={full ? nativeStyles.demoCardFull : nativeStyles.demoCard}>
    <View style={nativeStyles.demoCardHeader}>
      <Text style={nativeStyles.demoCardTitle}>{title}</Text>
      <Text style={nativeStyles.demoCardDesc}>{desc}</Text>
    </View>
    <View style={nativeStyles.demoCardStage}>{children}</View>
  </View>
)

// ─── PLAY/RESET BUTTONS ───────────────────────────────────────────────────────

const PlayResetNative = ({ onPlay, onReset }: { onPlay: () => void; onReset: () => void }) => (
  <View style={nativeStyles.btnRow}>
    <TouchableOpacity style={nativeStyles.playBtn} onPress={onPlay}>
      <Play size={14} color="white" />
      <Text style={nativeStyles.playBtnLabel}>Play</Text>
    </TouchableOpacity>
    <TouchableOpacity style={nativeStyles.resetBtn} onPress={onReset}>
      <RotateCcw size={14} color="rgba(255,255,255,0.6)" />
      <Text style={nativeStyles.resetBtnLabel}>Reset</Text>
    </TouchableOpacity>
  </View>
)

// ─── ENTRANCE SECTION ─────────────────────────────────────────────────────────

const EntranceSection = () => {
  const fadeIn = useFadeIn()
  const slideUp = useSlideUp()
  const slideR = useSlideRight()
  const bloom = useScaleBloom()
  const rotateIn = useRotateIn()
  const elastic = useElasticScale()

  const DEMOS = [
    { label: 'Fade In',      desc: 'withTiming opacity',          hook: fadeIn,  color: '#6366f1' },
    { label: 'Slide Up',     desc: 'withTiming translateY',       hook: slideUp, color: '#8b5cf6' },
    { label: 'Slide Right',  desc: 'withTiming translateX',       hook: slideR,  color: '#a855f7' },
    { label: 'Scale Bloom',  desc: 'withSpring scale from 0.3',   hook: bloom,   color: '#c084fc' },
    { label: 'Rotate In',    desc: 'withTiming -90° → 0°',        hook: rotateIn,color: '#d946ef' },
    { label: 'Elastic Scale',desc: 'withSpring scaleX from 0',    hook: elastic, color: '#e879f9' },
  ]

  return (
    <>
      <SectionHeaderNative icon="▶" title="Entrance Animations" subtitle="withTiming, withSpring entrance variants" color="#6366f1" />
      <View style={nativeStyles.demoGrid}>
        {DEMOS.map(({ label, desc, hook, color }) => (
          <DemoCardNative key={label} title={label} desc={desc}>
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={nativeStyles.animBoxLabel}>{label.split(' ')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={hook.play} onReset={hook.reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}

// ─── TIMELINE SECTION ─────────────────────────────────────────────────────────

const TimelineSection = () => {
  const [playing, setPlaying] = useState(false)
  const tl = useTimeline(() => setPlaying(false))
  const BAR_WIDTHS = [70, 85, 55, 90]
  const BAR_COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#d946ef']

  const handlePlay = () => {
    setPlaying(true)
    tl.reset()
    setTimeout(() => tl.play(), 50)
  }

  return (
    <>
      <SectionHeaderNative icon="⏱" title="Timeline Sequence" subtitle="Chained withDelay — sequential orchestration" color="#a78bfa" />
      <DemoCardNative title="Chained Timeline" desc="Multiple animations queued with withDelay" full>
        <View style={nativeStyles.btnRow}>
          <TouchableOpacity style={[nativeStyles.playBtn, playing && { opacity: 0.5 }]} onPress={handlePlay} disabled={playing}>
            <Play size={14} color="white" />
            <Text style={nativeStyles.playBtnLabel}>{playing ? 'Playing...' : 'Play Timeline'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={nativeStyles.resetBtn} onPress={() => { setPlaying(false); tl.reset() }}>
            <RotateCcw size={14} color="rgba(255,255,255,0.6)" />
            <Text style={nativeStyles.resetBtnLabel}>Reset</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[nativeStyles.tlStage, tl.bgStyle]}>
          <Animated.Text style={nativeStyles.tlTitle}>Timeline Magic ✨</Animated.Text>
          <Animated.View style={[nativeStyles.tlDotsRow, tl.dotsStyle]}>
            {['●','●','●','●','●'].map((d, i) => (
              <Text key={i} style={nativeStyles.tlDot}>{d}</Text>
            ))}
          </Animated.View>
          <View style={{ width: '100%' }}>
            {BAR_WIDTHS.map((w, i) => (
              <View key={i} style={nativeStyles.tlBarWrap}>
                <Animated.View style={[nativeStyles.tlBarFill, { backgroundColor: BAR_COLORS[i] }, tl.barStyles[i]]} />
              </View>
            ))}
          </View>
          <Animated.View style={[nativeStyles.tlBadge, tl.badgeStyle]}>
            <Text style={nativeStyles.tlBadgeLabel}>Complete!</Text>
          </Animated.View>
        </Animated.View>
      </DemoCardNative>
    </>
  )
}

// ─── STAGGER SECTION ──────────────────────────────────────────────────────────

const StaggerSection = () => {
  const linear = useStaggerItems(6, 80)
  const center = useStaggerItems(7, 70)
  const fromEnd = useStaggerItems(6, 60)
  const grid = useStaggerItems(12, 50)

  const COLORS_6 = ['#f59e0b','#f97316','#ef4444','#ec4899','#a855f7','#6366f1']
  const COLORS_7 = ['#6366f1','#818cf8','#a5b4fc','#c4b5fd','#a5b4fc','#818cf8','#6366f1']
  const COLORS_E = ['#10b981','#34d399','#6ee7b7','#a7f3d0','#6ee7b7','#34d399']
  const GRID_COLS = Array.from({ length: 12 }, (_, i) => `hsl(${i * 25}, 80%, 58%)`)

  return (
    <>
      <SectionHeaderNative icon="⠿" title="Stagger Animations" subtitle="withDelay staggered arrays — linear, center, end, grid" color="#f59e0b" />
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="Linear" desc="stagger left-to-right">
          <View style={nativeStyles.staggerRow}>
            {COLORS_6.map((c, i) => (
              <Animated.View key={i} style={[{ width: 28, height: 28, borderRadius: 6, backgroundColor: c }, linear.styles[i]]} />
            ))}
          </View>
          <PlayResetNative onPlay={linear.play} onReset={linear.reset} />
        </DemoCardNative>
        <DemoCardNative title="From Center" desc="stagger outward from middle">
          <View style={nativeStyles.staggerRow}>
            {COLORS_7.map((c, i) => (
              <Animated.View key={i} style={[{ width: 24, height: 24, borderRadius: 6, backgroundColor: c }, center.styles[i]]} />
            ))}
          </View>
          <PlayResetNative onPlay={center.play} onReset={center.reset} />
        </DemoCardNative>
        <DemoCardNative title="From End" desc="stagger right-to-left">
          <View style={nativeStyles.staggerRow}>
            {COLORS_E.map((c, i) => (
              <Animated.View key={i} style={[{ width: 28, height: 28, borderRadius: 6, backgroundColor: c }, fromEnd.styles[i]]} />
            ))}
          </View>
          <PlayResetNative onPlay={fromEnd.play} onReset={fromEnd.reset} />
        </DemoCardNative>
        <DemoCardNative title="Grid (3×4)" desc="2D grid stagger wave">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {GRID_COLS.map((c, i) => (
              <Animated.View key={i} style={[{ width: 24, height: 24, borderRadius: 5, backgroundColor: c }, grid.styles[i]]} />
            ))}
          </View>
          <PlayResetNative onPlay={grid.play} onReset={grid.reset} />
        </DemoCardNative>
      </View>
    </>
  )
}

// ─── PRESS SECTION ────────────────────────────────────────────────────────────

const PressSection = () => {
  const bounce = usePressBounce()
  const color = usePressColor()
  const rotator = useHoverRotate()
  const ripple = useScale(1.25)

  return (
    <>
      <SectionHeaderNative icon="👆" title="Press / Tap Gestures" subtitle="onPressIn/Out driving Reanimated shared values" color="#0ea5e9" />
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="Scale Bounce" desc="withSpring on press in/out">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#0ea5e9' }, bounce.style]}>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              onPressIn={bounce.onPressIn}
              onPressOut={bounce.onPressOut}
              activeOpacity={1}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Hold me</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCardNative>
        <DemoCardNative title="Opacity Dim" desc="interpolate opacity on press">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#6366f1' }, color.style]}>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              onPressIn={color.onPressIn}
              onPressOut={color.onPressOut}
              activeOpacity={1}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Press</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCardNative>
        <DemoCardNative title="Icon Rotate" desc="360° spin on press-in">
          <Animated.View style={[{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(14,165,233,0.15)', alignItems: 'center', justifyContent: 'center' }, rotator.style]}>
            <TouchableOpacity
              onPressIn={rotator.onPressIn}
              onPressOut={rotator.onPressOut}
              activeOpacity={1}
              style={{ alignItems: 'center', justifyContent: 'center', width: 52, height: 52 }}
            >
              <Text style={{ fontSize: 24 }}>↻</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCardNative>
        <DemoCardNative title="Ripple Scale" desc="withSpring scale up on tap">
          <Animated.View style={[nativeStyles.animCircle, { backgroundColor: '#10b981' }, ripple.style]}>
            <TouchableOpacity
              onPress={ripple.play}
              onLongPress={ripple.reset}
              activeOpacity={0.9}
              style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 10 }}>TAP</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCardNative>
      </View>
    </>
  )
}

// ─── MOTI SECTION ─────────────────────────────────────────────────────────────

const MotiSection = () => {
  const [visible, setVisible] = useState(false)
  const [show1, setShow1] = useState(true)
  const [show2, setShow2] = useState(true)
  const [show3, setShow3] = useState(true)

  return (
    <>
      <SectionHeaderNative icon="✦" title="Moti Variants" subtitle="MotiView from/animate/exit — AnimatePresence equivalent" color="#f59e0b" />
      <DemoCardNative title="Stagger Children" desc="MotiView with stagger delay" full>
        <View style={nativeStyles.btnRow}>
          <TouchableOpacity style={nativeStyles.playBtn} onPress={() => setVisible(v => !v)}>
            <Text style={nativeStyles.playBtnLabel}>{visible ? 'Hide' : 'Animate In'}</Text>
          </TouchableOpacity>
        </View>
        {visible && (
          <View style={[nativeStyles.staggerRow, { marginTop: 12 }]}>
            {['Alpha','Beta','Gamma','Delta','Epsilon','Zeta'].map((w, i) => (
              <MotiView
                key={w}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  opacity: { type: 'spring', delay: i * 100, damping: 14 },
                  translateY: { type: 'spring', delay: i * 100, damping: 14 },
                }}
                style={[nativeStyles.animPill, { backgroundColor: '#f59e0b' }]}
              >
                <Text style={nativeStyles.animPillLabel}>{w}</Text>
              </MotiView>
            ))}
          </View>
        )}
      </DemoCardNative>
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="Fade + Slide" desc="from x:-40 animate x:0">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show1 && (
              <MotiView
                from={{ opacity: 0, translateX: -40 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 40 }}
                style={{ width: 80, height: 40, borderRadius: 8, backgroundColor: '#3b82f6' }}
              />
            )}
          </View>
          <TouchableOpacity style={nativeStyles.playBtn} onPress={() => setShow1(v => !v)}>
            <Text style={nativeStyles.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCardNative>
        <DemoCardNative title="Scale Bounce" desc="from scale:0 with spring">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show2 && (
              <MotiView
                from={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  opacity: { type: 'spring', stiffness: 400, damping: 20 },
                  scale: { type: 'spring', stiffness: 400, damping: 20 },
                }}
                style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#10b981' }}
              />
            )}
          </View>
          <TouchableOpacity style={nativeStyles.playBtn} onPress={() => setShow2(v => !v)}>
            <Text style={nativeStyles.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCardNative>
        <DemoCardNative title="Rotate In" desc="from rotate:-180 with spring">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show3 && (
              <MotiView
                from={{ opacity: 0, rotate: '-180deg' }}
                animate={{ opacity: 1, rotate: '0deg' }}
                exit={{ opacity: 0, rotate: '180deg' }}
                transition={{
                  opacity: { type: 'spring', stiffness: 200 },
                  rotate: { type: 'spring', stiffness: 200 },
                }}
                style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#a855f7' }}
              />
            )}
          </View>
          <TouchableOpacity style={nativeStyles.playBtn} onPress={() => setShow3(v => !v)}>
            <Text style={nativeStyles.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCardNative>
        <DemoCardNative title="whileInView equiv." desc="MotiView animate on mount">
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              opacity: { type: 'spring', stiffness: 200, damping: 18 },
              scale: { type: 'spring', stiffness: 200, damping: 18 },
            }}
            style={{ width: 100, height: 44, borderRadius: 10, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>In View!</Text>
          </MotiView>
        </DemoCardNative>
      </View>
    </>
  )
}

// ─── KEYFRAMES SECTION ────────────────────────────────────────────────────────

const KeyframesSection = () => {
  const bounce = useBounce()
  const pulse = usePulse()
  const shake = useShake()
  const float = useFloat()
  const heart = useHeartbeat()
  const wiggle = useWiggle()

  return (
    <>
      <SectionHeaderNative icon="◈" title="Keyframe Sequences" subtitle="withSequence multi-step array animations" color="#f43f5e" />
      <View style={nativeStyles.demoGrid}>
        {[
          { label: 'Bounce',    desc: 'y: 0 → -20 → 0 loop',   hook: bounce, color: '#f43f5e' },
          { label: 'Pulse',     desc: 'scale+opacity oscillate', hook: pulse,  color: '#f97316' },
          { label: 'Shake',     desc: 'x: ±6px sequence fast',  hook: shake,  color: '#eab308' },
          { label: 'Float',     desc: 'y: 0 → -10 → 0 slow',   hook: float,  color: '#22c55e' },
          { label: 'Heartbeat', desc: 'double scale pulse',     hook: heart,  color: '#ec4899' },
          { label: 'Wiggle',    desc: 'rotate ±10deg sequence', hook: wiggle, color: '#a855f7' },
        ].map(({ label, desc, hook, color }) => (
          <DemoCardNative key={label} title={label} desc={desc}>
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={nativeStyles.animBoxLabel}>{label.toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={hook.play} onReset={hook.reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}

// ─── LOOP SECTION ─────────────────────────────────────────────────────────────

const LoopSection = () => {
  const spin1 = useSpin()
  const pulse2 = usePulse()
  const wave0 = useBounce()
  const wave1 = useBounce()
  const wave2 = useBounce()
  const wave3 = useBounce()
  const wave4 = useBounce()
  const [waveOn, setWaveOn] = useState(false)

  const WAVE_HOOKS = [wave0, wave1, wave2, wave3, wave4]
  const WAVE_COLORS = ['#0ea5e9','#38bdf8','#7dd3fc','#bae6fd','#e0f2fe']

  const playWave = () => {
    setWaveOn(true)
    WAVE_HOOKS.forEach((h, i) => setTimeout(() => h.play(), i * 120))
  }
  const resetWave = () => {
    setWaveOn(false)
    WAVE_HOOKS.forEach(h => h.reset())
  }

  return (
    <>
      <SectionHeaderNative icon="⟳" title="Loop / Repeat" subtitle="withRepeat(-1) — infinite looping animations" color="#10b981" />
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="Spin (infinite)" desc="withRepeat(-1) Easing.linear">
          <Animated.View style={[nativeStyles.animBox, { backgroundColor: '#6366f1' }, spin1.style]}>
            <Text style={nativeStyles.animBoxLabel}>SPIN</Text>
          </Animated.View>
          <PlayResetNative onPlay={spin1.play} onReset={spin1.reset} />
        </DemoCardNative>
        <DemoCardNative title="Pulse (infinite)" desc="withRepeat(-1) scale+opacity">
          <Animated.View style={[nativeStyles.animCircle, { backgroundColor: '#f43f5e' }, pulse2.style]} />
          <PlayResetNative onPlay={pulse2.play} onReset={pulse2.reset} />
        </DemoCardNative>
        <DemoCardNative title="Wave Bars" desc="5 bars staggered bounce loop" full>
          <View style={[nativeStyles.waveRow, { justifyContent: 'center' }]}>
            {WAVE_HOOKS.map((h, i) => (
              <Animated.View
                key={i}
                style={[{ width: 10, height: 44, borderRadius: 5, backgroundColor: WAVE_COLORS[i] }, h.style]}
              />
            ))}
          </View>
          <View style={nativeStyles.btnRow}>
            <TouchableOpacity style={nativeStyles.playBtn} onPress={playWave}>
              <Play size={14} color="white" />
              <Text style={nativeStyles.playBtnLabel}>Wave</Text>
            </TouchableOpacity>
            <TouchableOpacity style={nativeStyles.resetBtn} onPress={resetWave}>
              <RotateCcw size={14} color="rgba(255,255,255,0.6)" />
              <Text style={nativeStyles.resetBtnLabel}>Reset</Text>
            </TouchableOpacity>
          </View>
        </DemoCardNative>
        <DemoCardNative title="Color Cycle (Moti)" desc="MotiView background array loop">
          <MotiView
            from={{ backgroundColor: '#f43f5e' }}
            animate={{ backgroundColor: ['#f43f5e','#f97316','#eab308','#22c55e','#0ea5e9','#a855f7','#f43f5e'] }}
            transition={{
              backgroundColor: { loop: true, duration: 4000, type: 'timing' },
            }}
            style={{ width: 72, height: 72, borderRadius: 12 }}
          />
        </DemoCardNative>
        <DemoCardNative title="Border Radius Morph" desc="shape morphs via MotiView loop">
          <MotiView
            animate={{ borderRadius: [12, 26, 6, 26, 12] }}
            transition={{
              borderRadius: { loop: true, duration: 2500, type: 'timing' },
            }}
            style={{ width: 64, height: 64, backgroundColor: '#a855f7' }}
          />
        </DemoCardNative>
      </View>
    </>
  )
}

// ─── TRANSFORMS SECTION ───────────────────────────────────────────────────────

const TransformsSection = () => {
  const translate = useSlideUp()
  const scaleAnim = useScaleBloom()
  const rotAnim = useRotateIn()
  const elastic2 = useElasticScale()
  const combined = useCombinedTransform()

  return (
    <>
      <SectionHeaderNative icon="⬡" title="Transform Variants" subtitle="translate, rotate, scale, skew, combined — tap to trigger" color="#a855f7" />
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="translateY" desc="withTiming y: 24 → 0">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#a855f7' }, translate.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>Y</Text>
          </Animated.View>
          <PlayResetNative onPlay={translate.play} onReset={translate.reset} />
        </DemoCardNative>
        <DemoCardNative title="scale" desc="withSpring scale 0.3→1">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#8b5cf6' }, scaleAnim.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>S</Text>
          </Animated.View>
          <PlayResetNative onPlay={scaleAnim.play} onReset={scaleAnim.reset} />
        </DemoCardNative>
        <DemoCardNative title="rotate" desc="withTiming -90°→0°">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#6366f1' }, rotAnim.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>R</Text>
          </Animated.View>
          <PlayResetNative onPlay={rotAnim.play} onReset={rotAnim.reset} />
        </DemoCardNative>
        <DemoCardNative title="scaleX elastic" desc="withSpring scaleX 0→1">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#c084fc' }, elastic2.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>sX</Text>
          </Animated.View>
          <PlayResetNative onPlay={elastic2.play} onReset={elastic2.reset} />
        </DemoCardNative>
        <DemoCardNative title="Combined" desc="slide + scale + rotate together" full>
          <View style={{ alignItems: 'center' }}>
            <Animated.View style={[{ width: 80, height: 50, borderRadius: 10, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center' }, combined.style]}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Combined</Text>
            </Animated.View>
            <PlayResetNative onPlay={combined.play} onReset={combined.reset} />
          </View>
        </DemoCardNative>
      </View>
    </>
  )
}

// ─── SPRING SECTION ──────────────────────────────────────────────────────────

const SpringSection = () => {
  const makeSpring = (damping: number, stiffness: number) => {
    const sv = useSharedValue(0)
    const style = useAnimatedStyle(() => ({ transform: [{ translateX: sv.value }] }))
    const play = () => { sv.value = withSpring(80, { damping, stiffness }) }
    const reset = () => { sv.value = withSpring(0, { damping: 20, stiffness: 200 }) }
    return { style, play, reset }
  }

  const springConfigs = [
    { label: 'Bouncy',   desc: 'damping:4 stiffness:200',  d: 4,  k: 200, color: '#ec4899' },
    { label: 'Snappy',   desc: 'damping:10 stiffness:400', d: 10, k: 400, color: '#f97316' },
    { label: 'Wobbly',   desc: 'damping:2 stiffness:80',   d: 2,  k: 80,  color: '#a855f7' },
    { label: 'Stiff',    desc: 'damping:20 stiffness:300', d: 20, k: 300, color: '#0ea5e9' },
    { label: 'Slow',     desc: 'damping:15 stiffness:40',  d: 15, k: 40,  color: '#10b981' },
    { label: 'Elastic',  desc: 'damping:6 stiffness:150',  d: 6,  k: 150, color: '#6366f1' },
  ]

  const springs = springConfigs.map(c => makeSpring(c.d, c.k))

  return (
    <>
      <SectionHeaderNative icon="⟲" title="Spring Physics" subtitle="withSpring — damping and stiffness variants" color="#ec4899" />
      <View style={nativeStyles.demoGrid}>
        {springConfigs.map(({ label, desc, color }, i) => (
          <DemoCardNative key={label} title={label} desc={desc}>
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: color }, springs[i].style]}>
              <Text style={nativeStyles.animBoxLabel}>{label.toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={springs[i].play} onReset={springs[i].reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}

// ─── EASING SECTION ──────────────────────────────────────────────────────────

const EasingSection = () => {
  const demos = [
    useEasingDemo(Easing.linear),
    useEasingDemo(Easing.ease),
    useEasingDemo(Easing.in(Easing.quad)),
    useEasingDemo(Easing.out(Easing.quad)),
    useEasingDemo(Easing.inOut(Easing.quad)),
    useEasingDemo(Easing.out(Easing.back(2.5))),
    useEasingDemo(Easing.out(Easing.elastic(1))),
    useEasingDemo(Easing.out(Easing.bounce)),
  ]

  const LABELS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'back.out', 'elastic', 'bounce']
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d946ef', '#ec4899', '#f43f5e', '#f97316']

  return (
    <>
      <SectionHeaderNative icon="⇄" title="Easing Functions" subtitle="withTiming easing variants — slide right to compare" color="#f97316" />
      <View style={nativeStyles.demoGrid}>
        {demos.map(({ style, play, reset }, i) => (
          <DemoCardNative key={LABELS[i]} title={LABELS[i]} desc="withTiming 700ms">
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: COLORS[i] }, style]}>
              <Text style={nativeStyles.animBoxLabel}>{LABELS[i].split('.')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={play} onReset={reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}

/* @arkzen:native:components:sections:end */

// ─────────────────────────────────────────────────────────────────────────────
// LYNX SHARED COMPONENTS (using @lynx-js/motion)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:lynx:shared */

import { type ReactNode, useState, useEffect, useRef } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'

// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
const LYNX_NAV_SECTIONS = [
  { id: 'entrance',    label: 'Entrance',     icon: '▶', color: '#6366f1' },
  { id: 'timeline',    label: 'Timeline',     icon: '⏱', color: '#a78bfa' },
  { id: 'stagger',     label: 'Stagger',      icon: '⋮',  color: '#8b5cf6' },
  { id: 'press',       label: 'Press',        icon: '⊙', color: '#ec4899' },
  { id: 'loop',        label: 'Loop',         icon: '∞',  color: '#f59e0b' },
  { id: 'transforms',  label: 'Transforms',   icon: '⟳', color: '#10b981' },
  { id: 'spring',      label: 'Spring',       icon: '⌇', color: '#3b82f6' },
  { id: 'easing',      label: 'Easing',       icon: '⌗', color: '#ef4444' },
]

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const LynxSectionHeader = ({
  icon, title, subtitle, color
}: {
  icon: string; title: string; subtitle: string; color: string
}) => (
  <div className="flex flex-row items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl mx-4 mb-3">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}22` }}>
      <span className="text-base">{icon}</span>
    </div>
    <div className="flex-1">
      <div className="text-sm font-extrabold text-white">{title}</div>
      <div className="text-xs text-white/40">{subtitle}</div>
    </div>
  </div>
)

// ─── DEMO CARD ─────────────────────────────────────────────────────────────────
const LynxDemoCard = ({ title, desc, full = false, children }: {
  title: string; desc: string; full?: boolean; children: ReactNode
}) => (
  <div className={`${full ? 'mx-4 mb-3' : 'w-[46%] m-1'} bg-white/5 border border-white/10 rounded-xl overflow-hidden`}>
    <div className="px-3 py-2 border-b border-white/5">
      <div className="text-xs font-bold text-white/90">{title}</div>
      <div className="text-[10px] text-white/35">{desc}</div>
    </div>
    <div className="p-4 min-h-[70px] flex flex-col items-center justify-center gap-2">
      {children}
    </div>
  </div>
)

// ─── PLAY/RESET BUTTONS ───────────────────────────────────────────────────────
const LynxPlayReset = ({ onPlay, onReset }: { onPlay: () => void; onReset: () => void }) => (
  <div className="flex flex-row gap-2 items-center justify-center mt-2">
    <button className="flex flex-row items-center gap-1 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs" onPress={onPlay}>
      <span>▶</span> Play
    </button>
    <button className="flex flex-row items-center gap-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white/60 text-xs" onPress={onReset}>
      <span>↺</span> Reset
    </button>
  </div>
)

// ─── ENTRANCE SECTION ────────────────────────────────────────────────────────

const LynxEntranceSection = () => {
  const box1Ref = useMotionValueRef()
  const box2Ref = useMotionValueRef()
  const box3Ref = useMotionValueRef()
  const [show, setShow] = useState(false)

  const runEntrance = () => {
    if (!show) {
      // Reset first
      animate(box1Ref.current, { opacity: 1, y: 0 }, { duration: 0, instant: true })
      animate(box2Ref.current, { opacity: 1, scaleX: 1 }, { duration: 0, instant: true })
      animate(box3Ref.current, { opacity: 1, x: 0 }, { duration: 0, instant: true })
      setShow(true)
      // Then animate them
      animate(box1Ref.current, { opacity: 1, y: 0 }, { duration: 800, easing: [0.34, 1.56, 0.64, 1] })
      animate(box2Ref.current, { opacity: 1, scaleX: 1 }, { duration: 700, delay: 100, easing: [0.34, 1.56, 0.64, 1] })
      animate(box3Ref.current, { opacity: 1, x: 0 }, { duration: 600, delay: 200, easing: 'ease-out' })
    } else {
      // Reset
      animate(box1Ref.current, { opacity: 0, y: 30 }, { duration: 300, easing: 'ease-in' })
      animate(box2Ref.current, { opacity: 0, scaleX: 0 }, { duration: 300, easing: 'ease-in' })
      animate(box3Ref.current, { opacity: 0, x: 40 }, { duration: 300, easing: 'ease-in' })
      setTimeout(() => setShow(false), 400)
    }
  }

  return (
    <>
      <LynxSectionHeader icon="▶" title="Entrance Animations" subtitle="with @lynx-js/motion" color="#6366f1" />
      <div className="flex flex-row flex-wrap px-3">
        <LynxDemoCard title="Fade In" desc="opacity 0→1">
          <div ref={box1Ref} className="w-12 h-8 rounded-lg bg-indigo-500 opacity-0" />
          <LynxPlayReset onPlay={runEntrance} onReset={runEntrance} />
        </LynxDemoCard>
        <LynxDemoCard title="Scale X" desc="scaleX 0→1">
          <div ref={box2Ref} className="w-12 h-8 rounded-lg bg-purple-500 scale-x-0" />
          <LynxPlayReset onPlay={runEntrance} onReset={runEntrance} />
        </LynxDemoCard>
        <LynxDemoCard title="Slide Right" desc="x 40→0">
          <div ref={box3Ref} className="w-12 h-8 rounded-lg bg-pink-500 opacity-0" style={{ transform: 'translateX(40px)' }} />
          <LynxPlayReset onPlay={runEntrance} onReset={runEntrance} />
        </LynxDemoCard>
      </div>
    </>
  )
}

// ─── TIMELINE SECTION ─────────────────────────────────────────────────────────

const LynxTimelineSection = () => {
  const [step, setStep] = useState(0)
  const dotRefs = useRef([])

  const runTimeline = () => {
    setStep(0)
    // Reset all dots
    dotRefs.current.forEach((ref, i) => {
      animate(ref, { scale: 0, opacity: 0 }, { duration: 0, instant: true })
    })
    // Animate sequentially
    dotRefs.current.forEach((ref, i) => {
      animate(ref, { scale: 1, opacity: 1 }, { duration: 300, delay: i * 200, easing: 'spring' })
    })
    // Update step after all done
    setTimeout(() => setStep(5), dotRefs.current.length * 200 + 200)
  }

  return (
    <>
      <LynxSectionHeader icon="⏱" title="Timeline Sequence" subtitle="Sequential animation with delay" color="#a78bfa" />
      <LynxDemoCard title="Chained Timeline" desc="Sequential steps" full>
        <div className="flex flex-row gap-2 mb-3">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i}
                 ref={el => dotRefs.current[i] = el}
                 className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-purple-500 text-white scale-0 opacity-0`}
                 style={{ transform: 'scale(0)', opacity: 0 }}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-2">
          <button className="px-4 py-2 rounded-lg bg-purple-500 text-white text-xs font-bold" onPress={runTimeline}>
            Play Timeline
          </button>
          <button className="px-3 py-2 rounded-lg bg-white/10 text-white/60 text-xs" onPress={() => { setStep(0); dotRefs.current.forEach(ref => animate(ref, { scale: 0, opacity: 0 }, { duration: 0, instant: true })) }}>
            Reset
          </button>
        </div>
      </LynxDemoCard>
    </>
  )
}

// ─── STAGGER SECTION ──────────────────────────────────────────────────────────

const LynxStaggerSection = () => {
  const [show, setShow] = useState(false)
  const itemsRef = useRef([])
  const LETTERS = 'ABCDEF'.split('')

  const runStagger = () => {
    if (show) {
      // Reset
      itemsRef.current.forEach(ref => animate(ref, { scale: 0, opacity: 0 }, { duration: 200, easing: 'ease-in' }))
      setTimeout(() => setShow(false), 300)
    } else {
      // Show with stagger
      setShow(true)
      itemsRef.current.forEach((ref, i) => {
        animate(ref, { scale: 1, opacity: 1 }, { duration: 400, delay: i * 100, easing: 'spring', bounce: 0.3 })
      })
    }
  }

  return (
    <>
      <LynxSectionHeader icon="⋮" title="Stagger" subtitle="Staggered reveal with spring" color="#8b5cf6" />
      <LynxDemoCard title="Stagger Items" desc="Elements appear one by one" full>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold mb-3" onPress={runStagger}>
          {show ? 'Hide' : 'Stagger In'}
        </button>
        {show && (
          <div className="flex flex-row flex-wrap gap-2 justify-center">
            {LETTERS.map((w, i) => (
              <div key={w} ref={el => itemsRef.current[i] = el}
                   className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold scale-0 opacity-0"
                   style={{ transform: 'scale(0)', opacity: 0 }}>
                {w}
              </div>
            ))}
          </div>
        )}
      </LynxDemoCard>
    </>
  )
}

// ─── PRESS SECTION ────────────────────────────────────────────────────────────

const LynxPressSection = () => {
  const [pressed, setPressed] = useState(false)
  const [scale, setScale] = useState(1)

  const handlePress = () => {
    setPressed(true)
    animate(null, { scale: 1.2 }, { duration: 150, easing: 'spring', onComplete: () => {
      animate(null, { scale: 1 }, { duration: 150, easing: 'spring' })
      setPressed(false)
    } })
  }

  return (
    <>
      <LynxSectionHeader icon="⊙" title="Press Feedback" subtitle="Spring on tap" color="#ec4899" />
      <LynxDemoCard title="Press Me" desc="Spring scale on press" full>
        <button onPress={handlePress} className="w-24 h-24 rounded-2xl flex items-center justify-center bg-pink-500">
          <span className="text-3xl">👆</span>
        </button>
      </LynxDemoCard>
    </>
  )
}

// ─── LOOP SECTION ─────────────────────────────────────────────────────────────

const LynxLoopSection = () => {
  const [spinning, setSpinning] = useState(false)
  const spinRef = useRef()

  const toggleSpin = () => {
    if (spinning) {
      animate(spinRef.current, { rotate: 0 }, { duration: 0, instant: true })
      setSpinning(false)
    } else {
      setSpinning(true)
      animate(spinRef.current, { rotate: 360 }, { duration: 2000, repeat: Infinity, easing: 'linear' })
    }
  }

  return (
    <>
      <LynxSectionHeader icon="∞" title="Loop" subtitle="Infinite rotate" color="#f59e0b" />
      <LynxDemoCard title="Spin" desc="Infinite rotation" full>
        <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold mb-3" onPress={toggleSpin}>
          {spinning ? 'Stop' : 'Spin'}
        </button>
        <div ref={spinRef} className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 flex items-center justify-center">
          <span className="text-xs text-amber-500 font-bold">∞</span>
        </div>
      </LynxDemoCard>
    </>
  )
}

// ─── TRANSFORMS SECTION ──────────────────────────────────────────────────────

const LynxTransformsSection = () => {
  const [transformed, setTransformed] = useState(false)
  const boxRef = useRef()

  const toggleTransform = () => {
    if (transformed) {
      animate(boxRef.current, { rotate: 0, scale: 1, y: 0 }, { duration: 300, easing: 'ease-in-out' })
      setTransformed(false)
    } else {
      animate(boxRef.current, { rotate: 45, scale: 1.2, y: -8 }, { duration: 400, easing: 'spring' })
      setTransformed(true)
    }
  }

  return (
    <>
      <LynxSectionHeader icon="⟳" title="Transforms" subtitle="Translate, rotate, scale" color="#10b981" />
      <LynxDemoCard title="Transform" desc="Tap to transform" full>
        <button onPress={toggleTransform}>
          <div ref={boxRef} className="w-16 h-16 rounded-xl bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold">⟳</span>
          </div>
        </button>
      </LynxDemoCard>
    </>
  )
}

// ─── SPRING SECTION ──────────────────────────────────────────────────────────

const LynxSpringSection = () => {
  const [big, setBig] = useState(false)
  const ballRef = useRef()

  const toggleSpring = () => {
    if (big) {
      animate(ballRef.current, { width: 48, height: 48 }, { duration: 500, easing: 'spring', damping: 15, stiffness: 200 })
      setBig(false)
    } else {
      animate(ballRef.current, { width: 96, height: 96 }, { duration: 500, easing: 'spring', damping: 10, stiffness: 150 })
      setBig(true)
    }
  }

  return (
    <>
      <LynxSectionHeader icon="⌇" title="Spring" subtitle="Spring physics" color="#3b82f6" />
      <LynxDemoCard title="Spring" desc="Tap to bounce" full>
        <button onPress={toggleSpring}>
          <div ref={ballRef} className="rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs w-12 h-12">
            {big ? '⌇' : ''}
          </div>
        </button>
      </LynxDemoCard>
    </>
  )
}

// ─── EASING SECTION ──────────────────────────────────────────────────────────

const LynxEasingSection = () => {
  const barRefs = useRef([])
  const easings = ['linear', 'ease-in', 'ease-out', 'ease-in-out']

  const runEasingDemo = () => {
    barRefs.current.forEach((ref, i) => {
      animate(ref, { width: '100%' }, {
        duration: 800,
        easing: easings[i] === 'linear' ? 'linear' :
                easings[i] === 'ease-in' ? [0.42, 0, 1, 1] :
                easings[i] === 'ease-out' ? [0, 0, 0.58, 1] :
                [0.42, 0, 0.58, 1],
        onComplete: () => {
          setTimeout(() => animate(ref, { width: '50%' }, { duration: 300, easing: 'ease-in' }), 500)
        }
      })
    })
  }

  return (
    <>
      <LynxSectionHeader icon="⌗" title="Easing" subtitle="Transition curves" color="#ef4444" />
      <div className="flex flex-row flex-wrap px-3">
        {easings.map((e, i) => (
          <LynxDemoCard key={e} title={e} desc="Tap to run">
            <div className="w-24 h-3 rounded-full bg-red-200 overflow-hidden">
              <div ref={el => barRefs.current[i] = el} className="h-full bg-red-500 w-1/2" />
            </div>
            <button className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded" onPress={runEasingDemo}>Run</button>
          </LynxDemoCard>
        ))}
      </div>
    </>
  )
}

/* @arkzen:native:components:lynx:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// LYNX PAGES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:page:lynx:index */

import React, { useState } from '@lynx-js/react'

const IndexLynxPage = () => {
  const [activeSection, setActiveSection] = useState('entrance')

  const renderSection = () => {
    switch (activeSection) {
      case 'entrance':   return <LynxEntranceSection />
      case 'timeline':   return <LynxTimelineSection />
      case 'stagger':    return <LynxStaggerSection />
      case 'press':      return <LynxPressSection />
      case 'loop':       return <LynxLoopSection />
      case 'transforms': return <LynxTransformsSection />
      case 'spring':     return <LynxSpringSection />
      case 'easing':     return <LynxEasingSection />
      default:           return <LynxEntranceSection />
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-neutral-900 text-white">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-lg font-bold text-purple-400">🎬 Animation Lab</div>
        <div className="text-xs text-white/35">Lynx · @lynx-js/motion</div>
      </div>

      <div className="flex flex-row overflow-x-auto border-b border-white/10 px-3 py-2 gap-1">
        {LYNX_NAV_SECTIONS.map(({ id, label, icon, color }) => {
          const active = activeSection === id
          return (
            <button
              key={id}
              className={`flex flex-row items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                active ? 'bg-neutral-800 text-white' : 'bg-white/10 text-white/60'
              }`}
              onPress={() => setActiveSection(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderSection()}
        <div className="h-8" />
      </div>
    </div>
  )
}

/* @arkzen:native:page:lynx:index:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE ERROR PAGES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:error:404 */
/* @arkzen:import:expo */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:expo:end */

const NotFoundExpo = () => (
  <View className="flex-1 items-center justify-center bg-neutral-950">
    <Text className="text-6xl mb-4">404</Text>
    <Text className="text-white text-xl font-bold">Page Not Found</Text>
    <Text className="text-white/40 text-sm mt-2">The page you're looking for doesn't exist.</Text>
  </View>
)
/* @arkzen:native:error:404:end */

/* @arkzen:native:error:404 */
/* @arkzen:import:rn */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:rn:end */

const NotFoundRN = () => (
  <View className="flex-1 items-center justify-center bg-neutral-950">
    <Text className="text-6xl mb-4">404</Text>
    <Text className="text-white text-xl font-bold">Page Not Found</Text>
    <Text className="text-white/40 text-sm mt-2">The page you're looking for doesn't exist.</Text>
  </View>
)
/* @arkzen:native:error:404:end */

/* @arkzen:native:error:404:lynx */
import React from '@lynx-js/react'

const NotFoundLynx = () => (
  <div className="flex-1 min-h-screen bg-neutral-950 text-white flex items-center justify-center flex-col">
    <div className="text-6xl mb-4">404</div>
    <div className="text-xl font-bold">Page Not Found</div>
    <div className="text-white/40 text-sm mt-2">The page you're looking for doesn't exist.</div>
  </div>
)
/* @arkzen:native:error:404:lynx:end */

/* @arkzen:native:error:500 */
/* @arkzen:import:expo */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:expo:end */

const ServerErrorExpo = () => (
  <View className="flex-1 items-center justify-center bg-neutral-950">
    <Text className="text-6xl mb-4">500</Text>
    <Text className="text-white text-xl font-bold">Server Error</Text>
    <Text className="text-white/40 text-sm mt-2">Something went wrong on our end. Please try again later.</Text>
  </View>
)
/* @arkzen:native:error:500:end */

/* @arkzen:native:error:500 */
/* @arkzen:import:rn */
import React from 'react'
import { View, Text } from 'react-native'
/* @arkzen:import:rn:end */

const ServerErrorRN = () => (
  <View className="flex-1 items-center justify-center bg-neutral-950">
    <Text className="text-6xl mb-4">500</Text>
    <Text className="text-white text-xl font-bold">Server Error</Text>
    <Text className="text-white/40 text-sm mt-2">Something went wrong on our end. Please try again later.</Text>
  </View>
)
/* @arkzen:native:error:500:end */

/* @arkzen:native:error:500:lynx */
import React from '@lynx-js/react'

const ServerErrorLynx = () => (
  <div className="flex-1 min-h-screen bg-neutral-950 text-white flex items-center justify-center flex-col">
    <div className="text-6xl mb-4">500</div>
    <div className="text-xl font-bold">Server Error</div>
    <div className="text-white/40 text-sm mt-2">Something went wrong on our end. Please try again later.</div>
  </div>
)
/* @arkzen:native:error:500:lynx:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE SCRIPTS
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:script:expo */
// Expo-specific scripts
console.log('🎬 Animation Lab running on Expo')
/* @arkzen:native:script:expo:end */

/* @arkzen:native:script:rn */
// Bare RN-specific scripts
console.log('🎬 Animation Lab running on React Native Bare')
/* @arkzen:native:script:rn:end */

/* @arkzen:native:script:lynx */
// Lynx-specific scripts — using @lynx-js/motion
console.log('🎬 Animation Lab running on Lynx with @lynx-js/motion')
/* @arkzen:native:script:lynx:end */