// ============================================================
// ARKZEN GENERATED ANIMATIONS — shan-portfolio [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-25T06:56:30.698Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const shanPortfolioAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    // Hero entrance
    gsap.fromTo('.shan-hero-content',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )

    // Nav fade in
    gsap.fromTo('.shan-nav',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )

    // Section headers
    gsap.fromTo('.shan-section-header',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.shan-section-header', start: 'top 85%', toggleActions: 'play none none reset' },
        stagger: 0.1
      }
    )

    // Service cards
    gsap.fromTo('.shan-service-card',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.shan-services-grid', start: 'top 85%', toggleActions: 'play none none reset' }
      }
    )

    // Contact cards
    gsap.fromTo('.shan-contact-card',
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.shan-contact-grid', start: 'top 85%', toggleActions: 'play none none reset' }
      }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}
