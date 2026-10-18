'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ArtCarousel
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:44.244Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CAROUSEL_ITEMS, FULL_CAROUSEL } from './constants'
import type { BurstItem } from './types'

// ─── ORBIT CAROUSEL ──────────────────────────────────────────

export const ArtCarousel = ({
  onPreview,
  orbitVisible,
}: {
  onPreview: (index: number) => void
  orbitVisible: boolean
}) => {
  const [rotation, setRotation] = useState(0)
  const total = FULL_CAROUSEL.length

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.25)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`carousel ${orbitVisible ? 'orbit-visible' : 'orbit-hidden'}`} style={{ '--itemCount': total } as React.CSSProperties}>
      <div className="carousel-track" style={{ transform: `rotate(${rotation}deg)` }}>
        {FULL_CAROUSEL.map((item, idx) => (
          <button
            key={`${item.id}-${idx}`}
            className="carousel-item"
            style={{ '--item': idx } as React.CSSProperties}
            onClick={() => onPreview(idx % CAROUSEL_ITEMS.length)}
          >
            <img src={item.img} alt={item.label} />
            <span className="carousel-item-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="carousel-center-avatar">
        <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=80" alt="Lain" />
      </div>
    </div>
  )
}

// ─── FULLSCREEN SLIDER ────────────────────────────────────────
