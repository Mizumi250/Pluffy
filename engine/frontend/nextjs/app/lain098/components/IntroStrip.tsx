'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — IntroStrip
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:26.050Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BurstItem } from './types'

// ─── INTRO STRIP ──────────────────────────────────────────────

export const IntroStrip = () => (
  <section className="intro-strip">
    <div className="intro-strip-inner">
      <div className="intro-label"><span className="vertical-text">LAIN098_ — DIGITAL ARTIST</span></div>
      <div className="intro-statement">
        <p>I create worlds one frame at a time — anime illustrations that breathe, characters that feel like old friends, and animations that carry a quiet heartbeat.</p>
        <p className="intro-date">est. 2021 · open for work</p>
      </div>
      <div className="intro-stats">
        {[['100+', 'Commissions completed'], ['4', 'Art styles offered'], ['∞', 'Characters imagined']].map(([n, l]) => (
          <div key={n} className="intro-stat"><strong>{n}</strong><span>{l}</span></div>
        ))}
      </div>
    </div>
  </section>
)

// ─── WORK CHAPTER ─────────────────────────────────────────────
