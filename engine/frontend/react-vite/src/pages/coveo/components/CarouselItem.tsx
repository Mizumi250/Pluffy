// ============================================================
// ARKZEN GENERATED COMPONENT — CarouselItem [React+Vite]
// Source: @arkzen:components (coveo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T14:31:55.695Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RELEASES } from './constants'
import { angle } from './utils'

// ─── CAROUSEL CIRCLE ──────────────────────────────────────────

export const CarouselItem = ({
  release,
  index,
  total,
  onSelect,
}: {
  release: typeof RELEASES[0]
  index: number
  total: number
  onSelect: () => void
}) => {
  const angle = (index / total) * 360
  return (
    <button
      className="carousel-item"
      style={
        {
          '--angle': `${angle}deg`,
          '--item': index,
          '--total': total,
        } as React.CSSProperties
      }
      onClick={onSelect}
    >
      <img src={release.artwork} alt={release.title} loading="lazy" />
      <span className="carousel-item-label mono">{release.title}</span>
    </button>
  )
}
