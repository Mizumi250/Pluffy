/* @arkzen:meta
name: pluffy-showcase
version: 1.2.0
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
.pf-root h1, .pf-root h2, .pf-root h3, .pf-root h4, .pf-root p, .pf-root ol, .pf-root figure { margin:0; padding:0; }
.pf-wrap { width:min(1160px,100% - 48px); margin-inline:auto; }
.pf-h1 { font:700 clamp(2rem,4.4vw,2.75rem)/1.15 var(--display); letter-spacing:-.01em; }
.pf-h2 { font:700 clamp(1.5rem,3vw,2rem)/1.25 var(--display); }
.pf-h3 { font:700 1.25rem/1.3 var(--display); }
.pf-muted { color:var(--muted); }
.pf-card { background:var(--surface); border-radius:var(--r-lg); box-shadow:var(--shadow-1); }
.pf-btn { display:inline-flex; align-items:center; gap:10px; height:44px; padding:0 22px; border-radius:999px; border:0; font:700 16px var(--display); text-decoration:none; cursor:pointer; transition:background-color .2s ease; }
.pf-btn svg { width:18px; height:18px; flex:none; }
.pf-btn:focus-visible, .pf-root .pf-link:focus-visible { outline:none; box-shadow:0 0 0 2px var(--surface), 0 0 0 4px var(--primary); }
.pf-root .pf-primary { background:var(--primary); color:var(--ink); }
.pf-root .pf-primary:hover { background:var(--press); }
.pf-root .pf-ghost { background:var(--sec-2); color:var(--ink); }
.pf-root .pf-ghost:hover { background:var(--faint); }
.pf-root .pf-link { display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:var(--ink-2); border-radius:8px; }
.pf-root .pf-link:hover { color:var(--ink); text-decoration:underline; }
.pf-link svg { width:16px; height:16px; }
.pf-head { height:72px; display:flex; align-items:center; justify-content:space-between; }
.pf-brand { display:flex; align-items:center; gap:10px; font:700 20px var(--display); text-decoration:none; color:inherit; }
.pf-brand svg { width:26px; height:26px; }
.pf-nav { display:flex; align-items:center; gap:24px; }
.pf-hero { display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; padding:24px 0 64px; }
.pf-hero p.pf-muted { max-width:60ch; }
.pf-cta { display:flex; flex-direction:column; align-items:center; gap:10px; margin:8px 0 28px; }
.pf-cta-row { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; }
.pf-fine { font-size:14px; color:var(--muted); }
.pf-stage { position:relative; width:100%; aspect-ratio:1120/690; }
.pf-stage:not([data-ready]) .pf-win { visibility:hidden; }
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
.pf-side-new.pf-vis { visibility:visible; opacity:1; }
.pf-w-sheet { position:absolute; left:244px; right:12px; top:48px; bottom:12px; background:var(--surface); border-radius:var(--r-lg); box-shadow:var(--shadow-1); overflow:hidden; }
.pf-v { position:absolute; inset:0; padding:36px 44px; }
.pf-v-ed { visibility:hidden; opacity:0; }
.pf-v-ed.pf-static { visibility:visible; opacity:1; }
.pf-w-h2 { font:700 28px/1.2 var(--display); }
.pf-w-prompt { position:relative; margin-top:24px; height:150px; padding:20px 22px; border-radius:var(--r-lg); background:var(--surface); box-shadow:var(--shadow-1); font-size:17px; }
.pf-typed:empty::before, .pf-ab-ty:empty::before { content:attr(data-ph); color:var(--muted); }
.pf-typed::after { content:''; display:inline-block; width:2px; height:19px; margin-left:1px; background:var(--ink); vertical-align:-3px; }
.pf-w-write { position:absolute; right:16px; bottom:14px; height:34px; padding:0 18px; border-radius:999px; background:var(--primary); display:inline-flex; align-items:center; font-weight:700; }
.pf-w-bar { display:flex; align-items:flex-start; justify-content:space-between; }
.pf-w-bar h3 { font:700 24px/1.2 var(--display); }
.pf-w-btns { display:flex; gap:8px; }
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
.pf-rail-i, .pf-code-l, .pf-t-l, .pf-rail-x, .pf-to { visibility:hidden; opacity:0; }
.pf-static .pf-rail-i, .pf-static .pf-code-l { visibility:visible; opacity:1; }
.pf-static .pf-rail-x { visibility:hidden; opacity:0; }
.pf-dock { position:absolute; left:244px; right:12px; bottom:12px; height:200px; background:var(--sunk); border-radius:var(--r-lg); box-shadow:var(--shadow-1); transform:translateY(212px); z-index:4; }
.pf-dock.pf-xl { height:372px; transform:translateY(384px); }
.pf-dock.pf-xl.pf-open { transform:none; }
.pf-w-dh { height:40px; display:flex; align-items:center; justify-content:space-between; padding:0 10px 0 14px; }
.pf-w-dh span { display:inline-flex; align-items:center; height:28px; padding:0 14px; border-radius:999px; background:var(--surface); font-size:13px; font-weight:500; }
.pf-w-chev { display:grid; place-items:center; width:28px; height:28px; border-radius:999px; color:var(--muted); }
.pf-w-term { padding:6px 22px; font:13px/1.8 var(--mono); }
.pf-t-l .ok, .pf-to .ok { color:var(--ok); font-weight:700; } .pf-t-l.m, .pf-to.m { color:var(--muted); } .pf-pr { color:var(--muted); }
.pf-to { color:var(--ink-2); }
.pf-modal { position:absolute; inset:0; z-index:6; background:rgba(33,33,33,.3); display:grid; place-items:center; visibility:hidden; opacity:0; }
.pf-dlg { background:var(--surface); border-radius:var(--r-lg); box-shadow:var(--shadow-2); overflow:hidden; }
.pf-ab { width:760px; height:470px; display:grid; grid-template-columns:270px 1fr; }
.pf-ab-l { background:var(--sec); padding:20px 14px; display:flex; flex-direction:column; gap:6px; }
.pf-ab-l h4 { font:700 20px var(--display); margin:0 6px 6px; }
.pf-ab-s { height:36px; border-radius:999px; background:var(--surface); display:flex; align-items:center; gap:8px; padding:0 14px; font-size:14px; }
.pf-ab-lab { font-size:11px; font-weight:600; color:var(--muted); margin:12px 8px 2px; }
.pf-ab-i { position:relative; padding:7px 10px; border-radius:12px; line-height:1.35; }
.pf-ab-i > * { position:relative; display:block; }
.pf-ab-i b { font:600 13px var(--mono); } .pf-ab-i span { font-size:12px; color:var(--muted); }
.pf-sel { position:absolute !important; inset:0; border-radius:12px; background:var(--surface); box-shadow:var(--shadow-1); visibility:hidden; opacity:0; }
.pf-ab-r { position:relative; }
.pf-ab-r > div { position:absolute; inset:0; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:10px; padding:40px; }
.pf-ab-ph { align-items:center !important; text-align:center; color:var(--muted); }
.pf-ab-d { visibility:hidden; opacity:0; }
.pf-ab-d code { font:700 20px var(--mono); }
.pf-ex { width:800px; padding:28px 32px; display:grid; gap:14px; }
.pf-ex h4 { font:700 22px var(--display); }
.pf-ex-g { display:grid; grid-template-columns:1fr 1fr; gap:14px 32px; align-items:start; }
.pf-ex-f label { display:block; font-weight:600; font-size:13px; margin-bottom:6px; }
.pf-ex-sel { height:40px; padding:0 16px; border-radius:var(--r); background:var(--sec); display:flex; align-items:center; font-size:14px; }
.pf-cb { white-space:nowrap; display:inline-flex; align-items:center; gap:9px; height:34px; padding:0 14px; border-radius:999px; background:var(--sec); font-size:13px; margin-top:12px; }
.pf-cb em { position:relative; width:16px; height:16px; border-radius:5px; background:var(--surface); box-shadow:inset 0 0 0 1.5px var(--faint); display:grid; place-items:center; }
.pf-cb i { width:10px; height:10px; border-radius:3px; background:var(--ink); transform:scale(0); }
.pf-ex-cmd { padding:14px 18px; border-radius:var(--r); background:var(--sunk); font:13px var(--mono); }
.pf-ex-cmd .x { visibility:hidden; opacity:0; }
.pf-ex-foot { display:flex; justify-content:flex-end; gap:8px; margin-top:6px; }
.pf-cursor { position:absolute; left:0; top:0; width:22px; height:22px; display:none; pointer-events:none; z-index:9; filter:drop-shadow(0 2px 3px rgba(33,33,33,.28)); }
.pf-win .pf-cursor { width:22px; height:22px; }
.pf-story { height:320vh; margin-top:4vh; }
.pf-stick { position:sticky; top:0; height:100vh; display:grid; grid-template-columns:1fr 1.1fr; gap:56px; align-items:center; }
.pf-root .pf-steps { list-style:none; display:grid; gap:24px; margin-top:32px; }
.pf-step { display:grid; grid-template-columns:32px 1fr; gap:16px; color:var(--muted); transition:color .3s ease; }
.pf-n { display:grid; place-items:center; width:32px; height:32px; border-radius:50%; background:var(--sec-2); font:700 15px var(--display); color:var(--ink); transition:background-color .3s ease; }
.pf-step.on { color:var(--ink); } .pf-step.on .pf-n { background:var(--primary); }
.pf-step h3 { font:700 18px/1.3 var(--display); margin-bottom:4px; }
.pf-file { padding:20px; }
.pf-file-top { padding:0 4px 14px; font:500 13px var(--mono); color:var(--muted); }
.pf-frow { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:12px; align-items:center; padding:10px 4px; }
.pf-tag { display:flex; align-items:center; gap:10px; font:500 13px/1.4 var(--mono); overflow-wrap:anywhere; }
.pf-tag i { width:12px; height:12px; border-radius:50%; flex:none; }
.pf-bar { display:block; padding:10px 14px; border-radius:var(--r-sm); transform-origin:0 50%; line-height:1.4; }
.pf-bar b { display:block; font-family:var(--display); } .pf-bar span { font-size:14px; color:var(--ink-2); }
.pf-scene { height:270vh; }
.pf-sc-stick { position:sticky; top:0; height:100vh; display:flex; flex-direction:column; justify-content:center; gap:16px; padding:16px 0; }
.pf-sc-head { display:flex; justify-content:space-between; align-items:flex-end; gap:12px 40px; flex-wrap:wrap; }
.pf-cs { display:grid; max-width:44ch; color:var(--muted); }
.pf-cs span { grid-area:1/1; opacity:0; transition:opacity .3s ease; }
.pf-cs span.on { opacity:1; color:var(--ink); }
.pf-scene .pf-stage { width:min(100%,calc((100vh - 200px) * 1.622)); margin:0 auto; }
.pf-section { padding:12vh 0 4vh; }
.pf-badge { display:inline-flex; align-items:center; height:24px; padding:0 10px; border-radius:999px; font-size:13px; font-weight:600; }
.pf-badge.ready { background:#dcebe3; color:#1f5c42; } .pf-badge.planned { background:#f6e7cf; color:#7a4a00; }
.pf-sec-head { display:flex; flex-direction:column; align-items:flex-start; gap:10px; max-width:62ch; margin-bottom:32px; }
.pf-plat { padding:12px 32px; }
.pf-plat-row { display:grid; grid-template-columns:200px 1fr; gap:16px 32px; padding:22px 0; align-items:center; }
.pf-plat-row h3 { font:700 18px var(--display); }
.pf-plat-row p { font-size:14px; color:var(--muted); line-height:1.5; }
.pf-chips { display:flex; flex-wrap:wrap; gap:8px; }
.pf-chip { display:inline-flex; align-items:center; gap:9px; height:36px; padding:0 14px 0 10px; border-radius:999px; background:var(--sec); font-size:15px; }
.pf-logo { width:20px; height:20px; display:block; }
.pf-lm { display:grid; place-items:center; width:20px; height:20px; border-radius:6px; background:var(--ink-2); color:var(--surface); font:700 11px var(--display); }
.pf-note { margin-top:20px; font-size:15px; color:var(--muted); }
.pf-next-grid { display:grid; grid-template-columns:5fr 7fr; gap:56px; align-items:start; }
.pf-next-l { position:sticky; top:96px; display:flex; flex-direction:column; align-items:flex-start; gap:14px; }
.pf-next-list { display:grid; gap:16px; }
.pf-plan { padding:24px 28px; display:grid; gap:12px; }
.pf-plan-top { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.pf-plan p { color:var(--muted); }
.pf-plan-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.pf-built { padding:12vh 0 12vh; }
.pf-built-head { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; flex-wrap:wrap; margin-bottom:40px; }
.pf-grid { display:grid; grid-template-columns:5fr 7fr; grid-template-rows:auto auto; gap:24px; align-items:start; }
.pf-grid figure:first-child { grid-row:span 2; }
.pf-fig { padding:12px 12px 16px; }
.pf-fig img { display:block; width:100%; border-radius:var(--r); }
.pf-fig figcaption { padding:14px 8px 0; }
.pf-fig b { font:700 16px var(--display); margin-right:8px; } .pf-fig span { font-size:14px; color:var(--muted); }
.pf-get { background:var(--ink); color:var(--surface); display:grid; grid-template-columns:1.1fr 1fr; gap:48px; padding:56px; align-items:start; }
.pf-get .pf-muted, .pf-get .pf-fine { color:#cdbcb7; }
.pf-root .pf-get-steps { list-style:none; display:grid; gap:14px; margin:24px 0 32px; }
.pf-get-steps li { display:grid; grid-template-columns:32px 1fr; gap:16px; align-items:start; color:#e8dcd8; }
.pf-get-steps .pf-n { background:#3a302d; color:var(--surface); }
.pf-root .pf-get .pf-ghost { background:#3a302d; color:var(--surface); }
.pf-root .pf-get .pf-ghost:hover { background:#4a3f3c; }
.pf-root .pf-get .pf-link { color:#e8dcd8; }
.pf-code { background:#2c2523; border-radius:var(--r); padding:20px 22px; font:14px/1.9 var(--mono); color:#e8dcd8; overflow-x:auto; }
.pf-foot { display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px 32px; padding:40px 0 48px; font-size:15px; }
.pf-foot nav { display:flex; gap:24px; }
.pf-toast { position:fixed; left:50%; bottom:24px; transform:translate(-50%,24px); opacity:0; background:var(--ink); color:var(--surface); padding:12px 20px; border-radius:var(--r); box-shadow:var(--shadow-2); font-size:15px; z-index:80; transition:transform .3s ease, opacity .3s ease; pointer-events:none; max-width:92vw; }
.pf-toast.on { transform:translate(-50%,0); opacity:1; }
@media (max-width:860px) {
  .pf-nav .pf-link { display:none; }
  .pf-stick, .pf-get, .pf-next-grid { grid-template-columns:1fr; }
  .pf-stick { gap:20px; align-content:start; padding-top:24px; }
  .pf-steps { display:none; }
  .pf-grid { grid-template-columns:1fr; } .pf-grid figure:first-child { grid-row:auto; }
  .pf-get { padding:32px 24px; }
  .pf-plat-row { grid-template-columns:1fr; gap:10px; padding:16px 0; } .pf-plat { padding:12px 20px; }
  .pf-next-l { position:static; }
  .pf-scene { height:220vh; } .pf-scene .pf-stage { width:100%; }
  .pf-sc-stick { justify-content:center; }
}
@media (max-width:560px) { .pf-frow { grid-template-columns:1fr; gap:6px; padding:6px 4px; } }
@media (prefers-reduced-motion: reduce) { .pf-btn, .pf-step, .pf-n, .pf-toast, .pf-cs span { transition:none; } }
/* @arkzen:web:style:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Download, Copy, ArrowUpRight, Home, Puzzle, Settings, Plus, Search, Building2, CodeXml, Terminal, MessageSquare, ChevronDown, CircleCheck, Upload } from 'lucide-react'

export const REPO_URL = 'https://github.com/Mizumi250/Pluffy'
export const RELEASE_URL = 'https://github.com/Mizumi250/Pluffy/releases/tag/v1.0.6'
export const DOWNLOAD_URL = 'https://github.com/Mizumi250/Pluffy/releases/download/v1.0.6/PluffyStudio-win-x64.zip'
export const CLONE_CMD = 'git clone https://github.com/Mizumi250/Pluffy.git'
export const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&display=swap'
export const IMG_BASE = '/tatemonos/pluffy-showcase/assets/images/'
export const AZ = '@' + 'arkzen'

const PETAL = 'M0 -2.5 C -6.5 -7 -6.5 -13 -3 -14.5 L 0 -12 L 3 -14.5 C 6.5 -13 6.5 -7 0 -2.5 Z'

export const Mark = () => (
  <svg viewBox="-16 -16 32 32" aria-hidden="true">
    <g fill="#f99e9e">{[0, 72, 144, 216, 288].map((a) => <path key={a} d={PETAL} transform={`rotate(${a})`} />)}</g>
    <circle r="2.4" fill="#212121" />
  </svg>
)

export const Logo = ({ id }: { id: string }) => (
  id === 'lynx'
    ? <span className="pf-lm" aria-hidden="true">Ly</span>
    : <img className="pf-logo" src={IMG_BASE + 'logo-' + id + '.svg'} alt="" width={20} height={20} loading="lazy" />
)

export const Chip = ({ id, label }: { id: string; label: string }) => (
  <span className="pf-chip"><Logo id={id} />{label}</span>
)

const SIDE_NAMES = ['kairo', 'kotoba', 'cafe-teresita', 'rubik-solver', 'shan-shan', 'jo-payroll']
const RAIL = [['meta', 'Shared', 1, '#b0642f'], ['web:page:index', 'Web', 8, '#c2415b'], ['web:page:menu', 'Web', 19, '#c2415b'], ['web:page:booking', 'Web', 34, '#c2415b']]
const CODE: Array<Array<[string, string]>> = [
  [['t', '/* ' + AZ + ':meta']], [['k', 'name: '], ['v', 'warung-sore']], [['k', 'version: '], ['v', '1.0.0']],
  [['k', 'description: '], ['v', 'Warung menu and a table booking form']], [['k', 'auth: '], ['v', 'false']], [['', '*/']], [['', '']],
  [['t', '/* ' + AZ + ':web:page:index */']], [['t', '/* ' + AZ + ':web:page:layout:guest */']], [['', '']],
  [['', 'const IndexPage = () => (']], [['', '  <main className="menu">...</main>']], [['', ')']],
]

