'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — WorksSection
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:56.100Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WORKS } from './constants'
import type { BurstItem } from './types'
import { WorkChapter } from './WorkChapter'

// ─── WORKS SECTION ────────────────────────────────────────────

export const WorksSection = () => {
  const headRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!headRef.current) return
    gsap.fromTo(headRef.current.querySelectorAll('.works-head-el'),
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.12, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 80%' },
      }
    )
  }, [])
  return (
    <section id="works" className="works">
      <div ref={headRef} className="section-head">
        <h2 className="works-head-el section-title">What I <em>create</em></h2>
        <p className="works-head-el section-sub">Four pillars of my practice</p>
      </div>
      <div className="works-chapters">{WORKS.map((w, i) => <WorkChapter key={w.id} work={w} index={i} />)}</div>
    </section>
  )
}

// ─── GALLERY STRIP ────────────────────────────────────────────
