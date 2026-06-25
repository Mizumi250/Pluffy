// ============================================================
// ARKZEN GENERATED COMPONENT — CommissionsSection [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.496Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { COMMISSION_TIERS } from './constants'
import { ref } from './utils'

// ─── COMMISSIONS SECTION (inspired by Image 07: card layout with badges) ──────

export const CommissionsSection = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.lain-tier-card'),
      { opacity: 0, y: 60, scale: 0.93 },
      {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.12, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 76%' },
      }
    )
  }, [])

  return (
    <section id="commissions" className="lain-commissions" ref={ref}>
      <div className="lain-section-head">
        <span className="lain-section-eyebrow">✦ Commissions</span>
        <h2 className="lain-section-title">Let's create <em>together</em></h2>
        <p className="lain-section-sub">
          Slots are limited — order via Throne or DM on Instagram. I'll confirm availability within 24 hours.
        </p>
      </div>
      <div className="lain-tiers-grid">
        {COMMISSION_TIERS.map((tier) => (
          <motion.div
            key={tier.id}
            className={`lain-tier-card ${tier.featured ? 'tier-featured' : ''}`}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            {tier.featured && <div className="tier-badge">✦ Most Popular</div>}
            <div className="tier-accent-dot" style={{ background: tier.accent }} />
            <div className="tier-header">
              <h3 className="tier-title">{tier.title}</h3>
              <p className="tier-price">{tier.price}</p>
            </div>
            <p className="tier-desc">{tier.desc}</p>
            <ul className="tier-features">
              {tier.features.map((f, i) => (
                <li key={i}><span className="tier-check">✦</span>{f}</li>
              ))}
            </ul>
            <div className="tier-ctas">
              <a
                href="https://throne.com/lain098_"
                target="_blank"
                rel="noreferrer"
                className="lain-btn lain-btn-primary tier-cta"
              >
                Order on Throne
              </a>
              <a
                href="https://www.instagram.com/lain098_"
                target="_blank"
                rel="noreferrer"
                className="lain-btn lain-btn-ghost tier-cta"
              >
                DM on Instagram
              </a>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="lain-comm-notice">
        <p>✦ All prices are base rates. Complex designs, multiple characters, or detailed backgrounds may affect pricing. I'll always discuss before starting.</p>
      </div>
    </section>
  )
}

// ─── ABOUT SECTION (inspired by Image 08/11: large text + vertical layout) ────
