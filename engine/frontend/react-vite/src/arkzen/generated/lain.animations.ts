// ============================================================
// ARKZEN GENERATED ANIMATIONS — lain [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T16:06:19.982Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const lainAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // 1. Signature writes itself (background)
    const paths = document.querySelectorAll('.signature-path')
    paths.forEach((path, i) => {
      const length = path.getTotalLength?.() || 300
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 1.4,
        delay: i * 0.2,
        ease: 'power2.inOut',
      }, 0.2)
    })

    // 2. Avatar appears after signature finishes
    const avatar = document.querySelector('.carousel-center-avatar')
    if (avatar) {
      tl.to(avatar, {
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      }, 2.0) // after signature (0.2 + 1.8)
    }

    // 3. Orbit expands from behind avatar
    const carousel = document.querySelector('.carousel')
    if (carousel) {
      tl.to(carousel, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'back.out(1.4)',
      }, 2.0)
    }

    // 4. Navbar fades in with blur
    const nav = document.querySelector('.lain-header')
    if (nav) {
      tl.to(nav, {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power2.out',
      }, 2.2)
    }

    // Scroll triggers for sections
    gsap.from('.hero-badge, .hero-side-text', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.8,
      delay: 3.0,
      ease: 'power3.out',
    })
  }, pageRef)

  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
}
