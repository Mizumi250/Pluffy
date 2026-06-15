/* @arkzen:meta
name: cafe-teresita
version: 3.0.0
description: "Cafe Teresita (by Guada's) Tatemono — Concept landing page for the cafe in Calubo, Kinoguitan, Misamis Oriental. Full Couvee-mirrored design: dark hero overlay, cream sections, centered logo nav with Instagram + hamburger, scroll-scale hero, mouse-parallax floating images, per-column fadeInRight/Left, merchandise-style card stagger, tada CTA, marquee strip, full-height hero. Frontend-only, single design system (no dark mode)."
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

const NAV_LINKS = [
  { label: 'Homepage', href: '#ct-hero' },
  { label: 'Story', href: '#ct-about' },
  { label: 'Menu', href: '#ct-menu' },
  { label: 'Locations', href: '#ct-visit' },
  { label: 'Catering', href: '#ct-catering' },
  { label: 'Contact', href: '#ct-footer' },
]

const MENU_CATEGORIES = ['Coffee & Drinks', 'Rice Meals', 'Snacks & Pastries']

const MENU_ITEMS: Record<string, { id: string; name: string; desc: string; price: string; img: string; tag?: string }[]> = {
  'Coffee & Drinks': [
    {
      id: 'teresita-blend',
      name: 'Teresita House Blend',
      desc: 'Our signature drip brew — smooth, full-bodied, roasted locally for a warm Northern Mindanao morning.',
      price: '₱65',
      img: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=900&q=80',
      tag: 'Best Seller',
    },
    {
      id: 'iced-caramel-macchiato',
      name: 'Iced Caramel Macchiato',
      desc: 'Espresso, fresh milk, vanilla and caramel drizzle over ice — a sweet pick-me-up for warm afternoons.',
      price: '₱95',
      img: 'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg?w=900&q=80',
    },
    {
      id: 'spanish-latte',
      name: 'Spanish Latte',
      desc: 'Espresso balanced with condensed milk for a rich, sweet, creamy classic.',
      price: '₱85',
      img: 'https://images.pexels.com/photos/4065980/pexels-photo-4065980.jpeg?w=900&q=80',
    },
    {
      id: 'fresh-buko-juice',
      name: 'Fresh Buko Juice',
      desc: 'Cold coconut water served straight from the shell — the coastal refresher.',
      price: '₱60',
      img: 'https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?w=900&q=80',
    },
  ],
  'Rice Meals': [
    {
      id: 'fried-chicken-rice',
      name: 'Fried Chicken with Rice',
      desc: 'Crispy fried chicken (2 pcs) with steamed rice and house gravy — a Teresita favorite.',
      price: '₱120',
      img: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?w=900&q=80',
      tag: 'Crowd Favorite',
    },
    {
      id: 'pork-sisig',
      name: 'Sizzling Pork Sisig',
      desc: 'Chopped pork, peppers and onions sizzled on a hot plate with calamansi and rice.',
      price: '₱135',
      img: 'https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg?w=900&q=80',
    },
    {
      id: 'beef-caldereta',
      name: 'Beef Caldereta',
      desc: 'Slow-cooked beef in tomato sauce with potatoes, carrots and bell pepper, served with rice.',
      price: '₱145',
      img: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?w=900&q=80',
    },
    {
      id: 'grilled-fish',
      name: 'Grilled Bangus Belly',
      desc: 'Marinated milkfish belly grilled to order, with rice and dip on the side.',
      price: '₱130',
      img: 'https://images.pexels.com/photos/8969237/pexels-photo-8969237.jpeg?w=900&q=80',
    },
  ],
  'Snacks & Pastries': [
    {
      id: 'banana-cue',
      name: 'Banana-Q',
      desc: 'Caramelized saba banana on a stick — a local merienda staple, sweet and sticky.',
      price: '₱30',
      img: 'https://images.pexels.com/photos/1166648/pexels-photo-1166648.jpeg?w=900&q=80',
    },
    {
      id: 'cheese-bread',
      name: 'Cheese Bread Roll',
      desc: 'Soft, freshly-baked bread roll topped with melted cheese.',
      price: '₱35',
      img: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?w=900&q=80',
    },
    {
      id: 'leche-flan',
      name: 'Leche Flan',
      desc: 'Silky steamed custard with caramel syrup — the classic Filipino dessert.',
      price: '₱45',
      img: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?w=900&q=80',
      tag: 'Sweet Pick',
    },
    {
      id: 'ensaymada',
      name: 'Ensaymada',
      desc: 'Buttery brioche roll topped with sugar and grated cheese.',
      price: '₱40',
      img: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?w=900&q=80',
    },
  ],
}

const FEATURED_DRINKS = [
  {
    id: 'feat-1',
    name: 'House Blend',
    sub: 'Hot drip coffee',
    img: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?w=600&q=80',
  },
  {
    id: 'feat-2',
    name: 'Iced Macchiato',
    sub: 'Caramel + espresso',
    img: 'https://images.pexels.com/photos/5305639/pexels-photo-5305639.jpeg?w=600&q=80',
  },
  {
    id: 'feat-3',
    name: 'Buko Juice',
    sub: 'Fresh coconut',
    img: 'https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?w=600&q=80',
  },
]

const CATERING_PACKAGES = [
  {
    id: 'small-gathering',
    name: 'Small Gathering Package',
    guests: 'Good for 10–20 guests',
    price: 'Starts at ₱2,500',
    includes: ['Choice of 2 rice meal mains', 'Steamed rice', 'Iced tea or buko juice', 'Disposable wares'],
    img: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?w=1200&q=80',
  },
  {
    id: 'birthday-package',
    name: 'Birthday & Family Celebration',
    guests: 'Good for 20–40 guests',
    price: 'Starts at ₱5,000',
    includes: ['Choice of 3 mains', 'Pancit & dessert', 'Steamed rice', 'Drinks station', 'Basic table setup'],
    img: 'https://images.pexels.com/photos/6666644/pexels-photo-6666644.jpeg?w=1200&q=80',
    tag: 'Most Booked',
  },
  {
    id: 'event-package',
    name: 'Community Event Package',
    guests: 'Good for 50+ guests',
    price: 'Custom quote',
    includes: ['Full buffet menu', 'On-site coffee station', 'Staff service', 'Tent & seating add-ons available'],
    img: 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg?w=1200&q=80',
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

  useEffect(() => {
    const open = !!menuModalItem || !!cateringModal || menuOpen
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuModalItem, cateringModal, menuOpen])

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

  // Re-animate menu cards whenever the active tab changes
  useEffect(() => {
    const cards = document.querySelectorAll('.ct-menu-card')
    if (!cards.length) return
    gsap.fromTo(cards,
      { y: 55, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' }
    )
  }, [activeCategory])

  // ── GSAP — exact Couvee motion_fx mappings ────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // ── HERO ──────────────────────────────────────────────────────────────
      // Couvee: motion_fx_scale in-out speed:3 range:20%-80% on hero section
      gsap.to('#ct-hero', {
        scale: 1.04,
        ease: 'none',
        scrollTrigger: { trigger: '#ct-hero', start: '20% top', end: '80% top', scrub: 3 },
      })

      // Couvee: header slides in from top
      gsap.fromTo('.ct-nav',
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 }
      )

      // Couvee: couvee-text logo image → fadeInDown delay:700ms
      gsap.fromTo('.ct-hero-title',
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.7 }
      )

      // Couvee: right-hand image → fadeInUp (no delay), mouse track positive speed:0.5
      gsap.fromTo('.ct-hero-right-img',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.15 }
      )

      // Couvee: left-hand image → fadeInUp delay:200ms, mouse track NEGATIVE speed:0.5
      gsap.fromTo('.ct-hero-left-img',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.35 }
      )

      // Mouse parallax — positive track on right image, negative on left (Couvee exact)
      const handleMouseMove = (e: MouseEvent) => {
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const dx = (e.clientX - cx) / cx
        const dy = (e.clientY - cy) / cy
        gsap.to('.ct-hero-right-img', { x: dx * 12, y: dy * 8, duration: 1.2, ease: 'power2.out', overwrite: 'auto' })
        gsap.to('.ct-hero-left-img',  { x: dx * -12, y: dy * -8, duration: 1.4, ease: 'power2.out', overwrite: 'auto' })
      }
      window.addEventListener('mousemove', handleMouseMove)

      // Hero bg parallax translateY scrub (Couvee: motion_fx_translateY speed:3)
      gsap.to('.ct-hero-bg-img', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: '#ct-hero', start: 'top top', end: 'bottom top', scrub: 3 },
      })

      // ── MARQUEE ───────────────────────────────────────────────────────────
      gsap.to('.ct-marquee-track', { xPercent: -50, repeat: -1, duration: 22, ease: 'linear' })

      // ── STORY/ABOUT — Couvee: col-text fadeInRight delay:300 + col-img fadeInLeft ──
      // decoration translateY speed:2 scrub
      gsap.to('.ct-about-deco', {
        yPercent: -25,
        ease: 'none',
        scrollTrigger: { trigger: '#ct-about', start: 'top bottom', end: 'bottom top', scrub: 2 },
      })
      gsap.fromTo('.ct-about-text-col',
        { x: 70, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.3,
          scrollTrigger: { trigger: '#ct-about', start: 'top 80%' } }
      )
      gsap.fromTo('.ct-about-img-col',
        { x: -70, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 80%' } }
      )
      gsap.fromTo('.ct-about-img',
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-about', start: 'top 72%' } }
      )

      // ── PRODUCTS/FEATURED — Couvee: fadeInUp whole section, then card stagger ──
      gsap.fromTo('#ct-featured',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-featured', start: 'top 86%' } }
      )
      gsap.fromTo('.ct-feat-card',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.13, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-featured', start: 'top 80%' } }
      )
      // Couvee: decoration translateY speed:2 scrub on products section
      gsap.to('.ct-feat-deco', {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: { trigger: '#ct-featured', start: 'top bottom', end: 'bottom top', scrub: 2 },
      })

      // ── QUOTE STRIP — Couvee: dark section fadeInUp content ──────────────
      gsap.fromTo('.ct-quote-inner',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.ct-quote-strip', start: 'top 82%' } }
      )

      // ── MENU ──────────────────────────────────────────────────────────────
      gsap.fromTo('.ct-menu-head',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-menu', start: 'top 82%' } }
      )
      // ── FULLWIDTH BREAK — parallax scrub ──────────────────────────────────
      gsap.to('.ct-fullwidth-img', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: '.ct-fullwidth-wrap', start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      // ── CATERING/MERCHANDISE — Couvee col1 fadeInUp, col2 fadeInDown delay:100, col3 fadeInUp delay:200 ──
      const cateringCards = gsap.utils.toArray('.ct-catering-card') as Element[]
      cateringCards.forEach((card, i) => {
        gsap.fromTo(card,
          { y: i === 1 ? -60 : 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, delay: i === 1 ? 0.1 : i === 2 ? 0.2 : 0, ease: 'power3.out',
            scrollTrigger: { trigger: '#ct-catering', start: 'top 80%' } }
        )
      })

      // ── TESTIMONIALS ──────────────────────────────────────────────────────
      gsap.fromTo('.ct-testi-card',
        { y: 45, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-testimonials', start: 'top 82%' } }
      )

      // ── VISIT — Couvee: col-text fadeInRight delay:300, col-img/map fadeInLeft ──
      gsap.fromTo('.ct-visit-left',
        { x: 70, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.3,
          scrollTrigger: { trigger: '#ct-visit', start: 'top 80%' } }
      )
      gsap.fromTo('.ct-visit-right',
        { x: -70, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#ct-visit', start: 'top 80%' } }
      )

      // ── CTA btn: Couvee tada on ORDER NOW equivalent ──────────────────────
      ScrollTrigger.create({
        trigger: '.ct-cta-section',
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo('.ct-cta-tada', { scale: 1 }, {
            keyframes: [
              { scale: 1.1, rotation: -3, duration: 0.1 },
              { scale: 1.1, rotation: 3, duration: 0.1 },
              { scale: 1.1, rotation: -3, duration: 0.1 },
              { scale: 1.1, rotation: 3, duration: 0.1 },
              { scale: 1.1, rotation: -3, duration: 0.1 },
              { scale: 1, rotation: 0, duration: 0.15 },
            ],
            ease: 'none', repeat: -1, repeatDelay: 2.5,
          })
        },
      })

      gsap.fromTo('.ct-cta-content',
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.ct-cta-section', start: 'top 80%' } }
      )
      gsap.to('.ct-cta-bg',{
        yPercent: 16,
        ease: 'none',
        scrollTrigger: { trigger: '.ct-cta-section', start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      // ── INSTAGRAM / FOOTER SECTION ────────────────────────────────────────
      gsap.fromTo('.ct-insta-heading',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.ct-insta-section', start: 'top 82%' } }
      )
      gsap.fromTo('.ct-insta-grid-item',
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.ct-insta-section', start: 'top 78%' } }
      )

      return () => { window.removeEventListener('mousemove', handleMouseMove) }

    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef} className="ct-page">
      <style>{String.raw`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Raleway:wght@300;400;500;600;700&display=swap');

        /* ── Couvee exact colors ────────────────────────────────────────── */
        :root {
          --cv-white:   #ffffff;
          --cv-cream:   #f9f3ea;
          --cv-cream2:  #f2e8d8;
          --cv-cream3:  #e8d8c0;
          --cv-dark:    #1a1008;
          --cv-dark2:   #2c1a0a;
          --cv-brown:   #5c3317;
          --cv-brown2:  #7a4825;
          --cv-tan:     #c8a882;
          --cv-gold:    #b8893a;
          --cv-ink:     #2c1a0a;
          --cv-ink2:    #6b4c2a;
          --cv-ink3:    #9e7a52;
          --cv-shadow:  rgba(28,14,4,0.18);
          --cv-shadow2: rgba(28,14,4,0.32);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        .ct-page {
          font-family: 'Raleway', system-ui, sans-serif;
          background: var(--cv-white);
          color: var(--cv-ink);
          overflow-x: hidden;
        }

        h1, h2, h3, h4 {
          font-family: 'Playfair Display', Georgia, serif;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--cv-cream); }
        ::-webkit-scrollbar-thumb { background: var(--cv-gold); border-radius: 3px; }

        /* ──────────────────────────────────────────────────────────────── */
        /* NAV — Couvee exact: dark top bar, Instagram icon LEFT,          */
        /* logo CENTER (text + image stacked), hamburger RIGHT             */
        /* ──────────────────────────────────────────────────────────────── */
        .ct-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 900;
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 clamp(1.25rem, 4vw, 2.5rem);
          height: 70px;
          background: var(--cv-dark);
          opacity: 0;
          transition: background 0.4s ease, box-shadow 0.4s ease;
        }
        .ct-nav.scrolled {
          background: rgba(26,16,8,0.92);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 30px -8px var(--cv-shadow2);
        }
        .ct-nav-left {
          display: flex; align-items: center; gap: 1.5rem;
        }
        .ct-nav-social {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .ct-nav-social:hover { border-color: var(--cv-gold); color: var(--cv-gold); }
        .ct-nav-logo {
          display: flex; flex-direction: column; align-items: center;
          text-decoration: none; gap: 0.05rem;
          cursor: pointer;
        }
        .ct-nav-logo-img {
          width: 36px; height: 36px; object-fit: contain; opacity: 0.92;
          /* Couvee uses a logo image top + text beneath */
        }
        .ct-nav-logo-icon {
          color: var(--cv-gold); display: flex; align-items: center;
        }
        .ct-nav-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; font-weight: 600; font-style: italic;
          color: var(--cv-white); letter-spacing: 0.02em; line-height: 1;
        }
        .ct-nav-logo-sub {
          font-family: 'Raleway', sans-serif;
          font-size: 0.58rem; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--cv-tan); line-height: 1;
        }
        .ct-nav-right {
          display: flex; align-items: center; justify-content: flex-end;
        }
        .ct-hamburger {
          display: flex; align-items: center; justify-content: center;
          width: 42px; height: 42px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.85); cursor: pointer;
          background: transparent;
          transition: all 0.25s ease;
        }
        .ct-hamburger:hover { border-color: var(--cv-gold); color: var(--cv-gold); }

        /* ──────────────────────────────────────────────────────────────── */
        /* OVERLAY MENU — Couvee: full-screen slides down from top         */
        /* ──────────────────────────────────────────────────────────────── */
        .ct-overlay-menu {
          position: fixed; inset: 0; z-index: 950;
          background: var(--cv-dark);
          display: flex; flex-direction: column;
          padding: 0 clamp(1.5rem, 6vw, 4rem) 3rem;
          transform: translateY(-100%);
          transition: transform 0.55s cubic-bezier(0.77, 0, 0.175, 1);
        }
        .ct-overlay-menu.open { transform: translateY(0); }
        .ct-overlay-head {
          display: flex; align-items: center; justify-content: space-between;
          height: 70px; flex-shrink: 0;
        }
        .ct-overlay-close {
          font-family: 'Raleway', sans-serif;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.6);
          background: none; border: none; cursor: pointer;
          transition: color 0.25s ease;
        }
        .ct-overlay-close:hover { color: var(--cv-gold); }
        .ct-overlay-nav {
          display: flex; flex-direction: column; justify-content: center; flex: 1;
          gap: 0.25rem;
        }
        .ct-overlay-link {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 7vw, 3.5rem); font-weight: 500; font-style: italic;
          color: rgba(255,255,255,0.85); text-decoration: none;
          padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; transition: color 0.25s ease;
        }
        .ct-overlay-link:hover { color: var(--cv-gold); }

        /* ──────────────────────────────────────────────────────────────── */
        /* HERO — Couvee: full-height, dark bg overlay, centered content,  */
        /* two floating images left+right, scroll-scale                    */
        /* ──────────────────────────────────────────────────────────────── */
        #ct-hero {
          position: relative; width: 100%; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          transform-origin: center top; will-change: transform;
        }
        .ct-hero-bg {
          position: absolute; inset: -8%;
          width: 116%; height: 116%;
          will-change: transform;
        }
        .ct-hero-bg-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.38);
          will-change: transform;
        }
        /* dark gradient overlay like Couvee's .page-title-overlay */
        .ct-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            180deg,
            rgba(26,16,8,0.55) 0%,
            rgba(26,16,8,0.25) 40%,
            rgba(26,16,8,0.6) 100%
          );
        }
        .ct-hero-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 0 clamp(1.25rem, 5vw, 3rem);
          padding-top: 70px;
        }
        /* Couvee: logo/title image drops in from top (fadeInDown delay:700ms) */
        .ct-hero-title {
          opacity: 0;
          margin-bottom: 1.5rem;
        }
        .ct-hero-title-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 9vw, 7rem); font-weight: 700; font-style: italic;
          color: var(--cv-white); line-height: 1; letter-spacing: -0.01em;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        .ct-hero-title-sub {
          font-family: 'Raleway', sans-serif;
          font-size: clamp(0.7rem, 1.5vw, 0.9rem); font-weight: 600;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--cv-tan); margin-top: 0.5rem;
        }
        /* Couvee: right-hand float — bottom-right, mouseTrack positive */
        .ct-hero-right-img {
          position: absolute; bottom: clamp(3rem, 8vh, 6rem); right: clamp(1.5rem, 6vw, 5rem);
          width: clamp(120px, 18vw, 220px);
          opacity: 0; will-change: transform;
        }
        .ct-hero-right-img img {
          width: 100%; aspect-ratio: 2/3; object-fit: cover;
          border-radius: 0.75rem;
          box-shadow: 0 20px 60px -16px rgba(0,0,0,0.6);
        }
        /* Couvee: left-hand float — bottom-left, mouseTrack negative */
        .ct-hero-left-img {
          position: absolute; bottom: clamp(3rem, 8vh, 6rem); left: clamp(1.5rem, 6vw, 5rem);
          width: clamp(100px, 14vw, 180px);
          opacity: 0; will-change: transform;
        }
        .ct-hero-left-img img {
          width: 100%; aspect-ratio: 2/3; object-fit: cover;
          border-radius: 0.75rem;
          box-shadow: 0 20px 60px -16px rgba(0,0,0,0.6);
        }
        .ct-hero-cta {
          display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
          margin-top: 2.5rem;
        }
        .ct-hero-rating {
          margin-top: 2rem;
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.82rem; color: rgba(255,255,255,0.65);
          letter-spacing: 0.04em;
        }
        .ct-hero-rating-stars { display: flex; gap: 2px; color: var(--cv-gold); }
        @media (max-width: 700px) {
          .ct-hero-right-img, .ct-hero-left-img { display: none; }
        }

        /* ──────────────────────────────────────────────────────────────── */
        /* BUTTONS                                                          */
        /* ──────────────────────────────────────────────────────────────── */
        .ct-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.75rem; border-radius: 100px;
          background: var(--cv-gold); color: var(--cv-dark);
          font-family: 'Raleway', sans-serif;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none;
          border: none; cursor: pointer;
          transition: all 0.3s ease;
        }
        .ct-btn:hover { background: var(--cv-white); transform: translateY(-2px); box-shadow: 0 12px 28px -8px rgba(0,0,0,0.4); }
        .ct-btn-outline {
          background: transparent; color: var(--cv-white);
          border: 1.5px solid rgba(255,255,255,0.5);
        }
        .ct-btn-outline:hover { background: var(--cv-white); color: var(--cv-dark); border-color: var(--cv-white); }
        .ct-btn-dark {
          background: var(--cv-dark); color: var(--cv-white);
        }
        .ct-btn-dark:hover { background: var(--cv-brown); color: var(--cv-white); }
        .ct-btn-sm { padding: 0.55rem 1.25rem; font-size: 0.74rem; }

        /* ──────────────────────────────────────────────────────────────── */
        /* MARQUEE — Couvee: dark brown strip with italic serif words       */
        /* ──────────────────────────────────────────────────────────────── */
        .ct-marquee-wrap {
          overflow: hidden; background: var(--cv-brown);
          padding: 0.9rem 0;
        }
        .ct-marquee-track {
          display: flex; gap: 3rem; align-items: center;
          white-space: nowrap; width: max-content;
        }
        .ct-marquee-word {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 1rem; color: var(--cv-cream); flex-shrink: 0;
        }
        .ct-marquee-dot { color: var(--cv-gold); font-style: normal; font-family: 'Raleway', sans-serif; }

        /* ──────────────────────────────────────────────────────────────── */
        /* STORY / ABOUT — Couvee: cream bg, decoration top,               */
        /* text col right (fadeInRight delay:300), img col left (fadeInLeft)*/
        /* ──────────────────────────────────────────────────────────────── */
        #ct-about {
          background: var(--cv-cream);
          padding: clamp(4rem, 10vh, 7rem) clamp(1.25rem, 5vw, 3.5rem);
          position: relative; overflow: hidden;
        }
        .ct-about-deco {
          position: absolute; top: 0; left: 0; right: 0; height: 60px;
          background: var(--cv-white);
          clip-path: polygon(0 0, 100% 0, 100% 40%, 0 100%);
          pointer-events: none; will-change: transform;
        }
        .ct-about-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(2.5rem, 6vw, 5rem); align-items: center;
        }
        @media (max-width: 860px) {
          .ct-about-inner { grid-template-columns: 1fr; }
          .ct-about-text-col { order: 2; }
          .ct-about-img-col  { order: 1; }
        }
        .ct-about-img-col { position: relative; opacity: 0; }
        .ct-about-img-wrap {
          position: relative; aspect-ratio: 2/3; border-radius: 0.5rem; overflow: hidden;
          box-shadow: 0 30px 80px -24px var(--cv-shadow2);
        }
        .ct-about-img {
          width: 100%; height: 100%; object-fit: cover; opacity: 0;
        }
        .ct-about-deco-small {
          position: absolute; bottom: -1.5rem; right: -1.5rem;
          width: 120px; height: 120px; border-radius: 50%;
          overflow: hidden; border: 4px solid var(--cv-white);
          box-shadow: 0 8px 24px -8px var(--cv-shadow);
        }
        .ct-about-deco-small img { width: 100%; height: 100%; object-fit: cover; }
        .ct-about-text-col { opacity: 0; }
        .ct-about-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--cv-gold);
          margin-bottom: 1rem; display: block;
        }
        .ct-about-heading {
          font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 600; line-height: 1.2;
          color: var(--cv-dark); margin-bottom: 1.5rem;
        }
        .ct-about-heading em { font-style: italic; color: var(--cv-brown2); }
        .ct-about-body {
          font-size: 0.95rem; color: var(--cv-ink2); line-height: 1.9;
          margin-bottom: 2rem;
        }

        /* ──────────────────────────────────────────────────────────────── */
        /* PRODUCTS / FEATURED — Couvee: white bg, arch cards 3-col        */
        /* ──────────────────────────────────────────────────────────────── */
        #ct-featured {
          background: var(--cv-white); opacity: 0;
          padding: clamp(4rem, 9vh, 6.5rem) clamp(1.25rem, 5vw, 3.5rem);
          position: relative; overflow: hidden;
        }
        .ct-feat-deco {
          position: absolute; top: 0; left: 0; right: 0;
          height: clamp(40px, 5vw, 70px); pointer-events: none; will-change: transform;
        }
        .ct-feat-inner { max-width: 1200px; margin: 0 auto; }
        .ct-feat-head {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 1.5rem; flex-wrap: wrap; margin-bottom: clamp(2rem, 5vh, 3.5rem);
        }
        .ct-feat-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--cv-gold); margin-bottom: 0.75rem; display: block;
        }
        .ct-feat-title {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 600;
          color: var(--cv-dark); line-height: 1.2;
        }
        .ct-feat-title em { font-style: italic; color: var(--cv-brown2); }
        .ct-feat-sub {
          font-size: 0.9rem; color: var(--cv-ink3); max-width: 300px; line-height: 1.75;
        }
        .ct-feat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
        }
        @media (max-width: 760px) { .ct-feat-grid { grid-template-columns: 1fr; } }
        /* Couvee: arch top cards — border-radius top rounded like arches */
        .ct-feat-card {
          background: var(--cv-cream); opacity: 0;
          border-radius: 50% 50% 0.5rem 0.5rem / 2rem 2rem 0.5rem 0.5rem;
          overflow: hidden; text-align: center;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          border: 1px solid var(--cv-cream3);
        }
        .ct-feat-card:hover { transform: translateY(-8px); box-shadow: 0 24px 50px -20px var(--cv-shadow); }
        .ct-feat-img-wrap {
          aspect-ratio: 1/1.1; overflow: hidden;
          border-radius: 50% 50% 0 0 / 2rem 2rem 0 0;
        }
        .ct-feat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .ct-feat-card:hover .ct-feat-img { transform: scale(1.07); }
        .ct-feat-body { padding: 1.25rem 1rem 1.5rem; }
        .ct-feat-name {
          font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 600;
          color: var(--cv-dark); margin-bottom: 0.3rem;
        }
        .ct-feat-sub2 { font-size: 0.8rem; color: var(--cv-ink3); }

        /* ──────────────────────────────────────────────────────────────── */
        /* QUOTE STRIP — Couvee: dark brown bg, large italic serif quote    */
        /* ──────────────────────────────────────────────────────────────── */
        .ct-quote-strip {
          background: var(--cv-dark);
          padding: clamp(3.5rem, 8vh, 6rem) clamp(1.25rem, 5vw, 3.5rem);
          text-align: center;
        }
        .ct-quote-inner { max-width: 820px; margin: 0 auto; opacity: 0; }
        .ct-quote-text {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: clamp(1.3rem, 2.8vw, 2.2rem); line-height: 1.55;
          color: var(--cv-white);
        }
        .ct-quote-text::before { content: '\201C'; color: var(--cv-gold); margin-right: 0.15em; }
        .ct-quote-text::after  { content: '\201D'; color: var(--cv-gold); margin-left: 0.15em; }
        .ct-quote-attr {
          margin-top: 1.5rem; font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase; color: var(--cv-tan);
        }

        /* ──────────────────────────────────────────────────────────────── */
        /* MENU ─────────────────────────────────────────────────────────── */
        /* ──────────────────────────────────────────────────────────────── */
        #ct-menu {
          background: var(--cv-cream);
          padding: clamp(4rem, 9vh, 6.5rem) clamp(1.25rem, 5vw, 3.5rem);
        }
        .ct-menu-inner { max-width: 1200px; margin: 0 auto; }
        .ct-menu-head { opacity: 0; margin-bottom: 2rem; }
        .ct-menu-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--cv-gold); margin-bottom: 0.75rem; display: block;
        }
        .ct-menu-title {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 600;
          color: var(--cv-dark); line-height: 1.2; margin-bottom: 0.5rem;
        }
        .ct-menu-sub { font-size: 0.9rem; color: var(--cv-ink3); max-width: 360px; line-height: 1.75; }
        .ct-menu-tabs {
          display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2.25rem;
        }
        .ct-menu-tab {
          font-family: 'Raleway', sans-serif;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 0.55rem 1.4rem; border-radius: 100px;
          cursor: pointer; border: 1.5px solid var(--cv-cream3);
          background: var(--cv-white); color: var(--cv-ink2);
          transition: all 0.25s ease;
        }
        .ct-menu-tab.active { background: var(--cv-dark); color: var(--cv-white); border-color: var(--cv-dark); }
        .ct-menu-tab:hover:not(.active) { border-color: var(--cv-gold); color: var(--cv-gold); }
        .ct-menu-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem;
        }
        .ct-menu-card {
          background: var(--cv-white); border: 1px solid var(--cv-cream3);
          border-radius: 0.5rem; overflow: hidden; cursor: pointer; opacity: 0;
          transition: all 0.35s ease;
        }
        .ct-menu-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px -20px var(--cv-shadow); border-color: var(--cv-gold); }
        .ct-menu-card-img-wrap { aspect-ratio: 4/3; overflow: hidden; }
        .ct-menu-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .ct-menu-card:hover .ct-menu-card-img { transform: scale(1.06); }
        .ct-menu-card-body { padding: 1.1rem; }
        .ct-menu-card-badge {
          display: inline-block; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--cv-gold);
          background: rgba(184,137,58,0.12); border-radius: 100px;
          padding: 0.2rem 0.6rem; margin-bottom: 0.5rem;
        }
        .ct-menu-card-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem; }
        .ct-menu-card-name { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 600; color: var(--cv-dark); line-height: 1.3; }
        .ct-menu-card-price { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 600; color: var(--cv-gold); white-space: nowrap; }
        .ct-menu-card-desc { font-size: 0.8rem; color: var(--cv-ink2); line-height: 1.6; }
        .ct-menu-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 0.85rem; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; color: var(--cv-ink3);
        }
        .ct-menu-card-footer svg { transition: transform 0.3s ease; }
        .ct-menu-card:hover .ct-menu-card-footer svg { transform: translate(3px,-3px); color: var(--cv-gold); }

        /* ──────────────────────────────────────────────────────────────── */
        /* FULLWIDTH BREAK — parallax bg image with left overlay gradient  */
        /* ──────────────────────────────────────────────────────────────── */
        .ct-fullwidth-wrap {
          position: relative; height: clamp(260px, 40vh, 440px); overflow: hidden;
        }
        .ct-fullwidth-img {
          position: absolute; inset: -10%;
          background-image: url('https://images.pexels.com/photos/1458658/pexels-photo-1458658.jpeg?w=2000&q=85');
          background-size: cover; background-position: center;
          will-change: transform;
        }
        .ct-fullwidth-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            rgba(26,16,8,0.82) 0%,
            rgba(26,16,8,0.5) 45%,
            transparent 100%
          );
        }
        .ct-fullwidth-content {
          position: absolute; top: 50%; left: clamp(1.5rem, 6vw, 4rem);
          transform: translateY(-50%); max-width: 460px;
        }
        .ct-fullwidth-title {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: clamp(1.4rem, 3vw, 2.4rem); font-weight: 600;
          color: var(--cv-white); line-height: 1.35; margin-bottom: 1.25rem;
        }

        /* ──────────────────────────────────────────────────────────────── */
        /* CATERING — Couvee merchandise layout: cream bg, 3-col cards,    */
        /* col1 up, col2 down, col3 up                                     */
        /* ──────────────────────────────────────────────────────────────── */
        #ct-catering {
          background: var(--cv-cream2);
          padding: clamp(4rem, 9vh, 6.5rem) clamp(1.25rem, 5vw, 3.5rem);
        }
        .ct-catering-inner { max-width: 1200px; margin: 0 auto; }
        .ct-catering-head { margin-bottom: 2.5rem; }
        .ct-catering-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--cv-gold); margin-bottom: 0.75rem; display: block;
        }
        .ct-catering-title {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 600;
          color: var(--cv-dark); line-height: 1.2;
        }
        .ct-catering-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
        }
        @media (max-width: 860px) { .ct-catering-grid { grid-template-columns: 1fr; } }
        .ct-catering-card {
          background: var(--cv-white); border: 1px solid var(--cv-cream3);
          border-radius: 0.5rem; overflow: hidden;
          display: flex; flex-direction: column; opacity: 0;
          transition: all 0.35s ease;
        }
        .ct-catering-card:hover { transform: translateY(-5px); box-shadow: 0 24px 50px -20px var(--cv-shadow); }
        .ct-catering-img-wrap { aspect-ratio: 4/3; overflow: hidden; position: relative; }
        .ct-catering-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .ct-catering-card:hover .ct-catering-img { transform: scale(1.06); }
        .ct-catering-tag {
          position: absolute; top: 0.85rem; left: 0.85rem;
          background: var(--cv-gold); color: var(--cv-dark);
          font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          border-radius: 100px; padding: 0.25rem 0.7rem;
        }
        .ct-catering-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.6rem; flex: 1; }
        .ct-catering-name { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 600; color: var(--cv-dark); }
        .ct-catering-guests { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cv-gold); }
        .ct-catering-price { font-size: 0.9rem; font-weight: 600; color: var(--cv-ink2); }
        .ct-catering-list { list-style: none; display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.25rem; }
        .ct-catering-list li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.82rem; color: var(--cv-ink2); }
        .ct-catering-list li svg { color: var(--cv-gold); flex-shrink: 0; margin-top: 2px; }
        .ct-catering-footer { margin-top: auto; padding-top: 0.75rem; }

        /* ──────────────────────────────────────────────────────────────── */
        /* TESTIMONIALS ──────────────────────────────────────────────────── */
        /* ──────────────────────────────────────────────────────────────── */
        #ct-testimonials {
          background: var(--cv-white);
          padding: clamp(4rem, 9vh, 6.5rem) clamp(1.25rem, 5vw, 3.5rem);
        }
        .ct-testi-inner { max-width: 1200px; margin: 0 auto; }
        .ct-testi-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--cv-gold); margin-bottom: 0.75rem; display: block;
        }
        .ct-testi-title {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 600;
          color: var(--cv-dark); margin-bottom: 2.5rem;
        }
        .ct-testi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 700px) { .ct-testi-grid { grid-template-columns: 1fr; } }
        .ct-testi-card {
          background: var(--cv-cream); border: 1px solid var(--cv-cream3);
          border-radius: 0.5rem; padding: 2rem; opacity: 0;
          transition: all 0.35s ease;
        }
        .ct-testi-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px -20px var(--cv-shadow); }
        .ct-testi-stars { display: flex; gap: 2px; color: var(--cv-gold); margin-bottom: 1rem; }
        .ct-testi-text {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 1rem; color: var(--cv-dark); line-height: 1.75; margin-bottom: 1.25rem;
        }
        .ct-testi-name { font-size: 0.85rem; font-weight: 700; color: var(--cv-dark); }
        .ct-testi-role { font-size: 0.75rem; color: var(--cv-ink3); margin-top: 0.15rem; }

        /* ──────────────────────────────────────────────────────────────── */
        /* VISIT ─────────────────────────────────────────────────────────── */
        /* ──────────────────────────────────────────────────────────────── */
        #ct-visit {
          background: var(--cv-cream);
          padding: clamp(4rem, 9vh, 6.5rem) clamp(1.25rem, 5vw, 3.5rem);
        }
        .ct-visit-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(2.5rem, 6vw, 5rem); align-items: start;
        }
        @media (max-width: 860px) { .ct-visit-inner { grid-template-columns: 1fr; } }
        .ct-visit-left { opacity: 0; }
        .ct-visit-right { opacity: 0; }
        .ct-visit-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--cv-gold); margin-bottom: 0.75rem; display: block;
        }
        .ct-visit-title {
          font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 600;
          color: var(--cv-dark); margin-bottom: 1.5rem;
        }
        .ct-visit-detail {
          display: flex; align-items: flex-start; gap: 1rem;
          margin-bottom: 1.25rem; font-size: 0.9rem; color: var(--cv-ink2);
        }
        .ct-visit-detail-icon {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%;
          background: var(--cv-white); border: 1px solid var(--cv-cream3);
          display: flex; align-items: center; justify-content: center; color: var(--cv-gold);
        }
        .ct-visit-detail-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cv-gold); margin-bottom: 0.2rem; }
        .ct-hours-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--cv-ink2); padding: 0.4rem 0; border-bottom: 1px solid var(--cv-cream3); }
        .ct-hours-row:last-child { border-bottom: none; }
        .ct-map-wrap { border-radius: 0.5rem; overflow: hidden; aspect-ratio: 4/5; border: 1px solid var(--cv-cream3); }
        .ct-map-wrap iframe { width: 100%; height: 100%; border: 0; }

        /* ──────────────────────────────────────────────────────────────── */
        /* CTA SECTION ───────────────────────────────────────────────────── */
        /* ──────────────────────────────────────────────────────────────── */
        .ct-cta-section {
          position: relative; overflow: hidden; text-align: center;
          padding: clamp(5rem, 12vh, 9rem) clamp(1.25rem, 5vw, 3.5rem);
        }
        .ct-cta-bg {
          position: absolute; inset: -10%;
          background-image: url('https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?w=2000&q=85');
          background-size: cover; background-position: center;
          filter: brightness(0.35);
          will-change: transform;
        }
        .ct-cta-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg,
            rgba(26,16,8,0.5) 0%,
            rgba(26,16,8,0.35) 50%,
            rgba(26,16,8,0.6) 100%
          );
        }
        .ct-cta-content { position: relative; z-index: 2; }
        .ct-cta-logo { display: flex; justify-content: center; margin-bottom: 1.5rem; color: var(--cv-gold); }
        .ct-cta-heading {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: clamp(2rem, 5.5vw, 4.2rem); font-weight: 600; line-height: 1.2;
          color: var(--cv-white); margin-bottom: 1rem;
        }
        .ct-cta-sub { font-size: 1rem; color: var(--cv-tan); margin-bottom: 2.5rem; }
        .ct-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .ct-cta-tada { will-change: transform; }

        /* ──────────────────────────────────────────────────────────────── */
        /* INSTAGRAM SECTION — Couvee: white bg, logo + heading, 4-col grid*/
        /* ──────────────────────────────────────────────────────────────── */
        .ct-insta-section {
          background: var(--cv-white);
          padding: clamp(4rem, 9vh, 6.5rem) clamp(1.25rem, 5vw, 3.5rem);
          text-align: center;
        }
        .ct-insta-logo { display: flex; justify-content: center; margin-bottom: 1rem; color: var(--cv-gold); }
        .ct-insta-heading {
          font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 600;
          color: var(--cv-dark); margin-bottom: 2.5rem; opacity: 0;
        }
        .ct-insta-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;
          max-width: 1200px; margin: 0 auto;
        }
        @media (max-width: 700px) { .ct-insta-grid { grid-template-columns: repeat(2, 1fr); } }
        .ct-insta-grid-item {
          aspect-ratio: 1; overflow: hidden; opacity: 0;
          position: relative; cursor: pointer;
        }
        .ct-insta-grid-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .ct-insta-grid-item:hover img { transform: scale(1.08); }
        .ct-insta-grid-item::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(26,16,8,0); transition: background 0.3s ease;
        }
        .ct-insta-grid-item:hover::after { background: rgba(26,16,8,0.2); }
        .ct-insta-follow {
          display: flex; align-items: center; gap: 0.6rem;
          margin-top: 2rem; justify-content: center;
          font-size: 0.85rem; font-weight: 600; color: var(--cv-ink2);
        }
        .ct-insta-follow a {
          display: inline-flex; align-items: center; gap: 0.4rem;
          color: var(--cv-brown); text-decoration: none;
          border-bottom: 1px solid var(--cv-brown); padding-bottom: 1px;
          transition: color 0.25s ease, border-color 0.25s ease;
        }
        .ct-insta-follow a:hover { color: var(--cv-gold); border-color: var(--cv-gold); }

        /* ──────────────────────────────────────────────────────────────── */
        /* FOOTER — Couvee: dark bg, 3-col grid, logo + links + contacts   */
        /* ──────────────────────────────────────────────────────────────── */
        #ct-footer {
          background: var(--cv-dark2);
          padding: clamp(3rem, 6vh, 5rem) clamp(1.25rem, 5vw, 3.5rem) 2rem;
          color: rgba(255,255,255,0.7);
        }
        .ct-footer-inner { max-width: 1200px; margin: 0 auto; }
        .ct-footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2.5rem; margin-bottom: 2.5rem;
        }
        @media (max-width: 860px) { .ct-footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .ct-footer-grid { grid-template-columns: 1fr; } }
        .ct-footer-logo {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 1.5rem; font-weight: 600; color: var(--cv-white);
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;
        }
        .ct-footer-logo svg { color: var(--cv-gold); }
        .ct-footer-desc { font-size: 0.85rem; line-height: 1.85; max-width: 280px; color: rgba(255,255,255,0.5); }
        .ct-footer-social { display: flex; gap: 0.6rem; margin-top: 1.5rem; }
        .ct-footer-social-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.65); transition: all 0.25s ease; text-decoration: none;
        }
        .ct-footer-social-btn:hover { background: var(--cv-gold); color: var(--cv-dark); border-color: var(--cv-gold); }
        .ct-footer-col-title {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--cv-gold); margin-bottom: 1.25rem;
        }
        .ct-footer-link {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.85rem; color: rgba(255,255,255,0.5);
          text-decoration: none; margin-bottom: 0.6rem;
          background: none; border: none; cursor: pointer;
          padding: 0; transition: color 0.25s ease;
        }
        .ct-footer-link:hover { color: var(--cv-white); }
        .ct-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;
          font-size: 0.75rem; color: rgba(255,255,255,0.35);
        }
        .ct-footer-bottom-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
        .ct-footer-disclaimer { font-style: italic; font-size: 0.7rem; line-height: 1.75; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); }

        /* ──────────────────────────────────────────────────────────────── */
        /* MODALS ────────────────────────────────────────────────────────── */
        /* ──────────────────────────────────────────────────────────────── */
        .ct-modal-overlay {
          position: fixed; inset: 0; z-index: 800;
          background: rgba(26,16,8,0.6); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(1rem, 4vw, 3rem);
          animation: ctOverlayIn 0.3s ease;
        }
        .ct-modal-panel {
          background: var(--cv-white); border-radius: 0.75rem;
          max-width: 680px; width: 100%; max-height: 88vh; overflow-y: auto;
          position: relative; box-shadow: 0 40px 100px -24px rgba(26,16,8,0.55);
          animation: ctModalIn 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .ct-modal-panel.wide { max-width: 880px; }
        .ct-modal-close {
          position: absolute; top: 1rem; right: 1rem; z-index: 2;
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--cv-cream); border: 1px solid var(--cv-cream3);
          color: var(--cv-dark); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.25s ease;
        }
        .ct-modal-close:hover { background: var(--cv-dark); color: var(--cv-white); }
        .ct-modal-img-wrap { aspect-ratio: 16/9; overflow: hidden; border-radius: 0.75rem 0.75rem 0 0; }
        .ct-modal-img { width: 100%; height: 100%; object-fit: cover; }
        .ct-modal-body { padding: clamp(1.5rem, 4vw, 2.25rem); }
        .ct-modal-badge {
          display: inline-block; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--cv-gold);
          background: rgba(184,137,58,0.12); border-radius: 100px;
          padding: 0.2rem 0.6rem; margin-bottom: 0.75rem;
        }
        .ct-modal-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.6rem; }
        .ct-modal-title { font-family: 'Playfair Display', serif; font-size: clamp(1.4rem, 4vw, 2rem); font-weight: 600; color: var(--cv-dark); line-height: 1.2; }
        .ct-modal-price { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 600; color: var(--cv-gold); white-space: nowrap; }
        .ct-modal-desc { font-size: 0.93rem; color: var(--cv-ink2); line-height: 1.85; margin-bottom: 1.5rem; }
        .ct-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .ct-catering-includes { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.5rem; }
        .ct-catering-includes li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.9rem; color: var(--cv-ink2); }
        .ct-catering-includes li svg { color: var(--cv-gold); flex-shrink: 0; margin-top: 2px; }
        @keyframes ctModalIn { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes ctOverlayIn { from { opacity: 0; } to { opacity: 1; } }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── NAV — Couvee: dark bar, Instagram left, logo center, hamburger right ── */}
      <nav className={`ct-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="ct-nav-left">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="ct-nav-social" aria-label="Instagram">
            <Instagram size={16} />
          </a>
        </div>
        <div
          className="ct-nav-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="ct-nav-logo-icon"><Coffee size={22} /></div>
          <span className="ct-nav-logo-name">Cafe Teresita</span>
          <span className="ct-nav-logo-sub">by Guada's · Kinoguitan</span>
        </div>
        <div className="ct-nav-right">
          <button className="ct-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <MenuIcon size={18} />
          </button>
        </div>
      </nav>

      {/* ── OVERLAY MENU — slides down from top exactly like Couvee ────────── */}
      <div className={`ct-overlay-menu${menuOpen ? ' open' : ''}`}>
        <div className="ct-overlay-head">
          <div className="ct-nav-logo" style={{ color: 'white' }}>
            <div className="ct-nav-logo-icon"><Coffee size={22} /></div>
            <span className="ct-nav-logo-name">Cafe Teresita</span>
          </div>
          <button className="ct-overlay-close" onClick={() => setMenuOpen(false)}>Close</button>
        </div>
        <nav className="ct-overlay-nav">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              className="ct-overlay-link"
              onClick={e => { e.preventDefault(); smoothScroll(link.href) }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* ── HERO — dark overlay, centered title, two floating hand images ────── */}
      <section id="ct-hero">
        <div className="ct-hero-bg">
          <img
            className="ct-hero-bg-img"
            src="https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?w=1800&q=85"
            alt=""
            aria-hidden="true"
          />
        </div>
        <div className="ct-hero-overlay" />

        {/* Right floating hand image — fadeInUp, mouse track positive */}
        <div className="ct-hero-right-img">
          <img
            src="https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=400&q=80"
            alt=""
            aria-hidden="true"
          />
        </div>

        {/* Left floating hand image — fadeInUp delay:200, mouse track negative */}
        <div className="ct-hero-left-img">
          <img
            src="https://images.pexels.com/photos/5305639/pexels-photo-5305639.jpeg?w=400&q=80"
            alt=""
            aria-hidden="true"
          />
        </div>

        <div className="ct-hero-content">
          {/* Logo title — fadeInDown delay:700ms */}
          <div className="ct-hero-title">
            <div className="ct-hero-title-text">Cafe Teresita</div>
            <div className="ct-hero-title-sub">Coffee · Rice Meals · Catering · Kinoguitan</div>
          </div>

          <div className="ct-hero-rating">
            <div className="ct-hero-rating-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} fill="currentColor" stroke="none" />
              ))}
            </div>
            4.5 · Google Reviews
          </div>

          <div className="ct-hero-cta">
            <button className="ct-btn" onClick={() => smoothScroll('#ct-menu')}>
              See Our Menu <ArrowRight size={14} />
            </button>
            <button className="ct-btn ct-btn-outline" onClick={() => smoothScroll('#ct-about')}>
              Our Story
            </button>
          </div>
        </div>
      </section>

      {/* ── MARQUEE — dark brown strip, Couvee-style ──────────────────────── */}
      <div className="ct-marquee-wrap">
        <div className="ct-marquee-track">
          {Array.from({ length: 2 }).flatMap((_, r) =>
            ['Coffee', '·', 'Rice Meals', '·', 'Catering', '·', 'Merienda', '·', 'Calubo', '·', 'Kinoguitan', '·', 'Open Daily 10AM–10PM', '·'].map((w, i) => (
              <span key={`${r}-${i}`} className={`ct-marquee-word${w === '·' ? ' ct-marquee-dot' : ''}`}>{w}</span>
            ))
          )}
        </div>
      </div>

      {/* ── STORY / ABOUT — img col left fadeInLeft, text col right fadeInRight delay:300 ── */}
      <section id="ct-about">
        <div className="ct-about-deco" />
        <div className="ct-about-inner">
          <div className="ct-about-img-col">
            <div className="ct-about-img-wrap">
              <img
                className="ct-about-img"
                src="https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?w=900&q=85"
                alt="Inside Cafe Teresita"
              />
            </div>
            <div className="ct-about-deco-small">
              <img
                src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?w=200&q=80"
                alt=""
              />
            </div>
          </div>
          <div className="ct-about-text-col">
            <span className="ct-about-eyebrow">Story</span>
            <h2 className="ct-about-heading">
              A modest cafe, <em>made with heart.</em>
            </h2>
            <p className="ct-about-body">
              Founded along the national highway in Calubo, Kinoguitan, Misamis Oriental,
              Cafe Teresita by Guada's has grown from a neighborhood staple into the community's
              go-to spot for coffee, home-style rice meals, and special occasion catering.
            </p>
            <p className="ct-about-body" style={{ marginTop: '-0.5rem' }}>
              Accessible, warm, and unapologetically local — every cup and every plate
              is made with the same care that makes people keep coming back.
            </p>
            <button className="ct-btn ct-btn-dark" onClick={() => smoothScroll('#ct-menu')}>
              Full Menu <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS / FEATURED — Couvee arch cards, fadeInUp section ─────── */}
      <section id="ct-featured">
        {/* decoration strip that parallaxes down (Couvee decoration-1) */}
        <div className="ct-feat-deco" style={{
          background: 'linear-gradient(180deg, var(--cv-cream) 0%, transparent 100%)',
        }} />
        <div className="ct-feat-inner">
          <div className="ct-feat-head">
            <div>
              <span className="ct-feat-eyebrow">Featured Drinks</span>
              <h2 className="ct-feat-title">Sip something <em>special.</em></h2>
            </div>
            <p className="ct-feat-sub">
              A few favorites our regulars keep coming back for — best enjoyed
              right here in Calubo.
            </p>
          </div>
          <div className="ct-feat-grid">
            {FEATURED_DRINKS.map(d => (
              <div key={d.id} className="ct-feat-card">
                <div className="ct-feat-img-wrap">
                  <img className="ct-feat-img" src={d.img} alt={d.name} />
                </div>
                <div className="ct-feat-body">
                  <div className="ct-feat-name">{d.name}</div>
                  <div className="ct-feat-sub2">{d.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="ct-btn ct-btn-dark" onClick={() => smoothScroll('#ct-menu')}>
              All Menu <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── QUOTE STRIP — Couvee dark section with big italic serif quote ───── */}
      <div className="ct-quote-strip">
        <div className="ct-quote-inner">
          <p className="ct-quote-text">
            A cup of coffee shared with a friend is happiness tasted and time well spent.
          </p>
          <div className="ct-quote-attr">— Cafe Teresita · Calubo, Kinoguitan</div>
        </div>
      </div>

      {/* ── MENU ─────────────────────────────────────────────────────────────── */}
      <section id="ct-menu">
        <div className="ct-menu-inner">
          <div className="ct-menu-head">
            <span className="ct-menu-eyebrow">Our Menu</span>
            <h2 className="ct-menu-title">What we're serving</h2>
            <p className="ct-menu-sub">Click any item to see more details.</p>
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
              <div key={item.id} className="ct-menu-card" onClick={() => setMenuModalItem(item)}>
                <div className="ct-menu-card-img-wrap">
                  <img className="ct-menu-card-img" src={item.img} alt={item.name} />
                </div>
                <div className="ct-menu-card-body">
                  {item.tag && <span className="ct-menu-card-badge">{item.tag}</span>}
                  <div className="ct-menu-card-row">
                    <span className="ct-menu-card-name">{item.name}</span>
                    <span className="ct-menu-card-price">{item.price}</span>
                  </div>
                  <p className="ct-menu-card-desc">{item.desc}</p>
                  <div className="ct-menu-card-footer">
                    <span>See Details</span>
                    <ExternalLink size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULLWIDTH IMAGE BREAK — parallax ─────────────────────────────────── */}
      <div className="ct-fullwidth-wrap">
        <div className="ct-fullwidth-img" />
        <div className="ct-fullwidth-overlay" />
        <div className="ct-fullwidth-content">
          <p className="ct-fullwidth-title">
            "The only modest cafe in Kinoguitan — and the sauces are delicious."
          </p>
          <button className="ct-btn" onClick={() => smoothScroll('#ct-catering')}>
            Book Catering <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── CATERING — Couvee merchandise col stagger ────────────────────────── */}
      <section id="ct-catering">
        <div className="ct-catering-inner">
          <div className="ct-catering-head">
            <span className="ct-catering-eyebrow">Catering</span>
            <h2 className="ct-catering-title">We cater for every occasion.</h2>
          </div>
          <div className="ct-catering-grid">
            {CATERING_PACKAGES.map(pkg => (
              <div key={pkg.id} className="ct-catering-card" onClick={() => setCateringModal(pkg)}>
                <div className="ct-catering-img-wrap">
                  <img className="ct-catering-img" src={pkg.img} alt={pkg.name} />
                  {pkg.tag && <span className="ct-catering-tag">{pkg.tag}</span>}
                </div>
                <div className="ct-catering-body">
                  <div className="ct-catering-name">{pkg.name}</div>
                  <div className="ct-catering-guests">{pkg.guests}</div>
                  <div className="ct-catering-price">{pkg.price}</div>
                  <ul className="ct-catering-list">
                    {pkg.includes.map((inc, i) => (
                      <li key={i}><CupSoda size={13} />{inc}</li>
                    ))}
                  </ul>
                  <div className="ct-catering-footer">
                    <button className="ct-btn ct-btn-dark ct-btn-sm">
                      See Package <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="ct-btn ct-btn-dark" onClick={() => smoothScroll('#ct-visit')}>
              Order Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section id="ct-testimonials">
        <div className="ct-testi-inner">
          <span className="ct-testi-eyebrow">What People Say</span>
          <h2 className="ct-testi-title">Our regulars speak.</h2>
          <div className="ct-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="ct-testi-card">
                <div className="ct-testi-stars">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={13} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <p className="ct-testi-text">"{t.quote}"</p>
                <div className="ct-testi-name">{t.name}</div>
                <div className="ct-testi-role">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISIT ────────────────────────────────────────────────────────────── */}
      <section id="ct-visit">
        <div className="ct-visit-inner">
          <div className="ct-visit-left">
            <span className="ct-visit-eyebrow">Locations</span>
            <h2 className="ct-visit-title">Come find us.</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--cv-ink2)', lineHeight: 1.85, marginBottom: '2rem' }}>
              Cafe Teresita has one location, right along the national highway in
              Calubo, Kinoguitan, Misamis Oriental — easy to find, hard to leave.
            </p>
            <div className="ct-visit-detail">
              <div className="ct-visit-detail-icon"><MapPin size={16} /></div>
              <div>
                <div className="ct-visit-detail-label">Address</div>
                National Highway, Calubo, Kinoguitan, Misamis Oriental
              </div>
            </div>
            <div className="ct-visit-detail">
              <div className="ct-visit-detail-icon"><Clock size={16} /></div>
              <div>
                <div className="ct-visit-detail-label">Hours</div>
                <div style={{ marginTop: '0.5rem' }}>
                  {VISIT_HOURS.map(h => (
                    <div key={h.day} className="ct-hours-row">
                      <span>{h.day}</span><span>{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <a
              className="ct-btn ct-btn-dark"
              href="https://maps.app.goo.gl/?q=8.9670078,124.7954639"
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: '1.5rem' }}
            >
              Get Directions <ArrowRight size={14} />
            </a>
          </div>
          <div className="ct-visit-right">
            <div className="ct-map-wrap">
              <iframe
                title="Cafe Teresita location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.1!2d124.7954639!3d8.9670078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwNTgnMDEuMiJOIDEyNMKwNDcnNDMuNyJF!5e0!3m2!1sen!2sph!4v1"
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION — dark bg parallax, Couvee-style with tada btn ─────── */}
      <section className="ct-cta-section">
        <div className="ct-cta-bg" />
        <div className="ct-cta-overlay" />
        <div className="ct-cta-content">
          <div className="ct-cta-logo"><Coffee size={32} /></div>
          <h2 className="ct-cta-heading">
            Drop by, say hi,<br />grab a cup.
          </h2>
          <p className="ct-cta-sub">Open daily from 10AM to 10PM in Calubo, Kinoguitan.</p>
          <div className="ct-cta-btns">
            <a
              className="ct-btn ct-cta-tada"
              href="https://maps.app.goo.gl/?q=8.9670078,124.7954639"
              target="_blank"
              rel="noreferrer"
            >
              Get Directions <ArrowRight size={14} />
            </a>
            <button className="ct-btn ct-btn-outline" onClick={() => smoothScroll('#ct-menu')}>
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM SECTION — Couvee: logo + heading + 4-col image grid ──── */}
      <section className="ct-insta-section">
        <div className="ct-insta-logo"><Instagram size={28} /></div>
        <h2 className="ct-insta-heading">FIND US ON INSTAGRAM!</h2>
        <div className="ct-insta-grid">
          {[
            'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?w=400&q=80',
            'https://images.pexels.com/photos/5305639/pexels-photo-5305639.jpeg?w=400&q=80',
            'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?w=400&q=80',
            'https://images.pexels.com/photos/1458658/pexels-photo-1458658.jpeg?w=400&q=80',
          ].map((src, i) => (
            <div key={i} className="ct-insta-grid-item">
              <img src={src} alt={`Instagram post ${i + 1}`} />
            </div>
          ))}
        </div>
        <div className="ct-insta-follow">
          Follow us on <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={14} /> @cafeteresita</a>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer id="ct-footer">
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
                {[{ icon: Facebook, href: '#', label: 'Facebook' }, { icon: Instagram, href: '#', label: 'Instagram' }].map((s, i) => (
                  <a key={i} href={s.href} aria-label={s.label} className="ct-footer-social-btn" target={s.href !== '#' ? '_blank' : undefined} rel="noopener noreferrer">
                    <s.icon size={15} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="ct-footer-col-title">Links</div>
              {NAV_LINKS.map(l => (
                <a key={l.href} className="ct-footer-link" onClick={e => { e.preventDefault(); smoothScroll(l.href) }}>
                  {l.label}
                </a>
              ))}
            </div>
            <div>
              <div className="ct-footer-col-title">Contacts</div>
              <span className="ct-footer-link" style={{ cursor: 'default' }}><MapPin size={12} />Calubo, Kinoguitan, Mis. Or.</span>
              <span className="ct-footer-link" style={{ cursor: 'default' }}><Clock size={12} />Open daily, 10AM–10PM</span>
              <div style={{ marginTop: '1.25rem' }}>
                <div className="ct-footer-col-title">Catering</div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
                  Available for birthdays, family gatherings &amp; community events.
                  <br />
                  <button className="ct-footer-link" style={{ padding: 0, marginTop: '0.4rem' }} onClick={() => smoothScroll('#ct-catering')}>
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
              <strong style={{ fontStyle: 'normal' }}>Disclaimer:</strong> This is a concept landing page created for demonstration purposes only by <strong style={{ fontStyle: 'normal' }}>James Rafty D. Libago (Mizumi)</strong>,
              using publicly available information (Google Maps listing &amp; reviews) and placeholder imagery from Pexels.
              This page was not commissioned by, and is not an official website of, Cafe Teresita by Guada's.
              Menu items, prices, and catering packages shown are illustrative placeholders pending real information from the business.
            </div>
          </div>
        </div>
      </footer>

      {/* ── MENU ITEM MODAL ──────────────────────────────────────────────────── */}
      {menuModalItem && (
        <div className="ct-modal-overlay" onClick={() => setMenuModalItem(null)}>
          <div className="ct-modal-panel" onClick={e => e.stopPropagation()}>
            <button className="ct-modal-close" onClick={() => setMenuModalItem(null)} aria-label="Close"><X size={16} /></button>
            <div className="ct-modal-img-wrap">
              <img className="ct-modal-img" src={menuModalItem.img} alt={menuModalItem.name} />
            </div>
            <div className="ct-modal-body">
              {menuModalItem.tag && <span className="ct-modal-badge">{menuModalItem.tag}</span>}
              <div className="ct-modal-title-row">
                <h3 className="ct-modal-title">{menuModalItem.name}</h3>
                <span className="ct-modal-price">{menuModalItem.price}</span>
              </div>
              <p className="ct-modal-desc">{menuModalItem.desc}</p>
              <div className="ct-modal-footer">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cv-ink3)' }}>{activeCategory}</span>
                <button className="ct-btn ct-btn-dark" onClick={() => { setMenuModalItem(null); smoothScroll('#ct-visit') }}>
                  Visit to Order <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CATERING MODAL ───────────────────────────────────────────────────── */}
      {cateringModal && (
        <div className="ct-modal-overlay" onClick={() => setCateringModal(null)}>
          <div className="ct-modal-panel wide" onClick={e => e.stopPropagation()}>
            <button className="ct-modal-close" onClick={() => setCateringModal(null)} aria-label="Close"><X size={16} /></button>
            <div className="ct-modal-img-wrap">
              <img className="ct-modal-img" src={cateringModal.img} alt={cateringModal.name} />
            </div>
            <div className="ct-modal-body">
              {cateringModal.tag && <span className="ct-modal-badge">{cateringModal.tag}</span>}
              <div className="ct-modal-title-row">
                <h3 className="ct-modal-title">{cateringModal.name}</h3>
                <span className="ct-modal-price">{cateringModal.price}</span>
              </div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cv-gold)', marginBottom: '1rem' }}>{cateringModal.guests}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--cv-ink2)', marginBottom: '0.75rem', fontWeight: 600 }}>What's included:</p>
              <ul className="ct-catering-includes">
                {cateringModal.includes.map((inc, i) => (
                  <li key={i}><CupSoda size={15} />{inc}</li>
                ))}
              </ul>
              <div className="ct-modal-footer">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cv-ink3)' }}>Final pricing confirmed on inquiry</span>
                <button className="ct-btn ct-btn-dark" onClick={() => { setCateringModal(null); smoothScroll('#ct-visit') }}>
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
