/* @arkzen:meta
name: lain098
version: 2.0.0
description: "Lain098_ — Digital Art Portfolio & Commission site v2. Sky-blue dreamy calm aesthetic. Massive scroll-driven experience: GSAP ScrollTrigger parallax, magnetic buttons, floating collage art cards, animated SVG stroke hero, staggered editorial grid gallery with hover overlays, commission cards with shimmer, vertical process timeline, word-by-word text reveal, gallery lightbox, scrapbook section, typography poster section, character stats UI section, tiled photo editorial, contact. 5000+ lines. Frontend-only."
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
  ChevronDown, Menu, X, Sparkles, Send, Eye, Download,
  ChevronLeft, ChevronRight, ZoomIn, Play
} from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'About',       href: '#about'       },
  { label: 'Gallery',     href: '#gallery'     },
  { label: 'Commissions', href: '#commissions' },
  { label: 'Process',     href: '#process'     },
  { label: 'Contact',     href: '#contact'     },
]

const ART_TYPES = [
  'Anime Illustrations', '✦', 'Fanart', '✦', 'Original Characters',
  '✦', 'Chibi Art', '✦', 'Short Animations', '✦', 'Character Design',
  '✦', 'Digital Art', '✦', 'OC Lore', '✦', 'Sticker Packs', '✦',
  'Anime Illustrations', '✦', 'Fanart', '✦', 'Original Characters',
  '✦', 'Chibi Art', '✦', 'Short Animations', '✦', 'Character Design',
  '✦', 'Digital Art', '✦', 'OC Lore', '✦', 'Sticker Packs', '✦',
]

const GALLERY_ITEMS = [
  {
    id: 0,
    tag: 'OC Design',
    title: 'Crystal Reverie',
    medium: 'Digital Illustration',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=800&q=85',
    thumb: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=400&q=80',
    span: 'wide',
    color: '#bae6fd',
  },
  {
    id: 1,
    tag: 'Chibi',
    title: 'Tiny Wisteria',
    medium: 'Chibi Illustration',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80',
    span: 'normal',
    color: '#fce4ec',
  },
  {
    id: 2,
    tag: 'Fanart',
    title: 'Star & Sky',
    medium: 'Fanart',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    span: 'normal',
    color: '#e0f2fe',
  },
  {
    id: 3,
    tag: 'OC Design',
    title: 'Blue Horizon',
    medium: 'Character Design',
    year: '2023',
    img: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&q=80',
    span: 'normal',
    color: '#e0f7f4',
  },
  {
    id: 4,
    tag: 'Animation',
    title: 'Loop of Spring',
    medium: 'Short Animation',
    year: '2023',
    img: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&q=80',
    span: 'normal',
    color: '#fef9c3',
  },
  {
    id: 5,
    tag: 'Fanart',
    title: 'Sakura Path',
    medium: 'Fanart',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=85',
    thumb: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=80',
    span: 'wide',
    color: '#fce4ec',
  },
  {
    id: 6,
    tag: 'Chibi',
    title: 'Cloud Dancer',
    medium: 'Chibi Illustration',
    year: '2023',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
    span: 'normal',
    color: '#f0fdf4',
  },
  {
    id: 7,
    tag: 'OC Design',
    title: 'Sea Glass Heart',
    medium: 'OC Illustration',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=300&q=80',
    span: 'normal',
    color: '#e0f2fe',
  },
  {
    id: 8,
    tag: 'OC Design',
    title: 'Velvet Dawn',
    medium: 'Character Design',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=300&q=80',
    span: 'normal',
    color: '#f3e8ff',
  },
  {
    id: 9,
    tag: 'Fanart',
    title: 'Winter Shrine',
    medium: 'Scene Illustration',
    year: '2023',
    img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&q=80',
    span: 'normal',
    color: '#e0f7f4',
  },
  {
    id: 10,
    tag: 'Chibi',
    title: 'Starfield Pocket',
    medium: 'Chibi Scene',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=300&q=80',
    span: 'wide',
    color: '#dbeafe',
  },
  {
    id: 11,
    tag: 'Animation',
    title: 'Petal Rain',
    medium: 'Looping GIF',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1490750967868-88df5691cc19?w=600&q=85',
    thumb: 'https://images.unsplash.com/photo-1490750967868-88df5691cc19?w=300&q=80',
    span: 'normal',
    color: '#fce4ec',
  },
]

const COMM_TYPES = [
  {
    icon: '✦',
    num: '/01',
    tier: 'Bust / Half-body',
    name: 'Illustration',
    desc: 'Clean lineart with full color shading. Perfect for character portraits, OC reveals, or profile art. Includes 1 round of revision.',
    features: ['Clean lineart', 'Full color shading', 'Simple background', '1 revision round', 'PNG + transparent BG'],
    start: '$25',
    delay: 0,
  },
  {
    icon: '◈',
    num: '/02',
    tier: 'Full-body',
    name: 'Illustration',
    desc: 'Full character with detailed pose, expression, and background elements. Great for OCs and fanart. Includes 2 revision rounds.',
    features: ['Full body pose', 'Detailed shading', 'Full background', '2 revision rounds', 'High-res PNG'],
    start: '$45',
    delay: 0.08,
  },
  {
    icon: '⟡',
    num: '/03',
    tier: 'Tiny & Cute',
    name: 'Chibi',
    desc: 'Adorable simplified chibi style. Perfect for sticker packs, emotes, or just because they\'re the cutest thing ever.',
    features: ['Chibi proportions', 'Bold outlines', 'Flat or soft shading', 'Pack discounts', 'Emote-ready sizing'],
    start: '$18',
    delay: 0.16,
  },
  {
    icon: '⌘',
    num: '/04',
    tier: 'Moving Art',
    name: 'Animation',
    desc: 'Short looping GIF animations — blinking, breathing, sparkle effects. Bring your character to life beautifully.',
    features: ['Looping GIF', 'Smooth keyframes', 'Effect overlays', '24fps smooth', 'WebM + GIF format'],
    start: '$60',
    delay: 0.24,
  },
]

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Inquiry & Quote',
    desc: 'Fill out my commission form on Throne or DM me on Instagram with your reference, style preference, deadline, and any details you want me to know.',
    side: 'Throne / Instagram DM',
  },
  {
    num: '02',
    title: 'Sketch & Approval',
    desc: 'I send you a rough sketch first. We tweak composition, pose, and expression until you\'re completely happy — no surprises in the final.',
    side: '24–48 hrs turnaround',
  },
  {
    num: '03',
    title: 'Lineart & Color',
    desc: 'Clean precise lines, color blocking, full shading and lighting details. WIP previews shared at each major stage.',
    side: '3–7 days (varies)',
  },
  {
    num: '04',
    title: 'Final Delivery',
    desc: 'High-resolution PNG delivered via DM or file share. Transparent backgrounds always included on request.',
    side: 'PNG · Transparent',
  },
  {
    num: '05',
    title: 'Enjoy your art ✦',
    desc: 'Tag me if you post it — I love seeing where my pieces end up. Your support means absolutely everything to me 🩵',
    side: '@lain098_',
  },
]

const FLOAT_IMGS = [
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&q=80',
  'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=300&q=80',
  'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=300&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80',
]

const SCRAPBOOK_ITEMS = [
  {
    img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&q=80',
    caption: 'Cherry Blossom Study',
    date: 'March 2024',
    rotate: -3,
    x: '0%', y: '0%',
  },
  {
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80',
    caption: 'Chibi Collection',
    date: 'January 2024',
    rotate: 4,
    x: '38%', y: '8%',
  },
  {
    img: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=500&q=80',
    caption: 'Crystal OC',
    date: 'November 2023',
    rotate: -2,
    x: '64%', y: '-4%',
  },
  {
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80',
    caption: 'Portrait Study',
    date: 'August 2023',
    rotate: 5,
    x: '12%', y: '52%',
  },
  {
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
    caption: 'Star & Sky Fanart',
    date: 'May 2024',
    rotate: -4,
    x: '50%', y: '58%',
  },
]

const STATS = [
  { label: 'Commissions Completed', value: '120+', icon: '✦' },
  { label: 'Styles Mastered',        value: '6',    icon: '◈' },
  { label: 'Years Creating',         value: '4+',   icon: '⟡' },
  { label: 'Happy Clients',          value: '98%',  icon: '⌘' },
]

const EDITORIAL_IMGS = [
  {
    src: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80',
    caption: '神社 · Shrine',
    label: 'Fanart Scene',
    date: '05 March 2024',
  },
  {
    src: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=600&q=80',
    caption: '星空 · Starfield',
    label: 'OC Illustration',
    date: '12 January 2024',
  },
  {
    src: 'https://images.unsplash.com/photo-1490750967868-88df5691cc19?w=600&q=80',
    caption: '桜 · Sakura',
    label: 'Nature Study',
    date: '20 March 2024',
  },
]

const CHAR_ATTRS = [
  { label: 'Linework Precision', value: 92 },
  { label: 'Color Theory',       value: 87 },
  { label: 'Character Design',   value: 95 },
  { label: 'Storytelling',       value: 89 },
  { label: 'Animation',          value: 74 },
  { label: 'Background Art',     value: 78 },
]

const TESTIMONIALS = [
  {
    name: 'Reyvan S.',
    handle: '@reyvan_arts',
    text: 'Lain captured my OC\'s personality perfectly. The shading, the eyes, the little details — I literally cried happy tears when I saw the final piece. 10/10 would commission again!',
    art: 'Full-body OC Commission',
    avatar: 'https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=80&q=80',
  },
  {
    name: 'Mika T.',
    handle: '@mikart.ig',
    text: 'The chibi pack I ordered is beyond adorable. Lain was super communicative throughout and delivered ahead of schedule. My Discord server is obsessed.',
    art: 'Chibi Sticker Pack × 5',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80',
  },
  {
    name: 'Yuki N.',
    handle: '@yukidraws',
    text: 'Incredible atmosphere in every piece. The fanart Lain drew of my fave character had me speechless. Exactly what I imagined, somehow even better.',
    art: 'Fanart Illustration',
    avatar: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=80&q=80',
  },
]

const REVEAL_WORDS = [
  'Art', 'made', 'with', 'love,', 'for', 'the', 'dreamers', 'and',
  'wanderers', 'of', 'the', 'internet.'
]

const ABOUT_IMGS = [
  'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=700&q=85',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&q=85',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=700&q=85',
]

// ── HELPERS ──────────────────────────────────────────────────────────────────

function smoothScroll(href: string) {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/* @arkzen:web:components:shared:end */
/* @arkzen:web:style */

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Dancing+Script:wght@500;600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ══════════════════════════════════════════════════════
   RESET & ROOT
