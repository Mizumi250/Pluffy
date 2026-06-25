// ============================================================
// ARKZEN GENERATED ANIMATIONS — lain098 [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T07:05:56.860Z
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
    const pctEl = document.getElementById('lain-loader-pct')
    const pctInterval = setInterval(() => {
      pct = Math.min(pct + Math.random() * 18, 98)
      if (pctEl) pctEl.textContent = `${Math.floor(pct)}%`
    }, 80)

    loaderTl
      .to('#lain-loader-name', { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0.15)
      .to('#lain-loader-sub',  { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.45)
      .to('#lain-loader-bar',  { width: '100%', duration: 1.5, ease: 'power2.inOut' }, 0.35)
      .to('#lain-loader', {
        opacity: 0,
        y: '-100%',
        duration: 0.9,
        ease: 'power3.inOut',
        onStart: () => {
          clearInterval(pctInterval)
          if (pctEl) pctEl.textContent = '100%'
        },
        onComplete: () => {
          const el = document.getElementById('lain-loader')
          if (el) el.style.display = 'none'
        },
      }, 2.0)

    // ══════════════════════════════════════════════════
    // HERO ENTRANCE (after loader)
    // ══════════════════════════════════════════════════
    const heroTl = gsap.timeline({ delay: 2.6 })
    heroTl
      .to('.lain-hero-eyebrow',  { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
      .to('.lain-hero-svg-wrap', { opacity: 1, duration: 0.5 }, '-=0.3')
      .to('.lain-hero-title',    { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, '-=0.2')
      .to('.lain-hero-sub',      { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.55')
      .to('.lain-hero-ctas',     { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.45')
      .to('.lain-scroll-hint',   { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('.lain-hero-index',    { opacity: 1, duration: 0.5 }, '-=0.4')
      .to('.lain-hero-social',   { opacity: 1, duration: 0.5 }, '-=0.4')

    // ══════════════════════════════════════════════════
    // FLOATING COLLAGE CARDS (hero)
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.lain-float-card').forEach((el, i) => {
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
    gsap.utils.toArray<HTMLElement>('.lain-blob').forEach((el, i) => {
      gsap.to(el, {
        y: (i % 2 === 0 ? -1 : 1) * 80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.lain-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    })

    // ══════════════════════════════════════════════════
    // ABOUT — image stack reveal
    // ══════════════════════════════════════════════════
    const aboutImgs = gsap.utils.toArray<HTMLElement>('.lain-about-img')
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
          trigger: '.lain-about',
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      })
    })
    gsap.to('.lain-about-content', {
      opacity: 1,
      x: 0,
      duration: 0.95,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.lain-about-content', start: 'top 76%' },
    })

    // ══════════════════════════════════════════════════
    // CHARACTER ATTRS — bar fills
    // ══════════════════════════════════════════════════
    gsap.to('.lain-char-left', {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.lain-char-section', start: 'top 72%' },
    })
    gsap.to('.lain-char-right', {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.15,
      scrollTrigger: { trigger: '.lain-char-section', start: 'top 72%' },
    })
    ScrollTrigger.create({
      trigger: '.lain-char-attrs',
      start: 'top 75%',
      onEnter: () => {
        document.querySelectorAll<HTMLElement>('.lain-attr-bar-fill').forEach((bar) => {
          setTimeout(() => bar.classList.add('active'), 200)
        })
      },
    })

    // ══════════════════════════════════════════════════
    // GALLERY — stagger reveal
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.lain-art-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: i * 0.07,
        scrollTrigger: {
          trigger: '.lain-gallery-grid',
          start: 'top 76%',
          toggleActions: 'play none none none',
        },
      })
    })

    // ══════════════════════════════════════════════════
    // SCRAPBOOK — cards fan in
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.lain-scrapbook-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        delay: i * 0.13,
        scrollTrigger: { trigger: '.lain-scrapbook', start: 'top 74%' },
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
    gsap.to('.lain-scrapbook-content', {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.lain-scrapbook-content', start: 'top 76%' },
    })

    // ══════════════════════════════════════════════════
    // EDITORIAL PANELS
    // ══════════════════════════════════════════════════
    gsap.to('.lain-editorial-header', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.lain-editorial', start: 'top 74%' },
    })
    gsap.utils.toArray<HTMLElement>('.lain-editorial-panel').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: { trigger: '.lain-editorial-grid', start: 'top 76%' },
      })
    })

    // ══════════════════════════════════════════════════
    // COMMISSION CARDS
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.lain-comm-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: '.lain-comm-grid', start: 'top 78%' },
      })
    })

    // ══════════════════════════════════════════════════
    // PROCESS STEPS
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.lain-step').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 0.75, ease: 'power3.out',
        delay: i * 0.13,
        scrollTrigger: { trigger: '.lain-steps', start: 'top 76%' },
      })
    })

    // ══════════════════════════════════════════════════
    // TESTIMONIALS
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.lain-testimonial-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: { trigger: '.lain-testimonials-grid', start: 'top 76%' },
      })
    })

    // ══════════════════════════════════════════════════
    // WORD-BY-WORD TEXT REVEAL (scrubbed)
    // ══════════════════════════════════════════════════
    const words = gsap.utils.toArray<HTMLElement>('.lain-reveal-word')
    gsap.timeline({
      scrollTrigger: {
        trigger: '.lain-reveal-section',
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
    gsap.to('.lain-reveal-sig', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.lain-reveal-section', start: 'center 55%' },
    })
    gsap.to('.lain-reveal-side-labels', {
      opacity: 1, duration: 0.8,
      scrollTrigger: { trigger: '.lain-reveal-section', start: 'top 65%' },
    })

    // ══════════════════════════════════════════════════
    // CONTACT
    // ══════════════════════════════════════════════════
    gsap.to('.lain-contact-avatar', {
      opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: '.lain-contact', start: 'top 74%' },
    })
    gsap.to('.lain-contact-title', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1,
      scrollTrigger: { trigger: '.lain-contact', start: 'top 74%' },
    })
    gsap.to('.lain-contact-text', {
      opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: 0.2,
      scrollTrigger: { trigger: '.lain-contact', start: 'top 74%' },
    })
    gsap.to('.lain-socials', {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.3,
      scrollTrigger: { trigger: '.lain-contact', start: 'top 74%' },
    })
    gsap.to('.lain-contact-cta', {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.4,
      scrollTrigger: { trigger: '.lain-contact', start: 'top 74%' },
    })

    // ══════════════════════════════════════════════════
    // NAV scroll state
    // ══════════════════════════════════════════════════
    ScrollTrigger.create({
      trigger: '.lain-hero',
      start: 'bottom top',
      onEnter:     () => document.getElementById('lain-nav')?.classList.add('scrolled'),
      onLeaveBack: () => document.getElementById('lain-nav')?.classList.remove('scrolled'),
    })

    // ══════════════════════════════════════════════════
    // PARALLAX — about images subtle scroll
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.lain-about-img').forEach((el, i) => {
      gsap.to(el, {
        y: (i % 2 === 0 ? -1 : 1) * 40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.lain-about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
    })

    // ══════════════════════════════════════════════════
    // EDITORIAL SECTION — parallax on images
    // ══════════════════════════════════════════════════
    gsap.utils.toArray<HTMLElement>('.lain-editorial-img-wrap img').forEach((el, i) => {
      gsap.to(el, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.lain-editorial-panel') as Element,
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
