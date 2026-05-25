/* @arkzen:meta
name: mij-tribute
version: 1.0.0
description: Portfolio for Shan Sabal Cezar — designer, document specialist, researcher. MIJ-inspired layout with diagonal masks, scroll animations, expandable project cards.
auth: false
favicon: 🎨
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

// ─── PROJECTS DATA ───────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 'design',
    logo: '/tatemonos/mij-tribute/assets/images/shan1.jpg',
    title: 'Graphic Design',
    desc: 'Visual design for print and digital — posters, flyers, social media graphics, brand materials. Clean layouts with bold typography that communicate clearly and leave an impression.',
    color: '#CC0000',
  },
  {
    id: 'docs',
    logo: '/tatemonos/mij-tribute/assets/images/shan2.jpg',
    title: 'Document Preparation',
    desc: 'Professional document preparation — reports, proposals, templates, formatted deliverables. Every page structured, every section purposeful, every detail polished.',
    color: '#E63946',
  },
  {
    id: 'research',
    logo: '/tatemonos/mij-tribute/assets/images/shan3.jpg',
    title: 'Research & Analysis',
    desc: 'Thorough research and analysis — academic papers, market studies, data gathering and synthesis. Deep dives that turn complex information into clear, actionable insights.',
    color: '#D62828',
  },
  {
    id: 'present',
    logo: '/tatemonos/mij-tribute/assets/images/shan4.jpg',
    title: 'Presentation Design',
    desc: 'Clean, impactful slide decks — pitch presentations, school projects, business proposals. Every slide designed to support the story, not distract from it.',
    color: '#C1121F',
  },
]

// ─── NAV LINKS ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'ABOUT', href: '#vision' },
  { label: 'SERVICES', href: '#brand' },
  { label: 'SKILLS', href: '#joinus' },
  { label: 'EXPERIENCE', href: '#about' },
  { label: 'CONTACT', href: '#profile' },
]

// ─── COMPANY INFO (reused as personal info) ──────────────────────────────────
const PERSONAL_INFO = [
  { label: 'Name', value: 'Shan Sabal Cezar' },
  { label: 'Role', value: 'Designer · Document Specialist · Researcher' },
  { label: 'Location', value: 'Philippines' },
  { label: 'Specialization', value: 'Graphic design, document preparation, research & analysis, presentation design' },
  { label: 'Tools', value: 'Canva, Microsoft Office, Google Workspace, Adobe Creative Suite' },
  { label: 'Available', value: 'Open for freelance projects and collaborations' },
]

// ─── LOADER COMPONENT ────────────────────────────────────────────────────────
const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.to(barRef.current, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to('.mij-loader', {
          opacity: 0,
          duration: 0.4,
          onComplete,
        })
      },
    })
  }, [onComplete])

  return (
    <div className="mij-loader">
      <div ref={barRef} className="mij-loader-bar" />
    </div>
  )
}

// ─── BURGER MENU ─────────────────────────────────────────────────────────────
const BurgerMenu = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      gsap.fromTo('.mij-nav-link',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.06, duration: 0.35, ease: 'power2.out', delay: 0.1 }
      )
    }
  }, [open])

  return (
    <>
      <button
        className={`mij-burger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <i key={i} />
        ))}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mij-nav"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mij-nav-link"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── DIAGONAL MASK ───────────────────────────────────────────────────────────
const DiagonalMask = ({
  position,
  fill = '#E63946',
}: {
  position: 'top' | 'bottom'
  fill?: string
}) => (
  <div className={`mij-mask mij-mask-${position}`}>
    <svg
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {position === 'top' ? (
        <polygon fill={fill} points="0,0 0,100 1440,0" />
      ) : (
        <polygon fill={fill} points="0,100 1440,100 1440,0" />
      )}
    </svg>
  </div>
)

// ─── SHAN SVG LOGO (path-draw animation) ─────────────────────────────────────
const ShanLogo = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const paths = svgRef.current.querySelectorAll('.mij-logo-path')
    // Set up stroke-dasharray for draw effect
    paths.forEach((path) => {
      const el = path as SVGPathElement | SVGCircleElement
      const length = (el as SVGPathElement).getTotalLength?.() ?? 120
      gsap.set(el, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 1,
      })
    })
    // Animate each path drawing in sequence
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 1.2,
      stagger: 0.18,
      ease: 'power2.inOut',
      delay: 1.5,
    })
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 120"
      width="400"
      height="120"
      className="mij-hero-logo"
    >
      {/* S */}
      <path
        className="mij-logo-path"
        d="M30,10 C30,10 50,0 70,10 C90,20 70,40 50,40 C30,40 10,60 30,80 C50,100 70,90 70,90"
        stroke="#FFFFFF"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* h */}
      <path
        className="mij-logo-path"
        d="M90,20 L90,90 M90,50 Q110,30 130,50 L130,90"
        stroke="#FFFFFF"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* a */}
      <path
        className="mij-logo-path"
        d="M160,50 Q140,40 140,55 Q140,70 160,70 Q175,70 175,55 L175,90 M175,55 Q175,40 155,40 Q140,40 140,55"
        stroke="#FFFFFF"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* n */}
      <path
        className="mij-logo-path"
        d="M195,40 L195,90 M195,55 Q215,35 235,55 L235,90"
        stroke="#FFFFFF"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* . */}
      <circle className="mij-logo-path" cx="260" cy="85" r="5" fill="none" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  )
}