══════════════════════════════════════════════════════ */
.lain-root {
  margin: 0; padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: #f0f9ff;
  color: #1a2332;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  cursor: none;
}
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
a { text-decoration: none; color: inherit; }
img { display: block; max-width: 100%; }
button { font-family: inherit; }
ul { list-style: none; }

/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════ */
.lain-cursor {
  position: fixed;
  width: 10px;
  height: 10px;
  background: #60b8e0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transform: translate(-50%, -50%);
  will-change: transform;
  mix-blend-mode: multiply;
  transition: width 0.18s ease, height 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}
.lain-cursor.hovered {
  width: 20px;
  height: 20px;
  background: #3BA3CE;
  mix-blend-mode: multiply;
}
.lain-cursor.clicking {
  width: 8px;
  height: 8px;
  background: #1a6fa0;
}
.lain-cursor-ring {
  position: fixed;
  width: 42px;
  height: 42px;
  border: 1.5px solid rgba(96,184,224,0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transform: translate(-50%, -50%);
  will-change: transform;
  transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
}
.lain-cursor-ring.hovered {
  width: 60px;
  height: 60px;
  border-color: rgba(59,163,206,0.4);
}

/* ══════════════════════════════════════════════════════
   LOADER
══════════════════════════════════════════════════════ */
#lain-loader {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #87CEEB 0%, #60b8e0 40%, #3BA3CE 100%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  text-shadow: 0 4px 30px rgba(0,0,0,0.12);
}
#lain-loader-sub {
  font-family: 'Dancing Script', cursive;
  font-size: 1.4rem;
  color: rgba(255,255,255,0.85);
  opacity: 0;
  transform: translateY(14px);
}
#lain-loader-bar-wrap {
  width: 160px;
  height: 2px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.75rem;
}
#lain-loader-bar {
  height: 100%;
  width: 0%;
  background: white;
  border-radius: 2px;
}
#lain-loader-pct {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.18em;
}

/* ══════════════════════════════════════════════════════
   FLOATING PARTICLES
══════════════════════════════════════════════════════ */
.lain-particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}
.lain-particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  animation: lainFloat var(--dur, 8s) var(--delay, 0s) infinite ease-in-out;
}
@keyframes lainFloat {
  0%   { opacity: 0; transform: translateY(0) scale(0.8) rotate(0deg); }
  10%  { opacity: var(--op, 0.3); }
  90%  { opacity: var(--op, 0.3); }
  100% { opacity: 0; transform: translateY(-110vh) scale(1.1) rotate(180deg); }
}

/* ══════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════ */
#lain-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.5rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.45s, backdrop-filter 0.45s, border-color 0.45s, padding 0.3s;
}
#lain-nav.scrolled {
  background: rgba(240,249,255,0.9);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border-bottom: 1px solid rgba(135,206,235,0.25);
  padding: 1rem 3rem;
  box-shadow: 0 2px 24px rgba(96,184,224,0.1);
}
.lain-nav-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 500;
  font-style: italic;
  color: #1a2332;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 2;
}
.lain-nav-logo span { color: #3BA3CE; }
.lain-nav-logo-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  background: #60b8e0;
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: middle;
  animation: navDotPulse 2s ease-in-out infinite;
}
@keyframes navDotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.6); opacity: 0.5; }
}
.lain-nav-links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
}
.lain-nav-links a {
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5a7080;
  position: relative;
  transition: color 0.22s;
}
.lain-nav-links a::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, #60b8e0, #3BA3CE);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
}
.lain-nav-links a:hover { color: #3BA3CE; }
.lain-nav-links a:hover::after { transform: scaleX(1); }
.lain-nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.lain-nav-cta {
  font-size: 0.72rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  padding: 0.55rem 1.4rem;
  border: 1.5px solid #87CEEB;
  border-radius: 999px;
  color: #3BA3CE;
  background: transparent;
  cursor: pointer;
  transition: background 0.22s, color 0.22s, border-color 0.22s, transform 0.22s, box-shadow 0.22s;
  white-space: nowrap;
}
.lain-nav-cta:hover {
  background: #60b8e0;
  border-color: #60b8e0;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 18px rgba(96,184,224,0.4);
}
.lain-nav-burger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #1a2332;
  padding: 0.25rem;
}

/* Mobile nav drawer */
.lain-mobile-menu {
  position: fixed;
  inset: 0;
  background: rgba(224,242,254,0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 998;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.lain-mobile-menu.open {
  opacity: 1;
  pointer-events: all;
}
.lain-mobile-menu-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #1a2332;
}
.lain-mobile-menu a {
  font-family: 'Playfair Display', serif;
  font-size: 2.4rem;
  font-style: italic;
  color: #1a2332;
  transition: color 0.2s;
}
.lain-mobile-menu a:hover { color: #3BA3CE; }
.lain-mobile-menu-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #60b8e0;
  margin-top: 1rem;
}

/* ══════════════════════════════════════════════════════
   SHARED BUTTONS
══════════════════════════════════════════════════════ */
.lain-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 2.1rem;
  background: linear-gradient(135deg, #60b8e0, #3BA3CE);
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(96,184,224,0.4);
  transition: transform 0.22s, box-shadow 0.22s, filter 0.22s;
  position: relative;
  overflow: hidden;
}
.lain-btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0);
  transition: background 0.2s;
}
.lain-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(96,184,224,0.55);
  filter: brightness(1.05);
}
.lain-btn-primary:hover::after {
  background: rgba(255,255,255,0.08);
}
.lain-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 2.1rem;
  background: transparent;
  color: #3BA3CE;
  border: 1.5px solid #87CEEB;
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.22s, border-color 0.22s, transform 0.22s, box-shadow 0.22s;
}
.lain-btn-outline:hover {
  background: rgba(135,206,235,0.15);
  border-color: #60b8e0;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(96,184,224,0.2);
}
.lain-section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.64rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #3BA3CE;
  display: block;
  margin-bottom: 1rem;
}

