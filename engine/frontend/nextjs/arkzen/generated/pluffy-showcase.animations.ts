// ============================================================
// ARKZEN GENERATED ANIMATIONS — pluffy-showcase
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:18:24.063Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

const PROMPT = 'A warung site with a menu page and a table booking form'

export const pluffyShowcaseAnimations = (pageRef: React.RefObject<HTMLDivElement | null>) => {
    const root = pageRef.current
  if (!root) return () => {}
  const stage = root.querySelector<HTMLElement>('.pf-stage')
  const win = root.querySelector<HTMLElement>('.pf-win')

  // The Studio window is drawn at 1120 by 690 and scaled to fit, so its layout never reflows.
  const fit = () => { if (stage && win) { win.style.setProperty('--s', String(stage.clientWidth / 1120)); stage.setAttribute('data-ready', '1') } }
  fit()
  const ro = new ResizeObserver(fit)
  if (stage) ro.observe(stage)
  const late = window.setTimeout(() => ScrollTrigger.refresh(), 900)

  const mm = gsap.matchMedia(root)
  const setActive = (which: 'home' | 'new') => {
    root.querySelector('.pf-nav-home')?.classList.toggle('on', which === 'home')
    root.querySelector('.pf-side-new')?.classList.toggle('on', which === 'new')
  }

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('.pf-v-home', { autoAlpha: 0 })
    gsap.set('.pf-v-ed, .pf-rail-i, .pf-code-l, .pf-t-l, .pf-side-new', { autoAlpha: 1 })
    gsap.set('.pf-dock', { y: 0 })
    setActive('new')
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.pf-stage', { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out' })

    // Hero: the Studio window runs by itself. Target points are measured from the real layout.
    if (win) {
      const k = win.getBoundingClientRect().width / 1120
      const at = (sel: string, fx = 0.5, fy = 0.5) => {
        const el = root.querySelector<HTMLElement>(sel)
        if (!el) return { x: 0, y: 0 }
        const r = el.getBoundingClientRect(), w = win.getBoundingClientRect()
        return { x: (r.left - w.left + r.width * fx) / k, y: (r.top - w.top + r.height * fy) / k }
      }
      const prompt = at('.pf-w-prompt', 0.3, 0.3), write = at('.pf-w-write'), check = at('.pf-w-check'), chev = at('.pf-w-chev'), home = at('.pf-nav-home', 0.4)
      const typed = root.querySelector<HTMLElement>('.pf-typed')
      const press = (sel: string) => gsap.to(sel, { scale: 0.93, duration: 0.1, yoyo: true, repeat: 1 })
      const o = { n: 0 }

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, defaults: { ease: 'power2.inOut' } })
      tl.set('.pf-v-home', { autoAlpha: 1 }, 0).set('.pf-v-ed, .pf-side-new', { autoAlpha: 0 }, 0)
        .set('.pf-rail-i, .pf-code-l, .pf-t-l', { autoAlpha: 0 }, 0).set('.pf-dock', { y: 212 }, 0)
        .set('.pf-cursor', { display: 'block', autoAlpha: 0, x: prompt.x + 160, y: prompt.y + 110 }, 0)
        .call(() => { if (typed) typed.textContent = ''; setActive('home') }, [], 0)
        .to('.pf-cursor', { autoAlpha: 1, x: prompt.x, y: prompt.y, duration: 0.9 }, 0.4)
        .fromTo(o, { n: 0 }, { n: PROMPT.length, duration: 2.4, ease: 'none', onUpdate: () => { if (typed) typed.textContent = PROMPT.slice(0, Math.round(o.n)) } }, 1.5)
        .to('.pf-cursor', { x: write.x, y: write.y, duration: 0.8 }, 4.2)
        .add(() => press('.pf-w-write'), 5.1)
        .to('.pf-v-home', { autoAlpha: 0, duration: 0.3 }, 5.4).to('.pf-v-ed', { autoAlpha: 1, duration: 0.3 }, 5.4)
        .call(() => setActive('new'), [], 5.4).to('.pf-side-new', { autoAlpha: 1, duration: 0.3 }, 5.4)
        .to('.pf-rail-i', { autoAlpha: 1, stagger: 0.16, duration: 0.25 }, 5.7)
        .to('.pf-code-l', { autoAlpha: 1, stagger: 0.15, duration: 0.15, ease: 'none' }, 5.8)
        .to('.pf-cursor', { x: check.x, y: check.y, duration: 0.8 }, 7.8)
        .add(() => press('.pf-w-check'), 8.7)
        .to('.pf-dock', { y: 0, duration: 0.55, ease: 'power3.out' }, 8.9)
        .to('.pf-t-l', { autoAlpha: 1, stagger: 0.45, duration: 0.2, ease: 'none' }, 9.5)
        .to('.pf-cursor', { x: chev.x, y: chev.y, duration: 0.8 }, 11.6)
        .add(() => press('.pf-w-chev'), 12.5)
        .to('.pf-dock', { y: 212, duration: 0.5 }, 12.7)
        .to('.pf-cursor', { x: home.x, y: home.y, duration: 0.8 }, 13.6)
        .to('.pf-v-ed', { autoAlpha: 0, duration: 0.3 }, 14.5).to('.pf-v-home', { autoAlpha: 1, duration: 0.3 }, 14.5)
        .call(() => { if (typed) typed.textContent = ''; setActive('home') }, [], 14.5)
        .to('.pf-cursor', { autoAlpha: 0, duration: 0.3 }, 14.8)
    }

    // Story: a sticky stage and one scrubbed timeline. The step text follows the scroll position.
    gsap.timeline({
      scrollTrigger: {
        trigger: '.pf-story', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const on = self.progress < 0.34 ? 0 : self.progress < 0.67 ? 1 : 2
          root.querySelectorAll('.pf-step').forEach((s, i) => s.classList.toggle('on', i === on))
        },
      },
    })
      .from('.pf-file', { y: 80, opacity: 0, duration: 1 })
      .from('.pf-tag', { opacity: 0.25, stagger: 0.15, duration: 0.3 }, 1.1)
      .from('.pf-bar', { scaleX: 0, opacity: 0, stagger: 0.35, duration: 0.7, ease: 'power2.out' }, 2.2)

    gsap.from('.pf-fig', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.pf-grid', start: 'top 80%', once: true } })
  })

  return () => { window.clearTimeout(late); ro.disconnect(); mm.revert() }
}

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
} as const
