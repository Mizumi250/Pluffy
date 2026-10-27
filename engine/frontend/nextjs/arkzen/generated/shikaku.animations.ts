// ============================================================
// ARKZEN GENERATED ANIMATIONS — shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:13:08.478Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

// GSAP — pixel scatter entrance on editor canvas loadif (typeof window !== 'undefined') {
  // Animate tool buttons into view on mount
  document.addEventListener('DOMContentLoaded', () => {
    const tools = document.querySelectorAll('.sk-tool-btn')
    if (tools.length) {
      gsap.fromTo(tools,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' }
      )
    }

    const panels = document.querySelectorAll('.sk-panel')
    if (panels.length) {
      gsap.fromTo(panels,
        { opacity: 0, x: 16 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      )
    }

    const cards = document.querySelectorAll('.sk-project-card')
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(1.4)' }
      )
    }
  })
}
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
} as const
