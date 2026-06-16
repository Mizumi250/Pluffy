// ============================================================
// ARKZEN GENERATED COMPONENT — EpPromoModal [React+Vite]
// Source: @arkzen:components (ethan-pool)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T12:12:33.785Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { t } from './utils'

// ─── PROMO MODAL ──────────────────────────────────────────────────────────────

export const EpPromoModal = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 1400)
    return () => clearTimeout(t)
  }, [])

  if (!open) return null

  return (
    <div className={`ep-modal ep-modal-promo ${open ? 'open' : ''}`}>
      <div className="ep-modal-dialog">
        <div className="ep-modal-content">
          <button className="ep-modal-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          <div className="ep-promo-grid">
            <div className="ep-promo-img">
              <img
                src="https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=900&auto=format&fit=crop"
                alt="Ethan Pool morning offer"
              />
            </div>
            <div className="ep-promo-text">
              <h3 className="ep-subtitle">Calm waters, golden light</h3>
              <h2 className="ep-title">Summer at Ethan Pool: 20% off with code ETHAN26</h2>
              <p className="ep-featured"><strong>For stays through August 31st</strong></p>
              <p className="ep-text">
                Summer transforms the lagoon, stretches the evenings by the water and fills every
                corner of the resort with life. Enjoy <strong>20% off</strong> when you book your stay.
              </p>
              <a href="#rooms" className="ep-btn ep-btn-stroke ep-btn-green" onClick={() => setOpen(false)}>
                <span className="ep-btn-label">Use code ETHAN26 <i className="ep-arrow">→</i></span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="ep-modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  )
}

// ─── GALLERY MODAL ────────────────────────────────────────────────────────────
