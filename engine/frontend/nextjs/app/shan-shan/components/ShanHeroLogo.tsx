'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ShanHeroLogo
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T01:34:10.244Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── ANIMATED SHAN LOGO ───────────────────────────────────────────────────────
// Full stroke-draw animation on mount. Letters are meaty, editorial weight.

export const ShanHeroLogo = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const paths = Array.from(svgRef.current.querySelectorAll('.kv-path'))
    paths.forEach((el) => {
      const len = (el as SVGGeometryElement).getTotalLength?.() ?? 400
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 })
    })
    // Staggered draw-on per letter
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 1.2,
      stagger: 0.22,
      ease: 'power2.inOut',
      delay: 1.7,
    })
    // Parent fades in first
    gsap.to('#kv-svg', { opacity: 1, duration: 0.01, delay: 1.65 })

    // After draw: subtle shimmer pulse
    gsap.to(paths, {
      filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.7))',
      duration: 0.6,
      delay: 3.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }, [])

  return (
    <span id="kv-svg">
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 440 120"
        width="440"
        height="120"
        aria-label="SHAN"
      >
        {/* ── S ── */}
        <path className="kv-path"
          d="M 78 22 C 60 22 40 30 40 48 C 40 64 56 70 72 76 C 90 82 104 90 104 108 C 104 124 82 130 62 130 C 46 130 30 124 20 116"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── H ── */}
        <path className="kv-path"
          d="M 128 22 L 128 130 M 128 76 L 184 76 M 184 22 L 184 130"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── A ── */}
        <path className="kv-path"
          d="M 216 130 L 248 22 L 280 130 M 226 96 L 270 96"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── N ── */}
        <path className="kv-path"
          d="M 304 130 L 304 22 L 372 130 L 372 22"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── · ── */}
        <circle className="kv-path"
          cx="404" cy="122" r="7"
          fill="none" stroke="#fff" strokeWidth="9"
        />
      </svg>
    </span>
  )
}

// ─── TALE COVER (sticky scroll layer) ────────────────────────────────────────
