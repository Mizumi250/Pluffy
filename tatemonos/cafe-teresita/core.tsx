/* @arkzen:meta
name: cafe-teresita
version: 2.0.0
description: "Cafe Teresita (by Guada's) Tatemono — Concept landing page for the cafe in Calubo, Kinoguitan, Misamis Oriental. Warm cream/torn-paper aesthetic with latte-art hero photography, arched product cards, and a clean menu/catering grid inspired by specialty-coffee e-commerce. GSAP entrance + scroll reveals. In-page modal 'pages' for Menu and Catering. Frontend-only, single design system (no dark mode)."
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

import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Coffee, X, ArrowRight, Star, MapPin, Clock,
  Instagram, Facebook, Menu as MenuIcon, ArrowUpRight,
  CalendarCheck, Soup, CupSoda, ExternalLink
} from 'lucide-react'

// ─── REAL DATA — Cafe Teresita (by Guada's), Calubo, Kinoguitan, Misamis Oriental ──

const NAV_LINKS = [
  { label: 'Home', href: '#ct-hero' },
  { label: 'Menu', href: '#ct-menu' },
  { label: 'Catering', href: '#ct-catering' },
  { label: 'About', href: '#ct-about' },
  { label: 'Visit', href: '#ct-visit' },
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

// Featured drinks for the homepage "Featured Drink" arch-card row
const FEATURED_DRINKS = [
  {
    id: 'feat-1',
    name: 'House Blend',
    sub: 'Hot drip coffee',
    img: 'https://images.unsplash.com/photo-1572286258217-215cf8e667bd?w=600&q=80',
  },
  {
    id: 'feat-2',
    name: 'Iced Macchiato',
    sub: 'Caramel + espresso',
    img: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=600&q=80',
  },
  {
    id: 'feat-3',
    name: 'Buko Juice',
    sub: 'Fresh coconut',
    img: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80',
  },
]

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

const VISIT_HOURS = [
  { day: 'Monday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Tuesday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Wednesday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Thursday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Friday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Saturday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Sunday', hours: '10:00 AM – 10:00 PM' },
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

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0])
  const [scrolled, setScrolled] = useState(false)
  const [menuModalItem, setMenuModalItem] = useState<typeof MENU_ITEMS[string][number] | null>(null)
  const [cateringModal, setCateringModal] = useState<typeof CATERING_PACKAGES[number] | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // ── Lock scroll while a modal/menu is open ────────────────────────────────────
  useEffect(() => {
    const open = !!menuModalItem || !!cateringModal || menuOpen
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuModalItem, cateringModal, menuOpen])

  // ── Scroll ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const smoothScroll = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const activeItems = MENU_ITEMS[activeCategory] ?? []

  // ── GSAP Animations ──────────────────────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // ── Hero entrance ──────────────────────────────────────────────────────
      const heroTL = gsap.timeline({ delay: 0.15 })
      heroTL
        .fromTo('.ct-nav', { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
        .fromTo('.ct-hero-eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .fromTo('.ct-hero-line', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power4.out' }, '-=0.3')
        .fromTo('.ct-hero-badge', { scale: 0, rotation: -25 }, { scale: 1, rotation: -8, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.6')
        .fromTo('.ct-hero-cta', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .fromTo('.ct-hero-photo', { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, '-=1')

      // ── Hero parallax ──────────────────────────────────────────────────────
      gsap.to('.ct-hero-photo-img', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: '#ct-hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
      })

      // ── Marquee strip ─────────────────────────────────────────────────────
      gsap.to('.ct-marquee-track', { xPercent: -50, repeat: -1, duration: 24, ease: 'linear' })

      // ── Featured drinks (arch cards) ─────────────────────────────────────
      gsap.fromTo('.ct-feat-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-featured', start: 'top 80%' } }
      )
      gsap.fromTo('.ct-feat-label',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-featured', start: 'top 85%' } }
      )

      // ── About / story ─────────────────────────────────────────────────────
      gsap.fromTo('.ct-about-label',
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 80%' } }
      )
      gsap.fromTo('.ct-about-heading .ct-split',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power4.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 78%' } }
      )
      gsap.fromTo('.ct-about-body',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 72%' } }
      )
      gsap.fromTo('.ct-about-img',
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 70%' } }
      )

      // ── Quote ─────────────────────────────────────────────────────────────
      gsap.fromTo('.ct-quote-inner',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.ct-quote-strip', start: 'top 82%' } }
      )

      // ── Menu tabs + cards ─────────────────────────────────────────────────
      gsap.fromTo('.ct-menu-head',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-menu', start: 'top 80%' } }
      )
      gsap.fromTo('.ct-menu-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-menu', start: 'top 75%' } }
      )

      // ── Full-width image break ───────────────────────────────────────────
      gsap.to('.ct-fullwidth-img', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.ct-fullwidth-wrap', start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      // ── Catering cards ────────────────────────────────────────────────────
      gsap.fromTo('.ct-catering-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-catering', start: 'top 78%' } }
      )

      // ── Testimonials ──────────────────────────────────────────────────────
      gsap.fromTo('.ct-testi-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-testimonials', start: 'top 80%' } }
      )

      // ── Visit ─────────────────────────────────────────────────────────────
      gsap.fromTo('.ct-visit-left',
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-visit', start: 'top 78%' } }
      )
      gsap.fromTo('.ct-visit-right',
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-visit', start: 'top 78%' } }
      )

    }, pageRef)
    return () => ctx.revert()
  }, [])
  return (
    <div ref={pageRef} className="ct-page">

      {/* ── Global Styles ───────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --ct-cream: #f7ecd9;
          --ct-cream2: #fbf3e6;
          --ct-cream3: #efe0c8;
          --ct-ink: #2b1d12;
          --ct-ink2: #6e5a45;
          --ct-ink3: #a8927a;
          --ct-brown: #4a2e1c;
          --ct-brown2: #3a2314;
          --ct-rose: #e8c4a8;
          --ct-accent: #c4632e;
          --ct-accent2: #e0905a;
          --ct-cream-shadow: rgba(74,46,28,0.12);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        .ct-page {
          background: var(--ct-cream);
          color: var(--ct-ink);
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--ct-cream); }
        ::-webkit-scrollbar-thumb { background: var(--ct-accent); border-radius: 4px; }

        h1, h2, h3 { font-family: 'Fraunces', serif; }

        /* ── Nav ───────────────────────────────────────────────────────── */
        .ct-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem clamp(1.25rem, 5vw, 3.5rem);
          opacity: 0;
          transition: padding 0.4s ease, background 0.4s ease, box-shadow 0.4s ease;
        }
        .ct-nav.scrolled {
          padding: 0.65rem clamp(1.25rem, 5vw, 3.5rem);
          background: color-mix(in srgb, var(--ct-cream) 85%, transparent);
          backdrop-filter: blur(14px);
          box-shadow: 0 6px 24px -12px var(--ct-cream-shadow);
        }
        .ct-nav-logo {
          font-family: 'Fraunces', serif;
          font-size: 1.4rem; font-weight: 600; font-style: italic;
          color: var(--ct-brown); text-decoration: none;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .ct-nav-logo svg { color: var(--ct-accent); }
        .ct-nav-links {
          display: flex; align-items: center; gap: 2rem;
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          padding: 0.55rem 1.75rem; border-radius: 100px;
          box-shadow: 0 4px 18px -10px var(--ct-cream-shadow);
        }
        .ct-nav-link {
          font-size: 0.82rem; font-weight: 500; color: var(--ct-ink2);
          text-decoration: none; cursor: pointer; transition: color 0.25s ease;
          white-space: nowrap;
        }
        .ct-nav-link:hover { color: var(--ct-accent); }
        .ct-nav-actions { display: flex; align-items: center; gap: 0.75rem; }
        .ct-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.7rem 1.5rem; border-radius: 100px;
          background: var(--ct-brown); color: var(--ct-cream2);
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.01em;
          text-decoration: none; border: none; cursor: pointer;
          transition: all 0.3s ease;
        }
        .ct-btn:hover { background: var(--ct-accent); transform: translateY(-1px); box-shadow: 0 10px 24px -10px rgba(196,98,46,0.5); }
        .ct-btn-ghost {
          background: transparent; color: var(--ct-brown);
          border: 1.5px solid var(--ct-brown);
        }
        .ct-btn-ghost:hover { background: var(--ct-brown); color: var(--ct-cream2); box-shadow: 0 10px 24px -10px var(--ct-cream-shadow); }
        .ct-btn-sm { padding: 0.55rem 1.15rem; font-size: 0.74rem; }

        /* Hamburger */
        .ct-hamburger {
          display: none; align-items: center; justify-content: center;
          width: 42px; height: 42px; border-radius: 50%;
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          color: var(--ct-brown); cursor: pointer;
        }
        @media (max-width: 860px) {
          .ct-nav-links, .ct-nav-cta-desktop { display: none; }
          .ct-hamburger { display: flex; }
        }

        /* Mobile menu */
        .ct-mobile-menu {
          position: fixed; inset: 0; z-index: 600;
          background: var(--ct-cream2);
          display: flex; flex-direction: column;
          padding: 1.5rem clamp(1.25rem, 5vw, 3.5rem) 3rem;
          transform: translateY(-100%);
          transition: transform 0.5s cubic-bezier(0.77,0,0.175,1);
        }
        .ct-mobile-menu.open { transform: translateY(0); }
        .ct-mobile-menu-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 2.5rem; padding-top: 0.25rem;
        }
        .ct-mobile-nav-link {
          font-family: 'Fraunces', serif;
          font-size: clamp(2rem, 9vw, 3.2rem); font-weight: 500; font-style: italic;
          color: var(--ct-brown); text-decoration: none;
          padding: 0.6rem 0; border-bottom: 1px solid var(--ct-cream3);
          cursor: pointer;
        }

        /* ── Hero ──────────────────────────────────────────────────────── */
        #ct-hero {
          position: relative; padding: clamp(7rem, 16vh, 10rem) clamp(1.25rem, 5vw, 3.5rem) 0;
          overflow: hidden;
        }
        .ct-hero-inner {
          max-width: 1320px; margin: 0 auto;
          display: grid; grid-template-columns: 1.05fr 1fr;
          gap: clamp(2rem, 4vw, 4rem);
          align-items: center;
          padding-bottom: clamp(2.5rem, 6vh, 4rem);
        }
        @media (max-width: 900px) {
          .ct-hero-inner { grid-template-columns: 1fr; }
        }
        .ct-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em;
          color: var(--ct-accent); background: var(--ct-cream2);
          border: 1px solid var(--ct-cream3); border-radius: 100px;
          padding: 0.4rem 0.9rem; margin-bottom: 1.5rem; opacity: 0;
        }
        .ct-hero-line {
          display: block; overflow: hidden;
          font-size: clamp(2.6rem, 6.4vw, 5.2rem);
          font-weight: 500; line-height: 1.04; letter-spacing: -0.01em;
          color: var(--ct-brown2); opacity: 0;
        }
        .ct-hero-line em { font-style: italic; color: var(--ct-accent); font-weight: 400; }
        .ct-hero-sub {
          margin-top: 1.5rem; font-size: 1rem; color: var(--ct-ink2);
          line-height: 1.8; max-width: 460px;
        }
        .ct-hero-cta {
          display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; opacity: 0;
        }
        .ct-hero-photo {
          position: relative; aspect-ratio: 4/5; border-radius: 1.5rem;
          overflow: hidden; opacity: 0;
          box-shadow: 0 30px 70px -30px var(--ct-cream-shadow);
        }
        .ct-hero-photo-img {
          position: absolute; inset: -7%; width: 114%; height: 114%;
          object-fit: cover; will-change: transform;
        }
        .ct-hero-badge {
          position: absolute; top: 1.25rem; left: 1.25rem; z-index: 2;
          background: var(--ct-cream2); border-radius: 1rem;
          padding: 0.85rem 1.1rem; box-shadow: 0 16px 40px -16px var(--ct-cream-shadow);
          display: flex; flex-direction: column; gap: 0.1rem;
          opacity: 0; transform: rotate(-8deg);
        }
        .ct-hero-badge-stars { display: flex; gap: 1px; color: var(--ct-accent); }
        .ct-hero-badge-num { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 600; color: var(--ct-brown); }
        .ct-hero-badge-txt { font-size: 0.68rem; color: var(--ct-ink2); letter-spacing: 0.04em; }

        /* Torn paper divider */
        .ct-torn {
          position: relative; height: clamp(40px, 7vw, 90px);
          margin-top: -1px; pointer-events: none;
        }
        .ct-torn svg { display: block; width: 100%; height: 100%; }
        /* ── Marquee ───────────────────────────────────────────────────── */
        .ct-marquee-wrap {
          overflow: hidden; background: var(--ct-brown2);
          padding: 0.85rem 0;
        }
        .ct-marquee-track {
          display: flex; gap: 2.5rem; align-items: center;
          white-space: nowrap; width: max-content;
        }
        .ct-marquee-word {
          font-family: 'Fraunces', serif; font-style: italic;
          font-size: 1rem; color: var(--ct-rose); flex-shrink: 0;
        }
        .ct-marquee-word.dot { color: var(--ct-accent2); font-style: normal; }

        /* ── Section base ──────────────────────────────────────────────── */
        .ct-section { padding: clamp(4rem, 9vh, 6.5rem) clamp(1.25rem, 5vw, 3.5rem); }
        .ct-section-inner { max-width: 1320px; margin: 0 auto; }
        .ct-label {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em;
          color: var(--ct-accent); background: var(--ct-cream2);
          border: 1px solid var(--ct-cream3); border-radius: 100px;
          padding: 0.4rem 0.9rem; margin-bottom: 1.25rem;
        }
        .ct-heading {
          font-size: clamp(2rem, 4.4vw, 3.4rem);
          font-weight: 500; line-height: 1.15; letter-spacing: -0.01em;
          color: var(--ct-brown2);
        }
        .ct-heading .ct-split { display: inline-block; }
        .ct-heading em { font-style: italic; color: var(--ct-accent); font-weight: 400; }

        /* ── Featured drinks (arch cards) ─────────────────────────────── */
        #ct-featured { background: var(--ct-cream); }
        .ct-feat-top {
          display: flex; justify-content: space-between; align-items: flex-end;
          flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem;
        }
        .ct-feat-label { opacity: 0; }
        .ct-feat-sub { font-size: 0.95rem; color: var(--ct-ink2); max-width: 320px; line-height: 1.7; }
        .ct-feat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
        }
        @media (max-width: 760px) { .ct-feat-grid { grid-template-columns: 1fr; } }
        .ct-feat-card {
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          border-radius: 1.75rem 1.75rem 0.75rem 0.75rem;
          padding: 1.5rem; text-align: center; opacity: 0;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .ct-feat-card:hover { transform: translateY(-6px); box-shadow: 0 24px 50px -24px var(--ct-cream-shadow); }
        .ct-feat-img-wrap {
          aspect-ratio: 1/1.05; border-radius: 1.5rem 1.5rem 50% 50%;
          overflow: hidden; margin-bottom: 1.25rem;
        }
        .ct-feat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .ct-feat-card:hover .ct-feat-img { transform: scale(1.06); }
        .ct-feat-name { font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 500; color: var(--ct-brown2); margin-bottom: 0.25rem; }
        .ct-feat-sub2 { font-size: 0.82rem; color: var(--ct-ink3); }

        /* ── About ─────────────────────────────────────────────────────── */
        #ct-about { background: var(--ct-cream3); }
        .ct-about-label { opacity: 0; }
        .ct-about-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2.5rem, 6vw, 5rem);
          align-items: center; margin-top: 2.5rem;
        }
        @media (max-width: 860px) { .ct-about-grid { grid-template-columns: 1fr; } }
        .ct-about-img-wrap {
          position: relative; aspect-ratio: 4/5; border-radius: 1.75rem; overflow: hidden;
        }
        .ct-about-img { width: 100%; height: 100%; object-fit: cover; opacity: 0; }
        .ct-about-pin {
          position: absolute; bottom: 1.25rem; right: 1.25rem;
          background: var(--ct-brown); color: var(--ct-cream2);
          border-radius: 1rem; padding: 0.8rem 1.1rem;
          font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;
        }
        .ct-about-body { opacity: 0; display: flex; flex-direction: column; gap: 1.1rem; }
        .ct-about-body p { color: var(--ct-ink2); line-height: 1.85; font-size: 0.97rem; }
        .ct-about-list { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.5rem; }
        .ct-about-list-item {
          display: flex; align-items: flex-start; gap: 0.75rem;
          font-size: 0.9rem; color: var(--ct-ink2);
        }
        .ct-about-list-item-icon {
          flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          display: flex; align-items: center; justify-content: center;
          color: var(--ct-accent);
        }

        /* ── Quote strip ───────────────────────────────────────────────── */
        .ct-quote-strip {
          background: var(--ct-brown); padding: clamp(3rem, 7vh, 5.5rem) clamp(1.25rem, 5vw, 3.5rem);
          text-align: center;
        }
        .ct-quote-inner { max-width: 760px; margin: 0 auto; opacity: 0; }
        .ct-quote-text {
          font-family: 'Fraunces', serif; font-style: italic;
          font-size: clamp(1.3rem, 2.6vw, 2.1rem); line-height: 1.5;
          color: var(--ct-cream2);
        }
        .ct-quote-text::before, .ct-quote-text::after { content: '"'; color: var(--ct-accent2); }
        .ct-quote-attr {
          margin-top: 1.25rem; font-size: 0.75rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ct-accent2);
        }

        /* ── Menu ──────────────────────────────────────────────────────── */
        #ct-menu { background: var(--ct-cream); }
        .ct-menu-head {
          display: flex; justify-content: space-between; align-items: flex-end;
          flex-wrap: wrap; gap: 1.5rem; opacity: 0;
        }
        .ct-menu-sub { font-size: 0.95rem; color: var(--ct-ink2); max-width: 320px; line-height: 1.7; }
        .ct-menu-tabs {
          display: flex; gap: 0.6rem; margin: 2.25rem 0 2.25rem; flex-wrap: wrap;
        }
        .ct-menu-tab {
          font-size: 0.8rem; font-weight: 600; color: var(--ct-ink2);
          padding: 0.6rem 1.3rem; border-radius: 100px; cursor: pointer;
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          transition: all 0.25s ease;
        }
        .ct-menu-tab.active { background: var(--ct-brown); color: var(--ct-cream2); border-color: var(--ct-brown); }
        .ct-menu-tab:hover:not(.active) { border-color: var(--ct-accent); color: var(--ct-accent); }
        .ct-menu-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .ct-menu-card {
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          border-radius: 1.5rem; overflow: hidden; text-align: left;
          cursor: pointer; opacity: 0; transition: all 0.35s ease;
        }
        .ct-menu-card:hover { transform: translateY(-5px); box-shadow: 0 24px 50px -24px var(--ct-cream-shadow); border-color: var(--ct-accent); }
        .ct-menu-card-img-wrap { aspect-ratio: 4/3; overflow: hidden; }
        .ct-menu-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .ct-menu-card:hover .ct-menu-card-img { transform: scale(1.06); }
        .ct-menu-card-body { padding: 1.25rem; }
        .ct-menu-card-badge {
          display: inline-block; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--ct-accent);
          background: color-mix(in srgb, var(--ct-accent) 12%, transparent);
          border-radius: 100px; padding: 0.2rem 0.6rem; margin-bottom: 0.6rem;
        }
        .ct-menu-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem; }
        .ct-menu-card-name { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 500; color: var(--ct-brown2); }
        .ct-menu-card-price { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 600; color: var(--ct-accent); white-space: nowrap; }
        .ct-menu-card-desc { font-size: 0.83rem; color: var(--ct-ink2); line-height: 1.6; margin-bottom: 0.9rem; }
        .ct-menu-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--ct-ink3);
        }
        .ct-menu-card-footer svg { transition: transform 0.3s ease; }
        .ct-menu-card:hover .ct-menu-card-footer svg { transform: translate(3px, -3px); color: var(--ct-accent); }

        /* ── Full-width image break ───────────────────────────────────── */
        .ct-fullwidth-wrap {
          position: relative; height: clamp(280px, 42vh, 460px); overflow: hidden;
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
            color-mix(in srgb, var(--ct-cream) 78%, transparent) 0%,
            color-mix(in srgb, var(--ct-cream) 40%, transparent) 42%,
            transparent 100%
          );
        }
        .ct-fullwidth-content {
          position: absolute; top: 50%; left: clamp(1.25rem, 5vw, 3.5rem);
          transform: translateY(-50%); max-width: 460px;
        }

        /* ── Catering ──────────────────────────────────────────────────── */
        #ct-catering { background: var(--ct-cream3); }
        .ct-catering-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2.5rem;
        }
        @media (max-width: 900px) { .ct-catering-grid { grid-template-columns: 1fr; } }
        .ct-catering-card {
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column;
          opacity: 0; transition: all 0.35s ease;
        }
        .ct-catering-card:hover { transform: translateY(-5px); box-shadow: 0 24px 50px -24px var(--ct-cream-shadow); }
        .ct-catering-img-wrap { aspect-ratio: 16/10; overflow: hidden; position: relative; }
        .ct-catering-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .ct-catering-card:hover .ct-catering-img { transform: scale(1.06); }
        .ct-catering-tag {
          position: absolute; top: 1rem; left: 1rem;
          background: var(--ct-accent); color: var(--ct-cream2);
          font-size: 0.64rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          border-radius: 100px; padding: 0.25rem 0.7rem;
        }
        .ct-catering-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.65rem; flex: 1; }
        .ct-catering-name { font-family: 'Fraunces', serif; font-size: 1.25rem; font-weight: 500; color: var(--ct-brown2); }
        .ct-catering-guests { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ct-accent); }
        .ct-catering-price { font-size: 0.92rem; font-weight: 600; color: var(--ct-ink2); }
        .ct-catering-includes { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem; }
        .ct-catering-includes li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.83rem; color: var(--ct-ink2); }
        .ct-catering-includes li svg { color: var(--ct-accent); flex-shrink: 0; margin-top: 2px; }
        .ct-catering-footer { margin-top: auto; padding-top: 0.5rem; }

        /* ── Testimonials ──────────────────────────────────────────────── */
        #ct-testimonials { background: var(--ct-cream); }
        .ct-testi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-top: 2.5rem; }
        @media (max-width: 700px) { .ct-testi-grid { grid-template-columns: 1fr; } }
        .ct-testi-card {
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          border-radius: 1.5rem; padding: 2rem; opacity: 0;
          transition: all 0.35s ease;
        }
        .ct-testi-card:hover { transform: translateY(-4px); box-shadow: 0 24px 50px -24px var(--ct-cream-shadow); }
        .ct-testi-stars { display: flex; gap: 2px; color: var(--ct-accent); margin-bottom: 1rem; }
        .ct-testi-text {
          font-family: 'Fraunces', serif; font-style: italic; font-size: 1.02rem;
          color: var(--ct-brown2); line-height: 1.7; margin-bottom: 1.25rem;
        }
        .ct-testi-name { font-size: 0.85rem; font-weight: 600; color: var(--ct-brown2); }
        .ct-testi-role { font-size: 0.75rem; color: var(--ct-ink3); margin-top: 0.15rem; }

        /* ── Visit ─────────────────────────────────────────────────────── */
        #ct-visit { background: var(--ct-cream3); }
        .ct-visit-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2.5rem, 6vw, 5rem);
          align-items: start; margin-top: 2.5rem;
        }
        @media (max-width: 860px) { .ct-visit-grid { grid-template-columns: 1fr; } }
        .ct-visit-left { opacity: 0; }
        .ct-visit-right { opacity: 0; }
        .ct-visit-detail {
          display: flex; align-items: flex-start; gap: 0.85rem;
          margin-bottom: 1.1rem; font-size: 0.92rem; color: var(--ct-ink2);
        }
        .ct-visit-detail-icon {
          flex-shrink: 0; width: 38px; height: 38px; border-radius: 50%;
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          display: flex; align-items: center; justify-content: center; color: var(--ct-accent);
        }
        .ct-visit-detail-title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ct-accent); margin-bottom: 0.3rem; }
        .ct-visit-hours-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--ct-ink2); padding: 0.4rem 0; border-bottom: 1px solid var(--ct-cream3); }
        .ct-visit-hours-row:last-child { border-bottom: none; }
        .ct-map-wrap {
          position: relative; border-radius: 1.5rem; overflow: hidden;
          aspect-ratio: 4/5; border: 1px solid var(--ct-cream3);
        }
        .ct-map-wrap iframe { width: 100%; height: 100%; border: 0; }

        /* ── CTA ───────────────────────────────────────────────────────── */
        .ct-cta-section {
          position: relative; overflow: hidden; text-align: center;
          padding: clamp(5rem, 11vh, 8rem) clamp(1.25rem, 5vw, 3.5rem);
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
            color-mix(in srgb, var(--ct-brown2) 60%, transparent) 0%,
            color-mix(in srgb, var(--ct-brown2) 45%, transparent) 50%,
            color-mix(in srgb, var(--ct-brown2) 65%, transparent) 100%
          );
        }
        .ct-cta-content { position: relative; z-index: 2; }
        .ct-cta-heading {
          font-size: clamp(2.2rem, 5.2vw, 4rem); font-weight: 500; line-height: 1.15;
          color: var(--ct-cream2); margin-bottom: 1rem;
        }
        .ct-cta-heading em { font-style: italic; color: var(--ct-accent2); font-weight: 400; }
        .ct-cta-sub { font-size: 1rem; color: var(--ct-rose); margin-bottom: 2.25rem; }
        .ct-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        /* ── Footer ────────────────────────────────────────────────────── */
        .ct-footer { background: var(--ct-brown2); color: var(--ct-cream3); padding: clamp(3rem, 6vh, 4.5rem) clamp(1.25rem, 5vw, 3.5rem) 2rem; }
        .ct-footer-inner { max-width: 1320px; margin: 0 auto; }
        .ct-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2.5rem; }
        @media (max-width: 860px) { .ct-footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        @media (max-width: 520px) { .ct-footer-grid { grid-template-columns: 1fr; } }
        .ct-footer-logo {
          font-family: 'Fraunces', serif; font-size: 1.5rem; font-weight: 600; font-style: italic;
          color: var(--ct-cream2); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;
        }
        .ct-footer-logo svg { color: var(--ct-accent2); }
        .ct-footer-desc { font-size: 0.85rem; color: var(--ct-ink3); line-height: 1.8; max-width: 280px; }
        .ct-footer-social { display: flex; gap: 0.6rem; margin-top: 1.5rem; }
        .ct-footer-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(247,236,217,0.06); border: 1px solid rgba(247,236,217,0.12);
          color: var(--ct-cream3); transition: all 0.25s ease;
        }
        .ct-footer-icon-btn:hover { background: var(--ct-accent); color: var(--ct-cream2); border-color: var(--ct-accent); }
        .ct-footer-heading { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ct-accent2); margin-bottom: 1.1rem; }
        .ct-footer-link {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.85rem; color: var(--ct-ink3);
          text-decoration: none; margin-bottom: 0.55rem;
          background: none; border: none; cursor: pointer; transition: color 0.25s ease;
        }
        .ct-footer-link:hover { color: var(--ct-cream2); }
        .ct-footer-bottom {
          border-top: 1px solid rgba(247,236,217,0.12); margin-top: 2.5rem; padding-top: 1.5rem;
          display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.75rem; color: var(--ct-ink3);
        }
        .ct-footer-bottom-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
        .ct-footer-disclaimer {
          font-size: 0.72rem; line-height: 1.7; padding-top: 0.75rem;
          border-top: 1px solid rgba(247,236,217,0.08); font-style: italic;
        }

        /* ── Modal ─────────────────────────────────────────────────────── */
        .ct-modal-overlay {
          position: fixed; inset: 0; z-index: 800;
          background: rgba(43,29,18,0.55); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(1rem, 4vw, 3rem);
        }
        .ct-modal-panel {
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          border-radius: 1.75rem; max-width: 700px; width: 100%;
          max-height: 88vh; overflow-y: auto; position: relative;
          box-shadow: 0 40px 100px -30px rgba(43,29,18,0.5);
          animation: ctModalIn 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .ct-modal-panel.wide { max-width: 900px; }
        .ct-modal-close {
          position: absolute; top: 1rem; right: 1rem; z-index: 2;
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--ct-cream2); border: 1px solid var(--ct-cream3);
          color: var(--ct-brown); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.25s ease;
        }
        .ct-modal-close:hover { background: var(--ct-accent); color: var(--ct-cream2); border-color: var(--ct-accent); }
        .ct-modal-img-wrap { aspect-ratio: 16/9; overflow: hidden; }
        .ct-modal-img { width: 100%; height: 100%; object-fit: cover; }
        .ct-modal-body { padding: clamp(1.5rem, 4vw, 2.25rem); }
        .ct-modal-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.6rem; }
        .ct-modal-title { font-family: 'Fraunces', serif; font-size: clamp(1.4rem, 4vw, 2rem); font-weight: 500; color: var(--ct-brown2); line-height: 1.2; }
        .ct-modal-price { font-family: 'Fraunces', serif; font-size: 1.35rem; font-weight: 600; color: var(--ct-accent); white-space: nowrap; }
        .ct-modal-desc { font-size: 0.95rem; color: var(--ct-ink2); line-height: 1.8; margin-bottom: 1.5rem; }
        .ct-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        @keyframes ctModalIn { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes ctOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .ct-modal-overlay { animation: ctOverlayIn 0.3s ease; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className={`ct-nav${scrolled ? ' scrolled' : ''}`}>
        <a
          className="ct-nav-logo"
          href="#"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        >
          <Coffee size={20} />
          Cafe Teresita
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
          <a
            className="ct-btn ct-nav-cta-desktop"
            href="https://maps.app.goo.gl/?q=8.9670078,124.7954639"
            target="_blank"
            rel="noreferrer"
          >
            Get Directions <ArrowRight size={13} />
          </a>
          <button className="ct-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <MenuIcon size={18} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
      <div className={`ct-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="ct-mobile-menu-head">
          <div className="ct-nav-logo">
            <Coffee size={20} />
            Cafe Teresita
          </div>
          <button className="ct-hamburger" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        {NAV_LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            className="ct-mobile-nav-link"
            onClick={e => { e.preventDefault(); smoothScroll(link.href) }}
          >
            {link.label}
          </a>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <a
            className="ct-btn"
            href="https://maps.app.goo.gl/?q=8.9670078,124.7954639"
            target="_blank"
            rel="noreferrer"
          >
            Get Directions <ArrowRight size={13} />
          </a>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="ct-hero">
        <div className="ct-hero-inner">
          <div>
            <div className="ct-hero-eyebrow">
              <Coffee size={12} />
              Calubo, Kinoguitan — Misamis Oriental
            </div>
            <h1>
              <span className="ct-hero-line">Brewed warm,</span>
              <span className="ct-hero-line"><em>served</em> with</span>
              <span className="ct-hero-line">good company.</span>
            </h1>
            <p className="ct-hero-sub">
              Cafe Teresita by Guada's — the modest cafe along the highway in
              Calubo, serving coffee, home-style rice meals, and merienda
              favorites to the Kinoguitan community, every day from 10AM to 10PM.
            </p>
            <div className="ct-hero-cta">
              <button className="ct-btn" onClick={() => smoothScroll('#ct-menu')}>
                See Our Menu <ArrowRight size={13} />
              </button>
              <button className="ct-btn ct-btn-ghost" onClick={() => smoothScroll('#ct-about')}>
                Our Story
              </button>
            </div>
          </div>
          <div className="ct-hero-photo">
            <img
              className="ct-hero-photo-img"
              src="https://images.unsplash.com/photo-1497636577773-f1231844b336?w=1200&q=85"
              alt="Barista pouring latte art at Cafe Teresita"
            />
            <div className="ct-hero-badge">
              <div className="ct-hero-badge-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} fill="currentColor" stroke="none" />
                ))}
              </div>
              <span className="ct-hero-badge-num">4.5</span>
              <span className="ct-hero-badge-txt">Google Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Torn paper divider ─────────────────────────────────────────── */}
      <div className="ct-torn">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path
            d="M0,40 C40,10 90,55 150,30 C210,8 260,52 320,28 C380,6 430,50 490,26
               C550,5 600,48 660,24 C720,4 770,46 830,22 C890,3 940,44 1000,20
               C1060,2 1110,42 1200,18 L1200,60 L0,60 Z"
            fill="var(--ct-cream3)"
          />
        </svg>
      </div>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <div className="ct-marquee-wrap">
        <div className="ct-marquee-track">
          {Array.from({ length: 2 }).flatMap((_, rep) => (
            ['Coffee', '·', 'Rice Meals', '·', 'Catering', '·', 'Merienda', '·', 'Calubo', '·', 'Kinoguitan', '·', 'Open Daily', '·'].map((w, i) => (
              <span key={`${rep}-${i}`} className={`ct-marquee-word${w === '·' ? ' dot' : ''}`}>{w}</span>
            ))
          ))}
        </div>
      </div>

      {/* ── Featured Drinks ─────────────────────────────────────────────── */}
      <section id="ct-featured" className="ct-section">
        <div className="ct-section-inner">
          <div className="ct-feat-top">
            <div>
              <div className="ct-label ct-feat-label">Featured Drink</div>
              <h2 className="ct-heading">
                <span className="ct-split">Sip something </span>
                <em className="ct-split">special.</em>
              </h2>
            </div>
            <p className="ct-feat-sub">
              A few favorites our regulars keep coming back for — best enjoyed
              with a slice of quiet, right here in Calubo.
            </p>
          </div>
          <div className="ct-feat-grid">
            {FEATURED_DRINKS.map(d => (
              <div key={d.id} className="ct-feat-card">
                <div className="ct-feat-img-wrap">
                  <img className="ct-feat-img" src={d.img} alt={d.name} />
                </div>
                <div className="ct-feat-name">{d.name}</div>
                <div className="ct-feat-sub2">{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="ct-about" className="ct-section">
        <div className="ct-section-inner">
          <div className="ct-label ct-about-label">About Cafe Teresita</div>
          <h2 className="ct-heading ct-about-heading">
            <span className="ct-split">A modest cafe, </span>
            <span className="ct-split"><em>made with</em> </span>
            <span className="ct-split">heart.</span>
          </h2>
          <div className="ct-about-grid">
            <div className="ct-about-img-wrap">
              <img
                className="ct-about-img"
                src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=900&q=85"
                alt="Cafe Teresita interior"
              />
              <div className="ct-about-pin">
                <MapPin size={14} />
                Calubo, Kinoguitan
              </div>
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
                  <div className="ct-about-list-item-icon"><Clock size={15} /></div>
                  Open daily, 10:00 AM – 10:00 PM
                </div>
                <div className="ct-about-list-item">
                  <div className="ct-about-list-item-icon"><MapPin size={15} /></div>
                  Along the national highway, Calubo, Kinoguitan, Misamis Oriental
                </div>
                <div className="ct-about-list-item">
                  <div className="ct-about-list-item-icon"><CalendarCheck size={15} /></div>
                  Catering available for birthdays &amp; community events
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="ct-btn" onClick={() => smoothScroll('#ct-catering')}>
                  Catering Packages <ArrowRight size={13} />
                </button>
                <button className="ct-btn ct-btn-ghost" onClick={() => smoothScroll('#ct-visit')}>
                  Find Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote Strip ──────────────────────────────────────────────────── */}
      <div className="ct-quote-strip">
        <div className="ct-quote-inner">
          <p className="ct-quote-text">
            They got good taste with their menu — accessible right along the highway, and the only modest cafe here in Kinoguitan.
          </p>
          <p className="ct-quote-attr">— Verified Customer Review · Google Maps</p>
        </div>
      </div>

      {/* ── Menu ──────────────────────────────────────────────────────────── */}
      <section id="ct-menu" className="ct-section">
        <div className="ct-section-inner">
          <div className="ct-menu-head">
            <div>
              <div className="ct-label">What We Serve</div>
              <h2 className="ct-heading">
                <span className="ct-split">The </span>
                <em className="ct-split">menu.</em>
              </h2>
            </div>
            <p className="ct-menu-sub">
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
              <button key={item.id} className="ct-menu-card" onClick={() => setMenuModalItem(item)}>
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
            fontFamily: "'Fraunces', serif", fontStyle: 'italic',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.9rem)', lineHeight: 1.5, color: 'var(--ct-brown2)',
          }}>
            "A very relaxing place with great atmosphere — and the best coffee in
            Northern Mindanao."
          </p>
          <p style={{
            marginTop: '1rem', fontSize: '0.72rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--ct-accent)', fontWeight: 700,
          }}>
            — Restaurant Guru · 4.6 ★ Rating
          </p>
        </div>
      </div>

      {/* ── Catering ──────────────────────────────────────────────────────── */}
      <section id="ct-catering" className="ct-section">
        <div className="ct-section-inner">
          <div className="ct-label">Catering Services</div>
          <h2 className="ct-heading">
            <span className="ct-split">Bringing the </span>
            <em className="ct-split">cafe</em>
            <span className="ct-split"> to your celebration.</span>
          </h2>
          <p style={{ color: 'var(--ct-ink2)', fontSize: '0.95rem', maxWidth: 540, lineHeight: 1.8, marginTop: '1.1rem' }}>
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
                      <li key={i}><Soup size={14} />{inc}</li>
                    ))}
                  </ul>
                  <div className="ct-catering-footer">
                    <button
                      className="ct-btn ct-btn-ghost"
                      style={{ width: '100%', justifyContent: 'center' }}
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

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section id="ct-testimonials" className="ct-section">
        <div className="ct-section-inner">
          <div className="ct-label">Guest Reviews</div>
          <h2 className="ct-heading">
            <span className="ct-split">What people </span>
            <em className="ct-split">are saying.</em>
          </h2>
          <div className="ct-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="ct-testi-card">
                <div className="ct-testi-stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={13} fill="currentColor" stroke="none" />
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
      <section id="ct-visit" className="ct-section">
        <div className="ct-section-inner">
          <div className="ct-label">Visit Us</div>
          <h2 className="ct-heading">
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
                  {VISIT_HOURS.map(h => (
                    <div key={h.day} className="ct-visit-hours-row">
                      <span>{h.day}</span>
                      <span>{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  className="ct-btn"
                  href="https://maps.app.goo.gl/?q=8.9670078,124.7954639"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions <ExternalLink size={13} />
                </a>
                <button className="ct-btn ct-btn-ghost" onClick={() => smoothScroll('#ct-catering')}>
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
              className="ct-btn"
              href="https://maps.app.goo.gl/?q=8.9670078,124.7954639"
              target="_blank"
              rel="noreferrer"
            >
              Get Directions <ArrowRight size={13} />
            </a>
            <button className="ct-btn ct-btn-ghost" onClick={() => smoothScroll('#ct-menu')}>
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="ct-footer">
        <div className="ct-footer-inner">
          <div className="ct-footer-grid">
            <div>
              <div className="ct-footer-logo">
                <Coffee size={20} />
                Cafe Teresita
              </div>
              <p className="ct-footer-desc">
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
                    className="ct-footer-icon-btn"
                    target={s.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    <s.icon size={15} />
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
                <MapPin size={12} />
                Calubo, Kinoguitan, Mis. Or.
              </span>
              <span className="ct-footer-link" style={{ cursor: 'default' }}>
                <Clock size={12} />
                Open daily, 10AM–10PM
              </span>
              <div style={{ marginTop: '1.25rem' }}>
                <div className="ct-footer-heading">Catering</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--ct-ink3)', lineHeight: 1.75 }}>
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
              <span>Calubo · Kinoguitan · Misamis Oriental</span>
              <span>Concept demo</span>
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
              {menuModalItem.tag && <span className="ct-menu-card-badge">{menuModalItem.tag}</span>}
              <div className="ct-modal-title-row">
                <h3 className="ct-modal-title">{menuModalItem.name}</h3>
                <span className="ct-modal-price">{menuModalItem.price}</span>
              </div>
              <p className="ct-modal-desc">{menuModalItem.desc}</p>
              <div className="ct-modal-footer">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ct-ink3)' }}>
                  {activeCategory}
                </span>
                <button
                  className="ct-btn"
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
              {cateringModal.tag && <span className="ct-menu-card-badge">{cateringModal.tag}</span>}
              <div className="ct-modal-title-row">
                <h3 className="ct-modal-title">{cateringModal.name}</h3>
                <span className="ct-modal-price">{cateringModal.price}</span>
              </div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ct-accent)', marginBottom: '1rem' }}>
                {cateringModal.guests}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ct-ink2)', marginBottom: '0.75rem', fontWeight: 600 }}>
                What's included:
              </p>
              <ul className="ct-catering-includes" style={{ marginBottom: '1.5rem' }}>
                {cateringModal.includes.map((inc, i) => (
                  <li key={i} style={{ fontSize: '0.9rem' }}><CupSoda size={15} />{inc}</li>
                ))}
              </ul>
              <div className="ct-modal-footer">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ct-ink3)' }}>
                  Final pricing confirmed on inquiry
                </span>
                <button
                  className="ct-btn"
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
