/* @arkzen:meta
name: pluffy-showcase
version: 1.1.0
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
.pf-root { --ink:#212121; --ink-2:#4a3f3c; --surface:#fbfbfd; --sec:#f3ebe9; --sec-2:#ebe0dd; --primary:#f99e9e; --press:#f58a8a; --soft:#fde6e6; --muted:#6c625f; --faint:#a69a96; --sunk:#f8f3f1; --ok:#2d7a58; --shadow-1:0 1px 2px rgba(74,48,42,.05),0 6px 18px rgba(74,48,42,.07); --shadow-2:0 14px 40px rgba(74,48,42,.18); --r-sm:10px; --r:14px; --r-lg:22px; --ui:system-ui,-apple-system,"Segoe UI Variable Text","Segoe UI",sans-serif; --display:"Zen Maru Gothic","Hiragino Maru Gothic ProN","Yu Gothic UI",system-ui,sans-serif; --mono:ui-monospace,"Cascadia Mono","SF Mono",Menlo,Consolas,monospace; font:16px/1.7 var(--ui); color:var(--ink); background:var(--sec); overflow-x:clip; }
.pf-root * { box-sizing:border-box; }
.pf-root h1, .pf-root h2, .pf-root h3, .pf-root p, .pf-root ol, .pf-root figure { margin:0; padding:0; }
.pf-root a { color:inherit; }
.pf-wrap { width:min(1160px,100% - 48px); margin-inline:auto; }
.pf-h1 { font:700 clamp(2rem,4.4vw,2.75rem)/1.15 var(--display); letter-spacing:-.01em; }
.pf-h2 { font:700 clamp(1.5rem,3vw,2rem)/1.25 var(--display); }
.pf-h3 { font:700 1.25rem/1.3 var(--display); }
.pf-muted { color:var(--muted); }
.pf-card { background:var(--surface); border-radius:var(--r-lg); box-shadow:var(--shadow-1); }
.pf-btn { display:inline-flex; align-items:center; gap:10px; height:44px; padding:0 22px; border-radius:999px; border:0; font:700 16px var(--display); text-decoration:none; cursor:pointer; transition:background-color .2s ease; }
.pf-btn svg { width:18px; height:18px; flex:none; }
.pf-btn:focus-visible, .pf-link:focus-visible { outline:none; box-shadow:0 0 0 2px var(--surface), 0 0 0 4px var(--primary); }
.pf-root .pf-primary { background:var(--primary); color:var(--ink); }
.pf-root .pf-primary:hover { background:var(--press); }
.pf-root .pf-ghost { background:var(--sec-2); color:var(--ink); }
.pf-root .pf-ghost:hover { background:var(--faint); }
.pf-root .pf-link { text-decoration:none; color:var(--ink-2); border-radius:8px; }
.pf-root .pf-link:hover { color:var(--ink); text-decoration:underline; }
.pf-head { height:72px; display:flex; align-items:center; justify-content:space-between; }
.pf-brand { display:flex; align-items:center; gap:10px; font:700 20px var(--display); text-decoration:none; }
.pf-brand svg { width:26px; height:26px; }
.pf-nav { display:flex; align-items:center; gap:24px; }
.pf-hero { min-height:calc(100vh - 72px); display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; padding-bottom:32px; }
.pf-hero p.pf-muted { max-width:60ch; }
.pf-stage { position:relative; width:min(100%,max(560px,calc((100vh - 372px) * 1.622))); aspect-ratio:1120/690; margin-top:12px; }
.pf-stage:not([data-ready]) .pf-win { visibility:hidden; }
.pf-cta { display:flex; flex-direction:column; align-items:center; gap:10px; margin-top:12px; }
.pf-cta-row { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; }
.pf-fine { font-size:14px; color:var(--muted); }
.pf-win { position:absolute; left:0; top:0; width:1120px; height:690px; transform-origin:0 0; transform:scale(var(--s,1)); background:var(--sec); border-radius:var(--r-lg); box-shadow:var(--shadow-2); overflow:hidden; font:14px/1.5 var(--ui); color:var(--ink); text-align:left; }
.pf-w-title { position:absolute; left:0; right:0; top:0; height:48px; display:flex; align-items:center; gap:8px; padding:0 18px; }
.pf-w-title i { width:13px; height:13px; border-radius:50%; }
.pf-w-brand { display:flex; align-items:center; gap:8px; margin-left:14px; font:700 15px var(--display); }
.pf-w-brand svg { width:20px; height:20px; }
.pf-w-ta { margin-left:auto; display:flex; gap:4px; }
.pf-w-g { display:inline-flex; align-items:center; gap:7px; height:32px; padding:0 12px; border-radius:999px; font-size:13px; font-weight:500; }
.pf-win svg { width:16px; height:16px; flex:none; }
.pf-w-side { position:absolute; left:16px; top:56px; width:212px; bottom:16px; display:flex; flex-direction:column; gap:6px; }
.pf-w-new { align-self:flex-start; height:34px; padding:0 16px 0 12px; margin-bottom:8px; border-radius:999px; background:var(--primary); display:inline-flex; align-items:center; gap:8px; font-weight:700; }
.pf-w-nav { height:36px; display:flex; align-items:center; gap:11px; padding:0 12px; border-radius:12px; }
.pf-w-nav.on { background:var(--surface); box-shadow:var(--shadow-1); font-weight:600; }
.pf-w-lab { margin:12px 0 2px 12px; font-size:12px; font-weight:600; color:var(--muted); }
.pf-w-list { display:flex; flex-direction:column; gap:2px; }
.pf-side-new { visibility:hidden; opacity:0; }
.pf-w-sheet { position:absolute; left:244px; right:12px; top:48px; bottom:12px; background:var(--surface); border-radius:var(--r-lg); box-shadow:var(--shadow-1); overflow:hidden; }
.pf-v { position:absolute; inset:0; padding:36px 44px; }
.pf-v-ed { visibility:hidden; opacity:0; }
.pf-w-h2 { font:700 28px/1.2 var(--display); }
.pf-w-prompt { position:relative; margin-top:24px; height:150px; padding:20px 22px; border-radius:var(--r-lg); background:var(--surface); box-shadow:var(--shadow-1); font-size:17px; }
.pf-typed:empty::before { content:'Describe an app, or type / for commands'; color:var(--muted); }
.pf-typed::after { content:''; display:inline-block; width:2px; height:19px; margin-left:1px; background:var(--ink); vertical-align:-3px; }
.pf-w-write { position:absolute; right:16px; bottom:14px; height:34px; padding:0 18px; border-radius:999px; background:var(--primary); display:inline-flex; align-items:center; font-weight:700; }
.pf-w-bar { display:flex; align-items:flex-start; justify-content:space-between; }
.pf-w-bar h3 { font:700 24px/1.2 var(--display); margin:0; }
.pf-w-bar .pf-w-btns { display:flex; gap:8px; }
.pf-w-b { display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 16px; border-radius:999px; background:var(--sec); font-weight:500; }
.pf-w-b.p { background:var(--primary); font-weight:700; }
.pf-w-tab { display:inline-block; margin-top:14px; padding:4px 14px; border-radius:999px; background:var(--soft); font-weight:600; }
.pf-w-rail { position:absolute; left:44px; top:138px; width:172px; display:flex; flex-direction:column; gap:4px; }
.pf-w-rail > div { display:flex; flex-direction:column; padding:6px 8px 6px 28px; position:relative; border-radius:12px; }
.pf-w-rail > div::before { content:''; position:absolute; left:8px; top:12px; width:12px; height:12px; border-radius:50%; background:var(--fam); }
.pf-w-rail b { font:600 13px var(--mono); }
.pf-w-rail span { font-size:12px; color:var(--muted); }
.pf-w-code { position:absolute; left:236px; right:36px; top:138px; bottom:36px; padding:16px 0; border-radius:var(--r); background:var(--surface); box-shadow:var(--shadow-1); font:13px/1.7 var(--mono); overflow:hidden; }
.pf-code-l { display:flex; white-space:pre; }
.pf-code-l u { width:44px; text-align:right; padding-right:16px; text-decoration:none; color:var(--faint); flex:none; }
.pf-code-l .t { color:#b0642f; font-weight:700; } .pf-code-l .k { color:#5a4a9c; } .pf-code-l .v { color:var(--ok); }
.pf-dock { position:absolute; left:244px; right:12px; bottom:12px; height:200px; background:var(--sunk); border-radius:var(--r-lg); box-shadow:var(--shadow-1); transform:translateY(212px); z-index:4; }
.pf-w-dh { height:40px; display:flex; align-items:center; justify-content:space-between; padding:0 10px 0 14px; }
.pf-w-dh span { display:inline-flex; align-items:center; height:28px; padding:0 14px; border-radius:999px; background:var(--surface); font-size:13px; font-weight:500; }
.pf-w-chev { display:grid; place-items:center; width:28px; height:28px; border-radius:999px; color:var(--muted); }
.pf-w-term { padding:6px 22px; font:13px/1.8 var(--mono); }
.pf-t-l { visibility:hidden; opacity:0; } .pf-t-l .ok { color:var(--ok); font-weight:700; } .pf-t-l.m { color:var(--muted); }
.pf-rail-i, .pf-code-l { visibility:hidden; opacity:0; }
.pf-cursor { position:absolute; left:0; top:0; width:22px; height:22px; display:none; pointer-events:none; z-index:9; filter:drop-shadow(0 2px 3px rgba(33,33,33,.28)); }
.pf-win .pf-cursor { width:22px; height:22px; }
.pf-story { height:320vh; margin-top:4vh; }
.pf-stick { position:sticky; top:0; height:100vh; display:grid; grid-template-columns:1fr 1.1fr; gap:56px; align-items:center; }
.pf-root .pf-steps { list-style:none; display:grid; gap:24px; margin-top:32px; }
.pf-step { display:grid; grid-template-columns:32px 1fr; gap:16px; color:var(--muted); transition:color .3s ease; }
.pf-step .pf-n { display:grid; place-items:center; width:32px; height:32px; border-radius:50%; background:var(--sec-2); font:700 15px var(--display); color:var(--ink); transition:background-color .3s ease; }
.pf-step.on { color:var(--ink); }
.pf-step.on .pf-n { background:var(--primary); }
.pf-step h3 { font:700 18px/1.3 var(--display); margin-bottom:4px; }
.pf-file { padding:20px; }
.pf-file-top { display:flex; align-items:center; gap:8px; padding:0 4px 14px; font:500 13px var(--mono); color:var(--muted); }
.pf-frow { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:12px; align-items:center; padding:10px 4px; }
.pf-tag { display:flex; align-items:center; gap:10px; font:500 13px/1.4 var(--mono); overflow-wrap:anywhere; }
.pf-tag i { width:12px; height:12px; border-radius:50%; flex:none; }
.pf-bar { display:block; padding:10px 14px; border-radius:var(--r-sm); transform-origin:0 50%; line-height:1.4; }
.pf-bar b { display:block; font-family:var(--display); }
.pf-bar span { font-size:14px; color:var(--ink-2); }
.pf-built { padding:4vh 0 12vh; }
.pf-built-head { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; flex-wrap:wrap; margin-bottom:40px; }
.pf-grid { display:grid; grid-template-columns:5fr 7fr; grid-template-rows:auto auto; gap:24px; align-items:start; }
.pf-grid figure:first-child { grid-row:span 2; }
.pf-fig { padding:12px 12px 16px; }
.pf-fig img { display:block; width:100%; border-radius:var(--r); }
.pf-fig figcaption { padding:14px 8px 0; }
.pf-fig b { font:700 16px var(--display); margin-right:8px; }
.pf-fig span { font-size:14px; color:var(--muted); }
.pf-get { background:var(--ink); color:var(--surface); display:grid; grid-template-columns:1.1fr 1fr; gap:48px; padding:56px; align-items:start; }
.pf-get .pf-muted, .pf-get .pf-fine { color:#cdbcb7; }
.pf-root .pf-get-steps { list-style:none; display:grid; gap:14px; margin:24px 0 32px; }
.pf-get-steps li { display:grid; grid-template-columns:32px 1fr; gap:16px; align-items:start; color:#e8dcd8; }
.pf-get-steps .pf-n { display:grid; place-items:center; width:32px; height:32px; border-radius:50%; background:#3a302d; font:700 15px var(--display); color:var(--surface); }
.pf-root .pf-get .pf-ghost { background:#3a302d; color:var(--surface); }
.pf-root .pf-get .pf-ghost:hover { background:#4a3f3c; }
.pf-root .pf-get .pf-link { color:#e8dcd8; }
.pf-code { background:#2c2523; border-radius:var(--r); padding:20px 22px; font:14px/1.9 var(--mono); color:#e8dcd8; overflow-x:auto; }
.pf-code .c { color:#cdbcb7; }
.pf-foot { display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px 32px; padding:40px 0 48px; font-size:15px; }
.pf-foot nav { display:flex; gap:24px; }
.pf-toast { position:fixed; left:50%; bottom:24px; transform:translate(-50%,24px); opacity:0; background:var(--ink); color:var(--surface); padding:12px 20px; border-radius:var(--r); box-shadow:var(--shadow-2); font-size:15px; z-index:80; transition:transform .3s ease, opacity .3s ease; pointer-events:none; max-width:92vw; }
.pf-toast.on { transform:translate(-50%,0); opacity:1; }
@media (max-width:860px) {
  .pf-nav .pf-link { display:none; }
  .pf-stick, .pf-get { grid-template-columns:1fr; }
  .pf-stick { gap:20px; align-content:start; padding-top:24px; }
  .pf-steps { display:none; }
  .pf-grid { grid-template-columns:1fr; }
  .pf-grid figure:first-child { grid-row:auto; }
  .pf-get { padding:32px 24px; }
}
@media (max-width:560px) { .pf-frow { grid-template-columns:1fr; gap:6px; padding:6px 4px; } .pf-hero { min-height:0; } }
@media (prefers-reduced-motion: reduce) { .pf-btn, .pf-step, .pf-step .pf-n, .pf-toast { transition:none; } }
/* @arkzen:web:style:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Download, Copy, ArrowUpRight, Home, Puzzle, Settings, Plus, Search, Building2, CodeXml, Terminal, MessageSquare, ChevronDown, CircleCheck } from 'lucide-react'

export const REPO_URL = 'https://github.com/Mizumi250/Pluffy'
export const RELEASE_URL = 'https://github.com/Mizumi250/Pluffy/releases/tag/v1.0.6'
export const DOWNLOAD_URL = 'https://github.com/Mizumi250/Pluffy/releases/download/v1.0.6/PluffyStudio-win-x64.zip'
export const CLONE_CMD = 'git clone https://github.com/Mizumi250/Pluffy.git'
export const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&display=swap'

export const AZ = '@' + 'arkzen'

const PETAL = 'M0 -2.5 C -6.5 -7 -6.5 -13 -3 -14.5 L 0 -12 L 3 -14.5 C 6.5 -13 6.5 -7 0 -2.5 Z'

export const Mark = () => (
  <svg viewBox="-16 -16 32 32" aria-hidden="true">
    <g fill="#f99e9e">{[0, 72, 144, 216, 288].map((a) => <path key={a} d={PETAL} transform={`rotate(${a})`} />)}</g>
    <circle r="2.4" fill="#212121" />
  </svg>
)

const SIDE_NAMES = ['kairo', 'kotoba', 'cafe-teresita', 'rubik-solver', 'shan-shan', 'jo-payroll']
const RAIL = [['meta', 'Shared', 1, '#b0642f'], ['web:page:index', 'Web', 8, '#c2415b'], ['web:page:menu', 'Web', 19, '#c2415b'], ['web:page:booking', 'Web', 34, '#c2415b']]
const CODE: Array<Array<[string, string]>> = [
  [['t', '/* ' + AZ + ':meta']], [['k', 'name: '], ['v', 'warung-sore']], [['k', 'version: '], ['v', '1.0.0']],
  [['k', 'description: '], ['v', 'Warung menu and a table booking form']], [['k', 'auth: '], ['v', 'false']], [['', '*/']], [['', '']],
  [['t', '/* ' + AZ + ':web:page:index */']], [['t', '/* ' + AZ + ':web:page:layout:guest */']], [['', '']],
  [['', 'const IndexPage = () => (']], [['', '  <main className="menu">...</main>']], [['', ')']],
]

