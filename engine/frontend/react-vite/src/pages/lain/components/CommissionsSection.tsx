// ============================================================
// ARKZEN GENERATED COMPONENT — CommissionsSection [React+Vite]
// Source: @arkzen:components (lain)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:06:19.977Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { COMMISSION_TIERS } from './constants'
import { ref } from './utils'

// ─── COMMISSIONS ──────────────────────────────────────────────

export const CommissionsSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.tier-row'),
      { opacity: 0, y: 30, filter: 'blur(6px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.08, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 76%' },
      }
    )
  }, [])
  return (
    <section id="commissions" className="commissions" ref={ref}>
      <div className="section-head">
        <h2 className="section-title">Let's create <em>together</em></h2>
        <p className="section-sub mono uppercase muted">all slots ordered by popularity</p>
      </div>
      <div className="tiers-list">
        {COMMISSION_TIERS.map((tier) => (
          <div key={tier.id} className={`tier-row ${tier.featured ? 'tier-featured' : ''}`}>
            <div className="tier-row-inner">
              <p className="mono muted tier-index">{tier.num}</p>
              <div className="tier-thumb" />
              <div className="tier-info">
                <p className="title uppercase tier-title">{tier.title}</p>
                <div className="tier-meta">
                  <p className="mono uppercase muted">{tier.price}</p>
                  <p className="mono uppercase muted">{tier.features.length} deliverables</p>
                  {tier.featured && <p className="mono uppercase tier-featured-tag">Most Popular</p>}
                </div>
              </div>
            </div>
            <div className="tier-cta">
              <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer" className="btn-tier mono">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg> Order
              </a>
            </div>
          </div>
        ))}
      </div>
      <p className="comm-notice mono muted">All prices are base rates. Complex designs may affect pricing — I'll always discuss first.</p>
    </section>
  )
}

// ─── ABOUT ────────────────────────────────────────────────────
