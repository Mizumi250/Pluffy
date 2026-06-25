// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — lain098 [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T01:16:58.244Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, ExternalLink, Heart, Instagram, Menu, Send, Sparkles, Star, X } from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Commissions', href: '#commissions' },
  { label: 'Contact', href: '#contact' },
]

export const ART_TYPES = [
  'Anime Illustrations', '✦', 'Fanart', '✦', 'Original Characters',
  '✦', 'Chibi Art', '✦', 'Short Animations', '✦', 'Character Design',
  '✦', 'Anime Illustrations', '✦', 'Fanart', '✦', 'Original Characters',
  '✦', 'Chibi Art', '✦', 'Short Animations', '✦', 'Character Design', '✦',
]

export const GALLERY_ITEMS = [
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

export const COMM_TYPES = [
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

export const PROCESS_STEPS = [
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

export const FLOAT_IMGS = [
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&q=80',
  'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=300&q=80',
  'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=300&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80',
]

// ── HELPERS ──────────────────────────────────────────────────────────────────
