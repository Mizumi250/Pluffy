'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — EpNavDrawer
// Source: @arkzen:components (ethan-pool)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:04.506Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV_LINKS } from './constants'

// ─── NAV DRAWER ───────────────────────────────────────────────────────────────

export const EpNavDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <nav className={`ep-drawer ${open ? 'open' : ''}`}>
      <div className="ep-drawer-inner">
        <a href="#top" className="ep-drawer-logo" onClick={onClose}>
          <span className="ep-logo-mark">⌬</span>
          <span className="ep-logo-text">ETHAN<span>POOL</span></span>
        </a>

        <ul className="ep-drawer-links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={onClose}>{l.label}</a>
            </li>
          ))}
          <li><a href="#about" onClick={onClose}>About Us</a></li>
          <li><a href="#contact" onClick={onClose}>Contact &amp; Directions</a></li>
          <li><a href="#blog" onClick={onClose}>Blog</a></li>
        </ul>

        <div className="ep-drawer-bottom">
          <div className="ep-drawer-contact">
            <address>12 Lagoon Promenade<br />20003 San Sebastián, Spain</address>
            <ul>
              <li><a href="mailto:hello@ethanpool.com">hello@ethanpool.com</a></li>
              <li><a href="tel:+34943000000">T. +34 943 000 000</a></li>
            </ul>
          </div>
          <div className="ep-drawer-social">
            <p>Follow Us</p>
            <ul>
              <li><a href="https://facebook.com" target="_blank" rel="noopener">FB</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener">IG</a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noopener">TT</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener">YT</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ─── PROMO MODAL ──────────────────────────────────────────────────────────────
