'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — CommissionsSection
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:44.269Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BURST_IMGS, COMMISSION_TIERS } from './constants'
import type { BurstItem } from './types'

// ─── COMMISSIONS (FIXED CARD CLIPPING) ───────────────────────

export const CommissionsSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const items = COMMISSION_TIERS

  return (
    <section id="commissions" className="commissions">
      <div className="section-head">
        <h2 className="section-title">Let's create <em>together</em></h2>
        <p className="section-sub">all slots ordered by popularity</p>
      </div>

      <div className="commissions-wrapper">
        <div className="ocean-glow-bg" />

        <div className="commissions-scroll-container">
          {items.map((item, idx) => {
            const isHovered = hoveredIndex === idx
            return (
              <div
                key={item.id}
                className={`commission-card ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="commission-img-wrap">
                  <img src={BURST_IMGS[idx % BURST_IMGS.length]} alt={item.title} />
                </div>
                <div className="commission-meta">
                  <span className="commission-num">/ {String(idx + 1).padStart(2, '0')}</span>
                  <span className="commission-label">{item.title}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="commission-text-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={hoveredIndex !== null ? hoveredIndex : 0}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="commission-active-text"
            >
              <p className="commission-active-title">{items[hoveredIndex !== null ? hoveredIndex : 0].title}</p>
              <p className="commission-active-desc muted">{items[hoveredIndex !== null ? hoveredIndex : 0].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// ─── ABOUT ────────────────────────────────────────────────────
