// ============================================================
// ARKZEN GENERATED COMPONENT — ContactSection [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.497Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cards, ref } from './utils'

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────

export const ContactSection = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.contact-el'),
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0,
        stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section id="contact" className="lain-contact" ref={ref}>
      <div className="lain-contact-inner">
        <span className="contact-el lain-section-eyebrow">✦ Let's connect</span>
        <h2 className="contact-el lain-contact-title">
          Got an idea?<br /><em>Let's talk.</em>
        </h2>
        <p className="contact-el lain-contact-sub">
          Whether you want a commission, a collaboration, or just want to say hi —
          my DMs are always open.
        </p>
        <div className="contact-el lain-contact-cards">
          <motion.a
            href="https://www.instagram.com/lain098_"
            target="_blank"
            rel="noreferrer"
            className="lain-contact-card"
            whileHover={{ scale: 1.04, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="lain-contact-card-icon">📷</span>
            <strong>Instagram</strong>
            <span>@lain098_</span>
          </motion.a>
          <motion.a
            href="https://throne.com/lain098_"
            target="_blank"
            rel="noreferrer"
            className="lain-contact-card"
            whileHover={{ scale: 1.04, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="lain-contact-card-icon">👑</span>
            <strong>Throne</strong>
            <span>throne.com/lain098_</span>
          </motion.a>
        </div>
        <p className="contact-el lain-contact-note">
          For commissions, please check my Throne page for current availability and pricing tiers.
        </p>
      </div>
      {/* Sea wave SVG at bottom */}
      <div className="lain-contact-wave" aria-hidden>
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            fill="#E8F4FD"
          />
        </svg>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
