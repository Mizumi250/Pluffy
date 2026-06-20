'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — EpGalleryModal
// Source: @arkzen:components (ethan-pool)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:04.510Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { next, prev } from './utils'

// ─── GALLERY MODAL ────────────────────────────────────────────────────────────

export const EpGalleryModal = ({
  open,
  onClose,
  images,
  index,
  setIndex,
}: {
  open: boolean
  onClose: () => void
  images: string[]
  index: number
  setIndex: (i: number) => void
}) => {
  if (!open) return null

  const prev = () => setIndex((index - 1 + images.length) % images.length)
  const next = () => setIndex((index + 1) % images.length)

  return (
    <div className="ep-modal ep-modal-gallery open">
      <button className="ep-modal-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="ep-modal-dialog">
        <div className="ep-gallery-arrow ep-gallery-prev" onClick={prev}>‹</div>
        <div className="ep-gallery-main">
          <img src={images[index]} alt={`Ethan Pool gallery ${index + 1}`} />
        </div>
        <div className="ep-gallery-arrow ep-gallery-next" onClick={next}>›</div>
      </div>
      <div className="ep-gallery-thumbs">
        {images.map((src, i) => (
          <button
            key={src + i}
            className={`ep-gallery-thumb ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          >
            <img src={src} alt={`Thumbnail ${i + 1}`} />
          </button>
        ))}
      </div>
      <div className="ep-modal-backdrop" onClick={onClose} />
    </div>
  )
}
