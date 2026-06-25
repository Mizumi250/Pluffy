// ============================================================
// ARKZEN GENERATED COMPONENT — HeroSection [React+Vite]
// Source: @arkzen:components (lain)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:06:19.972Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArtCarousel } from './ArtCarousel'
import { SignatureLogo } from './SignatureLogo'

// ─── HERO SECTION ──────────────────────────────────────────────

export const HeroSection = ({ onPreview }: { onPreview: (index: number) => void }) => {
  return (
    <section className="hero">
      <div className="hero-bg-signature">
        <SignatureLogo />
      </div>
      <div className="hero-content">
        <div className="hero-left">
          <div className="hero-badge mono">Digital Artist</div>
          <p className="hero-side-text">Art for the <span>dreamers</span>, the <span>storytellers</span>, and the <span>wanderers</span> — illustrations that capture emotion in every stroke.</p>
        </div>
        <div className="hero-right">
          <ArtCarousel onPreview={onPreview} />
        </div>
      </div>
    </section>
  )
}

// ─── ART CAROUSEL (with expand animation) ──────────────────────
