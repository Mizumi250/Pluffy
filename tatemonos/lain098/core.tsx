/* @arkzen:meta
name: lain098
version: 1.0.0
description: "Art portfolio for Lain / Lain098_ — sky-blue, calm, sea-inspired. Digital artist: anime illustrations, fanart, OCs, chibi, short animations. Commissions open. Full scroll-trigger experience: hero, intro, gallery carousel, services/commissions, about, contact, footer."
auth: false
*/

/* @arkzen:meta:web
favicon: 🌊
title: Lain098_ — Digital Artist
description: Anime illustrations, fanart, OCs, chibi & short animations. Commissions open.
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "lain-root"
*/

// ─────────────────────────────────────────────────────────────────────────────
// WEB SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const WORKS = [
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

const COMMISSION_TIERS = [
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

const SKILLS_MARQUEE = [
  'Clip Studio Paint', '·', 'Procreate', '·', 'Adobe Photoshop', '·',
  'Anime-style Illustration', '·', 'Frame-by-Frame Animation', '·',
  'Character Design', '·', 'Fanart', '·', 'OC Creation', '·',
  'Chibi Art', '·', 'Sticker Design', '·', 'Clip Studio Paint', '·',
  'Procreate', '·', 'Adobe Photoshop', '·', 'Anime-style Illustration', '·',
  'Frame-by-Frame Animation', '·', 'Character Design', '·', 'Fanart', '·',
]

const NAV_LINKS = [
  { label: 'WORKS', href: '#works' },
  { label: 'COMMISSIONS', href: '#commissions' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
]

// ─── CURSOR ───────────────────────────────────────────────────────────────────

const LainCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top  = e.clientY + 'px'
      }
      setTimeout(() => {
        if (ringRef.current) {
          ringRef.current.style.left = e.clientX + 'px'
          ringRef.current.style.top  = e.clientY + 'px'
        }
      }, 55)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div ref={cursorRef} className="lain-cursor" />
      <div ref={ringRef}   className="lain-cursor-ring" />
    </>
  )
}

// ─── LOADER ───────────────────────────────────────────────────────────────────

const LainLoader = ({ onComplete }: { onComplete: () => void }) => {
  const screenRef = useRef<HTMLDivElement>(null)
  const barRef    = useRef<HTMLDivElement>(null)
  const countRef  = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fallback = setTimeout(() => onComplete(), 3500)

    const tl = gsap.timeline({
      onComplete: () => { clearTimeout(fallback); onComplete() },
    })

    const count = { val: 0 }
    tl.to(count, {
      val: 100, duration: 1.8, ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.floor(count.val))
      },
    }, 0)
    tl.to(barRef.current, { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
    tl.to(screenRef.current, { opacity: 0, duration: 0.5, ease: 'power2.out' })

    return () => { clearTimeout(fallback); tl.kill() }
  }, [onComplete])

  return (
    <div ref={screenRef} id="lain-loader">
      <div className="lain-loader-wave">
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} className="lain-loader-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <div className="lain-loader-center">
        <div className="lain-loader-logo">lain<span>098_</span></div>
        <div className="lain-loader-bar-wrap">
          <div ref={barRef} className="lain-loader-bar" />
        </div>
        <div className="lain-loader-count"><span ref={countRef}>0</span><span className="lain-loader-pct">%</span></div>
      </div>
    </div>
  )
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

const LainNav = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      setTimeout(() => {
        gsap.fromTo('.lain-nav-link',
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, stagger: 0.07, duration: 0.45, ease: 'power3.out' }
        )
      }, 10)
    }
  }

  return (
    <>
      <header className={`lain-header ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="lain-header-logo">lain<span>098_</span></a>
        <button className={`lain-burger ${open ? 'open' : ''}`} onClick={toggle} aria-label="Menu">
          <i /><i /><i />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lain-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setOpen(false)}
          >
            <motion.nav
              className="lain-nav-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <ul>
                {NAV_LINKS.map(l => (
                  <li key={l.href}>
                    <a
                      className="lain-nav-link"
                      href={l.href}
                      onClick={() => setOpen(false)}
                    >{l.label}</a>
                  </li>
                ))}
              </ul>
              <div className="lain-nav-socials">
                <a href="https://www.instagram.com/lain098_" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer">Throne</a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth  - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section id="hero" ref={heroRef} className="lain-hero">
      {/* Parallax sea gradient blobs */}
      <motion.div
        className="lain-blob lain-blob-1"
        animate={{ x: mousePos.x * 1.2, y: mousePos.y * 0.8 }}
        transition={{ type: 'spring', stiffness: 40, damping: 20 }}
      />
      <motion.div
        className="lain-blob lain-blob-2"
        animate={{ x: -mousePos.x * 0.8, y: -mousePos.y * 1.0 }}
        transition={{ type: 'spring', stiffness: 30, damping: 25 }}
      />
      <motion.div
        className="lain-blob lain-blob-3"
        animate={{ x: mousePos.x * 0.5, y: mousePos.y * 1.3 }}
        transition={{ type: 'spring', stiffness: 25, damping: 30 }}
      />

      {/* Floating decorative glyphs */}
      <div className="lain-hero-glyphs">
        {['✦','✧','◇','◈','✦','✧'].map((g,i) => (
          <span
            key={i}
            className="lain-glyph"
            style={{ '--delay': `${i * 0.7}s`, '--x': `${10 + i * 15}%`, '--top': `${15 + (i % 3) * 20}%` } as React.CSSProperties}
          >{g}</span>
        ))}
      </div>

      {/* Hero content */}
      <div className="lain-hero-inner">
        <motion.div
          className="lain-hero-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Digital Artist · Anime Illustration · Commissions Open
        </motion.div>

        <div className="lain-hero-title-wrap">
          {'LAIN'.split('').map((ch, i) => (
            <motion.span
              key={i}
              className="lain-hero-letter"
              initial={{ opacity: 0, y: 80, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.8, ease: [0.2, 0.8, 0.3, 1] }}
            >{ch}</motion.span>
          ))}
          <motion.span
            className="lain-hero-letter lain-hero-num"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8, ease: [0.2, 0.8, 0.3, 1] }}
          >098_</motion.span>
        </div>

        <motion.p
          className="lain-hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          Hello, I'm Lain — a digital artist whose work focuses on anime-style illustrations,
          fanart, OCs, chibi, and short animations. I bring ideas and characters to life through art.
        </motion.p>

        <motion.div
          className="lain-hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <a href="#commissions" className="lain-btn lain-btn-primary">Commission Me</a>
          <a href="#works"       className="lain-btn lain-btn-ghost">View Work</a>
        </motion.div>

        <motion.div
          className="lain-hero-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="lain-scroll-line" />
          <span>scroll</span>
        </motion.div>
      </div>

      {/* Hero art image */}
      <motion.div
        className="lain-hero-art"
        initial={{ opacity: 0, scale: 0.9, x: 60 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 1.1, ease: [0.2, 0.8, 0.3, 1] }}
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.3}px)`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80"
          alt="Lain098_ art"
        />
        <div className="lain-hero-art-badge">
          <span>✦</span>
          <span>Open for</span>
          <strong>Commissions</strong>
        </div>
      </motion.div>
    </section>
  )
}

