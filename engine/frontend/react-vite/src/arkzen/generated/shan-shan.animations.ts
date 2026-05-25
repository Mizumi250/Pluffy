// ============================================================
// ARKZEN GENERATED ANIMATIONS — shan-shan [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-25T07:32:33.643Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const shanShanAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    // Subtle parallax on polygon masks (same as MIJ)
    gsap.utils.toArray<HTMLElement>('.mask-top, .mask-bottom').forEach((el) => {
      gsap.to(el.querySelector('svg'), {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}
