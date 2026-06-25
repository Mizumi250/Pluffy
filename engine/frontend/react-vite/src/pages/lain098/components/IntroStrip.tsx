// ============================================================
// ARKZEN GENERATED COMPONENT — IntroStrip [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.494Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ref } from './utils'

// ─── INTRO STRIP (Astrophile-inspired: rotated vertical text layout) ──────────

export const IntroStrip = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.intro-strip-item'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        stagger: 0.15, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section className="lain-intro-strip" ref={ref}>
      <div className="lain-intro-strip-inner">
        <div className="intro-strip-item lain-intro-label">
          <span className="lain-vertical-text">LAIN098_ — DIGITAL ARTIST</span>
        </div>
        <div className="intro-strip-item lain-intro-statement">
          <p>
            I create worlds one frame at a time — anime illustrations that breathe,
            characters that feel like old friends, and animations that carry a quiet heartbeat.
          </p>
          <p className="lain-intro-date">est. 2021 · open for work</p>
        </div>
        <div className="intro-strip-item lain-intro-stat-col">
          {[['100+', 'Commissions completed'], ['4', 'Art styles offered'], ['∞', 'Characters imagined']].map(([n, l]) => (
            <div key={n} className="lain-intro-stat">
              <strong>{n}</strong>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── WORK CHAPTERS (Tale-style sticky covers, inspired by Image 01 & 04) ──────
