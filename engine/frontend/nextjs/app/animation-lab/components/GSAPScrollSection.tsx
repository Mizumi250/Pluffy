'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — GSAPScrollSection
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:06.983Z
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
