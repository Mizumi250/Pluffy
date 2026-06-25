// ============================================================
// ARKZEN GENERATED COMPONENT — DiscographySection [React+Vite]
// Source: @arkzen:components (lain)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:06:19.977Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { burstImgs, cards, popupRef, ref, releases } from './utils'

// ─── DISCOGRAPHY ────────────────────────────────────────────────

export const DiscographySection = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const releases = [
    { id: 'hold-out-hope', title: 'hold out hope', date: 'September 2025', type: 'single, 4 songs', duration: '12 minutes 22 seconds', artwork: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=140&q=80' },
    { id: 'wanna-get-to-know-you', title: 'wanna get to know you', date: 'September 2022', type: 'single, 1 song', duration: '3 minutes 19 seconds', artwork: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=140&q=80' },
    { id: 'just-a-memory-stripped', title: 'Just a Memory (Stripped)', date: 'January 2021', type: 'single, 1 song', duration: '3 minutes 49 seconds', artwork: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=140&q=80' },
    { id: 'just-a-memory', title: 'Just a Memory', date: 'November 2020', type: 'single, 1 song', duration: '3 minutes 43 seconds', artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=140&q=80' },
    { id: 'still-dreaming', title: 'Still Dreaming', date: 'January 2020', type: 'single, 1 song', duration: '4 minutes 9 seconds', artwork: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=140&q=80' },
  ]

  const burstImgs = [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&q=80',
    'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=200&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&q=80',
    'https://images.unsplash.com/photo-1549317336-206569e8475c?w=200&q=80',
    'https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=200&q=80',
    'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=200&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&q=80',
  ]

  useEffect(() => {
    if (!popupRef.current || !hoveredId) return
    const cards = popupRef.current.querySelectorAll('.burst-img')
    gsap.fromTo(cards,
      { opacity: 0, scale: 0.6, y: 30, rotation: -10, filter: 'blur(8px)' },
      {
        opacity: 1, scale: 1, y: 0, rotation: 0, filter: 'blur(0px)',
        stagger: 0.05,
        duration: 0.6,
        ease: 'back.out(1.7)',
      }
    )
  }, [hoveredId])

  return (
    <section id="discography" className="discography">
      <div className="section-head">
        <h2 className="section-title">Discography <span>The complete works</span></h2>
        <p className="section-sub mono uppercase muted">all releases — ordered by newest first</p>
      </div>
      <div className="discography-list">
        {releases.map((release, idx) => (
          <div
            key={release.id}
            className="discography-item"
            onMouseEnter={() => setHoveredId(release.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="discography-row">
              <span className="mono muted index">{String(releases.length - idx).padStart(3, '0')}</span>
              <div className="discography-artwork">
                <img src={release.artwork} alt={release.title} />
              </div>
              <div className="discography-info">
                <p className="title uppercase">{release.title}</p>
                <div className="discography-meta">
                  <span className="mono uppercase muted">{release.date}</span>
                  <span className="mono uppercase muted">{release.type}</span>
                  <span className="mono uppercase muted">{release.duration}</span>
                </div>
              </div>
            </div>
            {hoveredId === release.id && (
              <div ref={popupRef} className="discography-burst">
                {burstImgs.map((src, i) => (
                  <img key={i} className="burst-img" src={src} alt={`burst ${i}`} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── COMMISSIONS ──────────────────────────────────────────────
