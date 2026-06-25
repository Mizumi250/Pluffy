// ============================================================
// ARKZEN GENERATED COMPONENT — AboutSection [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.497Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ref } from './utils'

// ─── ABOUT SECTION (inspired by Image 08/11: large text + vertical layout) ────

export const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return

    gsap.fromTo(ref.current.querySelectorAll('.about-el'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        stagger: 0.1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      }
    )

    // Big text parallax
    gsap.to(ref.current.querySelector('.about-bg-text') as HTMLElement, {
      yPercent: -20, ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom', end: 'bottom top',
        scrub: true,
      },
    })
  }, [])

  return (
    <section id="about" className="lain-about" ref={ref}>
      <div className="about-bg-text" aria-hidden>LAIN</div>
      <div className="lain-about-inner">
        <div className="lain-about-img-col about-el">
          <div className="lain-about-img-frame">
            <img
              src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80"
              alt="Lain working"
            />
          </div>
          <div className="lain-about-img-tag about-el">
            <span className="lain-vertical-text">DIGITAL ARTIST · 2021</span>
          </div>
        </div>
        <div className="lain-about-text-col">
          <span className="about-el lain-section-eyebrow">✦ About</span>
          <h2 className="about-el lain-about-title">Hello,<br />I'm <em>Lain</em>.</h2>
          <p className="about-el lain-about-p">
            I'm a digital artist whose work focuses on anime-style illustrations — fanart,
            original characters, chibi, and short animations. I enjoy creating unique characters
            and bringing ideas to life through art.
          </p>
          <p className="about-el lain-about-p">
            My style lives in soft colours, expressive eyes, and the quiet in-between moments —
            the kind of art that feels like a warm afternoon by the sea. Whether it's a beloved
            fictional character or a freshly imagined OC, I approach every piece with care.
          </p>
          <div className="about-el lain-about-tags">
            {['Anime Illustration', 'Fanart', 'Original Characters', 'Chibi', 'Short Animation', 'Character Design'].map(t => (
              <span key={t} className="lain-tag">{t}</span>
            ))}
          </div>
          <div className="about-el lain-about-links">
            <a href="https://www.instagram.com/lain098_" target="_blank" rel="noreferrer" className="lain-btn lain-btn-primary">
              Instagram
            </a>
            <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer" className="lain-btn lain-btn-ghost">
              Throne Wishlist
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────
