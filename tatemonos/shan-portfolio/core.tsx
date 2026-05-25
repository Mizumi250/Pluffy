/* @arkzen:meta
name: shan-portfolio
version: 1.0.0
description: Portfolio website for Shan Sabal Cezar — designer, document specialist, and researcher. Clean, professional showcase with smooth animations.
auth: false
favicon: 🎨
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "shan-root"
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette, FileText, Search, Mail, ExternalLink,
  ChevronDown, Star, Layers, PenTool, BookOpen,
  Layout, Type, Image as ImageIcon, Globe, Menu, X
} from 'lucide-react'

// ─── PROFILE DATA ────────────────────────────────────────────────────────────
const PROFILE = {
  name: 'Shan Sabal Cezar',
  tagline: 'Designer · Document Specialist · Researcher',
  bio: 'I create clean, purposeful designs and craft thorough, well-structured documents and research. Whether it\'s visual design or deep-dive analysis, I bring clarity and craft to every project.',
  location: 'Philippines',
  email: 'shan.cezar@email.com',
  facebook: 'https://www.facebook.com/shan.cezar.71',
}

// ─── SKILLS ──────────────────────────────────────────────────────────────────
const SKILLS = [
  { name: 'Graphic Design', level: 90, color: '#6C63FF' },
  { name: 'Document Preparation', level: 95, color: '#2EC4B6' },
  { name: 'Research & Analysis', level: 92, color: '#E63946' },
  { name: 'Layout & Typography', level: 88, color: '#F77F00' },
  { name: 'Presentation Design', level: 85, color: '#5A189A' },
  { name: 'Academic Writing', level: 87, color: '#0077B6' },
]

// ─── SERVICES ────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: Palette,
    title: 'Design',
    desc: 'Visual design for print and digital — posters, flyers, social media graphics, brand materials.',
    color: '#6C63FF',
  },
  {
    icon: FileText,
    title: 'Documents',
    desc: 'Professional document preparation — reports, proposals, templates, formatted deliverables.',
    color: '#2EC4B6',
  },
  {
    icon: Search,
    title: 'Research',
    desc: 'Thorough research and analysis — academic papers, market studies, data gathering and synthesis.',
    color: '#E63946',
  },
  {
    icon: Layout,
    title: 'Presentations',
    desc: 'Clean, impactful slide decks — pitch presentations, school projects, business proposals.',
    color: '#F77F00',
  },
]

// ─── PROJECTS ────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    title: 'Brand Identity Design',
    category: 'Design',
    desc: 'Complete visual identity package — logo, color palette, typography, and brand guidelines.',
    tags: ['Branding', 'Logo', 'Identity'],
    color: '#6C63FF',
  },
  {
    title: 'Research Paper — Market Analysis',
    category: 'Research',
    desc: 'In-depth market research report with data visualization, competitor analysis, and strategic recommendations.',
    tags: ['Research', 'Analysis', 'Report'],
    color: '#E63946',
  },
  {
    title: 'Business Proposal Template',
    category: 'Documents',
    desc: 'Professional proposal template with clean formatting, executive summary structure, and financial sections.',
    tags: ['Template', 'Business', 'Professional'],
    color: '#2EC4B6',
  },
  {
    title: 'Event Poster Series',
    category: 'Design',
    desc: 'Series of promotional posters for university events — bold typography, vibrant colors, print-ready.',
    tags: ['Poster', 'Print', 'Typography'],
    color: '#F77F00',
  },
  {
    title: 'Academic Research — Literature Review',
    category: 'Research',
    desc: 'Comprehensive literature review with annotated bibliography, thematic analysis, and critical synthesis.',
    tags: ['Academic', 'Literature', 'Writing'],
    color: '#0077B6',
  },
  {
    title: 'Company Report Layout',
    category: 'Documents',
    desc: 'Annual report design with data tables, charts, executive summary, and professional formatting.',
    tags: ['Report', 'Layout', 'Corporate'],
    color: '#5A189A',
  },
]

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
]

// ─── BURGER NAV ──────────────────────────────────────────────────────────────
const MobileNav = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className={`shan-burger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="shan-mobile-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="shan-mobile-link" onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── SKILL BAR ───────────────────────────────────────────────────────────────
const SkillBar = ({ name, level, color, index }: { name: string; level: number; color: string; index: number }) => (
  <div className="shan-skill-bar" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="shan-skill-header">
      <span className="shan-skill-name">{name}</span>
      <span className="shan-skill-level">{level}%</span>
    </div>
    <div className="shan-skill-track">
      <motion.div
        className="shan-skill-fill"
        style={{ background: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
      />
    </div>
  </div>
)

// ─── PROJECT CARD ────────────────────────────────────────────────────────────
const ProjectCard = ({ project, index }: { project: (typeof PROJECTS)[0]; index: number }) => (
  <motion.div
    className="shan-project-card"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <div className="shan-project-color" style={{ background: project.color }} />
    <span className="shan-project-cat" style={{ color: project.color }}>{project.category}</span>
    <h3 className="shan-project-title">{project.title}</h3>
    <p className="shan-project-desc">{project.desc}</p>
    <div className="shan-project-tags">
      {project.tags.map((tag) => (
        <span key={tag} className="shan-tag">{tag}</span>
      ))}
    </div>
  </motion.div>
)

/* @arkzen:web:components:shared:end */

