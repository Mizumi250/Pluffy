/* @arkzen:meta
name: shan-shan
version: 1.0.0
description: Portfolio for Shan Sabal Cezar — designer, document specialist, researcher. Accurate MIJ-clone layout with diagonal polygon masks, loading bar, 5-bar burger, vision carousel, accordion brands, joinus buttons, about table, profile, and footer.
auth: false
favicon: 🌸
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "mij-root"
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: 'design',
    logo: '/tatemonos/shan-shan/assets/images/shan1.jpg',
    title: 'Graphic Design',
    headline: 'Visual clarity, bold impressions',
    desc: 'Visual design for print and digital — posters, flyers, social media graphics, brand materials. Clean layouts with bold typography that communicate clearly and leave an impression.',
    link: null,
  },
  {
    id: 'docs',
    logo: '/tatemonos/shan-shan/assets/images/shan2.jpg',
    title: 'Document Preparation',
    headline: 'Every page structured, every detail polished',
    desc: 'Professional document preparation — reports, proposals, templates, formatted deliverables. Every page structured, every section purposeful, every detail polished.',
    link: null,
  },
  {
    id: 'research',
    logo: '/tatemonos/shan-shan/assets/images/shan3.jpg',
    title: 'Research & Analysis',
    headline: 'Deep dives. Actionable insights.',
    desc: 'Thorough research and analysis — academic papers, market studies, data gathering and synthesis. Deep dives that turn complex information into clear, actionable insights.',
    link: null,
  },
  {
    id: 'present',
    logo: '/tatemonos/shan-shan/assets/images/shan4.jpg',
    title: 'Presentation Design',
    headline: 'Stories told one slide at a time',
    desc: 'Clean, impactful slide decks — pitch presentations, school projects, business proposals. Every slide designed to support the story, not distract from it.',
    link: null,
  },
]

const NAV_LINKS = [
  { label: "SHAN'S WAY", href: '#vision' },
  { label: 'SERVICES', href: '#brand' },
  { label: 'SKILLS', href: '#joinus' },
  { label: 'ABOUT ME', href: '#about' },
  { label: 'CONTACT', href: '#profile' },
]

const PERSONAL_INFO = [
  { label: '氏名', value: 'Shan Sabal Cezar' },
  { label: '職種', value: 'Designer · Document Specialist · Researcher' },
  { label: '拠点', value: 'Philippines' },
  { label: '専門', value: 'Graphic design, document preparation, research & analysis, presentation design' },
  { label: 'ツール', value: 'Canva, Microsoft Office, Google Workspace, Adobe Creative Suite' },
  { label: 'ステータス', value: 'Open for freelance projects and collaborations' },
  { label: 'SNS', value: 'Facebook · @shan.cezar.71' },
]

// ─── LOADER ───────────────────────────────────────────────────────────────────
// Phase 1: black screen, red bar sweeps left → right at top
// Phase 2: bar expands to fill entire screen (red flood)
// Phase 3: red screen fades out → website revealed

const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const barRef    = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Phase 1 — bar sweeps across top (0 → 100% width)
    tl.to(barRef.current, {
      width: '100%',
      duration: 1.3,
      ease: 'power2.inOut',
    })

    // Phase 2 — bar expands downward to flood the whole screen
    .to(barRef.current, {
      height: '100vh',
      duration: 0.45,
      ease: 'power3.in',
    })

    // Phase 3 — full red screen fades out, revealing the site
    .to(screenRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete,
    })
  }, [onComplete])

  return (
    <div ref={screenRef} id="shan-loader">
      <div ref={barRef} id="shan-loader-bar" />
    </div>
  )
}

// ─── BURGER ───────────────────────────────────────────────────────────────────

const BurgerMenu = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const kvH = (document.getElementById('kv')?.offsetHeight ?? 0) - 80
      document.body.classList.toggle('scrolled', window.scrollY > kvH)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleOpen = (next: boolean) => {
    setOpen(next)
    document.body.classList.toggle('nav-open', next)
    if (next) {
      setTimeout(() => {
        gsap.fromTo(
          '.shan-nav ul li',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, stagger: 0.07, duration: 0.35, ease: 'power2.out' }
        )
      }, 10)
    }
  }

  return (
    <>
      {/* Exact MIJ structure: div#burger with 5 <i> */}
      <div
        id="shan-burger"
        className={open ? 'open' : ''}
        onClick={() => handleOpen(!open)}
        role="button"
        aria-label="Menu"
      >
        <i /><i /><i /><i /><i />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="shan-nav"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => handleOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── DIAGONAL MASK (exact MIJ SVG polygon approach) ──────────────────────────

