// ============================================================
// ARKZEN GENERATED COMPONENT — IntroStrip [React+Vite]
// Source: @arkzen:components (lain)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:06:19.975Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ref } from './utils'

// ─── INTRO STRIP ──────────────────────────────────────────────

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
    <section className="intro-strip" ref={ref}>
      <div className="intro-strip-inner">
        <div className="intro-strip-item intro-label">
          <span className="vertical-text mono">LAIN — DIGITAL ARTIST</span>
        </div>
        <div className="intro-strip-item intro-statement">
          <p>
            I create worlds one frame at a time — anime illustrations that breathe,
            characters that feel like old friends, and animations that carry a quiet heartbeat.
          </p>
          <p className="intro-date mono">est. 2021 · open for work</p>
        </div>
        <div className="intro-strip-item intro-stats">
          {[['100+', 'Commissions completed'], ['4', 'Art styles offered'], ['∞', 'Characters imagined']].map(([n, l]) => (
            <div key={n} className="intro-stat"><strong>{n}</strong><span className="mono uppercase muted">{l}</span></div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── WORK CHAPTER ─────────────────────────────────────────────