// ─── INTRO STRIP (Astrophile-inspired: rotated vertical text layout) ──────────

const IntroStrip = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.intro-strip-item'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        stagger: 0.15, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section className="lain-intro-strip" ref={ref}>
      <div className="lain-intro-strip-inner">
        <div className="intro-strip-item lain-intro-label">
          <span className="lain-vertical-text">LAIN098_ — DIGITAL ARTIST</span>
        </div>
        <div className="intro-strip-item lain-intro-statement">
          <p>
            I create worlds one frame at a time — anime illustrations that breathe,
            characters that feel like old friends, and animations that carry a quiet heartbeat.
          </p>
          <p className="lain-intro-date">est. 2021 · open for work</p>
        </div>
        <div className="intro-strip-item lain-intro-stat-col">
          {[['100+', 'Commissions completed'], ['4', 'Art styles offered'], ['∞', 'Characters imagined']].map(([n, l]) => (
            <div key={n} className="lain-intro-stat">
              <strong>{n}</strong>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── WORK CHAPTERS (Tale-style sticky covers, inspired by Image 01 & 04) ──────

const WorkChapter = ({ work, index }: { work: typeof WORKS[0], index: number }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return

    gsap.fromTo(ref.current.querySelector('.wc-img') as HTMLElement,
      { scale: 1.08 },
      {
        scale: 1.0, ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom', end: 'bottom top',
          scrub: true,
        },
      }
    )

    gsap.fromTo(ref.current.querySelectorAll('.wc-text > *'),
      { opacity: 0, y: 48 },
      {
        opacity: 1, y: 0,
        stagger: 0.1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 72%' },
      }
    )
  }, [])

  const isEven = index % 2 === 0

  return (
    <div ref={ref} className={`lain-work-chapter ${isEven ? 'wc-left' : 'wc-right'}`} id={`work-${work.id}`}>
      <div className="wc-img-wrap">
        <div className="wc-img-inner">
          <img className="wc-img" src={work.img} alt={work.label} />
        </div>
        <div className="wc-num">{work.num}</div>
      </div>
      <div className="wc-text">
        <span className="wc-tagline">{work.tagline}</span>
        <h2 className="wc-headline">
          {work.headline.split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h2>
        <p className="wc-desc">{work.desc}</p>
        <div className="wc-accent-line" style={{ background: work.accent }} />
      </div>
    </div>
  )
}

// ─── WORKS SECTION ────────────────────────────────────────────────────────────

const WorksSection = () => {
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!headRef.current) return
    gsap.fromTo(headRef.current.querySelectorAll('.works-head-el'),
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0,
        stagger: 0.12, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section id="works" className="lain-works">
      <div ref={headRef} className="lain-section-head">
        <span className="works-head-el lain-section-eyebrow">✦ Portfolio</span>
        <h2 className="works-head-el lain-section-title">
          What I <em>create</em>
        </h2>
        <p className="works-head-el lain-section-sub">
          Four pillars of my practice — each one a different way of bringing characters to life.
        </p>
      </div>
      <div className="lain-works-chapters">
        {WORKS.map((w, i) => <WorkChapter key={w.id} work={w} index={i} />)}
      </div>
    </section>
  )
}

// ─── MARQUEE ──────────────────────────────────────────────────────────────────

const SkillsMarquee = () => (
  <div className="lain-marquee-wrap">
    <div className="lain-marquee">
      <div className="lain-marquee-track">
        {[...SKILLS_MARQUEE, ...SKILLS_MARQUEE].map((s, i) => (
          <span key={i} className={s === '·' ? 'lain-marquee-dot' : 'lain-marquee-item'}>{s}</span>
        ))}
      </div>
    </div>
  </div>
)

// ─── GALLERY STRIP (inspired by Image 06/10: photo-grid + cards) ──────────────

