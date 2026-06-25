// ============================================================
// ARKZEN GENERATED COMPONENT — WorksSection [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.495Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WORKS } from './constants'
import { headRef, ref } from './utils'
import { WorkChapter } from './WorkChapter'

// ─── WORKS SECTION ────────────────────────────────────────────────────────────

export const WorksSection = () => {
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!headRef.current) return
    gsap.fromTo(headRef.current.querySelectorAll('.works-head-el'),
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0,
        stagger: 0.12, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section id="works" className="lain-works">
      <div ref={headRef} className="lain-section-head">
        <span className="works-head-el lain-section-eyebrow">✦ Portfolio</span>
        <h2 className="works-head-el lain-section-title">
          What I <em>create</em>
        </h2>
        <p className="works-head-el lain-section-sub">
          Four pillars of my practice — each one a different way of bringing characters to life.
        </p>
      </div>
      <div className="lain-works-chapters">
        {WORKS.map((w, i) => <WorkChapter key={w.id} work={w} index={i} />)}
      </div>
    </section>
  )
}

// ─── MARQUEE ──────────────────────────────────────────────────────────────────