export const Frame = ({ children, dock, modal, active = 'home' }: { children: React.ReactNode; dock?: React.ReactNode; modal?: React.ReactNode; active?: string }) => (
  <div className="pf-win" aria-hidden="true">
    <div className="pf-w-title">
      <i style={{ background: '#ff5f57' }} /><i style={{ background: '#febc2e' }} /><i style={{ background: '#28c840' }} />
      <div className="pf-w-brand"><Mark />Pluffy Studio</div>
      <div className="pf-w-ta"><span className="pf-w-g"><CodeXml />VS Code</span><span className="pf-w-g"><Terminal />CMD</span><span className="pf-w-g"><MessageSquare />Chat</span></div>
    </div>
    <div className="pf-w-side">
      <span className="pf-w-new"><Plus />New tatemono</span>
      <span className={'pf-w-nav pf-nav-home' + (active === 'home' ? ' on' : '')}><Home />Home</span>
      <span className="pf-w-nav"><Puzzle />Extensions</span>
      <span className="pf-w-nav"><Settings />Engine</span>
      <div className="pf-w-lab">TATEMONOS (66)</div>
      <div className="pf-w-nav"><Search />Search tatemonos</div>
      <div className="pf-w-list">
        <span className={'pf-w-nav pf-side-new' + (active === 'new' ? ' pf-vis on' : '')}><Building2 />warung-sore</span>
        {SIDE_NAMES.map((n) => <span className="pf-w-nav" key={n}><Building2 />{n}</span>)}
      </div>
    </div>
    <div className="pf-w-sheet">{children}</div>
    {dock}
    {modal}
    <svg className="pf-cursor" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.6 14.8 L11.6 21.6 L14.4 20.4 L11.5 13.8 L18 13.6 Z" fill="#212121" stroke="#fbfbfd" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  </div>
)