const GalleryStrip = () => {
  const ref = useRef<HTMLDivElement>(null)

  // Online placeholder art images for now
  const galleryImgs = [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
    'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&q=80',
    'https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=400&q=80',
    'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=400&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
  ]

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return

    const cards = ref.current.querySelectorAll('.lain-gallery-card')
    gsap.fromTo(cards,
      { opacity: 0, y: 50, scale: 0.92 },
      {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.08, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%' },
      }
    )

    // horizontal parallax for alternate rows
    gsap.to(ref.current.querySelector('.lain-gallery-row-top') as HTMLElement, {
      xPercent: -8, ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom', end: 'bottom top',
        scrub: 1,
      },
    })
    gsap.to(ref.current.querySelector('.lain-gallery-row-bot') as HTMLElement, {
      xPercent: 8, ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom', end: 'bottom top',
        scrub: 1,
      },
    })
  }, [])

  return (
    <section className="lain-gallery" ref={ref}>
      <div className="lain-section-head">
        <span className="lain-section-eyebrow">✦ Gallery</span>
        <h2 className="lain-section-title">Recent <em>works</em></h2>
      </div>
      <div className="lain-gallery-row lain-gallery-row-top">
        {galleryImgs.slice(0, 4).map((src, i) => (
          <motion.div
            key={i}
            className="lain-gallery-card"
            whileHover={{ scale: 1.04, y: -6, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <img src={src} alt={`artwork ${i+1}`} />
            <div className="lain-gallery-card-overlay">
              <span>✦ View</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="lain-gallery-row lain-gallery-row-bot">
        {galleryImgs.slice(4).map((src, i) => (
          <motion.div
            key={i}
            className="lain-gallery-card"
            whileHover={{ scale: 1.04, y: -6, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <img src={src} alt={`artwork ${i+5}`} />
            <div className="lain-gallery-card-overlay">
              <span>✦ View</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── COMMISSIONS SECTION (inspired by Image 07: card layout with badges) ──────

const CommissionsSection = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.lain-tier-card'),
      { opacity: 0, y: 60, scale: 0.93 },
      {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.12, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 76%' },
      }
    )
  }, [])

  return (
    <section id="commissions" className="lain-commissions" ref={ref}>
      <div className="lain-section-head">
        <span className="lain-section-eyebrow">✦ Commissions</span>
        <h2 className="lain-section-title">Let's create <em>together</em></h2>
        <p className="lain-section-sub">
          Slots are limited — order via Throne or DM on Instagram. I'll confirm availability within 24 hours.
        </p>
      </div>
      <div className="lain-tiers-grid">
        {COMMISSION_TIERS.map((tier) => (
          <motion.div
            key={tier.id}
            className={`lain-tier-card ${tier.featured ? 'tier-featured' : ''}`}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            {tier.featured && <div className="tier-badge">✦ Most Popular</div>}
            <div className="tier-accent-dot" style={{ background: tier.accent }} />
            <div className="tier-header">
              <h3 className="tier-title">{tier.title}</h3>
              <p className="tier-price">{tier.price}</p>
            </div>
            <p className="tier-desc">{tier.desc}</p>
            <ul className="tier-features">
              {tier.features.map((f, i) => (
                <li key={i}><span className="tier-check">✦</span>{f}</li>
              ))}
            </ul>
            <div className="tier-ctas">
              <a
                href="https://throne.com/lain098_"
                target="_blank"
                rel="noreferrer"
                className="lain-btn lain-btn-primary tier-cta"
              >
                Order on Throne
              </a>
              <a
                href="https://www.instagram.com/lain098_"
                target="_blank"
                rel="noreferrer"
                className="lain-btn lain-btn-ghost tier-cta"
              >
                DM on Instagram
              </a>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="lain-comm-notice">
        <p>✦ All prices are base rates. Complex designs, multiple characters, or detailed backgrounds may affect pricing. I'll always discuss before starting.</p>
      </div>
    </section>
  )
}

// ─── ABOUT SECTION (inspired by Image 08/11: large text + vertical layout) ────

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return

    gsap.fromTo(ref.current.querySelectorAll('.about-el'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        stagger: 0.1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      }
    )

    // Big text parallax
    gsap.to(ref.current.querySelector('.about-bg-text') as HTMLElement, {
      yPercent: -20, ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom', end: 'bottom top',
        scrub: true,
      },
    })
  }, [])

  return (
    <section id="about" className="lain-about" ref={ref}>
      <div className="about-bg-text" aria-hidden>LAIN</div>
      <div className="lain-about-inner">
        <div className="lain-about-img-col about-el">
          <div className="lain-about-img-frame">
            <img
              src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80"
              alt="Lain working"
            />
          </div>
          <div className="lain-about-img-tag about-el">
            <span className="lain-vertical-text">DIGITAL ARTIST · 2021</span>
          </div>
        </div>
        <div className="lain-about-text-col">
          <span className="about-el lain-section-eyebrow">✦ About</span>
          <h2 className="about-el lain-about-title">Hello,<br />I'm <em>Lain</em>.</h2>
          <p className="about-el lain-about-p">
            I'm a digital artist whose work focuses on anime-style illustrations — fanart,
            original characters, chibi, and short animations. I enjoy creating unique characters
            and bringing ideas to life through art.
          </p>
          <p className="about-el lain-about-p">
            My style lives in soft colours, expressive eyes, and the quiet in-between moments —
            the kind of art that feels like a warm afternoon by the sea. Whether it's a beloved
            fictional character or a freshly imagined OC, I approach every piece with care.
          </p>
          <div className="about-el lain-about-tags">
            {['Anime Illustration', 'Fanart', 'Original Characters', 'Chibi', 'Short Animation', 'Character Design'].map(t => (
              <span key={t} className="lain-tag">{t}</span>
            ))}
          </div>
          <div className="about-el lain-about-links">
            <a href="https://www.instagram.com/lain098_" target="_blank" rel="noreferrer" className="lain-btn lain-btn-primary">
              Instagram
            </a>
            <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer" className="lain-btn lain-btn-ghost">
              Throne Wishlist
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────

const ContactSection = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.contact-el'),
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0,
        stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section id="contact" className="lain-contact" ref={ref}>
      <div className="lain-contact-inner">
        <span className="contact-el lain-section-eyebrow">✦ Let's connect</span>
        <h2 className="contact-el lain-contact-title">
          Got an idea?<br /><em>Let's talk.</em>
        </h2>
        <p className="contact-el lain-contact-sub">
          Whether you want a commission, a collaboration, or just want to say hi —
          my DMs are always open.
        </p>
        <div className="contact-el lain-contact-cards">
          <motion.a
            href="https://www.instagram.com/lain098_"
            target="_blank"
            rel="noreferrer"
            className="lain-contact-card"
            whileHover={{ scale: 1.04, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="lain-contact-card-icon">📷</span>
            <strong>Instagram</strong>
            <span>@lain098_</span>
          </motion.a>
          <motion.a
            href="https://throne.com/lain098_"
            target="_blank"
            rel="noreferrer"
            className="lain-contact-card"
            whileHover={{ scale: 1.04, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="lain-contact-card-icon">👑</span>
            <strong>Throne</strong>
            <span>throne.com/lain098_</span>
          </motion.a>
        </div>
        <p className="contact-el lain-contact-note">
          For commissions, please check my Throne page for current availability and pricing tiers.
        </p>
      </div>
      {/* Sea wave SVG at bottom */}
      <div className="lain-contact-wave" aria-hidden>
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            fill="#E8F4FD"
          />
        </svg>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="lain-footer">
    <div className="lain-footer-inner">
      <div className="lain-footer-logo">lain<span>098_</span></div>
      <p className="lain-footer-tagline">
        Anime illustrations · Fanart · OCs · Chibi · Short Animations
      </p>
      <div className="lain-footer-links">
        <a href="https://www.instagram.com/lain098_" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer">Throne</a>
      </div>
      <p className="lain-footer-copy">© 2025 Lain098_ · All artwork rights reserved.</p>
    </div>
    {/* Decorative sea line */}
    <div className="lain-footer-sea" aria-hidden>
      {[...Array(8)].map((_, i) => (
        <span key={i} className="lain-footer-wave-bar" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  </footer>
)

/* @arkzen:web:components:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB STYLE
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:style */

@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,600;0,700;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

/* ── RESET & ROOT ─────────────────────────────────────────────── */

.lain-root {
  margin: 0; padding: 0;
  font-family: 'Nunito', sans-serif;
  font-weight: 400;
  color: #1a2a3a;
  background: #ffffff;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  cursor: none;
}

*, *::before, *::after { box-sizing: border-box; }
a { text-decoration: none; color: inherit; }
img { display: block; width: 100%; object-fit: cover; }
ul { list-style: none; margin: 0; padding: 0; }

/* ── CURSOR ─────────────────────────────────────────────────────── */

.lain-cursor {
  position: fixed;
  width: 10px; height: 10px;
  background: #5BBDE4;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transform: translate(-50%, -50%);
  transition: transform 0.1s ease, width 0.2s ease, height 0.2s ease;
  mix-blend-mode: multiply;
}

.lain-cursor-ring {
  position: fixed;
  width: 36px; height: 36px;
  border: 1.5px solid rgba(91, 189, 228, 0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transform: translate(-50%, -50%);
  transition: transform 0.18s ease, width 0.25s ease, height 0.25s ease;
}

/* ── LOADER ─────────────────────────────────────────────────────── */

#lain-loader {
  position: fixed; inset: 0;
  background: #EAF6FF;
  z-index: 9999;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden;
}

.lain-loader-wave {
  position: absolute; bottom: 0; left: 0; right: 0;
  display: flex; align-items: flex-end; gap: 6px;
  height: 80px; padding: 0 20px;
}

.lain-loader-wave-bar {
  flex: 1;
  background: rgba(91, 189, 228, 0.25);
  border-radius: 4px 4px 0 0;
  animation: waveLoad 1.4s ease-in-out infinite alternate;
}

@keyframes waveLoad {
  from { height: 10px; }
  to   { height: 60px; }
}

.lain-loader-center {
  position: relative; z-index: 1;
  display: flex; flex-direction: column;
  align-items: center; gap: 20px;
}

.lain-loader-logo {
  font-family: 'Playfair Display', serif;
  font-size: clamp(40px, 8vw, 80px);
  font-weight: 900;
  color: #1a2a3a;
  letter-spacing: -0.02em;
}

.lain-loader-logo span {
  color: #5BBDE4;
}

.lain-loader-bar-wrap {
  width: 200px; height: 2px;
  background: rgba(91,189,228,0.2);
  border-radius: 2px; overflow: hidden;
}

.lain-loader-bar {
  height: 100%; width: 100%;
  background: linear-gradient(90deg, #5BBDE4, #87CEEB);
  border-radius: 2px;
  transform-origin: left center;
  transform: scaleX(0);
}

.lain-loader-count {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  color: rgba(26,42,58,0.5);
  letter-spacing: 0.1em;
}

.lain-loader-pct { margin-left: 2px; }

/* ── HEADER ─────────────────────────────────────────────────────── */

.lain-header {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 1000;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 40px;
  transition: background 0.4s ease, backdrop-filter 0.4s ease;
}

.lain-header.scrolled {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px);
  box-shadow: 0 1px 0 rgba(91,189,228,0.15);
}

.lain-header-logo {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 900;
  color: #1a2a3a;
  letter-spacing: -0.02em;
  cursor: pointer;
}

.lain-header-logo span { color: #5BBDE4; }

/* ── BURGER ─────────────────────────────────────────────────────── */

.lain-burger {
  background: none; border: none; cursor: pointer;
  padding: 8px; display: flex; flex-direction: column;
  gap: 5px; align-items: flex-end;
}

.lain-burger i {
  display: block; height: 2px; background: #1a2a3a;
  border-radius: 1px; transition: all 0.3s ease;
}

.lain-burger i:nth-child(1) { width: 26px; }
.lain-burger i:nth-child(2) { width: 18px; }
.lain-burger i:nth-child(3) { width: 26px; }

.lain-burger.open i:nth-child(1) { transform: translateY(7px) rotate(45deg); width: 24px; }
.lain-burger.open i:nth-child(2) { opacity: 0; }
.lain-burger.open i:nth-child(3) { transform: translateY(-7px) rotate(-45deg); width: 24px; }

/* ── NAV OVERLAY ─────────────────────────────────────────────────── */

.lain-nav-overlay {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(20, 40, 60, 0.5);
  backdrop-filter: blur(4px);
}

.lain-nav-panel {
  position: absolute; top: 0; right: 0; bottom: 0;
  width: min(380px, 90vw);
  background: #EAF6FF;
  display: flex; flex-direction: column;
  justify-content: center;
  padding: 60px 48px;
  gap: 0;
}

.lain-nav-panel ul { display: flex; flex-direction: column; gap: 8px; margin-bottom: 48px; }

.lain-nav-link {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  color: #1a2a3a;
  opacity: 0;
  letter-spacing: -0.01em;
  display: block;
  padding: 8px 0;
  transition: color 0.2s, letter-spacing 0.3s;
}

.lain-nav-link:hover { color: #5BBDE4; letter-spacing: 0.01em; }

.lain-nav-socials {
  display: flex; gap: 16px;
  border-top: 1px solid rgba(91,189,228,0.3);
  padding-top: 24px;
}

.lain-nav-socials a {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(26,42,58,0.6);
  transition: color 0.2s;
}
.lain-nav-socials a:hover { color: #5BBDE4; }

/* ── BUTTONS ─────────────────────────────────────────────────────── */

.lain-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 28px;
  border-radius: 100px;
  font-family: 'Nunito', sans-serif;
  font-size: 14px; font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  white-space: nowrap;
}

.lain-btn-primary {
  background: linear-gradient(135deg, #5BBDE4, #87CEEB);
  color: #fff;
  box-shadow: 0 4px 20px rgba(91,189,228,0.35);
}

.lain-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(91,189,228,0.45);
}

.lain-btn-ghost {
  background: transparent;
  color: #1a2a3a;
  border-color: rgba(91,189,228,0.5);
}

.lain-btn-ghost:hover {
  background: rgba(91,189,228,0.08);
  border-color: #5BBDE4;
  transform: translateY(-2px);
}

/* ── HERO ─────────────────────────────────────────────────────────── */

.lain-hero {
  position: relative; min-height: 100vh;
  display: flex; align-items: center;
  padding: 120px 40px 80px;
  overflow: hidden;
  background: linear-gradient(160deg, #f0faff 0%, #e6f4fb 40%, #f8fbff 100%);
}

.lain-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.55;
}

.lain-blob-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #B0E0F5 0%, #7EC8E3 60%, transparent 100%);
  top: -15%; right: -10%;
}

.lain-blob-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #D0EEFF 0%, #A8D8EA 70%, transparent 100%);
  bottom: -5%; left: -8%;
}

.lain-blob-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #E8F8FF 0%, #BEE5F5 70%, transparent 100%);
  top: 50%; left: 40%;
}

.lain-hero-glyphs {
  position: absolute; inset: 0; pointer-events: none;
}

.lain-glyph {
  position: absolute;
  left: var(--x);
  top: var(--top);
  color: rgba(91,189,228,0.35);
  font-size: clamp(12px, 1.5vw, 20px);
  animation: floatGlyph 5s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes floatGlyph {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%       { transform: translateY(-12px) rotate(8deg); }
}

.lain-hero-inner {
  position: relative; z-index: 2;
  max-width: 640px;
  display: flex; flex-direction: column; gap: 20px;
}

.lain-hero-eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #5BBDE4;
}

.lain-hero-title-wrap {
  display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 8px;
  line-height: 1;
}

.lain-hero-letter {
  font-family: 'Playfair Display', serif;
  font-size: clamp(72px, 11vw, 140px);
  font-weight: 900;
  color: #1a2a3a;
  display: inline-block;
  letter-spacing: -0.04em;
  line-height: 0.9;
}

.lain-hero-num {
  font-family: 'Space Mono', monospace;
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 700;
  color: #5BBDE4;
  letter-spacing: -0.02em;
  align-self: flex-end;
  margin-bottom: 14px;
}

.lain-hero-sub {
  font-size: 16px;
  line-height: 1.7;
  color: rgba(26,42,58,0.65);
  max-width: 480px;
}

.lain-hero-ctas {
  display: flex; gap: 12px; flex-wrap: wrap;
  margin-top: 8px;
}

.lain-hero-scroll-hint {
  display: flex; align-items: center; gap: 10px;
  margin-top: 20px;
  font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(26,42,58,0.35);
}

.lain-scroll-line {
  display: block; width: 40px; height: 1px;
  background: rgba(91,189,228,0.5);
}

.lain-hero-art {
  position: absolute; right: 6%; top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: clamp(280px, 35vw, 480px);
  transition: transform 0.15s ease-out;
}

.lain-hero-art img {
  width: 100%; height: auto;
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(91,189,228,0.25), 0 8px 24px rgba(0,0,0,0.08);
  object-fit: cover;
  aspect-ratio: 3/4;
}

.lain-hero-art-badge {
  position: absolute; bottom: 24px; left: -24px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(91,189,228,0.2);
  border-radius: 16px;
  padding: 12px 18px;
  display: flex; flex-direction: column; gap: 2px;
  box-shadow: 0 8px 32px rgba(91,189,228,0.15);
  min-width: 140px;
}

.lain-hero-art-badge span:first-child {
  font-size: 18px;
}
.lain-hero-art-badge span:nth-child(2) {
  font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.1em;
  color: rgba(26,42,58,0.5); text-transform: uppercase;
}
.lain-hero-art-badge strong {
  font-size: 14px; font-weight: 700; color: #5BBDE4;
}

/* ── INTRO STRIP ─────────────────────────────────────────────────── */

.lain-intro-strip {
  background: #1a2a3a;
  padding: 80px 40px;
  overflow: hidden;
}

.lain-intro-strip-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 60px; align-items: center;
}

.lain-intro-label {
  display: flex; align-items: center;
}

.lain-vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  white-space: nowrap;
}

.lain-intro-statement p {
  font-family: 'Playfair Display', serif;
  font-size: clamp(18px, 2.5vw, 26px);
  font-style: italic;
  color: rgba(255,255,255,0.85);
  line-height: 1.65;
  margin: 0 0 12px;
}

.lain-intro-date {
  font-family: 'Space Mono', monospace !important;
  font-size: 11px !important; font-style: normal !important;
  color: rgba(91,189,228,0.6) !important;
  letter-spacing: 0.15em !important;
  text-transform: uppercase;
}

.lain-intro-stat-col {
  display: flex; flex-direction: column; gap: 28px;
}

.lain-intro-stat {
  display: flex; flex-direction: column; gap: 2px;
}

.lain-intro-stat strong {
  font-family: 'Playfair Display', serif;
  font-size: 32px; font-weight: 900;
  color: #5BBDE4; line-height: 1;
}

.lain-intro-stat span {
  font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}

/* ── SECTION SHARED ──────────────────────────────────────────────── */

.lain-section-head {
  max-width: 1200px; margin: 0 auto 64px;
  padding: 0 40px;
  display: flex; flex-direction: column; gap: 12px;
}

.lain-section-eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.2em;
  text-transform: uppercase; color: #5BBDE4;
}

.lain-section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 900; line-height: 1.1;
  color: #1a2a3a; margin: 0;
  letter-spacing: -0.02em;
}

.lain-section-title em {
  font-style: italic; color: #5BBDE4;
}

.lain-section-sub {
  font-size: 16px; color: rgba(26,42,58,0.55);
  max-width: 520px; line-height: 1.7; margin: 0;
}

/* ── WORKS ───────────────────────────────────────────────────────── */

.lain-works {
  padding: 120px 0;
  background: #ffffff;
}

.lain-works-chapters {
  display: flex; flex-direction: column; gap: 0;
}

.lain-work-chapter {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 560px;
  overflow: hidden;
}

.lain-work-chapter.wc-right {
  direction: rtl;
}
.lain-work-chapter.wc-right > * {
  direction: ltr;
}

.wc-img-wrap {
  position: relative; overflow: hidden;
}

.wc-img-inner {
  position: absolute; inset: 0; overflow: hidden;
}

.wc-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.lain-work-chapter:hover .wc-img {
  transform: scale(1.04);
}

.wc-num {
  position: absolute; bottom: 24px; left: 24px;
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.2em;
  color: rgba(255,255,255,0.5);
  z-index: 2;
}

.wc-text {
  background: #F7FBFF;
  padding: clamp(40px, 6vw, 80px);
  display: flex; flex-direction: column;
  justify-content: center; gap: 20px;
}

.wc-tagline {
  font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(26,42,58,0.35);
}

.wc-headline {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 3.5vw, 44px);
  font-weight: 900; line-height: 1.15;
  color: #1a2a3a; margin: 0;
  letter-spacing: -0.02em;
}

.wc-desc {
  font-size: 15px; line-height: 1.75;
  color: rgba(26,42,58,0.6); margin: 0;
  max-width: 440px;
}

.wc-accent-line {
  height: 3px; width: 48px;
  border-radius: 2px;
}

/* ── MARQUEE ─────────────────────────────────────────────────────── */

.lain-marquee-wrap {
  overflow: hidden;
  background: #EAF6FF;
  padding: 20px 0;
  border-top: 1px solid rgba(91,189,228,0.15);
  border-bottom: 1px solid rgba(91,189,228,0.15);
}

.lain-marquee {
  overflow: hidden;
}

.lain-marquee-track {
  display: flex; gap: 0;
  animation: marqueeScroll 28s linear infinite;
  white-space: nowrap;
}

@keyframes marqueeScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.lain-marquee-item {
  font-family: 'Space Mono', monospace;
  font-size: 12px; letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(26,42,58,0.55);
  padding: 0 20px;
  white-space: nowrap;
}

.lain-marquee-dot {
  color: #5BBDE4;
  padding: 0 8px;
  font-size: 18px;
}

/* ── GALLERY ─────────────────────────────────────────────────────── */

.lain-gallery {
  padding: 120px 40px;
  background: #ffffff;
  overflow: hidden;
}

.lain-gallery-row {
  display: flex; gap: 16px;
  margin-bottom: 16px;
  padding: 0 40px;
  will-change: transform;
}

.lain-gallery-row-top { transform: translateX(-4%); }
.lain-gallery-row-bot { transform: translateX(4%); }

.lain-gallery-card {
  position: relative;
  flex: 0 0 clamp(180px, 22vw, 300px);
  height: clamp(220px, 28vw, 380px);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(91,189,228,0.1);
}

.lain-gallery-card img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.lain-gallery-card:hover img {
  transform: scale(1.06);
}

.lain-gallery-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(91,189,228,0.7) 0%, transparent 60%);
  opacity: 0;
  display: flex; align-items: flex-end; justify-content: flex-start;
  padding: 20px;
  transition: opacity 0.3s ease;
}

.lain-gallery-card:hover .lain-gallery-card-overlay {
  opacity: 1;
}

.lain-gallery-card-overlay span {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.15em;
  text-transform: uppercase; color: #fff;
}

/* ── COMMISSIONS ─────────────────────────────────────────────────── */

.lain-commissions {
  padding: 120px 40px;
  background: #F7FBFF;
}

.lain-tiers-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.lain-tier-card {
  background: #ffffff;
  border: 1.5px solid rgba(91,189,228,0.15);
  border-radius: 24px;
  padding: 36px 32px;
  display: flex; flex-direction: column; gap: 20px;
  position: relative;
  box-shadow: 0 4px 24px rgba(91,189,228,0.06);
  transition: box-shadow 0.3s ease;
}

.lain-tier-card:hover {
  box-shadow: 0 12px 48px rgba(91,189,228,0.18);
}

.tier-featured {
  border-color: #5BBDE4;
  box-shadow: 0 8px 40px rgba(91,189,228,0.2);
}

.tier-badge {
  position: absolute; top: -14px; left: 28px;
  background: linear-gradient(135deg, #5BBDE4, #87CEEB);
  color: #fff;
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.1em;
  padding: 4px 14px; border-radius: 100px;
}

.tier-accent-dot {
  width: 32px; height: 4px;
  border-radius: 2px;
}

.tier-header {
  display: flex; flex-direction: column; gap: 4px;
}

.tier-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700;
  color: #1a2a3a; margin: 0;
}

.tier-price {
  font-family: 'Space Mono', monospace;
  font-size: 13px; color: #5BBDE4;
  font-weight: 700; margin: 0;
}

.tier-desc {
  font-size: 14px; color: rgba(26,42,58,0.6);
  line-height: 1.65; margin: 0;
}

.tier-features {
  display: flex; flex-direction: column; gap: 8px;
  flex: 1;
}

.tier-features li {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: rgba(26,42,58,0.7);
}

.tier-check {
  color: #5BBDE4; font-size: 10px;
}

.tier-ctas {
  display: flex; flex-direction: column; gap: 8px;
}

.tier-cta {
  width: 100%;
  font-size: 13px; padding: 11px 20px;
}

.lain-comm-notice {
  max-width: 1200px; margin: 48px auto 0;
  padding: 0 4px;
  text-align: center;
}

.lain-comm-notice p {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.05em;
  color: rgba(26,42,58,0.35); line-height: 1.6;
}

/* ── ABOUT ────────────────────────────────────────────────────────── */

.lain-about {
  padding: 120px 40px;
  background: #ffffff;
  position: relative; overflow: hidden;
}

.about-bg-text {
  position: absolute;
  top: 50%; left: -2%;
  transform: translateY(-50%);
  font-family: 'Playfair Display', serif;
  font-size: clamp(160px, 22vw, 320px);
  font-weight: 900;
  color: rgba(91,189,228,0.06);
  white-space: nowrap; pointer-events: none;
  letter-spacing: -0.06em; line-height: 1;
  user-select: none;
}

.lain-about-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 80px; align-items: center;
  position: relative; z-index: 1;
}

.lain-about-img-col {
  position: relative;
}

.lain-about-img-frame {
  border-radius: 28px; overflow: hidden;
  box-shadow: 0 24px 80px rgba(91,189,228,0.2);
  aspect-ratio: 3/4;
}

.lain-about-img-frame img {
  width: 100%; height: 100%; object-fit: cover;
}

.lain-about-img-tag {
  position: absolute;
  bottom: 32px; right: -20px;
  background: #1a2a3a;
  padding: 20px 12px;
  border-radius: 12px;
}

.lain-about-text-col {
  display: flex; flex-direction: column; gap: 20px;
}

.lain-about-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(40px, 5vw, 60px);
  font-weight: 900; line-height: 1.15;
  color: #1a2a3a; margin: 0;
  letter-spacing: -0.02em;
}

.lain-about-title em { font-style: italic; color: #5BBDE4; }

.lain-about-p {
  font-size: 15px; line-height: 1.8;
  color: rgba(26,42,58,0.65); margin: 0;
}

.lain-about-tags {
  display: flex; flex-wrap: wrap; gap: 8px;
}

.lain-tag {
  font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase;
  background: #EAF6FF;
  color: #5BBDE4;
  padding: 5px 12px; border-radius: 100px;
  border: 1px solid rgba(91,189,228,0.25);
}

.lain-about-links {
  display: flex; gap: 12px; flex-wrap: wrap;
}

/* ── CONTACT ─────────────────────────────────────────────────────── */

.lain-contact {
  padding: 120px 40px 0;
  background: #F7FBFF;
  position: relative; overflow: hidden;
}

.lain-contact-inner {
  max-width: 900px; margin: 0 auto;
  display: flex; flex-direction: column;
  align-items: center; gap: 24px; text-align: center;
  padding-bottom: 100px;
}

.lain-contact-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 900; line-height: 1.15;
  color: #1a2a3a; margin: 0;
  letter-spacing: -0.02em;
}

.lain-contact-title em { font-style: italic; color: #5BBDE4; }

.lain-contact-sub {
  font-size: 16px; color: rgba(26,42,58,0.55);
  max-width: 440px; line-height: 1.7; margin: 0;
}

.lain-contact-cards {
  display: flex; gap: 16px; flex-wrap: wrap;
  justify-content: center; margin-top: 8px;
}

.lain-contact-card {
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  background: #ffffff;
  border: 1.5px solid rgba(91,189,228,0.2);
  border-radius: 20px;
  padding: 28px 40px;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(91,189,228,0.08);
  transition: box-shadow 0.3s;
  cursor: pointer;
}

.lain-contact-card:hover {
  box-shadow: 0 12px 40px rgba(91,189,228,0.2);
}

.lain-contact-card-icon { font-size: 28px; }

.lain-contact-card strong {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 700; color: #1a2a3a;
}

.lain-contact-card span {
  font-family: 'Space Mono', monospace;
  font-size: 12px; color: rgba(26,42,58,0.45);
}

.lain-contact-note {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.05em;
  color: rgba(26,42,58,0.35); line-height: 1.7;
  max-width: 440px;
}

.lain-contact-wave {
  width: 100%; line-height: 0;
}

.lain-contact-wave svg {
  width: 100%; display: block;
}

/* ── FOOTER ─────────────────────────────────────────────────────── */

.lain-footer {
  background: #1a2a3a;
  padding: 64px 40px 0;
  overflow: hidden;
}

.lain-footer-inner {
  max-width: 900px; margin: 0 auto;
  display: flex; flex-direction: column;
  align-items: center; gap: 16px; text-align: center;
  padding-bottom: 48px;
}

.lain-footer-logo {
  font-family: 'Playfair Display', serif;
  font-size: 36px; font-weight: 900;
  color: #fff; letter-spacing: -0.02em;
}

.lain-footer-logo span { color: #5BBDE4; }

.lain-footer-tagline {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3); margin: 0;
}

.lain-footer-links {
  display: flex; gap: 24px;
}

.lain-footer-links a {
  font-family: 'Space Mono', monospace;
  font-size: 12px; letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(91,189,228,0.7);
  transition: color 0.2s;
}

.lain-footer-links a:hover { color: #5BBDE4; }

.lain-footer-copy {
  font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.08em;
  color: rgba(255,255,255,0.2); margin: 0;
}

.lain-footer-sea {
  display: flex; align-items: flex-end; gap: 4px;
  height: 48px; padding: 0 20px;
}

.lain-footer-wave-bar {
  flex: 1;
  background: rgba(91,189,228,0.15);
  border-radius: 4px 4px 0 0;
  animation: footerWave 1.8s ease-in-out infinite alternate;
}

@keyframes footerWave {
  from { height: 6px; }
  to   { height: 36px; }
}

/* ── RESPONSIVE ─────────────────────────────────────────────────── */

@media (max-width: 900px) {
  .lain-hero { padding: 100px 24px 60px; }
  .lain-hero-inner { max-width: 100%; }
  .lain-hero-art {
    position: relative; right: auto; top: auto;
    transform: none; width: 100%;
    margin-top: 40px;
  }
  .lain-hero {
    flex-direction: column; align-items: flex-start;
    height: auto;
  }
  .lain-intro-strip-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .lain-intro-label { display: none; }
  .lain-intro-stat-col { flex-direction: row; justify-content: center; }
  .lain-work-chapter {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  .wc-img-wrap { height: 300px; position: relative; }
  .lain-work-chapter.wc-right { direction: ltr; }
  .lain-about-inner { grid-template-columns: 1fr; gap: 40px; }
  .lain-about-img-col { max-width: 400px; }
  .lain-gallery-row { padding: 0 16px; }
  .lain-section-head { padding: 0 24px; }
  .lain-header { padding: 16px 24px; }
}

@media (prefers-reduced-motion: reduce) {
  .lain-glyph { animation: none; }
  .lain-loader-wave-bar { animation: none; height: 30px; }
  .lain-marquee-track { animation: none; }
  .lain-footer-wave-bar { animation: none; height: 20px; }
}

/* @arkzen:web:style:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

export const lain098Animations = (pageRef: React.RefObject<HTMLDivElement>) => {
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    // Parallax hero blob on scroll
    gsap.to('.lain-blob-1', {
      yPercent: 30, ease: 'none',
      scrollTrigger: {
        trigger: '.lain-hero', start: 'top top', end: 'bottom top', scrub: true,
      },
    })
    gsap.to('.lain-blob-2', {
      yPercent: -20, ease: 'none',
      scrollTrigger: {
        trigger: '.lain-hero', start: 'top top', end: 'bottom top', scrub: true,
      },
    })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit:    { opacity: 0,       transition: { duration: 0.25 } },
}
/* @arkzen:web:animation:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB PAGE: INDEX
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => {
  const [loaded, setLoaded] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaded) return
    lain098Animations(pageRef as React.RefObject<HTMLDivElement>)
  }, [loaded])

  return (
    <>
      <AnimatePresence>
        {!loaded && <LainLoader onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <motion.div
          ref={pageRef}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <LainCursor />
          <LainNav />
          <HeroSection />
          <IntroStrip />
          <WorksSection />
          <SkillsMarquee />
          <GalleryStrip />
          <CommissionsSection />
          <AboutSection />
          <ContactSection />
          <Footer />
        </motion.div>
      )}
    </>
  )
}

/* @arkzen:web:page:index:end */
