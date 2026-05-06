// ============================================================
// ARKZEN GENERATED ANIMATIONS — inventory-management
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T08:06:44.483Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const inventoryManagementAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.inventory-header', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    gsap.fromTo('.inventory-stats > *', { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 })
    gsap.fromTo('.inventory-table', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.5 })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
}
