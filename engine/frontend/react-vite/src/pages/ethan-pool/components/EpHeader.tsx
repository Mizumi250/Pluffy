// ============================================================
// ARKZEN GENERATED COMPONENT — EpHeader [React+Vite]
// Source: @arkzen:components (ethan-pool)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T14:10:32.074Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV_LINKS } from './constants'

export const EpHeader = ({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) => {
  return (
    <header className="ep-header" data-fade="fade-down">
      <div className="ep-header-inner">
        <a href="#top" className="ep-logo">
          <span className="ep-logo-mark">⌬</span>
          <span className="ep-logo-text">ETHAN<span>POOL</span></span>
        </a>

        <nav className="ep-nav-desktop">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="ep-link-underline">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ep-header-right">
          <a href="#contact" className="ep-link-underline ep-contact-link">Contact</a>
          <button
            className={`ep-menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
};
