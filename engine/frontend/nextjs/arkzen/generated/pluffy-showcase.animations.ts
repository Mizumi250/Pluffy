// ============================================================
// ARKZEN GENERATED ANIMATIONS — pluffy-showcase
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:24:16.260Z
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

const PROMPT = 'A warung site with a menu page and a table booking form'

export const pluffyShowcaseAnimations = (pageRef: React.RefObject<HTMLDivElement | null>) => {
    const root = pageRef.current
  if (!root) return () => {}

  // Each Studio window is drawn at 1120 by 690 and scaled to its stage, so its layout never reflows.
  const stages = Array.from(root.querySelectorAll<HTMLElement>('.pf-stage'))
  const fit = () => stages.forEach((st) => { st.querySelector<HTMLElement>('.pf-win')?.style.setProperty('--s', String(st.clientWidth / 1120)); st.setAttribute('data-ready', '1') })
  fit()
  const ro = new ResizeObserver(fit)
  stages.forEach((st) => ro.observe(st))
  const late = window.setTimeout(() => ScrollTrigger.refresh(), 900)

  const mm = gsap.matchMedia(root)
  const typeTo = (tl: gsap.core.Timeline, el: HTMLElement | undefined, at: number, dur: number) => {
    if (!el) return
    const full = el.dataset.t ?? '', o = { n: 0 }
    tl.fromTo(o, { n: 0 }, { n: full.length, duration: dur, ease: 'none', onUpdate: () => { el.textContent = full.slice(0, Math.round(o.n)) } }, at)
  }
  const press = (target: gsap.TweenTarget) => gsap.to(target, { scale: 0.93, duration: 0.1, yoyo: true, repeat: 1 })
  const tools = (win: HTMLElement) => {
    const q = gsap.utils.selector(win)
    const at = (sel: string, fx = 0.5, fy = 0.5) => {
      const el = win.querySelector<HTMLElement>(sel)
      if (!el) return { x: 0, y: 0 }
      const r = el.getBoundingClientRect(), w = win.getBoundingClientRect(), k = w.width / 1120
      return { x: (r.left - w.left + r.width * fx) / k, y: (r.top - w.top + r.height * fy) / k }
    }
    return { q, at }
  }
  const setActive = (win: HTMLElement, which: 'home' | 'new') => {
    win.querySelector('.pf-nav-home')?.classList.toggle('on', which === 'home')
    win.querySelector('.pf-side-new')?.classList.toggle('on', which === 'new')
  }

  mm.add('(prefers-reduced-motion: reduce)', () => {
    const hero = root.querySelector<HTMLElement>('#hero-win')
    if (hero) {
      const { q } = tools(hero)
      gsap.set(q('.pf-v-home'), { autoAlpha: 0 }); gsap.set(q('.pf-v-ed, .pf-rail-i, .pf-code-l, .pf-t-l, .pf-side-new'), { autoAlpha: 1 }); gsap.set(q('.pf-dock'), { y: 0 }); setActive(hero, 'new')
    }
    root.querySelectorAll<HTMLElement>('.pf-scene .pf-win').forEach((w) => { const { q } = tools(w); gsap.set(q('.pf-to, .pf-rail-x, .pf-ex-cmd .x'), { autoAlpha: 1 }); q('.pf-tx').forEach((t) => { (t as HTMLElement).textContent = (t as HTMLElement).dataset.t ?? '' }); gsap.set(q('.pf-dock'), { y: 0 }) })
    gsap.set('.pf-rl, .pf-rc-blk', { autoAlpha: 1 }); gsap.set('.pf-rc-cover', { autoAlpha: 0 })
    root.querySelectorAll('.pf-cs span').forEach((s, i, all) => s.classList.toggle('on', i === all.length - 1))
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Hero: the Studio window runs by itself, and pauses when it is off screen.
    const hero = root.querySelector<HTMLElement>('#hero-win')
    if (hero) {
      const { q, at } = tools(hero)
      const prompt = at('.pf-w-prompt', 0.3, 0.3), write = at('.pf-w-write'), check = at('.pf-w-check'), chev = at('.pf-w-chev'), home = at('.pf-nav-home', 0.4)
      const typed = hero.querySelector<HTMLElement>('.pf-typed')
      const o = { n: 0 }
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, defaults: { ease: 'power2.inOut' } })
      tl.set(q('.pf-v-home'), { autoAlpha: 1 }, 0).set(q('.pf-v-ed, .pf-side-new'), { autoAlpha: 0 }, 0)
        .set(q('.pf-rail-i, .pf-code-l, .pf-t-l'), { autoAlpha: 0 }, 0).set(q('.pf-dock'), { y: 212 }, 0)
        .set(q('.pf-cursor'), { display: 'block', autoAlpha: 0, x: prompt.x + 160, y: prompt.y + 110 }, 0)
        .call(() => { if (typed) typed.textContent = ''; setActive(hero, 'home') }, [], 0)
        .to(q('.pf-cursor'), { autoAlpha: 1, x: prompt.x, y: prompt.y, duration: 0.9 }, 0.4)
        .fromTo(o, { n: 0 }, { n: PROMPT.length, duration: 2.4, ease: 'none', onUpdate: () => { if (typed) typed.textContent = PROMPT.slice(0, Math.round(o.n)) } }, 1.5)
        .to(q('.pf-cursor'), { x: write.x, y: write.y, duration: 0.8 }, 4.2)
        .add(() => press(q('.pf-w-write')), 5.1)
        .to(q('.pf-v-home'), { autoAlpha: 0, duration: 0.3 }, 5.4).to(q('.pf-v-ed'), { autoAlpha: 1, duration: 0.3 }, 5.4)
        .call(() => setActive(hero, 'new'), [], 5.4).to(q('.pf-side-new'), { autoAlpha: 1, duration: 0.3 }, 5.4)
        .to(q('.pf-rail-i'), { autoAlpha: 1, stagger: 0.16, duration: 0.25 }, 5.7)
        .to(q('.pf-code-l'), { autoAlpha: 1, stagger: 0.15, duration: 0.15, ease: 'none' }, 5.8)
        .to(q('.pf-cursor'), { x: check.x, y: check.y, duration: 0.8 }, 7.8)
        .add(() => press(q('.pf-w-check')), 8.7)
        .to(q('.pf-dock'), { y: 0, duration: 0.55, ease: 'power3.out' }, 8.9)
        .to(q('.pf-t-l'), { autoAlpha: 1, stagger: 0.45, duration: 0.2, ease: 'none' }, 9.5)
        .to(q('.pf-cursor'), { x: chev.x, y: chev.y, duration: 0.8 }, 11.6)
        .add(() => press(q('.pf-w-chev')), 12.5)
        .to(q('.pf-dock'), { y: 212, duration: 0.5 }, 12.7)
        .to(q('.pf-cursor'), { x: home.x, y: home.y, duration: 0.8 }, 13.6)
        .to(q('.pf-v-ed'), { autoAlpha: 0, duration: 0.3 }, 14.5).to(q('.pf-v-home'), { autoAlpha: 1, duration: 0.3 }, 14.5)
        .call(() => { if (typed) typed.textContent = ''; setActive(hero, 'home') }, [], 14.5)
        .to(q('.pf-cursor'), { autoAlpha: 0, duration: 0.3 }, 14.8)
      ScrollTrigger.create({ trigger: '#hero-win', start: 'top bottom', end: 'bottom top', onToggle: (s) => tl.paused(!s.isActive) })
    }
    gsap.from('#hero-win', { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out' })

    // Scenes: a sticky stage, and a timeline the scroll position drives. The caption follows the scroll.
    const scene = (id: string, build: (tl: gsap.core.Timeline, q: ReturnType<typeof gsap.utils.selector>, at: ReturnType<typeof tools>['at']) => void) => {
      const sec = root.querySelector<HTMLElement>('#scene-' + id)
      const win = sec?.querySelector<HTMLElement>('.pf-win') ?? sec
      if (!sec || !win) return
      const { q, at } = tools(win)
      const caps = Array.from(sec.querySelectorAll('.pf-cs span'))
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (s) => { const i = Math.min(caps.length - 1, Math.floor(s.progress * caps.length)); caps.forEach((c, j) => c.classList.toggle('on', j === i)) },
        },
      })
      build(tl, q, at)
    }

    scene('a', (tl, q, at) => {
      const add = at('.pf-w-add'), srch = at('.pf-ab-s', 0.3), crud = at('.pf-ab-crud', 0.4), go = at('.pf-ab-go'), cur = q('.pf-cursor')
      tl.set(cur, { display: 'block', autoAlpha: 0, x: add.x + 140, y: add.y + 120 }, 0)
        .to(cur, { autoAlpha: 1, x: add.x, y: add.y, duration: 0.8 }, 0.2)
        .add(() => press(q('.pf-w-add')), 1.05)
        .to(q('.pf-modal'), { autoAlpha: 1, duration: 0.4 }, 1.25)
        .to(cur, { x: srch.x, y: srch.y, duration: 0.7 }, 1.7)
      typeTo(tl, q('.pf-ab-ty')[0] as HTMLElement, 2.5, 1)
      tl.to(cur, { x: crud.x, y: crud.y, duration: 0.7 }, 3.7)
        .to(q('.pf-sel'), { autoAlpha: 1, duration: 0.2 }, 4.4)
        .to(q('.pf-ab-ph'), { autoAlpha: 0, duration: 0.2 }, 4.4).to(q('.pf-ab-d'), { autoAlpha: 1, duration: 0.3 }, 4.6)
        .to(cur, { x: go.x, y: go.y, duration: 0.7 }, 5.2)
        .add(() => press(q('.pf-ab-go')), 5.95)
        .to(q('.pf-modal'), { autoAlpha: 0, duration: 0.35 }, 6.3)
        .to(q('.pf-rail-x'), { autoAlpha: 1, stagger: 0.25, duration: 0.3 }, 6.6)
        .to(cur, { autoAlpha: 0, duration: 0.3 }, 7.2).to({}, { duration: 0.8 }, 7.6)
    })

    scene('b', (tl, q) => {
      const tx = q('.pf-tx') as HTMLElement[]
      const out = (g: number) => q('.pf-to[data-g="' + g + '"]')
      typeTo(tl, tx[0], 0.3, 1.2); tl.to(out(0), { autoAlpha: 1, duration: 0.2, ease: 'none' }, 1.7)
      typeTo(tl, tx[1], 2.6, 1.2); tl.to(out(1), { autoAlpha: 1, stagger: 0.25, duration: 0.2, ease: 'none' }, 4.0)
      typeTo(tl, tx[2], 5.0, 0.9); tl.to(out(2), { autoAlpha: 1, stagger: 0.18, duration: 0.2, ease: 'none' }, 6.0).to({}, { duration: 1 }, 7.3)
    })

    scene('c', (tl, q, at) => {
      const ex = at('.pf-w-export'), d = at('.pf-cb-d', 0.1), ap = at('.pf-cb-o', 0.1), run = at('.pf-ex-run'), cur = q('.pf-cursor')
      tl.set(cur, { display: 'block', autoAlpha: 0, x: ex.x + 140, y: ex.y + 120 }, 0)
        .to(cur, { autoAlpha: 1, x: ex.x, y: ex.y, duration: 0.8 }, 0.2)
        .add(() => press(q('.pf-w-export')), 1.05)
        .to(q('.pf-modal'), { autoAlpha: 1, duration: 0.4 }, 1.25)
        .to(cur, { x: d.x, y: d.y, duration: 0.8 }, 1.8)
        .to(q('.pf-cb-d i'), { scale: 1, duration: 0.25, ease: 'back.out(2)' }, 2.7).to(q('.x-d'), { autoAlpha: 1, duration: 0.2 }, 2.8)
        .to(cur, { x: ap.x, y: ap.y, duration: 0.7 }, 3.4)
        .to(q('.pf-cb-o i'), { scale: 1, duration: 0.25, ease: 'back.out(2)' }, 4.2).to(q('.x-o'), { autoAlpha: 1, duration: 0.2 }, 4.3)
        .to(cur, { x: run.x, y: run.y, duration: 0.7 }, 4.9)
        .add(() => press(q('.pf-ex-run')), 5.65)
        .to(q('.pf-modal'), { autoAlpha: 0, duration: 0.35 }, 6.0)
        .to(q('.pf-dock'), { y: 0, duration: 0.55, ease: 'power3.out' }, 6.3)
        .to(cur, { autoAlpha: 0, duration: 0.3 }, 6.4)
      typeTo(tl, q('.pf-tx')[0] as HTMLElement, 7.0, 1.6)
      tl.to({}, { duration: 0.8 }, 8.6)
    })

    // Real app: Kairo's own file builds up on the left, then the site it made is revealed on the right.
    scene('r', (tl, q) => {
      tl.from(q('.pf-rl'), { autoAlpha: 0, stagger: 0.12, duration: 0.2, ease: 'none' }, 0.2)
        .from(q('.pf-rc-blk'), { autoAlpha: 0, y: 8, stagger: 0.2, duration: 0.3 }, 2.2)
        .to(q('.pf-rc-cover'), { scaleY: 0, duration: 1.4, ease: 'power3.inOut' }, 4.0).to({}, { duration: 1 }, 5.8)
    })

    // Platforms and roadmap rows arrive as they are reached.
    gsap.utils.toArray<HTMLElement>('.pf-plat-row, .pf-plan').forEach((el) => {
      gsap.from(el, { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
    })
    gsap.from('.pf-fig', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.pf-grid', start: 'top 80%', once: true } })
  })

  return () => { window.clearTimeout(late); ro.disconnect(); mm.revert() }
}

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
} as const
