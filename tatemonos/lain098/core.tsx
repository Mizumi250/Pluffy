/* @arkzen:meta
name: lain098
version: 1.0.0
description: "Lain098_ — Digital Art Portfolio & Commission site. Sky-blue dreamy calm aesthetic. GSAP ScrollTrigger scroll-driven reveals, parallax, magnetic buttons, floating art cards (collage ref), animated SVG stroke hero title, staggered grid gallery, commission type cards, process timeline, marquee. Frontend-only. By Mizumi for Lain098_."
auth: false
*/

/* @arkzen:meta:web
favicon: 🩵
title: Lain098_ — Digital Artist
description: Hello I'm Lain — a digital artist whose work focuses on anime style illustrations, fanart, OCs, chibi, and short animations. Open for commissions.
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "lain-root"
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Instagram, ExternalLink, Heart, Star, ArrowRight,
  ChevronDown, Menu, X, Sparkles, Send
} from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Commissions', href: '#commissions' },
  { label: 'Contact', href: '#contact' },
]

const ART_TYPES = [
  'Anime Illustrations', '✦', 'Fanart', '✦', 'Original Characters',
  '✦', 'Chibi Art', '✦', 'Short Animations', '✦', 'Character Design',
  '✦', 'Anime Illustrations', '✦', 'Fanart', '✦', 'Original Characters',
  '✦', 'Chibi Art', '✦', 'Short Animations', '✦', 'Character Design', '✦',
]

const GALLERY_ITEMS = [
  {
    tag: 'OC Design',
    title: 'Crystal Reverie',
    img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=600&q=80',
    span: 'wide',
  },
  {
    tag: 'Chibi',
    title: 'Tiny Wisteria',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
    span: 'normal',
  },
  {
    tag: 'Fanart',
    title: 'Star & Sky',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    span: 'normal',
  },
  {
    tag: 'OC Design',
    title: 'Blue Horizon',
    img: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80',
    span: 'normal',
  },
  {
    tag: 'Animation',
    title: 'Loop of Spring',
    img: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=500&q=80',
    span: 'normal',
  },
  {
    tag: 'Fanart',
    title: 'Sakura Path',
    img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80',
    span: 'wide',
  },
  {
    tag: 'Chibi',
    title: 'Cloud Dancer',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    span: 'normal',
  },
  {
    tag: 'OC Design',
    title: 'Sea Glass Heart',
    img: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=400&q=80',
    span: 'normal',
  },
]

const COMM_TYPES = [
  {
    icon: '✦',
    tier: 'Bust / Half-body',
    name: 'Illustration',
    desc: 'Clean lineart with full color shading. Perfect for character portraits, OC reveals, or profile art.',
    start: '$25',
    delay: 0,
  },
  {
    icon: '◈',
    tier: 'Full-body',
    name: 'Illustration',
    desc: 'Full character with detailed pose, expression, and background elements. Great for OCs and fanart.',
    start: '$45',
    delay: 0.08,
  },
  {
    icon: '⟡',
    tier: 'Tiny & Cute',
    name: 'Chibi',
    desc: 'Adorable simplified chibi style. Perfect for sticker packs, emotes, or just because they\'re the cutest.',
    start: '$18',
    delay: 0.16,
  },
  {
    icon: '⌘',
    tier: 'Moving Art',
    name: 'Animation',
    desc: 'Short looping GIF animations — blinking, breathing, effects. Bring your character to life.',
    start: '$60',
    delay: 0.24,
  },
]

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Inquiry & Quote',
    desc: 'Fill out my commission form on Throne or DM me on Instagram with your reference, style preference, and details.',
  },
  {
    num: '02',
    title: 'Sketch & Approval',
    desc: 'I send you a rough sketch first. We tweak until you\'re happy — no surprises in the final piece.',
  },
  {
    num: '03',
    title: 'Lineart & Color',
    desc: 'Clean lines, color blocking, full shading and details. WIP previews shared along the way.',
  },
  {
    num: '04',
    title: 'Final Delivery',
    desc: 'High-resolution PNG delivered. Transparent backgrounds available on request.',
  },
  {
    num: '05',
    title: 'Enjoy your art ✦',
    desc: 'Tag me if you post it — I love seeing where my pieces end up. Your support means everything 🩵',
  },
]

const FLOAT_IMGS = [
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&q=80',
  'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=300&q=80',
  'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=300&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80',
]

// ── HELPERS ──────────────────────────────────────────────────────────────────

function smoothScroll(href: string) {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Dancing+Script:wght@500&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap');

/* ── RESET & ROOT ─────────────────────────────────── */
.lain-root {
  margin: 0; padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: #f0f9ff;
  color: #1a2332;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  cursor: none;
}
*, *::before, *::after { box-sizing: border-box; }
a { text-decoration: none; color: inherit; }
img { display: block; }

