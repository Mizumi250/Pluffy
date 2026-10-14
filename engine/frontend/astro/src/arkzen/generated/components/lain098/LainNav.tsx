// ============================================================
// ARKZEN GENERATED COMPONENT — LainNav
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:12.756Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV_LINKS } from './constants'
import { SignatureLogo } from './SignatureLogo'

// ─── NAV ──────────────────────────────────────────────────────

export const LainNav = ({ visible }: { visible: boolean }) => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`lain-header ${scrolled ? 'scrolled' : ''} ${visible ? 'nav-visible' : 'nav-hidden'}`}>
        <a href="#" className="lain-header-logo">
          <SignatureLogo />
        </a>
        <button className={`lain-burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
          <i /><i /><i />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lain-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          >
            <motion.nav
              className="lain-nav-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <ul>
                {NAV_LINKS.map(l => (
                  <li key={l.href}>
                    <a className="lain-nav-link" href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
                  </li>
                ))}
              </ul>
              <div className="lain-nav-socials">
                <a href="https://www.instagram.com/lain098_" target="_blank">Instagram</a>
                <a href="https://throne.com/lain098_" target="_blank">Throne</a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── HERO SCRIPT SVG (BACKGROUND) ────────────────────────────

// (Script path is kept as a subtle decorative element over the sky)
