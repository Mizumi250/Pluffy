/* @arkzen:meta
name: ethan-pool
version: 1.0.1
description: "Ethan Pool — Luxury aquatic resort landing page tatemono. Structural & animation port of a luxury hotel one-page template: fullscreen hero with morning-pool imagery, full-bleed banner with text reveal, horizontally scrollable room carousel, sticky info/amenities section, gallery grid, blog carousel, location/contact split, newsletter signup, sticky booking bar, promo modal and lightbox gallery modal. GSAP + ScrollTrigger entrance/scroll animations, fade-in/fade-up reveals, parallax images. English copy, plain sans-serif typography, no marquee/ticker/pin elements. Frontend-only, demo content with stock placeholder imagery. DISCLAIMER: Ethan Pool is a fictional demo business — all content, names and imagery are placeholders for showcase purposes only."
auth: false
*/

/* @arkzen:meta:web
favicon: 🏊
title: Ethan Pool | Luxury Aquatic Resort & Spa
description: Ethan Pool — a luxury aquatic resort retreat. Infinity pools, morning swims and spa rituals in a serene waterfront setting. Demo showcase site.
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "ep-root"
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'The Resort', href: '#resort' },
  { label: 'Rooftop Pool', href: '#rooftop' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Offers', href: '#offers' },
]

const ROOMS = [
  {
    id: 'infinity-suite',
    name: 'Infinity Pool Suite',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=900&auto=format&fit=crop',
    tag: 'offer',
  },
  {
    id: 'morning-cabana',
    name: 'Morning Pool Cabana',
    img: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'lagoon-villa',
    name: 'Lagoon Pool Villa',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'pool-view-room',
    name: 'Pool View Room',
    img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'rooftop-penthouse',
    name: 'Rooftop Pool Penthouse',
    img: 'https://images.unsplash.com/photo-1582610116397-edb318620f90?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'garden-bungalow',
    name: 'Garden Pool Bungalow',
    img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'sunrise-suite',
    name: 'Sunrise Pool Suite',
    img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=900&auto=format&fit=crop',
  },
]

const AMENITIES = [
  {
    label: 'Rooftop Infinity Pool',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600&auto=format&fit=crop',
  },
  {
    label: 'Morning Lap Pool',
    img: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=600&auto=format&fit=crop',
  },
  {
    label: 'Poolside Spa & Wellness',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
  },
]

const GALLERY_MEDIA = [
  'https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=700&auto=format&fit=crop',
]

const BLOG_POSTS = [
  {
    tag: 'EXPERIENCES',
    title: 'Morning swims: why sunrise is the best time at the Ethan Pool rooftop',
    img: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=700&auto=format&fit=crop',
    href: '#blog-1',
  },
  {
    tag: 'WELLNESS',
    title: 'A guide to our spa rituals: hydrotherapy, sauna and contrast baths',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=700&auto=format&fit=crop',
    href: '#blog-2',
  },
  {
    tag: 'FOOD & DRINK',
    title: 'Poolside cocktails: the new menu at the Lagoon Bar',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=700&auto=format&fit=crop',
    href: '#blog-3',
  },
  {
    tag: 'GETAWAYS',
    title: 'Family weekends: pool activities for every age',
    img: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=700&auto=format&fit=crop',
    href: '#blog-4',
  },
  {
    tag: 'DESIGN',
    title: 'The architecture of water: how our infinity pools were designed',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=700&auto=format&fit=crop',
    href: '#blog-5',
  },
]

const LOGOS = ['AQUA AWARDS', 'WELLNESS+', 'RESORT GUIDE', 'BLUE STAR', 'TRAVEL CIRCLE', 'SPA SELECT']

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const useMounted = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

const EpHeader = ({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) => {
  return (
    <header className="ep-header" data-fade="fade-down">
      <div className="ep-header-inner">
        <a href="#top" className="ep-logo">
          <span className="ep-logo-mark">⌬</span>
          <span className="ep-logo-text">ETHAN<span>POOL</span></span>
        </a>

        <nav className="ep-nav-desktop">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="ep-link-underline">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ep-header-right">
          <a href="#contact" className="ep-link-underline ep-contact-link">Contact</a>
          <button
            className={`ep-menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}

// ─── NAV DRAWER ───────────────────────────────────────────────────────────────

const EpNavDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <nav className={`ep-drawer ${open ? 'open' : ''}`}>
      <div className="ep-drawer-inner">
        <a href="#top" className="ep-drawer-logo" onClick={onClose}>
          <span className="ep-logo-mark">⌬</span>
          <span className="ep-logo-text">ETHAN<span>POOL</span></span>
        </a>

        <ul className="ep-drawer-links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={onClose}>{l.label}</a>
            </li>
          ))}
          <li><a href="#about" onClick={onClose}>About Us</a></li>
          <li><a href="#contact" onClick={onClose}>Contact &amp; Directions</a></li>
          <li><a href="#blog" onClick={onClose}>Blog</a></li>
        </ul>

        <div className="ep-drawer-bottom">
          <div className="ep-drawer-contact">
            <address>12 Lagoon Promenade<br />20003 San Sebastián, Spain</address>
            <ul>
              <li><a href="mailto:hello@ethanpool.com">hello@ethanpool.com</a></li>
              <li><a href="tel:+34943000000">T. +34 943 000 000</a></li>
            </ul>
          </div>
          <div className="ep-drawer-social">
            <p>Follow Us</p>
            <ul>
              <li><a href="https://facebook.com" target="_blank" rel="noopener">FB</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener">IG</a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noopener">TT</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener">YT</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ─── PROMO MODAL ──────────────────────────────────────────────────────────────

const EpPromoModal = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 1400)
    return () => clearTimeout(t)
  }, [])

  if (!open) return null

  return (
    <div className={`ep-modal ep-modal-promo ${open ? 'open' : ''}`}>
      <div className="ep-modal-dialog">
        <div className="ep-modal-content">
          <button className="ep-modal-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          <div className="ep-promo-grid">
            <div className="ep-promo-img">
              <img
                src="https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=900&auto=format&fit=crop"
                alt="Ethan Pool morning offer"
              />
            </div>
            <div className="ep-promo-text">
              <h3 className="ep-subtitle">Calm waters, golden light</h3>
              <h2 className="ep-title">Summer at Ethan Pool: 20% off with code ETHAN26</h2>
              <p className="ep-featured"><strong>For stays through August 31st</strong></p>
              <p className="ep-text">
                Summer transforms the lagoon, stretches the evenings by the water and fills every
                corner of the resort with life. Enjoy <strong>20% off</strong> when you book your stay.
              </p>
              <a href="#rooms" className="ep-btn ep-btn-stroke ep-btn-green" onClick={() => setOpen(false)}>
                <span className="ep-btn-label">Use code ETHAN26 <i className="ep-arrow">→</i></span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="ep-modal-backdrop" onClick={() => setOpen(false)} />
    </div>
  )
}

// ─── GALLERY MODAL ────────────────────────────────────────────────────────────

const EpGalleryModal = ({
  open,
  onClose,
  images,
  index,
  setIndex,
}: {
  open: boolean
  onClose: () => void
  images: string[]
  index: number
  setIndex: (i: number) => void
}) => {
  if (!open) return null

  const prev = () => setIndex((index - 1 + images.length) % images.length)
  const next = () => setIndex((index + 1) % images.length)

  return (
    <div className="ep-modal ep-modal-gallery open">
      <button className="ep-modal-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="ep-modal-dialog">
        <div className="ep-gallery-arrow ep-gallery-prev" onClick={prev}>‹</div>
        <div className="ep-gallery-main">
          <img src={images[index]} alt={`Ethan Pool gallery ${index + 1}`} />
        </div>
        <div className="ep-gallery-arrow ep-gallery-next" onClick={next}>›</div>
      </div>
      <div className="ep-gallery-thumbs">
        {images.map((src, i) => (
          <button
            key={src + i}
            className={`ep-gallery-thumb ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          >
            <img src={src} alt={`Thumbnail ${i + 1}`} />
          </button>
        ))}
      </div>
      <div className="ep-modal-backdrop" onClick={onClose} />
    </div>
  )
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
/* ethan-pool v1 — luxury aquatic resort stylesheet, structural port */

