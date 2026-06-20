// ============================================================
// ARKZEN GENERATED ANIMATIONS — jo-payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T04:54:19.387Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const joPayrollAnimations = (ref: React.RefObject<HTMLDivElement>) => {
  if (!ref.current) return () => {}

  const ctx = gsap.context(() => {
    // Stat chips stagger in
    gsap.from('.stat-chip', {
      opacity: 0,
      y: 20,
      scale: 0.95,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'all',
    })

    // Welcome banner slides in
    gsap.from('.welcome-banner', {
      opacity: 0,
      x: -24,
      duration: 0.6,
      ease: 'power3.out',
      clearProps: 'all',
    })

    // Card sections fade up
    gsap.from('.section-card', {
      opacity: 0,
      y: 30,
      duration: 0.55,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.15,
      clearProps: 'all',
    })

    // Table rows stagger
    gsap.from('.jo-row', {
      opacity: 0,
      x: -16,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.out',
      delay: 0.3,
      clearProps: 'all',
    })
  }, ref)

  return () => ctx.revert()
}
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
