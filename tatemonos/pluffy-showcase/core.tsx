/* @arkzen:meta
name: pluffy-showcase
version: 1.0.0
description: Static portfolio site that tells the story of Pluffy and Pluffy Studio and links the v1.0.6 download
auth: false
*/

/* @arkzen:meta:web
title: Pluffy | One file in, a whole building out
label: Pluffy
description: Pluffy turns one core.tsx into a database, backend, web pages, mobile screens and a desktop shell. Download Pluffy Studio for Windows.
favicon: /tatemonos/pluffy-showcase/assets/images/favicon.svg
og:
  title: Pluffy | One file in, a whole building out
  description: A single tatemono grows into a complete app. Meet Pluffy Studio.
  image: /tatemonos/pluffy-showcase/assets/images/studio-home.webp
  type: website
twitter:
  card: summary_large_image
  title: Pluffy | One file in, a whole building out
  description: A single tatemono grows into a complete app. Meet Pluffy Studio.
  image: /tatemonos/pluffy-showcase/assets/images/studio-home.webp
*/

/* @arkzen:web:style */
:root { --r50:#fff4f6; --r100:#ffe4ea; --r200:#ffcdd8; --r300:#fbb0c1; --r500:#ef7d99; --wine:#8e1f44; --wine-d:#561030; --ink:#35212a; --mut:#7a5a66; --sheet:#fffafb; }
.pf-root { font-family:'Zen Maru Gothic',sans-serif; font-size:17px; line-height:1.75; color:var(--ink); background:var(--r100); overflow-x:clip; }
.pf-root * { box-sizing:border-box; }
.pf-root h1, .pf-root h2, .pf-root h3, .pf-root p { margin:0; }
.pf-root a { color:inherit; }
.pf-caps { font-family:'Jost',sans-serif; text-transform:uppercase; letter-spacing:.32em; }
.pf-jp { font-family:'Shippori Mincho',serif; }
.pf-progress { position:fixed; top:0; left:0; right:0; height:3px; background:var(--wine); transform:scaleX(0); transform-origin:0 50%; z-index:70; }
.pf-petals { position:fixed; inset:0; pointer-events:none; overflow:hidden; z-index:40; }
.pf-petal { position:absolute; top:0; color:var(--r300); opacity:.8; }
.pf-nav { position:fixed; top:16px; left:24px; right:24px; z-index:60; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:8px 10px 8px 18px; border-radius:999px; background:rgba(255,250,251,.86); backdrop-filter:blur(10px); font-size:15px; }
.pf-brand { display:flex; align-items:center; gap:10px; font-weight:700; text-decoration:none; }
.pf-brand svg { width:22px; height:22px; color:var(--wine); }
.pf-links { display:flex; align-items:center; gap:22px; }
.pf-links a { text-decoration:none; color:var(--mut); }
.pf-links a:hover, .pf-links a:focus-visible { color:var(--wine); }
.pf-btn { display:inline-flex; align-items:center; gap:10px; padding:13px 26px; border-radius:999px; border:1.5px solid var(--wine); font:700 15px 'Zen Maru Gothic',sans-serif; text-decoration:none; cursor:pointer; transition:transform .25s ease, background-color .25s ease; }
.pf-btn:hover, .pf-btn:focus-visible { transform:translateY(-3px); }
.pf-btn:focus-visible, .pf-links a:focus-visible { outline:2px solid var(--wine); outline-offset:3px; }
.pf-main { background:var(--wine); color:var(--r50) !important; }
.pf-main:hover, .pf-main:focus-visible { background:var(--wine-d); }
.pf-ghost { background:transparent; color:var(--wine) !important; }
.pf-ghost:hover, .pf-ghost:focus-visible { background:var(--r200); }
.pf-sm { padding:9px 20px; }
.pf-hero { padding:20px; }
.pf-sheet { position:relative; min-height:calc(100vh - 40px); background:var(--sheet); box-shadow:0 40px 70px -40px rgba(142,31,68,.35); overflow:hidden; display:grid; grid-template-columns:1fr minmax(280px,33%) 96px; }
.pf-badge { position:absolute; top:38px; left:40px; display:flex; align-items:center; gap:14px; font-size:11px; color:var(--wine); }
.pf-badge i { width:40px; height:40px; border-radius:50%; background:var(--wine); color:var(--r50); display:grid; place-items:center; font:400 18px 'Shippori Mincho',serif; font-style:normal; }
.pf-vert { position:absolute; left:44px; top:50%; transform:translateY(-50%); writing-mode:vertical-rl; color:var(--wine); letter-spacing:.3em; font-size:15px; }
.pf-ghostkanji { position:absolute; left:16%; top:50%; transform:translateY(-52%); font:400 clamp(11rem,24vw,24rem)/1 'Shippori Mincho',serif; color:var(--r100); pointer-events:none; user-select:none; }
.pf-copy { grid-column:1; align-self:center; padding:0 0 0 17%; position:relative; z-index:3; }
.pf-title { font:500 clamp(2rem,5.4vw,5rem)/1.25 'Jost',sans-serif; letter-spacing:.3em; color:var(--wine); text-transform:uppercase; margin-bottom:18px !important; }
.pf-ch-w { display:inline-block; overflow:hidden; vertical-align:top; }
.pf-ch { display:inline-block; }
.pf-rule { width:78px; height:3px; background:var(--wine); margin:6px 0 24px; }
.pf-lead { max-width:46ch; color:var(--mut); margin-bottom:28px !important; }
.pf-cta { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:14px; }
.pf-fine { font-size:14px; color:var(--mut); }
.pf-panel { grid-column:2; margin:0 0 0 -4%; position:relative; background:var(--r200); overflow:hidden; }
.pf-hero-img { position:absolute; left:0; top:-6%; width:auto; height:112%; max-width:none; object-fit:cover; }
.pf-cover { position:absolute; inset:0; background:var(--r300); transform-origin:50% 0; z-index:2; }
.pf-count-side { grid-column:3; position:relative; }
.pf-count-side span { position:absolute; right:42px; top:50%; transform:translateY(-50%) rotate(90deg); font-size:10px; color:var(--wine); white-space:nowrap; }
.pf-count-side::before { content:''; position:absolute; left:50%; top:16%; bottom:16%; width:1px; background:var(--r300); }
.pf-kick { font-size:12px; color:var(--wine); margin-bottom:16px !important; }
.pf-h2 { font:500 clamp(1.9rem,4vw,3.3rem)/1.25 'Jost',sans-serif; letter-spacing:.08em; color:var(--wine); }
.pf-story { height:340vh; background:var(--r50); position:relative; }
.pf-stick { position:sticky; top:0; height:100vh; display:grid; grid-template-columns:1fr 1.1fr; gap:5vw; align-items:center; padding:0 7vw; }
.pf-steps { list-style:none; margin:30px 0 0; padding:0; display:grid; gap:20px; }
.pf-step { padding-left:20px; border-left:3px solid var(--r200); opacity:.38; transition:opacity .4s ease, border-color .4s ease; }
.pf-step.on { opacity:1; border-color:var(--wine); }
.pf-step b { display:block; font:500 14px 'Jost',sans-serif; letter-spacing:.24em; text-transform:uppercase; color:var(--wine); }
.pf-file { background:var(--sheet); border-radius:10px; box-shadow:0 40px 70px -40px rgba(142,31,68,.4); padding:18px 20px 22px; }
.pf-file-top { display:flex; align-items:center; gap:7px; margin-bottom:12px; font:500 12px 'Jost',sans-serif; letter-spacing:.2em; color:var(--mut); }
.pf-file-top i { width:10px; height:10px; border-radius:50%; background:var(--r300); }
.pf-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:14px; align-items:center; padding:9px 0; border-top:1px solid var(--r100); }
.pf-tag { font:500 13px/1.4 ui-monospace,Consolas,monospace; color:var(--wine); overflow-wrap:anywhere; }
.pf-bar { display:block; padding:9px 14px; background:var(--r200); border-radius:6px; transform-origin:0 50%; font-size:14px; line-height:1.4; }
.pf-bar b { display:block; color:var(--wine-d); }
.pf-bar i { font-style:normal; color:var(--mut); font-size:13px; }
.pf-studio { height:380vh; background:var(--r200); position:relative; }
.pf-hstick { position:sticky; top:0; height:100vh; overflow:hidden; display:flex; flex-direction:column; justify-content:center; gap:28px; }
.pf-hhead { padding:0 7vw; }
.pf-track { display:flex; gap:32px; padding:0 7vw; width:max-content; }
.pf-card { position:relative; flex:0 0 auto; width:min(64vw,880px); background:var(--sheet); box-shadow:0 40px 60px -36px rgba(142,31,68,.4); display:grid; grid-template-columns:96px 1fr; overflow:hidden; }
.pf-num { padding:24px 0 0 26px; font:400 26px/1.15 'Jost',sans-serif; color:var(--ink); }
.pf-num small { display:block; width:30px; height:1px; background:var(--ink); margin:12px 0; }
.pf-num em { display:block; margin-top:60px; font:italic 400 15px 'Zen Maru Gothic',sans-serif; color:var(--mut); letter-spacing:.02em; width:110px; }
.pf-shot { position:relative; margin:18px 18px 18px 0; aspect-ratio:16/10; overflow:hidden; background:var(--r100); }
.pf-shot img { width:100%; height:100%; object-fit:cover; display:block; }
.pf-vellum { position:absolute; top:0; bottom:0; right:9%; width:15%; background:rgba(255,250,251,.62); backdrop-filter:blur(3px); display:flex; justify-content:center; padding-top:20px; }
.pf-vellum span { writing-mode:vertical-rl; letter-spacing:.34em; color:var(--ink); font-size:15px; }
.pf-numbers { padding:16vh 7vw; background:var(--sheet); }
.pf-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:3vw; margin-top:56px; }
.pf-stat { border-top:3px solid var(--wine); padding-top:18px; }
.pf-stat strong { display:block; font:500 clamp(3rem,6vw,5.4rem)/1 'Jost',sans-serif; color:var(--wine); }
.pf-stat b { display:block; margin:8px 0 4px; }
.pf-stat span { color:var(--mut); font-size:15px; }
.pf-built { padding:16vh 7vw 10vh; background:var(--r100); }
.pf-grid { display:grid; grid-template-columns:1.25fr 1fr 1.25fr; gap:3vw; margin-top:56px; align-items:start; }
.pf-grid article:nth-child(2) { margin-top:9vh; }
.pf-pic { position:relative; background:var(--sheet); padding:14px; box-shadow:0 40px 60px -40px rgba(142,31,68,.4); }
.pf-pic img { width:100%; display:block; }
.pf-pic .pf-vellum { right:12%; width:22%; }
.pf-cap { margin-top:14px; font-size:15px; color:var(--mut); }
.pf-cap b { color:var(--ink); font-family:'Jost',sans-serif; letter-spacing:.18em; text-transform:uppercase; font-size:13px; margin-right:8px; }
.pf-marq { overflow:hidden; margin-top:9vh; border-block:1px solid var(--r300); padding:14px 0; }
.pf-marq-in { display:flex; width:max-content; }
.pf-marq-in span { padding-right:44px; font:500 22px 'Jost',sans-serif; letter-spacing:.24em; text-transform:uppercase; color:var(--wine); white-space:nowrap; }
.pf-get { background:var(--wine); color:var(--r50); padding:16vh 7vw; position:relative; }
.pf-get .pf-h2 { color:var(--r50); }
.pf-get .pf-kick { color:var(--r300); }
.pf-get-card { display:grid; grid-template-columns:1.1fr 1fr; gap:5vw; align-items:center; }
.pf-get-steps { margin:26px 0 30px; padding:0; list-style:none; display:grid; gap:14px; counter-reset:s; }
.pf-get-steps li { counter-increment:s; padding-left:44px; position:relative; color:var(--r100); }
.pf-get-steps li::before { content:'0' counter(s); position:absolute; left:0; top:0; font:500 15px 'Jost',sans-serif; letter-spacing:.14em; color:var(--r300); }
.pf-get .pf-main { background:var(--r100); color:var(--wine-d) !important; border-color:var(--r100); }
.pf-get .pf-main:hover, .pf-get .pf-main:focus-visible { background:var(--r200); }
.pf-get .pf-ghost { color:var(--r100) !important; border-color:var(--r300); }
.pf-get .pf-ghost:hover, .pf-get .pf-ghost:focus-visible { background:var(--wine-d); }
.pf-clone { margin-top:22px; display:flex; align-items:center; gap:12px; padding:12px 16px; background:var(--wine-d); border-radius:8px; font:500 14px ui-monospace,Consolas,monospace; color:var(--r100); overflow-wrap:anywhere; }
.pf-get-img img { width:100%; display:block; border-radius:8px; box-shadow:0 40px 70px -30px rgba(0,0,0,.45); }
.pf-foot { background:var(--wine-d); color:var(--r200); padding:36px 7vw; display:flex; flex-wrap:wrap; gap:14px 36px; justify-content:space-between; font-size:15px; }
.pf-foot a { text-decoration:none; }
.pf-foot a:hover, .pf-foot a:focus-visible { color:var(--r50); text-decoration:underline; }
.pf-toast { position:fixed; left:50%; bottom:26px; transform:translateX(-50%) translateY(24px); opacity:0; background:var(--ink); color:var(--r50); padding:12px 22px; border-radius:999px; font-size:15px; z-index:80; transition:transform .35s ease, opacity .35s ease; pointer-events:none; max-width:92vw; }
.pf-toast.on { transform:translateX(-50%) translateY(0); opacity:1; }
@media (max-width:860px) {
  .pf-links a:not(.pf-btn) { display:none; }
  .pf-sheet { grid-template-columns:1fr; grid-template-rows:auto 320px; min-height:auto; padding-top:100px; }
  .pf-copy { padding:0 28px 36px 64px; }
  .pf-panel { grid-column:1; margin:0; }
  .pf-count-side, .pf-ghostkanji { display:none; }
  .pf-badge { left:24px; } .pf-vert { left:22px; top:58%; font-size:13px; }
  .pf-stick, .pf-get-card { grid-template-columns:1fr; }
  .pf-stick { gap:20px; align-content:center; padding:0 22px; }
  .pf-steps { display:none; }
  .pf-card { width:84vw; grid-template-columns:1fr; } .pf-num { display:none; }
  .pf-shot { margin:14px; }
  .pf-stats, .pf-grid { grid-template-columns:1fr 1fr; }
  .pf-grid article:nth-child(2) { margin-top:0; }
}
@media (max-width:560px) { .pf-stats, .pf-grid { grid-template-columns:1fr; } .pf-row { grid-template-columns:1fr; gap:6px; } }
@media (prefers-reduced-motion: reduce) { .pf-btn, .pf-step, .pf-toast { transition:none; } .pf-petals { display:none; } }
/* @arkzen:web:style:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'

export const REPO_URL = 'https://github.com/Mizumi250/Pluffy'
export const RELEASE_URL = 'https://github.com/Mizumi250/Pluffy/releases/tag/v1.0.6'
export const DOWNLOAD_URL = 'https://github.com/Mizumi250/Pluffy/releases/download/v1.0.6/PluffyStudio-win-x64.zip'
export const CLONE_CMD = 'git clone https://github.com/Mizumi250/Pluffy.git'
export const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500&family=Shippori+Mincho:wght@400&family=Zen+Maru+Gothic:wght@400;700&display=swap'

const PETAL_PATH = 'M0 -2.5 C -6.5 -7 -6.5 -13 -3 -14.5 L 0 -12 L 3 -14.5 C 6.5 -13 6.5 -7 0 -2.5 Z'

export const Petal = ({ i }: { i: number }) => (
  <svg className="pf-petal" viewBox="-8 -16 16 16" style={{ left: `${(i * 13 + 6) % 92}%`, width: 14 + (i % 3) * 9 }} aria-hidden="true">
    <path d={PETAL_PATH} fill="currentColor" />
  </svg>
)

export const Mark = () => (
  <svg viewBox="-16 -16 32 32" aria-hidden="true">
    <g fill="currentColor">
      {[0, 72, 144, 216, 288].map((a) => <path key={a} d={PETAL_PATH} transform={`rotate(${a})`} />)}
    </g>
  </svg>
)

export const Letters = ({ text }: { text: string }) => (
  <>
    {text.split('').map((c, k) => (
      <span key={k} className="pf-ch-w"><span className="pf-ch">{c === ' ' ? '\u00a0' : c}</span></span>
    ))}
  </>
)

/* @arkzen:web:components:shared:end */

