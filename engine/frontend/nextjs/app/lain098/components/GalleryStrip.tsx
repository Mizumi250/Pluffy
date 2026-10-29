'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — GalleryStrip
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:09:01.150Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BurstItem } from './types'

// ─── GALLERY STRIP ────────────────────────────────────────────

export const GalleryStrip = () => {
  const ref = useRef<HTMLDivElement>(null)
  const galleryImgs = [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
    'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&q=80',
    'https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=400&q=80',
    'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=400&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
  ]

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    const cards = ref.current.querySelectorAll('.gallery-card')
    gsap.fromTo(cards,
      { opacity: 0, y: 40, scale: 0.95, filter: 'blur(4px)' },
      {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        stagger: 0.07, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%' },
      }
    )
    gsap.to(ref.current.querySelector('.gallery-row-top') as HTMLElement, {
      xPercent: -6, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
    })
    gsap.to(ref.current.querySelector('.gallery-row-bot') as HTMLElement, {
      xPercent: 6, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
    })
  }, [])

  return (
    <section className="gallery" ref={ref}>
      <div className="section-head">
        <h2 className="section-title">Recent <em>works</em></h2>
        <p className="section-sub">Selected pieces</p>
      </div>
      <div className="gallery-row gallery-row-top">
        {galleryImgs.slice(0, 4).map((src, i) => (
          <div key={i} className="gallery-card"><img src={src} alt={`artwork ${i + 1}`} /><div className="gallery-card-overlay"><span>View</span></div></div>
        ))}
      </div>
      <div className="gallery-row gallery-row-bot">
        {galleryImgs.slice(4).map((src, i) => (
          <div key={i} className="gallery-card"><img src={src} alt={`artwork ${i + 5}`} /><div className="gallery-card-overlay"><span>View</span></div></div>
        ))}
      </div>
    </section>
  )
}

// ─── DISCOGRAPHY (COVEO-STYLE CLICK BURST) ───────────────────
