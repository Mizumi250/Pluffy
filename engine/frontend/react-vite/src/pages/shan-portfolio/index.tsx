// ============================================================
// ARKZEN GENERATED PAGE — shan-portfolio/index [React+Vite]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-25T06:56:30.700Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BookOpen, ChevronDown, ExternalLink, FileText, Globe, Image as ImageIcon, Layers, Layout, Mail, Menu, Palette, PenTool, Search, Star, Type, X } from 'lucide-react'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { shanPortfolioAnimations, pageVariants } from '@/arkzen/generated/shan-portfolio.animations'
import { useNavigate } from 'react-router-dom'
import './styles/global.css'

// ── Shared components from @arkzen:components ─────────────────────────────────
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

// ── Page component from @arkzen:page:index ─────────────────────────────
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_ShanPortfolio_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = shanPortfolioAnimations(pageRef)
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

export default ArkzenPage_ShanPortfolio_Index
