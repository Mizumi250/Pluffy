// ============================================================
// ARKZEN GENERATED COMPONENT — Footer [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.498Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── FOOTER ───────────────────────────────────────────────────────────────────

export const Footer = () => (
  <footer className="lain-footer">
    <div className="lain-footer-inner">
      <div className="lain-footer-logo">lain<span>098_</span></div>
      <p className="lain-footer-tagline">
        Anime illustrations · Fanart · OCs · Chibi · Short Animations
      </p>
      <div className="lain-footer-links">
        <a href="https://www.instagram.com/lain098_" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer">Throne</a>
      </div>
      <p className="lain-footer-copy">© 2025 Lain098_ · All artwork rights reserved.</p>
    </div>
    {/* Decorative sea line */}
    <div className="lain-footer-sea" aria-hidden>
      {[...Array(8)].map((_, i) => (
        <span key={i} className="lain-footer-wave-bar" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  </footer>
)