const MaskBottom = ({ fill = '#CC0000' }: { fill?: string }) => (
  <div className="mask-bottom">
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100%"
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
    >
      <polygon className="polygon" fill={fill} points="0,100 1440,100 1440,0" />
    </svg>
  </div>
)

const MaskTop = ({ fill = '#CC0000' }: { fill?: string }) => (
  <div className="mask-top">
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="100%"
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
    >
      <polygon className="polygon" fill={fill} points="0,0 0,100 1440,0" />
    </svg>
  </div>
)

// ─── HERO LOGO — stroke-draw "SHAN" ──────────────────────────────────────────
// Each letter is a single stroke path. GSAP animates strokeDashoffset → draw-on effect.
// Styled to match MIJ's hero SVG weight and white-on-red treatment.

const ShanHeroLogo = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const paths = Array.from(svgRef.current.querySelectorAll('.kv-path'))
    paths.forEach((el) => {
      const len = (el as SVGGeometryElement).getTotalLength?.() ?? 300
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 })
    })
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 1.1,
      stagger: 0.2,
      ease: 'power2.inOut',
      delay: 1.6,
    })
  }, [])

  return (
    <span id="kv-svg">
      <svg
        ref={svgRef}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 380 110"
        width="380"
        height="110"
      >
        {/* ── S ── top arc, middle reverse, bottom arc */}
        <path className="kv-path"
          d="M72,18 C56,18 38,24 38,40 C38,54 52,60 66,64 C82,68 96,74 96,90 C96,106 76,112 58,112 C44,112 30,108 22,102"
          fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── H ── */}
        <path className="kv-path"
          d="M116,18 L116,112 M116,65 L166,65 M166,18 L166,112"
          fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── A ── */}
        <path className="kv-path"
          d="M196,112 L224,18 L252,112 M206,82 L242,82"
          fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── N ── */}
        <path className="kv-path"
          d="M272,112 L272,18 L332,112 L332,18"
          fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── dot ── */}
        <circle className="kv-path"
          cx="358" cy="106" r="6"
          fill="none" stroke="#fff" strokeWidth="8"
        />
      </svg>
    </span>
  )
}

// ─── BRAND ITEM ───────────────────────────────────────────────────────────────
// Collapsed: full-width image with centered white title + chevron overlaid
// Expanded:  same image, text slides down beneath

const BrandItem = ({
  service,
  isOpen,
  onToggle,
}: {
  service: (typeof SERVICES)[0]
  isOpen: boolean
  onToggle: () => void
}) => (
  <div className={`brand-item${isOpen ? ' open' : ''}`} onClick={onToggle}>
    <div className="brand-item-inner">

      {/* Full-width image with title overlay — always visible */}
      <div className="brand-item-img-wrap">
        <img src={service.logo} alt={service.title} className="brand-item-bg-img" />
        <div className="brand-item-overlay" />
        <div className="brand-item-title-wrap">
          <h2 className="brand-item-title">{service.title}</h2>
          <span className="brand-chevron">{isOpen ? '−' : '+'}</span>
        </div>
      </div>

      {/* Expanded text drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="brand-item-box"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="brand-item-box-inner">
              <div className="brand-item-txt">
                <h2>{service.title}</h2>
                <p>{service.desc}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  </div>
)

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
/* shan-shan — accurate MIJ clone stylesheet */

/* ─── RESET ──────────────────────── */
.mij-root {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #333;
  background: #fff;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

* { box-sizing: border-box; }

a { text-decoration: none; color: inherit; }

/* ─── LOADER ─────────────────────── */
#shan-loader {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
  pointer-events: all;
}

#shan-loader-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 4px;
  background: #CC0000;
  /* GSAP expands width first, then height to 100vh */
  transform-origin: top left;
}

/* ─── BURGER ─────────────────────── */
#shan-burger {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  width: 40px;
  height: 32px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 4px 0;
}

#shan-burger i {
  display: block;
  height: 2px;
  background: #333;
  border-radius: 1px;
  transition: all 0.3s ease;
}

/* MIJ uses 5 bars of alternating widths */
#shan-burger i:nth-child(1) { width: 28px; }
#shan-burger i:nth-child(2) { width: 22px; }
#shan-burger i:nth-child(3) { width: 28px; }
#shan-burger i:nth-child(4) { width: 22px; }
#shan-burger i:nth-child(5) { width: 28px; }

