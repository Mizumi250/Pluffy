// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — lain098 [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.492Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const WORKS = [
  {
    id: 'fanart',
    num: '01',
    label: 'Fanart',
    tagline: 'FANART — CHARACTER STUDIES',
    headline: 'Beloved characters,\nredrawn with feeling.',
    desc: 'Expressive anime fanart capturing the soul of iconic characters — from subtle emotional portraits to dynamic action scenes. Each piece is drawn with careful attention to the original spirit, then infused with my own colour language.',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    accent: '#7EC8E3',
  },
  {
    id: 'ocs',
    num: '02',
    label: 'Original Characters',
    tagline: 'OCs — ORIGINAL DESIGN',
    headline: 'New souls\nbrought to life.',
    desc: 'Original characters built from scratch — personality, backstory, colour palette, silhouette. I design OCs as complete people, not just pretty faces. Every detail from hair ornaments to outfit stitching is intentional.',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
    accent: '#A8D8EA',
  },
  {
    id: 'chibi',
    num: '03',
    label: 'Chibi',
    tagline: 'CHIBI — CUTE & COMPACT',
    headline: 'Big emotions,\ntiny forms.',
    desc: 'Chibi art that amplifies personality through exaggeration — oversized heads, expressive eyes, compact little bodies full of energy. Clean lines, soft shading, and colours that feel like a warm afternoon.',
    img: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80',
    accent: '#B0E0E6',
  },
  {
    id: 'animation',
    num: '04',
    label: 'Short Animations',
    tagline: 'ANIMATION — MOTION & LIFE',
    headline: 'Still frames\nset in motion.',
    desc: 'Short looping animations and animated stickers — blinking eyes, flowing hair, subtle breathing cycles. Frame-by-frame work that gives illustration a heartbeat without losing the hand-drawn warmth.',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    accent: '#87CEEB',
  },
]

export const COMMISSION_TIERS = [
  {
    id: 'sketch',
    title: 'Sketch',
    price: 'Starting at $8',
    desc: 'Loose linework, single character, no background. Great for quick references or personal use.',
    features: ['1 character', 'Greyscale or flat colour', '2–3 day turnaround', '1 minor revision'],
    accent: '#B0E0E6',
  },
  {
    id: 'fullbody',
    title: 'Full Illustration',
    price: 'Starting at $25',
    desc: 'Clean lineart, full shading, detailed colouring with optional simple background.',
    features: ['1–2 characters', 'Full render & shading', 'Simple background included', '2 revisions'],
    accent: '#7EC8E3',
    featured: true,
  },
  {
    id: 'chibi',
    title: 'Chibi',
    price: 'Starting at $15',
    desc: 'Cute chibi-style characters, expressive and fully coloured.',
    features: ['1–2 characters', 'Flat or cel shading', 'Transparent PNG', '1 revision'],
    accent: '#A8D8EA',
  },
  {
    id: 'animation',
    title: 'Animated Sticker',
    price: 'Starting at $30',
    desc: 'Short looping animation, 4–8 frames. Perfect for Discord, Twitch, or Telegram.',
    features: ['1 character / emoji', '4–8 frame loop', 'GIF + APNG delivery', '1 revision'],
    accent: '#87CEEB',
  },
]

export const SKILLS_MARQUEE = [
  'Clip Studio Paint', '·', 'Procreate', '·', 'Adobe Photoshop', '·',
  'Anime-style Illustration', '·', 'Frame-by-Frame Animation', '·',
  'Character Design', '·', 'Fanart', '·', 'OC Creation', '·',
  'Chibi Art', '·', 'Sticker Design', '·', 'Clip Studio Paint', '·',
  'Procreate', '·', 'Adobe Photoshop', '·', 'Anime-style Illustration', '·',
  'Frame-by-Frame Animation', '·', 'Character Design', '·', 'Fanart', '·',
]

export const NAV_LINKS = [
  { label: 'WORKS', href: '#works' },
  { label: 'COMMISSIONS', href: '#commissions' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
]

// ─── CURSOR ───────────────────────────────────────────────────────────────────