/* @arkzen:web:animation */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const pluffyShowcaseAnimations = (pageRef: React.RefObject<HTMLDivElement | null>) => {
  gsap.registerPlugin(ScrollTrigger)
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
}

/* @arkzen:web:animation:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONTS_URL
    document.head.appendChild(link)
    return () => { link.remove() }
  }, [])

  useEffect(() => {
    // Fonts shift the layout once, so measure again after they land.
    const cleanup = pluffyShowcaseAnimations(pageRef)
    const late = window.setTimeout(() => ScrollTrigger.refresh(), 900)
    return () => { window.clearTimeout(late); cleanup() }
  }, [])

  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3800) }
  const copyClone = async (m: string) => {
    try { await navigator.clipboard.writeText(CLONE_CMD); say(m) }
    catch { say('Could not copy. Run: ' + CLONE_CMD) }
  }
  const IMG = '/tatemonos/pluffy-showcase/assets/images/'

  const stats = [
    { to: 7, t: 'Backends', d: 'Laravel, Express, FastAPI, Spring Boot, ASP.NET, Go and Rust' },
    { to: 3, t: 'Stacks at once', d: 'Web, app and desktop built from the same file' },
    { to: 66, t: 'Tatemonos in the repo', d: 'Cafes, a payroll system, a language app and more' },
    { to: 3, t: 'Game targets', d: 'Godot 4, Unity and Unreal Engine' },
  ]
  const shots = [
    { k: 'studio-home', n: '01', jp: 'ホーム', c: 'Describe an app, or type / for commands.' },
    { k: 'studio-editor', n: '02', jp: 'エディタ', c: 'core.tsx opens with its blocks in a rail.' },
    { k: 'studio-new', n: '03', jp: '新規', c: 'Start from a template: web, crud, auth, native.' },
    { k: 'studio-home-dark', n: '04', jp: '夜', c: 'A dark room for late builds.' },
  ]
  const built = [
    { k: 'built-kairo', n: 'Kairo', s: 'Next.js', jp: '海路' },
    { k: 'built-kotoba', n: 'Kotoba', s: 'Next.js, language app', jp: '言葉' },
    { k: 'built-rubik', n: 'Rubik Solver', s: 'React and Vite', jp: '立方' },
  ]
  const names = ['kairo', 'kotoba', 'cafe-teresita', 'rubik-solver', 'shan-shan', 'ethereane', 'jo-payroll', 'queue-flow', 'dtr-geofencing', 'ollama-studio', 'godot-sky-islands', 'unreal-sky-garden', 'mobile-sdui', 'asset-hub']

  return (
    <div ref={pageRef} className="pf-root">
      <div className="pf-progress" aria-hidden="true" />
      <div className="pf-petals" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6].map((i) => <Petal key={i} i={i} />)}</div>

      <header className="pf-nav">
        <a className="pf-brand" href="#top"><Mark />Pluffy</a>
        <nav className="pf-links" aria-label="Sections">
          <a href="#story">Story</a><a href="#studio">Studio</a><a href="#built">Built with it</a>
          <a className="pf-btn pf-main pf-sm" href="#download">Download</a>
        </nav>
      </header>

      <section className="pf-hero" id="top">
        <div className="pf-sheet">
          <div className="pf-badge pf-caps"><i className="pf-jp">建</i><span>Pluffy<br />Studio</span></div>
          <div className="pf-vert pf-jp" aria-hidden="true">一つのファイル × 建物</div>
          <div className="pf-ghostkanji" aria-hidden="true">建</div>
          <div className="pf-copy">
            <h1 className="pf-title"><Letters text="ONE FILE" /><br /><Letters text="A BUILDING" /></h1>
            <div className="pf-rule pf-in" />
            <p className="pf-lead pf-in">Pluffy turns a single core.tsx, called a tatemono, into a database, a backend, web pages, mobile screens and a desktop shell. Studio is the quiet place to write it.</p>
            <div className="pf-cta pf-in">
              <a className="pf-btn pf-main" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}>Download Studio v1.0.6</a>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}>Clone the repo</button>
            </div>
            <p className="pf-fine pf-in">Windows x64, about 246 MB, unzip and run. Not code signed yet.</p>
          </div>
          <div className="pf-panel">
            <img className="pf-hero-img" src={IMG + 'studio-editor.webp'} alt="Pluffy Studio editing the portfolio-test tatemono" />
            <div className="pf-cover" />
          </div>
          <div className="pf-count-side"><span className="pf-caps">01 / 05 &nbsp; scroll</span></div>
        </div>
      </section>

      <section className="pf-story" id="story">
        <div className="pf-stick">
          <div>
            <p className="pf-kick pf-caps">Story / one</p>
            <h2 className="pf-h2">Write the plan once. Watch the floors rise.</h2>
            <ol className="pf-steps">
              <li className="pf-step on"><b>One file</b>A tatemono is a single core.tsx. Tables, API, login, pages and the look all sit in tagged blocks.</li>
              <li className="pf-step"><b>Studio reads it</b>Blocks line up in a side rail. Check lints the file without starting the engine.</li>
              <li className="pf-step"><b>The engine builds</b>Save, and it rebuilds the database, backend, web, mobile and desktop around your file.</li>
            </ol>
          </div>
          <div className="pf-file" aria-label="Sample tatemono blocks and what each one builds">
            <div className="pf-file-top"><i /><i /><i />&nbsp;core.tsx, sample blocks</div>
            {[
              ['@arkzen:database:lessons', 'Database', 'SQLite or PostgreSQL'],
              ['@arkzen:api:lessons', 'API', 'Seven backends to pick from'],
              ['@arkzen:web:page:index', 'Web', 'Next.js, Vite and more'],
              ['@arkzen:native:page:index', 'Mobile', 'Expo, React Native, Lynx'],
              ['@arkzen:desktop:config', 'Desktop', 'Electron or Tauri'],
            ].map((r) => (
              <div className="pf-row" key={r[0]}><code className="pf-tag">{r[0]}</code><span className="pf-bar"><b>{r[1]}</b><i>{r[2]}</i></span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-studio" id="studio">
        <div className="pf-hstick">
          <div className="pf-hhead">
            <p className="pf-kick pf-caps">Story / two</p>
            <h2 className="pf-h2">Studio, in a few quiet rooms.</h2>
          </div>
          <div className="pf-track">
            {shots.map((s) => (
              <figure className="pf-card" key={s.k} style={{ margin: 0 }}>
                <div className="pf-num"><span>{s.n.charAt(0)}<br />{s.n.charAt(1)}</span><small /><em>{s.c}</em></div>
                <div className="pf-shot">
                  <img src={IMG + s.k + '.webp'} alt={'Pluffy Studio screen ' + s.n} loading="lazy" />
                  <div className="pf-vellum"><span className="pf-jp">{s.jp}</span></div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-numbers">
        <p className="pf-kick pf-caps pf-rv">Story / three</p>
        <h2 className="pf-h2 pf-rv">One source, a lot of ground.</h2>
        <div className="pf-stats">
          {stats.map((s) => (
            <div className="pf-stat pf-rv" key={s.t}><strong className="pf-count" data-to={s.to}>0</strong><b>{s.t}</b><span>{s.d}</span></div>
          ))}
        </div>
      </section>

      <section className="pf-built" id="built">
        <p className="pf-kick pf-caps pf-rv">Story / four</p>
        <h2 className="pf-h2 pf-rv">Buildings already standing.</h2>
        <div className="pf-grid">
          {built.map((b) => (
            <article className="pf-rv" key={b.k}>
              <div className="pf-pic"><img src={IMG + b.k + '.webp'} alt={b.n + ' homepage, built with Pluffy'} loading="lazy" /><div className="pf-vellum"><span className="pf-jp">{b.jp}</span></div></div>
              <p className="pf-cap"><b>{b.n}</b>{b.s}</p>
            </article>
          ))}
        </div>
        <div className="pf-marq" aria-hidden="true"><div className="pf-marq-in">{[0, 1].map((r) => <React.Fragment key={r}>{names.map((n) => <span key={r + n}>{n}</span>)}</React.Fragment>)}</div></div>
      </section>

      <section className="pf-get" id="download">
        <div className="pf-get-card">
          <div>
            <p className="pf-kick pf-caps">Take it home</p>
            <h2 className="pf-h2">Pluffy Studio v1.0.6</h2>
            <ol className="pf-get-steps">
              <li>Download the zip. It carries the app and a snapshot of the Pluffy engine.</li>
              <li>Extract the whole folder somewhere permanent, not just the exe.</li>
              <li>Open Pluffy Studio.exe. If Windows warns, choose More info, then Run anyway.</li>
            </ol>
            <div className="pf-cta">
              <a className="pf-btn pf-main" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}>Download for Windows</a>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}>Clone the repo</button>
              <a className="pf-btn pf-ghost" href={RELEASE_URL} target="_blank" rel="noreferrer">Release notes</a>
            </div>
            <div className="pf-clone"><span>$ {CLONE_CMD}</span></div>
            <p className="pf-fine" style={{ color: 'var(--r300)', marginTop: 12 }}>On Mac or Linux, clone, then run npm install and npm start inside the gui folder.</p>
          </div>
          <div className="pf-get-img"><img src={IMG + 'studio-home.webp'} alt="Pluffy Studio home screen" loading="lazy" /></div>
        </div>
      </section>

      <footer className="pf-foot">
        <span>Pluffy by Mizumi. One file in, a whole building out.</span>
        <span><a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a> &nbsp; <a href={RELEASE_URL} target="_blank" rel="noreferrer">Releases</a> &nbsp; <a href={REPO_URL + '/blob/main/PLUFF_GUIDELINES_v14.md'} target="_blank" rel="noreferrer">Language guide</a></span>
      </footer>

      <div className={'pf-toast' + (toast ? ' on' : '')} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}

/* @arkzen:web:page:index:end */