// ─── PROJECT CARD ────────────────────────────────────────────────────────────
const ProjectCard = ({
  project,
  isOpen,
  onToggle,
}: {
  project: (typeof PROJECTS)[0]
  isOpen: boolean
  onToggle: () => void
}) => {
  return (
    <div className={`mij-brand-item ${isOpen ? 'open' : ''}`}>
      <div className="mij-brand-inner">
        <div className="mij-brand-inner-inner">
          <div className="mij-brand-header" onClick={onToggle}>
            <div className="mij-brand-logo-box">
              <img src={project.logo} alt={project.title} className="mij-brand-logo-img-small" />
            </div>
            <h3 className="mij-brand-title">{project.title}</h3>
            <span className="mij-brand-chevron">{isOpen ? '−' : '+'}</span>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="mij-brand-box"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <div className="mij-brand-logo-img">
                  <img src={project.logo} alt={project.title} className="mij-brand-logo-img-large" />
                </div>
                <div className="mij-brand-txt">
                  <h2>{project.title}</h2>
                  <p>{project.desc}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */
/* Shan Portfolio — MIJ-Inspired Stylesheet */

/* ─── RESET / ROOT ───────────── */
.mij-root {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #fff;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

* { box-sizing: border-box; }

/* ─── LOADER ─────────────────── */
.mij-loader {
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}

.mij-loader-bar {
  height: 4px;
  width: 0%;
  background: #E63946;
}

/* ─── BURGER ─────────────────── */
.mij-burger {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.mij-burger i {
  display: block;
  width: 24px;
  height: 2px;
  background: #333;
  transition: all 0.3s ease;
}

.mij-kv .mij-burger i,
.mij-brands .mij-burger i {
  background: #fff;
}

.mij-burger.open i:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
.mij-burger.open i:nth-child(2) { opacity: 0; }
.mij-burger.open i:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }
.mij-burger.open i:nth-child(4) { opacity: 0; }
.mij-burger.open i:nth-child(5) { opacity: 0; }

/* ─── NAV OVERLAY ────────────── */
.mij-nav {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.mij-nav-link {
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.08em;
  padding: 8px 20px;
  transition: color 0.2s;
}

.mij-nav-link:hover {
  color: #E63946;
}

/* ─── HERO / KV ──────────────── */
.mij-kv {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #E63946 0%, #b50000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mij-kv-inner {
  text-align: center;
  padding: 40px 20px;
}

.mij-hero-inner {
  opacity: 0;
}

.mij-hero-logo {
  max-width: 90vw;
}

/* ─── DIAGONAL MASKS ─────────── */
.mij-mask {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  line-height: 0;
}

.mij-mask svg {
  width: 100%;
  height: 80px;
  display: block;
}

.mij-mask-top {
  top: 0;
}

.mij-mask-bottom {
  bottom: 0;
}

/* ─── SECTIONS ───────────────── */
.mij-section {
  position: relative;
  padding: 80px 0;
}

.mij-section-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

.mij-section-title {
  font-size: 32px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 48px;
  letter-spacing: 0.06em;
  color: #fff;
}

/* ─── ABOUT (VISION) ─────────── */
.mij-vision {
  background: #fff;
  padding: 100px 0;
}

.mij-vision-grid {
  margin-bottom: 60px;
}

.mij-vision-item {
}

.mij-heading {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  color: #111;
}

.mij-vision-quote {
  font-size: 18px;
  font-weight: 600;
  color: #E63946;
  margin-bottom: 16px;
  line-height: 1.6;
}

.mij-text {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 12px;
}

.mij-values-list {
  list-style: none;
  padding: 0;
  counter-reset: none;
}

.mij-values-list li {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  padding: 4px 0;
}

.mij-values-list li::before {
  content: '';
}

.mij-vision-carousel {
  min-height: 260px;
  position: relative;
  overflow: hidden;
}

.mij-vision-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 32px 0 40px;
}

.mij-vision-nav i {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
}

.mij-vision-nav i.active {
  background: #E63946;
  transform: scale(1.3);
}

.mij-vision-logo {
  text-align: center;
}

.mij-vision-logo-img {
  width: 200px;
  height: auto;
  opacity: 0.7;
  border-radius: 8px;
}

/* ─── SERVICES (BRANDS) ──────── */
.mij-brands {
  background: linear-gradient(135deg, #E63946 0%, #b50000 100%);
  padding: 120px 0;
  position: relative;
}

.mij-brand-close {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mij-brand-close i {
  display: block;
  width: 24px;
  height: 2px;
  background: rgba(255, 255, 255, 0.7);
  position: absolute;
  transition: all 0.3s ease;
}

.mij-brand-close i:first-child {
  transform: rotate(45deg);
}

.mij-brand-close i:last-child {
  transform: rotate(-45deg);
}

.mij-brand-close:hover i {
  background: #fff;
}

.mij-brands-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mij-brand-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0;
}

.mij-brand-item:last-child {
  border-bottom: none;
}

.mij-brand-inner {
  position: relative;
}

.mij-brand-inner-inner {
  padding: 0;
}

.mij-brand-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  cursor: pointer;
  transition: background 0.2s;
}

.mij-brand-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mij-brand-logo-box {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.mij-brand-logo-img-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.mij-brand-logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.mij-brand-title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.mij-brand-chevron {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
  width: 32px;
  text-align: center;
}

.mij-brand-box {
  overflow: hidden;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 24px;
  padding: 16px 0 28px;
}

.mij-brand-logo-img {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.mij-brand-logo-img-large {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
}

.mij-brand-txt h2 {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  line-height: 1.5;
}

.mij-brand-txt p {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.mij-brand-link {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: underline;
  transition: color 0.2s;
}

.mij-brand-link:hover {
  color: #fff;
}

/* ─── SKILLS (JOIN US) ──────── */
.mij-joinus {
  background: #fff;
  padding: 100px 0 120px;
  text-align: center;
}

.mij-joinus-inner {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.mij-join-btn {
  display: inline-block;
  padding: 16px 48px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #fff;
  background: #333;
  text-decoration: none;
  border-radius: 0;
  transition: all 0.3s ease;
  opacity: 0;
  border: 2px solid transparent;
}

.mij-join-btn:hover {
  background: transparent;
  border-color: #E63946;
  color: #E63946;
  transform: translateY(-2px);
}

/* ─── EXPERIENCE (ABOUT) ────── */
.mij-about {
  background: #333;
  padding: 100px 0;
}

.mij-about-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 60px;
  align-items: start;
}

.mij-about-box {
  opacity: 0;
}

.mij-about-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.mij-about-img {
  width: 200px;
  height: auto;
  border-radius: 8px;
  opacity: 0.8;
}

.mij-table {
  width: 100%;
  border-collapse: collapse;
}

.mij-table th,
.mij-table td {
  padding: 12px 16px;
  font-size: 14px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mij-table th {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  width: 140px;
  white-space: nowrap;
}

.mij-table td {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

/* ─── CONTACT (PROFILE) ─────── */
.mij-profile {
  background: #fff;
  padding: 0 0 80px;
}

.mij-profile-content {
  max-width: 700px;
  opacity: 0;
  position: relative;
  z-index: 3;
  padding-top: 100px;
}

.mij-profile-name {
  font-size: 22px;
  margin-bottom: 8px;
  color: #111;
}

.mij-profile-list {
  list-style: disc;
  padding-left: 20px;
  margin: 16px 0;
}

.mij-profile-list li {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
}

/* ─── FOOTER ─────────────────── */
.mij-footer {
  background: #111;
  padding: 40px 20px;
  text-align: center;
}

.mij-footer-logo {
  margin-bottom: 12px;
}

.mij-footer-copy {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}

/* ─── MOBILE ─────────────────── */
@media (max-width: 768px) {
  .mij-vision-carousel {
    min-height: 200px;
  }

  .mij-about-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .mij-about-visual {
    order: -1;
  }

  .mij-brand-box {
    grid-template-columns: 1fr;
    gap: 16px;
    padding-left: 0;
  }

  .mij-brand-logo-img {
    justify-content: flex-start;
  }

  .mij-brand-header {
    gap: 12px;
  }

  .mij-brand-logo-box {
    width: 48px;
    height: 48px;
  }

  .mij-hero-logo {
    width: 280px;
    height: auto;
  }

  .mij-section {
    padding: 60px 0;
  }

  .mij-brands {
    padding: 80px 0;
  }

  .mij-joinus {
    padding: 60px 0 80px;
  }

  .mij-table th {
    width: 100px;
    font-size: 13px;
  }

  .mij-table td {
    font-size: 13px;
  }

  .mij-nav-link {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .mij-joinus-inner {
    flex-direction: column;
    align-items: center;
  }

  .mij-join-btn {
    width: 100%;
    max-width: 280px;
  }
}
/* @arkzen:web:style:end */

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const mijTributeAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    gsap.to('.mij-mask svg', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.mij-mask',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
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
  const [loaded, setLoaded] = useState(false)
  const [openProject, setOpenProject] = useState<number | null>(null)
  const [visionPanel, setVisionPanel] = useState(0)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaded) return

    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo('.mij-brand-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#brand', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      gsap.fromTo('.mij-join-btn',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '#joinus', start: 'top 85%', toggleActions: 'play none none reset' },
        }
      )

      gsap.fromTo('.mij-about-box',
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: '#about', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      gsap.fromTo('.mij-profile-content',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#profile', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      gsap.fromTo('.mij-hero-inner',
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out', delay: 1.3 }
      )
    }, pageRef)

    return () => ctx.revert()
  }, [loaded])

  return (
    <div ref={pageRef}>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <BurgerMenu />

      {/* ─── HERO ──────────────────────────────────── */}
      <section className="mij-kv">
        <DiagonalMask position="bottom" fill="#E63946" />
        <div className="mij-kv-inner">
          <div className="mij-hero-inner">
            <ShanLogo />
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 500, marginTop: 16, letterSpacing: '0.04em' }}>
              Designer · Document Specialist · Researcher
            </p>
          </div>
        </div>
      </section>

      {/* ─── ABOUT (vision carousel) ────────────────── */}
      <section id="vision" className="mij-section mij-vision">
        <div className="mij-section-inner">
          <div className="mij-vision-carousel">
            <AnimatePresence mode="wait">
              {visionPanel === 0 && (
                <motion.div
                  key="panel-0"
                  className="mij-vision-item"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <h2 className="mij-heading">ABOUT ME</h2>
                  <p className="mij-vision-quote">
                    "Clarity is the foundation of good design."
                  </p>
                  <p className="mij-text">
                    I create clean, purposeful designs and craft thorough, well-structured
                    documents and research. Whether it's visual design or deep-dive analysis,
                    I bring clarity and craft to every project.
                  </p>
                  <p className="mij-text">
                    I believe good design isn't just about aesthetics — it's about clarity.
                    Whether I'm crafting a visual identity, preparing a formal document,
                    or diving deep into research, my goal is always the same: make it
                    clear, make it purposeful, make it count.
                  </p>
                </motion.div>
              )}
              {visionPanel === 1 && (
                <motion.div
                  key="panel-1"
                  className="mij-vision-item"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <h2 className="mij-heading">PHILOSOPHY</h2>
                  <p className="mij-vision-quote">
                    Design with purpose, deliver with precision
                  </p>
                  <h2 className="mij-heading" style={{ marginTop: 24 }}>VALUES</h2>
                  <ol className="mij-values-list">
                    <li>Clarity over complexity</li>
                    <li>Every detail serves a purpose</li>
                    <li>Research before execution</li>
                    <li>Clean, professional deliverables</li>
                    <li>Client communication is everything</li>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mij-vision-nav">
            {[0, 1].map((i) => (
              <i
                key={i}
                className={visionPanel === i ? 'active' : ''}
                onClick={() => setVisionPanel(i)}
              />
            ))}
          </div>
          <div className="mij-vision-logo">
            <img src="/tatemonos/mij-tribute/assets/images/shan5.jpg" alt="Shan" className="mij-vision-logo-img" />
          </div>
        </div>
      </section>

      {/* ─── SERVICES ──────────────────────────────── */}
      <section id="brand" className="mij-section mij-brands">
        <DiagonalMask position="top" fill="#E63946" />
        <DiagonalMask position="bottom" fill="#E63946" />
        {openProject !== null && (
          <button className="mij-brand-close" onClick={() => setOpenProject(null)} aria-label="Close all">
            <i /><i />
          </button>
        )}
        <div className="mij-section-inner">
          <h2 className="mij-section-title">SERVICES</h2>
          <div className="mij-brands-grid">
            {PROJECTS.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                isOpen={openProject === i}
                onToggle={() => setOpenProject(openProject === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SKILLS ────────────────────────────────── */}
      <section id="joinus" className="mij-section mij-joinus">
        <div className="mij-section-inner mij-joinus-inner">
          <a href="#" className="mij-join-btn">Graphic Design</a>
          <a href="#" className="mij-join-btn">Document Preparation</a>
          <a href="#" className="mij-join-btn">Research & Analysis</a>
          <a href="#" className="mij-join-btn">Presentation Design</a>
        </div>
        <DiagonalMask position="bottom" fill="#333" />
      </section>

      {/* ─── EXPERIENCE ────────────────────────────── */}
      <section id="about" className="mij-section mij-about">
        <div className="mij-section-inner">
          <div className="mij-about-grid">
            <div className="mij-about-box mij-about-visual">
              <img src="/tatemonos/mij-tribute/assets/images/shan5.jpg" alt="Shan portfolio" className="mij-about-img" />
            </div>
            <div className="mij-about-box">
              <table className="mij-table">
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
      </section>

      {/* ─── CONTACT ───────────────────────────────── */}
      <section id="profile" className="mij-section mij-profile">
        <DiagonalMask position="top" fill="#E63946" />
        <div className="mij-section-inner">
          <div className="mij-profile-content">
            <h2 className="mij-heading">Let's Work Together</h2>
            <p className="mij-profile-name">
              <strong>Shan Sabal Cezar</strong>
            </p>
            <p className="mij-text">Designer · Document Specialist · Researcher · Philippines</p>
            <ul className="mij-profile-list">
              <li>Graphic design for print and digital</li>
              <li>Professional document preparation and formatting</li>
              <li>Academic and market research with analysis</li>
              <li>Presentation design and slide deck creation</li>
            </ul>
            <p className="mij-text">
              Whether you need a clean report, a polished presentation, a striking poster,
              or thorough research — I deliver work that's clear, professional, and purposeful.
            </p>
            <p className="mij-text">
              <a href="https://www.facebook.com/shan.cezar.71" target="_blank" rel="noopener noreferrer"
                style={{ color: '#E63946', textDecoration: 'underline' }}>
                Find me on Facebook
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────── */}
      <footer className="mij-footer">
        <svg viewBox="0 0 200 40" width="160" className="mij-footer-logo">
          <text x="100" y="28" textAnchor="middle" fill="rgba(255,255,255,0.3)"
            fontSize="18" fontWeight="900" fontFamily="sans-serif">
            SHAN CEZAR
          </text>
        </svg>
        <p className="mij-footer-copy">&copy; 2026 Shan Sabal Cezar · All Rights Reserved</p>
      </footer>
    </div>
  )
}
/* @arkzen:web:page:index:end */
