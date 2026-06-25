// ============================================================
// ARKZEN GENERATED ANIMATIONS — coveo [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T14:31:55.700Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const coveoAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    // ── Hero script path drawing ──
    const paths = document.querySelectorAll('.script-path')
    paths.forEach((path, i) => {
      const length = path.getTotalLength?.() || 800
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.2,
        delay: i * 0.2 + 0.4,
        ease: 'power2.out',
      })
    })

    // ── Hero intro fade-up ──
    gsap.from('.hero-intro', {
      opacity: 0,
      y: 30,
      duration: 1.2,
      delay: 0.8,
      ease: 'power3.out',
    })

    // ── About images parallax ──
    gsap.utils.toArray('.about .imageFloat img').forEach(img => {
      gsap.to(img, {
        y: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.about'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    gsap.utils.toArray('.image-sequence').forEach(el => {
      gsap.to(el, {
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.about'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    // ── About content fade-in ──
    gsap.from('.about .content h3, .about .content p', {
      opacity: 0,
      y: 30,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about .content',
        start: 'top 75%',
      },
    })

    // ── Discography items stagger ──
    gsap.from('.release-item', {
      opacity: 0,
      y: 30,
      stagger: 0.06,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.release-list',
        start: 'top 80%',
      },
    })

    // ── Discography headline ──
    gsap.from('.discography-headline, .discography-sub', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.discography-headline',
        start: 'top 85%',
      },
    })

  }, pageRef)

  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
}