/* White always on dark backgrounds — burger is fixed so we target body state */
body.kv-active #shan-burger i,
body.brand-active #shan-burger i { background: #fff; }

/* Simpler: always white since hero is first and burger overlays red */
#shan-burger i { background: #fff; }

/* Go dark once past the hero — toggled via JS class on scroll */
body.scrolled #shan-burger i { background: #333; }
body.nav-open #shan-burger i { background: #fff; }

/* Open state → X */
#shan-burger.open i:nth-child(1) { transform: translateY(9px) rotate(45deg); width: 28px; }
#shan-burger.open i:nth-child(2) { opacity: 0; }
#shan-burger.open i:nth-child(3) { transform: translateY(-1px) rotate(-45deg); width: 28px; }
#shan-burger.open i:nth-child(4) { opacity: 0; }
#shan-burger.open i:nth-child(5) { opacity: 0; }

/* ─── NAV ────────────────────────── */
.shan-nav {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shan-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.shan-nav ul li {
  opacity: 0;
}

.shan-nav ul li a {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 12px 28px;
  display: block;
  transition: color 0.2s;
}

.shan-nav ul li a:hover {
  color: #CC0000;
}

/* ─── WRAPPER ────────────────────── */
#shan-wrapper {
  width: 100%;
}

/* ─── SECTIONS generic ───────────── */
.sec {
  position: relative;
}

.sec-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 24px;
}

.sec-inner-inner {
  display: flex;
  align-items: flex-start;
  gap: 60px;
}

.sec-box {
  flex: 1;
}

/* ─── MASKS ──────────────────────── */
.mask-top,
.mask-bottom {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  line-height: 0;
  pointer-events: none;
}

.mask-top  { top: 0; }
.mask-bottom { bottom: 0; }

.mask-top svg,
.mask-bottom svg {
  display: block;
  width: 100%;
  height: 80px;
}

/* ─── HERO / KV ──────────────────── */
#kv {
  min-height: 100vh;
  background: #CC0000;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

/* Split: left = photo half, right = red half with logo */
#kv .sec-inner {
  max-width: 100%;
  width: 100%;
  padding: 0;
}

#kv .sec-inner-inner {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  gap: 0;
}

/* Left half — photo */
.kv-photo-half {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.kv-photo-half img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
  filter: brightness(0.9);
}

/* Right half — red with logo */
.kv-text-half {
  flex: 1;
  background: #CC0000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 48px 120px;
  gap: 20px;
}

#kv-svg {
  display: inline-block;
  opacity: 0;
}

#kv-svg svg {
  max-width: 100%;
  height: auto;
}

#kv-svg-alt {
  display: block;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255,255,255,0.72);
  font-style: italic;
  letter-spacing: 0.14em;
  text-align: center;
}

@media (max-width: 768px) {
  #kv .sec-inner-inner {
    flex-direction: column;
  }

  .kv-photo-half {
    flex: 0 0 45vh;
  }

  .kv-text-half {
    flex: 1;
    padding: 40px 24px 100px;
  }
}

/* ─── VISION ─────────────────────── */
#vision {
  padding: 100px 0 80px;
  background: #fff;
}

#vision .sec-inner-inner {
  align-items: flex-start;
  gap: 60px;
}

.sec-box img {
  max-width: 100%;
  border-radius: 6px;
  opacity: 0.85;
}

.vision-item {
  min-height: 260px;
}

.vision-item h2 {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.12em;
  margin: 0 0 16px;
  color: #111;
}

.vision-item p {
  font-size: 14px;
  line-height: 1.9;
  color: #555;
  margin: 0 0 14px;
}

.vision-item ol.list,
.vision-item ul.list {
  padding-left: 20px;
  margin: 0;
}

.vision-item ol.list li,
.vision-item ul.list li {
  font-size: 14px;
  line-height: 1.9;
  color: #555;
}

.vision-nav {
  display: flex;
  gap: 10px;
  margin: 28px 0 0;
}

.vision-nav i {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: background 0.25s, transform 0.25s;
}

.vision-nav i.active {
  background: #CC0000;
  transform: scale(1.3);
}

/* ─── BRAND ──────────────────────── */
#brand {
  background: #CC0000;
  padding: 80px 0;
  position: relative;
}

#brand .sec-inner {
  max-width: 100%;
  padding: 0;
}

