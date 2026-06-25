// ============================================================
// ARKZEN GENERATED COMPONENT — LainNav [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.494Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV_LINKS } from './constants'
import { next, onScroll, toggle } from './utils'

// ─── NAV ──────────────────────────────────────────────────────────────────────

export const LainNav = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      setTimeout(() => {
        gsap.fromTo('.lain-nav-link',
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, stagger: 0.07, duration: 0.45, ease: 'power3.out' }
        )
      }, 10)
    }
  }

  return (
    <>
      <header className={`lain-header ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="lain-header-logo">lain<span>098_</span></a>
        <button className={`lain-burger ${open ? 'open' : ''}`} onClick={toggle} aria-label="Menu">
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
            transition={{ duration: 0.35 }}
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
                    <a
                      className="lain-nav-link"
                      href={l.href}
                      onClick={() => setOpen(false)}
                    >{l.label}</a>
                  </li>
                ))}
              </ul>
              <div className="lain-nav-socials">
                <a href="https://www.instagram.com/lain098_" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer">Throne</a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
