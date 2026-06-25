// ============================================================
// ARKZEN GENERATED COMPONENT — ArtCarousel [React+Vite]
// Source: @arkzen:components (lain)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:06:19.972Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CAROUSEL_ITEMS, FULL_CAROUSEL } from './constants'
import { carouselRef, interval, ref, total } from './utils'

// ─── ART CAROUSEL (with expand animation) ──────────────────────

export const ArtCarousel = ({ onPreview }: { onPreview: (index: number) => void }) => {
  const [rotation, setRotation] = useState(0)
  const total = FULL_CAROUSEL.length
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.25)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="carousel-wrapper">
      <div className="carousel-center-avatar">
        <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=80" alt="Lain" />
      </div>
      <div className="carousel" style={{ '--itemCount': total } as React.CSSProperties} ref={carouselRef}>
        <div className="carousel-track" style={{ transform: `rotate(${rotation}deg)` }}>
          {FULL_CAROUSEL.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              className="carousel-item"
              style={{ '--item': idx } as React.CSSProperties}
              onClick={() => onPreview(idx % CAROUSEL_ITEMS.length)}
            >
              <img src={item.img} alt={item.label} />
              <span className="carousel-item-label mono">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── FULLSCREEN BOTTOM SLIDER ─────────────────────────────────