.brand-close {
  position: absolute;
  top: 28px;
  right: 28px;
  z-index: 10;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-close i {
  display: block;
  width: 24px;
  height: 2px;
  background: rgba(255,255,255,0.65);
  position: absolute;
  transition: background 0.2s;
}

.brand-close i:first-child { transform: rotate(45deg); }
.brand-close i:last-child  { transform: rotate(-45deg); }
.brand-close:hover i { background: #fff; }

.brand-inner {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

/* Each item: full-width image card */
.brand-item {
  position: relative;
  opacity: 0;
  cursor: pointer;
  overflow: hidden;
}

.brand-item-inner {
  position: relative;
}

/* Image section — full width, fixed height */
.brand-item-img-wrap {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
}

.brand-item-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.brand-item:hover .brand-item-bg-img {
  transform: scale(1.04);
}

/* Dark overlay so white text reads */
.brand-item-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.42);
  transition: background 0.3s;
}

.brand-item.open .brand-item-overlay {
  background: rgba(0,0,0,0.55);
}

/* Centered title + chevron over the image */
.brand-item-title-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}

.brand-item-title {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.08em;
  text-align: center;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}

.brand-chevron {
  font-size: 28px;
  font-weight: 300;
  color: rgba(255,255,255,0.75);
  line-height: 1;
  transition: transform 0.3s ease, color 0.2s;
}

.brand-item.open .brand-chevron {
  color: #fff;
  transform: rotate(0deg);
}

/* Expanded text drawer — slides below the image */
.brand-item-box {
  overflow: hidden;
  background: rgba(0,0,0,0.25);
}

.brand-item-box-inner {
  padding: 28px 40px 36px;
  max-width: 800px;
  margin: 0 auto;
}

.brand-item-txt h2 {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 14px;
  line-height: 1.5;
}

.brand-item-txt p {
  font-size: 15px;
  line-height: 1.9;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

.brand-item-txt a {
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  text-decoration: underline;
  transition: color 0.2s;
}

.brand-item-txt a:hover { color: #fff; }

/* ─── JOIN US ────────────────────── */
#joinus {
  background: #fff;
  padding: 100px 0 120px;
}

#joinus .sec-inner {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-recruit {
  display: inline-block;
  padding: 18px 52px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #fff;
  background: #333;
  border: 2px solid transparent;
  text-decoration: none;
  opacity: 0;
  transition: all 0.3s ease;
}

.btn-recruit:hover {
  background: transparent;
  border-color: #CC0000;
  color: #CC0000;
  transform: translateY(-2px);
}

/* ─── ABOUT ──────────────────────── */
#about {
  background: #333;
  padding: 100px 0;
}

#about .sec-inner-inner {
  align-items: flex-start;
  gap: 60px;
}

#about .sec-box:first-child {
  flex: 0 0 auto;
  width: 220px;
}

#about .sec-box img {
  width: 100%;
  border-radius: 8px;
  opacity: 0.8;
}

#about .sec-box:last-child {
  flex: 1;
}

table.info-table {
  width: 100%;
  border-collapse: collapse;
}

table.info-table th,
table.info-table td {
  padding: 12px 16px;
  font-size: 14px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

table.info-table th {
  color: rgba(255,255,255,0.45);
  font-weight: 600;
  white-space: nowrap;
  width: 100px;
}

table.info-table td {
  color: rgba(255,255,255,0.88);
  line-height: 1.6;
}

/* ─── PROFILE ────────────────────── */
#profile {
  background: #fff;
  padding: 0 0 80px;
}

#profile .sec-inner {
  padding-top: 0;
}

#profile .sec-inner-inner {
  padding-top: 100px;
  align-items: flex-start;
  gap: 60px;
}

.profile-box {
  flex: 1;
  opacity: 0;
}

.profile-box h2 {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.1em;
  margin: 0 0 20px;
  color: #111;
}

.profile-box strong {
  font-size: 20px;
  display: block;
  margin-bottom: 8px;
  color: #111;
}

.profile-box p {
  font-size: 14px;
  line-height: 1.85;
  color: #555;
  margin: 0 0 14px;
}

.profile-box ul.list {
  list-style: disc;
  padding-left: 20px;
  margin: 0 0 14px;
}

.profile-box ul.list li {
  font-size: 14px;
  line-height: 1.85;
  color: #555;
}

.profile-box a {
  color: #CC0000;
  text-decoration: underline;
}