/* @arkzen:web:style */

/* ─── ROOT / RESET ────────────── */
.shan-root {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
  background: #fafafa;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

* { box-sizing: border-box; }

/* ─── NAV ─────────────────────── */
.shan-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.shan-nav-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shan-nav-logo {
  font-size: 18px;
  font-weight: 800;
  color: #1a1a2e;
  letter-spacing: -0.02em;
}

.shan-nav-logo span {
  color: #6C63FF;
}

.shan-nav-links {
  display: flex;
  gap: 24px;
}

.shan-nav-links a {
  font-size: 14px;
  font-weight: 500;
  color: #555;
  text-decoration: none;
  transition: color 0.2s;
}

.shan-nav-links a:hover {
  color: #6C63FF;
}

/* ─── BURGER ──────────────────── */
.shan-burger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #1a1a2e;
  padding: 4px;
}

.shan-mobile-nav {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 99;
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  gap: 12px;
}

.shan-mobile-link {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  text-decoration: none;
  padding: 8px 0;
}

@media (max-width: 640px) {
  .shan-nav-links { display: none; }
  .shan-burger { display: block; }
}

/* ─── HERO ────────────────────── */
.shan-hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background: linear-gradient(135deg, #fafafa 0%, #f0efff 100%);
  position: relative;
  overflow: hidden;
}

.shan-hero::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(108,99,255,0.08), rgba(46,196,182,0.06));
  top: -200px;
  right: -100px;
}

.shan-hero::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(230,57,70,0.06), rgba(247,127,0,0.04));
  bottom: -100px;
  left: -50px;
}

.shan-hero-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.shan-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgba(108,99,255,0.08);
  border: 1px solid rgba(108,99,255,0.15);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: #6C63FF;
  margin-bottom: 24px;
}

.shan-hero-title {
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 16px;
  color: #1a1a2e;
}

.shan-hero-subtitle {
  font-size: clamp(16px, 2.5vw, 20px);
  color: #666;
  font-weight: 400;
  margin: 0 0 32px;
  line-height: 1.5;
}

.shan-hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: #6C63FF;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.shan-hero-cta:hover {
  background: #5a52d5;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(108,99,255,0.3);
}

.shan-scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #aaa;
  font-size: 12px;
  animation: shan-float 2s ease-in-out infinite;
}

@keyframes shan-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

/* ─── SECTIONS ───────────────── */
.shan-section {
  padding: 80px 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.shan-section-header {
  margin-bottom: 48px;
}

.shan-section-label {
  font-size: 13px;
  font-weight: 700;
  color: #6C63FF;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 8px;
}

.shan-section-title {
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 800;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.02em;
}

/* ─── ABOUT ──────────────────── */
.shan-about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.shan-about-text {
  font-size: 15px;
  line-height: 1.8;
  color: #555;
  margin: 0 0 16px;
}

.shan-about-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shan-info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
}

.shan-info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shan-info-label {
  font-size: 12px;
  color: #888;
  margin: 0;
}

