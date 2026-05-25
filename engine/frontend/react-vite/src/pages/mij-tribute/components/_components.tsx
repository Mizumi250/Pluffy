// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — mij-tribute [React+Vite]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T06:56:29.541Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── PROJECTS DATA ───────────────────────────────────────────────────────────
export const PROJECTS = [
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
export const NAV_LINKS = [
  { label: 'ABOUT', href: '#vision' },
  { label: 'SERVICES', href: '#brand' },
  { label: 'SKILLS', href: '#joinus' },
  { label: 'EXPERIENCE', href: '#about' },
  { label: 'CONTACT', href: '#profile' },
]

// ─── COMPANY INFO (reused as personal info) ──────────────────────────────────
export const PERSONAL_INFO = [
  { label: 'Name', value: 'Shan Sabal Cezar' },
  { label: 'Role', value: 'Designer · Document Specialist · Researcher' },
  { label: 'Location', value: 'Philippines' },
  { label: 'Specialization', value: 'Graphic design, document preparation, research & analysis, presentation design' },
  { label: 'Tools', value: 'Canva, Microsoft Office, Google Workspace, Adobe Creative Suite' },
  { label: 'Available', value: 'Open for freelance projects and collaborations' },
]

// ─── LOADER COMPONENT ────────────────────────────────────────────────────────
export const Loader = ({ onComplete }: { onComplete: () => void }) => {
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
export const BurgerMenu = () => {
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
export const DiagonalMask = ({
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
export const ShanLogo = () => {
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
export const ProjectCard = ({
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