export const HomeView = () => (
  <div className="pf-v pf-v-home">
    <div className="pf-w-h2">What are we building?</div>
    <p style={{ color: 'var(--muted)', marginTop: 8, maxWidth: 520 }}>Pick a tatemono in the sidebar to edit it, or describe a new one.</p>
    <div className="pf-w-prompt"><span className="pf-typed" data-ph="Describe an app, or type / for commands" /><span className="pf-w-write">Write tatemono</span></div>
  </div>
)

export const EditorView = ({ stat = false, extra = false }: { stat?: boolean; extra?: boolean }) => (
  <div className={'pf-v pf-v-ed' + (stat ? ' pf-static' : '')}>
    <div className="pf-w-bar">
      <div><h3>warung-sore</h3><div style={{ color: 'var(--muted)', fontSize: 13 }}>v1.0.0 · Warung menu and a table booking form</div></div>
      <div className="pf-w-btns">
        <span className="pf-w-b pf-w-check"><CircleCheck />Check</span><span className="pf-w-b pf-w-export"><Upload />Export</span><span className="pf-w-b p pf-w-add"><Plus />Add block</span>
      </div>
    </div>
    <span className="pf-w-tab">core.tsx</span>
    <div className="pf-w-rail">
      {RAIL.map((r) => <div className="pf-rail-i" key={String(r[0])} style={{ ['--fam' as any]: r[3] }}><b>{r[0]}</b><span>{r[1]} · line {r[2]}</span></div>)}
      {extra && <div className="pf-rail-i pf-rail-x" style={{ ['--fam' as any]: '#b0642f' }}><b>database</b><span>Shared · line 52</span></div>}
      {extra && <div className="pf-rail-i pf-rail-x" style={{ ['--fam' as any]: '#6a4fb0' }}><b>api</b><span>Backend · line 61</span></div>}
    </div>
    <div className="pf-w-code">
      {CODE.map((ln, i) => <div className="pf-code-l" key={i}><u>{i + 1}</u>{ln.map((p, j) => <span key={j} className={p[0]}>{p[1]}</span>)}</div>)}
    </div>
  </div>
)

