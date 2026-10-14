'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — BurgerMenu
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T13:50:39.939Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV_LINKS } from './constants'

// ─── BURGER ───────────────────────────────────────────────────────────────────

export const BurgerMenu = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const kvH = (document.getElementById('kv')?.offsetHeight ?? 0) - 80
      document.body.classList.toggle('scrolled', window.scrollY > kvH)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleOpen = (next: boolean) => {
    setOpen(next)
    document.body.classList.toggle('nav-open', next)
    if (next) {
      setTimeout(() => {
        gsap.fromTo(
          '.shan-nav ul li',
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, stagger: 0.08, duration: 0.4, ease: 'power3.out' }
        )
      }, 10)
    }
  }

  return (
    <>
      <div
        id="shan-burger"
        className={open ? 'open' : ''}
        onClick={() => handleOpen(!open)}
        role="button"
        aria-label="Menu"
      >
        <i /><i /><i /><i /><i />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="shan-nav"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => handleOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── SVG DIAGONAL MASKS ───────────────────────────────────────────────────────
