// ============================================================
// ARKZEN GENERATED COMPONENT — HeroSection [React+Vite]
// Source: @arkzen:components (coveo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T14:31:55.696Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Carousel } from './Carousel'
import { HeroScript } from './HeroScript'

// ─── HERO SECTION ─────────────────────────────────────────────

export const HeroSection = () => (
  <section className="hero">
    <HeroScript />
    <a href="#discography" className="hero-banner mono">
      <span className="dot" />
      hold out hope — Now Available
    </a>
    <p className="hero-preview mono muted">
      <span className="desktop">Click to preview song</span>
      <span className="mobile">Tap artwork to preview a song</span>
    </p>
    <p className="hero-side-text">
      Music for the <span>day-dreamers</span>, the <span>over-thinkers</span>, the <span>storytellers</span>, and the
      <span>wanderers</span> — a soundtrack for those who find beauty in every moment, and meaning in every silence.
    </p>
    <div className="hero-intro">
      <div className="avatar">
        <img src="/assets/img/avatars/avatar-coveo.jpg" alt="COVEO" />
      </div>
      <div className="logo">
        <h1 className="title">COVEO</h1>
        <p className="subtitle uppercase">An Audio/Visual Project</p>
      </div>
    </div>
    <div className="hero-fade" />
    <Carousel />
  </section>
)

// ─── ABOUT SECTION ────────────────────────────────────────────