const DockHead = () => <div className="pf-w-dh"><span>Terminal</span><i className="pf-w-chev"><ChevronDown /></i></div>

export const TermHero = () => (
  <div className="pf-dock">
    <DockHead />
    <div className="pf-w-term">
      <div className="pf-t-l">$ mizumi check warung-sore</div>
      <div className="pf-t-l"><span className="ok">✓</span> warung-sore  0 error(s), 0 warning(s)</div>
      <div className="pf-t-l m">1/1 tatemono(s) clean of errors</div>
    </div>
  </div>
)

export const TermStack = () => (
  <div className="pf-dock pf-xl pf-open">
    <DockHead />
    <div className="pf-w-term">
      <div><span className="pf-pr">$ </span><span className="pf-tx" data-t="mizumi web react-vite" /></div>
      <div className="pf-to" data-g="0"><span className="ok">✓</span> Web stack switched: nextjs → react-vite</div>
      <div style={{ height: 10 }} />
      <div><span className="pf-pr">$ </span><span className="pf-tx" data-t="mizumi backend go" /></div>
      <div className="pf-to" data-g="1"><span className="ok">✓</span> Backend switched: laravel → go</div>
      <div className="pf-to m" data-g="1">Tatemonos without a :go variant will be inactive on this backend</div>
      <div style={{ height: 10 }} />
      <div><span className="pf-pr">$ </span><span className="pf-tx" data-t="mizumi stack" /></div>
      {['Web stack:      react-vite  React + Vite', 'App stack:      expo  Expo (SDK 58, Expo Go)', 'Desktop stack:  electron  Electron desktop (wraps the running web stack)', 'Backend:        go  :go  Go (Chi)', 'Database:       sqlite  SQLite (one .sqlite file per tatemono)'].map((l) => <div className="pf-to" data-g="2" key={l} style={{ whiteSpace: 'pre' }}>{l}</div>)}
    </div>
  </div>
)

