// ============================================================
// ARKZEN GENERATED ANIMATIONS — lain098 [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T01:16:58.251Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const lain098Animations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    // ── Loader entrance ────────────────────────────────────────────────────
    const loaderTl = gsap.timeline()
    loaderTl
      .to('#lain-loader-name', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.2)
      .to('#lain-loader-sub',  { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.5)
      .to('#lain-loader-bar',  { width: '100%', duration: 1.6, ease: 'power2.inOut' }, 0.4)
      .to('#lain-loader', {
        opacity: 0, y: '-100%', duration: 0.9, ease: 'power3.inOut',
        onComplete: () => {
          const el = document.getElementById('lain-loader')
          if (el) el.style.display = 'none'
        }
      }, 2.2)

    // ── Hero entrance (after loader) ───────────────────────────────────────
    gsap.timeline({ delay: 2.8 })
      .to('.lain-hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      .to('.lain-hero-svg-wrap', { opacity: 1, duration: 0.4 }, '-=0.3')
      .to('.lain-hero-title',   { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .to('.lain-hero-sub',     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .to('.lain-hero-ctas',    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .to('.lain-scroll-hint',  { opacity: 1, duration: 0.5 }, '-=0.2')

    // ── Floating art cards ─────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('.lain-float-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, duration: 0.8,
        delay: 3.0 + i * 0.15, ease: 'power2.out',
      })
      // continuous float
      gsap.to(el, {
        y: `${(i % 2 === 0 ? -1 : 1) * 14}`,
        rotation: parseFloat(el.style.transform?.match(/rotate\(([^)]+)\)/)?.[1] ?? '0') + (i % 2 === 0 ? 1 : -1.5),
        duration: 3.5 + i * 0.5,
        yoyo: true, repeat: -1,
        ease: 'sine.inOut',
        delay: 3.2 + i * 0.2,
      })
    })

    // ── About image stack ──────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('.lain-about-img').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        x: 0, y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.lain-about',
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
        delay: i * 0.18,
      })
    })

    // ── About content ──────────────────────────────────────────────────────
    gsap.to('.lain-about-content', {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.lain-about-content', start: 'top 75%' },
    })

    // ── Gallery cards stagger ──────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('.lain-art-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        delay: i * 0.07,
        scrollTrigger: { trigger: '.lain-gallery-grid', start: 'top 75%' },
      })
    })

    // ── Commission cards ───────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('.lain-comm-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        delay: i * 0.09,
        scrollTrigger: { trigger: '.lain-comm-grid', start: 'top 78%' },
      })
    })

    // ── Process steps ──────────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('.lain-step').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: { trigger: '.lain-steps', start: 'top 76%' },
      })
    })

    // ── Word-by-word text reveal (sky section) ─────────────────────────────
    gsap.utils.toArray<HTMLElement>('.lain-reveal-word').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
        delay: i * 0.06,
        scrollTrigger: { trigger: '.lain-reveal-section', start: 'top 68%' },
      })
    })

    // ── Contact avatar ─────────────────────────────────────────────────────
    gsap.to('.lain-contact-avatar', {
      opacity: 1, scale: 1, duration: 0.85, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.lain-contact', start: 'top 74%' },
    })

    // ── Nav scroll indicator ───────────────────────────────────────────────
    ScrollTrigger.create({
      trigger: '.lain-hero',
      start: 'bottom top',
      onEnter: () => document.getElementById('lain-nav')?.classList.add('scrolled'),
      onLeaveBack: () => document.getElementById('lain-nav')?.classList.remove('scrolled'),
    })

  }, pageRef)

  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45 } },
  exit:    { opacity: 0, transition: { duration: 0.22 } },
}
