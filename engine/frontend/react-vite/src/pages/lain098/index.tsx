// ============================================================
// ARKZEN GENERATED PAGE — lain098/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T07:05:57.060Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { lain098Animations, pageVariants } from '@/arkzen/generated/lain098.animations'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { ABOUT_IMGS, ART_TYPES, CHAR_ATTRS, COMM_TYPES, EDITORIAL_IMGS, FLOAT_IMGS, GALLERY_ITEMS, NAV_LINKS, PROCESS_STEPS, REVEAL_WORDS, SCRAPBOOK_ITEMS, STATS, TESTIMONIALS } from './components/constants'
import { el, lerp, smoothScroll } from './components/utils'
import { gsap } from 'gsap'
import { Instagram, ExternalLink, Heart, Star, ArrowRight, ChevronDown, Menu, X, Sparkles, Send, Eye, Download, ChevronLeft, ChevronRight, ZoomIn, Play } from 'lucide-react'

// ── Page component from @arkzen:page:index ─────────────────────────────
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_Lain098_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = lain098Animations(pageRef)
    return cleanup
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_Lain098_Index
