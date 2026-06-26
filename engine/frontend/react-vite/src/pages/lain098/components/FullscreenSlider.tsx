// ============================================================
// ARKZEN GENERATED COMPONENT — FullscreenSlider [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-26T07:08:59.303Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CAROUSEL_ITEMS } from './constants'
import { currentItem, goTo, handleKeyDown, items, x, y } from './utils'

// ─── FULLSCREEN SLIDER ────────────────────────────────────────

export const FullscreenSlider = ({
  items,
  initialIndex,
  onClose,
}: {
  items: typeof CAROUSEL_ITEMS
  initialIndex: number
  onClose: () => void
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const goTo = (index: number) => {
    if (index < 0) index = items.length - 1
    if (index >= items.length) index = 0
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(currentIndex + 1)
    if (e.key === 'ArrowLeft') goTo(currentIndex - 1)
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const currentItem = items[currentIndex]

  return (
    <motion.div
      className="fullscreen-slider"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <button className="slider-close" onClick={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18" /><path d="M6 6L18 18" />
        </svg>
      </button>

      <div className="slider-image-container">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="slider-image-wrapper"
          >
            <img src={currentItem.img} alt={currentItem.label} />
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="slider-title">{currentItem.label}</p>

      <button className="slider-nav slider-prev" onClick={() => goTo(currentIndex - 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18L9 12L15 6" /></svg>
      </button>
      <button className="slider-nav slider-next" onClick={() => goTo(currentIndex + 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18L15 12L9 6" /></svg>
      </button>

      <div className="slider-dots">
        {items.map((_, idx) => (
          <button key={idx} className={`slider-dot ${idx === currentIndex ? 'active' : ''}`} onClick={() => goTo(idx)} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── HERO SECTION (100vh STATIC, NO PINNING) ─────────────────