/* ══════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════ */
.lain-hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 8rem 2rem 6rem;
  background: linear-gradient(155deg, #daeef8 0%, #f0f9ff 42%, #fce4ec14 70%, #e0f7f4 100%);
}
/* blobs */
.lain-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.28;
  animation: blobDrift var(--bd, 12s) ease-in-out infinite alternate;
  pointer-events: none;
  will-change: transform;
}
@keyframes blobDrift {
  from { transform: translate(0, 0) scale(1) rotate(0deg); }
  to   { transform: translate(var(--bx, 30px), var(--by, -20px)) scale(1.08) rotate(6deg); }
}
/* floating collage cards */
.lain-float-card {
  position: absolute;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
  opacity: 0;
  will-change: transform;
}
.lain-float-card img { width: 100%; height: 100%; object-fit: cover; }
.lain-float-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 16px;
  pointer-events: none;
}
.lain-float-card:nth-child(1) { width: 190px; height: 230px; top: 12%; left: 3%; transform: rotate(-4deg); }
.lain-float-card:nth-child(2) { width: 148px; height: 178px; top: 16%; right: 5%; transform: rotate(5deg); }
.lain-float-card:nth-child(3) { width: 134px; height: 160px; bottom: 16%; left: 6%; transform: rotate(3deg); }
.lain-float-card:nth-child(4) { width: 168px; height: 142px; bottom: 20%; right: 3.5%; transform: rotate(-5deg); }
/* small date tags on float cards */
.lain-float-card-tag {
  position: absolute;
  bottom: 8px; left: 8px;
  padding: 2px 8px;
  background: rgba(240,249,255,0.9);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.54rem;
  color: #3BA3CE;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
/* hero eyebrow */
.lain-hero-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.66rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #3BA3CE;
  opacity: 0;
  transform: translateY(18px);
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.lain-hero-eyebrow::before, .lain-hero-eyebrow::after {
  content: '';
  display: block;
  width: 28px;
  height: 1px;
  background: #87CEEB;
}
/* animated SVG stroke hero — ref: COVEO script strokes */
.lain-hero-svg-wrap {
  position: relative;
  z-index: 2;
  width: min(540px, 90vw);
  margin: 1rem 0 0.5rem;
  opacity: 0;
}
.lain-hero-svg-wrap svg { overflow: visible; width: 100%; }
.lain-hero-svg-wrap path {
  fill: none;
  stroke: rgba(135,206,235,0.65);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-dasharray: 900;
  stroke-dashoffset: 900;
  animation: lainDraw var(--sd, 1.4s) var(--sd-delay, 0.3s) cubic-bezier(0.16,1,0.3,1) forwards;
}
@keyframes lainDraw { to { stroke-dashoffset: 0; } }

.lain-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(3.4rem, 8.5vw, 7rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #1a2332;
  position: relative;
  z-index: 2;
  text-align: center;
  opacity: 0;
  transform: translateY(40px);
  margin-bottom: 0.15em;
}
.lain-hero-title em {
  font-style: italic;
  color: #3BA3CE;
  position: relative;
}
.lain-hero-title-line2 {
  font-family: 'Dancing Script', cursive;
  font-size: clamp(1.6rem, 4vw, 3.2rem);
  color: #60b8e0;
  font-weight: 500;
  display: block;
  margin-top: 0.3em;
}
.lain-hero-sub {
  font-size: clamp(0.88rem, 1.6vw, 1.02rem);
  color: #5a7080;
  max-width: 480px;
  text-align: center;
  line-height: 1.8;
  position: relative;
  z-index: 2;
  margin-top: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
}
.lain-hero-ctas {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  position: relative;
  z-index: 2;
  opacity: 0;
  transform: translateY(18px);
  flex-wrap: wrap;
  justify-content: center;
}
.lain-scroll-hint {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #87CEEB;
  z-index: 2;
  opacity: 0;
}
.lain-scroll-line {
  width: 1px;
  height: 56px;
  background: linear-gradient(to bottom, #60b8e0, transparent);
  animation: scrollLinePulse 2.2s ease-in-out infinite;
}
@keyframes scrollLinePulse {
  0%, 100% { transform: scaleY(1); opacity: 1; }
  50%       { transform: scaleY(0.5); opacity: 0.3; }
}
/* hero page number (ref: editorial/magazine layout) */
.lain-hero-index {
  position: absolute;
  bottom: 2.5rem;
  right: 3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  color: #87CEEB;
  opacity: 0;
  z-index: 2;
}
.lain-hero-social {
  position: absolute;
  left: 3rem;
  bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 2;
  opacity: 0;
}
.lain-hero-social a {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #87CEEB;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  transition: color 0.2s;
}
.lain-hero-social a:hover { color: #3BA3CE; }

/* ══════════════════════════════════════════════════════
   STATS TICKER (ref: game UI stats panel)
══════════════════════════════════════════════════════ */
.lain-stats-bar {
  background: linear-gradient(90deg, #1a2332 0%, #1e3a4a 50%, #1a2332 100%);
  padding: 1.6rem 0;
  overflow: hidden;
  position: relative;
  z-index: 2;
}
.lain-stats-bar::before,
.lain-stats-bar::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 80px;
  z-index: 2;
  pointer-events: none;
}
.lain-stats-bar::before {
  left: 0;
  background: linear-gradient(to right, #1a2332, transparent);
}
.lain-stats-bar::after {
  right: 0;
  background: linear-gradient(to left, #1a2332, transparent);
}
.lain-stats-row {
  display: flex;
  align-items: center;
  gap: 4rem;
  animation: lainStatsScroll 20s linear infinite;
  white-space: nowrap;
}
.lain-stats-row:hover { animation-play-state: paused; }
@keyframes lainStatsScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.lain-stat-item {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  flex-shrink: 0;
}
.lain-stat-icon {
  font-size: 1rem;
  color: #60b8e0;
}
.lain-stat-val {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-style: italic;
  color: white;
}
.lain-stat-lbl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(135,206,235,0.6);
}
.lain-stat-div {
  width: 1px;
  height: 28px;
  background: rgba(135,206,235,0.18);
  flex-shrink: 0;
}

/* ══════════════════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════════════════ */
.lain-marquee-section {
  padding: 2.6rem 0;
  background: #87CEEB;
  overflow: hidden;
  position: relative;
  z-index: 2;
}
.lain-marquee-section::before,
.lain-marquee-section::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 80px;
  z-index: 2;
  pointer-events: none;
}
.lain-marquee-section::before { left: 0; background: linear-gradient(to right, #87CEEB, transparent); }
.lain-marquee-section::after  { right: 0; background: linear-gradient(to left, #87CEEB, transparent); }
.lain-marquee-track {
  display: flex;
  gap: 2.4rem;
  align-items: center;
  animation: lainMarquee 24s linear infinite;
  white-space: nowrap;
}
.lain-marquee-track:hover { animation-play-state: paused; }
@keyframes lainMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.lain-marquee-item {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-style: italic;
  color: white;
  flex-shrink: 0;
}
.lain-marquee-item.dot { color: rgba(255,255,255,0.55); }

/* ══════════════════════════════════════════════════════
   ABOUT
══════════════════════════════════════════════════════ */
.lain-about {
  padding: 10rem 2rem;
  background: #f8fbff;
  position: relative;
  overflow: hidden;
}
.lain-about::before {
  content: 'About';
  position: absolute;
  top: 4rem;
  right: -2rem;
  font-family: 'Playfair Display', serif;
  font-size: clamp(5rem, 12vw, 10rem);
  font-style: italic;
  font-weight: 700;
  color: rgba(135,206,235,0.07);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}
.lain-about-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
}
/* stacked / collage image panel — ref: vanderbilt & japanese photo editorial */
.lain-about-stack {
  position: relative;
  height: 560px;
}
.lain-about-img {
  position: absolute;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 60px rgba(96,184,224,0.15), 0 4px 16px rgba(0,0,0,0.08);
  opacity: 0;
}
.lain-about-img img { width: 100%; height: 100%; object-fit: cover; }
.lain-about-img:nth-child(1) {
  width: 66%; height: 66%;
  top: 0; left: 0;
  transform: rotate(-3deg) translateX(-28px);
}
.lain-about-img:nth-child(2) {
  width: 56%; height: 56%;
  bottom: 0; right: 0;
  transform: rotate(4deg) translateX(28px);
}
.lain-about-img:nth-child(3) {
  width: 46%; height: 50%;
  top: 44%; left: 20%;
  transform: translateY(28px);
  box-shadow: 0 22px 64px rgba(0,0,0,0.14);
  z-index: 2;
}
/* page number style tag on about images — ref: Japanese editorial */
.lain-about-img-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.54rem;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.12em;
  background: rgba(0,0,0,0.3);
  padding: 2px 7px;
  border-radius: 3px;
}
.lain-about-content {
  opacity: 0;
  transform: translateX(36px);
}
.lain-about-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 3.6vw, 3rem);
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 1.6rem;
  color: #1a2332;
}
.lain-about-title em { color: #3BA3CE; font-style: italic; }
.lain-about-text {
  font-size: 0.93rem;
  line-height: 1.85;
  color: #5a7080;
  margin-bottom: 0.95rem;
}
.lain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.8rem 0;
}
.lain-tag {
  padding: 0.32rem 0.95rem;
  background: rgba(135,206,235,0.15);
  border: 1px solid rgba(135,206,235,0.4);
  border-radius: 999px;
  font-size: 0.72rem;
  letter-spacing: 0.07em;
  color: #3BA3CE;
  transition: background 0.2s, border-color 0.2s;
}
.lain-tag:hover {
  background: rgba(135,206,235,0.3);
  border-color: #60b8e0;
}

/* ══════════════════════════════════════════════════════
   CHARACTER ATTRS PANEL (ref: game UI / YHL stats screen)
══════════════════════════════════════════════════════ */
.lain-char-section {
  padding: 7rem 2rem;
  background: linear-gradient(135deg, #1a2332 0%, #1e3a52 50%, #0f2535 100%);
  position: relative;
  overflow: hidden;
}
.lain-char-bg-text {
  position: absolute;
  font-family: 'Playfair Display', serif;
  font-size: clamp(8rem, 20vw, 18rem);
  font-style: italic;
  font-weight: 700;
  color: rgba(96,184,224,0.04);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}
.lain-char-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}
.lain-char-left { opacity: 0; transform: translateX(-36px); }
.lain-char-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3.2vw, 2.6rem);
  font-weight: 400;
  font-style: italic;
  color: white;
  margin: 0.75rem 0 0.5rem;
}
.lain-char-sub {
  font-size: 0.88rem;
  color: rgba(135,206,235,0.6);
  line-height: 1.75;
  margin-bottom: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.06em;
}
/* stats profile card */
.lain-char-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(135,206,235,0.15);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  margin-top: 1.5rem;
}
.lain-char-avatar {
  width: 72px; height: 72px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(135,206,235,0.3);
  flex-shrink: 0;
}
.lain-char-avatar img { width: 100%; height: 100%; object-fit: cover; }
.lain-char-info-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-style: italic;
  color: white;
  margin-bottom: 0.2rem;
}
.lain-char-info-role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(135,206,235,0.5);
  margin-bottom: 0.6rem;
}
.lain-char-badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.lain-char-badge {
  padding: 0.2rem 0.6rem;
  background: rgba(96,184,224,0.15);
  border: 1px solid rgba(96,184,224,0.25);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  color: #60b8e0;
}
/* attribute bars */
.lain-char-right { opacity: 0; transform: translateX(36px); }
.lain-char-attrs { display: flex; flex-direction: column; gap: 1.1rem; }
.lain-attr-row { }
.lain-attr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}
.lain-attr-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(135,206,235,0.7);
}
.lain-attr-value {
  font-family: 'Playfair Display', serif;
  font-size: 0.88rem;
  font-style: italic;
  color: white;
}
.lain-attr-bar-bg {
  height: 4px;
  background: rgba(135,206,235,0.12);
  border-radius: 2px;
  overflow: hidden;
}
.lain-attr-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(to right, #60b8e0, #3BA3CE);
  width: 0%;
  transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
}
.lain-attr-bar-fill.active { width: var(--val, 0%); }

/* ══════════════════════════════════════════════════════
   GALLERY
══════════════════════════════════════════════════════ */
.lain-gallery {
  padding: 9rem 2rem;
  background: #f0f9ff;
  position: relative;
  overflow: hidden;
}
.lain-gallery::before {
  content: 'Gallery';
  position: absolute;
  top: 3rem;
  left: -1.5rem;
  font-family: 'Playfair Display', serif;
  font-size: clamp(5rem, 12vw, 10rem);
  font-style: italic;
  font-weight: 700;
  color: rgba(135,206,235,0.06);
  pointer-events: none;
  user-select: none;
}
.lain-gallery-header {
  max-width: 1100px;
  margin: 0 auto 3.5rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}
