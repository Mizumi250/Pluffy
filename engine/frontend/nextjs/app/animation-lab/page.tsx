'use client'
// ============================================================
// ARKZEN GENERATED PAGE — animation-lab/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T08:36:22.248Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { animationLabAnimations, pageVariants } from '@/arkzen/generated/animation-lab.animations'

// Utilities, types, and helper functions from @arkzen:components
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
      // from (entrance from invisible)
      gsap.from('.gsap-from-demo', {
        opacity: 0, y: 60, duration: 0.8, ease: 'power3.out', delay: 0.1
      })
      // fromTo (full control)
      gsap.fromTo('.gsap-fromto-demo',
        { opacity: 0, scaleX: 0, transformOrigin: 'left center' },
        { opacity: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
      )
      // to (animate existing state)
      gsap.to('.gsap-to-demo', {
        x: 80, rotation: 360, duration: 0.9, ease: 'back.out(1.7)', delay: 0.5
      })
      // blur reveal
      gsap.fromTo('.gsap-blur-demo',
        { opacity: 0, filter: 'blur(20px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out', delay: 0.6 }
      )
      // clip reveal
      gsap.fromTo('.gsap-clip-demo',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power4.inOut', delay: 0.7 }
      )
      // scale + fade
      gsap.from('.gsap-scale-demo', {
        opacity: 0, scale: 0.3, duration: 0.7, ease: 'back.out(2)', delay: 0.9
      })
      // rotate entrance
      gsap.fromTo('.gsap-rotate-demo',
        { opacity: 0, rotation: -90, transformOrigin: 'bottom left' },
        { opacity: 1, rotation: 0, duration: 0.8, ease: 'power3.out', delay: 1.0 }
      )
      // slide from right
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
      // Fade + slide on scroll
      gsap.fromTo('.scroll-fade-item',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: '.scroll-fade-group', start: 'top 85%', toggleActions: 'play none none reset' }
        }
      )
      // Scrub (parallax)
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
      // Pin + reveal
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
      // Scale on scroll
      gsap.fromTo('.scroll-scale-card',
        { scale: 0.6, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)', stagger: 0.12,
          scrollTrigger: { trigger: '.scroll-scale-group', start: 'top 80%', toggleActions: 'play none none reset' }
        }
      )
      // Horizontal scrub
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

      {/* Fade stagger group */}
      <DemoCard title="Scroll Stagger Reveal" description="Elements fade in staggered as they enter viewport">
        <div className="scroll-fade-group" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'].map(w => (
            <div key={w} className="scroll-fade-item anim-pill" style={{ background: '#10b981' }}>{w}</div>
          ))}
        </div>
      </DemoCard>

      {/* Parallax */}
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

      {/* Letter spacing reveal */}
      <DemoCard title="Letter Spacing Reveal" description="Text compresses into view on scroll">
        <div className="scroll-pin-wrap" style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
          <h3 className="scroll-pin-text" style={{ fontSize: 28, fontWeight: 900, color: '#10b981', letterSpacing: '0.5em' }}>
            SCROLL REVEAL
          </h3>
        </div>
      </DemoCard>

      {/* Scale group */}
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

      {/* Horizontal scrub */}
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
      // Linear stagger
      gsap.from('.stagger-linear .stg-item', { opacity: 0, y: 30, duration: 0.5, stagger: 0.08, ease: 'power3.out' })
      // From center stagger
      gsap.from('.stagger-center .stg-item', { opacity: 0, scale: 0, duration: 0.5, stagger: { each: 0.07, from: 'center' }, ease: 'back.out(2)', delay: 0.3 })
      // From end stagger
      gsap.from('.stagger-end .stg-item', { opacity: 0, x: 40, duration: 0.5, stagger: { each: 0.06, from: 'end' }, ease: 'power2.out', delay: 0.6 })
      // Grid stagger
      gsap.from('.stagger-grid .stg-item', {
        opacity: 0, scale: 0.3, rotation: 45, duration: 0.4,
        stagger: { amount: 0.8, grid: [3, 4], from: 'center' },
        ease: 'back.out(2)', delay: 0.9
      })
      // Yoyo repeat stagger
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
export const FramerVariantsSection = () => {
  const [visible, setVisible] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -16, scale: 0.9 }
  }

  const fadeSlide = {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
  }

  const scaleBounce = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
    exit: { scale: 0, opacity: 0 }
  }

  const rotateIn = {
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 200 } },
    exit: { rotate: 180, opacity: 0 }
  }

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
  const [pos, setPos] = useState({ x: 0, y: 0 })
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
      {/* Progress bar */}
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

// Page component code (from @arkzen:page:index)
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
      {/* Sidebar */}
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

      {/* Content */}
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

// Wrapper for animation + layout
const ArkzenPage_AnimationLab_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = animationLabAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_AnimationLab_Index
