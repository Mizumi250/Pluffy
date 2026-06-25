// ============================================================
// ARKZEN GENERATED PAGE — lain098/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T01:16:58.262Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { lain098Animations, pageVariants } from '@/arkzen/generated/lain098.animations'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { ART_TYPES, COMM_TYPES, FLOAT_IMGS, GALLERY_ITEMS, NAV_LINKS, PROCESS_STEPS } from './components/constants'
import { el, smoothScroll } from './components/utils'
import { gsap } from 'gsap'
import { Instagram, ExternalLink, Heart, Star, ArrowRight, ChevronDown, Menu, X, Sparkles, Send } from 'lucide-react'

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const cursorRef     = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const cursorTarget = useRef({ x: -200, y: -200 })
  const rafRef = useRef<number>(0)

  // ── Cursor ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.set(cursorRef.current, { x: e.clientX, y: e.clientY })
      }
      cursorTarget.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)
    const tick = () => {
      if (cursorRingRef.current) {
        const cur = {
          x: parseFloat(cursorRingRef.current.style.left || '-200'),
          y: parseFloat(cursorRingRef.current.style.top  || '-200'),
        }
        const next = {
          x: cur.x + (cursorTarget.current.x - cur.x) * 0.14,
          y: cur.y + (cursorTarget.current.y - cur.y) * 0.14,
        }
        gsap.set(cursorRingRef.current, { x: next.x, y: next.y })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── Cursor hover ──────────────────────────────────────────────────────────
  useEffect(() => {
    const targets = pageRef.current?.querySelectorAll('a, button, .lain-art-card, .lain-comm-card')
    const onEnter = () => {
      cursorRef.current?.classList.add('hovered')
      cursorRingRef.current?.classList.add('hovered')
    }
    const onLeave = () => {
      cursorRef.current?.classList.remove('hovered')
      cursorRingRef.current?.classList.remove('hovered')
    }
    targets?.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    return () => targets?.forEach(el => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    })
  }, [])

  // ── GSAP animations ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = lain098Animations(pageRef as React.RefObject<HTMLDivElement>)
    return cleanup
  }, [])

  // ── Magnetic CTA ──────────────────────────────────────────────────────────
  const handleMagnet = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, strength = 0.35) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    gsap.to(e.currentTarget, {
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
      duration: 0.3, ease: 'power2.out',
    })
  }, [])

  const handleMagnetLeave = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
  }, [])

  const REVEAL_WORDS = ['Art', 'made', 'with', 'love,', 'for', 'the', 'dreamers', 'and', 'wanderers', 'of', 'the', 'internet.']
  const ABOUT_IMGS = [
    'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=600&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80',
  ]

  const filteredGallery = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(g => g.tag.toLowerCase().includes(activeFilter))

  return (
    <div ref={pageRef} style={{ position: 'relative' }}>

      {/* ── Cursor ──────────────────────────────────────────────────────── */}
      <div ref={cursorRef} className="lain-cursor" />
      <div ref={cursorRingRef} className="lain-cursor-ring" />

      {/* ── Loader ──────────────────────────────────────────────────────── */}
      <div id="lain-loader">
        <div id="lain-loader-name">Lain098_</div>
        <div id="lain-loader-sub">digital artist</div>
        <div id="lain-loader-bar-wrap">
          <div id="lain-loader-bar" />
        </div>
      </div>

      {/* ── Sky particles ───────────────────────────────────────────────── */}
      <div className="lain-particles" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="lain-particle"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${10 + Math.random() * 10}px`,
              width:  `${4 + Math.random() * 10}px`,
              height: `${4 + Math.random() * 10}px`,
              background: `hsl(${195 + Math.random() * 22}, ${55 + Math.random() * 30}%, ${65 + Math.random() * 22}%)`,
              ['--dur' as string]:   `${6 + Math.random() * 8}s`,
              ['--delay' as string]: `${Math.random() * 7}s`,
              ['--op' as string]:    `${0.18 + Math.random() * 0.3}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav id="lain-nav">
        <a href="#" className="lain-nav-logo">
          Lain<span>098_</span>
        </a>
        <ul className="lain-nav-links">
          {NAV_LINKS.map(n => (
            <li key={n.label}>
              <a href={n.href} onClick={e => { e.preventDefault(); smoothScroll(n.href) }}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
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
      </nav>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(224,242,254,0.97)',
          backdropFilter: 'blur(16px)', zIndex: 999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '2.5rem',
        }}>
          <button
            style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMenuOpen(false)}
          >
            <X size={26} />
          </button>
          {NAV_LINKS.map(n => (
            <a
              key={n.label}
              href={n.href}
              style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontStyle: 'italic', color: '#1a2332' }}
              onClick={e => { e.preventDefault(); smoothScroll(n.href); setMenuOpen(false) }}
            >
              {n.label}
            </a>
          ))}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-hero">
        {/* Blobs */}
        <div className="lain-blob" style={{ width: 500, height: 500, top: -100, right: -80, background: '#bae6fd', ['--bd' as string]: '13s', ['--bx' as string]: '35px', ['--by' as string]: '-25px' } as React.CSSProperties} />
        <div className="lain-blob" style={{ width: 280, height: 280, bottom: 60, left: -40, background: '#fce4ec', ['--bd' as string]: '10s', ['--bx' as string]: '-25px', ['--by' as string]: '18px' } as React.CSSProperties} />
        <div className="lain-blob" style={{ width: 200, height: 200, bottom: 200, right: 220, background: '#e0f7f4', ['--bd' as string]: '11s', ['--bx' as string]: '18px', ['--by' as string]: '-35px' } as React.CSSProperties} />

        {/* Floating collage cards */}
        {FLOAT_IMGS.map((src, i) => (
          <div key={i} className="lain-float-card">
            <img src={src} alt="" />
          </div>
        ))}

        {/* Content */}
        <p className="lain-hero-eyebrow">✦ Digital Artist · Anime · OC · Chibi · Animations</p>

        {/* COVEO-style animated SVG script stroke */}
        <div className="lain-hero-svg-wrap" aria-hidden="true">
          <svg viewBox="0 0 520 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 40 C25 18, 55 12, 75 32 C88 46, 105 50, 125 37 C142 24, 158 18, 178 36 C192 50, 208 52, 228 40"
              style={{ '--sd': '1.3s', '--sd-delay': '2.9s' } as React.CSSProperties}
            />
            <path
              d="M248 36 C264 20, 284 15, 304 33 C318 46, 336 50, 356 37 C370 26, 388 20, 410 38 C426 52, 446 55, 466 42 C478 34, 492 28, 508 38"
              style={{ '--sd': '1.3s', '--sd-delay': '3.7s' } as React.CSSProperties}
            />
          </svg>
        </div>

        <h1 className="lain-hero-title">
          Hello, I'm <em>Lain</em>
        </h1>

        <p className="lain-hero-sub">
          A digital artist crafting anime illustrations, fanart, original characters, chibi, and short animations — art for people who feel everything a little too deeply.
        </p>

        <div className="lain-hero-ctas">
          <a
            href="https://throne.com/lain098_"
            target="_blank"
            rel="noopener noreferrer"
            className="lain-btn-primary"
            onMouseMove={handleMagnet as any}
            onMouseLeave={handleMagnetLeave as any}
          >
            Commission Me ✦
          </a>
          <button
            className="lain-btn-outline"
            onClick={() => smoothScroll('#gallery')}
            onMouseMove={e => handleMagnet(e as any, 0.3)}
            onMouseLeave={handleMagnetLeave as any}
          >
            View Gallery
          </button>
        </div>

        <div className="lain-scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <div className="lain-scroll-line" />
        </div>
      </section>

      {/* ── Art-type Marquee ─────────────────────────────────────────────── */}
      <div className="lain-marquee-section" aria-hidden="true">
        <div className="lain-marquee-track">
          {[...ART_TYPES, ...ART_TYPES].map((t, i) => (
            <span key={i} className="lain-marquee-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          ABOUT
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-about" id="about">
        <div className="lain-about-inner">
          {/* Image stack — collage ref */}
          <div className="lain-about-stack">
            {ABOUT_IMGS.map((src, i) => (
              <div key={i} className="lain-about-img">
                <img src={src} alt="Art example" />
              </div>
            ))}
          </div>

          <div className="lain-about-content">
            <span className="lain-section-label">— About Lain</span>
            <h2 className="lain-about-title">
              Art that feels like a quiet <em>sunny afternoon</em>
            </h2>
            <p className="lain-about-text">
              Hello! I'm Lain — a digital artist who draws anime-style illustrations, fanart of characters I love, original characters with full backstories, and tiny chibi versions of everything.
            </p>
            <p className="lain-about-text">
              Every piece I make is personal. I want the person receiving my art to feel something — a memory, a daydream, a warmth they can't quite name. That's what I'm always chasing.
            </p>
            <div className="lain-tags">
              {['Anime Style', 'Fanart', 'OC Design', 'Chibi', 'Animations', 'Digital'].map(tag => (
                <span key={tag} className="lain-tag">{tag}</span>
              ))}
            </div>
            <a
              href="https://www.instagram.com/lain098_"
              target="_blank"
              rel="noopener noreferrer"
              className="lain-btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Instagram size={14} />
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          GALLERY
      ───────────────────────────────────────────────────────────────────── */}
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
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="lain-gallery-grid">
          {GALLERY_ITEMS.map((item, i) => (
            <div key={i} className="lain-art-card">
              <div className="lain-art-card-img-wrap">
                <img src={item.img} alt={item.title} />
                <div className="lain-art-card-overlay">
                  <span className="lain-art-tag">{item.tag}</span>
                  <span className="lain-art-name">{item.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          COMMISSIONS
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-commissions" id="commissions">
        <div className="lain-commissions-inner">
          <div className="lain-commissions-head">
            <span className="lain-section-label">— Commissions</span>
            <h2 className="lain-commissions-title">
              Let me draw <em>your</em> vision
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="lain-comm-status">
                <span className="lain-comm-status-dot" />
                Commissions Open
              </span>
              <a
                href="https://throne.com/lain098_"
                target="_blank"
                rel="noopener noreferrer"
                className="lain-btn-primary"
                style={{ fontSize: '0.78rem', padding: '0.55rem 1.3rem' }}
              >
                Request via Throne
              </a>
            </div>
          </div>
          <div className="lain-comm-grid">
            {COMM_TYPES.map((c, i) => (
              <div key={i} className="lain-comm-card" style={{ transitionDelay: `${c.delay}s` }}>
                <div className="lain-comm-icon">{c.icon}</div>
                <div className="lain-comm-tier">{c.tier}</div>
                <div className="lain-comm-name">{c.name}</div>
                <p className="lain-comm-desc">{c.desc}</p>
                <div className="lain-comm-price">
                  {c.start} <span>starting</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          PROCESS
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-process">
        <div className="lain-process-inner">
          <span className="lain-section-label" style={{ textAlign: 'center', display: 'block' }}>— How it works</span>
          <h2 className="lain-process-title">The commission <em>process</em></h2>
          <div className="lain-steps">
            <div className="lain-steps-line" />
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="lain-step">
                <div className="lain-step-num">{step.num}</div>
                <div className="lain-step-body">
                  <div className="lain-step-title">{step.title}</div>
                  <p className="lain-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SKY TEXT REVEAL — Astrophile / Filosofi ref
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-reveal-section">
        <div className="lain-reveal-bg-word" aria-hidden="true">Lain</div>
        <div className="lain-reveal-content">
          <p className="lain-reveal-eyebrow">— A note from Lain</p>
          <div>
            {REVEAL_WORDS.map((word, i) => (
              <span
                key={i}
                className="lain-reveal-word"
                style={{ transitionDelay: `${i * 0.06}s` }}
              >
                {word}
              </span>
            ))}
          </div>
          <p className="lain-reveal-sig">— Lain098_</p>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          CONTACT
      ───────────────────────────────────────────────────────────────────── */}
      <section className="lain-contact" id="contact">
        <div className="lain-contact-inner">
          <div className="lain-contact-avatar">
            <img
              src="https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=240&q=80"
              alt="Lain avatar"
            />
          </div>
          <span className="lain-section-label">— Get in Touch</span>
          <h2 className="lain-contact-title">
            Let's create <em>together</em>
          </h2>
          <p className="lain-contact-text">
            Whether you want a commission, have a collab idea, or just want to say hi — my DMs are always open. I love meeting fellow art enjoyers 🩵
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
          <a
            href="https://throne.com/lain098_"
            target="_blank"
            rel="noopener noreferrer"
            className="lain-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            onMouseMove={handleMagnet as any}
            onMouseLeave={handleMagnetLeave as any}
          >
            <Send size={14} />
            Send a Commission Request
          </a>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="lain-footer">
        <p className="lain-footer-copy">© 2025 Lain098_ · All rights reserved</p>
        <span className="lain-footer-sig">Lain</span>
        <ul className="lain-footer-links">
          <li><a href="#about" onClick={e => { e.preventDefault(); smoothScroll('#about') }}>About</a></li>
          <li><a href="#gallery" onClick={e => { e.preventDefault(); smoothScroll('#gallery') }}>Gallery</a></li>
          <li><a href="#commissions" onClick={e => { e.preventDefault(); smoothScroll('#commissions') }}>Commissions</a></li>
          <li>
            <a href="https://www.instagram.com/lain098_" target="_blank" rel="noopener noreferrer">
              Instagram
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
