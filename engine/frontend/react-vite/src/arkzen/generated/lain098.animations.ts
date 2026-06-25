// ============================================================
// ARKZEN GENERATED ANIMATIONS — lain098 [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T13:56:58.500Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const lain098Animations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    // Parallax hero blob on scroll
    gsap.to('.lain-blob-1', {
      yPercent: 30, ease: 'none',
      scrollTrigger: {
        trigger: '.lain-hero', start: 'top top', end: 'bottom top', scrub: true,
      },
    })
    gsap.to('.lain-blob-2', {
      yPercent: -20, ease: 'none',
      scrollTrigger: {
        trigger: '.lain-hero', start: 'top top', end: 'bottom top', scrub: true,
      },
    })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit:    { opacity: 0,       transition: { duration: 0.25 } },
}
