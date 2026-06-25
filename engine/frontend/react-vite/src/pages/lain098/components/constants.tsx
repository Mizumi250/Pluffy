// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — lain098 [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:17:37.115Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, Eye, Heart, Instagram, Menu, Play, Send, Sparkles, Star, X, ZoomIn } from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: 'About',       href: '#about'       },
  { label: 'Gallery',     href: '#gallery'     },
  { label: 'Commissions', href: '#commissions' },
  { label: 'Process',     href: '#process'     },
  { label: 'Contact',     href: '#contact'     },
]

export const ART_MARQUEE = [
  'Anime Illustrations', '✦', 'Fanart', '✦', 'Original Characters',
  '✦', 'Chibi Art', '✦', 'Short Animations', '✦', 'Character Design',
  '✦', 'Digital Art', '✦', 'OC Lore', '✦', 'Sticker Packs', '✦',
  'Anime Illustrations', '✦', 'Fanart', '✦', 'Original Characters',
  '✦', 'Chibi Art', '✦', 'Short Animations', '✦', 'Character Design',
  '✦', 'Digital Art', '✦', 'OC Lore', '✦', 'Sticker Packs', '✦',
]

export const GALLERY = [
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

// After GALLERY is defined, create this:

// After GALLERY is defined, create this:
export const COLLAGE_IMGS = GALLERY.slice(0, 5).map(item => item.img)

export const COMMISSIONS = [
  {
    icon: '✦',
    num: '/01',
    tier: 'Bust / Half-body',
    name: 'Illustration',
    desc: 'Clean lineart with full color shading. Perfect for character portraits, OC reveals, or profile art. Includes 1 round of revision.',
    features: ['Clean lineart', 'Full color shading', 'Simple background', '1 revision round', 'PNG + transparent BG'],
    price: '$25',
    delay: 0,
  },
  {
    icon: '◈',
    num: '/02',
    tier: 'Full-body',
    name: 'Illustration',
    desc: 'Full character with detailed pose, expression, and background elements. Great for OCs and fanart. Includes 2 revision rounds.',
    features: ['Full body pose', 'Detailed shading', 'Full background', '2 revision rounds', 'High-res PNG'],
    price: '$45',
    delay: 0.08,
  },
  {
    icon: '⟡',
    num: '/03',
    tier: 'Tiny & Cute',
    name: 'Chibi',
    desc: 'Adorable simplified chibi style. Perfect for sticker packs, emotes, or just because they\'re the cutest thing ever.',
    features: ['Chibi proportions', 'Bold outlines', 'Flat or soft shading', 'Pack discounts', 'Emote-ready sizing'],
    price: '$18',
    delay: 0.16,
  },
  {
    icon: '⌘',
    num: '/04',
    tier: 'Moving Art',
    name: 'Animation',
    desc: 'Short looping GIF animations — blinking, breathing, sparkle effects. Bring your character to life beautifully.',
    features: ['Looping GIF', 'Smooth keyframes', 'Effect overlays', '24fps smooth', 'WebM + GIF format'],
    price: '$60',
    delay: 0.24,
  },
]

export const PROCESS = [
  {
    num: '01',
    title: 'Inquiry & Quote',
    desc: 'Fill out my commission form on Throne or DM me on Instagram with your reference, style preference, deadline, and any details you want me to know.',
    label: 'Throne / Instagram DM',
  },
  {
    num: '02',
    title: 'Sketch & Approval',
    desc: 'I send you a rough sketch first. We tweak composition, pose, and expression until you\'re completely happy — no surprises in the final.',
    label: '24–48 hrs turnaround',
  },
  {
    num: '03',
    title: 'Lineart & Color',
    desc: 'Clean precise lines, color blocking, full shading and lighting details. WIP previews shared at each major stage.',
    label: '3–7 days (varies)',
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
    label: '@lain098_',
  },
]

export const FLOAT_IMGS = [
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&q=80',
  'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=300&q=80',
  'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=300&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80',
]

export const SCRAPBOOK_ITEMS = [
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

export const STATS = [
  { label: 'Commissions Completed', value: '120+', icon: '✦' },
  { label: 'Styles Mastered',        value: '6',    icon: '◈' },
  { label: 'Years Creating',         value: '4+',   icon: '⟡' },
  { label: 'Happy Clients',          value: '98%',  icon: '⌘' },
]

export const EDITORIAL_IMGS = [
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

export const CHAR_ATTRS = [
  { label: 'Linework Precision', value: 92 },
  { label: 'Color Theory',       value: 87 },
  { label: 'Character Design',   value: 95 },
  { label: 'Storytelling',       value: 89 },
  { label: 'Animation',          value: 74 },
  { label: 'Background Art',     value: 78 },
]

export const TESTIMONIALS = [
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

export const REVEAL_WORDS = [
  'Art', 'made', 'with', 'love,', 'for', 'the', 'dreamers', 'and',
  'wanderers', 'of', 'the', 'internet.'
]

export const ABOUT_IMGS = [
  'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=700&q=85',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&q=85',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=700&q=85',
]

// ── HELPERS ──────────────────────────────────────────────────────────────────
