// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — shan-portfolio [React+Vite]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T06:56:30.696Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BookOpen, ChevronDown, ExternalLink, FileText, Globe, Image as ImageIcon, Layers, Layout, Mail, Menu, Palette, PenTool, Search, Star, Type, X } from 'lucide-react'

// ─── PROFILE DATA ────────────────────────────────────────────────────────────
export const PROFILE = {
  name: 'Shan Sabal Cezar',
  tagline: 'Designer · Document Specialist · Researcher',
  bio: 'I create clean, purposeful designs and craft thorough, well-structured documents and research. Whether it\'s visual design or deep-dive analysis, I bring clarity and craft to every project.',
  location: 'Philippines',
  email: 'shan.cezar@email.com',
  facebook: 'https://www.facebook.com/shan.cezar.71',
}

// ─── SKILLS ──────────────────────────────────────────────────────────────────
export const SKILLS = [
  { name: 'Graphic Design', level: 90, color: '#6C63FF' },
  { name: 'Document Preparation', level: 95, color: '#2EC4B6' },
  { name: 'Research & Analysis', level: 92, color: '#E63946' },
  { name: 'Layout & Typography', level: 88, color: '#F77F00' },
  { name: 'Presentation Design', level: 85, color: '#5A189A' },
  { name: 'Academic Writing', level: 87, color: '#0077B6' },
]

// ─── SERVICES ────────────────────────────────────────────────────────────────
export const SERVICES = [
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
export const PROJECTS = [
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
export const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
]

// ─── BURGER NAV ──────────────────────────────────────────────────────────────
export const MobileNav = () => {
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
export const SkillBar = ({ name, level, color, index }: { name: string; level: number; color: string; index: number }) => (
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
export const ProjectCard = ({ project, index }: { project: (typeof PROJECTS)[0]; index: number }) => (
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