/* ── CUSTOM CURSOR ────────────────────────────────── */
.lain-cursor {
  position: fixed;
  width: 10px; height: 10px;
  background: #60b8e0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transform: translate(-50%, -50%);
  transition: width 0.2s ease, height 0.2s ease, background 0.2s ease;
  mix-blend-mode: multiply;
}
.lain-cursor.hovered { width: 18px; height: 18px; background: #3BA3CE; }

.lain-cursor-ring {
  position: fixed;
  width: 40px; height: 40px;
  border: 1.5px solid rgba(96,184,224,0.55);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transform: translate(-50%, -50%);
  transition: width 0.28s ease, height 0.28s ease;
}
.lain-cursor-ring.hovered { width: 56px; height: 56px; }

/* ── LOADER ───────────────────────────────────────── */
#lain-loader {
  position: fixed; inset: 0;
  background: #87CEEB;
  z-index: 9999;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 1.25rem;
  pointer-events: all;
}
#lain-loader-name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-style: italic;
  color: white;
  letter-spacing: 0.04em;
  opacity: 0;
  transform: translateY(24px);
}
#lain-loader-sub {
  font-family: 'Dancing Script', cursive;
  font-size: 1.3rem;
  color: rgba(255,255,255,0.8);
  opacity: 0;
  transform: translateY(14px);
}
#lain-loader-bar-wrap {
  width: 140px; height: 2px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
}
#lain-loader-bar {
  height: 100%; width: 0%;
  background: white;
  border-radius: 2px;
}

/* ── PARTICLES ────────────────────────────────────── */
.lain-particles {
  position: fixed; inset: 0;
  pointer-events: none; z-index: 1;
  overflow: hidden;
}
.lain-particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  animation: lainFloat var(--dur, 8s) var(--delay, 0s) infinite ease-in-out;
}
@keyframes lainFloat {
  0%   { opacity: 0; transform: translateY(0) scale(0.8); }
  15%  { opacity: var(--op, 0.35); }
  85%  { opacity: var(--op, 0.35); }
  100% { opacity: 0; transform: translateY(-110vh) scale(1.1); }
}

/* ── NAV ──────────────────────────────────────────── */
#lain-nav {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 1.4rem 3rem;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.4s, backdrop-filter 0.4s, border-color 0.4s;
}
#lain-nav.scrolled {
  background: rgba(240,249,255,0.88);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(135,206,235,0.3);
}
.lain-nav-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem; font-weight: 500; font-style: italic;
  color: #1a2332; letter-spacing: 0.02em;
}
.lain-nav-logo span { color: #3BA3CE; }
.lain-nav-links {
  display: flex; gap: 2.5rem; list-style: none;
  margin: 0; padding: 0;
}
.lain-nav-links a {
  font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: #5a7080;
  position: relative;
  transition: color 0.2s;
}
.lain-nav-links a::after {
  content: ''; position: absolute;
  bottom: -3px; left: 0; right: 0; height: 1px;
  background: #60b8e0;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
}
.lain-nav-links a:hover { color: #3BA3CE; }
.lain-nav-links a:hover::after { transform: scaleX(1); }
.lain-nav-cta {
  font-size: 0.74rem; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 0.55rem 1.3rem;
  border: 1.5px solid #87CEEB; border-radius: 999px;
  color: #3BA3CE; background: transparent;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.lain-nav-cta:hover { background: #60b8e0; border-color: #60b8e0; color: white; }
.lain-nav-burger {
  display: none;
  background: none; border: none; cursor: pointer;
  color: #1a2332;
}

/* ── HERO ─────────────────────────────────────────── */
.lain-hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  padding: 8rem 2rem 5rem;
  background: linear-gradient(155deg, #e0f2fe 0%, #f0f9ff 45%, #fce4ec22 75%, #e0f7f4 100%);
}

/* Blobs */
.lain-blob {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: 0.3;
  animation: blobDrift var(--bd, 12s) ease-in-out infinite alternate;
  pointer-events: none;
}
@keyframes blobDrift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(var(--bx, 30px), var(--by, -20px)) scale(1.07); }
}

/* Floating art cards — collage/scrapbook ref */
.lain-float-card {
  position: absolute;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  opacity: 0;
  will-change: transform;
}
.lain-float-card img { width: 100%; height: 100%; object-fit: cover; }
.lain-float-card:nth-child(1) { width: 180px; height: 220px; top: 14%; left: 4%; transform: rotate(-4deg); }
.lain-float-card:nth-child(2) { width: 140px; height: 170px; top: 18%; right: 6%; transform: rotate(5deg); }
.lain-float-card:nth-child(3) { width: 130px; height: 155px; bottom: 18%; left: 7%; transform: rotate(3deg); }
.lain-float-card:nth-child(4) { width: 160px; height: 135px; bottom: 22%; right: 4%; transform: rotate(-5deg); }

/* Hero eyebrow */
.lain-hero-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: #3BA3CE;
  opacity: 0; transform: translateY(18px);
  position: relative; z-index: 2;
}
/* Animated SVG stroke hero — COVEO inspired */
.lain-hero-svg-wrap {
  position: relative; z-index: 2;
  width: min(520px, 88vw); margin: 1rem 0;
  opacity: 0;
}
.lain-hero-svg-wrap svg { overflow: visible; width: 100%; }
.lain-hero-svg-wrap path {
  fill: none;
  stroke: #87CEEB;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: lainDraw var(--sd, 1.4s) var(--sd-delay, 0.3s) cubic-bezier(0.16,1,0.3,1) forwards;
}
@keyframes lainDraw { to { stroke-dashoffset: 0; } }