export const StudioWindow = React.memo(() => (
  <div className="pf-win" aria-hidden="true">
    <div className="pf-w-title">
      <i style={{ background: '#ff5f57' }} /><i style={{ background: '#febc2e' }} /><i style={{ background: '#28c840' }} />
      <div className="pf-w-brand"><Mark />Pluffy Studio</div>
      <div className="pf-w-ta">
        <span className="pf-w-g"><CodeXml />VS Code</span><span className="pf-w-g"><Terminal />CMD</span><span className="pf-w-g"><MessageSquare />Chat</span>
      </div>
    </div>
    <div className="pf-w-side">
      <span className="pf-w-new"><Plus />New tatemono</span>
      <span className="pf-w-nav pf-nav-home on"><Home />Home</span>
      <span className="pf-w-nav"><Puzzle />Extensions</span>
      <span className="pf-w-nav"><Settings />Engine</span>
      <div className="pf-w-lab">TATEMONOS (66)</div>
      <div className="pf-w-nav" style={{ background: 'var(--wash,rgba(255,255,255,.55))' }}><Search />Search tatemonos</div>
      <div className="pf-w-list">
        <span className="pf-w-nav pf-side-new"><Building2 />warung-sore</span>
        {SIDE_NAMES.map((n) => <span className="pf-w-nav" key={n}><Building2 />{n}</span>)}
      </div>
    </div>
    <div className="pf-w-sheet">
      <div className="pf-v pf-v-home">
        <div className="pf-w-h2">What are we building?</div>
        <p style={{ color: 'var(--muted)', marginTop: 8, maxWidth: 520 }}>Pick a tatemono in the sidebar to edit it, or describe a new one.</p>
        <div className="pf-w-prompt"><span className="pf-typed" /><span className="pf-w-write">Write tatemono</span></div>
      </div>
      <div className="pf-v pf-v-ed">
        <div className="pf-w-bar">
          <div><h3>warung-sore</h3><div style={{ color: 'var(--muted)', fontSize: 13 }}>v1.0.0 · Warung menu and a table booking form</div></div>
          <div className="pf-w-btns"><span className="pf-w-b pf-w-check"><CircleCheck />Check</span><span className="pf-w-b p"><Plus />Add block</span></div>
        </div>
        <span className="pf-w-tab">core.tsx</span>
        <div className="pf-w-rail">
          {RAIL.map((r) => <div className="pf-rail-i" key={String(r[0])} style={{ ['--fam' as any]: r[3] }}><b>{r[0]}</b><span>{r[1]} · line {r[2]}</span></div>)}
        </div>
        <div className="pf-w-code">
          {CODE.map((ln, i) => <div className="pf-code-l" key={i}><u>{i + 1}</u>{ln.map((p, j) => <span key={j} className={p[0]}>{p[1]}</span>)}</div>)}
        </div>
      </div>
    </div>
    <div className="pf-dock">
      <div className="pf-w-dh"><span>Terminal</span><i className="pf-w-chev"><ChevronDown /></i></div>
      <div className="pf-w-term">
        <div className="pf-t-l">$ mizumi check warung-sore</div>
        <div className="pf-t-l"><span className="ok">✓</span> warung-sore  0 error(s), 0 warning(s)</div>
        <div className="pf-t-l m">1/1 tatemono(s) clean of errors</div>
      </div>
    </div>
    <svg className="pf-cursor" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.6 14.8 L11.6 21.6 L14.4 20.4 L11.5 13.8 L18 13.6 Z" fill="#212121" stroke="#fbfbfd" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  </div>
))