.ep-root {
  margin: 0; padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-weight: 400;
  color: #14313a;
  background: #f3f7f8;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.ep-root * { box-sizing: border-box; }
.ep-root a { text-decoration: none; color: inherit; }
.ep-root ul { list-style: none; margin: 0; padding: 0; }
.ep-root img { max-width: 100%; display: block; }

.ep-root .ep-p-section {
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #4fa8b8;
  font-weight: 600;
  margin: 0 0 14px;
}

.ep-root .ep-title {
  font-family: inherit;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0;
}

.ep-root .ep-subtitle {
  font-family: inherit;
  font-style: normal;
  font-weight: 600;
  color: #4fa8b8;
  margin: 0 0 8px;
}

.ep-root .ep-text { font-size: 15px; line-height: 1.7; color: #44606b; }

/* ─── BUTTONS ──────────────────────── */
.ep-root .ep-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  border: 1px solid #14313a;
  border-radius: 999px;
  color: #14313a;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  transition: color 0.4s ease;
}
.ep-root .ep-btn-label { position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 8px; }
.ep-root .ep-btn::before {
  content: '';
  position: absolute; inset: 0;
  background: #14313a;
  transform: translateY(101%);
  transition: transform 0.4s cubic-bezier(.65,0,.35,1);
  z-index: 1;
}
.ep-root .ep-btn:hover { color: #f3f7f8; }
.ep-root .ep-btn:hover::before { transform: translateY(0); }
.ep-root .ep-btn-green { border-color: #2f7d8c; color: #2f7d8c; }
.ep-root .ep-btn-green::before { background: #2f7d8c; }
.ep-root .ep-btn-green:hover { color: #fff; }
.ep-root .ep-btn-white { border-color: rgba(255,255,255,0.5); color: #fff; }
.ep-root .ep-btn-white::before { background: #fff; }
.ep-root .ep-btn-white:hover { color: #14313a; }
.ep-root .ep-arrow { display: inline-block; transition: transform 0.3s ease; }
.ep-root .ep-btn:hover .ep-arrow { transform: translateX(4px); }
.ep-root .ep-btn-underline {
  font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;
  font-weight: 600; color: #14313a;
  border-bottom: 1px solid currentColor; padding-bottom: 2px;
  transition: opacity 0.3s ease;
}
.ep-root .ep-btn-underline:hover { opacity: 0.55; }

/* ─── HEADER ───────────────────────── */
.ep-root .ep-header {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 500;
  padding: 22px 5%;
  display: flex; align-items: center;
  mix-blend-mode: difference;
  color: #fff;
  transition: padding 0.4s ease;
}
.ep-root.scrolled .ep-header { padding: 14px 5%; }
.ep-root .ep-header-inner {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
}
.ep-root .ep-logo {
  display: flex; align-items: center; gap: 8px;
  font-family: inherit;
  font-size: 22px; letter-spacing: 0.05em;
  color: #fff;
}
.ep-root .ep-logo-mark { font-size: 22px; }
.ep-root .ep-logo-text span { font-style: italic; opacity: 0.7; margin-left: 4px; }

.ep-root .ep-nav-desktop { display: none; }
.ep-root .ep-nav-desktop ul { display: flex; gap: 34px; }
.ep-root .ep-nav-desktop a {
  font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500;
}

.ep-root .ep-link-underline { position: relative; }
.ep-root .ep-link-underline::after {
  content: ''; position: absolute; left: 0; bottom: -4px;
  width: 100%; height: 1px; background: currentColor;
  transform: scaleX(0); transform-origin: right; transition: transform 0.4s cubic-bezier(.65,0,.35,1);
}
.ep-root .ep-link-underline:hover::after { transform: scaleX(1); transform-origin: left; }

.ep-root .ep-header-right { display: flex; align-items: center; gap: 28px; }
.ep-root .ep-contact-link { display: none; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; }

.ep-root .ep-menu-toggle {
  display: flex; flex-direction: column; gap: 5px; justify-content: center;
  width: 34px; height: 24px; background: none; border: none; cursor: pointer; padding: 0;
}
.ep-root .ep-menu-toggle span {
  display: block; height: 1.5px; background: #fff; border-radius: 2px;
  transition: transform 0.35s cubic-bezier(.65,0,.35,1), opacity 0.25s ease, width 0.35s ease;
}
.ep-root .ep-menu-toggle span:nth-child(1) { width: 34px; }
.ep-root .ep-menu-toggle span:nth-child(2) { width: 24px; align-self: flex-end; }
.ep-root .ep-menu-toggle span:nth-child(3) { width: 34px; }
.ep-root .ep-menu-toggle.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); width: 34px; }
.ep-root .ep-menu-toggle.open span:nth-child(2) { opacity: 0; }
.ep-root .ep-menu-toggle.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); width: 34px; }

/* ─── NAV DRAWER ───────────────────── */
.ep-root .ep-drawer {
  position: fixed; inset: 0; z-index: 400;
  background: #14313a;
  color: #f3f7f8;
  transform: translateY(-100%);
  transition: transform 0.7s cubic-bezier(.77,0,.18,1);
  display: flex; align-items: center; justify-content: center;
  overflow-y: auto; padding: 100px 6% 60px;
}
.ep-root .ep-drawer.open { transform: translateY(0); }
.ep-root .ep-drawer-inner { width: 100%; max-width: 1100px; display: flex; flex-direction: column; gap: 50px; }
.ep-root .ep-drawer-logo { font-family: inherit; font-size: 22px; align-self: center; display: flex; gap: 8px; color: #fff; }
.ep-root .ep-drawer-logo span:last-child span { font-style: italic; opacity: 0.6; margin-left: 4px; }
.ep-root .ep-drawer-links { display: flex; flex-direction: column; gap: 18px; text-align: center; }
.ep-root .ep-drawer-links a {
  font-family: inherit;
  font-size: clamp(32px, 7vw, 64px);
  font-weight: 500;
  transition: opacity 0.3s ease, letter-spacing 0.3s ease;
}
.ep-root .ep-drawer-links a:hover { opacity: 0.6; letter-spacing: 0.04em; }
.ep-root .ep-drawer-bottom {
  display: flex; flex-wrap: wrap; gap: 40px; justify-content: space-between;
  border-top: 1px solid rgba(255,255,255,0.15); padding-top: 30px;
  font-size: 13px; letter-spacing: 0.05em;
}
.ep-root .ep-drawer-contact address { font-style: normal; opacity: 0.7; margin-bottom: 10px; line-height: 1.6; }
.ep-root .ep-drawer-contact ul { display: flex; flex-direction: column; gap: 4px; }
.ep-root .ep-drawer-contact a:hover { opacity: 0.6; }
.ep-root .ep-drawer-social p { text-transform: uppercase; letter-spacing: 0.18em; opacity: 0.5; margin-bottom: 10px; font-size: 11px; }
.ep-root .ep-drawer-social ul { display: flex; gap: 16px; }
.ep-root .ep-drawer-social a {
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border: 1px solid rgba(255,255,255,0.25); border-radius: 50%;
  font-size: 11px; letter-spacing: 0.05em; transition: background 0.3s ease, color 0.3s ease;
}
.ep-root .ep-drawer-social a:hover { background: #4fa8b8; color: #14313a; border-color: #4fa8b8; }

/* ─── HERO ─────────────────────────── */
.ep-root .ep-hero {
  position: relative; height: 100vh; width: 100%; overflow: hidden;
}
.ep-root .ep-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; }
.ep-root .ep-hero-img img {
  width: 100%; height: 100%; object-fit: cover;
}
.ep-root .ep-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(20,49,58,0.15) 0%, rgba(20,49,58,0.55) 100%);
}
.ep-root .ep-hero-block {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
}
.ep-root .ep-hero-logo {
  font-family: inherit;
  color: #fff;
  font-size: clamp(60px, 14vw, 220px);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: 0.02em;
}
.ep-root .ep-hero-logo span { display: block; font-style: italic; font-size: 0.42em; opacity: 0.85; margin-top: 6px; letter-spacing: 0.3em; }
.ep-root .ep-hero-scroll {
  position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
  color: #fff; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase;
  display: flex; flex-direction: column; align-items: center; gap: 10px; opacity: 0.8;
}
.ep-root .ep-hero-scroll .ep-scroll-line { width: 1px; height: 40px; background: rgba(255,255,255,0.5); position: relative; overflow: hidden; }
.ep-root .ep-hero-scroll .ep-scroll-line::after {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 40%;
  background: #fff; animation: ep-scrollline 2.2s ease-in-out infinite;
}
@keyframes ep-scrollline { 0% { transform: translateY(-100%); } 50% { transform: translateY(150%); } 100% { transform: translateY(150%); } }

/* ─── BANNER FULL (text reveal section) ───── */
.ep-root .ep-banner-full {
  position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden;
}
.ep-root .ep-banner-img { position: absolute; inset: 0; width: 100%; height: 100%; }
.ep-root .ep-banner-img img { width: 100%; height: 100%; object-fit: cover; }
.ep-root .ep-banner-overlay { position: absolute; inset: 0; background: rgba(20,49,58,0.55); }
.ep-root .ep-banner-block {
  position: relative; z-index: 2; width: 100%;
  text-align: center; color: #fff; padding: 0 8%;
}
.ep-root .ep-banner-block .ep-p-section { color: #9fe0ea; }
.ep-root .ep-banner-block .ep-title {
  font-size: clamp(30px, 5.2vw, 70px); margin-bottom: 18px; color: #fff;
}
.ep-root .ep-banner-block .ep-subhead {
  font-size: clamp(16px, 1.7vw, 22px); line-height: 1.7; font-weight: 300; max-width: 880px; margin: 0 auto; color: rgba(255,255,255,0.92);
}

/* ─── PIN SPACERS ──────────────────── */
.ep-root .ep-bottom-scroll { height: 30vh; pointer-events: none; }

/* ─── ROOM CAROUSEL (coverflow arc) ───────── */
.ep-root .ep-carousel-section {
  background: #eaf3f4; padding: 100px 0 60px; position: relative;
}
.ep-root .ep-carousel-intro { text-align: center; padding: 0 6% 50px; }
.ep-root .ep-carousel-intro .ep-title { font-size: clamp(28px, 4vw, 54px); }
.ep-root .ep-carousel-cta { text-align: center; margin-bottom: 40px; }
.ep-root .ep-carousel-track-wrap {
  overflow-x: auto; overflow-y: visible; scrollbar-width: none; padding: 40px 0 30px;
  -webkit-overflow-scrolling: touch;
  perspective: 1400px; perspective-origin: 50% 50%;
}
.ep-root .ep-carousel-track-wrap::-webkit-scrollbar { display: none; }
.ep-root .ep-carousel-track {
  display: flex; align-items: center; gap: 0;
  width: max-content; padding: 0 42vw;
  transform-style: preserve-3d;
}
.ep-root .ep-room-card {
  position: relative; width: 280px; flex: none; margin: 0 -28px;
  border-radius: 22px; overflow: hidden; aspect-ratio: 3/4.6;
  box-shadow: 0 18px 45px -20px rgba(20,49,58,0.4);
  transform-origin: center center;
  transition: transform 0.4s cubic-bezier(.25,.8,.25,1), box-shadow 0.4s ease;
  will-change: transform;
}
.ep-root .ep-room-card img {
  width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(.25,.8,.25,1);
}
.ep-root .ep-room-card:hover img { transform: scale(1.06); }
.ep-root .ep-room-card.ep-offer::before {
  content: 'OFFER'; position: absolute; top: 16px; left: 16px; z-index: 3;
  background: #2f7d8c; color: #fff; font-size: 11px; letter-spacing: 0.15em;
  padding: 6px 14px; border-radius: 999px; font-weight: 600;
}
.ep-root .ep-room-card-overlay {
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(180deg, rgba(20,49,58,0) 40%, rgba(20,49,58,0.85) 100%);
  display: flex; flex-direction: column; justify-content: flex-end; padding: 24px;
  opacity: 0; transition: opacity 0.4s ease;
}
.ep-root .ep-room-card.ep-active .ep-room-card-overlay { opacity: 1; }
.ep-root .ep-room-card-overlay h3 {
  font-family: inherit; color: #fff; font-size: 24px; margin: 0 0 14px; font-weight: 500;
}
.ep-root .ep-room-card-overlay .ep-room-actions { display: flex; flex-direction: column; gap: 10px; }
.ep-root .ep-room-card-overlay .ep-btn { padding: 10px 20px; font-size: 11px; border-color: rgba(255,255,255,0.6); color: #fff; }
.ep-root .ep-room-card-overlay .ep-btn::before { background: #fff; }
.ep-root .ep-room-card-overlay .ep-btn:hover { color: #14313a; }
.ep-root .ep-room-card-overlay .ep-btn-underline { color: #fff; align-self: flex-start; }

/* fallback name label for non-active cards (overlay hidden until centered) */
.ep-root .ep-room-card-label {
  position: absolute; bottom: 18px; left: 18px; right: 18px; z-index: 2;
  color: #fff; font-size: 15px; font-weight: 600;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  opacity: 1; transition: opacity 0.4s ease;
}
.ep-root .ep-room-card.ep-active .ep-room-card-label { opacity: 0; }

@media (max-width: 640px) {
  .ep-root .ep-carousel-track { padding: 0 20vw; }
  .ep-root .ep-room-card { width: 220px; margin: 0 -16px; }
}

/* ─── INFO / AMENITIES (pinned split) ─────── */
.ep-root .ep-info-section { padding: 100px 0; background: #f3f7f8; }
.ep-root .ep-info-grid {
  display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center;
  padding: 0 6%;
}
.ep-root .ep-info-img { border-radius: 24px; overflow: hidden; aspect-ratio: 1/1; }
.ep-root .ep-info-img img { width: 100%; height: 100%; object-fit: cover; }
.ep-root .ep-info-text .ep-title { font-size: clamp(26px, 4vw, 46px); margin-bottom: 26px; }
.ep-root .ep-info-list { display: flex; flex-direction: column; gap: 0; margin: 30px 0; }
.ep-root .ep-info-list li {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 0; border-top: 1px solid rgba(20,49,58,0.12);
  font-size: 15px; letter-spacing: 0.04em; text-transform: uppercase; font-weight: 500;
}
.ep-root .ep-info-list li:last-child { border-bottom: 1px solid rgba(20,49,58,0.12); }
.ep-root .ep-info-list hr { display: none; }
.ep-root .ep-amenity-medias { display: flex; gap: 14px; margin: 26px 0; }
.ep-root .ep-amenity-medias img {
  width: 80px; height: 80px; object-fit: cover; border-radius: 14px;
}

/* ─── MULTIMEDIA / GALLERY GRID ─────── */
.ep-root .ep-multimedia {
  background: #14313a; color: #fff; padding: 100px 0;
}
.ep-root .ep-multimedia-head { text-align: center; padding: 0 6% 50px; }
.ep-root .ep-multimedia-head .ep-title { font-size: clamp(26px, 4vw, 48px); color: #fff; margin-bottom: 28px; max-width: 800px; margin-left: auto; margin-right: auto; }
.ep-root .ep-multimedia-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 0 6%;
}
.ep-root .ep-media {
  position: relative; aspect-ratio: 1/1; border-radius: 16px; overflow: hidden; cursor: pointer;
  background: rgba(255,255,255,0.04);
}
.ep-root .ep-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.ep-root .ep-media:hover img { transform: scale(1.08); }
.ep-root .ep-media-plus {
  position: absolute; top: 10px; right: 10px;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff;
}
.ep-root .ep-media.ep-media-webcam {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  text-transform: uppercase; font-size: 12px; letter-spacing: 0.15em;
}
.ep-root .ep-media-empty { background: rgba(255,255,255,0.03); border-radius: 16px; }

/* ─── BLOG ─────────────────────────── */
.ep-root .ep-blog-section { padding: 100px 0; background: #eaf3f4; }
.ep-root .ep-blog-head { text-align: center; padding: 0 6% 50px; max-width: 820px; margin: 0 auto; }
.ep-root .ep-blog-head .ep-title { font-size: clamp(26px, 4vw, 48px); }
.ep-root .ep-blog-track-wrap { overflow-x: auto; scrollbar-width: none; }
.ep-root .ep-blog-track-wrap::-webkit-scrollbar { display: none; }
.ep-root .ep-blog-track { display: flex; gap: 22px; width: max-content; padding: 0 6% 10px; }
.ep-root .ep-blog-card {
  width: 320px; flex: none; border-radius: 20px; overflow: hidden; background: #fff;
  box-shadow: 0 16px 40px -24px rgba(20,49,58,0.25);
}
.ep-root .ep-blog-card .ep-blog-img { aspect-ratio: 4/3; overflow: hidden; }
.ep-root .ep-blog-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.ep-root .ep-blog-card:hover img { transform: scale(1.06); }
.ep-root .ep-blog-card-text { padding: 24px; }
.ep-root .ep-blog-card-text .ep-p-section { margin-bottom: 10px; }
.ep-root .ep-blog-card-text h3 {
  font-family: inherit; font-size: 21px; font-weight: 500; line-height: 1.35; margin: 0 0 18px;
}
.ep-root .ep-blog-cta { text-align: center; margin-top: 40px; }

/* ─── LOCATION / CONTACT ───────────── */
.ep-root .ep-location { padding: 100px 0; background: #f3f7f8; }
.ep-root .ep-location-grid { display: grid; grid-template-columns: 1fr; gap: 40px; padding: 0 6%; align-items: center; }
.ep-root .ep-location-map { border-radius: 24px; overflow: hidden; aspect-ratio: 1/1; }
.ep-root .ep-location-map img { width: 100%; height: 100%; object-fit: cover; }
.ep-root .ep-location-text .ep-title { font-size: clamp(26px, 4vw, 46px); margin-bottom: 18px; }
.ep-root .ep-location-text address { font-style: normal; color: #44606b; margin-bottom: 22px; line-height: 1.7; }
.ep-root .ep-location-text .ep-btn-row { display: flex; flex-wrap: wrap; gap: 14px; margin: 22px 0; }
.ep-root .ep-location-text > a { display: block; color: #2f7d8c; font-weight: 600; margin-bottom: 6px; }
.ep-root .ep-location-social { display: flex; gap: 14px; margin-top: 24px; }
.ep-root .ep-location-social a {
  width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(20,49,58,0.18);
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
.ep-root .ep-location-social a:hover { background: #2f7d8c; color: #fff; border-color: #2f7d8c; }

/* ─── NEWSLETTER ───────────────────── */
.ep-root .ep-newsletter { padding: 90px 0; background: #14313a; color: #fff; text-align: center; }
.ep-root .ep-newsletter .ep-title { font-size: clamp(26px, 4vw, 44px); color: #fff; margin-bottom: 36px; }
.ep-root .ep-newsletter-form { max-width: 560px; margin: 0 auto; }
.ep-root .ep-newsletter-top { display: flex; gap: 12px; }
.ep-root .ep-newsletter-top input {
  flex: 1; padding: 16px 22px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.25);
  background: transparent; color: #fff; font-size: 14px; outline: none;
}
.ep-root .ep-newsletter-top input::placeholder { color: rgba(255,255,255,0.5); }
.ep-root .ep-newsletter-legal { margin-top: 18px; font-size: 12px; color: rgba(255,255,255,0.55); text-align: left; }
.ep-root .ep-newsletter-legal label { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; padding-left: 50px; }
.ep-root .ep-newsletter-result { margin-top: 14px; font-size: 13px; color: #9fe0ea; }

/* ─── LOGOS ────────────────────────── */
.ep-root .ep-logos { padding: 60px 6%; background: #f3f7f8; }
.ep-root .ep-logos-track {
  display: flex; flex-wrap: wrap; gap: 40px 60px;
  align-items: center; justify-content: center;
}
.ep-root .ep-logos-track span {
  font-size: 14px; letter-spacing: 0.14em; font-weight: 600;
  color: #44606b; white-space: nowrap; opacity: 0.6;
}

/* ─── FOOTER ───────────────────────── */
.ep-root .ep-footer { background: #14313a; color: #f3f7f8; padding: 60px 0 30px; }
.ep-root .ep-footer-grid {
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px; padding: 0 6% 40px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.ep-root .ep-footer-logo { font-family: inherit; font-size: 24px; display: flex; gap: 8px; }
.ep-root .ep-footer-logo span:last-child span { font-style: italic; opacity: 0.6; margin-left: 4px; }
.ep-root .ep-footer-links { display: flex; flex-wrap: wrap; gap: 40px; }
.ep-root .ep-footer-links ul { display: flex; flex-direction: column; gap: 8px; }
.ep-root .ep-footer-links a { font-size: 13px; letter-spacing: 0.06em; opacity: 0.75; transition: opacity 0.3s ease; }
.ep-root .ep-footer-links a:hover { opacity: 1; }
.ep-root .ep-footer-bottom {
  padding: 24px 6% 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px;
  font-size: 12px; opacity: 0.55;
}
.ep-root .ep-footer-bottom a { text-decoration: underline; }
.ep-root .ep-footer-bottom ul { display: flex; gap: 18px; }

/* ─── DISCLAIMER BANNER ────────────── */
.ep-root .ep-disclaimer {
  background: #fff7e6; color: #6b4e16; text-align: center;
  font-size: 12px; letter-spacing: 0.04em; padding: 10px 6%;
  border-bottom: 1px solid rgba(107,78,22,0.15);
  position: relative; z-index: 600;
}
.ep-root .ep-disclaimer strong { font-weight: 700; }

/* ─── BOOKING MOTOR ────────────────── */
.ep-root .ep-motor {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 450;
  background: rgba(20,49,58,0.92); backdrop-filter: blur(10px);
  padding: 14px 5%; color: #fff;
  transform: translateY(100%); transition: transform 0.6s cubic-bezier(.65,0,.35,1);
}
.ep-root .ep-motor.ep-motor-visible { transform: translateY(0); }
.ep-root .ep-motor-form { display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
.ep-root .ep-motor-inputs { display: flex; gap: 12px; flex-wrap: wrap; }
.ep-root .ep-motor-field { display: flex; flex-direction: column; gap: 4px; position: relative; }
.ep-root .ep-motor-field label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.6; }
.ep-root .ep-motor-field input {
  background: transparent; border: 1px solid rgba(255,255,255,0.25); border-radius: 8px;
  color: #fff; padding: 8px 12px; font-size: 13px; outline: none; color-scheme: dark;
}
.ep-root .ep-guests-toggle {
  background: transparent; border: 1px solid rgba(255,255,255,0.25); border-radius: 8px;
  color: #fff; padding: 8px 12px; font-size: 13px; cursor: pointer; text-align: left;
}
.ep-root .ep-guests-pop {
  position: absolute; bottom: calc(100% + 8px); left: 0; background: #14313a;
  border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 14px; width: 220px; z-index: 10;
}
.ep-root .ep-guests-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
.ep-root .ep-guests-row small { display: block; opacity: 0.5; font-size: 10px; }
.ep-root .ep-stepper { display: flex; align-items: center; gap: 10px; }
.ep-root .ep-stepper button {
  width: 24px; height: 24px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3);
  background: transparent; color: #fff; cursor: pointer; font-size: 14px; line-height: 1;
}
.ep-root .ep-motor-submit {
  background: #4fa8b8; color: #14313a; border: none; border-radius: 999px;
  padding: 12px 32px; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase;
  font-weight: 700; cursor: pointer; transition: background 0.3s ease;
}
.ep-root .ep-motor-submit:hover { background: #6fc4d3; }

/* ─── MODALS ───────────────────────── */
.ep-root .ep-modal {
  position: fixed; inset: 0; z-index: 900;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; visibility: hidden; transition: opacity 0.4s ease, visibility 0.4s ease;
}
.ep-root .ep-modal.open { opacity: 1; visibility: visible; }
.ep-root .ep-modal-backdrop { position: absolute; inset: 0; background: rgba(10,22,28,0.7); z-index: -1; }
.ep-root .ep-modal-dialog {
  position: relative; z-index: 1; max-width: 900px; width: 92%;
  background: #f3f7f8; border-radius: 24px; overflow: hidden;
  transform: translateY(30px) scale(0.97); transition: transform 0.5s cubic-bezier(.34,1.56,.64,1);
}
.ep-root .ep-modal.open .ep-modal-dialog { transform: translateY(0) scale(1); }
.ep-root .ep-modal-close {
  position: absolute; top: 18px; right: 18px; z-index: 5;
  width: 36px; height: 36px; border-radius: 50%; border: none;
  background: rgba(20,49,58,0.08); color: #14313a; font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.ep-root .ep-modal-promo .ep-promo-grid { display: grid; grid-template-columns: 1fr; }
.ep-root .ep-promo-img { aspect-ratio: 4/3; overflow: hidden; }
.ep-root .ep-promo-img img { width: 100%; height: 100%; object-fit: cover; }
.ep-root .ep-promo-text { padding: 36px 30px; }
.ep-root .ep-promo-text .ep-title { font-size: clamp(22px, 4vw, 34px); margin: 6px 0 16px; }
.ep-root .ep-promo-text .ep-featured { color: #2f7d8c; font-weight: 700; margin-bottom: 10px; }
.ep-root .ep-promo-text .ep-text { margin-bottom: 22px; }

.ep-root .ep-modal-gallery {
  background: rgba(8,18,24,0.96); flex-direction: column; padding: 30px;
}
.ep-root .ep-modal-gallery.open { opacity: 1; visibility: visible; }
.ep-root .ep-modal-gallery .ep-modal-dialog {
  background: transparent; max-width: 1100px; width: 100%;
  display: flex; align-items: center; gap: 16px; transform: none;
}
.ep-root .ep-gallery-main {
  flex: 1; border-radius: 16px; overflow: hidden; max-height: 70vh;
  display: flex; align-items: center; justify-content: center;
}
.ep-root .ep-gallery-main img { width: 100%; height: 100%; object-fit: contain; max-height: 70vh; }
.ep-root .ep-gallery-arrow {
  font-size: 36px; color: #fff; cursor: pointer; opacity: 0.6; transition: opacity 0.3s ease;
  user-select: none; padding: 10px;
}
.ep-root .ep-gallery-arrow:hover { opacity: 1; }
.ep-root .ep-gallery-thumbs { display: flex; gap: 10px; justify-content: center; margin-top: 20px; overflow-x: auto; max-width: 100%; }
.ep-root .ep-gallery-thumb {
  width: 64px; height: 48px; border-radius: 8px; overflow: hidden; border: 2px solid transparent;
  background: none; cursor: pointer; padding: 0; flex: none; opacity: 0.5; transition: opacity 0.3s ease, border-color 0.3s ease;
}
.ep-root .ep-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ep-root .ep-gallery-thumb.active { opacity: 1; border-color: #4fa8b8; }
.ep-root .ep-modal-gallery .ep-modal-close { background: rgba(255,255,255,0.1); color: #fff; }

/* ─── SCROLL REVEAL DEFAULTS ───────── */
.ep-root [data-fade] { will-change: opacity, transform; }

/* ─── DESKTOP ──────────────────────── */
@media (min-width: 900px) {
  .ep-root .ep-nav-desktop { display: block; }
  .ep-root .ep-contact-link { display: inline-block; }
  .ep-root .ep-menu-toggle { display: none; }
  .ep-root .ep-drawer-links { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 30px 50px; }
  .ep-root .ep-info-grid { grid-template-columns: 1fr 1fr; }
  .ep-root .ep-location-grid { grid-template-columns: 1fr 1fr; }
  .ep-root .ep-multimedia-grid { grid-template-columns: repeat(6, 1fr); }
  .ep-root .ep-room-card { width: 320px; }
}

@media (max-width: 640px) {
  .ep-root .ep-multimedia-grid { grid-template-columns: repeat(2, 1fr); }
  .ep-root .ep-promo-grid { grid-template-columns: 1fr; }
}

/* @arkzen:web:style:end */

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const ethanPoolAnimations = (pageRef: React.RefObject<HTMLDivElement | null>) => {
  gsap.registerPlugin(ScrollTrigger)

  const ctx = gsap.context(() => {
    // ── data-fade entrance system (mirrors source data-fade / data-fade-delay / data-fade-duration) ──
    const fadeEls = gsap.utils.toArray<HTMLElement>('[data-fade]')

    fadeEls.forEach((el) => {
      const type = el.getAttribute('data-fade') || 'fade-in'
      const delay = parseInt(el.getAttribute('data-fade-delay') || '0', 10) / 1000
      const duration = parseInt(el.getAttribute('data-fade-duration') || '800', 10) / 1000

      let fromVars: gsap.TweenVars = { opacity: 0 }
      if (type === 'fade-up') fromVars = { opacity: 0, y: 50 }
      if (type === 'fade-down') fromVars = { opacity: 0, y: -40 }
      if (type === 'fade-in') fromVars = { opacity: 0 }

      const isHero = el.closest('.ep-hero') || el.classList.contains('ep-header')
      const isCarousel = el.closest('.ep-carousel-section')

      if (isHero || isCarousel) {
        // hero / header / room-carousel entrance — plays immediately, not scroll-gated.
        // clearProps removes the inline opacity/transform once done.
        gsap.fromTo(el, fromVars, {
          opacity: 1, y: 0, x: 0,
          duration, delay, ease: 'power3.out',
          clearProps: 'opacity,transform',
        })
      } else {
        gsap.fromTo(el, fromVars, {
          opacity: 1, y: 0, x: 0,
          duration, delay, ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      }
    })

    // ── hero scale-down parallax on load ──
    gsap.fromTo('.ep-hero-img img',
      { scale: 1.18 },
      { scale: 1, duration: 1.8, ease: 'power3.out' }
    )

    // ── hero parallax on scroll ──
    gsap.to('.ep-hero-img img', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.ep-hero', start: 'top top', end: 'bottom top', scrub: true },
    })

    // ── banner-full text reveal + parallax ──
    gsap.to('.ep-banner-img img', {
      yPercent: 15, ease: 'none',
      scrollTrigger: { trigger: '.ep-banner-full', start: 'top bottom', end: 'bottom top', scrub: true },
    })

    // ── room carousel: plain horizontal scroll, no GSAP pin.
    // A pinned ScrollTrigger here caused the room cards to render invisible
    // when scrolling down (pin re-layout/refresh fought with the cards'
    // opacity), so the carousel is a normal CSS overflow-x scroller instead —
    // always visible, swipeable on touch, scrollable with a wheel/trackpad.

    // ── info section pin + image parallax ──
    gsap.to('.ep-info-img img', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.ep-info-section', start: 'top bottom', end: 'bottom top', scrub: true },
    })

    // ── multimedia grid staggered reveal ──
    gsap.fromTo('.ep-media',
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: '.ep-multimedia-grid', start: 'top 85%' },
      }
    )

    // ── blog cards stagger ──
    gsap.fromTo('.ep-blog-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.ep-blog-track', start: 'top 90%' },
      }
    )

    // ── room cards: no opacity/transform animation here on purpose.
    // The pinned section + horizontal scroll already provides motion, and animating
    // opacity on elements inside a pinned ScrollTrigger caused cards to render as
    // invisible when scrolling down into the pin (inline styles fought with the
    // pin's transform/refresh cycle). Cards are simply visible at all times.

    // ── location map subtle scale-in ──
    gsap.fromTo('.ep-location-map img',
      { scale: 1.1 },
      {
        scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.ep-location', start: 'top 75%' },
      }
    )
  }, pageRef)

  return () => ctx.revert()
}

export default ethanPoolAnimations

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
}
/* @arkzen:web:animation:end */

/* @arkzen:web:page:index */
const clamp = (min: number, max: number, value: number) => Math.min(Math.max(value, min), max)

/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const mounted = useMounted()
  const pageRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [motorVisible, setMotorVisible] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterAccepted, setNewsletterAccepted] = useState(false)
  const [newsletterMsg, setNewsletterMsg] = useState('')

  // ── coverflow room carousel ──
  const carouselWrapRef = useRef<HTMLDivElement>(null)
  const carouselTrackRef = useRef<HTMLDivElement>(null)
  const [activeRoom, setActiveRoom] = useState(0)

  // ── scroll-based: reveal booking motor + scrolled header state ──
  useEffect(() => {
    const onScroll = () => {
      const heroH = document.querySelector('.ep-hero')?.getBoundingClientRect().height || 0
      setMotorVisible(window.scrollY > heroH * 0.6)
      document.body.classList.toggle('ep-scrolled', window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── lock body scroll when drawer/modals open ──
  useEffect(() => {
    document.body.style.overflow = menuOpen || galleryOpen ? 'hidden' : ''
  }, [menuOpen, galleryOpen])

  // ── run scroll animations once mounted ──
  useEffect(() => {
    if (!mounted) return
    const cleanup = ethanPoolAnimations(pageRef)
    return cleanup
  }, [mounted])

  // ── coverflow: rotate/scale each card based on its distance from the
  // center of the visible track, updating on every horizontal scroll ──
  useEffect(() => {
    const wrap = carouselWrapRef.current
    const track = carouselTrackRef.current
    if (!wrap || !track) return

    let raf = 0

    const update = () => {
      const wrapRect = wrap.getBoundingClientRect()
      const centerX = wrapRect.left + wrapRect.width / 2
      const cards = Array.from(track.querySelectorAll<HTMLElement>('.ep-room-card'))

      let closestIndex = 0
      let closestDist = Infinity

      cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect()
        const cardCenter = cardRect.left + cardRect.width / 2
        const delta = (cardCenter - centerX) / wrapRect.width // normalized -1..1 roughly

        const rotateY = clamp(-50, 50, delta * 65)
        const scale = clamp(0.72, 1, 1 - Math.abs(delta) * 0.5)
        const translateZ = -Math.abs(delta) * 160
        const opacity = clamp(0.35, 1, 1 - Math.abs(delta) * 0.6)

        card.style.transform = `translateZ(${translateZ}px) rotateY(${-rotateY}deg) scale(${scale})`
        card.style.opacity = String(opacity)
        card.style.zIndex = String(100 - Math.round(Math.abs(delta) * 100))

        const dist = Math.abs(cardCenter - centerX)
        if (dist < closestDist) {
          closestDist = dist
          closestIndex = i
        }
      })

      setActiveRoom((prev) => (prev !== closestIndex ? closestIndex : prev))
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        update()
        raf = 0
      })
    }

    update()
    wrap.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      wrap.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mounted])

  const scrollToRoom = (index: number) => {
    const wrap = carouselWrapRef.current
    const track = carouselTrackRef.current
    if (!wrap || !track) return
    const card = track.querySelectorAll<HTMLElement>('.ep-room-card')[index]
    if (!card) return
    const wrapRect = wrap.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const offset = (cardRect.left + cardRect.width / 2) - (wrapRect.left + wrapRect.width / 2)
    wrap.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterAccepted) {
      setNewsletterMsg('Please accept the terms and conditions.')
      return
    }
    setNewsletterMsg('Thanks for subscribing! (demo — no data is actually sent)')
    setNewsletterEmail('')
  }

  return (
    <div className="ep-root" ref={pageRef} id="top">

      {/* DISCLAIMER */}
      <div className="ep-disclaimer">
        <strong>Disclaimer:</strong> Ethan Pool is a demo showcase site built for
        demonstration purposes only by James Rafty D. Libago (Mizumi). All names, text, locations and images are fictional or
        stock placeholders and do not represent a real business.
      </div>

      {/* HEADER + DRAWER */}
      <EpHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <EpNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* PROMO MODAL */}
      <EpPromoModal />

      {/* GALLERY MODAL */}
      <EpGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={GALLERY_MEDIA}
        index={galleryIndex}
        setIndex={setGalleryIndex}
      />

      {/* ── HERO ── */}
      <section className="ep-hero" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="100">
        <div className="ep-hero-img">
          <img
            src="https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=1800&auto=format&fit=crop"
            alt="Child playing and swimming in the Ethan Pool resort pool"
          />
        </div>
        <div className="ep-hero-overlay" />
        <div className="ep-hero-block">
          <h1 className="ep-hero-logo" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            ETHAN
            <span>POOL · RESORT</span>
          </h1>
        </div>
        <div className="ep-hero-scroll" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="1200">
          <span>Scroll</span>
          <div className="ep-scroll-line" />
        </div>
      </section>

      {/* ── BANNER FULL / TEXT REVEAL ── */}
      <section className="ep-banner-full" id="resort">
        <div className="ep-banner-img">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1800&auto=format&fit=crop"
            alt="Ethan Pool lagoon view"
          />
        </div>
        <div className="ep-banner-overlay" />
        <div className="ep-banner-block">
          <div data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            <p className="ep-p-section">A Luxury Aquatic Resort</p>
            <h2 className="ep-title">A resort of calm waters facing the lagoon</h2>
            <p className="ep-subhead">
              Between infinity-edge pools and a garden that opens onto the water, Ethan Pool is a
              retreat that doesn't try to draw attention. Let the water speak. Let time float.
              Let every swim become a memory you keep forever.
            </p>
          </div>
        </div>
      </section>

      {/* ── ROOM / SUITE COVERFLOW CAROUSEL ── */}
      <section className="ep-carousel-section" id="rooms">
        <div className="ep-carousel-intro" data-fade="fade-up" data-fade-delay="700" data-fade-duration="1000">
          <p className="ep-p-section">Stays by the Water</p>
          <h2 className="ep-title">Rooms with views over the lagoon or the tropical garden</h2>
        </div>

        <div className="ep-carousel-cta" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
          <a href="#offers" className="ep-btn ep-btn-stroke ep-btn-green">
            <span className="ep-btn-label">All Rooms<i className="ep-arrow">→</i></span>
          </a>
        </div>

        <div className="ep-carousel-track-wrap" ref={carouselWrapRef}>
          <div className="ep-carousel-track" ref={carouselTrackRef}>
            {ROOMS.map((room, i) => (
              <div
                className={`ep-room-card ${room.tag === 'offer' ? 'ep-offer' : ''} ${i === activeRoom ? 'ep-active' : ''}`}
                key={room.id}
                data-index={i}
                onClick={() => scrollToRoom(i)}
              >
                <img src={room.img} alt={room.name} />
                <div className="ep-room-card-label">{room.name}</div>
                <div className="ep-room-card-overlay">
                  <h3>{room.name}</h3>
                  <div className="ep-room-actions">
                    <a href="#offers" className="ep-btn ep-btn-stroke">
                      <span className="ep-btn-label">Book Now</span>
                    </a>
                    <a href={`#${room.id}`} className="ep-btn-underline">Learn More</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── INFO / AMENITIES SPLIT ── */}
      <section className="ep-info-section" id="rooftop">
        <div className="ep-info-grid">
          <div className="ep-info-img" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            <img
              src="https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=900&auto=format&fit=crop"
              alt="Ethan Pool morning swim"
            />
          </div>
          <div className="ep-info-text" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            <p className="ep-p-section">This Is Where the Trip Makes Sense</p>
            <h2 className="ep-title">
              A pause of calm by the water that invites you to slow down. A place where nothing is
              urgent — just float. Just enjoy.
            </h2>

            <ul className="ep-info-list">
              {AMENITIES.map((a) => (
                <li key={a.label}>{a.label}</li>
              ))}
            </ul>

            <div className="ep-amenity-medias">
              {AMENITIES.map((a) => (
                <img key={a.label} src={a.img} alt={a.label} title={a.label} />
              ))}
            </div>

            <a href="#resort" className="ep-btn ep-btn-stroke">
              <span className="ep-btn-label">More About the Resort<i className="ep-arrow">→</i></span>
            </a>
          </div>
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── MULTIMEDIA / GALLERY GRID ── */}
      <section className="ep-multimedia" id="gallery">
        <div className="ep-multimedia-head" data-fade="fade-up" data-fade-duration="1000" data-fade-delay="700">
          <h2 className="ep-title">
            Traveling is learning to float slowly. Discover the small moments you'll make your own at Ethan Pool
          </h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ep-btn ep-btn-white"
          >
            <span className="ep-btn-label">More on Instagram ↗</span>
          </a>
        </div>

        <div className="ep-multimedia-grid">
          {GALLERY_MEDIA.map((src, i) => (
            <div className="ep-media" key={src} onClick={() => openGallery(i)}>
              <img src={src} alt={`Ethan Pool gallery ${i + 1}`} loading="lazy" />
              <div className="ep-media-plus">+</div>
            </div>
          ))}
          <a
            className="ep-media ep-media-webcam"
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>📹</span>
            <p>Live Cam</p>
          </a>
          <div className="ep-media-empty" />
          <div className="ep-media-empty" />
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── BLOG ── */}
      <section className="ep-blog-section" id="blog">
        <div className="ep-blog-head" data-fade="fade-up" data-fade-duration="1000" data-fade-delay="700">
          <p className="ep-p-section">The Ethan Pool Blog</p>
          <h2 className="ep-title">
            Stories, places and moments that inspire a slower, calmer way of life by the water.
          </h2>
        </div>

        <div className="ep-blog-track-wrap">
          <div className="ep-blog-track">
            {BLOG_POSTS.map((post) => (
              <div className="ep-blog-card" key={post.href}>
                <div className="ep-blog-img">
                  <img src={post.img} alt={post.title} />
                </div>
                <div className="ep-blog-card-text">
                  <p className="ep-p-section">{post.tag}</p>
                  <h3>{post.title}</h3>
                  <a href={post.href} className="ep-btn ep-btn-stroke">
                    <span className="ep-btn-label">Read More</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ep-blog-cta" data-fade="fade-up" data-fade-duration="1000" data-fade-delay="700">
          <a href="#blog" className="ep-btn ep-btn-stroke ep-btn-green">
            <span className="ep-btn-label">More Ideas & Plans<i className="ep-arrow">→</i></span>
          </a>
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── LOCATION / CONTACT ── */}
      <section className="ep-location" id="contact">
        <div className="ep-location-grid">
          <div className="ep-location-map" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=900&auto=format&fit=crop"
              alt="Map showing Ethan Pool location"
            />
          </div>
          <div className="ep-location-text" data-fade="fade-up" data-fade-duration="1000" data-fade-delay="700" id="about">
            <h2 className="ep-title">Ethan Pool Resort &amp; Spa</h2>
            <address>12 Lagoon Promenade<br />20003 San Sebastián, Spain</address>

            <div className="ep-btn-row">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ep-btn ep-btn-stroke"
              >
                <span className="ep-btn-label">Open in Google Maps<i className="ep-arrow">→</i></span>
              </a>
            </div>

            <a href="mailto:hello@ethanpool.com">hello@ethanpool.com</a>
            <a href="tel:+34943000000">T. +34 943 000 000</a>

            <div className="ep-btn-row">
              <a
                href="https://wa.me/34943000000"
                target="_blank"
                rel="noopener noreferrer"
                className="ep-btn ep-btn-stroke"
              >
                <span className="ep-btn-label">Send Us a WhatsApp<i className="ep-arrow">→</i></span>
              </a>
            </div>

            <div className="ep-location-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FB</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">IG</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TT</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YT</a>
            </div>
          </div>
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── NEWSLETTER ── */}
      <section className="ep-newsletter" id="offers">
        <div data-fade="fade-up" data-fade-delay="700" data-fade-duration="1000">
          <h2 className="ep-title">Subscribe to Our Newsletter</h2>

          <form className="ep-newsletter-form" onSubmit={handleNewsletter}>
            <div className="ep-newsletter-top">
              <input
                type="email"
                placeholder="Your email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className="ep-btn ep-btn-stroke ep-btn-white">
                <span className="ep-btn-label">Subscribe<i className="ep-arrow">→</i></span>
              </button>
            </div>
            <div className="ep-newsletter-legal">
              <label>
                <input
                  type="checkbox"
                  checked={newsletterAccepted}
                  onChange={(e) => setNewsletterAccepted(e.target.checked)}
                  required
                />
                <span>I accept the terms and conditions of use (demo)*</span>
              </label>
            </div>
            {newsletterMsg && <div className="ep-newsletter-result">{newsletterMsg}</div>}
          </form>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="ep-logos" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
        <div className="ep-logos-track">
          {LOGOS.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ep-footer">
        <div className="ep-footer-grid">
          <a href="#top" className="ep-footer-logo">
            <span>⌬</span>
            <span>ETHAN<span>POOL</span></span>
          </a>
          <div className="ep-footer-links">
            <ul>
              <li><a href="#rooms">Rooms</a></li>
              <li><a href="#resort">The Resort</a></li>
            </ul>
            <ul>
              <li><a href="#offers">Offers & Newsletter</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
            <ul>
              <li><a href="#contact">Contact & Directions</a></li>
              <li><a href="#about">About Us</a></li>
            </ul>
          </div>
        </div>
        <div className="ep-footer-bottom">
          <p>Copyright @ Ethan Pool 2026. Demo tatemono — all rights reserved.</p>
          <ul>
            <li><a href="#">Legal Notice</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </footer>

      {/* ── STICKY BOOKING MOTOR ── */}
      <section className={`ep-motor ${motorVisible ? 'ep-motor-visible' : ''}`}>
        <EpBookingBarInner />
      </section>
    </div>
  )
}

// Inner booking bar (re-uses booking form markup without its own <section> wrapper)
const EpBookingBarInner = () => {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
  }

  return (
    <form className="ep-motor-form" onSubmit={handleSubmit}>
      <div className="ep-motor-inputs">
        <div className="ep-motor-field">
          <label>Check-in</label>
          <input type="date" name="checkin" />
        </div>
        <div className="ep-motor-field">
          <label>Check-out</label>
          <input type="date" name="checkout" />
        </div>
        <div className="ep-motor-field ep-motor-guests">
          <label>Guests</label>
          <button type="button" className="ep-guests-toggle" onClick={() => setOpen(!open)}>
            2 Adults
          </button>
          {open && (
            <div className="ep-guests-pop">
              <div className="ep-guests-row">
                <span>Adults <small>18+ years</small></span>
                <div className="ep-stepper">
                  <button type="button">−</button>
                  <span>2</span>
                  <button type="button">+</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <button type="submit" className="ep-motor-submit">Book Now</button>
    </form>
  )
}

export default IndexPage
/* @arkzen:web:page:index:end */