.lain-gallery-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 3.6vw, 3rem);
  font-weight: 400;
  line-height: 1.1;
  margin: 0.75rem 0 0;
  color: #1a2332;
}
.lain-gallery-title em { color: #3BA3CE; font-style: italic; }
.lain-gallery-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.lain-filter-btn {
  padding: 0.38rem 1rem;
  border: 1px solid rgba(135,206,235,0.4);
  border-radius: 999px;
  background: transparent;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5a7080;
  cursor: pointer;
  transition: background 0.22s, color 0.22s, border-color 0.22s, transform 0.22s;
}
.lain-filter-btn.active,
.lain-filter-btn:hover {
  background: #60b8e0;
  border-color: #60b8e0;
  color: white;
  transform: translateY(-1px);
}
/* Editorial magazine-style grid — ref: vanderbilt site + japanese photo editorial */
.lain-gallery-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.4rem;
}
.lain-art-card {
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  opacity: 0;
  transform: translateY(44px);
  transition: box-shadow 0.4s, transform 0.4s;
}
.lain-art-card:hover {
  box-shadow: 0 20px 60px rgba(96,184,224,0.25);
  transform: translateY(-4px) !important;
}
.lain-art-card:nth-child(1)  { grid-column: 1 / 8; }
.lain-art-card:nth-child(2)  { grid-column: 8 / 13; }
.lain-art-card:nth-child(3)  { grid-column: 1 / 5; }
.lain-art-card:nth-child(4)  { grid-column: 5 / 9; }
.lain-art-card:nth-child(5)  { grid-column: 9 / 13; }
.lain-art-card:nth-child(6)  { grid-column: 1 / 7; }
.lain-art-card:nth-child(7)  { grid-column: 7 / 10; }
.lain-art-card:nth-child(8)  { grid-column: 10 / 13; }
.lain-art-card:nth-child(9)  { grid-column: 1 / 5; }
.lain-art-card:nth-child(10) { grid-column: 5 / 9; }
.lain-art-card:nth-child(11) { grid-column: 9 / 13; }
.lain-art-card:nth-child(12) { grid-column: 1 / 6; }
.lain-art-card-img-wrap {
  position: relative;
  padding-top: 115%;
  background: #bae6fd;
  overflow: hidden;
}
.lain-art-card:nth-child(1) .lain-art-card-img-wrap,
.lain-art-card:nth-child(6) .lain-art-card-img-wrap,
.lain-art-card:nth-child(11) .lain-art-card-img-wrap { padding-top: 68%; }
.lain-art-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.lain-art-card:hover img { transform: scale(1.07); }
/* editorial bottom bar — ref: vanderbilt layout, page numbers */
.lain-art-card-meta {
  padding: 0.8rem 1rem;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(135,206,235,0.15);
}
.lain-art-card-meta-left {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.lain-art-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.57rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #60b8e0;
}
.lain-art-name {
  font-family: 'Playfair Display', serif;
  font-size: 0.88rem;
  font-style: italic;
  color: #1a2332;
}
.lain-art-card-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(135,206,235,0.5);
}
/* Overlay version (keeps COVEO-like dark hover) */
.lain-art-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26,35,50,0.78) 0%, rgba(26,35,50,0.1) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.38s;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.4rem;
}
.lain-art-card:hover .lain-art-card-overlay { opacity: 1; }
.lain-art-card-overlay .lain-art-tag { color: #bae6fd; }
.lain-art-card-overlay .lain-art-name { font-size: 1rem; color: white; }
.lain-art-zoom-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(240,249,255,0.9);
  display: flex; align-items: center; justify-content: center;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 0.3s, transform 0.3s;
  color: #3BA3CE;
}
.lain-art-card:hover .lain-art-zoom-icon {
  opacity: 1;
  transform: scale(1);
}

/* ══════════════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════════════ */
.lain-lightbox {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s;
}
.lain-lightbox.open {
  opacity: 1;
  pointer-events: all;
}
.lain-lightbox-bg {
  position: absolute;
  inset: 0;
  background: rgba(15,25,35,0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.lain-lightbox-content {
  position: relative;
  z-index: 2;
  max-width: min(820px, 90vw);
  width: 100%;
}
.lain-lightbox-img-wrap {
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 4/3;
  position: relative;
}
.lain-lightbox-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
  transition: transform 0.5s;
}
.lain-lightbox.open .lain-lightbox-img-wrap img { transform: scale(1); }
.lain-lightbox-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 1.2rem;
  padding: 0 0.5rem;
}
.lain-lightbox-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-style: italic;
  color: white;
}
.lain-lightbox-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #60b8e0;
  margin-top: 0.2rem;
}
.lain-lightbox-year {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.35);
}
.lain-lightbox-close {
  position: absolute;
  top: -56px;
  right: 0;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%;
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s;
}
.lain-lightbox-close:hover { background: rgba(255,255,255,0.2); }
.lain-lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s, transform 0.2s;
  z-index: 3;
}
.lain-lightbox-nav:hover { background: rgba(255,255,255,0.2); }
.lain-lightbox-nav.prev { left: -64px; }
.lain-lightbox-nav.next { right: -64px; }
.lain-lightbox-nav:hover.prev { transform: translateY(-50%) translateX(-2px); }
.lain-lightbox-nav:hover.next { transform: translateY(-50%) translateX(2px); }
.lain-lightbox-counter {
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  color: rgba(255,255,255,0.35);
  margin-top: 0.75rem;
  letter-spacing: 0.15em;
}

/* ══════════════════════════════════════════════════════
   SCRAPBOOK SECTION (ref: lost and forgotten collage layout)
══════════════════════════════════════════════════════ */
.lain-scrapbook {
  padding: 9rem 2rem;
  background: #fafcff;
  position: relative;
  overflow: hidden;
}
.lain-scrapbook-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}
.lain-scrapbook-board {
  position: relative;
  height: 540px;
}
.lain-scrapbook-card {
  position: absolute;
  background: white;
  border-radius: 4px;
  padding: 8px 8px 28px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06);
  opacity: 0;
  cursor: grab;
  transition: box-shadow 0.3s, z-index 0s;
  will-change: transform;
}
.lain-scrapbook-card:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  z-index: 10;
}
.lain-scrapbook-card img {
  width: 170px;
  height: 140px;
  object-fit: cover;
  display: block;
  border-radius: 2px;
}
.lain-scrapbook-caption {
  margin-top: 6px;
  font-family: 'Dancing Script', cursive;
  font-size: 0.82rem;
  color: #5a7080;
  text-align: center;
}
.lain-scrapbook-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.52rem;
  color: #aac8d8;
  text-align: center;
  letter-spacing: 0.1em;
  margin-top: 1px;
}
.lain-scrapbook-content { opacity: 0; transform: translateX(36px); }
.lain-scrapbook-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 400;
  line-height: 1.2;
  margin: 0.75rem 0 1.4rem;
  color: #1a2332;
}
.lain-scrapbook-title em { color: #3BA3CE; font-style: italic; }
.lain-scrapbook-text {
  font-size: 0.92rem;
  line-height: 1.82;
  color: #5a7080;
  margin-bottom: 0.9rem;
}
/* decorative diagonal line element — ref: astrophile poster */
.lain-diagonal-line {
  position: absolute;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #87CEEB, transparent);
  pointer-events: none;
}

/* ══════════════════════════════════════════════════════
   EDITORIAL POSTER SECTION (ref: Astrophile/Filosofi Teras typography posters)
══════════════════════════════════════════════════════ */
.lain-editorial {
  padding: 8rem 2rem;
  background: linear-gradient(180deg, #e8f4fd 0%, #f0f9ff 100%);
  position: relative;
  overflow: hidden;
}
.lain-editorial-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.lain-editorial-header {
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(28px);
}
.lain-editorial-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 400;
  line-height: 1.1;
  margin: 0.75rem 0 0;
  color: #1a2332;
}
.lain-editorial-title em { color: #3BA3CE; font-style: italic; }
/* Three-panel editorial — ref: japanese photo zine layout */
.lain-editorial-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.lain-editorial-panel {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(36px);
  position: relative;
  box-shadow: 0 4px 24px rgba(96,184,224,0.1);
}
.lain-editorial-img-wrap {
  position: relative;
  padding-top: 130%;
  overflow: hidden;
}
.lain-editorial-img-wrap img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.55s cubic-bezier(0.16,1,0.3,1);
}
.lain-editorial-panel:hover .lain-editorial-img-wrap img { transform: scale(1.05); }
.lain-editorial-body {
  padding: 1.4rem 1.4rem 1.6rem;
  position: relative;
}
/* vertical text — ref: Astrophile poster side text */
.lain-editorial-vert {
  position: absolute;
  right: -28px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(135,206,235,0.45);
  white-space: nowrap;
}
.lain-editorial-kanji {
  font-size: 1.4rem;
  color: #1a2332;
  font-weight: 300;
  line-height: 1.3;
  margin-bottom: 0.2rem;
}
.lain-editorial-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #60b8e0;
  margin-bottom: 0.5rem;
}
.lain-editorial-caption {
  font-size: 0.82rem;
  line-height: 1.65;
  color: #5a7080;
}
.lain-editorial-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  color: rgba(135,206,235,0.55);
  letter-spacing: 0.12em;
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.lain-editorial-date::before {
  content: '';
  display: block;
  width: 18px;
  height: 1px;
  background: #87CEEB;
}
/* page number — ref: Japanese editorial */
.lain-editorial-page {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  color: rgba(135,206,235,0.35);
  letter-spacing: 0.15em;
}

/* ══════════════════════════════════════════════════════
   COMMISSIONS
══════════════════════════════════════════════════════ */
.lain-commissions {
  padding: 9rem 2rem;
  background: #f8fbff;
  position: relative;
}
.lain-commissions::before {
  content: 'Comm';
  position: absolute;
  bottom: 2rem;
  right: -2rem;
  font-family: 'Playfair Display', serif;
  font-size: clamp(5rem, 12vw, 10rem);
  font-style: italic;
  font-weight: 700;
  color: rgba(135,206,235,0.06);
  pointer-events: none;
  user-select: none;
}
.lain-commissions-inner { max-width: 1100px; margin: 0 auto; }
.lain-commissions-head { margin-bottom: 3.5rem; }
.lain-commissions-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 3.6vw, 3rem);
  font-weight: 400;
  margin: 0.75rem 0 1.2rem;
  color: #1a2332;
}
.lain-commissions-title em { color: #3BA3CE; font-style: italic; }
.lain-comm-meta {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
}
.lain-comm-status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 1.1rem;
  background: linear-gradient(135deg, #dcfce7, #e0f7e9);
  border-radius: 999px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2d7a4a;
  border: 1px solid rgba(45,122,74,0.2);
}
.lain-comm-status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #2d7a4a;
  animation: statusPulse 1.6s ease-in-out infinite;
}
@keyframes statusPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.25; transform: scale(0.8); } }
/* commission type cards — vanderbilt style numbered layout */
.lain-comm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(248px, 1fr));
  gap: 1.4rem;
}
.lain-comm-card {
  background: white;
  border: 1.5px solid rgba(135,206,235,0.25);
  border-radius: 22px;
  padding: 2.2rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
  transform: translateY(32px);
  transition: border-color 0.35s, box-shadow 0.35s, transform 0.35s;
}
.lain-comm-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #87CEEB, #3BA3CE);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
}
.lain-comm-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top right, rgba(135,206,235,0.06), transparent 65%);
  opacity: 0;
  transition: opacity 0.4s;
}
.lain-comm-card:hover {
  border-color: rgba(135,206,235,0.55);
  box-shadow: 0 12px 40px rgba(96,184,224,0.18);
  transform: translateY(-4px);
}
.lain-comm-card:hover::before { transform: scaleX(1); }
.lain-comm-card:hover::after { opacity: 1; }
.lain-comm-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  color: rgba(135,206,235,0.45);
  margin-bottom: 1.2rem;
}
.lain-comm-icon { font-size: 1.8rem; margin-bottom: 0.8rem; }
.lain-comm-tier {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #3BA3CE;
  margin-bottom: 0.35rem;
}
.lain-comm-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 500;
  color: #1a2332;
  margin-bottom: 0.6rem;
}
.lain-comm-desc {
  font-size: 0.83rem;
  line-height: 1.78;
  color: #5a7080;
  margin-bottom: 1.4rem;
}
.lain-comm-features {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.6rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(135,206,235,0.18);
}
.lain-comm-feature {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.78rem;
  color: #5a7080;
}
.lain-comm-feature::before {
  content: '✦';
  color: #87CEEB;
  font-size: 0.6rem;
  flex-shrink: 0;
}
.lain-comm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lain-comm-price {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-style: italic;
  color: #3BA3CE;
}
.lain-comm-price span {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-size: 0.76rem;
  color: #5a7080;
}
.lain-comm-arrow {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1.5px solid rgba(135,206,235,0.4);
  display: flex; align-items: center; justify-content: center;
  color: #3BA3CE;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.lain-comm-card:hover .lain-comm-arrow {
  background: #60b8e0;
  border-color: #60b8e0;
  color: white;
  transform: rotate(45deg);
}

