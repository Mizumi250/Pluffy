// ============================================================
// ARKZEN GENERATED COMPONENT — Footer [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:32:32.682Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SignatureLogo } from './SignatureLogo'

// ─── FOOTER ────────────────────────────────────────────────────

export const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <SignatureLogo className="footer-sig" />
      <p className="footer-tagline">Anime illustrations · Fanart · OCs · Chibi · Short Animations</p>
      <div className="footer-links">
        <a href="https://www.instagram.com/lain098_" target="_blank">Instagram</a>
        <a href="https://throne.com/lain098_" target="_blank">Throne</a>
        <a href="mailto:lain098@example.com">Licensing</a>
      </div>
      <p className="footer-copy">© 2021–2025 Lain098_ · All Rights Reserved</p>
    </div>
  </footer>
)
