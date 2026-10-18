// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — lain098
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:44.026Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BurstItem } from './types'


// ─── DATA ──────────────────────────────────────────────────────

export const WORKS = [
  {
    id: 'fanart',
    num: '01',
    label: 'Fanart',
    tagline: 'FANART — CHARACTER STUDIES',
    headline: 'Beloved characters,\nredrawn with feeling.',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  },
  {
    id: 'ocs',
    num: '02',
    label: 'Original Characters',
    tagline: 'OCs — ORIGINAL DESIGN',
    headline: 'New souls\nbrought to life.',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
  },
  {
    id: 'chibi',
    num: '03',
    label: 'Chibi',
    tagline: 'CHIBI — CUTE & COMPACT',
    headline: 'Big emotions,\ntiny forms.',
    img: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80',
  },
  {
    id: 'animation',
    num: '04',
    label: 'Short Animations',
    tagline: 'ANIMATION — MOTION & LIFE',
    headline: 'Still frames\nset in motion.',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
  },
]

export const COMMISSION_TIERS = [
  {
    id: 'sketch',
    num: '001',
    title: 'Sketch',
    price: 'From $8',
    desc: 'Loose linework, single character, no background. Great for quick references or personal use.',
    features: ['1 character', 'Greyscale or flat colour', '2–3 day turnaround', '1 minor revision'],
  },
  {
    id: 'fullbody',
    num: '002',
    title: 'Full Illustration',
    price: 'From $25',
    desc: 'Clean lineart, full shading, detailed colouring with optional simple background.',
    features: ['1–2 characters', 'Full render & shading', 'Simple background included', '2 revisions'],
    featured: true,
  },
  {
    id: 'chibi',
    num: '003',
    title: 'Chibi',
    price: 'From $15',
    desc: 'Cute chibi-style characters, expressive and fully coloured.',
    features: ['1–2 characters', 'Flat or cel shading', 'Transparent PNG', '1 revision'],
  },
  {
    id: 'animation',
    num: '004',
    title: 'Animated Sticker',
    price: 'From $30',
    desc: 'Short looping animation, 4–8 frames. Perfect for Discord, Twitch, or Telegram.',
    features: ['1 character / emoji', '4–8 frame loop', 'GIF + APNG delivery', '1 revision'],
  },
]

export const NAV_LINKS = [
  { label: 'WORKS', href: '#works' },
  { label: 'COMMISSIONS', href: '#commissions' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
]

export const CAROUSEL_ITEMS = [
  { id: 'fanart',     label: 'Fanart',              img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80' },
  { id: 'oc1',       label: 'Original Character',   img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80' },
  { id: 'chibi',     label: 'Chibi',                img: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=1200&q=80' },
  { id: 'anim',      label: 'Animation',            img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80' },
  { id: 'fanart2',   label: 'Fanart',               img: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=1200&q=80' },
  { id: 'oc2',       label: 'Original Character',   img: 'https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=1200&q=80' },
  { id: 'illus',     label: 'Illustration',         img: 'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=1200&q=80' },
  { id: 'sketch',    label: 'Sketch',               img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80' },
]

export const FULL_CAROUSEL = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS.slice(0, 6)]

export const BURST_IMGS = [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&q=80',
  'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=200&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&q=80',
  'https://images.unsplash.com/photo-1549317336-206569e8475c?w=200&q=80',
  'https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=200&q=80',
  'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=200&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&q=80',
]

// ─── SIGNATURE LOGO SVG ───────────────────────────────────────