.shan-info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

/* ─── SERVICES ───────────────── */
.shan-services-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.shan-service-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.25s;
}

.shan-service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
}

.shan-service-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.shan-service-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1a1a2e;
}

.shan-service-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

/* ─── SKILLS ─────────────────── */
.shan-skills-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shan-skill-bar {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  padding: 16px 20px;
}

.shan-skill-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.shan-skill-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.shan-skill-level {
  font-size: 14px;
  font-weight: 700;
  color: #888;
}

.shan-skill-track {
  height: 6px;
  background: #f0f0f0;
  border-radius: 100px;
  overflow: hidden;
}

.shan-skill-fill {
  height: 100%;
  border-radius: 100px;
}

/* ─── WORK / PROJECTS ────────── */
.shan-projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.shan-project-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s;
}

.shan-project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
}

.shan-project-color {
  width: 40px;
  height: 4px;
  border-radius: 100px;
  margin-bottom: 16px;
}

.shan-project-cat {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 8px;
  display: block;
}

.shan-project-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.shan-project-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #666;
  margin: 0 0 16px;
}

.shan-project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.shan-tag {
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

/* ─── CONTACT ────────────────── */
.shan-contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.shan-contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shan-contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
}

.shan-contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.shan-contact-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shan-contact-label {
  font-size: 12px;
  color: #888;
  margin: 0;
}

.shan-contact-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.shan-contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shan-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 14px;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 10px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.shan-input:focus {
  border-color: #6C63FF;
}

.shan-textarea {
  resize: vertical;
  min-height: 100px;
}

.shan-submit {
  padding: 14px 32px;
  background: #6C63FF;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.shan-submit:hover {
  background: #5a52d5;
}

