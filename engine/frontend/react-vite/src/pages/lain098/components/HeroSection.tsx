// ============================================================
// ARKZEN GENERATED COMPONENT — HeroSection [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.494Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { heroRef, onMove, ref } from './utils'

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth  - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section id="hero" ref={heroRef} className="lain-hero">
      {/* Parallax sea gradient blobs */}
      <motion.div
        className="lain-blob lain-blob-1"
        animate={{ x: mousePos.x * 1.2, y: mousePos.y * 0.8 }}
        transition={{ type: 'spring', stiffness: 40, damping: 20 }}
      />
      <motion.div
        className="lain-blob lain-blob-2"
        animate={{ x: -mousePos.x * 0.8, y: -mousePos.y * 1.0 }}
        transition={{ type: 'spring', stiffness: 30, damping: 25 }}
      />
      <motion.div
        className="lain-blob lain-blob-3"
        animate={{ x: mousePos.x * 0.5, y: mousePos.y * 1.3 }}
        transition={{ type: 'spring', stiffness: 25, damping: 30 }}
      />

      {/* Floating decorative glyphs */}
      <div className="lain-hero-glyphs">
        {['✦','✧','◇','◈','✦','✧'].map((g,i) => (
          <span
            key={i}
            className="lain-glyph"
            style={{ '--delay': `${i * 0.7}s`, '--x': `${10 + i * 15}%`, '--top': `${15 + (i % 3) * 20}%` } as React.CSSProperties}
          >{g}</span>
        ))}
      </div>

      {/* Hero content */}
      <div className="lain-hero-inner">
        <motion.div
          className="lain-hero-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Digital Artist · Anime Illustration · Commissions Open
        </motion.div>

        <div className="lain-hero-title-wrap">
          {'LAIN'.split('').map((ch, i) => (
            <motion.span
              key={i}
              className="lain-hero-letter"
              initial={{ opacity: 0, y: 80, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.8, ease: [0.2, 0.8, 0.3, 1] }}
            >{ch}</motion.span>
          ))}
          <motion.span
            className="lain-hero-letter lain-hero-num"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8, ease: [0.2, 0.8, 0.3, 1] }}
          >098_</motion.span>
        </div>

        <motion.p
          className="lain-hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          Hello, I'm Lain — a digital artist whose work focuses on anime-style illustrations,
          fanart, OCs, chibi, and short animations. I bring ideas and characters to life through art.
        </motion.p>

        <motion.div
          className="lain-hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <a href="#commissions" className="lain-btn lain-btn-primary">Commission Me</a>
          <a href="#works"       className="lain-btn lain-btn-ghost">View Work</a>
        </motion.div>

        <motion.div
          className="lain-hero-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="lain-scroll-line" />
          <span>scroll</span>
        </motion.div>
      </div>

      {/* Hero art image */}
      <motion.div
        className="lain-hero-art"
        initial={{ opacity: 0, scale: 0.9, x: 60 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 1.1, ease: [0.2, 0.8, 0.3, 1] }}
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.3}px)`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80"
          alt="Lain098_ art"
        />
        <div className="lain-hero-art-badge">
          <span>✦</span>
          <span>Open for</span>
          <strong>Commissions</strong>
        </div>
      </motion.div>
    </section>
  )
}

// ─── INTRO STRIP (Astrophile-inspired: rotated vertical text layout) ──────────
