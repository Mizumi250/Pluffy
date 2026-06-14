// ============================================================
// ARKZEN GENERATED ANIMATIONS — visual-lab [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-14T03:19:13.052Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const visualLabAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.vl-logo', { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay: 0.05 })
    gsap.fromTo('.vl-nav-item', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.025, ease: 'power2.out', delay: 0.15 })
    gsap.fromTo('.vl-section-header', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.4 })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.18 } },
}