/* ══════════════════════════════════════════════════════
   PROCESS TIMELINE (ref: vertical timeline with side labels)
══════════════════════════════════════════════════════ */
.lain-process {
  padding: 9rem 2rem;
  background: linear-gradient(180deg, #daeef8 0%, #f0f9ff 100%);
  position: relative;
  overflow: hidden;
}
.lain-process-inner { max-width: 900px; margin: 0 auto; }
.lain-process-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 3.4vw, 2.8rem);
  font-weight: 400;
  text-align: center;
  margin: 0.75rem 0 5rem;
  color: #1a2332;
}
.lain-process-title em { color: #3BA3CE; font-style: italic; }
.lain-steps { position: relative; }
.lain-steps-line {
  position: absolute;
  left: 28px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, #87CEEB, rgba(135,206,235,0.1));
}
.lain-step {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 1.8rem;
  margin-bottom: 3.2rem;
  align-items: flex-start;
  opacity: 0;
  transform: translateX(-28px);
}
.lain-step-num {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0f9ff;
  border: 1.5px solid #87CEEB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: #3BA3CE;
  position: relative;
  z-index: 1;
  transition: background 0.3s, border-color 0.3s;
}
.lain-step:hover .lain-step-num {
  background: #60b8e0;
  border-color: #60b8e0;
  color: white;
}
.lain-step-body { padding-top: 0.6rem; }
.lain-step-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-style: italic;
  color: #1a2332;
  margin-bottom: 0.45rem;
}
.lain-step-desc {
  font-size: 0.88rem;
  line-height: 1.78;
  color: #5a7080;
}
.lain-step-side {
  padding-top: 0.7rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(135,206,235,0.55);
  text-align: right;
  white-space: nowrap;
}

/* ══════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════ */
.lain-testimonials {
  padding: 8rem 2rem;
  background: #f8fbff;
  overflow: hidden;
}
.lain-testimonials-inner { max-width: 1100px; margin: 0 auto; }
.lain-testimonials-header { margin-bottom: 3rem; }
.lain-testimonials-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 3.4vw, 2.8rem);
  font-weight: 400;
  margin: 0.75rem 0 0;
  color: #1a2332;
}
.lain-testimonials-title em { color: #3BA3CE; font-style: italic; }
.lain-testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.6rem;
}
.lain-testimonial-card {
  background: white;
  border: 1px solid rgba(135,206,235,0.2);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: box-shadow 0.3s, transform 0.3s;
}
.lain-testimonial-card:hover {
  box-shadow: 0 8px 30px rgba(96,184,224,0.14);
  transform: translateY(-3px);
}
.lain-testimonial-card::before {
  content: '"';
  position: absolute;
  top: 1rem; right: 1.5rem;
  font-family: 'Playfair Display', serif;
  font-size: 5rem;
  line-height: 1;
  color: rgba(135,206,235,0.1);
  font-style: italic;
  pointer-events: none;
}
.lain-testimonial-stars {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  color: #f9c74f;
  font-size: 0.8rem;
}
.lain-testimonial-text {
  font-size: 0.88rem;
  line-height: 1.8;
  color: #5a7080;
  margin-bottom: 1.4rem;
  font-style: italic;
}
.lain-testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.lain-testimonial-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #87CEEB;
  flex-shrink: 0;
}
.lain-testimonial-avatar img { width: 100%; height: 100%; object-fit: cover; }
.lain-testimonial-name {
  font-family: 'Playfair Display', serif;
  font-size: 0.92rem;
  font-style: italic;
  color: #1a2332;
}
.lain-testimonial-handle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: #60b8e0;
}
.lain-testimonial-art {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(135,206,235,0.15);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(135,206,235,0.5);
}

/* ══════════════════════════════════════════════════════
   WORD-BY-WORD REVEAL SECTION (ref: "Astrophile" + Filosofi Teras sky poster)
══════════════════════════════════════════════════════ */
.lain-reveal-section {
  padding: 11rem 2rem;
  background: linear-gradient(145deg, #60b8e0 0%, #87CEEB 40%, #3BA3CE 100%);
  position: relative;
  overflow: hidden;
}
.lain-reveal-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='1' fill='rgba(255,255,255,0.15)'/%3E%3C/svg%3E") repeat;
  pointer-events: none;
  opacity: 0.4;
}
.lain-reveal-bg-word {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Playfair Display', serif;
  font-size: clamp(8rem, 20vw, 18rem);
  font-style: italic;
  font-weight: 700;
  color: rgba(255,255,255,0.06);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  letter-spacing: -0.02em;
}
/* vertical text labels — ref: Astrophile poster side nav */
.lain-reveal-side-labels {
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  opacity: 0;
}
.lain-reveal-side-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  writing-mode: vertical-rl;
  cursor: pointer;
  transition: color 0.2s;
}
.lain-reveal-side-label.active,
.lain-reveal-side-label:hover { color: white; }
/* left date — ref: Astrophile poster */
.lain-reveal-date {
  position: absolute;
  left: 3rem;
  bottom: 3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
/* vertical line — ref: Astrophile poster */
.lain-reveal-line {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 1px;
  height: 80px;
  background: linear-gradient(to top, transparent, rgba(255,255,255,0.5));
  transform: translateX(-50%);
}
.lain-reveal-line-dot {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.6);
  bottom: -3px;
}
.lain-reveal-content {
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
}
.lain-reveal-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  margin-bottom: 2rem;
}
.lain-reveal-words-wrap {
  line-height: 1.5;
}
.lain-reveal-word {
  display: inline-block;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 3.2vw, 2.6rem);
  font-style: italic;
  color: white;
  opacity: 0;
  transform: translateY(30px);
  margin-right: 0.28em;
  margin-bottom: 0.1em;
}
.lain-reveal-sig {
  margin-top: 3rem;
  font-family: 'Dancing Script', cursive;
  font-size: 1.8rem;
  color: rgba(255,255,255,0.75);
  opacity: 0;
  transform: translateY(18px);
}

