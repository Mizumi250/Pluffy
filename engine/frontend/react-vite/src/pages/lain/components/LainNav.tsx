// ============================================================
// ARKZEN GENERATED COMPONENT — LainNav [React+Vite]
// Source: @arkzen:components (lain)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:06:19.972Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onScroll } from './utils'

// ─── NAV (with blur entrance) ──────────────────────────────────

export const LainNav = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`lain-header ${scrolled ? 'scrolled' : ''}`}>
      <a href="#" className="lain-header-logo">
        <span className="logo-text">LAIN</span>
      </a>
      <button className={`lain-burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <i /><i /><i />
      </button>
    </header>
  )
}

// ─── HERO SECTION ──────────────────────────────────────────────