.lain-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(3.2rem, 8vw, 6.5rem);
  font-weight: 400; line-height: 1; letter-spacing: -0.02em;
  color: #1a2332;
  position: relative; z-index: 2; text-align: center;
  opacity: 0; transform: translateY(36px);
}
.lain-hero-title em { font-style: italic; color: #3BA3CE; }

.lain-hero-sub {
  font-size: clamp(0.9rem, 1.8vw, 1.05rem);
  color: #5a7080; max-width: 460px;
  text-align: center; line-height: 1.75;
  position: relative; z-index: 2; margin-top: 1.25rem;
  opacity: 0; transform: translateY(18px);
}

.lain-hero-ctas {
  display: flex; gap: 1rem; margin-top: 2.2rem;
  position: relative; z-index: 2;
  opacity: 0; transform: translateY(16px);
}

.lain-btn-primary {
  padding: 0.85rem 2rem;
  background: #60b8e0; color: white;
  border: none; border-radius: 999px;
  font-size: 0.82rem; letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(96,184,224,0.4);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.lain-btn-primary:hover { background: #3BA3CE; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(96,184,224,0.5); }

.lain-btn-outline {
  padding: 0.85rem 2rem;
  background: transparent; color: #3BA3CE;
  border: 1.5px solid #87CEEB; border-radius: 999px;
  font-size: 0.82rem; letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.lain-btn-outline:hover { background: rgba(135,206,235,0.15); border-color: #60b8e0; transform: translateY(-2px); }

.lain-scroll-hint {
  position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: #60b8e0; z-index: 2; opacity: 0;
}
.lain-scroll-line {
  width: 1px; height: 54px;
  background: linear-gradient(to bottom, #60b8e0, transparent);
  animation: scrollLinePulse 2s ease-in-out infinite;
}
@keyframes scrollLinePulse {
  0%, 100% { transform: scaleY(1); opacity: 1; }
  50% { transform: scaleY(0.55); opacity: 0.35; }
}

/* ── MARQUEE ──────────────────────────────────────── */
.lain-marquee-section {
  padding: 2.8rem 0;
  background: #87CEEB;
  overflow: hidden;
  position: relative; z-index: 2;
}
.lain-marquee-section::before,
.lain-marquee-section::after {
  content: ''; position: absolute;
  top: 0; bottom: 0; width: 80px; z-index: 2; pointer-events: none;
}
.lain-marquee-section::before { left: 0; background: linear-gradient(to right, #87CEEB, transparent); }
.lain-marquee-section::after  { right: 0; background: linear-gradient(to left, #87CEEB, transparent); }

.lain-marquee-track {
  display: flex; gap: 2.5rem; align-items: center;
  animation: lainMarquee 22s linear infinite;
  white-space: nowrap;
}
.lain-marquee-track:hover { animation-play-state: paused; }
@keyframes lainMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.lain-marquee-item {
  font-family: 'Playfair Display', serif;
  font-size: 1rem; font-style: italic;
  color: white; flex-shrink: 0;
}

/* ── ABOUT ────────────────────────────────────────── */
.lain-about {
  padding: 9rem 2rem;
  background: #f8fbff;
}
.lain-about-inner {
  max-width: 1080px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 5rem;
  align-items: center;
}
.lain-about-stack {
  position: relative; height: 500px;
}
.lain-about-img {
  position: absolute;
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 14px 48px rgba(96,184,224,0.18);
  opacity: 0;
}
.lain-about-img img { width: 100%; height: 100%; object-fit: cover; }
.lain-about-img:nth-child(1) { width: 68%; height: 66%; top: 0; left: 0; transform: rotate(-3deg) translateX(-30px); }
.lain-about-img:nth-child(2) { width: 58%; height: 56%; bottom: 0; right: 0; transform: rotate(4deg) translateX(30px); }
.lain-about-img:nth-child(3) { width: 48%; height: 48%; top: 42%; left: 18%; transform: translateY(30px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }

.lain-about-content { opacity: 0; transform: translateX(36px); }
.lain-section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.64rem; letter-spacing: 0.24em; text-transform: uppercase;
  color: #3BA3CE; display: block; margin-bottom: 1rem;
}
.lain-about-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 400; line-height: 1.2;
  margin: 0 0 1.5rem;
}
.lain-about-title em { color: #3BA3CE; font-style: italic; }
.lain-about-text {
  font-size: 0.93rem; line-height: 1.82;
  color: #5a7080; margin-bottom: 0.9rem;
}
.lain-tags {
  display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.8rem 0;
}
.lain-tag {
  padding: 0.3rem 0.9rem;
  background: rgba(135,206,235,0.18);
  border: 1px solid rgba(135,206,235,0.45);
  border-radius: 999px;
  font-size: 0.73rem; letter-spacing: 0.07em;
  color: #3BA3CE;
}

/* ── GALLERY ──────────────────────────────────────── */
.lain-gallery { padding: 8rem 2rem; background: #f0f9ff; }
.lain-gallery-header {
  max-width: 1080px; margin: 0 auto 3.5rem;
  display: flex; align-items: flex-end; justify-content: space-between;
}
.lain-gallery-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 400; line-height: 1.1; margin: 0.75rem 0 0;
}
.lain-gallery-title em { color: #3BA3CE; font-style: italic; }
.lain-gallery-filters { display: flex; gap: 0.5rem; }
.lain-filter-btn {
  padding: 0.38rem 0.95rem;
  border: 1px solid rgba(135,206,235,0.45);
  border-radius: 999px; background: transparent;
  font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: #5a7080; cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.lain-filter-btn.active,
.lain-filter-btn:hover { background: #60b8e0; border-color: #60b8e0; color: white; }

.lain-gallery-grid {
  max-width: 1080px; margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.2rem;
}
.lain-art-card {
  border-radius: 16px; overflow: hidden;
  position: relative; cursor: pointer;
  opacity: 0; transform: translateY(40px);
}
.lain-art-card.wide { grid-column: span 7; }
.lain-art-card.normal { grid-column: span 5; }
.lain-art-card:nth-child(1) { grid-column: 1 / 8; }
.lain-art-card:nth-child(2) { grid-column: 8 / 13; }
.lain-art-card:nth-child(3) { grid-column: 1 / 5; }
.lain-art-card:nth-child(4) { grid-column: 5 / 9; }
.lain-art-card:nth-child(5) { grid-column: 9 / 13; }
.lain-art-card:nth-child(6) { grid-column: 1 / 7; }
.lain-art-card:nth-child(7) { grid-column: 7 / 10; }
.lain-art-card:nth-child(8) { grid-column: 10 / 13; }
.lain-art-card-img-wrap { position: relative; padding-top: 110%; background: #bae6fd; }
.lain-art-card:nth-child(1) .lain-art-card-img-wrap,
.lain-art-card:nth-child(6) .lain-art-card-img-wrap { padding-top: 70%; }
.lain-art-card img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.55s cubic-bezier(0.16,1,0.3,1);
}
.lain-art-card:hover img { transform: scale(1.06); }
.lain-art-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(26,35,50,0.72) 0%, transparent 55%);
  opacity: 0; transition: opacity 0.35s;
  display: flex; flex-direction: column;
  justify-content: flex-end; padding: 1.3rem;
}
.lain-art-card:hover .lain-art-card-overlay { opacity: 1; }
.lain-art-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: #bae6fd; margin-bottom: 0.25rem;
}
.lain-art-name {
  font-family: 'Playfair Display', serif;
  font-size: 1rem; font-style: italic; color: white;
}

/* ── COMMISSIONS ──────────────────────────────────── */
.lain-commissions { padding: 8rem 2rem; background: #f8fbff; }
.lain-commissions-inner { max-width: 1080px; margin: 0 auto; }
.lain-commissions-head { margin-bottom: 3.5rem; }
.lain-commissions-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 400; margin: 0.75rem 0 1rem;
}
.lain-commissions-title em { color: #3BA3CE; font-style: italic; }
.lain-comm-status {
  display: inline-flex; align-items: center; gap: 0.55rem;
  padding: 0.45rem 1.1rem;
  background: #e0f7ea; border-radius: 999px;
  font-size: 0.74rem; letter-spacing: 0.07em; text-transform: uppercase;
  color: #2d7a4a; margin-bottom: 1.2rem;
}
.lain-comm-status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #2d7a4a;
  animation: statusPulse 1.5s ease-in-out infinite;
}
@keyframes statusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

.lain-comm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.4rem;
}
.lain-comm-card {
  background: #f0f9ff;
  border: 1.5px solid rgba(135,206,235,0.3);
  border-radius: 20px; padding: 2rem;
  position: relative; overflow: hidden; cursor: pointer;
  opacity: 0; transform: translateY(30px);
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}
.lain-comm-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(to right, #87CEEB, #3BA3CE);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
}
.lain-comm-card:hover { border-color: rgba(135,206,235,0.65); box-shadow: 0 8px 30px rgba(96,184,224,0.18); transform: translateY(-3px); }
.lain-comm-card:hover::before { transform: scaleX(1); }
.lain-comm-icon { font-size: 1.8rem; margin-bottom: 1.1rem; }
.lain-comm-tier {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #3BA3CE; margin-bottom: 0.4rem;
}
.lain-comm-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem; font-weight: 500;
  color: #1a2332; margin-bottom: 0.5rem;
}
.lain-comm-desc {
  font-size: 0.83rem; line-height: 1.75;
  color: #5a7080; margin-bottom: 1.5rem;
}
.lain-comm-price {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem; font-style: italic; color: #3BA3CE;
}
.lain-comm-price span { font-family: 'Inter', sans-serif; font-style: normal; font-size: 0.82rem; color: #5a7080; }

/* ── PROCESS ──────────────────────────────────────── */
.lain-process {
  padding: 8rem 2rem;
  background: linear-gradient(180deg, #e0f2fe 0%, #f8fbff 100%);
}
.lain-process-inner { max-width: 760px; margin: 0 auto; }
.lain-process-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3.2vw, 2.5rem);
  font-weight: 400; text-align: center;
  margin: 0.75rem 0 4rem;
}
.lain-process-title em { color: #3BA3CE; font-style: italic; }
.lain-steps { position: relative; }
.lain-steps-line {
  position: absolute; left: 24px; top: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, #87CEEB, rgba(135,206,235,0.1));
}
.lain-step {
  display: flex; gap: 2rem; margin-bottom: 3rem;
  opacity: 0; transform: translateX(-28px);
}
.lain-step-num {
  flex-shrink: 0;
  width: 48px; height: 48px; border-radius: 50%;
  background: #f0f9ff; border: 1.5px solid #87CEEB;
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem; color: #3BA3CE;
  position: relative; z-index: 1;
}
.lain-step-body { padding-top: 0.55rem; }
.lain-step-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.08rem; font-style: italic;
  color: #1a2332; margin-bottom: 0.4rem;
}
.lain-step-desc { font-size: 0.88rem; line-height: 1.75; color: #5a7080; }

/* ── SKY TEXT REVEAL ──────────────────────────────── */
.lain-reveal-section {
  padding: 10rem 2rem;
  background: #60b8e0;
  position: relative; overflow: hidden;
}
.lain-reveal-bg-word {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: 'Playfair Display', serif;
  font-size: clamp(7rem, 18vw, 15rem);
  font-style: italic; font-weight: 700;
  color: rgba(255,255,255,0.07);
  white-space: nowrap; pointer-events: none; user-select: none;
  letter-spacing: -0.02em;
}
.lain-reveal-content {
  max-width: 780px; margin: 0 auto;
  text-align: center; position: relative; z-index: 2;
}
.lain-reveal-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem; letter-spacing: 0.24em; text-transform: uppercase;
  color: rgba(255,255,255,0.55); margin-bottom: 1.5rem;
}
.lain-reveal-word {
  display: inline-block;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.4rem, 3vw, 2.3rem);
  font-style: italic; color: white;
  opacity: 0; transform: translateY(28px);
  margin-right: 0.3em;
}
.lain-reveal-sig {
  margin-top: 2.5rem;
  font-family: 'Dancing Script', cursive;
  font-size: 1.6rem; color: rgba(255,255,255,0.7);
}

/* ── CONTACT ──────────────────────────────────────── */
.lain-contact { padding: 8rem 2rem; background: #f8fbff; }
.lain-contact-inner {
  max-width: 680px; margin: 0 auto; text-align: center;
}
.lain-contact-avatar {
  width: 116px; height: 116px; border-radius: 50%;
  overflow: hidden; margin: 0 auto 2rem;
  border: 4px solid #87CEEB;
  box-shadow: 0 0 0 8px rgba(135,206,235,0.18);
  opacity: 0; transform: scale(0.8);
}
.lain-contact-avatar img { width: 100%; height: 100%; object-fit: cover; }
.lain-contact-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 400; margin: 0.75rem 0 1rem;
}
.lain-contact-title em { color: #3BA3CE; font-style: italic; }
.lain-contact-text {
  font-size: 0.95rem; line-height: 1.75; color: #5a7080;
  max-width: 460px; margin: 0 auto 2.5rem;
}
.lain-socials { display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: center; margin-bottom: 2.5rem; }
.lain-social-link {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 1.4rem;
  border: 1.5px solid rgba(135,206,235,0.45);
  border-radius: 999px;
  font-size: 0.8rem; letter-spacing: 0.05em;
  color: #1a2332;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.lain-social-link:hover { background: rgba(135,206,235,0.18); border-color: #60b8e0; transform: translateY(-2px); }

/* ── FOOTER ───────────────────────────────────────── */
.lain-footer {
  padding: 2.2rem 3rem;
  border-top: 1px solid rgba(135,206,235,0.25);
  background: #e0f2fe;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 1rem;
}
.lain-footer-copy {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem; letter-spacing: 0.1em; color: #5a7080;
}
.lain-footer-sig {
  font-family: 'Dancing Script', cursive;
  font-size: 1.4rem; color: #60b8e0;
}
.lain-footer-links { display: flex; gap: 1.5rem; list-style: none; margin: 0; padding: 0; }
.lain-footer-links a {
  font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: #5a7080;
  transition: color 0.2s;
}
.lain-footer-links a:hover { color: #3BA3CE; }

/* ── RESPONSIVE ───────────────────────────────────── */
@media (max-width: 860px) {
  #lain-nav { padding: 1.1rem 1.5rem; }
  .lain-nav-links { display: none; }
  .lain-nav-burger { display: flex; }
  .lain-about-inner { grid-template-columns: 1fr; gap: 3rem; }
  .lain-about-stack { height: 280px; }
  .lain-gallery-header { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
  .lain-gallery-grid { grid-template-columns: repeat(2,1fr); gap: 0.8rem; }
  .lain-art-card { grid-column: span 1 !important; }
  .lain-art-card-img-wrap { padding-top: 100% !important; }
  .lain-float-card { display: none; }
  .lain-footer { flex-direction: column; text-align: center; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* @arkzen:web:style:end */

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const lain098Animations = (pageRef: React.RefObject<HTMLDivElement>) => {
  gsap.registerPlugin(ScrollTrigger)

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
/* @arkzen:web:animation:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const cursorRef     = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const cursorTarget = useRef({ x: -200, y: -200 })
  const rafRef = useRef<number>(0)

  // ── Cursor ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.set(cursorRef.current, { x: e.clientX, y: e.clientY })
      }
      cursorTarget.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)
    const tick = () => {
      if (cursorRingRef.current) {
        const cur = {
          x: parseFloat(cursorRingRef.current.style.left || '-200'),
          y: parseFloat(cursorRingRef.current.style.top  || '-200'),
        }
        const next = {
          x: cur.x + (cursorTarget.current.x - cur.x) * 0.14,
          y: cur.y + (cursorTarget.current.y - cur.y) * 0.14,
        }
        gsap.set(cursorRingRef.current, { x: next.x, y: next.y })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── Cursor hover ──────────────────────────────────────────────────────────
  useEffect(() => {
    const targets = pageRef.current?.querySelectorAll('a, button, .lain-art-card, .lain-comm-card')
    const onEnter = () => {
      cursorRef.current?.classList.add('hovered')
      cursorRingRef.current?.classList.add('hovered')
    }
    const onLeave = () => {
      cursorRef.current?.classList.remove('hovered')
      cursorRingRef.current?.classList.remove('hovered')
    }
    targets?.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    return () => targets?.forEach(el => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    })
  }, [])

  // ── GSAP animations ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = lain098Animations(pageRef as React.RefObject<HTMLDivElement>)
    return cleanup
  }, [])

  // ── Magnetic CTA ──────────────────────────────────────────────────────────
  const handleMagnet = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, strength = 0.35) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    gsap.to(e.currentTarget, {
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
      duration: 0.3, ease: 'power2.out',
    })
  }, [])

  const handleMagnetLeave = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
  }, [])

  const REVEAL_WORDS = ['Art', 'made', 'with', 'love,', 'for', 'the', 'dreamers', 'and', 'wanderers', 'of', 'the', 'internet.']
  const ABOUT_IMGS = [
    'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=600&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80',
  ]

  const filteredGallery = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(g => g.tag.toLowerCase().includes(activeFilter))

  return (
    <div ref={pageRef} style={{ position: 'relative' }}>

      {/* ── Cursor ──────────────────────────────────────────────────────── */}
      <div ref={cursorRef} className="lain-cursor" />
      <div ref={cursorRingRef} className="lain-cursor-ring" />

      {/* ── Loader ──────────────────────────────────────────────────────── */}
      <div id="lain-loader">
        <div id="lain-loader-name">Lain098_</div>
        <div id="lain-loader-sub">digital artist</div>
        <div id="lain-loader-bar-wrap">
          <div id="lain-loader-bar" />
        </div>
      </div>

      {/* ── Sky particles ───────────────────────────────────────────────── */}
      <div className="lain-particles" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="lain-particle"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${10 + Math.random() * 10}px`,
              width:  `${4 + Math.random() * 10}px`,
              height: `${4 + Math.random() * 10}px`,
              background: `hsl(${195 + Math.random() * 22}, ${55 + Math.random() * 30}%, ${65 + Math.random() * 22}%)`,
              ['--dur' as string]:   `${6 + Math.random() * 8}s`,
              ['--delay' as string]: `${Math.random() * 7}s`,
              ['--op' as string]:    `${0.18 + Math.random() * 0.3}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav id="lain-nav">
        <a href="#" className="lain-nav-logo">
          Lain<span>098_</span>
        </a>
        <ul className="lain-nav-links">
          {NAV_LINKS.map(n => (
            <li key={n.label}>
              <a href={n.href} onClick={e => { e.preventDefault(); smoothScroll(n.href) }}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="https://throne.com/lain098_"
          target="_blank"
          rel="noopener noreferrer"
          className="lain-nav-cta"
          onMouseMove={handleMagnet as any}
          onMouseLeave={handleMagnetLeave as any}
        >
          Commission Me
        </a>
        <button
          className="lain-nav-burger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(p => !p)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(224,242,254,0.97)',
          backdropFilter: 'blur(16px)', zIndex: 999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '2.5rem',
        }}>
          <button
            style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMenuOpen(false)}
          >
            <X size={26} />
          </button>
          {NAV_LINKS.map(n => (
            <a
              key={n.label}
              href={n.href}
              style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontStyle: 'italic', color: '#1a2332' }}
              onClick={e => { e.preventDefault(); smoothScroll(n.href); setMenuOpen(false) }}
            >
              {n.label}
            </a>
          ))}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-hero">
        {/* Blobs */}
        <div className="lain-blob" style={{ width: 500, height: 500, top: -100, right: -80, background: '#bae6fd', ['--bd' as string]: '13s', ['--bx' as string]: '35px', ['--by' as string]: '-25px' } as React.CSSProperties} />
        <div className="lain-blob" style={{ width: 280, height: 280, bottom: 60, left: -40, background: '#fce4ec', ['--bd' as string]: '10s', ['--bx' as string]: '-25px', ['--by' as string]: '18px' } as React.CSSProperties} />
        <div className="lain-blob" style={{ width: 200, height: 200, bottom: 200, right: 220, background: '#e0f7f4', ['--bd' as string]: '11s', ['--bx' as string]: '18px', ['--by' as string]: '-35px' } as React.CSSProperties} />

        {/* Floating collage cards */}
        {FLOAT_IMGS.map((src, i) => (
          <div key={i} className="lain-float-card">
            <img src={src} alt="" />
          </div>
        ))}

        {/* Content */}
        <p className="lain-hero-eyebrow">✦ Digital Artist · Anime · OC · Chibi · Animations</p>

        {/* COVEO-style animated SVG script stroke */}
        <div className="lain-hero-svg-wrap" aria-hidden="true">
          <svg viewBox="0 0 520 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 40 C25 18, 55 12, 75 32 C88 46, 105 50, 125 37 C142 24, 158 18, 178 36 C192 50, 208 52, 228 40"
              style={{ '--sd': '1.3s', '--sd-delay': '2.9s' } as React.CSSProperties}
            />
            <path
              d="M248 36 C264 20, 284 15, 304 33 C318 46, 336 50, 356 37 C370 26, 388 20, 410 38 C426 52, 446 55, 466 42 C478 34, 492 28, 508 38"
              style={{ '--sd': '1.3s', '--sd-delay': '3.7s' } as React.CSSProperties}
            />
          </svg>
        </div>

        <h1 className="lain-hero-title">
          Hello, I'm <em>Lain</em>
        </h1>

        <p className="lain-hero-sub">
          A digital artist crafting anime illustrations, fanart, original characters, chibi, and short animations — art for people who feel everything a little too deeply.
        </p>

        <div className="lain-hero-ctas">
          <a
            href="https://throne.com/lain098_"
            target="_blank"
            rel="noopener noreferrer"
            className="lain-btn-primary"
            onMouseMove={handleMagnet as any}
            onMouseLeave={handleMagnetLeave as any}
          >
            Commission Me ✦
          </a>
          <button
            className="lain-btn-outline"
            onClick={() => smoothScroll('#gallery')}
            onMouseMove={e => handleMagnet(e as any, 0.3)}
            onMouseLeave={handleMagnetLeave as any}
          >
            View Gallery
          </button>
        </div>

        <div className="lain-scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <div className="lain-scroll-line" />
        </div>
      </section>

      {/* ── Art-type Marquee ─────────────────────────────────────────────── */}
      <div className="lain-marquee-section" aria-hidden="true">
        <div className="lain-marquee-track">
          {[...ART_TYPES, ...ART_TYPES].map((t, i) => (
            <span key={i} className="lain-marquee-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          ABOUT
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-about" id="about">
        <div className="lain-about-inner">
          {/* Image stack — collage ref */}
          <div className="lain-about-stack">
            {ABOUT_IMGS.map((src, i) => (
              <div key={i} className="lain-about-img">
                <img src={src} alt="Art example" />
              </div>
            ))}
          </div>

          <div className="lain-about-content">
            <span className="lain-section-label">— About Lain</span>
            <h2 className="lain-about-title">
              Art that feels like a quiet <em>sunny afternoon</em>
            </h2>
            <p className="lain-about-text">
              Hello! I'm Lain — a digital artist who draws anime-style illustrations, fanart of characters I love, original characters with full backstories, and tiny chibi versions of everything.
            </p>
            <p className="lain-about-text">
              Every piece I make is personal. I want the person receiving my art to feel something — a memory, a daydream, a warmth they can't quite name. That's what I'm always chasing.
            </p>
            <div className="lain-tags">
              {['Anime Style', 'Fanart', 'OC Design', 'Chibi', 'Animations', 'Digital'].map(tag => (
                <span key={tag} className="lain-tag">{tag}</span>
              ))}
            </div>
            <a
              href="https://www.instagram.com/lain098_"
              target="_blank"
              rel="noopener noreferrer"
              className="lain-btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Instagram size={14} />
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          GALLERY
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-gallery" id="gallery">
        <div className="lain-gallery-header">
          <div>
            <span className="lain-section-label">— Portfolio</span>
            <h2 className="lain-gallery-title">Selected <em>Works</em></h2>
          </div>
          <div className="lain-gallery-filters">
            {['all', 'oc', 'fanart', 'chibi', 'animation'].map(f => (
              <button
                key={f}
                className={`lain-filter-btn${activeFilter === f ? ' active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="lain-gallery-grid">
          {GALLERY_ITEMS.map((item, i) => (
            <div key={i} className="lain-art-card">
              <div className="lain-art-card-img-wrap">
                <img src={item.img} alt={item.title} />
                <div className="lain-art-card-overlay">
                  <span className="lain-art-tag">{item.tag}</span>
                  <span className="lain-art-name">{item.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          COMMISSIONS
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-commissions" id="commissions">
        <div className="lain-commissions-inner">
          <div className="lain-commissions-head">
            <span className="lain-section-label">— Commissions</span>
            <h2 className="lain-commissions-title">
              Let me draw <em>your</em> vision
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="lain-comm-status">
                <span className="lain-comm-status-dot" />
                Commissions Open
              </span>
              <a
                href="https://throne.com/lain098_"
                target="_blank"
                rel="noopener noreferrer"
                className="lain-btn-primary"
                style={{ fontSize: '0.78rem', padding: '0.55rem 1.3rem' }}
              >
                Request via Throne
              </a>
            </div>
          </div>
          <div className="lain-comm-grid">
            {COMM_TYPES.map((c, i) => (
              <div key={i} className="lain-comm-card" style={{ transitionDelay: `${c.delay}s` }}>
                <div className="lain-comm-icon">{c.icon}</div>
                <div className="lain-comm-tier">{c.tier}</div>
                <div className="lain-comm-name">{c.name}</div>
                <p className="lain-comm-desc">{c.desc}</p>
                <div className="lain-comm-price">
                  {c.start} <span>starting</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          PROCESS
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-process">
        <div className="lain-process-inner">
          <span className="lain-section-label" style={{ textAlign: 'center', display: 'block' }}>— How it works</span>
          <h2 className="lain-process-title">The commission <em>process</em></h2>
          <div className="lain-steps">
            <div className="lain-steps-line" />
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="lain-step">
                <div className="lain-step-num">{step.num}</div>
                <div className="lain-step-body">
                  <div className="lain-step-title">{step.title}</div>
                  <p className="lain-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SKY TEXT REVEAL — Astrophile / Filosofi ref
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-reveal-section">
        <div className="lain-reveal-bg-word" aria-hidden="true">Lain</div>
        <div className="lain-reveal-content">
          <p className="lain-reveal-eyebrow">— A note from Lain</p>
          <div>
            {REVEAL_WORDS.map((word, i) => (
              <span
                key={i}
                className="lain-reveal-word"
                style={{ transitionDelay: `${i * 0.06}s` }}
              >
                {word}
              </span>
            ))}
          </div>
          <p className="lain-reveal-sig">— Lain098_</p>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          CONTACT
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-contact" id="contact">
        <div className="lain-contact-inner">
          <div className="lain-contact-avatar">
            <img
              src="https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=240&q=80"
              alt="Lain avatar"
            />
          </div>
          <span className="lain-section-label">— Get in Touch</span>
          <h2 className="lain-contact-title">
            Let's create <em>together</em>
          </h2>
          <p className="lain-contact-text">
            Whether you want a commission, have a collab idea, or just want to say hi — my DMs are always open. I love meeting fellow art enjoyers 🩵
          </p>
          <div className="lain-socials">
            <a
              href="https://www.instagram.com/lain098_?igsh=aXpiYXBuYWJxOXFw"
              target="_blank"
              rel="noopener noreferrer"
              className="lain-social-link"
            >
              <Instagram size={15} style={{ color: '#3BA3CE' }} />
              @lain098_
            </a>
            <a
              href="https://throne.com/lain098_"
              target="_blank"
              rel="noopener noreferrer"
              className="lain-social-link"
            >
              <Heart size={15} style={{ color: '#3BA3CE' }} />
              Throne Wishlist
            </a>
          </div>
          <a
            href="https://throne.com/lain098_"
            target="_blank"
            rel="noopener noreferrer"
            className="lain-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            onMouseMove={handleMagnet as any}
            onMouseLeave={handleMagnetLeave as any}
          >
            <Send size={14} />
            Send a Commission Request
          </a>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="lain-footer">
        <p className="lain-footer-copy">© 2025 Lain098_ · All rights reserved</p>
        <span className="lain-footer-sig">Lain</span>
        <ul className="lain-footer-links">
          <li><a href="#about" onClick={e => { e.preventDefault(); smoothScroll('#about') }}>About</a></li>
          <li><a href="#gallery" onClick={e => { e.preventDefault(); smoothScroll('#gallery') }}>Gallery</a></li>
          <li><a href="#commissions" onClick={e => { e.preventDefault(); smoothScroll('#commissions') }}>Commissions</a></li>
          <li>
            <a href="https://www.instagram.com/lain098_" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </li>
        </ul>
      </footer>

    </div>
  )
}

/* @arkzen:web:page:index:end */