export const TermExport = () => (
  <div className="pf-dock pf-xl">
    <DockHead />
    <div className="pf-w-term"><div><span className="pf-pr">$ </span><span className="pf-tx" data-t="mizumi export warung-sore react-vite --docker --openapi" /></div></div>
  </div>
)

const ABLOCKS = [['database', 'one table, columns, seeder'], ['api', 'model-backed CRUD resource'], ['routes', 'custom routes with handlers'], ['crud', 'a table and its api resource in one step (database + api)']]

export const AddBlockDialog = () => (
  <div className="pf-modal">
    <div className="pf-dlg pf-ab">
      <div className="pf-ab-l">
        <h4>Add block</h4>
        <div className="pf-ab-s"><Search /><span className="pf-ab-ty" data-t="crud" data-ph="Search blocks" /></div>
        <div className="pf-ab-lab">DATA + API</div>
        {ABLOCKS.map((b) => (
          <div className={'pf-ab-i' + (b[0] === 'crud' ? ' pf-ab-crud' : '')} key={b[0]}>
            {b[0] === 'crud' && <i className="pf-sel" />}<b>{b[0]}</b><span>{b[1]}</span>
          </div>
        ))}
      </div>
      <div className="pf-ab-r">
        <div className="pf-ab-ph"><b>Pick a block</b><span>The list on the left has every block this tatemono can take, with the same rules as mizumi block.</span></div>
        <div className="pf-ab-d"><code>crud</code><span>a table and its api resource in one step (database + api)</span><span className="pf-w-b p pf-ab-go" style={{ marginTop: 12 }}>Add block</span></div>
      </div>
    </div>
  </div>
)

