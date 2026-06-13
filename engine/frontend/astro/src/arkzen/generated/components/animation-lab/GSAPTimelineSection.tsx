// ============================================================
// ARKZEN GENERATED COMPONENT — GSAPTimelineSection
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T06:25:08.648Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, Box, ChevronRight, Cpu, Eye, Layers, Maximize2, MousePointer2, Move, Pause, Play, RefreshCw, RotateCcw, Sparkles, Type, Wind, Zap } from 'lucide-react'
import { create } from 'zustand'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

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
