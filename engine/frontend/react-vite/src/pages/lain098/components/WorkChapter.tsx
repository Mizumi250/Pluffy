// ============================================================
// ARKZEN GENERATED COMPONENT — WorkChapter [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.495Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WORKS } from './constants'
import { isEven, ref } from './utils'

// ─── WORK CHAPTERS (Tale-style sticky covers, inspired by Image 01 & 04) ──────

export const WorkChapter = ({ work, index }: { work: typeof WORKS[0], index: number }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return

    gsap.fromTo(ref.current.querySelector('.wc-img') as HTMLElement,
      { scale: 1.08 },
      {
        scale: 1.0, ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom', end: 'bottom top',
          scrub: true,
        },
      }
    )

    gsap.fromTo(ref.current.querySelectorAll('.wc-text > *'),
      { opacity: 0, y: 48 },
      {
        opacity: 1, y: 0,
        stagger: 0.1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 72%' },
      }
    )
  }, [])

  const isEven = index % 2 === 0

  return (
    <div ref={ref} className={`lain-work-chapter ${isEven ? 'wc-left' : 'wc-right'}`} id={`work-${work.id}`}>
      <div className="wc-img-wrap">
        <div className="wc-img-inner">
          <img className="wc-img" src={work.img} alt={work.label} />
        </div>
        <div className="wc-num">{work.num}</div>
      </div>
      <div className="wc-text">
        <span className="wc-tagline">{work.tagline}</span>
        <h2 className="wc-headline">
          {work.headline.split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h2>
        <p className="wc-desc">{work.desc}</p>
        <div className="wc-accent-line" style={{ background: work.accent }} />
      </div>
    </div>
  )
}

// ─── WORKS SECTION ────────────────────────────────────────────────────────────
