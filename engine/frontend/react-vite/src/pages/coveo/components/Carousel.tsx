// ============================================================
// ARKZEN GENERATED COMPONENT — Carousel [React+Vite]
// Source: @arkzen:components (coveo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T14:31:55.696Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RELEASES } from './constants'
import { interval, items } from './utils'
import { CarouselItem } from './CarouselItem'

export const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % RELEASES.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  // Duplicate for seamless loop
  const items = [...RELEASES, ...RELEASES]

  return (
    <div className="carousel" style={{ '--itemCount': items.length } as React.CSSProperties}>
      {items.map((release, idx) => (
        <CarouselItem
          key={`${release.id}-${idx}`}
          release={release}
          index={idx}
          total={items.length}
          onSelect={() => setActiveIndex(idx % RELEASES.length)}
        />
      ))}
      {/* Active indicator dot */}
      <div className="carousel-indicator">
        {RELEASES.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── HERO SECTION ─────────────────────────────────────────────
