// ============================================================
// ARKZEN GENERATED ANIMATIONS — pluffy-showcase
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:52.413Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

export const pluffyShowcaseAnimations = (pageRef: React.RefObject<HTMLDivElement | null>) => {
    const mm = gsap.matchMedia(pageRef.current ?? undefined)

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Intro: the panel cover lifts, the title letters rise out of their masks.
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo('.pf-cover', { scaleY: 1 }, { scaleY: 0, duration: 1.2, ease: 'power4.inOut' })
      .from('.pf-ch', { yPercent: 115, duration: 0.9, stagger: 0.045 }, 0.25)
      .from('.pf-in', { opacity: 0, y: 18, duration: 0.8, stagger: 0.1 }, 0.7)

    gsap.to('.pf-hero-img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.pf-hero', start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.pf-ghostkanji', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.pf-hero', start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.pf-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } })

    // One petal per column drifts down the whole page, swaying on its own clock.
    gsap.utils.toArray<HTMLElement>('.pf-petal').forEach((el, i) => {
      gsap.fromTo(el, { y: '-14vh' }, { y: `${112 + i * 3}vh`, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 + i * 0.35 } })
      gsap.to(el, { x: i % 2 ? 46 : -46, rotation: i % 2 ? 40 : -40, duration: 2.4 + i * 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    })

    gsap.utils.toArray<HTMLElement>('.pf-rv').forEach((el) => {
      gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } })
    })

    // Story: sticky stage, scrubbed timeline. The step text follows the scroll position.
    gsap.timeline({
      scrollTrigger: {
        trigger: '.pf-story', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const on = self.progress < 0.34 ? 0 : self.progress < 0.67 ? 1 : 2
          document.querySelectorAll('.pf-step').forEach((s, k) => s.classList.toggle('on', k === on))
        },
      },
    })
      .from('.pf-file', { y: 90, opacity: 0, duration: 1 })
      .from('.pf-tag', { opacity: 0.18, stagger: 0.15, duration: 0.3 }, 1.1)
      .from('.pf-bar', { scaleX: 0, opacity: 0, stagger: 0.35, duration: 0.7, ease: 'power2.out' }, 2.2)

    // Studio: the track slides sideways while the section scrolls down.
    const track = document.querySelector<HTMLElement>('.pf-track')
    if (track) {
      gsap.to(track, { x: () => -Math.max(0, track.scrollWidth - window.innerWidth), ease: 'none', scrollTrigger: { trigger: '.pf-studio', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } })
    }

    gsap.utils.toArray<HTMLElement>('.pf-count').forEach((el) => {
      const o = { v: 0 }
      gsap.to(o, { v: Number(el.dataset.to ?? 0), duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: () => { el.textContent = String(Math.round(o.v)) } })
    })

    gsap.to('.pf-marq-in', { xPercent: -50, duration: 42, ease: 'none', repeat: -1 })
    gsap.from('.pf-get-card', { y: 70, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.pf-get', start: 'top 85%', end: 'top 35%', scrub: true } })
  })

  return () => mm.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
} as const
