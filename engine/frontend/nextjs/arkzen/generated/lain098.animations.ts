// ============================================================
// ARKZEN GENERATED ANIMATIONS — lain098
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:46.396Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const lain098Animations = (
  pageRef: React.RefObject<HTMLDivElement | null>,
  onAvatarReady: () => void,
  onOrbitReady: () => void,
  onNavReady: () => void,
) => {
  
  const ctx = gsap.context(() => {

    // 1. Draw the script SVG paths (background hero text)
    const paths = document.querySelectorAll('.script-path')
    let totalDuration = 0
    paths.forEach((path, i) => {
      const el = path as SVGPathElement
      const length = el.getTotalLength?.() || 800
      gsap.set(el, { strokeDasharray: length, strokeDashoffset: length })
      const dur = 1.0 + Math.random() * 0.4
      const delay = i * 0.18 + 0.2
      gsap.to(el, { strokeDashoffset: 0, duration: dur, delay, ease: 'power2.inOut' })
      totalDuration = Math.max(totalDuration, delay + dur)
    })

    // 2. Avatar appears right after script finishes — scale from 0
    gsap.delayedCall(totalDuration + 0.1, () => {
      onAvatarReady()
    })

    // 3. Orbit expands fast then eases to normal — triggered after avatar
    gsap.delayedCall(totalDuration + 0.35, () => {
      onOrbitReady()
    })

    // 4. Nav + side text blur-fade in after orbit settles
    gsap.delayedCall(totalDuration + 0.9, () => {
      onNavReady()
    })

  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
} as const