/* @arkzen:web:components:shared:end */

/* @arkzen:web:animation */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const PROMPT = 'A warung site with a menu page and a table booking form'

const pluffyShowcaseAnimations = (pageRef: React.RefObject<HTMLDivElement | null>) => {
  gsap.registerPlugin(ScrollTrigger)
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

  useEffect(() => pluffyShowcaseAnimations(pageRef), [])

  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3800) }
  const copyClone = async (m: string) => {
    try { await navigator.clipboard.writeText(CLONE_CMD); say(m) }
    catch { say('Could not copy. Run: ' + CLONE_CMD) }
  }
  const IMG = '/tatemonos/pluffy-showcase/assets/images/'

  const rows = [
    [AZ + ':database:lessons', '#b0642f', 'Database', 'SQLite or PostgreSQL'],
    [AZ + ':api:lessons', '#6a4fb0', 'API', 'Seven backends to pick from'],
    [AZ + ':web:page:index', '#c2415b', 'Web', 'Next.js, Vite and more'],
    [AZ + ':native:page:index', '#2d7a58', 'Mobile', 'Expo, React Native, Lynx'],
    [AZ + ':desktop:config', '#1f7a8c', 'Desktop', 'Electron or Tauri'],
  ]
  const steps = [
    ['One file', 'A tatemono is a single core.tsx. Tables, API, login, pages and the look all sit in tagged blocks.'],
    ['Studio reads it', 'Blocks line up in a rail beside the code. Check lints the file without starting the engine.'],
    ['The engine builds', 'Save, and it rebuilds the database, backend, web, mobile and desktop around your file.'],
  ]

  return (
    <div ref={pageRef} className="pf-root">
      <div className="pf-wrap">
        <header className="pf-head">
          <a className="pf-brand" href="#top"><Mark />Pluffy</a>
          <nav className="pf-nav" aria-label="Main">
            <a className="pf-link" href={REPO_URL} target="_blank" rel="noreferrer">Source on GitHub</a>
            <a className="pf-btn pf-primary" href="#download"><Download />Get Studio</a>
          </nav>
        </header>

        <section className="pf-hero" id="top">
          <h1 className="pf-h1">One file in, a whole building out.</h1>
          <p className="pf-muted">Pluffy turns one core.tsx, called a tatemono, into a database, a backend, web pages, mobile screens and a desktop shell. Studio is where you write it.</p>
          <div className="pf-stage"><StudioWindow /></div>
          <div className="pf-cta">
            <div className="pf-cta-row">
              <a className="pf-btn pf-primary" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}><Download />Download for Windows</a>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}><Copy />Copy clone command</button>
            </div>
            <p className="pf-fine">v1.0.6, Windows x64, about 246 MB. Unzip the whole folder and run it.</p>
          </div>
        </section>
      </div>

      <section className="pf-story" id="story">
        <div className="pf-wrap pf-stick">
          <div>
            <h2 className="pf-h2">Write the plan once. Watch the floors rise.</h2>
            <ol className="pf-steps">
              {steps.map((s, i) => (
                <li key={s[0]} className={'pf-step' + (i === 0 ? ' on' : '')}><span className="pf-n">{i + 1}</span><div><h3>{s[0]}</h3><p>{s[1]}</p></div></li>
              ))}
            </ol>
          </div>
          <div className="pf-card pf-file" aria-label="Sample tatemono blocks and what each one builds">
            <div className="pf-file-top">core.tsx, sample blocks</div>
            {rows.map((r) => (
              <div className="pf-frow" key={r[0]}>
                <code className="pf-tag"><i style={{ background: r[1] }} />{r[0]}</code>
                <span className="pf-bar" style={{ background: r[1] + '24' }}><b>{r[2]}</b><span>{r[3]}</span></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-built pf-wrap" id="built">
        <div className="pf-built-head">
          <h2 className="pf-h2">Buildings already standing.</h2>
          <a className="pf-btn pf-ghost" href={REPO_URL + '/tree/main/tatemonos'} target="_blank" rel="noreferrer">Browse the 66 tatemonos<ArrowUpRight /></a>
        </div>
        <div className="pf-grid">
          <figure className="pf-card pf-fig"><img src={IMG + 'built-kotoba.webp'} alt="Kotoba homepage, built with Pluffy" loading="lazy" /><figcaption><b>Kotoba</b><span>A social language-learning app, Next.js</span></figcaption></figure>
          <figure className="pf-card pf-fig"><img src={IMG + 'built-kairo.webp'} alt="Kairo homepage, built with Pluffy" loading="lazy" /><figcaption><b>Kairo</b><span>Next.js</span></figcaption></figure>
          <figure className="pf-card pf-fig"><img src={IMG + 'built-rubik.webp'} alt="Rubik Solver, built with Pluffy" loading="lazy" /><figcaption><b>Rubik Solver</b><span>React and Vite</span></figcaption></figure>
        </div>
      </section>

      <section className="pf-wrap" id="download">
        <div className="pf-card pf-get">
          <div>
            <h2 className="pf-h2">Get Pluffy Studio</h2>
            <ol className="pf-get-steps">
              <li><span className="pf-n">1</span><span>Download the zip. It carries the app and a snapshot of the Pluffy engine.</span></li>
              <li><span className="pf-n">2</span><span>Extract the whole folder somewhere permanent. The exe needs the files beside it.</span></li>
              <li><span className="pf-n">3</span><span>Open Pluffy Studio.exe. If Windows warns, choose More info, then Run anyway.</span></li>
            </ol>
            <div className="pf-cta-row" style={{ justifyContent: 'flex-start' }}>
              <a className="pf-btn pf-primary" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}><Download />Download for Windows</a>
              <a className="pf-link" style={{ alignSelf: 'center' }} href={RELEASE_URL} target="_blank" rel="noreferrer">Release v1.0.6 notes</a>
            </div>
          </div>
          <div>
            <p className="pf-muted" style={{ marginBottom: 12 }}>On Mac or Linux, run it from source:</p>
            <div className="pf-code">
              <div>{CLONE_CMD}</div><div>cd Pluffy/gui</div><div>npm install</div><div>npm start</div>
            </div>
            <div className="pf-cta-row" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}><Copy />Copy clone command</button>
            </div>
            <p className="pf-fine" style={{ marginTop: 12 }}>The Windows build is not code signed yet.</p>
          </div>
        </div>
      </section>

      <footer className="pf-wrap pf-foot">
        <span>Pluffy by Mizumi</span>
        <nav aria-label="Footer"><a className="pf-link" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a><a className="pf-link" href={RELEASE_URL} target="_blank" rel="noreferrer">Releases</a><a className="pf-link" href={REPO_URL + '/blob/main/PLUFF_GUIDELINES_v14.md'} target="_blank" rel="noreferrer">Language guide</a></nav>
      </footer>

      <div className={'pf-toast' + (toast ? ' on' : '')} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}

/* @arkzen:web:page:index:end */