export const ExportDialog = () => (
  <div className="pf-modal">
    <div className="pf-dlg pf-ex">
      <h4>Export project</h4>
      <span style={{ color: 'var(--muted)' }}>Write a standalone web, app, desktop, Godot, Unity or Unreal project.</span>
      <div className="pf-ex-g">
        <div className="pf-ex-f"><label>Tatemono *</label><div className="pf-ex-sel">warung-sore</div></div>
        <div className="pf-ex-f"><label>Target *</label><div className="pf-ex-sel">react-vite (web)</div><span className="pf-cb pf-cb-d"><em><i /></em>Add Dockerfile + docker-compose (web only)</span></div>
        <div className="pf-ex-f"><label>Backend</label><div className="pf-ex-sel">(default)</div><span className="pf-cb pf-cb-o"><em><i /></em>Add OpenAPI docs</span></div>
      </div>
      <div className="pf-ex-cmd">mizumi export warung-sore react-vite<span className="x x-d"> --docker</span><span className="x x-o"> --openapi</span></div>
      <div className="pf-ex-foot"><span className="pf-w-b">Cancel</span><span className="pf-w-b p pf-ex-run">Run</span></div>
    </div>
  </div>
)

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
      const win = sec?.querySelector<HTMLElement>('.pf-win')
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

    // Story: one scrubbed timeline. The step text follows the scroll position.
    gsap.timeline({
      scrollTrigger: {
        trigger: '.pf-story', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: (self) => { const on = self.progress < 0.34 ? 0 : self.progress < 0.67 ? 1 : 2; root.querySelectorAll('.pf-step').forEach((s, i) => s.classList.toggle('on', i === on)) },
      },
    })
      .from('.pf-file', { y: 80, opacity: 0, duration: 1 })
      .from('.pf-tag', { opacity: 0.25, stagger: 0.15, duration: 0.3 }, 1.1)
      .from('.pf-bar', { scaleX: 0, opacity: 0, stagger: 0.35, duration: 0.7, ease: 'power2.out' }, 2.2)

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
  const PLAN = (f: string) => REPO_URL + '/blob/main/' + f

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
  const platforms = [
    { t: 'Web', n: 'Five stacks', c: [['nextjs', 'Next.js'], ['vite', 'React + Vite'], ['tanstack', 'TanStack Start'], ['astro', 'Astro'], ['inertia', 'React with Inertia']] },
    { t: 'Mobile', n: 'Three stacks', c: [['expo', 'Expo'], ['react', 'React Native'], ['lynx', 'Lynx']] },
    { t: 'Desktop', n: 'Wraps the running web stack', c: [['tauri', 'Tauri'], ['electron', 'Electron']] },
    { t: 'Games', n: 'Generated from game DSLs', c: [['godot', 'Godot 4'], ['unity', 'Unity'], ['unreal', 'Unreal Engine 5']] },
    { t: 'Backend', n: 'Pick one per project', c: [['laravel', 'Laravel'], ['express', 'Express'], ['fastapi', 'FastAPI'], ['spring', 'Spring Boot'], ['dotnet', 'ASP.NET Core'], ['go', 'Go'], ['rust', 'Rust']] },
    { t: 'Database', n: 'One isolated database per tatemono', c: [['sqlite', 'SQLite'], ['postgres', 'PostgreSQL']] },
  ]
  const plans = [
    { t: 'Browser extensions', d: 'A WXT stack that turns a tatemono into a Manifest V3 extension, sharing the same database, API and login as the web app.', f: 'PLUFFY_EXTENSION_PLAN.md', c: [['wxt', 'WXT'], ['react', 'React'], ['vite', 'Vite']] },
    { t: 'More web frameworks', d: 'Pages written in each framework\u2019s own syntax, not translated from React.', f: 'PLUFFY_FRONTEND_EXTEND_PLAN.md', c: [['vue', 'Vue'], ['nuxt', 'Nuxt'], ['svelte', 'Svelte'], ['angular', 'Angular'], ['solid', 'Solid'], ['html', 'Plain HTML']] },
    { t: 'Native mobile', d: 'Real Android and iOS projects, generated for export. Not wrappers.', f: 'PLUFFY_FRONTEND_EXTEND_PLAN.md', c: [['android', 'Android'], ['kotlin', 'Kotlin'], ['apple', 'iOS'], ['swift', 'Swift']] },
    { t: 'Native desktop', d: 'Compose Desktop for Windows, macOS and Linux, and SwiftUI for macOS.', f: 'PLUFFY_FRONTEND_EXTEND_PLAN.md', c: [['jetpack', 'Compose Desktop'], ['swift', 'SwiftUI']] },
    { t: 'Packages', d: 'Publish libraries, plus SDKs, types, validators and OpenAPI generated from what a tatemono already declares.', f: 'PLUFFY_PACKAGE_PLAN.md', c: [['npm', 'npm'], ['pypi', 'PyPI'], ['rust', 'crates.io'], ['go', 'Go modules'], ['maven', 'Maven Central'], ['nuget', 'NuGet'], ['packagist', 'Packagist']] },
    { t: 'Terminal apps', d: 'Standalone command-line tools and full-screen terminal apps, with no Pluffy runtime inside.', f: 'PLUFFY_TERMINAL_PLAN.md', c: [['ts', 'TypeScript + Ink'], ['python', 'Python + Textual'], ['rust', 'Rust + Ratatui']] },
    { t: 'Operating systems', d: 'Scaffold, build and boot-test kernels, bootloaders, firmware and Linux distributions. You still write the kernel logic.', f: 'PLUFFY_OS_PLAN.md', c: [['rust', 'Rust'], ['linux', 'Linux']] },
  ]
  const scenes = [
    { id: 'a', h: 'Build the file one block at a time.', caps: ['Open Add block from any tatemono.', 'Search the list. Every block has a plain description.', 'Pick crud: a table and its API in one step.', 'Two blocks land in your file, ready to fill in.'] },
    { id: 'b', h: 'Swap the stack. The file stays put.', caps: ['One command switches the web stack.', 'Another switches the backend.', 'Check what is active. core.tsx never changed.'] },
    { id: 'c', h: 'Take it with you when it is done.', caps: ['Export opens from the editor.', 'Tick Docker for web exports.', 'Tick OpenAPI docs for Postman and Swagger.', 'Run writes a standalone project you can take anywhere.'] },
  ]
  const sceneWin = (id: string) => id === 'a'
    ? <Frame active="new" modal={<AddBlockDialog />}><EditorView stat extra /></Frame>
    : id === 'b'
      ? <Frame active="new" dock={<TermStack />}><EditorView stat /></Frame>
      : <Frame active="new" modal={<ExportDialog />} dock={<TermExport />}><EditorView stat /></Frame>

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
          <div className="pf-cta">
            <div className="pf-cta-row">
              <a className="pf-btn pf-primary" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}><Download />Download for Windows</a>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}><Copy />Copy clone command</button>
            </div>
            <p className="pf-fine">v1.0.6, Windows x64, about 246 MB. Unzip the whole folder and run it.</p>
          </div>
          <div className="pf-stage" id="hero-win">
            <Frame dock={<TermHero />}><HomeView /><EditorView /></Frame>
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

      {scenes.map((s, n) => (
        <React.Fragment key={s.id}>
          <section className="pf-scene" id={'scene-' + s.id}>
            <div className="pf-wrap pf-sc-stick">
              <div className="pf-sc-head">
                <h2 className="pf-h2">{s.h}</h2>
                <p className="pf-cs">{s.caps.map((c, i) => <span key={c} className={i === 0 ? 'on' : ''}>{c}</span>)}</p>
              </div>
              <div className="pf-stage">{sceneWin(s.id)}</div>
            </div>
          </section>

          {n === 0 && (
            <section className="pf-wrap pf-section" id="platforms">
              <div className="pf-sec-head">
                <span className="pf-badge ready">Ready today</span>
                <h2 className="pf-h2">One tatemono, every place it runs.</h2>
                <p className="pf-muted">Pick a stack and the same file runs on it. Some backends are further along than others, and the repo keeps a checklist of the gaps.</p>
              </div>
              <div className="pf-card pf-plat">
                {platforms.map((p) => (
                  <div className="pf-plat-row" key={p.t}>
                    <div><h3>{p.t}</h3><p>{p.n}</p></div>
                    <div className="pf-chips">{p.c.map((c) => <Chip key={c[0] + c[1]} id={c[0]} label={c[1]} />)}</div>
                  </div>
                ))}
              </div>
              <p className="pf-note"><a className="pf-link" href={PLAN('BACKEND_PARITY_CHECKLIST.md')} target="_blank" rel="noreferrer">Read the backend parity checklist<ArrowUpRight /></a></p>
            </section>
          )}
        </React.Fragment>
      ))}

      <section className="pf-wrap pf-section" id="next">
        <div className="pf-next-grid">
          <div className="pf-next-l">
            <span className="pf-badge planned">Planned</span>
            <h2 className="pf-h2">What is coming.</h2>
            <p className="pf-muted">Seven plans are written up in the repo. None of them is built yet, so read this as a map, not a promise.</p>
          </div>
          <div className="pf-next-list">
            {plans.map((p) => (
              <article className="pf-card pf-plan" key={p.t}>
                <h3 className="pf-h3">{p.t}</h3>
                <p>{p.d}</p>
                <div className="pf-plan-foot">
                  <div className="pf-chips">{p.c.map((c) => <Chip key={c[0] + c[1]} id={c[0]} label={c[1]} />)}</div>
                  <a className="pf-link" href={PLAN(p.f)} target="_blank" rel="noreferrer">Read the plan<ArrowUpRight /></a>
                </div>
              </article>
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
          <figure className="pf-card pf-fig"><img src={IMG_BASE + 'built-kotoba.webp'} alt="Kotoba homepage, built with Pluffy" loading="lazy" /><figcaption><b>Kotoba</b><span>A social language-learning app, Next.js</span></figcaption></figure>
          <figure className="pf-card pf-fig"><img src={IMG_BASE + 'built-kairo.webp'} alt="Kairo homepage, built with Pluffy" loading="lazy" /><figcaption><b>Kairo</b><span>Next.js</span></figcaption></figure>
          <figure className="pf-card pf-fig"><img src={IMG_BASE + 'built-rubik.webp'} alt="Rubik Solver, built with Pluffy" loading="lazy" /><figcaption><b>Rubik Solver</b><span>React and Vite</span></figcaption></figure>
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
              <a className="pf-link" style={{ alignSelf: 'center' }} href={RELEASE_URL} target="_blank" rel="noreferrer">Release v1.0.6 notes<ArrowUpRight /></a>
            </div>
          </div>
          <div>
            <p className="pf-muted" style={{ marginBottom: 12 }}>On Mac or Linux, run it from source:</p>
            <div className="pf-code"><div>{CLONE_CMD}</div><div>cd Pluffy/gui</div><div>npm install</div><div>npm start</div></div>
            <div className="pf-cta-row" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}><Copy />Copy clone command</button>
            </div>
            <p className="pf-fine" style={{ marginTop: 12 }}>The Windows build is not code signed yet.</p>
          </div>
        </div>
      </section>

      <footer className="pf-wrap pf-foot">
        <span>Pluffy by Mizumi. Logos belong to their owners.</span>
        <nav aria-label="Footer"><a className="pf-link" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a><a className="pf-link" href={RELEASE_URL} target="_blank" rel="noreferrer">Releases</a><a className="pf-link" href={PLAN('PLUFF_GUIDELINES_v14.md')} target="_blank" rel="noreferrer">Language guide</a></nav>
      </footer>

      <div className={'pf-toast' + (toast ? ' on' : '')} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}

/* @arkzen:web:page:index:end */
