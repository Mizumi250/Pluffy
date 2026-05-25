// ============================================================
// ARKZEN GENERATED ANIMATIONS — mij-tribute [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-25T06:56:29.549Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const mijTributeAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.to('.mij-mask svg', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.mij-mask',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}
