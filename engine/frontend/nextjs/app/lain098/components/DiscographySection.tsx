'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — DiscographySection
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:20.155Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BURST_IMGS } from './constants'
import type { BurstItem } from './types'

export const DiscographySection = () => {
  const [bursts, setBursts] = useState<BurstItem[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const burstIdRef = useRef(0)

  const releases = [
    { id: 'hold-out-hope',         title: 'hold out hope',             date: 'September 2025', type: 'single, 4 songs',  duration: '12 minutes 22 seconds', artwork: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=140&q=80' },
    { id: 'wanna-get-to-know-you', title: 'wanna get to know you',     date: 'September 2022', type: 'single, 1 song',   duration: '3 minutes 19 seconds',  artwork: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=140&q=80' },
    { id: 'just-a-memory-stripped', title: 'Just a Memory (Stripped)', date: 'January 2021',   type: 'single, 1 song',   duration: '3 minutes 49 seconds',  artwork: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=140&q=80' },
    { id: 'just-a-memory',         title: 'Just a Memory',             date: 'November 2020',  type: 'single, 1 song',   duration: '3 minutes 43 seconds',  artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=140&q=80' },
    { id: 'still-dreaming',        title: 'Still Dreaming',            date: 'January 2020',   type: 'single, 1 song',   duration: '4 minutes 9 seconds',   artwork: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=140&q=80' },
  ]

  const handleSectionClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = burstIdRef.current++

      // Shuffle imgs for variety
      const shuffled = [...BURST_IMGS].sort(() => Math.random() - 0.5).slice(0, 6)

      setBursts(prev => [...prev, { id, x, y, imgs: shuffled }])

      // Remove burst after animation completes
      setTimeout(() => {
        setBursts(prev => prev.filter(b => b.id !== id))
      }, 900)
    }
  }

  return (
    <section id="discography" className="discography">
      <div className="section-head">
        <h2 className="section-title">Discography <span>The complete works</span></h2>
        <p className="section-sub">all releases — ordered by newest first</p>
      </div>
      <div className="discography-list">
        {releases.map((release, idx) => (
          <div key={release.id} className="discography-item">
            <div className="discography-row">
              <span className="disc-index muted">{String(releases.length - idx).padStart(3, '0')}</span>
              <div className="discography-artwork">
                <img src={release.artwork} alt={release.title} />
              </div>
              <div className="discography-info">
                <p className="disc-title">{release.title}</p>
                <div className="discography-meta">
                  <span className="muted">{release.date}</span>
                  <span className="muted">{release.type}</span>
                  <span className="muted">{release.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Click burst particles — positioned relative to section */}
      {bursts.map(burst => (
        <div
          key={burst.id}
          className="disc-burst-container"
          style={{ left: burst.x, top: burst.y }}
          aria-hidden
        >
          {burst.imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="disc-burst-img"
              style={{ '--burst-i': i, '--burst-total': burst.imgs.length } as React.CSSProperties}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

// ─── COMMISSIONS (FIXED CARD CLIPPING) ───────────────────────
