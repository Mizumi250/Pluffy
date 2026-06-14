/* @arkzen:meta
name: hw-coffee
version: 1.0.0
description: "H&W Coffee — Premium minimalist landing page with GSAP ScrollTrigger animations, dark/light mode, parallax hero, sticky nav, marquee ticker, menu showcase, testimonials, and animated CTA. Frontend-only. Inspired by Saisei architecture site aesthetics."
auth: false
*/

/* @arkzen:meta:web
favicon: ☕
title: H&W Coffee — Every Sip, A Story
description: H&W Coffee — Specialty coffee crafted with passion. Experience artisan brews, sustainable sourcing, and a space where every detail matters.
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "hw-root"
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Coffee, Menu, X, Sun, Moon, ArrowRight, Star, MapPin,
  Clock, Phone, Mail, Instagram, Facebook, Twitter,
  ChevronDown, Leaf, Award, Heart, Zap, ArrowUpRight,
  Minus, Plus
} from 'lucide-react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Story', href: '#story' },
  { label: 'Menu', href: '#menu' },
  { label: 'Process', href: '#process' },
  { label: 'Visits', href: '#visits' },
  { label: 'Contact', href: '#contact' },
]

const MENU_ITEMS = [
  {
    category: 'Signature',
    items: [
      {
        name: 'H&W Signature Blend',
        desc: 'Our house espresso — dark chocolate, toasted hazelnut, lingering sweetness.',
        price: '₱120',
        badge: 'Bestseller',
        img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
      },
      {
        name: 'White Velvet Latte',
        desc: 'Triple-shot espresso, steamed oat milk, vanilla bean — silky and bold.',
        price: '₱145',
        badge: 'New',
        img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
      },
      {
        name: 'Cold Brew Cascade',
        desc: '18-hour steeped single origin, served over obsidian ice.',
        price: '₱135',
        badge: null,
        img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80',
      },
    ],
  },
  {
    category: 'Pour-Over',
    items: [
      {
        name: 'Ethiopian Yirgacheffe',
        desc: 'Bright citrus, floral jasmine, with a tea-like clarity.',
        price: '₱160',
        badge: 'Single Origin',
        img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
      },
      {
        name: 'Colombian Huila',
        desc: 'Red apple, caramel, milk chocolate — perfectly balanced.',
        price: '₱155',
        badge: null,
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
      },
    ],
  },
  {
    category: 'Food',
    items: [
      {
        name: 'Butter Croissant',
        desc: 'Laminated 72-hour dough, baked golden every morning.',
        price: '₱85',
        badge: 'Fresh Daily',
        img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
      },
      {
        name: 'Ricotta Toast',
        desc: 'Sourdough, whipped ricotta, honey drizzle, microgreens.',
        price: '₱110',
        badge: null,
        img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80',
      },
    ],
  },
]

const PROCESS_STEPS = [
  {
    num: '01',
    icon: Leaf,
    title: 'Sourced',
    sub: 'Direct Trade',
    desc: 'We work directly with farmers across Ethiopia, Colombia, and the Philippines — building relationships that ensure quality at the root.',
  },
  {
    num: '02',
    icon: Zap,
    title: 'Roasted',
    sub: 'Small Batch',
    desc: 'Every batch is roasted in-house to a precise profile — unlocking each bean\'s natural character without masking it.',
  },
  {
    num: '03',
    icon: Heart,
    title: 'Brewed',
    sub: 'With Intention',
    desc: 'Our baristas are trained to dial in each brew method — pour-over, espresso, cold brew — with obsessive attention to detail.',
  },
  {
    num: '04',
    icon: Award,
    title: 'Served',
    sub: 'To You',
    desc: 'Every cup that leaves our bar is a promise — that what\'s in it was made with care, from source to your hands.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Mika Reyes',
    role: 'Regular, 2 years',
    text: 'The White Velvet Latte is the reason I wake up. H&W feels like home — the kind you never want to leave.',
    stars: 5,
  },
  {
    name: 'Carlo Santos',
    role: 'Coffee Enthusiast',
    text: 'Serious specialty coffee without the pretension. The Ethiopian pour-over hits differently every morning.',
    stars: 5,
  },
  {
    name: 'Leah Tan',
    role: 'Remote Worker',
    text: 'I\'ve tried every café in the city. None of them have the atmosphere, the quality, or the care that H&W does.',
    stars: 5,
  },
  {
    name: 'Marco Villanueva',
    role: 'First Visit',
    text: 'Walked in on a whim. Left with a new ritual. The Cold Brew Cascade is something else entirely.',
    stars: 5,
  },
]

const MARQUEE_WORDS = [
  'Specialty Coffee', '·', 'Small Batch Roasting', '·',
  'Direct Trade', '·', 'Pour-Over', '·', 'Cold Brew', '·',
  'Single Origin', '·', 'Artisan Brews', '·', 'H&W Coffee', '·',
]

const LOCATIONS = [
  {
    name: 'H&W — Flagship',
    address: '12 Dela Rosa St., Makati City',
    hours: 'Mon–Fri 7AM–9PM · Sat–Sun 8AM–10PM',
    phone: '+63 2 8123 4567',
    img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  },
  {
    name: 'H&W — BGC Branch',
    address: '5th Ave corner 26th St., BGC, Taguig',
    hours: 'Mon–Sun 7AM–10PM',
    phone: '+63 2 8765 4321',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  },
]

const STATS = [
  { num: '2016', label: 'Est.' },
  { num: '8+', label: 'Origins' },
  { num: '150+', label: 'Farmers' },
  { num: '4.9★', label: 'Avg Rating' },
]

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [dark, setDark] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Signature')
  const [scrolled, setScrolled] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorRing, setCursorRing] = useState({ x: -100, y: -100 })
  const pageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const cursorTimeout = useRef<any>(null)

  // ── Theme persistence ───────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('hw-theme')
    if (saved) setDark(saved === 'dark')
  }, [])

  useEffect(() => {
    localStorage.setItem('hw-theme', dark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-hw-theme', dark ? 'dark' : 'light')
  }, [dark])

  // ── Custom cursor ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
      clearTimeout(cursorTimeout.current)
      cursorTimeout.current = setTimeout(() => {
        setCursorRing({ x: e.clientX, y: e.clientY })
      }, 80)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // ── Scroll detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── GSAP Animations ─────────────────────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // Hero headline stagger
      gsap.fromTo('.hw-hero-line',
        { y: 120, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out', delay: 0.3 }
      )
      gsap.fromTo('.hw-hero-sub',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.9 }
      )
      gsap.fromTo('.hw-hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.2 }
      )

      // Hero image parallax
      gsap.to('.hw-hero-img', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hw-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Hero overlay parallax (opposite direction)
      gsap.to('.hw-hero-overlay-txt', {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hw-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Stats count-up fade
      gsap.fromTo('.hw-stat-item',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#hw-stats', start: 'top 80%' },
        }
      )

      // Story section
      gsap.fromTo('.hw-story-label',
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#story', start: 'top 80%' },
        }
      )
      gsap.fromTo('.hw-story-heading span',
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'power4.out',
          scrollTrigger: { trigger: '#story', start: 'top 75%' },
        }
      )
      gsap.fromTo('.hw-story-body p',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#story', start: 'top 65%' },
        }
      )
      gsap.fromTo('.hw-story-img-wrap',
        { scale: 1.08, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: '#story', start: 'top 70%' },
        }
      )

      // Process steps
      gsap.fromTo('.hw-process-step',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '#process', start: 'top 75%' },
        }
      )

      // Menu cards
      gsap.fromTo('.hw-menu-card',
        { y: 50, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#menu', start: 'top 70%' },
        }
      )

      // Testimonials
      gsap.fromTo('.hw-testi-card',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#hw-testimonials', start: 'top 75%' },
        }
      )

      // Location cards
      gsap.fromTo('.hw-location-card',
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '#visits', start: 'top 75%' },
        }
      )

      // CTA section
      gsap.fromTo('.hw-cta-heading',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power4.out',
          scrollTrigger: { trigger: '#hw-cta', start: 'top 80%' },
        }
      )

      // Horizontal line reveal
      gsap.utils.toArray<HTMLElement>('.hw-line-reveal').forEach((el) => {
        gsap.fromTo(el,
          { scaleX: 0, transformOrigin: 'left' },
          {
            scaleX: 1, duration: 1.2, ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        )
      })

    }, pageRef)

    return () => ctx.revert()
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const smoothScroll = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const activeItems = MENU_ITEMS.find(c => c.category === activeCategory)?.items ?? []

  // ── CSS Variables ────────────────────────────────────────────────────────────
  const themeVars = dark
    ? {
        '--hw-bg': '#0a0906',
        '--hw-bg2': '#111009',
        '--hw-bg3': '#1a1710',
        '--hw-fg': '#f5f0e8',
        '--hw-fg2': '#a89880',
        '--hw-fg3': '#5a4f40',
        '--hw-accent': '#c8935a',
        '--hw-accent2': '#e8b07a',
        '--hw-border': 'rgba(200,147,90,0.15)',
        '--hw-card': 'rgba(255,255,255,0.03)',
        '--hw-card-hover': 'rgba(255,255,255,0.06)',
      }
    : {
        '--hw-bg': '#faf7f2',
        '--hw-bg2': '#f2ede4',
        '--hw-bg3': '#ede5d8',
        '--hw-fg': '#1a110a',
        '--hw-fg2': '#6b5040',
        '--hw-fg3': '#b09070',
        '--hw-accent': '#9b5e2a',
        '--hw-accent2': '#c07838',
        '--hw-border': 'rgba(155,94,42,0.2)',
        '--hw-card': 'rgba(0,0,0,0.03)',
        '--hw-card-hover': 'rgba(0,0,0,0.06)',
      }

  return (
    <div
      ref={pageRef}
      style={{ ...themeVars as React.CSSProperties, background: 'var(--hw-bg)', color: 'var(--hw-fg)', fontFamily: '"Inter", system-ui, sans-serif', minHeight: '100vh', overflowX: 'hidden' } as React.CSSProperties}
    >

      {/* ── Inline Styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: var(--hw-bg); }
        ::-webkit-scrollbar-thumb { background: var(--hw-accent); border-radius: 2px; }

        /* Custom cursor */
        .hw-cursor-dot {
          position: fixed; width: 6px; height: 6px; border-radius: 50%;
          background: var(--hw-accent); pointer-events: none; z-index: 9999;
          transform: translate(-50%, -50%); transition: transform 0.1s ease;
          mix-blend-mode: difference;
        }
        .hw-cursor-ring {
          position: fixed; width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid var(--hw-accent); pointer-events: none; z-index: 9998;
          transform: translate(-50%, -50%); transition: all 0.3s ease;
          opacity: 0.5;
        }

        /* Nav */
        .hw-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          height: 72px;
          transition: background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease;
          border-bottom: 1px solid transparent;
        }
        .hw-nav.scrolled {
          background: color-mix(in srgb, var(--hw-bg) 85%, transparent);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom-color: var(--hw-border);
        }
        .hw-nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem; font-weight: 600;
          letter-spacing: -0.02em; color: var(--hw-fg);
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none;
        }
        .hw-nav-links { display: flex; align-items: center; gap: 2.5rem; }
        .hw-nav-link {
          font-size: 0.82rem; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--hw-fg2); text-decoration: none;
          position: relative; transition: color 0.3s ease;
        }
        .hw-nav-link::after {
          content: ''; position: absolute; bottom: -3px; left: 0; right: 0;
          height: 1px; background: var(--hw-accent);
          transform: scaleX(0); transform-origin: right; transition: transform 0.3s ease;
        }
        .hw-nav-link:hover { color: var(--hw-fg); }
        .hw-nav-link:hover::after { transform: scaleX(1); transform-origin: left; }
        .hw-nav-actions { display: flex; align-items: center; gap: 1rem; }
        .hw-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid var(--hw-border); background: transparent;
          color: var(--hw-fg2); cursor: pointer;
          transition: all 0.3s ease;
        }
        .hw-icon-btn:hover { border-color: var(--hw-accent); color: var(--hw-accent); }
        .hw-cta-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.5rem; border-radius: 2rem;
          background: var(--hw-accent); color: #fff;
          font-size: 0.82rem; font-weight: 500; letter-spacing: 0.05em;
          text-transform: uppercase; text-decoration: none; border: none; cursor: pointer;
          transition: all 0.3s ease;
        }
        .hw-cta-btn:hover { background: var(--hw-accent2); transform: translateY(-1px); }
        .hw-cta-btn-ghost {
          background: transparent; color: var(--hw-fg);
          border: 1px solid var(--hw-border);
        }
        .hw-cta-btn-ghost:hover { border-color: var(--hw-accent); color: var(--hw-accent); background: transparent; }

        /* Mobile nav menu */
        .hw-mobile-menu {
          position: fixed; inset: 0; z-index: 200;
          background: var(--hw-bg); display: flex; flex-direction: column;
          padding: 2rem clamp(1.5rem, 5vw, 4rem);
          transform: translateX(100%); transition: transform 0.5s cubic-bezier(0.77,0,0.175,1);
        }
        .hw-mobile-menu.open { transform: translateX(0); }
        .hw-mobile-nav-link {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 400;
          color: var(--hw-fg); text-decoration: none;
          display: block; line-height: 1.1;
          transition: color 0.3s ease, transform 0.3s ease;
          border-bottom: 1px solid var(--hw-border); padding: 0.8rem 0;
        }
        .hw-mobile-nav-link:hover { color: var(--hw-accent); transform: translateX(8px); }

        /* Hamburger */
        .hw-hamburger {
          display: none; flex-direction: column; gap: 5px;
          width: 28px; cursor: pointer; background: none; border: none; padding: 4px;
        }
        .hw-hamburger span {
          display: block; height: 1px; background: var(--hw-fg);
          transition: all 0.4s ease;
        }
        .hw-hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .hw-hamburger.open span:nth-child(2) { opacity: 0; }
        .hw-hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

        @media (max-width: 768px) {
          .hw-nav-links { display: none; }
          .hw-hamburger { display: flex; }
          .hw-nav-cta-desktop { display: none; }
        }

        /* Hero */
        .hw-hero {
          position: relative; height: 100vh; min-height: 600px;
          display: flex; align-items: flex-end;
          padding: 0 clamp(1.5rem, 5vw, 4rem) clamp(3rem, 8vh, 5rem);
          overflow: hidden;
        }
        .hw-hero-img {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=2000&q=85');
          background-size: cover; background-position: center;
          will-change: transform;
        }
        .hw-hero-img::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            var(--hw-bg) 0%,
            color-mix(in srgb, var(--hw-bg) 50%, transparent) 40%,
            transparent 70%
          );
        }
        .hw-hero-content { position: relative; z-index: 2; max-width: 900px; }
        .hw-hero-tag {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--hw-accent);
          margin-bottom: 1.5rem;
        }
        .hw-hero-tag::before {
          content: ''; display: block; width: 24px; height: 1px; background: var(--hw-accent);
        }
        .hw-hero-line {
          display: block; overflow: hidden;
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 8vw, 7rem);
          font-weight: 400; line-height: 1.0;
          letter-spacing: -0.02em; color: var(--hw-fg);
        }
        .hw-hero-line em { font-style: italic; color: var(--hw-accent); }
        .hw-hero-sub {
          font-size: clamp(0.9rem, 1.5vw, 1.05rem); color: var(--hw-fg2);
          margin-top: 1.5rem; max-width: 460px; line-height: 1.7;
        }
        .hw-hero-cta {
          display: flex; align-items: center; gap: 1rem;
          margin-top: 2.5rem; flex-wrap: wrap;
        }
        .hw-scroll-hint {
          position: absolute; bottom: 2.5rem; right: clamp(1.5rem, 5vw, 4rem);
          z-index: 2; display: flex; flex-direction: column;
          align-items: center; gap: 0.4rem;
          font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--hw-fg3); writing-mode: vertical-rl;
          animation: scrollBob 2s ease-in-out infinite;
        }
        @keyframes scrollBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        /* Stats bar */
        .hw-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--hw-border);
          border-bottom: 1px solid var(--hw-border);
        }
        .hw-stat-item {
          padding: 2.5rem clamp(1.5rem, 3vw, 3rem);
          border-right: 1px solid var(--hw-border);
          text-align: center;
        }
        .hw-stat-item:last-child { border-right: none; }
        .hw-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem); font-weight: 600;
          color: var(--hw-accent); display: block;
        }
        .hw-stat-label {
          font-size: 0.78rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--hw-fg2);
          margin-top: 0.25rem; display: block;
        }
        @media (max-width: 600px) {
          .hw-stats { grid-template-columns: repeat(2, 1fr); }
          .hw-stat-item:nth-child(2) { border-right: none; }
          .hw-stat-item:nth-child(3), .hw-stat-item:nth-child(4) { border-top: 1px solid var(--hw-border); }
        }

        /* Marquee */
        .hw-marquee-wrap {
          overflow: hidden;
          border-top: 1px solid var(--hw-border);
          border-bottom: 1px solid var(--hw-border);
          padding: 1rem 0; background: var(--hw-bg2);
        }
        .hw-marquee-track {
          display: flex; gap: 3rem; align-items: center;
          animation: marqueeScroll 28s linear infinite;
          white-space: nowrap; width: max-content;
        }
        .hw-marquee-track:hover { animation-play-state: paused; }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hw-marquee-word {
          font-size: 0.8rem; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--hw-fg2);
          flex-shrink: 0;
        }
        .hw-marquee-word.dot { color: var(--hw-accent); font-size: 1rem; }

        /* Section layout */
        .hw-section {
          padding: clamp(5rem, 10vh, 8rem) clamp(1.5rem, 5vw, 4rem);
        }
        .hw-section-label {
          display: flex; align-items: center; gap: 0.75rem;
          font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--hw-accent); margin-bottom: 1.5rem;
        }
        .hw-section-label::before {
          content: ''; display: block; width: 32px; height: 1px; background: var(--hw-accent);
        }
        .hw-section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 400; line-height: 1.1; letter-spacing: -0.02em;
          overflow: hidden;
        }
        .hw-section-heading span { display: inline-block; }
        .hw-section-heading em { font-style: italic; color: var(--hw-accent); }

        /* Story */
        .hw-story-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem); align-items: center;
          margin-top: 4rem;
        }
        @media (max-width: 768px) { .hw-story-grid { grid-template-columns: 1fr; } }
        .hw-story-img-wrap {
          position: relative; border-radius: 2px; overflow: hidden;
          aspect-ratio: 4/5;
        }
        .hw-story-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.8s ease;
        }
        .hw-story-img-wrap:hover img { transform: scale(1.04); }
        .hw-story-img-badge {
          position: absolute; bottom: 1.5rem; left: 1.5rem;
          background: var(--hw-accent); color: #fff;
          padding: 0.5rem 1rem; font-size: 0.75rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
        }
        .hw-story-body p {
          color: var(--hw-fg2); line-height: 1.8; font-size: 1rem;
          margin-bottom: 1.25rem;
        }

        /* Menu */
        .hw-menu-tabs {
          display: flex; gap: 0; margin-top: 3rem;
          border-bottom: 1px solid var(--hw-border);
        }
        .hw-menu-tab {
          font-size: 0.82rem; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--hw-fg2);
          padding: 0.75rem 1.5rem; cursor: pointer; border: none;
          background: transparent; position: relative; transition: color 0.3s ease;
        }
        .hw-menu-tab.active { color: var(--hw-accent); }
        .hw-menu-tab.active::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
          height: 1px; background: var(--hw-accent);
        }
        .hw-menu-tab:hover { color: var(--hw-fg); }
        .hw-menu-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem; margin-top: 2.5rem;
        }
        .hw-menu-card {
          background: var(--hw-card); border: 1px solid var(--hw-border);
          border-radius: 2px; overflow: hidden;
          transition: all 0.4s ease;
        }
        .hw-menu-card:hover {
          background: var(--hw-card-hover);
          border-color: var(--hw-accent);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px -20px rgba(200,147,90,0.2);
        }
        .hw-menu-card-img {
          width: 100%; aspect-ratio: 16/9; object-fit: cover;
          transition: transform 0.6s ease;
        }
        .hw-menu-card:hover .hw-menu-card-img { transform: scale(1.04); }
        .hw-menu-card-img-wrap { overflow: hidden; }
        .hw-menu-card-body { padding: 1.5rem; }
        .hw-menu-card-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .hw-menu-card-name {
          font-size: 1rem; font-weight: 500; color: var(--hw-fg); line-height: 1.3;
        }
        .hw-menu-card-price {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; color: var(--hw-accent); font-weight: 600;
          white-space: nowrap; margin-left: 1rem;
        }
        .hw-menu-card-desc {
          font-size: 0.85rem; color: var(--hw-fg2); line-height: 1.6; margin-bottom: 1rem;
        }
        .hw-menu-card-badge {
          display: inline-block; padding: 0.25rem 0.6rem;
          font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase;
          background: color-mix(in srgb, var(--hw-accent) 15%, transparent);
          color: var(--hw-accent); border: 1px solid var(--hw-accent);
          border-radius: 1rem;
        }

        /* Process */
        .hw-process-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 2px; margin-top: 4rem;
        }
        @media (max-width: 900px) { .hw-process-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .hw-process-grid { grid-template-columns: 1fr; } }
        .hw-process-step {
          padding: 3rem 2rem; border: 1px solid var(--hw-border);
          position: relative; transition: all 0.4s ease;
          background: var(--hw-card);
        }
        .hw-process-step:hover { background: var(--hw-card-hover); border-color: var(--hw-accent); }
        .hw-process-step-num {
          font-size: 0.7rem; letter-spacing: 0.2em; color: var(--hw-accent);
          text-transform: uppercase; margin-bottom: 2rem; display: block;
        }
        .hw-process-step-icon {
          width: 40px; height: 40px;
          color: var(--hw-accent); margin-bottom: 1.5rem;
        }
        .hw-process-step-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem; font-weight: 400; color: var(--hw-fg);
          margin-bottom: 0.25rem;
        }
        .hw-process-step-sub {
          font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--hw-accent); margin-bottom: 1rem;
        }
        .hw-process-step-desc {
          font-size: 0.88rem; color: var(--hw-fg2); line-height: 1.7;
        }
        .hw-process-step-arrow {
          position: absolute; top: 2rem; right: 2rem;
          color: var(--hw-fg3); transition: all 0.3s ease;
        }
        .hw-process-step:hover .hw-process-step-arrow { color: var(--hw-accent); transform: translate(3px,-3px); }

        /* Testimonials */
        .hw-testi-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem; margin-top: 3rem;
        }
        @media (max-width: 700px) { .hw-testi-grid { grid-template-columns: 1fr; } }
        .hw-testi-card {
          background: var(--hw-card); border: 1px solid var(--hw-border);
          padding: 2rem; border-radius: 2px; transition: all 0.4s ease;
        }
        .hw-testi-card:hover { border-color: var(--hw-accent); background: var(--hw-card-hover); }
        .hw-testi-stars { display: flex; gap: 3px; margin-bottom: 1rem; }
        .hw-testi-text {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; color: var(--hw-fg); line-height: 1.7;
          font-style: italic; margin-bottom: 1.5rem;
        }
        .hw-testi-text::before { content: '"'; }
        .hw-testi-text::after { content: '"'; }
        .hw-testi-name { font-size: 0.88rem; font-weight: 500; color: var(--hw-fg); }
        .hw-testi-role { font-size: 0.78rem; color: var(--hw-fg2); margin-top: 0.15rem; }

        /* Locations */
        .hw-locations-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem; margin-top: 3rem;
        }
        @media (max-width: 700px) { .hw-locations-grid { grid-template-columns: 1fr; } }
        .hw-location-card {
          border: 1px solid var(--hw-border); background: var(--hw-card);
          overflow: hidden; transition: all 0.4s ease;
        }
        .hw-location-card:hover { border-color: var(--hw-accent); }
        .hw-location-card:hover .hw-location-img { transform: scale(1.04); }
        .hw-location-img-wrap { overflow: hidden; aspect-ratio: 16/9; }
        .hw-location-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .hw-location-body { padding: 2rem; }
        .hw-location-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem; color: var(--hw-fg); margin-bottom: 1.25rem;
        }
        .hw-location-detail {
          display: flex; align-items: flex-start; gap: 0.75rem;
          margin-bottom: 0.75rem; font-size: 0.88rem; color: var(--hw-fg2);
        }
        .hw-location-detail-icon { color: var(--hw-accent); margin-top: 2px; flex-shrink: 0; }

        /* CTA */
        .hw-cta-section {
          position: relative; overflow: hidden;
          padding: clamp(6rem, 12vh, 10rem) clamp(1.5rem, 5vw, 4rem);
          text-align: center;
          background-image: url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=2000&q=80');
          background-size: cover; background-position: center; background-attachment: fixed;
        }
        .hw-cta-overlay {
          position: absolute; inset: 0;
          background: color-mix(in srgb, var(--hw-bg) 80%, transparent);
        }
        .hw-cta-content { position: relative; z-index: 2; }
        .hw-cta-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 400; line-height: 1.1; letter-spacing: -0.02em;
          color: var(--hw-fg); margin-bottom: 1.5rem;
        }
        .hw-cta-heading em { font-style: italic; color: var(--hw-accent); }
        .hw-cta-sub { font-size: 1rem; color: var(--hw-fg2); margin-bottom: 2.5rem; }

        /* Footer */
        .hw-footer {
          border-top: 1px solid var(--hw-border);
          padding: clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem);
          background: var(--hw-bg2);
        }
        .hw-footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
        }
        @media (max-width: 900px) { .hw-footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        @media (max-width: 500px) { .hw-footer-grid { grid-template-columns: 1fr; } }
        .hw-footer-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem; font-weight: 600; color: var(--hw-fg);
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;
        }
        .hw-footer-brand-desc { font-size: 0.88rem; color: var(--hw-fg2); line-height: 1.7; max-width: 280px; }
        .hw-footer-social { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
        .hw-footer-heading {
          font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--hw-accent); margin-bottom: 1.25rem; font-weight: 500;
        }
        .hw-footer-link {
          display: block; font-size: 0.88rem; color: var(--hw-fg2);
          text-decoration: none; margin-bottom: 0.6rem;
          transition: color 0.3s ease;
        }
        .hw-footer-link:hover { color: var(--hw-accent); }
        .hw-footer-bottom {
          border-top: 1px solid var(--hw-border); margin-top: 3rem; padding-top: 2rem;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.78rem; color: var(--hw-fg3); flex-wrap: wrap; gap: 1rem;
        }
        .hw-line-reveal { transform-origin: left; }

        /* Divider line */
        .hw-divider {
          height: 1px; background: var(--hw-border);
          margin: 0 clamp(1.5rem, 5vw, 4rem);
        }

        /* Quantity picker */
        .hw-qty-row {
          display: flex; align-items: center; gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .hw-qty-btn {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid var(--hw-border); background: transparent;
          color: var(--hw-fg2); display: flex; align-items: center;
          justify-content: center; cursor: pointer; transition: all 0.2s ease;
        }
        .hw-qty-btn:hover { border-color: var(--hw-accent); color: var(--hw-accent); }
        .hw-qty-num { font-size: 0.9rem; font-weight: 500; min-width: 24px; text-align: center; }
      `}</style>

      {/* ── Custom Cursor ───────────────────────────────────────────────── */}
      <div className="hw-cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className="hw-cursor-ring" style={{ left: cursorRing.x, top: cursorRing.y }} />

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className={`hw-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="#" className="hw-nav-logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <Coffee size={20} style={{ color: 'var(--hw-accent)' }} />
          H&amp;W Coffee
        </a>

        <div className="hw-nav-links">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="hw-nav-link"
              onClick={e => { e.preventDefault(); smoothScroll(link.href) }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hw-nav-actions">
          <button className="hw-icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="hw-cta-btn hw-nav-cta-desktop" onClick={() => smoothScroll('#contact')}>
            Order Now <ArrowRight size={14} />
          </button>
          <button
            className={`hw-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ─────────────────────────────────────────────────── */}
      <div className={`hw-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
          <button className="hw-icon-btn" onClick={() => setMenuOpen(false)} style={{ width: 44, height: 44 }}>
            <X size={20} />
          </button>
        </div>
        {NAV_LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            className="hw-mobile-nav-link"
            onClick={e => { e.preventDefault(); smoothScroll(link.href) }}
          >
            {link.label}
          </a>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button className="hw-cta-btn" onClick={() => smoothScroll('#contact')}>
            Order Now <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="hw-hero" ref={heroRef} className="hw-hero">
        <div className="hw-hero-img" />
        <div className="hw-hero-content">
          <div className="hw-hero-tag">
            <Coffee size={12} />
            Specialty Coffee — Est. 2016
          </div>
          <h1>
            <span className="hw-hero-line">Every sip,</span>
            <span className="hw-hero-line"><em>a story</em> worth</span>
            <span className="hw-hero-line">telling.</span>
          </h1>
          <p className="hw-hero-sub">
            Artisan brews from direct-trade farms. Small-batch roasted in-house.
            Served with intention, in a space built for presence.
          </p>
          <div className="hw-hero-cta">
            <button className="hw-cta-btn" onClick={() => smoothScroll('#menu')}>
              Explore Menu <ArrowRight size={14} />
            </button>
            <button className="hw-cta-btn hw-cta-btn-ghost" onClick={() => smoothScroll('#story')}>
              Our Story
            </button>
          </div>
        </div>
        <div className="hw-scroll-hint">
          <ChevronDown size={14} />
          Scroll
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div id="hw-stats" className="hw-stats">
        {STATS.map((s, i) => (
          <div key={i} className="hw-stat-item">
            <span className="hw-stat-num">{s.num}</span>
            <span className="hw-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Marquee ─────────────────────────────────────────────────────── */}
      <div className="hw-marquee-wrap">
        <div className="hw-marquee-track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className={`hw-marquee-word${w === '·' ? ' dot' : ''}`}>{w}</span>
          ))}
        </div>
      </div>

      {/* ── Story ───────────────────────────────────────────────────────── */}
      <section id="story" className="hw-section" style={{ background: 'var(--hw-bg)', maxWidth: 1400, margin: '0 auto' }}>
        <div className="hw-story-label hw-section-label">About H&amp;W</div>
        <h2 className="hw-section-heading hw-story-heading">
          <span>Built on the </span>
          <span><em>belief</em> that </span>
          <span>coffee can </span>
          <span>mean more.</span>
        </h2>
        <div className="hw-story-grid">
          <div className="hw-story-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80"
              alt="H&W Coffee interior"
            />
            <div className="hw-story-img-badge">Makati Flagship — 2016</div>
          </div>
          <div className="hw-story-body">
            <p>
              H&amp;W Coffee started with a simple conviction: that the coffee people drink every day deserves the same care and attention as any fine ingredient. We opened our doors in Makati in 2016 with a single espresso bar, two pour-over stations, and an unyielding belief in the bean.
            </p>
            <p>
              Today, we source from over eight origins across Africa, Latin America, and Southeast Asia — working directly with farmers who share our commitment to quality, sustainability, and fair compensation. Every relationship we build upstream is one you taste in your cup.
            </p>
            <p>
              We roast small-batch in our production facility, tuning each profile to the specific character of each lot. Light and transparent for our single origins. Rich and round for our blends. Never hiding behind dark roast.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="hw-cta-btn" onClick={() => smoothScroll('#process')}>
                How We Work <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="hw-divider hw-line-reveal" />

      {/* ── Menu ────────────────────────────────────────────────────────── */}
      <section id="menu" className="hw-section" style={{ background: 'var(--hw-bg2)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="hw-section-label">What We Serve</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="hw-section-heading">
              <span>The </span><em><span>menu.</span></em>
            </h2>
            <p style={{ color: 'var(--hw-fg2)', fontSize: '0.9rem', maxWidth: 280, lineHeight: 1.7 }}>
              Every item is seasonal, intentional, and made to complement the coffee you're drinking.
            </p>
          </div>
          <div className="hw-menu-tabs">
            {MENU_ITEMS.map(cat => (
              <button
                key={cat.category}
                className={`hw-menu-tab${activeCategory === cat.category ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat.category)}
              >
                {cat.category}
              </button>
            ))}
          </div>
          <div className="hw-menu-grid">
            {activeItems.map((item, i) => (
              <MenuCard key={`${activeCategory}-${i}`} item={item} />
            ))}
          </div>
        </div>
      </section>

      <div className="hw-divider hw-line-reveal" />

      {/* ── Process ─────────────────────────────────────────────────────── */}
      <section id="process" className="hw-section" style={{ background: 'var(--hw-bg)', maxWidth: 1400, margin: '0 auto' }}>
        <div className="hw-section-label">From Farm to Cup</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'end' }}>
          <h2 className="hw-section-heading">
            <span>The </span><span><em>craft</em> behind</span>
            <span> your cup.</span>
          </h2>
          <p style={{ color: 'var(--hw-fg2)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            There are four steps between the farmer's hands and yours. At each one, someone at H&amp;W has made a deliberate choice — so that you taste the coffee at its absolute best.
          </p>
        </div>
        <div className="hw-process-grid" style={{ marginTop: '3rem' }}>
          {PROCESS_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="hw-process-step">
                <span className="hw-process-step-num">{step.num}</span>
                <Icon className="hw-process-step-icon" size={36} />
                <div className="hw-process-step-title">{step.title}</div>
                <div className="hw-process-step-sub">{step.sub}</div>
                <p className="hw-process-step-desc">{step.desc}</p>
                <ArrowUpRight className="hw-process-step-arrow" size={18} />
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Full-width image break ───────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 'clamp(300px, 50vh, 500px)', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=2000&q=80"
          alt="Coffee roasting"
          style={{ width: '100%', height: '120%', objectFit: 'cover', objectPosition: 'center', marginTop: '-10%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, color-mix(in srgb, var(--hw-bg) 70%, transparent), transparent 60%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 'clamp(1.5rem, 5vw, 4rem)', transform: 'translateY(-50%)' }}>
          <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--hw-fg)', fontStyle: 'italic', maxWidth: 400, lineHeight: 1.3 }}>
            "We don't roast dark to hide flaws. We roast to reveal character."
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--hw-accent)' }}>
            — H&amp;W Roastery Team
          </p>
        </div>
      </div>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section id="hw-testimonials" className="hw-section" style={{ background: 'var(--hw-bg2)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="hw-section-label">What People Say</div>
          <h2 className="hw-section-heading">
            <span>Heard at the </span><em><span>bar.</span></em>
          </h2>
          <div className="hw-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="hw-testi-card">
                <div className="hw-testi-stars">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} size={12} fill="var(--hw-accent)" color="var(--hw-accent)" />
                  ))}
                </div>
                <p className="hw-testi-text">{t.text}</p>
                <div className="hw-testi-name">{t.name}</div>
                <div className="hw-testi-role">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hw-divider hw-line-reveal" />

      {/* ── Locations ───────────────────────────────────────────────────── */}
      <section id="visits" className="hw-section" style={{ background: 'var(--hw-bg)', maxWidth: 1400, margin: '0 auto' }}>
        <div className="hw-section-label">Find Us</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="hw-section-heading">
            <span>Come see us</span>
            <span> <em>in person.</em></span>
          </h2>
          <p style={{ color: 'var(--hw-fg2)', fontSize: '0.9rem', maxWidth: 280, lineHeight: 1.7 }}>
            Both locations are designed to be places you stay — not just pass through.
          </p>
        </div>
        <div className="hw-locations-grid">
          {LOCATIONS.map((loc, i) => (
            <div key={i} className="hw-location-card">
              <div className="hw-location-img-wrap">
                <img src={loc.img} alt={loc.name} className="hw-location-img" />
              </div>
              <div className="hw-location-body">
                <div className="hw-location-name">{loc.name}</div>
                <div className="hw-location-detail">
                  <MapPin size={15} className="hw-location-detail-icon" />
                  <span>{loc.address}</span>
                </div>
                <div className="hw-location-detail">
                  <Clock size={15} className="hw-location-detail-icon" />
                  <span>{loc.hours}</span>
                </div>
                <div className="hw-location-detail">
                  <Phone size={15} className="hw-location-detail-icon" />
                  <span>{loc.phone}</span>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <button className="hw-cta-btn hw-cta-btn-ghost">
                    Get Directions <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section id="hw-cta" className="hw-cta-section">
        <div className="hw-cta-overlay" />
        <div className="hw-cta-content">
          <h2 className="hw-cta-heading hw-cta-heading">
            Your next great<br /><em>cup</em> is waiting.
          </h2>
          <p className="hw-cta-sub">
            Walk in, order online, or follow us for daily roast updates.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="hw-cta-btn" onClick={() => smoothScroll('#contact')}>
              Contact Us <ArrowRight size={14} />
            </button>
            <button className="hw-cta-btn hw-cta-btn-ghost" onClick={() => smoothScroll('#menu')}>
              View Full Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── Contact ─────────────────────────────────────────────────────── */}
      <section id="contact" className="hw-section" style={{ background: 'var(--hw-bg)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          <div>
            <div className="hw-section-label">Get In Touch</div>
            <h2 className="hw-section-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              <span>We'd love </span><span><em>to hear</em></span>
              <span> from you.</span>
            </h2>
            <p style={{ color: 'var(--hw-fg2)', lineHeight: 1.7, marginTop: '1.5rem', fontSize: '0.95rem' }}>
              For wholesale inquiries, event bookings, press, or just to say hello — reach out below or send us an email.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="hw-location-detail">
                <Mail size={16} className="hw-location-detail-icon" />
                <span style={{ color: 'var(--hw-fg2)' }}>hello@hwcoffee.ph</span>
              </div>
              <div className="hw-location-detail">
                <Phone size={16} className="hw-location-detail-icon" />
                <span style={{ color: 'var(--hw-fg2)' }}>+63 2 8123 4567</span>
              </div>
              <div className="hw-location-detail">
                <Instagram size={16} className="hw-location-detail-icon" />
                <span style={{ color: 'var(--hw-fg2)' }}>@hwcoffee.ph</span>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="hw-footer">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="hw-footer-grid">
            <div>
              <div className="hw-footer-brand-name">
                <Coffee size={20} style={{ color: 'var(--hw-accent)' }} />
                H&amp;W Coffee
              </div>
              <p className="hw-footer-brand-desc">
                Specialty coffee roasted and served with intention. Makati City, Philippines.
              </p>
              <div className="hw-footer-social">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <button key={i} className="hw-icon-btn" aria-label="Social link">
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="hw-footer-heading">Navigate</div>
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} className="hw-footer-link" onClick={e => { e.preventDefault(); smoothScroll(l.href) }}>
                  {l.label}
                </a>
              ))}
            </div>
            <div>
              <div className="hw-footer-heading">Locations</div>
              <p className="hw-footer-link" style={{ cursor: 'default' }}>12 Dela Rosa St., Makati</p>
              <p className="hw-footer-link" style={{ cursor: 'default' }}>5th Ave, BGC, Taguig</p>
              <div style={{ marginTop: '1rem' }}>
                <div className="hw-footer-heading">Hours</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--hw-fg2)', lineHeight: 1.6 }}>
                  Mon–Fri: 7AM–9PM<br />
                  Sat–Sun: 8AM–10PM
                </p>
              </div>
            </div>
            <div>
              <div className="hw-footer-heading">Contact</div>
              <a href="mailto:hello@hwcoffee.ph" className="hw-footer-link">hello@hwcoffee.ph</a>
              <a href="tel:+6328123456" className="hw-footer-link">+63 2 8123 4567</a>
              <a href="#" className="hw-footer-link">@hwcoffee.ph</a>
              <div style={{ marginTop: '1rem' }}>
                <div className="hw-footer-heading">Newsletter</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="email" placeholder="your@email.com"
                    style={{
                      flex: 1, background: 'var(--hw-card)', border: '1px solid var(--hw-border)',
                      color: 'var(--hw-fg)', padding: '0.5rem 0.75rem', fontSize: '0.82rem',
                      outline: 'none', borderRadius: 0,
                    }}
                  />
                  <button className="hw-cta-btn" style={{ padding: '0.5rem 0.75rem', borderRadius: 0, whiteSpace: 'nowrap' }}>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="hw-footer-bottom">
            <span>© 2026 H&amp;W Coffee — All Rights Reserved</span>
            <span>Designed with intention. Served with care.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Menu Card Sub-component ───────────────────────────────────────────────────
const MenuCard = ({ item }: { item: typeof MENU_ITEMS[0]['items'][0] }) => {
  const [qty, setQty] = useState(1)
  return (
    <div className="hw-menu-card">
      <div className="hw-menu-card-img-wrap">
        <img src={item.img} alt={item.name} className="hw-menu-card-img" />
      </div>
      <div className="hw-menu-card-body">
        <div className="hw-menu-card-top">
          <div className="hw-menu-card-name">{item.name}</div>
          <div className="hw-menu-card-price">{item.price}</div>
        </div>
        <p className="hw-menu-card-desc">{item.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          {item.badge && <span className="hw-menu-card-badge">{item.badge}</span>}
          <div className="hw-qty-row" style={{ marginTop: 0, marginLeft: item.badge ? 'auto' : 0 }}>
            <button className="hw-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={11} /></button>
            <span className="hw-qty-num">{qty}</span>
            <button className="hw-qty-btn" onClick={() => setQty(q => q + 1)}><Plus size={11} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Contact Form Sub-component ────────────────────────────────────────────────
const ContactForm = () => {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--hw-card)',
    border: '1px solid var(--hw-border)', color: 'var(--hw-fg)',
    padding: '0.85rem 1rem', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'inherit', borderRadius: 0, marginBottom: '1rem',
    transition: 'border-color 0.3s ease',
  }

  if (sent) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: '1rem', border: '1px solid var(--hw-border)', padding: '3rem', textAlign: 'center' }}>
      <Coffee size={32} style={{ color: 'var(--hw-accent)' }} />
      <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: 'var(--hw-fg)' }}>Message received.</h3>
      <p style={{ color: 'var(--hw-fg2)', fontSize: '0.9rem' }}>We'll get back to you within one business day. In the meantime — get a coffee.</p>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
        <input
          style={inputStyle} placeholder="Your Name" value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        />
        <input
          style={inputStyle} placeholder="Email Address" type="email" value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
        />
      </div>
      <input
        style={inputStyle} placeholder="Subject" value={form.subject}
        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
      />
      <textarea
        style={{ ...inputStyle, height: 160, resize: 'vertical' }}
        placeholder="Your message..."
        value={form.message}
        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
      />
      <button className="hw-cta-btn" onClick={handleSubmit} style={{ borderRadius: 0 }}>
        Send Message <ArrowRight size={14} />
      </button>
    </div>
  )
}

/* @arkzen:web:page:index:end */
