'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ZenSection
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:09:01.164Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BurstItem } from './types'

// ─── ZEN TYPOGRAPHY SECTION ──────────────────────────────────

export const ZenSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.zen-el'),
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section className="zen-section" ref={ref}>
      <div className="zen-inner">
        <div className="zen-content zen-el">
          <div className="zen-char-box">
            <span className="zen-char">樸</span>
            <span className="zen-char">素</span>
            <div className="zen-stamp" />
          </div>
          <div className="zen-vert-text">
            愛護天地 萬物及眾生<br />
            生活回歸 自然形態
          </div>
          <div className="zen-scatter-text">少欲 知足</div>
          <div className="zen-scatter-right">清淨調和<br />如規如律</div>
        </div>
        <div className="zen-collage zen-el">
          <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80" alt="sky" />
          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" alt="clouds" />
          <img src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80" alt="tree" />
        </div>
      </div>
    </section>
  )
}

// ─── BLUE GRID SCRAPBOOK SECTION ────────────────────────────
