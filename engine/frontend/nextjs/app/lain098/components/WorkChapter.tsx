'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — WorkChapter
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:44.257Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WORKS } from './constants'
import type { BurstItem } from './types'

// ─── WORK CHAPTER ─────────────────────────────────────────────

export const WorkChapter = ({ work, index }: { work: typeof WORKS[0], index: number }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.wc-text > *'),
      { opacity: 0, y: 40, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 72%' },
      }
    )
    gsap.fromTo(ref.current.querySelector('.wc-img') as HTMLElement,
      { scale: 1.08 },
      {
        scale: 1.0, ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    )
  }, [])

  const isEven = index % 2 === 0
  return (
    <div ref={ref} className={`work-chapter ${isEven ? 'wc-left' : 'wc-right'}`}>
      <div className="wc-img-wrap">
        <div className="wc-img-inner"><img className="wc-img" src={work.img} alt={work.label} /></div>
        <div className="wc-num">{work.num}</div>
      </div>
      <div className="wc-text">
        <span className="wc-tagline">{work.tagline}</span>
        <h2 className="wc-headline">{work.headline.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
        <div className="wc-accent-line" />
      </div>
    </div>
  )
}

// ─── WORKS SECTION ────────────────────────────────────────────
