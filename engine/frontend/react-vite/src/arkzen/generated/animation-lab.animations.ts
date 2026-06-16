// ============================================================
// ARKZEN GENERATED ANIMATIONS — animation-lab [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-15T11:23:22.073Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const animationLabAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    // Logo entrance
    gsap.fromTo('.anim-lab-logo',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.05 }
    )
    // Sidebar nav items stagger
    gsap.fromTo('.nav-item',
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.2 }
    )
    // Section header
    gsap.fromTo('.section-header',
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.5 }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
