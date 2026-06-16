// ============================================================
// ARKZEN GENERATED ANIMATIONS — ethan-pool [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-16T14:29:25.761Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const ethanPoolAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    // ── data-fade entrance system (mirrors source data-fade / data-fade-delay / data-fade-duration) ──
    const fadeEls = gsap.utils.toArray<HTMLElement>('[data-fade]')

    fadeEls.forEach((el) => {
      const type = el.getAttribute('data-fade') || 'fade-in'
      const delay = parseInt(el.getAttribute('data-fade-delay') || '0', 10) / 1000
      const duration = parseInt(el.getAttribute('data-fade-duration') || '800', 10) / 1000

      let fromVars: gsap.TweenVars = { opacity: 0 }
      if (type === 'fade-up') fromVars = { opacity: 0, y: 50 }
      if (type === 'fade-down') fromVars = { opacity: 0, y: -40 }
      if (type === 'fade-in') fromVars = { opacity: 0 }

      const isHero = el.closest('.ep-hero') || el.classList.contains('ep-header')
      const isCarousel = el.closest('.ep-carousel-section')

      if (isHero || isCarousel) {
        // hero / header / room-carousel entrance — plays immediately, not scroll-gated.
        // clearProps removes the inline opacity/transform once done.
        gsap.fromTo(el, fromVars, {
          opacity: 1, y: 0, x: 0,
          duration, delay, ease: 'power3.out',
          clearProps: 'opacity,transform',
        })
      } else {
        gsap.fromTo(el, fromVars, {
          opacity: 1, y: 0, x: 0,
          duration, delay, ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      }
    })

    // ── hero scale-down parallax on load ──
    gsap.fromTo('.ep-hero-img img',
      { scale: 1.18 },
      { scale: 1, duration: 1.8, ease: 'power3.out' }
    )

    // ── hero parallax on scroll ──
    gsap.to('.ep-hero-img img', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.ep-hero', start: 'top top', end: 'bottom top', scrub: true },
    })

    // ── banner-full text reveal + parallax ──
    gsap.to('.ep-banner-img img', {
      yPercent: 15, ease: 'none',
      scrollTrigger: { trigger: '.ep-banner-full', start: 'top bottom', end: 'bottom top', scrub: true },
    })

    // ── room carousel: plain horizontal scroll, no GSAP pin.
    // A pinned ScrollTrigger here caused the room cards to render invisible
    // when scrolling down (pin re-layout/refresh fought with the cards'
    // opacity), so the carousel is a normal CSS overflow-x scroller instead —
    // always visible, swipeable on touch, scrollable with a wheel/trackpad.

    // ── info section pin + image parallax ──
    gsap.to('.ep-info-img img', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.ep-info-section', start: 'top bottom', end: 'bottom top', scrub: true },
    })

    // ── multimedia grid staggered reveal ──
    gsap.fromTo('.ep-media',
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: '.ep-multimedia-grid', start: 'top 85%' },
      }
    )

    // ── blog cards stagger ──
    gsap.fromTo('.ep-blog-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.ep-blog-track', start: 'top 90%' },
      }
    )

    // ── room cards: no opacity/transform animation here on purpose.
    // The pinned section + horizontal scroll already provides motion, and animating
    // opacity on elements inside a pinned ScrollTrigger caused cards to render as
    // invisible when scrolling down into the pin (inline styles fought with the
    // pin's transform/refresh cycle). Cards are simply visible at all times.

    // ── location map subtle scale-in ──
    gsap.fromTo('.ep-location-map img',
      { scale: 1.1 },
      {
        scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.ep-location', start: 'top 75%' },
      }
    )
  }, pageRef)

  return () => ctx.revert()
}

export default ethanPoolAnimations

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
}
