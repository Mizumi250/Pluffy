'use client'
// ============================================================
// ARKZEN GENERATED PAGE — hw-coffee/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:19.572Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FEATURES, LOCATIONS, MARQUEE_WORDS, MENU_ITEMS, NAV_LINKS, PROCESS_STEPS, STATS, TESTIMONIALS } from './components/constants'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ArrowUpRight, Award, Camera, Camera as Instagram, ChevronDown, CirclePlay as Youtube, Clock, Coffee, ExternalLink, Heart, Leaf, Mail, MapPin, Menu, Minus, Moon, Music, Phone, Plus, Quote, Send as Twitter, Star, Sun, UsersRound as Facebook, Utensils, Wifi, X, Zap } from 'lucide-react'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const [dark, setDark] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Signature')
  const [scrolled, setScrolled] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 })
  const [cursorRing, setCursorRing] = useState({ x: -200, y: -200 })
  const [cursorHover, setCursorHover] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
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
    const saved = localStorage.getItem('hw-theme')
    if (saved) setDark(saved === 'dark')
  }, [])
  useEffect(() => {
    localStorage.setItem('hw-theme', dark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-hw-theme', dark ? 'dark' : 'light')
  }, [dark])

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
  }, [])

  // ── Scroll ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── GSAP Animations ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pageLoaded) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // ── Hero entrance ──────────────────────────────────────────────────────
      const heroTL = gsap.timeline({ delay: 0.1 })
      heroTL
        .fromTo('.hw-hero-tag', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo('.hw-hero-line', { y: 110, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.13, ease: 'power4.out' }, '-=0.3')
        .fromTo('.hw-hero-sub', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=0.5')
        .fromTo('.hw-hero-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .fromTo('.hw-scroll-hint', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.3')
        .fromTo('.hw-hero-badge', { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.4)' }, '-=0.8')
        .fromTo('.hw-hero-cup',
          { y: 140, x: 40, opacity: 0, scale: 0.75, rotation: 4 },
          { y: 0, x: 0, opacity: 1, scale: 1, rotation: -8, duration: 1.3, ease: 'power3.out' },
          '-=0.9'
        )

      // ── Hero parallax ──────────────────────────────────────────────────────
      gsap.to('.hw-hero-img', {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: { trigger: '#hw-hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
      })

      // ── Hero cup parallax ────────────────────────────────────────────────────
      gsap.fromTo('.hw-hero-cup',
        { yPercent: 0, rotation: -8 },
        { yPercent: -16, rotation: -3, ease: 'none',
          scrollTrigger: { trigger: '#hw-hero', start: 'top top', end: 'bottom top', scrub: 1.5 } }
      )

      // ── Nav reveal ────────────────────────────────────────────────────────
      gsap.fromTo('.hw-nav', { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 })

      // ── Stats ─────────────────────────────────────────────────────────────
      gsap.fromTo('.hw-stat-item',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#hw-stats', start: 'top 82%' } }
      )

      // ── Features bar ──────────────────────────────────────────────────────
      gsap.fromTo('.hw-feature-item',
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)',
          scrollTrigger: { trigger: '.hw-features-bar', start: 'top 85%' } }
      )

      // ── Story section ─────────────────────────────────────────────────────
      gsap.fromTo('.hw-section-label',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '#story', start: 'top 82%' } }
      )
      gsap.fromTo('.hw-story-heading .hw-split',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.07, ease: 'power4.out',
          scrollTrigger: { trigger: '#story', start: 'top 78%' } }
      )
      gsap.fromTo('.hw-story-body',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#story', start: 'top 70%' } }
      )
      gsap.fromTo('.hw-story-img-wrap',
        { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
        { clipPath: 'inset(0% 0 0 0)', opacity: 1, duration: 1.3, ease: 'power4.inOut',
          scrollTrigger: { trigger: '#story', start: 'top 72%' } }
      )

      // ── Quote strip ───────────────────────────────────────────────────────
      gsap.fromTo('.hw-quote-inner',
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.hw-quote-strip', start: 'top 82%' } }
      )

      // ── Process steps ─────────────────────────────────────────────────────
      gsap.fromTo('.hw-process-step',
        { y: 70, opacity: 0, rotationX: 8 },
        { y: 0, opacity: 1, rotationX: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out',
          scrollTrigger: { trigger: '#process', start: 'top 76%' } }
      )

      // ── Menu cards ────────────────────────────────────────────────────────
      gsap.fromTo('.hw-menu-card',
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#menu', start: 'top 72%' } }
      )

      // ── Full-width image parallax ──────────────────────────────────────────
      gsap.to('.hw-fullwidth-img', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.hw-fullwidth-wrap', start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      // ── Testimonial cards ─────────────────────────────────────────────────
      gsap.fromTo('.hw-testi-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#hw-testimonials', start: 'top 76%' } }
      )

      // ── Location cards ────────────────────────────────────────────────────
      gsap.fromTo('.hw-location-card',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, stagger: 0.18, ease: 'power3.out',
          scrollTrigger: { trigger: '#visits', start: 'top 76%' } }
      )

      // ── CTA ───────────────────────────────────────────────────────────────
      gsap.fromTo('.hw-cta-heading',
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
          scrollTrigger: { trigger: '#hw-cta', start: 'top 80%' } }
      )
      gsap.fromTo('.hw-cta-btns',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#hw-cta', start: 'top 75%' } }
      )

      // ── Contact ───────────────────────────────────────────────────────────
      gsap.fromTo('.hw-contact-left',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#contact', start: 'top 76%' } }
      )
      gsap.fromTo('.hw-contact-right',
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#contact', start: 'top 76%' } }
      )

      // ── Line reveals ──────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.hw-line-reveal').forEach(el => {
        gsap.fromTo(el,
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 1.4, ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 88%' } }
        )
      })

      // ── Number count-up effect ────────────────────────────────────────────
      document.querySelectorAll<HTMLElement>('.hw-stat-num[data-target]').forEach(el => {
        const target = el.getAttribute('data-target') || ''
        const isText = isNaN(parseFloat(target))
        if (!isText) {
          const end = parseFloat(target)
          gsap.fromTo({ val: 0 }, { val: end },
            { duration: 1.5, ease: 'power2.out', delay: 0.3,
              onUpdate: function() { el.textContent = Math.round((this as any)._targets[0].val).toString() },
              scrollTrigger: { trigger: '#hw-stats', start: 'top 82%' } }
          )
        }
      })

    }, pageRef)
    return () => ctx.revert()
  }, [pageLoaded])

  const smoothScroll = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const activeItems = MENU_ITEMS.find(c => c.category === activeCategory)?.items ?? []

  // ── Theme CSS Variables ──────────────────────────────────────────────────────
  const themeVars = dark
    ? {
        '--hw-bg': '#080705',
        '--hw-bg2': '#0f0e0b',
        '--hw-bg3': '#181510',
        '--hw-fg': '#f0ebe0',
        '--hw-fg2': '#9a8870',
        '--hw-fg3': '#4a3f30',
        '--hw-accent': '#c8935a',
        '--hw-accent2': '#e2aa78',
        '--hw-accent3': '#6b3a1f',
        '--hw-border': 'rgba(200,147,90,0.12)',
        '--hw-border2': 'rgba(200,147,90,0.25)',
        '--hw-card': 'rgba(255,255,255,0.025)',
        '--hw-card-hover': 'rgba(255,255,255,0.055)',
        '--hw-loader-bg': '#080705',
      }
    : {
        '--hw-bg': '#faf6f0',
        '--hw-bg2': '#f3ede4',
        '--hw-bg3': '#ece3d6',
        '--hw-fg': '#18100a',
        '--hw-fg2': '#6b5040',
        '--hw-fg3': '#b09070',
        '--hw-accent': '#9b5e2a',
        '--hw-accent2': '#bf7a3a',
        '--hw-accent3': '#fce8d5',
        '--hw-border': 'rgba(155,94,42,0.18)',
        '--hw-border2': 'rgba(155,94,42,0.3)',
        '--hw-card': 'rgba(0,0,0,0.025)',
        '--hw-card-hover': 'rgba(0,0,0,0.055)',
        '--hw-loader-bg': '#faf6f0',
      }

  return (
    <div
      ref={pageRef}
      style={{
        ...themeVars as React.CSSProperties,
        background: 'var(--hw-bg)',
        color: 'var(--hw-fg)',
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
        ::-webkit-scrollbar-track { background: var(--hw-bg); }
        ::-webkit-scrollbar-thumb { background: var(--hw-accent); border-radius: 2px; }

        /* Page Loader */
        .hw-loader {
          position: fixed; inset: 0; z-index: 9999;
          background: var(--hw-loader-bg);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 2rem;
          transition: opacity 0.6s ease, visibility 0.6s ease;
        }
        .hw-loader.gone { opacity: 0; visibility: hidden; pointer-events: none; }
        .hw-loader-logo {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem; font-weight: 600; color: var(--hw-fg);
          display: flex; align-items: center; gap: 0.6rem;
          letter-spacing: -0.02em;
        }
        .hw-loader-logo span { color: var(--hw-accent); }
        .hw-loader-bar-wrap {
          width: 200px; height: 1px;
          background: var(--hw-border);
          overflow: hidden;
        }
        .hw-loader-bar {
          height: 100%; background: var(--hw-accent);
          transition: width 0.1s ease;
        }
        .hw-loader-pct {
          font-size: 0.72rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--hw-fg3);
        }

        /* Custom cursor */
        .hw-cursor-dot {
          position: fixed; width: 6px; height: 6px; border-radius: 50%;
          background: var(--hw-accent); pointer-events: none; z-index: 9997;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease, opacity 0.2s ease;
          mix-blend-mode: exclusion;
        }
        .hw-cursor-ring {
          position: fixed; border-radius: 50%;
          border: 1px solid var(--hw-accent); pointer-events: none; z-index: 9996;
          transform: translate(-50%, -50%);
          transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
          opacity: 0.5;
        }
        .hw-cursor-ring.normal { width: 36px; height: 36px; }
        .hw-cursor-ring.hover { width: 56px; height: 56px; opacity: 0.3; }

        /* Nav */
        .hw-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          height: 72px;
          transition: background 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease;
          border-bottom: 1px solid transparent;
          opacity: 0;
        }
        .hw-nav.scrolled {
          background: color-mix(in srgb, var(--hw-bg) 88%, transparent);
          backdrop-filter: blur(24px) saturate(200%);
          border-bottom-color: var(--hw-border);
        }
        .hw-nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem; font-weight: 600;
          letter-spacing: -0.02em; color: var(--hw-fg);
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none; cursor: pointer;
          transition: color 0.3s ease;
        }
        .hw-nav-logo:hover { color: var(--hw-accent); }
        .hw-nav-links { display: flex; align-items: center; gap: 2.5rem; }
        .hw-nav-link {
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--hw-fg2); text-decoration: none;
          position: relative; transition: color 0.3s ease; cursor: pointer;
        }
        .hw-nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
          height: 1px; background: var(--hw-accent);
          transform: scaleX(0); transform-origin: right; transition: transform 0.35s ease;
        }
        .hw-nav-link:hover { color: var(--hw-fg); }
        .hw-nav-link:hover::after { transform: scaleX(1); transform-origin: left; }
        .hw-nav-actions { display: flex; align-items: center; gap: 0.75rem; }
        .hw-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid var(--hw-border); background: transparent;
          color: var(--hw-fg2); cursor: pointer;
          transition: all 0.3s ease;
        }
        .hw-icon-btn:hover { border-color: var(--hw-accent); color: var(--hw-accent); background: color-mix(in srgb, var(--hw-accent) 8%, transparent); }
        .hw-cta-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.5rem; border-radius: 2px;
          background: var(--hw-accent); color: #fff;
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.07em;
          text-transform: uppercase; text-decoration: none; border: none; cursor: pointer;
          transition: all 0.35s ease; position: relative; overflow: hidden;
        }
        .hw-cta-btn::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0.12);
          transform: translateX(-100%); transition: transform 0.4s ease;
        }
        .hw-cta-btn:hover::before { transform: translateX(0); }
        .hw-cta-btn:hover { background: var(--hw-accent2); transform: translateY(-1px); box-shadow: 0 8px 30px -8px rgba(200,147,90,0.5); }
        .hw-cta-btn-ghost {
          background: transparent; color: var(--hw-fg);
          border: 1px solid var(--hw-border);
        }
        .hw-cta-btn-ghost::before { background: color-mix(in srgb, var(--hw-accent) 12%, transparent); }
        .hw-cta-btn-ghost:hover { border-color: var(--hw-accent); color: var(--hw-accent); background: transparent; box-shadow: 0 8px 30px -8px rgba(200,147,90,0.2); }

        /* Hamburger */
        .hw-hamburger {
          display: none; flex-direction: column; gap: 6px;
          width: 30px; cursor: pointer; background: none; border: none; padding: 4px;
        }
        .hw-hamburger span {
          display: block; width: 100%; height: 1px; background: var(--hw-fg);
          transition: all 0.45s cubic-bezier(0.77,0,0.175,1);
        }
        .hw-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hw-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .hw-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        @media (max-width: 768px) {
          .hw-nav-links, .hw-nav-cta-desktop { display: none; }
          .hw-hamburger { display: flex; }
        }

        /* Mobile menu */
        .hw-mobile-menu {
          position: fixed; inset: 0; z-index: 600;
          background: var(--hw-bg); display: flex; flex-direction: column;
          padding: 1.5rem clamp(1.5rem, 5vw, 4rem) 3rem;
          transform: translateX(100%);
          transition: transform 0.55s cubic-bezier(0.77,0,0.175,1);
        }
        .hw-mobile-menu.open { transform: translateX(0); }
        .hw-mobile-menu-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 3rem; padding-top: 0.5rem;
        }
        .hw-mobile-nav-link {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 7vw, 4rem); font-weight: 400;
          color: var(--hw-fg); text-decoration: none;
          display: flex; align-items: center; justify-content: space-between;
          line-height: 1.1; cursor: pointer;
          transition: color 0.3s ease, padding-left 0.3s ease;
          border-bottom: 1px solid var(--hw-border); padding: 0.9rem 0;
        }
        .hw-mobile-nav-link:hover { color: var(--hw-accent); padding-left: 8px; }
        .hw-mobile-nav-num {
          font-family: 'Inter', sans-serif; font-size: 0.75rem;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--hw-accent);
        }

        /* Hero */
        #hw-hero {
          position: relative; height: 100svh; min-height: 600px;
          display: flex; align-items: flex-end;
          padding: 0 clamp(1.5rem, 5vw, 4rem) clamp(3rem, 8vh, 5.5rem);
          overflow: hidden;
        }
        .hw-hero-img {
          position: absolute; inset: -10%;
          background-image: url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=2400&q=90');
          background-size: cover; background-position: center;
          will-change: transform;
        }
        .hw-hero-img::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            color-mix(in srgb, var(--hw-bg) 85%, transparent) 0%,
            color-mix(in srgb, var(--hw-bg) 60%, transparent) 35%,
            color-mix(in srgb, var(--hw-bg) 20%, transparent) 65%,
            var(--hw-bg) 100%
          );
        }
        .hw-hero-cup {
          position: absolute;
          right: clamp(-4rem, -5vw, -1rem);
          bottom: -4%;
          z-index: 3;
          width: clamp(360px, 42vw, 680px);
          max-height: 105%;
          object-fit: contain;
          transform-origin: center bottom;
          pointer-events: none;
          will-change: transform;
          opacity: 0;
        }
        @media (max-width: 768px) {
          .hw-hero-cup { width: clamp(240px, 70vw, 440px); right: -2rem; bottom: -2%; opacity: 0.9; }
        }
        .hw-hero-content { position: relative; z-index: 2; max-width: 860px; }
        .hw-hero-tag {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.72rem; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--hw-accent);
          margin-bottom: 1.5rem; opacity: 0;
        }
        .hw-hero-tag::before {
          content: ''; display: block; width: 28px; height: 1px; background: var(--hw-accent);
        }
        .hw-hero-line {
          display: block; overflow: hidden;
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 7.5vw, 6.5rem);
          font-weight: 400; line-height: 1.0;
          letter-spacing: -0.025em; color: var(--hw-fg);
          opacity: 0;
        }
        .hw-hero-line em { font-style: italic; color: var(--hw-accent); }
        .hw-hero-sub {
          font-size: clamp(0.88rem, 1.4vw, 1rem);
          color: var(--hw-fg2); margin-top: 1.75rem;
          max-width: 440px; line-height: 1.75; opacity: 0;
        }
        .hw-hero-cta {
          display: flex; align-items: center; gap: 1rem;
          margin-top: 2.5rem; flex-wrap: wrap; opacity: 0;
        }
        .hw-hero-badge {
          position: absolute; top: clamp(5rem, 12vh, 8rem); right: clamp(1.5rem, 5vw, 4rem);
          width: 110px; height: 110px; border-radius: 50%;
          border: 1px solid var(--hw-border2);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.2rem; z-index: 2; opacity: 0;
          background: color-mix(in srgb, var(--hw-bg) 70%, transparent);
          backdrop-filter: blur(10px);
          animation: badgeSpin 20s linear infinite;
        }
        @keyframes badgeSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hw-hero-badge-inner {
          display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
          animation: badgeSpinReverse 20s linear infinite;
        }
        @keyframes badgeSpinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .hw-hero-badge-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 600; color: var(--hw-accent); line-height: 1;
        }
        .hw-hero-badge-txt {
          font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--hw-fg2); text-align: center; line-height: 1.4;
        }
        .hw-scroll-hint {
          position: absolute; bottom: 2.5rem; right: clamp(1.5rem, 5vw, 4rem);
          z-index: 2; display: flex; flex-direction: column;
          align-items: center; gap: 0.5rem;
          font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--hw-fg3); writing-mode: vertical-rl; opacity: 0;
          animation: scrollBob 2.5s ease-in-out infinite;
        }
        @keyframes scrollBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }

        /* Stats */
        #hw-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--hw-border);
          border-bottom: 1px solid var(--hw-border);
        }
        .hw-stat-item {
          padding: 2.5rem clamp(1rem, 3vw, 3rem); text-align: center;
          border-right: 1px solid var(--hw-border);
          position: relative; overflow: hidden;
        }
        .hw-stat-item:last-child { border-right: none; }
        .hw-stat-item::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, color-mix(in srgb, var(--hw-accent) 4%, transparent), transparent);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .hw-stat-item:hover::before { opacity: 1; }
        .hw-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem); font-weight: 600;
          color: var(--hw-accent); display: block;
        }
        .hw-stat-label {
          font-size: 0.72rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--hw-fg2);
          margin-top: 0.3rem; display: block;
        }
        @media (max-width: 600px) {
          #hw-stats { grid-template-columns: repeat(2, 1fr); }
          .hw-stat-item:nth-child(2) { border-right: none; }
          .hw-stat-item:nth-child(3), .hw-stat-item:nth-child(4) { border-top: 1px solid var(--hw-border); }
        }

        /* Features bar */
        .hw-features-bar {
          display: flex; align-items: center; justify-content: center;
          gap: clamp(2rem, 5vw, 5rem); flex-wrap: wrap;
          padding: 1.5rem clamp(1.5rem, 5vw, 4rem);
          border-bottom: 1px solid var(--hw-border);
          background: var(--hw-bg2);
        }
        .hw-feature-item {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--hw-fg2); font-weight: 500;
        }
        .hw-feature-item svg { color: var(--hw-accent); }

        /* Marquee */
        .hw-marquee-wrap {
          overflow: hidden;
          border-top: 1px solid var(--hw-border);
          border-bottom: 1px solid var(--hw-border);
          padding: 0.9rem 0; background: var(--hw-bg3);
        }
        .hw-marquee-track {
          display: flex; gap: 3rem; align-items: center;
          animation: marqueeScroll 35s linear infinite;
          white-space: nowrap; width: max-content;
        }
        .hw-marquee-track:hover { animation-play-state: paused; }
        @keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .hw-marquee-word {
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--hw-fg2); flex-shrink: 0;
        }
        .hw-marquee-word.dot { color: var(--hw-accent); font-size: 0.9rem; }

        /* Section layout */
        .hw-section { padding: clamp(4.5rem, 9vh, 7rem) clamp(1.5rem, 5vw, 4rem); }
        .hw-section-inner { max-width: 1400px; margin: 0 auto; }
        .hw-section-label {
          display: flex; align-items: center; gap: 0.75rem;
          font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--hw-accent); margin-bottom: 1.5rem;
        }
        .hw-section-label::before { content: ''; display: block; width: 28px; height: 1px; background: var(--hw-accent); }
        .hw-section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 4.5vw, 4rem);
          font-weight: 400; line-height: 1.1; letter-spacing: -0.02em;
        }
        .hw-section-heading .hw-split { display: inline-block; }
        .hw-section-heading em { font-style: italic; color: var(--hw-accent); }

        /* Story */
        .hw-story-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem); align-items: center; margin-top: 4rem;
        }
        @media (max-width: 768px) { .hw-story-grid { grid-template-columns: 1fr; } }
        .hw-story-img-wrap {
          position: relative; border-radius: 2px; overflow: hidden;
          aspect-ratio: 4/5; clip-path: inset(0 0 0 0);
        }
        .hw-story-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.9s ease;
        }
        .hw-story-img-wrap:hover img { transform: scale(1.05); }
        .hw-story-img-badge {
          position: absolute; bottom: 1.5rem; left: 1.5rem;
          background: var(--hw-accent); color: #fff;
          padding: 0.45rem 0.9rem; font-size: 0.68rem;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500;
        }
        .hw-story-body { display: flex; flex-direction: column; gap: 1.25rem; }
        .hw-story-body p { color: var(--hw-fg2); line-height: 1.85; font-size: 0.97rem; }

        /* Quote strip */
        .hw-quote-strip {
          padding: clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem);
          background: var(--hw-bg3);
          border-top: 1px solid var(--hw-border);
          border-bottom: 1px solid var(--hw-border);
        }
        .hw-quote-inner { max-width: 900px; margin: 0 auto; }
        .hw-quote-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.3rem, 2.5vw, 2rem);
          font-weight: 400; font-style: italic;
          color: var(--hw-fg); line-height: 1.55;
        }
        .hw-quote-text::before { content: '"'; color: var(--hw-accent); }
        .hw-quote-text::after { content: '"'; color: var(--hw-accent); }
        .hw-quote-attr {
          margin-top: 1rem; font-size: 0.75rem;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--hw-accent);
        }

        /* Menu */
        .hw-menu-tabs {
          display: flex; gap: 0; margin-top: 3rem;
          border-bottom: 1px solid var(--hw-border); overflow-x: auto;
          scrollbar-width: none;
        }
        .hw-menu-tabs::-webkit-scrollbar { display: none; }
        .hw-menu-tab {
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--hw-fg2);
          padding: 0.75rem 1.5rem; cursor: pointer; border: none;
          background: transparent; position: relative; transition: color 0.3s ease;
          white-space: nowrap;
        }
        .hw-menu-tab.active { color: var(--hw-accent); }
        .hw-menu-tab.active::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
          height: 1px; background: var(--hw-accent);
        }
        .hw-menu-tab:hover { color: var(--hw-fg); }
        .hw-menu-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem; margin-top: 2.5rem;
        }
        .hw-menu-card {
          background: var(--hw-card); border: 1px solid var(--hw-border);
          border-radius: 2px; overflow: hidden; transition: all 0.4s ease;
        }
        .hw-menu-card:hover {
          background: var(--hw-card-hover); border-color: var(--hw-accent);
          transform: translateY(-5px);
          box-shadow: 0 24px 60px -20px rgba(200,147,90,0.22);
        }
        .hw-menu-card-img-wrap { overflow: hidden; aspect-ratio: 4/3; }
        .hw-menu-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .hw-menu-card:hover .hw-menu-card-img { transform: scale(1.06); }
        .hw-menu-card-body { padding: 1.35rem; }
        .hw-menu-card-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 0.65rem;
        }
        .hw-menu-card-name { font-size: 0.97rem; font-weight: 500; color: var(--hw-fg); line-height: 1.3; }
        .hw-menu-card-price {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; color: var(--hw-accent); font-weight: 600;
          white-space: nowrap; margin-left: 0.75rem;
        }
        .hw-menu-card-desc { font-size: 0.82rem; color: var(--hw-fg2); line-height: 1.65; margin-bottom: 1rem; }
        .hw-menu-card-badge {
          display: inline-block; padding: 0.2rem 0.55rem;
          font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
          background: color-mix(in srgb, var(--hw-accent) 12%, transparent);
          color: var(--hw-accent); border: 1px solid var(--hw-border2); border-radius: 1rem;
        }

        /* Process */
        .hw-process-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; margin-top: 4rem;
          background: var(--hw-border);
        }
        @media (max-width: 900px) { .hw-process-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .hw-process-grid { grid-template-columns: 1fr; } }
        .hw-process-step {
          padding: 3rem 2rem; position: relative;
          transition: all 0.4s ease;
          background: var(--hw-bg); overflow: hidden;
        }
        .hw-process-step::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, color-mix(in srgb, var(--hw-accent) 6%, transparent), transparent);
          opacity: 0; transition: opacity 0.4s ease;
        }
        .hw-process-step:hover::before { opacity: 1; }
        .hw-process-step:hover { background: var(--hw-bg2); }
        .hw-process-step-num {
          font-size: 0.65rem; letter-spacing: 0.22em; color: var(--hw-accent);
          text-transform: uppercase; margin-bottom: 2rem; display: block;
        }
        .hw-process-step-icon { color: var(--hw-accent); margin-bottom: 1.5rem; }
        .hw-process-step-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.55rem; font-weight: 400; color: var(--hw-fg); margin-bottom: 0.25rem;
        }
        .hw-process-step-sub {
          font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--hw-accent); margin-bottom: 1rem;
        }
        .hw-process-step-desc { font-size: 0.85rem; color: var(--hw-fg2); line-height: 1.75; }
        .hw-process-step-arrow {
          position: absolute; top: 2rem; right: 2rem; color: var(--hw-fg3);
          transition: all 0.35s ease;
        }
        .hw-process-step:hover .hw-process-step-arrow { color: var(--hw-accent); transform: translate(4px,-4px); }

        /* Full-width image */
        .hw-fullwidth-wrap {
          position: relative; height: clamp(280px, 45vh, 480px); overflow: hidden;
        }
        .hw-fullwidth-img {
          position: absolute; inset: -10%;
          background-image: url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=2000&q=85');
          background-size: cover; background-position: center;
          will-change: transform;
        }
        .hw-fullwidth-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            color-mix(in srgb, var(--hw-bg) 75%, transparent) 0%,
            color-mix(in srgb, var(--hw-bg) 40%, transparent) 40%,
            transparent 100%
          );
        }
        .hw-fullwidth-content {
          position: absolute; top: 50%; left: clamp(1.5rem, 5vw, 4rem);
          transform: translateY(-50%); max-width: 460px;
        }

        /* Testimonials */
        .hw-testi-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem; margin-top: 3rem;
        }
        @media (max-width: 900px) { .hw-testi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .hw-testi-grid { grid-template-columns: 1fr; } }
        .hw-testi-card {
          background: var(--hw-card); border: 1px solid var(--hw-border);
          padding: 2rem; border-radius: 2px; transition: all 0.4s ease;
          position: relative;
        }
        .hw-testi-card:hover { border-color: var(--hw-accent); background: var(--hw-card-hover); transform: translateY(-3px); }
        .hw-testi-quote-icon { color: var(--hw-accent); opacity: 0.4; margin-bottom: 1rem; }
        .hw-testi-stars { display: flex; gap: 2px; margin-bottom: 0.75rem; }
        .hw-testi-text {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem; color: var(--hw-fg); line-height: 1.75;
          font-style: italic; margin-bottom: 1.5rem;
        }
        .hw-testi-name { font-size: 0.85rem; font-weight: 500; color: var(--hw-fg); }
        .hw-testi-role { font-size: 0.75rem; color: var(--hw-fg2); margin-top: 0.15rem; }

        /* Locations */
        .hw-locations-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem; margin-top: 3rem;
        }
        @media (max-width: 700px) { .hw-locations-grid { grid-template-columns: 1fr; } }
        .hw-location-card {
          border: 1px solid var(--hw-border); background: var(--hw-card);
          overflow: hidden; transition: all 0.4s ease; border-radius: 2px;
        }
        .hw-location-card:hover { border-color: var(--hw-accent); }
        .hw-location-card:hover .hw-location-img { transform: scale(1.05); }
        .hw-location-img-wrap { overflow: hidden; aspect-ratio: 16/9; position: relative; }
        .hw-location-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .hw-location-tag {
          position: absolute; top: 1rem; left: 1rem;
          background: var(--hw-accent); color: #fff;
          padding: 0.25rem 0.6rem; font-size: 0.65rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
        }
        .hw-location-body { padding: 2rem; }
        .hw-location-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; color: var(--hw-fg); margin-bottom: 1.25rem;
        }
        .hw-location-detail {
          display: flex; align-items: flex-start; gap: 0.65rem;
          margin-bottom: 0.7rem; font-size: 0.85rem; color: var(--hw-fg2);
        }
        .hw-location-detail-icon { color: var(--hw-accent); margin-top: 2px; flex-shrink: 0; }

        /* CTA */
        .hw-cta-section {
          position: relative; overflow: hidden;
          padding: clamp(6rem, 12vh, 9rem) clamp(1.5rem, 5vw, 4rem);
          text-align: center;
        }
        .hw-cta-bg {
          position: absolute; inset: -10%;
          background-image: url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=2000&q=85');
          background-size: cover; background-position: center;
        }
        .hw-cta-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--hw-bg) 55%, transparent) 0%,
            color-mix(in srgb, var(--hw-bg) 40%, transparent) 50%,
            color-mix(in srgb, var(--hw-bg) 55%, transparent) 100%
          );
        }
        .hw-cta-content { position: relative; z-index: 2; }
        .hw-cta-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5.5vw, 4.5rem);
          font-weight: 400; line-height: 1.1; letter-spacing: -0.025em;
          color: var(--hw-fg); margin-bottom: 1.25rem; opacity: 0;
        }
        .hw-cta-heading em { font-style: italic; color: var(--hw-accent); }
        .hw-cta-sub { font-size: 1rem; color: var(--hw-fg2); margin-bottom: 2.5rem; }
        .hw-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; opacity: 0; }

        /* Contact */
        .hw-contact-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem); align-items: start;
        }
        @media (max-width: 768px) { .hw-contact-grid { grid-template-columns: 1fr; } }

        /* Footer */
        .hw-footer {
          border-top: 1px solid var(--hw-border);
          padding: clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem) 2rem;
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
        .hw-footer-brand-desc { font-size: 0.85rem; color: var(--hw-fg2); line-height: 1.8; max-width: 280px; }
        .hw-footer-social { display: flex; gap: 0.65rem; margin-top: 1.5rem; }
        .hw-footer-heading {
          font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--hw-accent); margin-bottom: 1.25rem; font-weight: 500;
        }
        .hw-footer-link {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.85rem; color: var(--hw-fg2);
          text-decoration: none; margin-bottom: 0.55rem;
          transition: color 0.3s ease;
        }
        .hw-footer-link:hover { color: var(--hw-accent); }
        .hw-footer-bottom {
          border-top: 1px solid var(--hw-border); margin-top: 3rem; padding-top: 1.75rem;
          display: flex; flex-direction: column; gap: 0.75rem;
          font-size: 0.75rem; color: var(--hw-fg3);
        }
        .hw-footer-bottom-row {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 0.75rem;
        }
        .hw-footer-disclaimer {
          font-size: 0.72rem; color: var(--hw-fg3); line-height: 1.7;
          padding-top: 0.75rem; border-top: 1px solid var(--hw-border);
          font-style: italic;
        }

        /* Divider */
        .hw-divider { height: 1px; background: var(--hw-border); }
        .hw-line-reveal { transform-origin: left; }

        /* Form */
        .hw-form-input {
          width: 100%; background: var(--hw-card);
          border: 1px solid var(--hw-border); color: var(--hw-fg);
          padding: 0.85rem 1rem; font-size: 0.88rem; outline: none;
          font-family: inherit; border-radius: 2px; margin-bottom: 1rem;
          transition: border-color 0.3s ease;
        }
        .hw-form-input:focus { border-color: var(--hw-accent); }
        .hw-form-input::placeholder { color: var(--hw-fg3); }

        /* Qty picker */
        .hw-qty-row { display: flex; align-items: center; gap: 0.5rem; }
        .hw-qty-btn {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid var(--hw-border); background: transparent;
          color: var(--hw-fg2); display: flex; align-items: center;
          justify-content: center; cursor: pointer; transition: all 0.25s ease;
        }
        .hw-qty-btn:hover { border-color: var(--hw-accent); color: var(--hw-accent); }
        .hw-qty-num { font-size: 0.88rem; font-weight: 500; min-width: 22px; text-align: center; }

        /* Newsletter input */
        .hw-nl-wrap { display: flex; gap: 0; margin-top: 0.6rem; }
        .hw-nl-input {
          flex: 1; background: var(--hw-card); border: 1px solid var(--hw-border);
          border-right: none; color: var(--hw-fg); padding: 0.5rem 0.75rem;
          font-size: 0.8rem; outline: none; font-family: inherit;
          transition: border-color 0.3s ease;
        }
        .hw-nl-input:focus { border-color: var(--hw-accent); }
        .hw-nl-input::placeholder { color: var(--hw-fg3); }
        .hw-nl-btn {
          background: var(--hw-accent); border: none; color: #fff;
          padding: 0.5rem 0.75rem; cursor: pointer; transition: background 0.3s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .hw-nl-btn:hover { background: var(--hw-accent2); }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── Page Loader ──────────────────────────────────────────────────── */}
      <div className={`hw-loader${pageLoaded ? ' gone' : ''}`}>
        <div className="hw-loader-logo">
          <Coffee size={28} style={{ color: 'var(--hw-accent)' }} />
          H<span>&amp;</span>W
        </div>
        <div className="hw-loader-bar-wrap">
          <div className="hw-loader-bar" style={{ width: `${loadProgress}%` }} />
        </div>
        <span className="hw-loader-pct">{Math.round(loadProgress)}%</span>
      </div>

      {/* ── Custom Cursor ─────────────────────────────────────────────────── */}
      <div className="hw-cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div
        className={`hw-cursor-ring${cursorHover ? ' hover' : ' normal'}`}
        style={{ left: cursorRing.x, top: cursorRing.y }}
      />

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className={`hw-nav${scrolled ? ' scrolled' : ''}`}>
        <a
          className="hw-nav-logo"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          href="#"
        >
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
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            className="hw-cta-btn hw-nav-cta-desktop"
            onClick={() => smoothScroll('#contact')}
            style={{ borderRadius: '2px' }}
          >
            Visit Us <ArrowRight size={13} />
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

      {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
      <div className={`hw-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="hw-mobile-menu-head">
          <div className="hw-footer-brand-name" style={{ marginBottom: 0, fontSize: '1.2rem' }}>
            <Coffee size={18} style={{ color: 'var(--hw-accent)' }} />
            H&amp;W Coffee
          </div>
          <button className="hw-icon-btn" onClick={() => setMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            className="hw-mobile-nav-link"
            onClick={e => { e.preventDefault(); smoothScroll(link.href) }}
          >
            {link.label}
            <span className="hw-mobile-nav-num">0{i + 1}</span>
          </a>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="hw-cta-btn" onClick={() => smoothScroll('#contact')} style={{ borderRadius: '2px' }}>
            Visit Us <ArrowRight size={13} />
          </button>
          <button className="hw-icon-btn" onClick={() => { setDark(!dark); }} aria-label="Toggle theme">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="hw-hero" ref={heroRef}>
        <div className="hw-hero-img" />
        <img
          className="hw-hero-cup"
          src="/tatemonos/hw-coffee/assets/images/img1.png"
          alt="H&amp;W Coffee signature cup"
        />
        <div className="hw-hero-badge">
          <div className="hw-hero-badge-inner">
            <span className="hw-hero-badge-num">4.7</span>
            <span className="hw-hero-badge-txt">★ Google<br/>Rating</span>
          </div>
        </div>
        <div className="hw-hero-content">
          <div className="hw-hero-tag">
            <Coffee size={11} />
            Gingoog City's #1 Café — Since Opening Day
          </div>
          <h1>
            <span className="hw-hero-line">Gingoog's</span>
            <span className="hw-hero-line"><em>finest</em> cup,</span>
            <span className="hw-hero-line">every time.</span>
          </h1>
          <p className="hw-hero-sub">
            Artisan brews, handcrafted food, and an atmosphere that makes you want to stay.
            H&amp;W Coffee — Gingoog City's most-loved café, now in Cagayan de Oro.
          </p>
          <div className="hw-hero-cta">
            <button
              className="hw-cta-btn"
              onClick={() => smoothScroll('#menu')}
              style={{ borderRadius: '2px' }}
            >
              See Our Menu <ArrowRight size={13} />
            </button>
            <button
              className="hw-cta-btn hw-cta-btn-ghost"
              onClick={() => smoothScroll('#story')}
              style={{ borderRadius: '2px' }}
            >
              Our Story
            </button>
          </div>
        </div>
        <div className="hw-scroll-hint">
          <ChevronDown size={13} />
          Scroll
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div id="hw-stats">
        {STATS.map((s, i) => (
          <div key={i} className="hw-stat-item">
            <span className="hw-stat-num">{s.num}</span>
            <span className="hw-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Features Bar ──────────────────────────────────────────────────── */}
      <div className="hw-features-bar">
        {FEATURES.map((f, i) => (
          <div key={i} className="hw-feature-item">
            <f.icon size={15} />
            {f.label}
          </div>
        ))}
      </div>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <div className="hw-marquee-wrap">
        <div className="hw-marquee-track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className={`hw-marquee-word${w === '·' ? ' dot' : ''}`}>{w}</span>
          ))}
        </div>
      </div>

      {/* ── Story ─────────────────────────────────────────────────────────── */}
      <section id="story" className="hw-section" style={{ background: 'var(--hw-bg)' }}>
        <div className="hw-section-inner">
          <div className="hw-section-label">About H&amp;W</div>
          <h2 className="hw-section-heading hw-story-heading">
            <span className="hw-split">Built for </span>
            <span className="hw-split"><em>Gingoog.</em> </span>
            <span className="hw-split">Loved by </span>
            <span className="hw-split">everyone.</span>
          </h2>
          <div className="hw-story-grid">
            <div className="hw-story-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=85"
                alt="H&W Coffee interior"
              />
              <div className="hw-story-img-badge">#1 Café in Gingoog City</div>
            </div>
            <div className="hw-story-body">
              <p>
                H&amp;W Coffee began as a vision to give Gingoog City something it deserved but didn't yet have — a café with real quality, genuine warmth, and a space that felt different from the moment you walked in.
              </p>
              <p>
                We built a place where the coffee is always dialed in, the food is made with care, and the staff greets you like they actually mean it. That's why we've become the #1 café in the city — not by chasing trends, but by caring about every single detail.
              </p>
              <p>
                Today, H&amp;W has expanded to Cagayan de Oro, bringing Gingoog's pride into the metropolis. Whether it's your morning americano, a chorizo pasta lunch, or a matcha latte afternoon — this is your place.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="hw-cta-btn"
                  onClick={() => smoothScroll('#process')}
                  style={{ borderRadius: '2px' }}
                >
                  How We Work <ArrowRight size={13} />
                </button>
                <button
                  className="hw-cta-btn hw-cta-btn-ghost"
                  onClick={() => smoothScroll('#visits')}
                  style={{ borderRadius: '2px' }}
                >
                  Find Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="hw-divider hw-line-reveal" style={{ margin: '0 clamp(1.5rem, 5vw, 4rem)' }} />

      {/* ── Quote Strip ────────────────────────────────────────────────────── */}
      <div className="hw-quote-strip">
        <div className="hw-quote-inner">
          <p className="hw-quote-text">
            The classiest coffeeshop in Gingoog. Great ambience, terrific service, food that keeps you coming back.
          </p>
          <p className="hw-quote-attr">— Verified Customer Review · Google Maps</p>
        </div>
      </div>

      {/* ── Menu ──────────────────────────────────────────────────────────── */}
      <section id="menu" className="hw-section" style={{ background: 'var(--hw-bg2)' }}>
        <div className="hw-section-inner">
          <div className="hw-section-label">What We Serve</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="hw-section-heading">
              <span className="hw-split">The </span>
              <em className="hw-split">menu.</em>
            </h2>
            <p style={{ color: 'var(--hw-fg2)', fontSize: '0.88rem', maxWidth: 300, lineHeight: 1.75 }}>
              Specialty coffees, hearty food, and thoughtful drinks — crafted to match every mood and moment.
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

      <div className="hw-divider hw-line-reveal" style={{ margin: '0 clamp(1.5rem, 5vw, 4rem)' }} />

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <section id="process" className="hw-section" style={{ background: 'var(--hw-bg)' }}>
        <div className="hw-section-inner">
          <div className="hw-section-label">From Farm to Cup</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <h2 className="hw-section-heading">
              <span className="hw-split">The </span>
              <span className="hw-split"><em>craft</em> </span>
              <span className="hw-split">behind </span>
              <span className="hw-split">your cup.</span>
            </h2>
            <p style={{ color: 'var(--hw-fg2)', lineHeight: 1.8, fontSize: '0.92rem' }}>
              There are four steps between the farmer's hands and yours. At each one, someone at H&amp;W has made a deliberate choice — so that what arrives in your cup is the best it can possibly be.
            </p>
          </div>
          <div className="hw-process-grid">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="hw-process-step">
                  <span className="hw-process-step-num">{step.num}</span>
                  <Icon className="hw-process-step-icon" size={34} />
                  <div className="hw-process-step-title">{step.title}</div>
                  <div className="hw-process-step-sub">{step.sub}</div>
                  <p className="hw-process-step-desc">{step.desc}</p>
                  <ArrowUpRight className="hw-process-step-arrow" size={17} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Full-width Image Break ─────────────────────────────────────────── */}
      <div className="hw-fullwidth-wrap">
        <div
          className="hw-fullwidth-img"
          role="img"
          aria-label="Coffee brewing"
        />
        <div className="hw-fullwidth-overlay" />
        <div className="hw-fullwidth-content">
          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.9rem)',
            color: 'var(--hw-fg)',
            fontStyle: 'italic',
            lineHeight: 1.5,
            marginBottom: '0.75rem',
          }}>
            "A very relaxing place with great atmosphere — and the best coffee in Northern Mindanao."
          </p>
          <p style={{
            fontSize: '0.72rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--hw-accent)',
          }}>
            — Restaurant Guru · 4.6 ★ Rating
          </p>
        </div>
      </div>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section id="hw-testimonials" className="hw-section" style={{ background: 'var(--hw-bg2)' }}>
        <div className="hw-section-inner">
          <div className="hw-section-label">What People Say</div>
          <h2 className="hw-section-heading">
            <span className="hw-split">Heard at </span>
            <span className="hw-split">the </span>
            <em className="hw-split">bar.</em>
          </h2>
          <div className="hw-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="hw-testi-card">
                <Quote className="hw-testi-quote-icon" size={20} />
                <div className="hw-testi-stars">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} size={11} fill="var(--hw-accent)" color="var(--hw-accent)" />
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

      <div className="hw-divider hw-line-reveal" style={{ margin: '0 clamp(1.5rem, 5vw, 4rem)' }} />

      {/* ── Locations ─────────────────────────────────────────────────────── */}
      <section id="visits" className="hw-section" style={{ background: 'var(--hw-bg)' }}>
        <div className="hw-section-inner">
          <div className="hw-section-label">Find Us</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2 className="hw-section-heading">
              <span className="hw-split">Come see us </span>
              <em className="hw-split">in person.</em>
            </h2>
            <p style={{ color: 'var(--hw-fg2)', fontSize: '0.88rem', maxWidth: 280, lineHeight: 1.75 }}>
              Two locations — both designed to be places you stay, not just pass through.
            </p>
          </div>
          <div className="hw-locations-grid">
            {LOCATIONS.map((loc, i) => (
              <div key={i} className="hw-location-card">
                <div className="hw-location-img-wrap">
                  <img src={loc.img} alt={loc.name} className="hw-location-img" />
                  <div className="hw-location-tag">{loc.tag}</div>
                </div>
                <div className="hw-location-body">
                  <div className="hw-location-name">{loc.name}</div>
                  <div className="hw-location-detail">
                    <MapPin size={14} className="hw-location-detail-icon" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="hw-location-detail">
                    <Clock size={14} className="hw-location-detail-icon" />
                    <span>{loc.hours}</span>
                  </div>
                  <div className="hw-location-detail">
                    <Phone size={14} className="hw-location-detail-icon" />
                    <span>{loc.phone}</span>
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="hw-cta-btn hw-cta-btn-ghost" style={{ borderRadius: '2px' }}>
                      Get Directions <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section id="hw-cta" className="hw-cta-section">
        <div className="hw-cta-bg" />
        <div className="hw-cta-overlay" />
        <div className="hw-cta-content">
          <h2 className="hw-cta-heading">
            Your next great<br /><em>cup</em> is waiting.
          </h2>
          <p className="hw-cta-sub">
            Walk in, follow us on Facebook, or reach out for events and wholesale inquiries.
          </p>
          <div className="hw-cta-btns">
            <button
              className="hw-cta-btn"
              onClick={() => smoothScroll('#contact')}
              style={{ borderRadius: '2px' }}
            >
              Contact Us <ArrowRight size={13} />
            </button>
            <button
              className="hw-cta-btn hw-cta-btn-ghost"
              onClick={() => smoothScroll('#menu')}
              style={{ borderRadius: '2px' }}
            >
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <section id="contact" className="hw-section" style={{ background: 'var(--hw-bg)' }}>
        <div className="hw-section-inner">
          <div className="hw-contact-grid">
            <div className="hw-contact-left">
              <div className="hw-section-label">Get In Touch</div>
              <h2 className="hw-section-heading" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}>
                <span className="hw-split">We'd love </span>
                <em className="hw-split">to hear</em>
                <span className="hw-split"> from you.</span>
              </h2>
              <p style={{ color: 'var(--hw-fg2)', lineHeight: 1.8, marginTop: '1.5rem', fontSize: '0.92rem' }}>
                For wholesale, event bookings, partnerships, press, or just to say hello — reach out below or find us on Facebook.
              </p>
              <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: Facebook, label: 'H and W Coffee on Facebook', href: 'https://www.facebook.com/h.and.w.coffee/' },
                  { icon: Instagram, label: '@handwcoffee', href: '#' },
                  { icon: MapPin, label: 'Gingoog City · CDO Branch', href: '#' },
                  { icon: Clock, label: 'Mon–Sun · 8AM–9PM (Gingoog)', href: '#' },
                ].map((item, i) => (
                  <div key={i} className="hw-location-detail">
                    <item.icon size={15} className="hw-location-detail-icon" />
                    <a
                      href={item.href}
                      style={{ color: 'var(--hw-fg2)', textDecoration: 'none', transition: 'color 0.3s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--hw-accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--hw-fg2)')}
                    >
                      {item.label}
                    </a>
                    {item.href !== '#' && <ExternalLink size={12} style={{ color: 'var(--hw-fg3)' }} />}
                  </div>
                ))}
              </div>
            </div>
            <div className="hw-contact-right">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="hw-footer">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="hw-footer-grid">
            <div>
              <div className="hw-footer-brand-name">
                <Coffee size={20} style={{ color: 'var(--hw-accent)' }} />
                H&amp;W Coffee
              </div>
              <p className="hw-footer-brand-desc">
                Gingoog City's premier specialty café — artisan coffee, handcrafted food, and a space that feels like home. Now serving CDO too.
              </p>
              <div className="hw-footer-social">
                {[
                  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/h.and.w.coffee/' },
                  { icon: Instagram, label: 'Instagram', href: '#' },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    aria-label={s.label}
                    className="hw-icon-btn"
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
              <div className="hw-footer-heading">Navigate</div>
              {NAV_LINKS.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  className="hw-footer-link"
                  onClick={e => { e.preventDefault(); smoothScroll(l.href) }}
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div>
              <div className="hw-footer-heading">Locations</div>
              <span className="hw-footer-link" style={{ cursor: 'default' }}>
                <MapPin size={12} style={{ color: 'var(--hw-accent)', flexShrink: 0 }} />
                Gingoog City, Mis. Or.
              </span>
              <span className="hw-footer-link" style={{ cursor: 'default' }}>
                <MapPin size={12} style={{ color: 'var(--hw-accent)', flexShrink: 0 }} />
                Cagayan de Oro City
              </span>
              <div style={{ marginTop: '1.25rem' }}>
                <div className="hw-footer-heading">Hours</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--hw-fg2)', lineHeight: 1.75 }}>
                  Mon–Sun: 8AM–9PM<br />
                  (Hours may vary)
                </p>
              </div>
            </div>
            <div>
              <div className="hw-footer-heading">Stay Updated</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--hw-fg2)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                Follow us on Facebook for daily specials, promos, and new menu drops.
              </p>
              <a
                href="https://www.facebook.com/h.and.w.coffee/"
                target="_blank"
                rel="noopener noreferrer"
                className="hw-cta-btn"
                style={{ borderRadius: '2px', display: 'inline-flex', textDecoration: 'none', fontSize: '0.72rem' }}
              >
                <Facebook size={13} />
                Follow on Facebook
              </a>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="hw-footer-heading">Newsletter</div>
                <div className="hw-nl-wrap">
                  <input className="hw-nl-input" type="email" placeholder="your@email.com" />
                  <button className="hw-nl-btn" aria-label="Subscribe">
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hw-footer-bottom">
            <div className="hw-footer-bottom-row">
              <span>© 2026 H&amp;W Coffee — All Rights Reserved</span>
              <span style={{ color: 'var(--hw-fg3)' }}>Gingoog City · CDO</span>
              <span style={{ color: 'var(--hw-fg3)' }}>Concept by Mizumi</span>
            </div>
            <div className="hw-footer-disclaimer">
              <strong style={{ fontStyle: 'normal' }}>Disclaimer:</strong> This is a concept website created for demonstration and portfolio purposes only, using publicly available information and imagery. This website was not commissioned by H&amp;W Coffee and is not an official website of the brand. All brand names, ratings, reviews, and location information referenced are publicly available. Created by <strong style={{ fontStyle: 'normal' }}>James Rafty D. Libago</strong>, known by the pen artist name <strong style={{ fontStyle: 'normal' }}>Mizumi</strong>. All images are placeholder assets from Unsplash and are intended to be replaced with actual H&amp;W Coffee photography.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── MenuCard ─────────────────────────────────────────────────────────────────
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
          <div className="hw-qty-row" style={{ marginLeft: item.badge ? 'auto' : 0 }}>
            <button className="hw-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>
              <Minus size={10} />
            </button>
            <span className="hw-qty-num">{qty}</span>
            <button className="hw-qty-btn" onClick={() => setQty(q => q + 1)}>
              <Plus size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ContactForm ──────────────────────────────────────────────────────────────
const ContactForm = () => {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return
    setSent(true)
  }

  if (sent) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 280, gap: '1rem',
      border: '1px solid var(--hw-border)', padding: '3rem', textAlign: 'center',
      borderRadius: '2px',
    }}>
      <Coffee size={30} style={{ color: 'var(--hw-accent)' }} />
      <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: 'var(--hw-fg)' }}>
        Message received.
      </h3>
      <p style={{ color: 'var(--hw-fg2)', fontSize: '0.88rem', maxWidth: 280 }}>
        We'll get back to you soon. In the meantime — grab a cup and stay a while.
      </p>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
        <input
          className="hw-form-input"
          placeholder="Your Name"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        />
        <input
          className="hw-form-input"
          placeholder="Email Address"
          type="email"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
        />
      </div>
      <input
        className="hw-form-input"
        placeholder="Subject"
        value={form.subject}
        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
      />
      <textarea
        className="hw-form-input"
        style={{ height: 150, resize: 'vertical' }}
        placeholder="Your message..."
        value={form.message}
        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
      />
      <button
        className="hw-cta-btn"
        onClick={handleSubmit}
        style={{ borderRadius: '2px', width: '100%', justifyContent: 'center' }}
      >
        Send Message <ArrowRight size={13} />
      </button>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_HwCoffee_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_HwCoffee_Index
