// ============================================================
// ARKZEN GENERATED COMPONENT — SkillsMarquee [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.496Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SKILLS_MARQUEE } from './constants'
import { cards } from './utils'

// ─── MARQUEE ──────────────────────────────────────────────────────────────────

export const SkillsMarquee = () => (
  <div className="lain-marquee-wrap">
    <div className="lain-marquee">
      <div className="lain-marquee-track">
        {[...SKILLS_MARQUEE, ...SKILLS_MARQUEE].map((s, i) => (
          <span key={i} className={s === '·' ? 'lain-marquee-dot' : 'lain-marquee-item'}>{s}</span>
        ))}
      </div>
    </div>
  </div>
)

// ─── GALLERY STRIP (inspired by Image 06/10: photo-grid + cards) ──────────────
