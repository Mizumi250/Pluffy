// ============================================================
// ARKZEN GENERATED COMPONENT — GalleryStrip [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.496Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cards, galleryImgs, ref } from './utils'

// ─── GALLERY STRIP (inspired by Image 06/10: photo-grid + cards) ──────────────

export const GalleryStrip = () => {
  const ref = useRef<HTMLDivElement>(null)

  // Online placeholder art images for now
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

    const cards = ref.current.querySelectorAll('.lain-gallery-card')
    gsap.fromTo(cards,
      { opacity: 0, y: 50, scale: 0.92 },
      {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.08, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%' },
      }
    )

    // horizontal parallax for alternate rows
    gsap.to(ref.current.querySelector('.lain-gallery-row-top') as HTMLElement, {
      xPercent: -8, ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom', end: 'bottom top',
        scrub: 1,
      },
    })
    gsap.to(ref.current.querySelector('.lain-gallery-row-bot') as HTMLElement, {
      xPercent: 8, ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom', end: 'bottom top',
        scrub: 1,
      },
    })
  }, [])

  return (
    <section className="lain-gallery" ref={ref}>
      <div className="lain-section-head">
        <span className="lain-section-eyebrow">✦ Gallery</span>
        <h2 className="lain-section-title">Recent <em>works</em></h2>
      </div>
      <div className="lain-gallery-row lain-gallery-row-top">
        {galleryImgs.slice(0, 4).map((src, i) => (
          <motion.div
            key={i}
            className="lain-gallery-card"
            whileHover={{ scale: 1.04, y: -6, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <img src={src} alt={`artwork ${i+1}`} />
            <div className="lain-gallery-card-overlay">
              <span>✦ View</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="lain-gallery-row lain-gallery-row-bot">
        {galleryImgs.slice(4).map((src, i) => (
          <motion.div
            key={i}
            className="lain-gallery-card"
            whileHover={{ scale: 1.04, y: -6, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <img src={src} alt={`artwork ${i+5}`} />
            <div className="lain-gallery-card-overlay">
              <span>✦ View</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── COMMISSIONS SECTION (inspired by Image 07: card layout with badges) ──────