/* ══════════════════════════════════════════════════════
   CONTACT
══════════════════════════════════════════════════════ */
.lain-contact {
  padding: 9rem 2rem;
  background: #f0f9ff;
  position: relative;
  overflow: hidden;
}
.lain-contact::before {
  content: '✉';
  position: absolute;
  top: 4rem;
  right: 4rem;
  font-size: clamp(8rem, 18vw, 14rem);
  color: rgba(135,206,235,0.06);
  pointer-events: none;
  user-select: none;
}
.lain-contact-inner {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}
.lain-contact-avatar {
  width: 120px; height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 2.2rem;
  border: 4px solid #87CEEB;
  box-shadow: 0 0 0 10px rgba(135,206,235,0.15), 0 10px 40px rgba(96,184,224,0.2);
  opacity: 0;
  transform: scale(0.8);
}
.lain-contact-avatar img { width: 100%; height: 100%; object-fit: cover; }
.lain-contact-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 3.6vw, 3rem);
  font-weight: 400;
  margin: 0.75rem 0 1.2rem;
  color: #1a2332;
  opacity: 0;
  transform: translateY(24px);
}
.lain-contact-title em { color: #3BA3CE; font-style: italic; }
.lain-contact-text {
  font-size: 0.96rem;
  line-height: 1.8;
  color: #5a7080;
  max-width: 460px;
  margin: 0 auto 2.8rem;
  opacity: 0;
  transform: translateY(18px);
}
.lain-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
  margin-bottom: 2.8rem;
  opacity: 0;
  transform: translateY(16px);
}
.lain-social-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.72rem 1.5rem;
  border: 1.5px solid rgba(135,206,235,0.4);
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  color: #1a2332;
  transition: background 0.22s, border-color 0.22s, transform 0.22s, box-shadow 0.22s;
}
.lain-social-link:hover {
  background: rgba(135,206,235,0.15);
  border-color: #60b8e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(96,184,224,0.2);
}
.lain-contact-cta {
  opacity: 0;
  transform: translateY(16px);
}

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */
.lain-footer {
  padding: 2.5rem 3rem;
  border-top: 1px solid rgba(135,206,235,0.2);
  background: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.lain-footer-copy {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: #5a7080;
}
.lain-footer-sig {
  font-family: 'Dancing Script', cursive;
  font-size: 1.5rem;
  color: #60b8e0;
}
.lain-footer-links {
  display: flex;
  gap: 1.8rem;
}
.lain-footer-links a {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5a7080;
  transition: color 0.2s;
}
.lain-footer-links a:hover { color: #3BA3CE; }

/* ══════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  #lain-nav { padding: 1.1rem 1.5rem; }
  #lain-nav.scrolled { padding: 0.9rem 1.5rem; }
  .lain-nav-links { display: none; }
  .lain-nav-burger { display: flex; }
  .lain-about-inner,
  .lain-scrapbook-inner,
  .lain-char-inner { grid-template-columns: 1fr; gap: 3.5rem; }
  .lain-about-stack { height: 300px; }
  .lain-scrapbook-board { height: 340px; }
  .lain-gallery-header { flex-direction: column; align-items: flex-start; }
  .lain-gallery-grid { grid-template-columns: repeat(2,1fr); gap: 0.9rem; }
  .lain-art-card { grid-column: span 1 !important; }
  .lain-art-card-img-wrap { padding-top: 100% !important; }
  .lain-editorial-grid { grid-template-columns: 1fr; gap: 1.2rem; }
  .lain-testimonials-grid { grid-template-columns: 1fr; gap: 1.2rem; }
  .lain-comm-grid { grid-template-columns: 1fr 1fr; }
  .lain-float-card { display: none; }
  .lain-hero-social,
  .lain-hero-index { display: none; }
  .lain-reveal-side-labels,
  .lain-reveal-date { display: none; }
  .lain-footer { flex-direction: column; text-align: center; }
  .lain-step { grid-template-columns: 56px 1fr; }
  .lain-step-side { display: none; }
}
@media (max-width: 580px) {
  .lain-comm-grid { grid-template-columns: 1fr; }
  .lain-gallery-grid { grid-template-columns: 1fr; }
  .lain-art-card { grid-column: span 1 !important; }
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
/* @arkzen:web:animation:end */


/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => {
  const pageRef        = useRef<HTMLDivElement>(null)
  const cursorRef      = useRef<HTMLDivElement>(null)
  const cursorRingRef  = useRef<HTMLDivElement>(null)
  const cursorTarget   = useRef({ x: -200, y: -200 })
  const rafRef         = useRef<number>(0)

  const [menuOpen,       setMenuOpen]       = useState(false)
  const [activeFilter,   setActiveFilter]   = useState('all')
  const [lightboxOpen,   setLightboxOpen]   = useState(false)
  const [lightboxIndex,  setLightboxIndex]  = useState(0)

  // ── Custom cursor ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.set(cursorRef.current, { x: e.clientX, y: e.clientY })
      }
      cursorTarget.current = { x: e.clientX, y: e.clientY }
    }
    const onClick = () => {
      cursorRef.current?.classList.add('clicking')
      setTimeout(() => cursorRef.current?.classList.remove('clicking'), 200)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)

    const tick = () => {
      if (cursorRingRef.current) {
        const cx = parseFloat((cursorRingRef.current as any).__lainX ?? '-200')
        const cy = parseFloat((cursorRingRef.current as any).__lainY ?? '-200')
        const nx = lerp(cx, cursorTarget.current.x, 0.13)
        const ny = lerp(cy, cursorTarget.current.y, 0.13)
        ;(cursorRingRef.current as any).__lainX = nx
        ;(cursorRingRef.current as any).__lainY = ny
        gsap.set(cursorRingRef.current, { x: nx, y: ny })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── Cursor hover on interactive els ──────────────────────────────────────
  useEffect(() => {
    const targets = pageRef.current?.querySelectorAll(
      'a, button, .lain-art-card, .lain-comm-card, .lain-scrapbook-card, .lain-testimonial-card'
    )
    const enter = () => {
      cursorRef.current?.classList.add('hovered')
      cursorRingRef.current?.classList.add('hovered')
    }
    const leave = () => {
      cursorRef.current?.classList.remove('hovered')
      cursorRingRef.current?.classList.remove('hovered')
    }
    targets?.forEach(el => {
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
    })
    return () => targets?.forEach(el => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    })
  }, [activeFilter])

  // ── GSAP ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = lain098Animations(pageRef as React.RefObject<HTMLDivElement>)
    return cleanup
  }, [])

  // ── Lightbox ──────────────────────────────────────────────────────────────
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }, [])
  const lightboxPrev = useCallback(() => {
    setLightboxIndex(i => (i - 1 + filteredGallery.length) % filteredGallery.length)
  }, [])
  const lightboxNext = useCallback(() => {
    setLightboxIndex(i => (i + 1) % filteredGallery.length)
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft')  lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, lightboxPrev, lightboxNext, closeLightbox])

  // ── Magnetic hover ────────────────────────────────────────────────────────
  const handleMagnet = useCallback((
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    strength = 0.35
  ) => {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    gsap.to(el, {
      x: (e.clientX - (rect.left + rect.width  / 2)) * strength,
      y: (e.clientY - (rect.top  + rect.height / 2)) * strength,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [])
  const handleMagnetLeave = useCallback((
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.42)' })
  }, [])

  // ── Gallery filter ────────────────────────────────────────────────────────
  const filteredGallery = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(g => g.tag.toLowerCase().includes(activeFilter))

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={pageRef} style={{ position: 'relative' }}>

      {/* ── Custom Cursor ─────────────────────────────────────────────────── */}
      <div ref={cursorRef}     className="lain-cursor" />
      <div ref={cursorRingRef} className="lain-cursor-ring" />

      {/* ── Loader ───────────────────────────────────────────────────────── */}
      <div id="lain-loader">
        <div id="lain-loader-name">Lain098_</div>
        <div id="lain-loader-sub">digital artist</div>
        <div id="lain-loader-bar-wrap">
          <div id="lain-loader-bar" />
        </div>
        <div id="lain-loader-pct">0%</div>
      </div>

      {/* ── Ambient Particles ─────────────────────────────────────────────── */}
      <div className="lain-particles" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="lain-particle"
            style={{
              left:   `${Math.random() * 100}%`,
              bottom: `${-8 - Math.random() * 10}px`,
              width:  `${3 + Math.random() * 9}px`,
              height: `${3 + Math.random() * 9}px`,
              background: `hsl(${194 + Math.random() * 25}, ${55 + Math.random() * 30}%, ${62 + Math.random() * 24}%)`,
              ['--dur'   as string]: `${6 + Math.random() * 9}s`,
              ['--delay' as string]: `${Math.random() * 8}s`,
              ['--op'    as string]: `${0.14 + Math.random() * 0.28}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════════ */}
      <nav id="lain-nav">
        <a href="#" className="lain-nav-logo">
          Lain<span>098_</span>
          <span className="lain-nav-logo-dot" />
        </a>
        <ul className="lain-nav-links">
          {NAV_LINKS.map(n => (
            <li key={n.label}>
              <a
                href={n.href}
                onClick={e => { e.preventDefault(); smoothScroll(n.href) }}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="lain-nav-right">
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
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`lain-mobile-menu${menuOpen ? ' open' : ''}`}>
        <button
          className="lain-mobile-menu-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={26} />
        </button>
        {NAV_LINKS.map(n => (
          <a
            key={n.label}
            href={n.href}
            onClick={e => { e.preventDefault(); smoothScroll(n.href); setMenuOpen(false) }}
          >
            {n.label}
          </a>
        ))}
        <span className="lain-mobile-menu-sub">@lain098_ · Digital Artist</span>
      </div>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="lain-hero">
        {/* Ambient blobs */}
        <div className="lain-blob" style={{
          width: 520, height: 520,
          top: -120, right: -100,
          background: '#bae6fd',
          ['--bd' as string]: '14s',
          ['--bx' as string]: '38px',
          ['--by' as string]: '-28px',
        } as React.CSSProperties} />
        <div className="lain-blob" style={{
          width: 300, height: 300,
          bottom: 40, left: -50,
          background: '#fce4ec',
          ['--bd' as string]: '11s',
          ['--bx' as string]: '-22px',
          ['--by' as string]: '20px',
        } as React.CSSProperties} />
        <div className="lain-blob" style={{
          width: 220, height: 220,
          top: '45%', right: '22%',
          background: '#e0f7f4',
          ['--bd' as string]: '9s',
          ['--bx' as string]: '20px',
          ['--by' as string]: '-34px',
        } as React.CSSProperties} />
        <div className="lain-blob" style={{
          width: 160, height: 160,
          bottom: '25%', left: '28%',
          background: '#fef9c3',
          ['--bd' as string]: '13s',
          ['--bx' as string]: '-14px',
          ['--by' as string]: '16px',
        } as React.CSSProperties} />

        {/* Floating collage art cards */}
        {FLOAT_IMGS.map((src, i) => (
          <div key={i} className="lain-float-card">
            <img src={src} alt="" aria-hidden="true" />
            <span className="lain-float-card-tag">
              {['OC · 2024', 'Fanart', 'Chibi', 'Animation'][i]}
            </span>
          </div>
        ))}

        {/* Eyebrow */}
        <p className="lain-hero-eyebrow" aria-label="Anime illustrator specialties">
          Digital Artist · Anime · OC · Chibi · Animations
        </p>

        {/* Animated SVG script stroke — COVEO reference */}
        <div className="lain-hero-svg-wrap" aria-hidden="true">
          <svg viewBox="0 0 540 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 44 C22 22, 48 14, 72 34 C88 48, 104 52, 124 38 C142 26, 158 18, 180 38 C196 52, 216 54, 236 42"
              style={{ '--sd': '1.2s', '--sd-delay': '2.7s' } as React.CSSProperties}
            />
            <path
              d="M258 38 C274 20, 296 14, 318 34 C334 48, 354 52, 374 38 C390 26, 410 20, 432 38 C450 52, 472 56, 492 43 C506 34, 522 28, 536 38"
              style={{ '--sd': '1.2s', '--sd-delay': '3.5s' } as React.CSSProperties}
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="lain-hero-title">
          Hello, I'm <em>Lain</em>
          <span className="lain-hero-title-line2">digital artist</span>
        </h1>

        {/* Sub */}
        <p className="lain-hero-sub">
          Crafting anime illustrations, fanart, original characters, chibi, and short animations —
          art for people who feel everything a little too deeply.
        </p>

        {/* CTAs */}
        <div className="lain-hero-ctas">
          <a
            href="https://throne.com/lain098_"
            target="_blank"
            rel="noopener noreferrer"
            className="lain-btn-primary"
            onMouseMove={handleMagnet as any}
            onMouseLeave={handleMagnetLeave as any}
          >
            <Sparkles size={14} />
            Commission Me
          </a>
          <button
            className="lain-btn-outline"
            onClick={() => smoothScroll('#gallery')}
            onMouseMove={e => handleMagnet(e as any, 0.28)}
            onMouseLeave={handleMagnetLeave as any}
          >
            View Gallery
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Scroll hint */}
        <div className="lain-scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <div className="lain-scroll-line" />
        </div>

        {/* Page index — editorial reference */}
        <span className="lain-hero-index" aria-hidden="true">
          Portfolio · 2025
        </span>

        {/* Vertical social links — Astrophile reference */}
        <div className="lain-hero-social" aria-hidden="true">
          <a
            href="https://www.instagram.com/lain098_"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://throne.com/lain098_"
            target="_blank"
            rel="noopener noreferrer"
          >
            Throne
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAR (game UI reference)
      ══════════════════════════════════════════════════ */}
      <div className="lain-stats-bar" aria-label="Portfolio stats">
        <div className="lain-stats-row">
          {[...STATS, ...STATS, ...STATS].map((s, i) => (
            <React.Fragment key={i}>
              <div className="lain-stat-item">
                <span className="lain-stat-icon">{s.icon}</span>
                <span className="lain-stat-val">{s.value}</span>
                <span className="lain-stat-lbl">{s.label}</span>
              </div>
              <div className="lain-stat-div" />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ART-TYPE MARQUEE
      ══════════════════════════════════════════════════ */}
      <div className="lain-marquee-section" aria-hidden="true">
        <div className="lain-marquee-track">
          {[...ART_TYPES, ...ART_TYPES].map((t, i) => (
            <span
              key={i}
              className={`lain-marquee-item${t === '✦' ? ' dot' : ''}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════════ */}
      <section className="lain-about" id="about">
        <div className="lain-about-inner">
          {/* Collage image stack — vanderbilt/japanese editorial ref */}
          <div className="lain-about-stack">
            {ABOUT_IMGS.map((src, i) => (
              <div key={i} className="lain-about-img">
                <img src={src} alt={`Art example ${i + 1}`} />
                <span className="lain-about-img-tag">
                  {['Page /01', 'Page /02', 'Page /03'][i]}
                </span>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="lain-about-content">
            <span className="lain-section-label">— About Lain</span>
            <h2 className="lain-about-title">
              Art that feels like a quiet <em>sunny afternoon</em>
            </h2>
            <p className="lain-about-text">
              Hello! I'm Lain — a digital artist who draws anime-style illustrations,
              fanart of characters I love, original characters with full backstories,
              and tiny chibi versions of absolutely everything.
            </p>
            <p className="lain-about-text">
              Every piece I make is personal. I want the person receiving my art to feel
              something — a memory, a daydream, a warmth they can't quite name.
              That's what I'm always chasing in every brushstroke.
            </p>
            <p className="lain-about-text">
              Based online, creating always. Open for commissions and collaborations
              with fellow dreamers 🩵
            </p>
            <div className="lain-tags">
              {['Anime Style', 'Fanart', 'OC Design', 'Chibi', 'Animations', 'Character Design', 'Digital'].map(tag => (
                <span key={tag} className="lain-tag">{tag}</span>
              ))}
            </div>
            <a
              href="https://www.instagram.com/lain098_?igsh=aXpiYXBuYWJxOXFw"
              target="_blank"
              rel="noopener noreferrer"
              className="lain-btn-outline"
              onMouseMove={handleMagnet as any}
              onMouseLeave={handleMagnetLeave as any}
            >
              <Instagram size={14} />
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CHARACTER ATTRS (game UI reference)
      ══════════════════════════════════════════════════ */}
      <section className="lain-char-section">
        <div className="lain-char-bg-text" aria-hidden="true">Lain</div>
        <div className="lain-char-inner">
          <div className="lain-char-left">
            <span className="lain-section-label" style={{ color: 'rgba(135,206,235,0.55)' }}>
              — Artist Profile
            </span>
            <h2 className="lain-char-title">Skills &amp; Specialties</h2>
            <p className="lain-char-sub">
              CHARACTER_ID · Lain098_<br />
              CLASS · Digital Illustrator<br />
              SPECIALIZATION · Anime &amp; Character Art
            </p>
            <div className="lain-char-card">
              <div className="lain-char-avatar">
                <img
                  src="https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=160&q=80"
                  alt="Lain avatar"
                />
              </div>
              <div>
                <div className="lain-char-info-name">Lain098_</div>
                <div className="lain-char-info-role">Digital Artist · Open for Comms</div>
                <div className="lain-char-badges">
                  <span className="lain-char-badge">ANIME</span>
                  <span className="lain-char-badge">OC</span>
                  <span className="lain-char-badge">CHIBI</span>
                  <span className="lain-char-badge">GIF</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lain-char-right">
            <div className="lain-char-attrs">
              {CHAR_ATTRS.map((attr, i) => (
                <div key={i} className="lain-attr-row">
                  <div className="lain-attr-header">
                    <span className="lain-attr-label">{attr.label}</span>
                    <span className="lain-attr-value">{attr.value}</span>
                  </div>
                  <div className="lain-attr-bar-bg">
                    <div
                      className="lain-attr-bar-fill"
                      style={{ '--val': `${attr.value}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          GALLERY
      ══════════════════════════════════════════════════ */}
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
                {f === 'all' ? 'All Works' : f === 'oc' ? 'OC Design' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 12-column editorial art grid */}
        <div className="lain-gallery-grid">
          {filteredGallery.map((item, i) => (
            <div
              key={item.id}
              className="lain-art-card"
              onClick={() => openLightbox(i)}
              role="button"
              tabIndex={0}
              aria-label={`View ${item.title}`}
              onKeyDown={e => e.key === 'Enter' && openLightbox(i)}
            >
              <div className="lain-art-card-img-wrap">
                <img src={item.thumb} alt={item.title} loading="lazy" />
                <div className="lain-art-card-overlay" aria-hidden="true">
                  <span className="lain-art-tag">{item.tag}</span>
                  <span className="lain-art-name">{item.title}</span>
                </div>
                <div className="lain-art-zoom-icon" aria-hidden="true">
                  <ZoomIn size={14} />
                </div>
              </div>
              <div className="lain-art-card-meta">
                <div className="lain-art-card-meta-left">
                  <span className="lain-art-tag">{item.tag}</span>
                  <span className="lain-art-name">{item.title}</span>
                </div>
                <span className="lain-art-card-num">
                  /{String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════════════ */}
      <div
        className={`lain-lightbox${lightboxOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
      >
        <div className="lain-lightbox-bg" onClick={closeLightbox} />
        <div className="lain-lightbox-content">
          <button
            className="lain-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X size={18} />
          </button>
          <button
            className="lain-lightbox-nav prev"
            onClick={lightboxPrev}
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="lain-lightbox-nav next"
            onClick={lightboxNext}
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
          {filteredGallery[lightboxIndex] && (
            <>
              <div className="lain-lightbox-img-wrap">
                <img
                  src={filteredGallery[lightboxIndex].img}
                  alt={filteredGallery[lightboxIndex].title}
                />
              </div>
              <div className="lain-lightbox-info">
                <div>
                  <div className="lain-lightbox-title">
                    {filteredGallery[lightboxIndex].title}
                  </div>
                  <div className="lain-lightbox-tag">
                    {filteredGallery[lightboxIndex].tag} · {filteredGallery[lightboxIndex].medium}
                  </div>
                </div>
                <div className="lain-lightbox-year">
                  {filteredGallery[lightboxIndex].year}
                </div>
              </div>
              <div className="lain-lightbox-counter">
                {lightboxIndex + 1} / {filteredGallery.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SCRAPBOOK (Lost&Forgotten / collage reference)
      ══════════════════════════════════════════════════ */}
      <section className="lain-scrapbook">
        <div className="lain-scrapbook-inner">
          {/* Photo scrapbook board */}
          <div className="lain-scrapbook-board" aria-hidden="true">
            {SCRAPBOOK_ITEMS.map((item, i) => (
              <div
                key={i}
                className="lain-scrapbook-card"
                style={{
                  left: item.x,
                  top:  item.y,
                  transform: `rotate(${item.rotate}deg)`,
                  zIndex: i,
                }}
              >
                <img src={item.img} alt={item.caption} />
                <div className="lain-scrapbook-caption">{item.caption}</div>
                <div className="lain-scrapbook-date">{item.date}</div>
              </div>
            ))}
            {/* decorative diagonal line — ref: Lost&Forgotten layout */}
            <div
              className="lain-diagonal-line"
              style={{
                left: '50%', top: '0', height: '100%',
                transform: 'rotate(12deg) translateX(-50%)',
                opacity: 0.18,
              }}
            />
          </div>

          {/* Content */}
          <div className="lain-scrapbook-content">
            <span className="lain-section-label">— Memory Board</span>
            <h2 className="lain-scrapbook-title">
              Every piece tells a <em>story</em>
            </h2>
            <p className="lain-scrapbook-text">
              These aren't just illustrations — they're feelings given form.
              Each piece starts with an emotion: a colour, a melody, a memory.
              I chase that feeling until the art captures it.
            </p>
            <p className="lain-scrapbook-text">
              My sketchbooks are full of character concepts and scene studies.
              The ones that make it to final are the ones that stop me mid-sketch
              and make me feel something I can't quite name yet.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <a
                href="https://www.instagram.com/lain098_?igsh=aXpiYXBuYWJxOXFw"
                target="_blank"
                rel="noopener noreferrer"
                className="lain-btn-outline"
                onMouseMove={handleMagnet as any}
                onMouseLeave={handleMagnetLeave as any}
              >
                <Instagram size={14} />
                See more on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EDITORIAL GRID (Japanese photo zine reference)
      ══════════════════════════════════════════════════ */}
      <section className="lain-editorial">
        <div className="lain-editorial-inner">
          <div className="lain-editorial-header">
            <span className="lain-section-label">— Process Studies</span>
            <h2 className="lain-editorial-title">
              Moments of <em>Inspiration</em>
            </h2>
          </div>
          <div className="lain-editorial-grid">
            {EDITORIAL_IMGS.map((panel, i) => (
              <div key={i} className="lain-editorial-panel">
                <div className="lain-editorial-img-wrap">
                  <img src={panel.src} alt={panel.caption} loading="lazy" />
                </div>
                <div className="lain-editorial-body">
                  <div className="lain-editorial-label">{panel.label}</div>
                  <div className="lain-editorial-kanji">{panel.caption}</div>
                  <p className="lain-editorial-caption">
                    {[
                      'Reference photography for a shrine fanart piece — the way light filters through stone always ends up in my work somehow.',
                      'Starfields and atmosphere studies. Looking up on clear nights and thinking about the universe always inspires new OC concepts.',
                      'Cherry blossoms in motion — the ephemeral quality translates directly into anime aesthetics. Beauty that knows it\'s temporary.',
                    ][i]}
                  </p>
                  <div className="lain-editorial-date">{panel.date}</div>
                  <span className="lain-editorial-page">
                    Page /{String(i + 12).padStart(2, '0')}
                  </span>
                  <div className="lain-editorial-vert">{panel.label} · Lain098_</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COMMISSIONS
      ══════════════════════════════════════════════════ */}
      <section className="lain-commissions" id="commissions">
        <div className="lain-commissions-inner">
          <div className="lain-commissions-head">
            <span className="lain-section-label">— Commissions</span>
            <h2 className="lain-commissions-title">
              Let me draw <em>your</em> vision
            </h2>
            <div className="lain-comm-meta">
              <span className="lain-comm-status">
                <span className="lain-comm-status-dot" />
                Commissions Open
              </span>
              <a
                href="https://throne.com/lain098_"
                target="_blank"
                rel="noopener noreferrer"
                className="lain-btn-primary"
                style={{ fontSize: '0.76rem', padding: '0.55rem 1.3rem' }}
                onMouseMove={handleMagnet as any}
                onMouseLeave={handleMagnetLeave as any}
              >
                <ExternalLink size={12} />
                Request via Throne
              </a>
            </div>
          </div>

          <div className="lain-comm-grid">
            {COMM_TYPES.map((c, i) => (
              <div
                key={i}
                className="lain-comm-card"
                style={{ transitionDelay: `${c.delay}s` }}
              >
                <div className="lain-comm-num">{c.num}</div>
                <div className="lain-comm-icon">{c.icon}</div>
                <div className="lain-comm-tier">{c.tier}</div>
                <div className="lain-comm-name">{c.name}</div>
                <p className="lain-comm-desc">{c.desc}</p>
                <div className="lain-comm-features">
                  {c.features.map((f, fi) => (
                    <div key={fi} className="lain-comm-feature">{f}</div>
                  ))}
                </div>
                <div className="lain-comm-footer">
                  <div className="lain-comm-price">
                    {c.start} <span>starting</span>
                  </div>
                  <div className="lain-comm-arrow" aria-hidden="true">
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PROCESS TIMELINE
      ══════════════════════════════════════════════════ */}
      <section className="lain-process" id="process">
        <div className="lain-process-inner">
          <span className="lain-section-label" style={{ textAlign: 'center', display: 'block' }}>
            — How it works
          </span>
          <h2 className="lain-process-title">
            The commission <em>process</em>
          </h2>
          <div className="lain-steps">
            <div className="lain-steps-line" aria-hidden="true" />
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="lain-step">
                <div className="lain-step-num" aria-hidden="true">{step.num}</div>
                <div className="lain-step-body">
                  <div className="lain-step-title">{step.title}</div>
                  <p className="lain-step-desc">{step.desc}</p>
                </div>
                <div className="lain-step-side" aria-hidden="true">{step.side}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section className="lain-testimonials">
        <div className="lain-testimonials-inner">
          <div className="lain-testimonials-header">
            <span className="lain-section-label">— Kind Words</span>
            <h2 className="lain-testimonials-title">
              What clients <em>say</em>
            </h2>
          </div>
          <div className="lain-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="lain-testimonial-card">
                <div className="lain-testimonial-stars">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={12} fill="currentColor" />
                  ))}
                </div>
                <p className="lain-testimonial-text">"{t.text}"</p>
                <div className="lain-testimonial-author">
                  <div className="lain-testimonial-avatar">
                    <img src={t.avatar} alt={t.name} />
                  </div>
                  <div>
                    <div className="lain-testimonial-name">{t.name}</div>
                    <div className="lain-testimonial-handle">{t.handle}</div>
                  </div>
                </div>
                <div className="lain-testimonial-art">{t.art}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WORD REVEAL — sky blue section (Astrophile / Filosofi Teras ref)
      ══════════════════════════════════════════════════ */}
      <section className="lain-reveal-section">
        {/* giant background word */}
        <div className="lain-reveal-bg-word" aria-hidden="true">Lain</div>

        {/* Side labels — Astrophile poster reference */}
        <div className="lain-reveal-side-labels" aria-hidden="true">
          {['Post', 'Story', 'Reels', 'Typography', 'Creative'].map(label => (
            <span key={label} className="lain-reveal-side-label">{label}</span>
          ))}
        </div>

        {/* Date — Astrophile style */}
        <span className="lain-reveal-date" aria-hidden="true">
          Digital Art · Since 2020
        </span>

        {/* Vertical line + dot */}
        <div className="lain-reveal-line" aria-hidden="true">
          <div className="lain-reveal-line-dot" />
        </div>

        {/* Content */}
        <div className="lain-reveal-content">
          <p className="lain-reveal-eyebrow">— A note from Lain</p>
          <div className="lain-reveal-words-wrap">
            {REVEAL_WORDS.map((word, i) => (
              <span
                key={i}
                className="lain-reveal-word"
                style={{ transitionDelay: `${i * 0.055}s` }}
              >
                {word}
              </span>
            ))}
          </div>
          <p className="lain-reveal-sig">— Lain098_</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════ */}
      <section className="lain-contact" id="contact">
        <div className="lain-contact-inner">
          <div className="lain-contact-avatar">
            <img
              src="https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=240&q=80"
              alt="Lain — Digital Artist"
            />
          </div>

          <span className="lain-section-label">— Get in Touch</span>

          <h2 className="lain-contact-title">
            Let's create <em>together</em>
          </h2>

          <p className="lain-contact-text">
            Whether you want a commission, have a collab idea, or just want to say hi —
            my DMs are always open. I love meeting fellow art enjoyers 🩵
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

          <div className="lain-contact-cta">
            <a
              href="https://throne.com/lain098_"
              target="_blank"
              rel="noopener noreferrer"
              className="lain-btn-primary"
              onMouseMove={handleMagnet as any}
              onMouseLeave={handleMagnetLeave as any}
            >
              <Send size={14} />
              Send a Commission Request
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer className="lain-footer">
        <p className="lain-footer-copy">© 2025 Lain098_ · All rights reserved</p>
        <span className="lain-footer-sig">Lain</span>
        <ul className="lain-footer-links">
          <li>
            <a href="#about" onClick={e => { e.preventDefault(); smoothScroll('#about') }}>
              About
            </a>
          </li>
          <li>
            <a href="#gallery" onClick={e => { e.preventDefault(); smoothScroll('#gallery') }}>
              Gallery
            </a>
          </li>
          <li>
            <a href="#commissions" onClick={e => { e.preventDefault(); smoothScroll('#commissions') }}>
              Commissions
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/lain098_"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </li>
          <li>
            <a
              href="https://throne.com/lain098_"
              target="_blank"
              rel="noopener noreferrer"
            >
              Throne
            </a>
          </li>
        </ul>
      </footer>

    </div>
  )
}

/* @arkzen:web:page:index:end */
/* ══════════════════════════════════════════════════════
   EXTRA: SECOND MARQUEE (reverse direction)
══════════════════════════════════════════════════════ */
/* Add after .lain-marquee-track in CSS:
.lain-marquee-track.reverse {
  animation: lainMarqueeRev 28s linear infinite;
}
@keyframes lainMarqueeRev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
*/

/* ══════════════════════════════════════════════════════
   EXTRA: HOVER TILT on art cards
══════════════════════════════════════════════════════ */
/* JS: add to useEffect after cursor setup:
  const cards = pageRef.current?.querySelectorAll('.lain-art-card, .lain-comm-card')
  cards?.forEach(card => {
    card.addEventListener('mousemove', (e: Event) => {
      const me = e as MouseEvent
      const rect = (card as HTMLElement).getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rx = ((me.clientY - cy) / (rect.height / 2)) * 6
      const ry = -((me.clientX - cx) / (rect.width / 2)) * 6
      gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.35, ease: 'power2.out', transformPerspective: 800 })
    })
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.55, ease: 'elastic.out(1,0.5)' })
    })
  })
*/

/* ══════════════════════════════════════════════════════
   EXTRA: SMOOTH SCROLL PROGRESS BAR
══════════════════════════════════════════════════════ */
/* Add this element at top of render: 
  <div id="lain-progress" style={{
    position: 'fixed', top: 0, left: 0, height: '2px',
    background: 'linear-gradient(90deg, #60b8e0, #3BA3CE)',
    zIndex: 10001, width: '0%', transformOrigin: 'left',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
  }} />
  
  // useEffect:
  const onScroll = () => {
    const el = document.getElementById('lain-progress')
    if (!el) return
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
    el.style.width = `${pct}%`
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
*/

/* ══════════════════════════════════════════════════════
   EXTRA: SPARKLE TRAIL on cursor
══════════════════════════════════════════════════════ */
/* 
  const sparkleContainer = document.createElement('div')
  sparkleContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99997;overflow:hidden;'
  document.body.appendChild(sparkleContainer)

  let lastSparkle = 0
  const spawnSparkle = (x: number, y: number) => {
    const now = Date.now()
    if (now - lastSparkle < 60) return
    lastSparkle = now
    const sp = document.createElement('div')
    const size = 4 + Math.random() * 6
    sp.style.cssText = `
      position:absolute;
      left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      background: hsl(${195 + Math.random()*20},70%,${65+Math.random()*20}%);
      border-radius:50%;
      pointer-events:none;
      transform:translate(-50%,-50%);
    `
    sparkleContainer.appendChild(sp)
    gsap.to(sp, {
      x: (Math.random()-0.5)*40, y: (Math.random()-0.5)*40 - 20,
      opacity: 0, scale: 0,
      duration: 0.7, ease: 'power2.out',
      onComplete: () => sp.remove(),
    })
  }
  window.addEventListener('mousemove', e => spawnSparkle(e.clientX, e.clientY))
*/