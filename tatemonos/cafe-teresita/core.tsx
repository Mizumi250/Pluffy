/* @arkzen:meta
name: cafe-teresita
version: 1.0.0
description: "Cafe Teresita (by Guada's) Tatemono — Concept landing page for the cafe in Calubo, Kinoguitan, Misamis Oriental. GSAP ScrollTrigger reveals, parallax, marquee, magnetic buttons, in-page modal 'pages' for Menu and Catering, dark/light mode. Frontend-only, design language inspired by Saisei architecture studio."
auth: false
*/

/* @arkzen:meta:web
favicon: ☕
title: Cafe Teresita (by Guada's) — Calubo, Kinoguitan
description: Cafe Teresita by Guada's — the modest cafe along the highway in Calubo, Kinoguitan, Misamis Oriental. Coffee, rice meals, and catering for every occasion.
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "ct-root"
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Coffee, X, Sun, Moon, ArrowRight, Star, MapPin,
  Clock, Instagram, Facebook, ChevronDown,
  ArrowUpRight, Quote, ExternalLink, CalendarCheck, Soup, CupSoda
} from 'lucide-react'

// ─── REAL DATA — Cafe Teresita (by Guada's), Calubo, Kinoguitan, Misamis Oriental ──

const NAV_LINKS = [
  { label: 'Home', href: '#ct-hero' },
  { label: 'Menu', href: '#ct-menu' },
  { label: 'Catering', href: '#ct-catering' },
  { label: 'Visit', href: '#ct-visit' },
  { label: 'Contact', href: '#ct-contact' },
]

// Menu data — placeholders based on review mentions (chicken + rice meals, coffee, snacks)
const MENU_CATEGORIES = ['Coffee & Drinks', 'Rice Meals', 'Snacks & Pastries']

const MENU_ITEMS: Record<string, { id: string; name: string; desc: string; price: string; img: string; tag?: string }[]> = {
  'Coffee & Drinks': [
    {
      id: 'teresita-blend',
      name: 'Teresita House Blend',
      desc: 'Our signature drip brew — smooth, full-bodied, roasted locally for a warm Northern Mindanao morning.',
      price: '₱65',
      img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80',
      tag: 'Best Seller',
    },
    {
      id: 'iced-caramel-macchiato',
      name: 'Iced Caramel Macchiato',
      desc: 'Espresso, fresh milk, vanilla and caramel drizzle over ice — a sweet pick-me-up for warm afternoons.',
      price: '₱95',
      img: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=900&q=80',
    },
    {
      id: 'spanish-latte',
      name: 'Spanish Latte',
      desc: 'Espresso balanced with condensed milk for a rich, sweet, creamy classic.',
      price: '₱85',
      img: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=900&q=80',
    },
    {
      id: 'fresh-buko-juice',
      name: 'Fresh Buko Juice',
      desc: 'Cold coconut water served straight from the shell — the coastal refresher.',
      price: '₱60',
      img: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=900&q=80',
    },
  ],
  'Rice Meals': [
    {
      id: 'fried-chicken-rice',
      name: 'Fried Chicken with Rice',
      desc: 'Crispy fried chicken (2 pcs) with steamed rice and house gravy — a Teresita favorite.',
      price: '₱120',
      img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f71?w=900&q=80',
      tag: 'Crowd Favorite',
    },
    {
      id: 'pork-sisig',
      name: 'Sizzling Pork Sisig',
      desc: 'Chopped pork, peppers and onions sizzled on a hot plate with calamansi and rice.',
      price: '₱135',
      img: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=900&q=80',
    },
    {
      id: 'beef-caldereta',
      name: 'Beef Caldereta',
      desc: 'Slow-cooked beef in tomato sauce with potatoes, carrots and bell pepper, served with rice.',
      price: '₱145',
      img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&q=80',
    },
    {
      id: 'grilled-fish',
      name: 'Grilled Bangus Belly',
      desc: 'Marinated milkfish belly grilled to order, with rice and dip on the side.',
      price: '₱130',
      img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&q=80',
    },
  ],
  'Snacks & Pastries': [
    {
      id: 'banana-cue',
      name: 'Banana-Q',
      desc: 'Caramelized saba banana on a stick — a local merienda staple, sweet and sticky.',
      price: '₱30',
      img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=900&q=80',
    },
    {
      id: 'cheese-bread',
      name: 'Cheese Bread Roll',
      desc: 'Soft, freshly-baked bread roll topped with melted cheese.',
      price: '₱35',
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80',
    },
    {
      id: 'leche-flan',
      name: 'Leche Flan',
      desc: 'Silky steamed custard with caramel syrup — the classic Filipino dessert.',
      price: '₱45',
      img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&q=80',
      tag: 'Sweet Pick',
    },
    {
      id: 'ensaymada',
      name: 'Ensaymada',
      desc: 'Buttery brioche roll topped with sugar and grated cheese.',
      price: '₱40',
      img: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=900&q=80',
    },
  ],
}

// Catering packages — informed by review mention of birthday catering service
const CATERING_PACKAGES = [
  {
    id: 'small-gathering',
    name: 'Small Gathering Package',
    guests: 'Good for 10–20 guests',
    price: 'Starts at ₱2,500',
    includes: ['Choice of 2 rice meal mains', 'Steamed rice', 'Iced tea or buko juice', 'Disposable wares'],
    img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80',
  },
  {
    id: 'birthday-package',
    name: 'Birthday & Family Celebration',
    guests: 'Good for 20–40 guests',
    price: 'Starts at ₱5,000',
    includes: ['Choice of 3 mains', 'Pancit & dessert', 'Steamed rice', 'Drinks station', 'Basic table setup'],
    img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',
    tag: 'Most Booked',
  },
  {
    id: 'event-package',
    name: 'Community Event Package',
    guests: 'Good for 50+ guests',
    price: 'Custom quote',
    includes: ['Full buffet menu', 'On-site coffee station', 'Staff service', 'Tent & seating add-ons available'],
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  },
]

const STATS = [
  { label: 'Google Rating', value: '4.5★', sub: 'from local guests' },
  { label: 'Open Daily', value: '10AM–10PM', sub: 'every day of the week' },
  { label: 'Location', value: 'Calubo', sub: 'Kinoguitan, Misamis Oriental' },
]

const TESTIMONIALS = [
  {
    quote: 'They got good taste with their menu — they provided the catering for my birthday. Very accessible, right along the national highway.',
    name: 'Local Guest',
    role: 'Google Review · 5★',
  },
  {
    quote: 'By far the only modest cafe in Kinoguitan. The sauces are delicious — hoping they keep improving the lighting for evening visits.',
    name: 'Local Guest',
    role: 'Google Review · 4★',
  },
]

const MARQUEE_WORDS = [
  'Coffee', '·', 'Rice Meals', '·', 'Catering', '·', 'Merienda', '·',
  'Calubo', '·', 'Kinoguitan', '·', 'Open Daily', '·',
]

const VISIT_HOURS = [
  { day: 'Monday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Tuesday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Wednesday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Thursday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Friday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Saturday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Sunday', hours: '10:00 AM – 10:00 PM' },
]

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0])
  const [scrolled, setScrolled] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [menuModalItem, setMenuModalItem] = useState<typeof MENU_ITEMS[string][number] | null>(null)
  const [cateringModal, setCateringModal] = useState<typeof CATERING_PACKAGES[number] | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 })
  const [cursorRing, setCursorRing] = useState({ x: -200, y: -200 })
  const [cursorHover, setCursorHover] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef({ x: -200, y: -200 })
  const rafRef = useRef<number>(0)

  // ── Page Loader ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 18
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setPageLoaded(true), 400) }
      setLoadProgress(Math.min(p, 100))
    }, 80)
    return () => clearInterval(iv)
  }, [])

  // ── Theme persistence ────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('ct-theme')
    if (saved) setDark(saved === 'dark')
  }, [])
  useEffect(() => {
    localStorage.setItem('ct-theme', dark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-ct-theme', dark ? 'dark' : 'light')
  }, [dark])

  // ── Lock scroll while a modal is open ─────────────────────────────────────────
  useEffect(() => {
    const open = !!menuModalItem || !!cateringModal || menuOpen
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuModalItem, cateringModal, menuOpen])

  // ── Smooth custom cursor with RAF ────────────────────────────────────────────
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    let target = { x: -200, y: -200 }
    const onMove = (e: MouseEvent) => { target = { x: e.clientX, y: e.clientY }; setCursorPos({ x: e.clientX, y: e.clientY }) }
    const tick = () => {
      cursorRingRef.current.x = lerp(cursorRingRef.current.x, target.x, 0.12)
      cursorRingRef.current.y = lerp(cursorRingRef.current.y, target.y, 0.12)
      setCursorRing({ x: cursorRingRef.current.x, y: cursorRingRef.current.y })
      rafRef.current = requestAnimationFrame(tick)
    }
    const onEnter = () => setCursorHover(true)
    const onLeave = () => setCursorHover(false)
    window.addEventListener('mousemove', onMove)
    document.querySelectorAll('a,button').forEach(el => { el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave) })
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [pageLoaded])

  // ── Scroll ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const smoothScroll = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const activeItems = MENU_ITEMS[activeCategory] ?? []

  // ── Theme CSS Variables ──────────────────────────────────────────────────────
  const themeVars = dark
    ? {
        '--ct-bg': '#1c1410',
        '--ct-bg2': '#241a14',
        '--ct-bg3': '#2c2018',
        '--ct-fg': '#f7f1e8',
        '--ct-fg2': '#cdbba6',
        '--ct-fg3': '#8a7560',
        '--ct-accent': '#d98c3f',
        '--ct-accent2': '#f0b974',
        '--ct-accent3': '#7a3f1d',
        '--ct-border': 'rgba(217,140,63,0.16)',
        '--ct-border2': 'rgba(217,140,63,0.3)',
        '--ct-card': 'rgba(255,255,255,0.03)',
        '--ct-card-hover': 'rgba(255,255,255,0.06)',
        '--ct-loader-bg': '#1c1410',
      }
    : {
        '--ct-bg': '#fdf6ec',
        '--ct-bg2': '#f7ead8',
        '--ct-bg3': '#f0dcc4',
        '--ct-fg': '#2a1c10',
        '--ct-fg2': '#7a6147',
        '--ct-fg3': '#b39d84',
        '--ct-accent': '#c1622a',
        '--ct-accent2': '#e08a3e',
        '--ct-accent3': '#5c3318',
        '--ct-border': 'rgba(193,98,42,0.16)',
        '--ct-border2': 'rgba(193,98,42,0.3)',
        '--ct-card': 'rgba(255,255,255,0.55)',
        '--ct-card-hover': 'rgba(255,255,255,0.85)',
        '--ct-loader-bg': '#fdf6ec',
      }

  // ── GSAP Animations ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pageLoaded) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // ── Hero entrance ──────────────────────────────────────────────────────
      const heroTL = gsap.timeline({ delay: 0.1 })
      heroTL
        .fromTo('.ct-hero-tag', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo('.ct-hero-line', { y: 110, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.13, ease: 'power4.out' }, '-=0.3')
        .fromTo('.ct-hero-sub', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=0.5')
        .fromTo('.ct-hero-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .fromTo('.ct-scroll-hint', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.3')
        .fromTo('.ct-hero-badge', { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.4)' }, '-=0.8')

      // ── Hero parallax ──────────────────────────────────────────────────────
      gsap.to('.ct-hero-img', {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: { trigger: '#ct-hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
      })

      // ── Nav reveal ────────────────────────────────────────────────────────
      gsap.fromTo('.ct-nav', { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 })

      // ── Stats ─────────────────────────────────────────────────────────────
      gsap.fromTo('.ct-stat-item',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-stats', start: 'top 82%' } }
      )

      // ── Marquee ───────────────────────────────────────────────────────────
      gsap.to('.ct-marquee-track', {
        xPercent: -50,
        repeat: -1,
        duration: 22,
        ease: 'linear',
      })

      // ── About / Story section ───────────────────────────────────────────────
      gsap.fromTo('.ct-section-label',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 82%' } }
      )
      gsap.fromTo('.ct-about-heading .ct-split',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.07, ease: 'power4.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 78%' } }
      )
      gsap.fromTo('.ct-about-body',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 70%' } }
      )
      gsap.fromTo('.ct-about-img-wrap',
        { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
        { clipPath: 'inset(0% 0 0 0)', opacity: 1, duration: 1.3, ease: 'power4.inOut',
          scrollTrigger: { trigger: '#ct-about', start: 'top 72%' } }
      )

      // ── Quote strip ───────────────────────────────────────────────────────
      gsap.fromTo('.ct-quote-inner',
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.ct-quote-strip', start: 'top 82%' } }
      )

      // ── Menu tabs + cards ─────────────────────────────────────────────────
      gsap.fromTo('.ct-menu-tabs',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-menu', start: 'top 78%' } }
      )
      gsap.fromTo('.ct-menu-card',
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-menu', start: 'top 72%' } }
      )

      // ── Full-width image parallax ──────────────────────────────────────────
      gsap.to('.ct-fullwidth-img', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.ct-fullwidth-wrap', start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      // ── Catering cards ───────────────────────────────────────────────────
      gsap.fromTo('.ct-catering-card',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.14, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-catering', start: 'top 76%' } }
      )

      // ── Testimonial cards ─────────────────────────────────────────────────
      gsap.fromTo('.ct-testi-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-testimonials', start: 'top 78%' } }
      )

      // ── Visit / location ──────────────────────────────────────────────────
      gsap.fromTo('.ct-visit-left',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-visit', start: 'top 76%' } }
      )
      gsap.fromTo('.ct-visit-right',
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-visit', start: 'top 76%' } }
      )

      // ── CTA ───────────────────────────────────────────────────────────────
      gsap.fromTo('.ct-cta-heading',
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
          scrollTrigger: { trigger: '#ct-cta', start: 'top 80%' } }
      )
      gsap.fromTo('.ct-cta-btns',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-cta', start: 'top 75%' } }
      )

      // ── Line reveals ──────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.ct-line-reveal').forEach(el => {
        gsap.fromTo(el,
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 1.4, ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 88%' } }
        )
      })

    }, pageRef)
    return () => ctx.revert()
  }, [pageLoaded])
  return (
    <div
      ref={pageRef}
      style={{
        ...themeVars as React.CSSProperties,
        background: 'var(--ct-bg)',
        color: 'var(--ct-fg)',
        fontFamily: '"Inter", system-ui, sans-serif',
        minHeight: '100vh',
        overflowX: 'hidden',
      } as React.CSSProperties}
    >

      {/* ── Global Styles ───────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: var(--ct-bg); }
        ::-webkit-scrollbar-thumb { background: var(--ct-accent); border-radius: 2px; }

        /* Page Loader */
        .ct-loader {
          position: fixed; inset: 0; z-index: 9999;
          background: var(--ct-loader-bg);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 2rem;
          transition: opacity 0.6s ease, visibility 0.6s ease;
        }
        .ct-loader.gone { opacity: 0; visibility: hidden; pointer-events: none; }
        .ct-loader-logo {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem; font-weight: 600; color: var(--ct-fg);
          display: flex; align-items: center; gap: 0.6rem;
          letter-spacing: -0.02em;
        }
        .ct-loader-logo span { color: var(--ct-accent); font-style: italic; }
        .ct-loader-bar-wrap {
          width: 200px; height: 1px;
          background: var(--ct-border);
          overflow: hidden;
        }
        .ct-loader-bar {
          height: 100%; background: var(--ct-accent);
          transition: width 0.1s ease;
        }
        .ct-loader-pct {
          font-size: 0.72rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--ct-fg3);
        }

        /* Custom cursor */
        .ct-cursor-dot {
          position: fixed; width: 6px; height: 6px; border-radius: 50%;
          background: var(--ct-accent); pointer-events: none; z-index: 9997;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease, opacity 0.2s ease;
          mix-blend-mode: exclusion;
        }
        .ct-cursor-ring {
          position: fixed; border-radius: 50%;
          border: 1px solid var(--ct-accent); pointer-events: none; z-index: 9996;
          transform: translate(-50%, -50%);
          transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
          opacity: 0.5;
        }
        .ct-cursor-ring.normal { width: 36px; height: 36px; }
        .ct-cursor-ring.hover { width: 56px; height: 56px; opacity: 0.3; }
        @media (max-width: 900px) {
          .ct-cursor-dot, .ct-cursor-ring { display: none; }
        }

        /* Nav */
        .ct-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          height: 72px;
          transition: background 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease;
          border-bottom: 1px solid transparent;
          opacity: 0;
        }
        .ct-nav.scrolled {
          background: color-mix(in srgb, var(--ct-bg) 88%, transparent);
          backdrop-filter: blur(24px) saturate(200%);
          border-bottom-color: var(--ct-border);
        }
        .ct-nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 600;
          letter-spacing: -0.02em; color: var(--ct-fg);
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none; cursor: pointer;
          transition: color 0.3s ease;
        }
        .ct-nav-logo:hover { color: var(--ct-accent); }
        .ct-nav-logo em { font-style: italic; color: var(--ct-accent); font-weight: 400; }
        .ct-nav-links { display: flex; align-items: center; gap: 2.5rem; }
        .ct-nav-link {
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ct-fg2); text-decoration: none;
          position: relative; transition: color 0.3s ease; cursor: pointer;
        }
        .ct-nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
          height: 1px; background: var(--ct-accent);
          transform: scaleX(0); transform-origin: right; transition: transform 0.35s ease;
        }
        .ct-nav-link:hover { color: var(--ct-fg); }
        .ct-nav-link:hover::after { transform: scaleX(1); transform-origin: left; }
        .ct-nav-actions { display: flex; align-items: center; gap: 0.75rem; }
        .ct-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid var(--ct-border); background: transparent;
          color: var(--ct-fg2); cursor: pointer;
          transition: all 0.3s ease;
        }
        .ct-icon-btn:hover { border-color: var(--ct-accent); color: var(--ct-accent); background: color-mix(in srgb, var(--ct-accent) 8%, transparent); }
        .ct-cta-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.5rem; border-radius: 2px;
          background: var(--ct-accent); color: #fff;
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.07em;
          text-transform: uppercase; text-decoration: none; border: none; cursor: pointer;
          transition: all 0.35s ease; position: relative; overflow: hidden;
        }
        .ct-cta-btn::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0.12);
          transform: translateX(-100%); transition: transform 0.4s ease;
        }
        .ct-cta-btn:hover::before { transform: translateX(0); }
        .ct-cta-btn:hover { background: var(--ct-accent2); transform: translateY(-1px); box-shadow: 0 8px 30px -8px rgba(217,140,63,0.5); }
        .ct-cta-btn-ghost {
          background: transparent; color: var(--ct-fg);
          border: 1px solid var(--ct-border);
        }
        .ct-cta-btn-ghost::before { background: color-mix(in srgb, var(--ct-accent) 12%, transparent); }
        .ct-cta-btn-ghost:hover { border-color: var(--ct-accent); color: var(--ct-accent); background: transparent; box-shadow: 0 8px 30px -8px rgba(217,140,63,0.2); }
        .ct-cta-btn:disabled, .ct-cta-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Hamburger */
        .ct-hamburger {
          display: none; flex-direction: column; gap: 6px;
          width: 30px; cursor: pointer; background: none; border: none; padding: 4px;
        }
        .ct-hamburger span {
          display: block; width: 100%; height: 1px; background: var(--ct-fg);
          transition: all 0.45s cubic-bezier(0.77,0,0.175,1);
        }
        .ct-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .ct-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .ct-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        @media (max-width: 768px) {
          .ct-nav-links, .ct-nav-cta-desktop { display: none; }
          .ct-hamburger { display: flex; }
        }

        /* Mobile menu */
        .ct-mobile-menu {
          position: fixed; inset: 0; z-index: 600;
          background: var(--ct-bg); display: flex; flex-direction: column;
          padding: 1.5rem clamp(1.5rem, 5vw, 4rem) 3rem;
          transform: translateX(100%);
          transition: transform 0.55s cubic-bezier(0.77,0,0.175,1);
        }
        .ct-mobile-menu.open { transform: translateX(0); }
        .ct-mobile-menu-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 3rem; padding-top: 0.5rem;
        }
        .ct-mobile-nav-link {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 7vw, 4rem); font-weight: 400;
          color: var(--ct-fg); text-decoration: none;
          display: flex; align-items: center; justify-content: space-between;
          line-height: 1.1; cursor: pointer;
          transition: color 0.3s ease, padding-left 0.3s ease;
          border-bottom: 1px solid var(--ct-border); padding: 0.9rem 0;
        }
        .ct-mobile-nav-link:hover { color: var(--ct-accent); padding-left: 8px; }
        .ct-mobile-nav-num {
          font-family: 'Inter', sans-serif; font-size: 0.75rem;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--ct-accent);
        }

        /* Hero */
        #ct-hero {
          position: relative; height: 100svh; min-height: 600px;
          display: flex; align-items: flex-end;
          padding: 0 clamp(1.5rem, 5vw, 4rem) clamp(3rem, 8vh, 5.5rem);
          overflow: hidden;
        }
        .ct-hero-img {
          position: absolute; inset: -10%;
          background-image: url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=2400&q=90');
          background-size: cover; background-position: center;
          will-change: transform;
        }
        .ct-hero-img::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            color-mix(in srgb, var(--ct-bg) 85%, transparent) 0%,
            color-mix(in srgb, var(--ct-bg) 60%, transparent) 35%,
            color-mix(in srgb, var(--ct-bg) 20%, transparent) 65%,
            var(--ct-bg) 100%
          );
        }
        .ct-hero-content { position: relative; z-index: 2; max-width: 860px; }
        .ct-hero-tag {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.72rem; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--ct-accent);
          margin-bottom: 1.5rem; opacity: 0;
        }
        .ct-hero-tag::before {
          content: ''; display: block; width: 28px; height: 1px; background: var(--ct-accent);
        }
        .ct-hero-line {
          display: block; overflow: hidden;
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 7.5vw, 6.5rem);
          font-weight: 400; line-height: 1.0;
          letter-spacing: -0.025em; color: var(--ct-fg);
          opacity: 0;
        }
        .ct-hero-line em { font-style: italic; color: var(--ct-accent); }
        .ct-hero-sub {
          font-size: clamp(0.88rem, 1.4vw, 1rem);
          color: var(--ct-fg2); margin-top: 1.75rem;
          max-width: 440px; line-height: 1.75; opacity: 0;
        }
        .ct-hero-cta {
          display: flex; align-items: center; gap: 1rem;
          margin-top: 2.5rem; flex-wrap: wrap; opacity: 0;
        }
        .ct-hero-badge {
          position: absolute; top: clamp(5rem, 12vh, 8rem); right: clamp(1.5rem, 5vw, 4rem);
          width: 110px; height: 110px; border-radius: 50%;
          border: 1px solid var(--ct-border2);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.2rem; z-index: 2; opacity: 0;
          background: color-mix(in srgb, var(--ct-bg) 70%, transparent);
          backdrop-filter: blur(10px);
          animation: badgeSpin 20s linear infinite;
        }
        @keyframes badgeSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ct-hero-badge-inner {
          display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
          animation: badgeSpinReverse 20s linear infinite;
        }
        @keyframes badgeSpinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .ct-hero-badge-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 600; color: var(--ct-accent); line-height: 1;
        }
        .ct-hero-badge-txt {
          font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--ct-fg2); text-align: center; line-height: 1.4;
        }
        .ct-scroll-hint {
          position: absolute; bottom: 2.5rem; right: clamp(1.5rem, 5vw, 4rem);
          z-index: 2; display: flex; flex-direction: column;
          align-items: center; gap: 0.5rem;
          font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--ct-fg3); writing-mode: vertical-rl; opacity: 0;
          animation: scrollBob 2.5s ease-in-out infinite;
        }
        @keyframes scrollBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        /* Stats */
        #ct-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--ct-border);
          border-bottom: 1px solid var(--ct-border);
        }
        .ct-stat-item {
          padding: 2.5rem clamp(1rem, 3vw, 3rem); text-align: center;
          border-right: 1px solid var(--ct-border);
          position: relative; overflow: hidden;
        }
        .ct-stat-item:last-child { border-right: none; }
        .ct-stat-item::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, color-mix(in srgb, var(--ct-accent) 4%, transparent), transparent);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .ct-stat-item:hover::before { opacity: 1; }
        .ct-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 600;
          color: var(--ct-accent); display: block;
        }
        .ct-stat-label {
          font-size: 0.72rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--ct-fg2);
          margin-top: 0.3rem; display: block;
        }
        .ct-stat-sub {
          font-size: 0.72rem; color: var(--ct-fg3);
          margin-top: 0.2rem; display: block;
        }
        @media (max-width: 600px) {
          #ct-stats { grid-template-columns: 1fr; }
          .ct-stat-item { border-right: none; border-bottom: 1px solid var(--ct-border); }
          .ct-stat-item:last-child { border-bottom: none; }
        }

        /* Marquee */
        .ct-marquee-wrap {
          overflow: hidden;
          border-top: 1px solid var(--ct-border);
          border-bottom: 1px solid var(--ct-border);
          padding: 0.9rem 0; background: var(--ct-bg3);
        }
        .ct-marquee-track {
          display: flex; gap: 3rem; align-items: center;
          white-space: nowrap; width: max-content;
        }
        .ct-marquee-word {
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--ct-fg2); flex-shrink: 0;
        }
        .ct-marquee-word.dot { color: var(--ct-accent); font-size: 0.9rem; }

        /* Section layout */
        .ct-section { padding: clamp(4.5rem, 9vh, 7rem) clamp(1.5rem, 5vw, 4rem); }
        .ct-section-inner { max-width: 1400px; margin: 0 auto; }
        .ct-section-label {
          display: flex; align-items: center; gap: 0.75rem;
          font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--ct-accent); margin-bottom: 1.5rem;
        }
        .ct-section-label::before { content: ''; display: block; width: 28px; height: 1px; background: var(--ct-accent); }
        .ct-section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 4.5vw, 4rem);
          font-weight: 400; line-height: 1.1; letter-spacing: -0.02em;
        }
        .ct-section-heading .ct-split { display: inline-block; }
        .ct-section-heading em { font-style: italic; color: var(--ct-accent); }

        /* About / Story */
        .ct-about-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem); align-items: center; margin-top: 4rem;
        }
        @media (max-width: 768px) { .ct-about-grid { grid-template-columns: 1fr; } }
        .ct-about-img-wrap {
          position: relative; border-radius: 2px; overflow: hidden;
          aspect-ratio: 4/5; clip-path: inset(0 0 0 0);
        }
        .ct-about-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.9s ease;
        }
        .ct-about-img-wrap:hover img { transform: scale(1.05); }
        .ct-about-img-badge {
          position: absolute; bottom: 1.5rem; left: 1.5rem;
          background: var(--ct-accent); color: #fff;
          padding: 0.45rem 0.9rem; font-size: 0.68rem;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500;
        }
        .ct-about-body { display: flex; flex-direction: column; gap: 1.25rem; }
        .ct-about-body p { color: var(--ct-fg2); line-height: 1.85; font-size: 0.97rem; }
        .ct-about-list { display: flex; flex-direction: column; gap: 0.9rem; margin-top: 0.5rem; }
        .ct-about-list-item { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.88rem; color: var(--ct-fg2); }
        .ct-about-list-item svg { color: var(--ct-accent); flex-shrink: 0; margin-top: 2px; }

        /* Quote strip */
        .ct-quote-strip {
          padding: clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem);
          background: var(--ct-bg3);
          border-top: 1px solid var(--ct-border);
          border-bottom: 1px solid var(--ct-border);
        }
        .ct-quote-inner { max-width: 900px; margin: 0 auto; }
        .ct-quote-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.3rem, 2.5vw, 2rem);
          font-weight: 400; font-style: italic;
          color: var(--ct-fg); line-height: 1.55;
        }
        .ct-quote-text::before { content: '"'; color: var(--ct-accent); }
        .ct-quote-text::after { content: '"'; color: var(--ct-accent); }
        .ct-quote-attr {
          margin-top: 1rem; font-size: 0.75rem;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--ct-accent);
        }

        /* Menu */
        .ct-menu-tabs {
          display: flex; gap: 0; margin-top: 3rem;
          border-bottom: 1px solid var(--ct-border); overflow-x: auto;
          scrollbar-width: none; opacity: 0;
        }
        .ct-menu-tabs::-webkit-scrollbar { display: none; }
        .ct-menu-tab {
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ct-fg2);
          padding: 0.75rem 1.5rem; cursor: pointer; border: none;
          background: transparent; position: relative; transition: color 0.3s ease;
          white-space: nowrap;
        }
        .ct-menu-tab.active { color: var(--ct-accent); }
        .ct-menu-tab.active::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
          height: 1px; background: var(--ct-accent);
        }
        .ct-menu-tab:hover { color: var(--ct-fg); }
        .ct-menu-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem; margin-top: 2.5rem;
        }
        .ct-menu-card {
          background: var(--ct-card); border: 1px solid var(--ct-border);
          border-radius: 2px; overflow: hidden; transition: all 0.4s ease;
          cursor: pointer; text-align: left;
        }
        .ct-menu-card:hover {
          background: var(--ct-card-hover); border-color: var(--ct-accent);
          transform: translateY(-5px);
          box-shadow: 0 24px 60px -20px rgba(217,140,63,0.22);
        }
        .ct-menu-card-img-wrap { overflow: hidden; aspect-ratio: 4/3; }
        .ct-menu-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .ct-menu-card:hover .ct-menu-card-img { transform: scale(1.06); }
        .ct-menu-card-body { padding: 1.35rem; }
        .ct-menu-card-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 0.65rem; gap: 0.5rem;
        }
        .ct-menu-card-name { font-size: 0.97rem; font-weight: 500; color: var(--ct-fg); line-height: 1.3; }
        .ct-menu-card-price {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; color: var(--ct-accent); font-weight: 600;
          white-space: nowrap; margin-left: 0.75rem;
        }
        .ct-menu-card-desc { font-size: 0.82rem; color: var(--ct-fg2); line-height: 1.65; margin-bottom: 1rem; }
        .ct-menu-card-badge {
          display: inline-block; padding: 0.2rem 0.55rem;
          font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
          background: color-mix(in srgb, var(--ct-accent) 12%, transparent);
          color: var(--ct-accent); border: 1px solid var(--ct-border2); border-radius: 1rem;
          margin-bottom: 0.6rem;
        }
        .ct-menu-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ct-fg3);
        }
        .ct-menu-card-footer svg { transition: transform 0.3s ease; }
        .ct-menu-card:hover .ct-menu-card-footer svg { transform: translate(3px, -3px); color: var(--ct-accent); }

        /* Full-width image */
        .ct-fullwidth-wrap {
          position: relative; height: clamp(280px, 45vh, 480px); overflow: hidden;
        }
        .ct-fullwidth-img {
          position: absolute; inset: -10%;
          background-image: url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=2000&q=85');
          background-size: cover; background-position: center;
          will-change: transform;
        }
        .ct-fullwidth-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            color-mix(in srgb, var(--ct-bg) 75%, transparent) 0%,
            color-mix(in srgb, var(--ct-bg) 40%, transparent) 40%,
            transparent 100%
          );
        }
        .ct-fullwidth-content {
          position: absolute; top: 50%; left: clamp(1.5rem, 5vw, 4rem);
          transform: translateY(-50%); max-width: 460px;
        }

        /* Catering */
        .ct-catering-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem; margin-top: 3rem;
        }
        @media (max-width: 900px) { .ct-catering-grid { grid-template-columns: 1fr; } }
        .ct-catering-card {
          border: 1px solid var(--ct-border); background: var(--ct-card);
          overflow: hidden; border-radius: 2px; transition: all 0.4s ease;
          display: flex; flex-direction: column;
        }
        .ct-catering-card:hover { border-color: var(--ct-accent); transform: translateY(-5px); box-shadow: 0 24px 60px -20px rgba(217,140,63,0.22); }
        .ct-catering-img-wrap { overflow: hidden; aspect-ratio: 16/10; position: relative; }
        .ct-catering-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .ct-catering-card:hover .ct-catering-img { transform: scale(1.06); }
        .ct-catering-tag {
          position: absolute; top: 1rem; left: 1rem;
          background: var(--ct-accent); color: #fff;
          padding: 0.25rem 0.6rem; font-size: 0.65rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
        }
        .ct-catering-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
        .ct-catering-name { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: var(--ct-fg); }
        .ct-catering-guests { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ct-accent); }
        .ct-catering-price { font-size: 0.9rem; color: var(--ct-fg2); font-weight: 500; }
        .ct-catering-includes { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem; }
        .ct-catering-includes li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.82rem; color: var(--ct-fg2); }
        .ct-catering-includes li svg { color: var(--ct-accent); flex-shrink: 0; margin-top: 2px; }
        .ct-catering-footer { margin-top: auto; padding-top: 0.5rem; }

        /* Testimonials */
        .ct-testi-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem; margin-top: 3rem;
        }
        @media (max-width: 700px) { .ct-testi-grid { grid-template-columns: 1fr; } }
        .ct-testi-card {
          background: var(--ct-card); border: 1px solid var(--ct-border);
          padding: 2rem; border-radius: 2px; transition: all 0.4s ease;
          position: relative;
        }
        .ct-testi-card:hover { border-color: var(--ct-accent); background: var(--ct-card-hover); transform: translateY(-3px); }
        .ct-testi-quote-icon { color: var(--ct-accent); opacity: 0.4; margin-bottom: 1rem; }
        .ct-testi-stars { display: flex; gap: 2px; margin-bottom: 0.75rem; }
        .ct-testi-text {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem; color: var(--ct-fg); line-height: 1.75;
          font-style: italic; margin-bottom: 1.5rem;
        }
        .ct-testi-name { font-size: 0.85rem; font-weight: 500; color: var(--ct-fg); }
        .ct-testi-role { font-size: 0.75rem; color: var(--ct-fg2); margin-top: 0.15rem; }

        /* Visit / location */
        .ct-visit-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem); align-items: start; margin-top: 4rem;
        }
        @media (max-width: 768px) { .ct-visit-grid { grid-template-columns: 1fr; } }
        .ct-visit-detail {
          display: flex; align-items: flex-start; gap: 0.85rem;
          margin-bottom: 1.25rem; font-size: 0.92rem; color: var(--ct-fg2);
        }
        .ct-visit-detail-icon {
          color: var(--ct-accent); flex-shrink: 0; margin-top: 2px;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid var(--ct-border); display: flex;
          align-items: center; justify-content: center;
        }
        .ct-visit-detail-title { font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ct-accent); margin-bottom: 0.3rem; }
        .ct-visit-hours-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--ct-fg2); padding: 0.4rem 0; border-bottom: 1px solid var(--ct-border); }
        .ct-visit-hours-row:last-child { border-bottom: none; }
        .ct-visit-hours-row.today { color: var(--ct-fg); font-weight: 500; }
        .ct-map-wrap {
          position: relative; border-radius: 2px; overflow: hidden;
          aspect-ratio: 4/5; border: 1px solid var(--ct-border);
        }
        .ct-map-wrap iframe { width: 100%; height: 100%; border: 0; filter: grayscale(0.15) contrast(1.05); }

        /* CTA */
        .ct-cta-section {
          position: relative; overflow: hidden;
          padding: clamp(6rem, 12vh, 9rem) clamp(1.5rem, 5vw, 4rem);
          text-align: center;
        }
        .ct-cta-bg {
          position: absolute; inset: -10%;
          background-image: url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=2000&q=85');
          background-size: cover; background-position: center;
        }
        .ct-cta-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--ct-bg) 55%, transparent) 0%,
            color-mix(in srgb, var(--ct-bg) 40%, transparent) 50%,
            color-mix(in srgb, var(--ct-bg) 55%, transparent) 100%
          );
        }
        .ct-cta-content { position: relative; z-index: 2; }
        .ct-cta-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5.5vw, 4.5rem);
          font-weight: 400; line-height: 1.1; letter-spacing: -0.025em;
          color: var(--ct-fg); margin-bottom: 1.25rem; opacity: 0;
        }
        .ct-cta-heading em { font-style: italic; color: var(--ct-accent); }
        .ct-cta-sub { font-size: 1rem; color: var(--ct-fg2); margin-bottom: 2.5rem; }
        .ct-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; opacity: 0; }

        /* Footer */
        .ct-footer {
          border-top: 1px solid var(--ct-border);
          padding: clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem) 2rem;
          background: var(--ct-bg2);
        }
        .ct-footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
        }
        @media (max-width: 900px) { .ct-footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        @media (max-width: 500px) { .ct-footer-grid { grid-template-columns: 1fr; } }
        .ct-footer-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem; font-weight: 600; color: var(--ct-fg);
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;
        }
        .ct-footer-brand-name em { font-style: italic; color: var(--ct-accent); font-weight: 400; }
        .ct-footer-brand-desc { font-size: 0.85rem; color: var(--ct-fg2); line-height: 1.8; max-width: 280px; }
        .ct-footer-social { display: flex; gap: 0.65rem; margin-top: 1.5rem; }
        .ct-footer-heading {
          font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--ct-accent); margin-bottom: 1.25rem; font-weight: 500;
        }
        .ct-footer-link {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.85rem; color: var(--ct-fg2);
          text-decoration: none; margin-bottom: 0.55rem;
          transition: color 0.3s ease; cursor: pointer; background: none; border: none;
        }
        .ct-footer-link:hover { color: var(--ct-accent); }
        .ct-footer-bottom {
          border-top: 1px solid var(--ct-border); margin-top: 3rem; padding-top: 1.75rem;
          display: flex; flex-direction: column; gap: 0.75rem;
          font-size: 0.75rem; color: var(--ct-fg3);
        }
        .ct-footer-bottom-row {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 0.75rem;
        }
        .ct-footer-disclaimer {
          font-size: 0.72rem; color: var(--ct-fg3); line-height: 1.7;
          padding-top: 0.75rem; border-top: 1px solid var(--ct-border);
          font-style: italic;
        }

        /* Divider */
        .ct-divider { height: 1px; background: var(--ct-border); }
        .ct-line-reveal { transform-origin: left; }

        /* Modal (in-page "pages") */
        .ct-modal-overlay {
          position: fixed; inset: 0; z-index: 800;
          background: color-mix(in srgb, var(--ct-bg) 55%, rgba(0,0,0,0.4));
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(1rem, 4vw, 3rem);
        }
        .ct-modal-panel {
          background: var(--ct-bg); border: 1px solid var(--ct-border);
          border-radius: 4px; max-width: 720px; width: 100%;
          max-height: 88vh; overflow-y: auto; position: relative;
          box-shadow: 0 40px 100px -30px rgba(0,0,0,0.45);
        }
        .ct-modal-panel.wide { max-width: 920px; }
        .ct-modal-close {
          position: absolute; top: 1rem; right: 1rem; z-index: 2;
          width: 38px; height: 38px; border-radius: 50%;
          background: color-mix(in srgb, var(--ct-bg) 70%, transparent);
          backdrop-filter: blur(10px);
          border: 1px solid var(--ct-border); color: var(--ct-fg);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.25s ease;
        }
        .ct-modal-close:hover { border-color: var(--ct-accent); color: var(--ct-accent); }
        .ct-modal-img-wrap { aspect-ratio: 16/9; overflow: hidden; }
        .ct-modal-img { width: 100%; height: 100%; object-fit: cover; }
        .ct-modal-body { padding: clamp(1.5rem, 4vw, 2.5rem); }
        .ct-modal-tag {
          display: inline-block; padding: 0.25rem 0.65rem; margin-bottom: 0.85rem;
          font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase;
          background: color-mix(in srgb, var(--ct-accent) 12%, transparent);
          color: var(--ct-accent); border: 1px solid var(--ct-border2); border-radius: 1rem;
        }
        .ct-modal-title-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 1rem; margin-bottom: 0.75rem;
        }
        .ct-modal-title { font-family: 'Playfair Display', serif; font-size: clamp(1.5rem, 4vw, 2.2rem); color: var(--ct-fg); line-height: 1.15; }
        .ct-modal-price { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--ct-accent); font-weight: 600; white-space: nowrap; }
        .ct-modal-desc { font-size: 0.95rem; color: var(--ct-fg2); line-height: 1.8; margin-bottom: 1.5rem; }
        .ct-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        @keyframes ctModalIn { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .ct-modal-panel { animation: ctModalIn 0.4s cubic-bezier(0.16,1,0.3,1); }
        @keyframes ctOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .ct-modal-overlay { animation: ctOverlayIn 0.3s ease; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── Page Loader ──────────────────────────────────────────────────── */}
      <div className={`ct-loader${pageLoaded ? ' gone' : ''}`}>
        <div className="ct-loader-logo">
          <Coffee size={26} style={{ color: 'var(--ct-accent)' }} />
          Cafe <span>Teresita</span>
        </div>
        <div className="ct-loader-bar-wrap">
          <div className="ct-loader-bar" style={{ width: `${loadProgress}%` }} />
        </div>
        <span className="ct-loader-pct">{Math.round(loadProgress)}%</span>
      </div>

      {/* ── Custom Cursor ─────────────────────────────────────────────────── */}
      <div className="ct-cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div
        className={`ct-cursor-ring${cursorHover ? ' hover' : ' normal'}`}
        style={{ left: cursorRing.x, top: cursorRing.y }}
      />

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className={`ct-nav${scrolled ? ' scrolled' : ''}`}>
        <a
          className="ct-nav-logo"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          href="#"
        >
          <Coffee size={20} style={{ color: 'var(--ct-accent)' }} />
          Cafe <em>Teresita</em>
        </a>
        <div className="ct-nav-links">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="ct-nav-link"
              onClick={e => { e.preventDefault(); smoothScroll(link.href) }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="ct-nav-actions">
          <button className="ct-icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            className="ct-cta-btn ct-nav-cta-desktop"
            onClick={() => smoothScroll('#ct-visit')}
            style={{ borderRadius: '2px' }}
          >
            Visit Us <ArrowRight size={13} />
          </button>
          <button
            className={`ct-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
      <div className={`ct-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="ct-mobile-menu-head">
          <div className="ct-footer-brand-name" style={{ marginBottom: 0, fontSize: '1.2rem' }}>
            <Coffee size={18} style={{ color: 'var(--ct-accent)' }} />
            Cafe <em>Teresita</em>
          </div>
          <button className="ct-icon-btn" onClick={() => setMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            className="ct-mobile-nav-link"
            onClick={e => { e.preventDefault(); smoothScroll(link.href) }}
          >
            {link.label}
            <span className="ct-mobile-nav-num">0{i + 1}</span>
          </a>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="ct-cta-btn" onClick={() => smoothScroll('#ct-visit')} style={{ borderRadius: '2px' }}>
            Visit Us <ArrowRight size={13} />
          </button>
          <button className="ct-icon-btn" onClick={() => { setDark(!dark) }} aria-label="Toggle theme">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="ct-hero" ref={heroRef}>
        <div className="ct-hero-img" />
        <div className="ct-hero-badge">
          <div className="ct-hero-badge-inner">
            <span className="ct-hero-badge-num">4.5</span>
            <span className="ct-hero-badge-txt">★ Google<br/>Rating</span>
          </div>
        </div>
        <div className="ct-hero-content">
          <div className="ct-hero-tag">
            <Coffee size={11} />
            Calubo, Kinoguitan — Misamis Oriental
          </div>
          <h1>
            <span className="ct-hero-line">Brewed warm,</span>
            <span className="ct-hero-line"><em>served</em> with</span>
            <span className="ct-hero-line">good company.</span>
          </h1>
          <p className="ct-hero-sub">
            Cafe Teresita by Guada's — the modest cafe along the highway in Calubo,
            serving coffee, home-style rice meals, and merienda favorites to the
            Kinoguitan community, every day from 10AM to 10PM.
          </p>
          <div className="ct-hero-cta">
            <button
              className="ct-cta-btn"
              onClick={() => smoothScroll('#ct-menu')}
              style={{ borderRadius: '2px' }}
            >
              See Our Menu <ArrowRight size={13} />
            </button>
            <button
              className="ct-cta-btn ct-cta-btn-ghost"
              onClick={() => smoothScroll('#ct-about')}
              style={{ borderRadius: '2px' }}
            >
              Our Story
            </button>
          </div>
        </div>
        <div className="ct-scroll-hint">
          <ChevronDown size={13} />
          Scroll
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div id="ct-stats">
        {STATS.map((s, i) => (
          <div key={i} className="ct-stat-item">
            <span className="ct-stat-num">{s.value}</span>
            <span className="ct-stat-label">{s.label}</span>
            <span className="ct-stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <div className="ct-marquee-wrap">
        <div className="ct-marquee-track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className={`ct-marquee-word${w === '·' ? ' dot' : ''}`}>{w}</span>
          ))}
        </div>
      </div>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="ct-about" className="ct-section" style={{ background: 'var(--ct-bg)' }}>
        <div className="ct-section-inner">
          <div className="ct-section-label">About Cafe Teresita</div>
          <h2 className="ct-section-heading ct-about-heading">
            <span className="ct-split">A modest cafe, </span>
            <span className="ct-split"><em>made with</em> </span>
            <span className="ct-split">heart.</span>
          </h2>
          <div className="ct-about-grid">
            <div className="ct-about-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=900&q=85"
                alt="Cafe Teresita interior"
              />
              <div className="ct-about-img-badge">Calubo, Kinoguitan</div>
            </div>
            <div className="ct-about-body">
              <p>
                Cafe Teresita by Guada's sits right along the national highway in
                Calubo, Kinoguitan — a small municipality on the northern coast of
                Misamis Oriental. It's a simple, welcoming stop for travelers and
                locals alike, known around town as one of the few proper cafes in
                the area.
              </p>
              <p>
                From house-blend coffee in the morning to hearty rice meals at noon
                and merienda snacks in the afternoon, Cafe Teresita keeps things
                warm, familiar, and unpretentious — the kind of place where the
                staff remembers your order.
              </p>
              <p>
                We're also proud to provide catering for birthdays, family
                gatherings, and community events around Kinoguitan — bringing the
                same food and care straight to your celebration.
              </p>
              <div className="ct-about-list">
                <div className="ct-about-list-item">
                  <Clock size={16} />
                  Open daily, 10:00 AM – 10:00 PM
                </div>
                <div className="ct-about-list-item">
                  <MapPin size={16} />
                  Along the national highway, Calubo, Kinoguitan, Misamis Oriental
                </div>
                <div className="ct-about-list-item">
                  <CalendarCheck size={16} />
                  Catering available for birthdays &amp; community events
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="ct-cta-btn"
                  onClick={() => smoothScroll('#ct-catering')}
                  style={{ borderRadius: '2px' }}
                >
                  Catering Packages <ArrowRight size={13} />
                </button>
                <button
                  className="ct-cta-btn ct-cta-btn-ghost"
                  onClick={() => smoothScroll('#ct-visit')}
                  style={{ borderRadius: '2px' }}
                >
                  Find Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ct-divider ct-line-reveal" style={{ margin: '0 clamp(1.5rem, 5vw, 4rem)' }} />

      {/* ── Quote Strip ────────────────────────────────────────────────────── */}
      <div className="ct-quote-strip">
        <div className="ct-quote-inner">
          <p className="ct-quote-text">
            They got good taste with their menu — accessible right along the highway, and the only modest cafe here in Kinoguitan.
          </p>
          <p className="ct-quote-attr">— Verified Customer Review · Google Maps</p>
        </div>
      </div>

      {/* ── Menu ──────────────────────────────────────────────────────────── */}
      <section id="ct-menu" className="ct-section" style={{ background: 'var(--ct-bg2)' }}>
        <div className="ct-section-inner">
          <div className="ct-section-label">What We Serve</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="ct-section-heading">
              <span className="ct-split">The </span>
              <em className="ct-split">menu.</em>
            </h2>
            <p style={{ color: 'var(--ct-fg2)', fontSize: '0.88rem', maxWidth: 300, lineHeight: 1.75 }}>
              Coffee, rice meals, and merienda — tap any item for a closer look.
            </p>
          </div>
          <div className="ct-menu-tabs">
            {MENU_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`ct-menu-tab${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="ct-menu-grid">
            {activeItems.map(item => (
              <button
                key={item.id}
                className="ct-menu-card"
                onClick={() => setMenuModalItem(item)}
              >
                <div className="ct-menu-card-img-wrap">
                  <img className="ct-menu-card-img" src={item.img} alt={item.name} />
                </div>
                <div className="ct-menu-card-body">
                  {item.tag && <span className="ct-menu-card-badge">{item.tag}</span>}
                  <div className="ct-menu-card-top">
                    <span className="ct-menu-card-name">{item.name}</span>
                    <span className="ct-menu-card-price">{item.price}</span>
                  </div>
                  <p className="ct-menu-card-desc">{item.desc}</p>
                  <div className="ct-menu-card-footer">
                    View details
                    <ArrowUpRight size={13} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full-width Image Break ────────────────────────────────────────── */}
      <div className="ct-fullwidth-wrap">
        <div className="ct-fullwidth-img" role="img" aria-label="Cafe Teresita coffee" />
        <div className="ct-fullwidth-overlay" />
        <div className="ct-fullwidth-content">
          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.9rem)',
            fontStyle: 'italic', lineHeight: 1.5, color: 'var(--ct-fg)',
          }}>
            "A very relaxing place with great atmosphere — and the best coffee in
            Northern Mindanao."
          </p>
          <p style={{
            marginTop: '1rem', fontSize: '0.72rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--ct-accent)',
          }}>
            — Restaurant Guru · 4.6 ★ Rating
          </p>
        </div>
      </div>

      {/* ── Catering ──────────────────────────────────────────────────────── */}
      <section id="ct-catering" className="ct-section" style={{ background: 'var(--ct-bg)' }}>
        <div className="ct-section-inner">
          <div className="ct-section-label">Catering Services</div>
          <h2 className="ct-section-heading">
            <span className="ct-split">Bringing the </span>
            <em className="ct-split">cafe</em>
            <span className="ct-split"> to your celebration.</span>
          </h2>
          <p style={{ color: 'var(--ct-fg2)', fontSize: '0.92rem', maxWidth: 540, lineHeight: 1.8, marginTop: '1.25rem' }}>
            From small family gatherings to community-wide events, Cafe Teresita
            brings the same home-style cooking and warm service straight to your
            occasion. Tap a package to see what's included.
          </p>
          <div className="ct-catering-grid">
            {CATERING_PACKAGES.map(pkg => (
              <div key={pkg.id} className="ct-catering-card">
                <div className="ct-catering-img-wrap">
                  <img className="ct-catering-img" src={pkg.img} alt={pkg.name} />
                  {pkg.tag && <span className="ct-catering-tag">{pkg.tag}</span>}
                </div>
                <div className="ct-catering-body">
                  <h3 className="ct-catering-name">{pkg.name}</h3>
                  <span className="ct-catering-guests">{pkg.guests}</span>
                  <span className="ct-catering-price">{pkg.price}</span>
                  <ul className="ct-catering-includes">
                    {pkg.includes.slice(0, 3).map((inc, i) => (
                      <li key={i}>
                        <Soup size={14} />
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <div className="ct-catering-footer">
                    <button
                      className="ct-cta-btn ct-cta-btn-ghost"
                      style={{ borderRadius: '2px', width: '100%', justifyContent: 'center' }}
                      onClick={() => setCateringModal(pkg)}
                    >
                      View Package <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ct-divider ct-line-reveal" style={{ margin: '0 clamp(1.5rem, 5vw, 4rem)' }} />

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section id="ct-testimonials" className="ct-section" style={{ background: 'var(--ct-bg2)' }}>
        <div className="ct-section-inner">
          <div className="ct-section-label">Guest Reviews</div>
          <h2 className="ct-section-heading">
            <span className="ct-split">What people </span>
            <em className="ct-split">are saying.</em>
          </h2>
          <div className="ct-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="ct-testi-card">
                <Quote className="ct-testi-quote-icon" size={28} />
                <div className="ct-testi-stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={13} fill="var(--ct-accent)" stroke="var(--ct-accent)" />
                  ))}
                </div>
                <p className="ct-testi-text">{t.quote}</p>
                <div className="ct-testi-name">{t.name}</div>
                <div className="ct-testi-role">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visit ─────────────────────────────────────────────────────────── */}
      <section id="ct-visit" className="ct-section" style={{ background: 'var(--ct-bg)' }}>
        <div className="ct-section-inner">
          <div className="ct-section-label">Visit Us</div>
          <h2 className="ct-section-heading">
            <span className="ct-split">Find us in </span>
            <em className="ct-split">Calubo.</em>
          </h2>
          <div className="ct-visit-grid">
            <div className="ct-visit-left">
              <div className="ct-visit-detail">
                <div className="ct-visit-detail-icon"><MapPin size={16} /></div>
                <div>
                  <div className="ct-visit-detail-title">Location</div>
                  Along the National Highway, Calubo, Kinoguitan, Misamis Oriental, Philippines
                </div>
              </div>
              <div className="ct-visit-detail">
                <div className="ct-visit-detail-icon"><Star size={16} /></div>
                <div>
                  <div className="ct-visit-detail-title">Rating</div>
                  4.5 ★ on Google — loved by the local community
                </div>
              </div>
              <div className="ct-visit-detail" style={{ marginBottom: '0.5rem' }}>
                <div className="ct-visit-detail-icon"><Clock size={16} /></div>
                <div style={{ width: '100%' }}>
                  <div className="ct-visit-detail-title">Hours</div>
                  <div>
                    {VISIT_HOURS.map(h => (
                      <div key={h.day} className="ct-visit-hours-row">
                        <span>{h.day}</span>
                        <span>{h.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  className="ct-cta-btn"
                  style={{ borderRadius: '2px' }}
                  href="https://maps.app.goo.gl/?q=8.9670078,124.7954639"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions <ExternalLink size={13} />
                </a>
                <button
                  className="ct-cta-btn ct-cta-btn-ghost"
                  style={{ borderRadius: '2px' }}
                  onClick={() => smoothScroll('#ct-catering')}
                >
                  Book Catering
                </button>
              </div>
            </div>
            <div className="ct-visit-right">
              <div className="ct-map-wrap">
                <iframe
                  title="Cafe Teresita location map"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=8.9670078,124.7954639&z=15&output=embed"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section id="ct-cta" className="ct-cta-section">
        <div className="ct-cta-bg" />
        <div className="ct-cta-overlay" />
        <div className="ct-cta-content">
          <h2 className="ct-cta-heading">
            Drop by, <em>say hi,</em><br />grab a cup.
          </h2>
          <p className="ct-cta-sub">Open daily from 10AM to 10PM in Calubo, Kinoguitan.</p>
          <div className="ct-cta-btns">
            <a
              className="ct-cta-btn"
              style={{ borderRadius: '2px' }}
              href="https://maps.app.goo.gl/?q=8.9670078,124.7954639"
              target="_blank"
              rel="noreferrer"
            >
              Get Directions <ArrowRight size={13} />
            </a>
            <button
              className="ct-cta-btn ct-cta-btn-ghost"
              style={{ borderRadius: '2px' }}
              onClick={() => smoothScroll('#ct-menu')}
            >
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="ct-footer">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="ct-footer-grid">
            <div>
              <div className="ct-footer-brand-name">
                <Coffee size={20} style={{ color: 'var(--ct-accent)' }} />
                Cafe <em>Teresita</em>
              </div>
              <p className="ct-footer-brand-desc">
                Cafe Teresita by Guada's — a modest cafe along the national
                highway in Calubo, Kinoguitan, serving coffee, rice meals, and
                merienda to the local community every day.
              </p>
              <div className="ct-footer-social">
                {[
                  { icon: Facebook, label: 'Facebook', href: '#' },
                  { icon: Instagram, label: 'Instagram', href: '#' },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    aria-label={s.label}
                    className="ct-icon-btn"
                    style={{ textDecoration: 'none' }}
                    target={s.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    <s.icon size={14} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="ct-footer-heading">Navigate</div>
              {NAV_LINKS.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  className="ct-footer-link"
                  onClick={e => { e.preventDefault(); smoothScroll(l.href) }}
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div>
              <div className="ct-footer-heading">Visit</div>
              <span className="ct-footer-link" style={{ cursor: 'default' }}>
                <MapPin size={12} style={{ color: 'var(--ct-accent)', flexShrink: 0 }} />
                Calubo, Kinoguitan, Mis. Or.
              </span>
              <span className="ct-footer-link" style={{ cursor: 'default' }}>
                <Clock size={12} style={{ color: 'var(--ct-accent)', flexShrink: 0 }} />
                Open daily, 10AM–10PM
              </span>
              <div style={{ marginTop: '1.25rem' }}>
                <div className="ct-footer-heading">Catering</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--ct-fg2)', lineHeight: 1.75 }}>
                  Available for birthdays, family gatherings &amp; community events.
                  <br />
                  <button
                    className="ct-footer-link"
                    style={{ padding: 0, marginTop: '0.4rem' }}
                    onClick={() => smoothScroll('#ct-catering')}
                  >
                    See packages <ArrowUpRight size={12} />
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="ct-footer-bottom">
            <div className="ct-footer-bottom-row">
              <span>© 2026 Cafe Teresita by Guada's — All Rights Reserved</span>
              <span style={{ color: 'var(--ct-fg3)' }}>Calubo · Kinoguitan · Misamis Oriental</span>
              <span style={{ color: 'var(--ct-fg3)' }}>Concept demo</span>
            </div>
            <div className="ct-footer-disclaimer">
              <strong style={{ fontStyle: 'normal' }}>Disclaimer:</strong> This is a
              concept landing page created for demonstration purposes only, using
              publicly available information (Google Maps listing &amp; reviews)
              and placeholder imagery from Unsplash. This page was not
              commissioned by, and is not an official website of, Cafe Teresita by
              Guada's. Menu items, prices, and catering packages shown are
              illustrative placeholders pending real information from the business.
            </div>
          </div>
        </div>
      </footer>

      {/* ── Menu Item Modal ──────────────────────────────────────────────── */}
      {menuModalItem && (
        <div className="ct-modal-overlay" onClick={() => setMenuModalItem(null)}>
          <div className="ct-modal-panel" onClick={e => e.stopPropagation()}>
            <button className="ct-modal-close" onClick={() => setMenuModalItem(null)} aria-label="Close">
              <X size={16} />
            </button>
            <div className="ct-modal-img-wrap">
              <img className="ct-modal-img" src={menuModalItem.img} alt={menuModalItem.name} />
            </div>
            <div className="ct-modal-body">
              {menuModalItem.tag && <span className="ct-modal-tag">{menuModalItem.tag}</span>}
              <div className="ct-modal-title-row">
                <h3 className="ct-modal-title">{menuModalItem.name}</h3>
                <span className="ct-modal-price">{menuModalItem.price}</span>
              </div>
              <p className="ct-modal-desc">{menuModalItem.desc}</p>
              <div className="ct-modal-footer">
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ct-fg3)' }}>
                  {activeCategory}
                </span>
                <button
                  className="ct-cta-btn"
                  style={{ borderRadius: '2px' }}
                  onClick={() => { setMenuModalItem(null); smoothScroll('#ct-visit') }}
                >
                  Visit to Order <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Catering Package Modal ───────────────────────────────────────── */}
      {cateringModal && (
        <div className="ct-modal-overlay" onClick={() => setCateringModal(null)}>
          <div className="ct-modal-panel wide" onClick={e => e.stopPropagation()}>
            <button className="ct-modal-close" onClick={() => setCateringModal(null)} aria-label="Close">
              <X size={16} />
            </button>
            <div className="ct-modal-img-wrap">
              <img className="ct-modal-img" src={cateringModal.img} alt={cateringModal.name} />
            </div>
            <div className="ct-modal-body">
              {cateringModal.tag && <span className="ct-modal-tag">{cateringModal.tag}</span>}
              <div className="ct-modal-title-row">
                <h3 className="ct-modal-title">{cateringModal.name}</h3>
                <span className="ct-modal-price">{cateringModal.price}</span>
              </div>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ct-accent)', marginBottom: '1rem' }}>
                {cateringModal.guests}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ct-fg2)', marginBottom: '0.75rem', fontWeight: 500 }}>
                What's included:
              </p>
              <ul className="ct-catering-includes" style={{ marginBottom: '1.5rem' }}>
                {cateringModal.includes.map((inc, i) => (
                  <li key={i} style={{ fontSize: '0.9rem' }}>
                    <CupSoda size={15} />
                    {inc}
                  </li>
                ))}
              </ul>
              <div className="ct-modal-footer">
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ct-fg3)' }}>
                  Final pricing confirmed on inquiry
                </span>
                <button
                  className="ct-cta-btn"
                  style={{ borderRadius: '2px' }}
                  onClick={() => { setCateringModal(null); smoothScroll('#ct-visit') }}
                >
                  Inquire to Book <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* @arkzen:web:page:index:end */