/* ─── FOOTER ─────────────────── */
.shan-footer {
  text-align: center;
  padding: 32px 24px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.shan-footer-text {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.shan-footer-text span {
  color: #6C63FF;
  font-weight: 600;
}

/* ─── MOBILE ─────────────────── */
@media (max-width: 768px) {
  .shan-about-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .shan-services-grid {
    grid-template-columns: 1fr;
  }

  .shan-projects-grid {
    grid-template-columns: 1fr;
  }

  .shan-contact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .shan-section {
    padding: 60px 16px;
  }

  .shan-hero {
    padding: 60px 16px;
  }
}
/* @arkzen:web:style:end */

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const shanPortfolioAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    // Hero entrance
    gsap.fromTo('.shan-hero-content',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )

    // Nav fade in
    gsap.fromTo('.shan-nav',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )

    // Section headers
    gsap.fromTo('.shan-section-header',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.shan-section-header', start: 'top 85%', toggleActions: 'play none none reset' },
        stagger: 0.1
      }
    )

    // Service cards
    gsap.fromTo('.shan-service-card',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.shan-services-grid', start: 'top 85%', toggleActions: 'play none none reset' }
      }
    )

    // Contact cards
    gsap.fromTo('.shan-contact-card',
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.shan-contact-grid', start: 'top 85%', toggleActions: 'play none none reset' }
      }
    )
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
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = shanPortfolioAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <div ref={pageRef}>
      {/* Nav */}
      <nav className="shan-nav">
        <div className="shan-nav-inner">
          <div className="shan-nav-logo">shan<span>.</span></div>
          <div className="shan-nav-links">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero */}
      <section className="shan-hero">
        <div className="shan-hero-content">
          <div className="shan-hero-badge">
            <Star size={14} />
            Available for projects
          </div>
          <h1 className="shan-hero-title">
            Shan Sabal Cezar
          </h1>
          <p className="shan-hero-subtitle">
            Designer · Document Specialist · Researcher
          </p>
          <a href="#contact" className="shan-hero-cta">
            <Mail size={18} />
            Get in touch
          </a>
        </div>
        <div className="shan-scroll-hint">
          <span>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* About */}
      <section id="about" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">About</p>
          <h2 className="shan-section-title">Who I am</h2>
        </div>
        <div className="shan-about-grid">
          <div>
            <p className="shan-about-text">{PROFILE.bio}</p>
            <p className="shan-about-text">
              I believe good design isn't just about aesthetics — it's about clarity.
              Whether I'm crafting a visual identity, preparing a formal document,
              or diving deep into research, my goal is always the same: make it
              clear, make it purposeful, make it count.
            </p>
          </div>
          <div className="shan-about-info">
            <div className="shan-info-item">
              <div className="shan-info-icon" style={{ background: 'rgba(108,99,255,0.08)' }}>
                <Layers size={20} style={{ color: '#6C63FF' }} />
              </div>
              <div>
                <p className="shan-info-label">Specialization</p>
                <p className="shan-info-value">Design · Documents · Research</p>
              </div>
            </div>
            <div className="shan-info-item">
              <div className="shan-info-icon" style={{ background: 'rgba(46,196,182,0.08)' }}>
                <Globe size={20} style={{ color: '#2EC4B6' }} />
              </div>
              <div>
                <p className="shan-info-label">Based in</p>
                <p className="shan-info-value">{PROFILE.location}</p>
              </div>
            </div>
            <div className="shan-info-item">
              <div className="shan-info-icon" style={{ background: 'rgba(230,57,70,0.08)' }}>
                <BookOpen size={20} style={{ color: '#E63946' }} />
              </div>
              <div>
                <p className="shan-info-label">Focus</p>
                <p className="shan-info-value">Clean, purposeful deliverables</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">Services</p>
          <h2 className="shan-section-title">What I do</h2>
        </div>
        <div className="shan-services-grid">
          {SERVICES.map((service, i) => (
            <div key={service.title} className="shan-service-card">
              <div className="shan-service-icon" style={{ background: `${service.color}12` }}>
                <service.icon size={24} style={{ color: service.color }} />
              </div>
              <h3 className="shan-service-title">{service.title}</h3>
              <p className="shan-service-desc">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">Skills</p>
          <h2 className="shan-section-title">What I'm good at</h2>
        </div>
        <div className="shan-skills-grid">
          {SKILLS.map((skill, i) => (
            <SkillBar key={skill.name} {...skill} index={i} />
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="work" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">Work</p>
          <h2 className="shan-section-title">Selected projects</h2>
        </div>
        <div className="shan-projects-grid">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">Contact</p>
          <h2 className="shan-section-title">Let's work together</h2>
        </div>
        <div className="shan-contact-grid">
          <div className="shan-contact-info">
            <a href={`mailto:${PROFILE.email}`} className="shan-contact-card">
              <div className="shan-contact-icon" style={{ background: 'rgba(108,99,255,0.08)' }}>
                <Mail size={20} style={{ color: '#6C63FF' }} />
              </div>
              <div>
                <p className="shan-contact-label">Email</p>
                <p className="shan-contact-value">{PROFILE.email}</p>
              </div>
            </a>
            <a href={PROFILE.facebook} target="_blank" rel="noopener noreferrer" className="shan-contact-card">
              <div className="shan-contact-icon" style={{ background: 'rgba(46,196,182,0.08)' }}>
                <ExternalLink size={20} style={{ color: '#2EC4B6' }} />
              </div>
              <div>
                <p className="shan-contact-label">Facebook</p>
                <p className="shan-contact-value">Shan Cezar</p>
              </div>
            </a>
            <div className="shan-contact-card">
              <div className="shan-contact-icon" style={{ background: 'rgba(230,57,70,0.08)' }}>
                <Globe size={20} style={{ color: '#E63946' }} />
              </div>
              <div>
                <p className="shan-contact-label">Location</p>
                <p className="shan-contact-value">{PROFILE.location}</p>
              </div>
            </div>
          </div>
          <form className="shan-contact-form" onSubmit={(e) => e.preventDefault()}>
            <input className="shan-input" type="text" placeholder="Your name" />
            <input className="shan-input" type="email" placeholder="Your email" />
            <textarea className="shan-input shan-textarea" placeholder="Your message" />
            <button type="submit" className="shan-submit">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="shan-footer">
        <p className="shan-footer-text">
          Built by <span>Shan Sabal Cezar</span> · Designer · Document Specialist · Researcher
        </p>
      </footer>
    </div>
  )
}
/* @arkzen:web:page:index:end */