/* ─── FOOTER ─────────────────────── */
#shan-footer {
  background: #111;
  padding: 40px 20px;
  text-align: center;
}

#shan-footer img,
#shan-footer svg {
  display: inline-block;
  margin-bottom: 12px;
}

#shan-footer p {
  font-size: 12px;
  color: rgba(255,255,255,0.28);
  margin: 0;
}

/* ─── RESPONSIVE ─────────────────── */
@media (max-width: 768px) {
  .sec-inner-inner {
    flex-direction: column;
    gap: 32px;
  }

  #about .sec-box:first-child {
    width: 100%;
  }

  #about .sec-box img {
    max-width: 200px;
  }

  .brand-item-box-inner {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .brand-logo-thumb {
    width: 44px;
    height: 44px;
  }

  #joinus .sec-inner {
    flex-direction: column;
    align-items: center;
  }

  .btn-recruit {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }

  #profile .sec-inner-inner {
    flex-direction: column;
    padding-top: 80px;
  }

  .mask-top svg,
  .mask-bottom svg {
    height: 56px;
  }
}

@media (max-width: 480px) {
  #kv-svg svg {
    width: 200px !important;
    height: 170px !important;
  }

  .vision-item {
    min-height: 200px;
  }

  #brand {
    padding: 80px 0;
  }
}
/* @arkzen:web:style:end */

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const shanShanAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    // Subtle parallax on polygon masks (same as MIJ)
    gsap.utils.toArray<HTMLElement>('.mask-top, .mask-bottom').forEach((el) => {
      gsap.to(el.querySelector('svg'), {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}
/* @arkzen:web:animation:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [loaded, setLoaded]           = useState(false)
  const [visionPanel, setVisionPanel] = useState(0)
  const [openService, setOpenService] = useState<number | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // ── scroll animations (after loader) ──────────────────────────────────────
  useEffect(() => {
    if (!loaded) return

    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // KV logo fade-in
      gsap.to('#kv-svg', {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.5,
      })

      // Vision section slide-in
      gsap.fromTo('.vision-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '#vision', start: 'top 82%', toggleActions: 'play none none reset' },
        }
      )

      // Brand items stagger
      gsap.fromTo('.brand-item',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#brand', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      // Skills buttons
      gsap.fromTo('.btn-recruit',
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '#joinus', start: 'top 85%', toggleActions: 'play none none reset' },
        }
      )

      // About boxes
      gsap.fromTo('#about .sec-box',
        { opacity: 0, x: -28 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: '#about', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      // Profile
      gsap.fromTo('.profile-box',
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#profile', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      // Subtle mask parallax
      gsap.utils.toArray<HTMLElement>('.mask-top, .mask-bottom').forEach((el) => {
        gsap.to(el.querySelector('svg'), {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })

    }, pageRef)

    return () => ctx.revert()
  }, [loaded])

  return (
    <div ref={pageRef}>
      {/* LOADER */}
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      {/* BURGER */}
      <BurgerMenu />

      <div id="shan-wrapper">

        {/* ── HERO / KV ── */}
        <div className="sec" id="kv">
          <MaskBottom fill="#fff" />
          <div className="sec-inner">
            <div className="sec-inner-inner">

              {/* Left: photo */}
              <div className="kv-photo-half">
                <img
                  src="/tatemonos/shan-shan/assets/images/shan5.jpg"
                  alt="Shan"
                />
              </div>

              {/* Right: red panel with SHAN logo */}
              <div className="kv-text-half">
                <ShanHeroLogo />
                <span id="kv-svg-alt">
                  designer · document specialist · researcher
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ── VISION ── */}
        <div className="sec" id="vision">
          <div className="sec-inner">
            <div className="sec-inner-inner">

              {/* Left: carousel */}
              <div className="sec-box">
                <div className="vision-carousel">
                  <AnimatePresence mode="wait">
                    {visionPanel === 0 && (
                      <motion.div
                        key="v0"
                        className="vision-item"
                        initial={{ opacity: 0, x: 36 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -36 }}
                        transition={{ duration: 0.32, ease: 'easeInOut' }}
                      >
                        <h2>ABOUT ME</h2>
                        <p>
                          "Clarity is the foundation of good design."
                        </p>
                        <p>
                          I create clean, purposeful designs and craft thorough,
                          well-structured documents and research. Whether it's visual
                          design or deep-dive analysis, I bring clarity and craft to
                          every project.
                        </p>
                        <p>
                          Good design isn't just about aesthetics — it's about
                          communication. Whether I'm crafting a visual identity,
                          preparing a formal document, or diving deep into research,
                          my goal is the same: make it clear, make it purposeful,
                          make it count.
                        </p>
                      </motion.div>
                    )}
                    {visionPanel === 1 && (
                      <motion.div
                        key="v1"
                        className="vision-item"
                        initial={{ opacity: 0, x: 36 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -36 }}
                        transition={{ duration: 0.32, ease: 'easeInOut' }}
                      >
                        <h2>PHILOSOPHY</h2>
                        <p>Design with purpose, deliver with precision</p>
                        <br />
                        <h2>VALUES</h2>
                        <ol className="list">
                          <li>① Clarity over complexity</li>
                          <li>② Every detail serves a purpose</li>
                          <li>③ Research before execution</li>
                          <li>④ Clean, professional deliverables</li>
                          <li>⑤ Client communication is everything</li>
                        </ol>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="vision-nav">
                  {[0, 1].map((i) => (
                    <i
                      key={i}
                      className={visionPanel === i ? 'active' : ''}
                      onClick={() => setVisionPanel(i)}
                    />
                  ))}
                </div>
              </div>

              {/* Right: photo */}
              <div className="sec-box">
                <img
                  src="/tatemonos/shan-shan/assets/images/shan5.jpg"
                  alt="Shan"
                />
              </div>

            </div>
          </div>
        </div>

        {/* ── BRAND / SERVICES ── */}
        <div className="sec" id="brand">
          <MaskTop fill="#fff" />
          <MaskBottom fill="#fff" />

          {openService !== null && (
            <div
              className="brand-close"
              onClick={() => setOpenService(null)}
              role="button"
              aria-label="Close"
            >
              <i /><i />
            </div>
          )}

          <div className="sec-inner">
            <div className="brand-inner">
              {SERVICES.map((svc, i) => (
                <BrandItem
                  key={svc.id}
                  service={svc}
                  isOpen={openService === i}
                  onToggle={() => setOpenService(openService === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── JOIN US / SKILLS ── */}
        <div className="sec" id="joinus">
          <div className="sec-inner">
            <a href="#brand" className="btn-recruit">Graphic Design</a>
            <a href="#brand" className="btn-recruit">Document Preparation</a>
            <a href="#brand" className="btn-recruit">Research &amp; Analysis</a>
            <a href="#brand" className="btn-recruit">Presentation Design</a>
          </div>
          <MaskBottom fill="#333" />
        </div>

        {/* ── ABOUT ── */}
        <div className="sec" id="about">
          <div className="sec-inner">
            <div className="sec-inner-inner">
              <div className="sec-box">
                <img
                  src="/tatemonos/shan-shan/assets/images/shan5.jpg"
                  alt="Shan Sabal Cezar"
                />
              </div>
              <div className="sec-box">
                <table className="info-table">
                  <tbody>
                    {PERSONAL_INFO.map((row) => (
                      <tr key={row.label}>
                        <th>{row.label}</th>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROFILE / CONTACT ── */}
        <div className="sec" id="profile">
          <MaskTop fill="#333" />
          <div className="sec-inner">
            <div className="sec-inner-inner">
              <div className="profile-box">
                <h2>代表者プロフィール</h2>
                <p><strong>Shan Sabal Cezar</strong></p>
                <p>Philippines · Designer · Document Specialist · Researcher</p>
                <ul className="list">
                  <li>Graphic design for print and digital media</li>
                  <li>Professional document preparation and formatting</li>
                  <li>Academic and market research with analysis</li>
                  <li>Presentation design and slide deck creation</li>
                </ul>
                <p>
                  Whether you need a clean report, a polished presentation,
                  a striking poster, or thorough research — I deliver work
                  that's clear, professional, and purposeful.
                </p>
                <p>
                  <a
                    href="https://www.facebook.com/shan.cezar.71"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook · @shan.cezar.71
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div id="shan-footer">
          <svg viewBox="0 0 220 40" width="180">
            <text
              x="110"
              y="28"
              textAnchor="middle"
              fill="rgba(255,255,255,0.28)"
              fontSize="16"
              fontWeight="900"
              fontFamily="'Roboto', sans-serif"
              letterSpacing="3"
            >
              SHAN CEZAR
            </text>
          </svg>
          <p>&copy; 2026 Shan Sabal Cezar &middot; All Rights Reserved</p>
        </div>

      </div>
    </div>
  )
}
/* @arkzen:web:page:index:end */
