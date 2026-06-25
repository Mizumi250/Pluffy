// ============================================================
// ARKZEN GENERATED COMPONENT — HeroSection [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:32:32.653Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArtCarousel } from './ArtCarousel'
import { HeroScript } from './HeroScript'

// ─── HERO SECTION ─────────────────────────────────────────────

export const HeroSection = ({
  onPreview,
  orbitVisible,
  avatarVisible,
}: {
  onPreview: (index: number) => void
  orbitVisible: boolean
  avatarVisible: boolean
}) => {
  return (
    <section className="hero">
      {/* Script SVG sits as background layer */}
      <HeroScript />

      {/* Foreground: avatar + orbit carousel stacked above script */}
      <div className="hero-center">
        <div className={`hero-avatar-wrap ${avatarVisible ? 'avatar-visible' : 'avatar-hidden'}`}>
          <ArtCarousel onPreview={onPreview} orbitVisible={orbitVisible} />
        </div>
      </div>

      {/* Side text fades in with nav */}
      <div className={`hero-side-content ${avatarVisible ? 'side-visible' : 'side-hidden'}`}>
        <div className="hero-badge">Digital Artist</div>
        <p className="hero-preview muted">
          <span className="desktop">Click artwork to preview</span>
          <span className="mobile">Tap artwork to preview</span>
        </p>
        <p className="hero-tagline">Art for the <span>dreamers</span>, the <span>storytellers</span>, and the <span>wanderers</span> — illustrations that capture emotion in every stroke.</p>
      </div>
    </section>
  )
}

// ─── INTRO STRIP ──────────────────────────────────────────────
