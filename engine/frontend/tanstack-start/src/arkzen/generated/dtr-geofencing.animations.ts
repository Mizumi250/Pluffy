// ============================================================
// ARKZEN GENERATED ANIMATIONS — dtr-geofencing [TanStack]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-23T08:36:59.094Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const dtrGeofencingAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.dtr-header',
      { opacity: 0, y: -18 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
    )
    gsap.fromTo(
      ['.dtr-select', '.dtr-clock', '.dtr-map', '.dtr-summary', '.dtr-records',
       '.admin-header', '.admin-stats', '.admin-settings', '.admin-records'],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.15 }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
