// ============================================================
// ARKZEN GENERATED ANIMATIONS — lain098 [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T13:17:37.118Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const lain098Animations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {

    // ══════════════════════════════════════════════════
    // LOADER
    // ══════════════════════════════════════════════════
    const loaderTl = gsap.timeline()
    let pct = 0
    const pctEl = document.getElementById('l-loader-pct')
    const pctInterval = setInterval(() => {
      pct = Math.min(pct + Math.random() * 18, 98)
      if (pctEl) pctEl.textContent = `${Math.floor(pct)}%`
    }, 80)

    loaderTl
      .to('#l-loader-name', { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0.15)
      .to('#l-loader-sub',  { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.45)
      .to('#l-loader-bar',  { width: '100%', duration: 1.5, ease: 'power2.inOut' }, 0.35)
      .to('#l-loader', {
        opacity: 0,
        y: '-100%',
        duration: 0.9,
        ease: 'power3.inOut',
        onStart: () => {
          clearInterval(pctInterval)
          if (pctEl) pctEl.textContent = '100%'
        },
        onComplete: () => {
          const el = document.getElementById('l-loader')
          if (el) el.style.display = 'none'
        },
      }, 2.0)

    // ══════════════════════════════════════════════════
    // HERO ENTRANCE (after loader)
    // ══════════════════════════════════════════════════
    const heroTl = gsap.timeline({ delay: 2.6 })
    heroTl
      .to('.l-hero-eyebrow',  { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
      .to('.l-hero-svg-wrap', { opacity: 1, duration: 0.5 }, '-=0.3')
      .to('.l-hero-title',    { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, '-=0.2')
      .to('.l-hero-sub',      { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.55')
      .to('.l-hero-ctas',     { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.45')
      .to('.l-scroll-hint',   { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('.l-hero-index',    { opacity: 1, duration: 0.5 }, '-=0.4')
      .to('.l-hero-social',   { opacity: 1, duration: 0.5 }, '-=0.4')

    // ══════════════════════════════════════════════════
    // FLOATING COLLAGE CARDS (hero)
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-float-card').forEach((el, i) => {
      // fade in
      gsap.to(el, {
        opacity: 1,
        duration: 0.9,
        delay: 2.9 + i * 0.18,
        ease: 'power2.out',
      })
      // continuous gentle float
      const baseRot = ['-4deg', '5deg', '3deg', '-5deg'][i] ?? '0deg'
      const baseRotNum = parseFloat(baseRot)
      gsap.to(el, {
        y: `${(i % 2 === 0 ? -1 : 1) * 16}`,
        rotation: baseRotNum + (i % 2 === 0 ? 2 : -2),
        duration: 3.2 + i * 0.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 3.1 + i * 0.22,
      })
    })

    // ══════════════════════════════════════════════════
    // PARALLAX on scroll — hero blobs
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-blob').forEach((el, i) => {
      gsap.to(el, {
        y: (i % 2 === 0 ? -1 : 1) * 80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.l-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    })

    // ══════════════════════════════════════════════════
    // ABOUT — image stack reveal
    // ══════════════════════════════════════════════════
    const aboutImgs = gsap.utils.toArray<HTMLElement>('.l-about-img')
    aboutImgs.forEach((el, i) => {
      const targets = [
        { x: 0, y: 0, rotation: -3 },
        { x: 0, y: 0, rotation:  4 },
        { x: 0, y: 0, rotation:  0 },
      ]
      gsap.to(el, {
        opacity: 1,
        x: targets[i]?.x ?? 0,
        y: targets[i]?.y ?? 0,
        rotation: targets[i]?.rotation ?? 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: i * 0.22,
        scrollTrigger: {
          trigger: '.l-about',
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      })
    })
    gsap.to('.l-about-content', {
      opacity: 1,
      x: 0,
      duration: 0.95,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.l-about-content', start: 'top 76%' },
    })

    // ══════════════════════════════════════════════════
    // CHARACTER ATTRS — bar fills
    // ══════════════════════════════════════════════════
    gsap.to('.l-char-left', {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.l-char-section', start: 'top 72%' },
    })
    gsap.to('.l-char-right', {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.15,
      scrollTrigger: { trigger: '.l-char-section', start: 'top 72%' },
    })
    ScrollTrigger.create({
      trigger: '.l-char-attrs',
      start: 'top 75%',
      onEnter: () => {
        document.querySelectorAll<HTMLElement>('.l-attr-bar-fill').forEach((bar) => {
          setTimeout(() => bar.classList.add('active'), 200)
        })
      },
    })

    // ══════════════════════════════════════════════════
    // GALLERY — stagger reveal
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-art-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: i * 0.07,
        scrollTrigger: {
          trigger: '.l-gallery-grid',
          start: 'top 76%',
          toggleActions: 'play none none none',
        },
      })
    })

    // ══════════════════════════════════════════════════
    // SCRAPBOOK — cards fan in
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-scrapbook-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        delay: i * 0.13,
        scrollTrigger: { trigger: '.l-scrapbook', start: 'top 74%' },
      })
      // subtle sway
      gsap.to(el, {
        rotate: `+=${(i % 2 === 0 ? 1.5 : -1.5)}`,
        duration: 3.5 + i * 0.4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 0.5 + i * 0.15,
      })
    })
    gsap.to('.l-scrapbook-content', {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.l-scrapbook-content', start: 'top 76%' },
    })

    // ══════════════════════════════════════════════════
    // EDITORIAL PANELS
    // ══════════════════════════════════════════════════
    gsap.to('.l-editorial-header', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.l-editorial', start: 'top 74%' },
    })
    gsap.utils.toArray<HTMLElement>('.l-editorial-panel').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: { trigger: '.l-editorial-grid', start: 'top 76%' },
      })
    })

    // ══════════════════════════════════════════════════
    // COMMISSION CARDS
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-comm-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: '.l-comm-grid', start: 'top 78%' },
      })
    })

    // ══════════════════════════════════════════════════
    // PROCESS STEPS
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-step').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 0.75, ease: 'power3.out',
        delay: i * 0.13,
        scrollTrigger: { trigger: '.l-steps', start: 'top 76%' },
      })
    })

    // ══════════════════════════════════════════════════
    // TESTIMONIALS
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-testimonial-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: { trigger: '.l-testimonials-grid', start: 'top 76%' },
      })
    })

    // ══════════════════════════════════════════════════
    // WORD-BY-WORD TEXT REVEAL (scrubbed)
    // ══════════════════════════════════════════════════
    const words = gsap.utils.toArray<HTMLElement>('.l-reveal-word')
    gsap.timeline({
      scrollTrigger: {
        trigger: '.l-reveal-section',
        start: 'top 65%',
        end: 'center 40%',
        scrub: 1.2,
      },
    }).to(words, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
    })
    gsap.to('.l-reveal-sig', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.l-reveal-section', start: 'center 55%' },
    })
    gsap.to('.l-reveal-side-labels', {
      opacity: 1, duration: 0.8,
      scrollTrigger: { trigger: '.l-reveal-section', start: 'top 65%' },
    })

    // ══════════════════════════════════════════════════
    // CONTACT
    // ══════════════════════════════════════════════════
    gsap.to('.l-contact-avatar', {
      opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: '.l-contact', start: 'top 74%' },
    })
    gsap.to('.l-contact-title', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1,
      scrollTrigger: { trigger: '.l-contact', start: 'top 74%' },
    })
    gsap.to('.l-contact-text', {
      opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: 0.2,
      scrollTrigger: { trigger: '.l-contact', start: 'top 74%' },
    })
    gsap.to('.l-socials', {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.3,
      scrollTrigger: { trigger: '.l-contact', start: 'top 74%' },
    })
    gsap.to('.l-contact-cta', {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.4,
      scrollTrigger: { trigger: '.l-contact', start: 'top 74%' },
    })

    // ══════════════════════════════════════════════════
    // NAV scroll state
    // ══════════════════════════════════════════════════
    ScrollTrigger.create({
      trigger: '.l-hero',
      start: 'bottom top',
      onEnter:     () => document.getElementById('l-nav')?.classList.add('scrolled'),
      onLeaveBack: () => document.getElementById('l-nav')?.classList.remove('scrolled'),
    })

    // ══════════════════════════════════════════════════
    // PARALLAX — about images subtle scroll
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-about-img').forEach((el, i) => {
      gsap.to(el, {
        y: (i % 2 === 0 ? -1 : 1) * 40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.l-about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
    })

    // ══════════════════════════════════════════════════
    // EDITORIAL SECTION — parallax on images
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.l-editorial-img-wrap img').forEach((el, i) => {
      gsap.to(el, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.l-editorial-panel') as Element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        },
      })
    })

  }, pageRef)

  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45 } },
  exit:    { opacity: 0, transition: { duration: 0.22 } },
}
