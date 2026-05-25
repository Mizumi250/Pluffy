// ============================================================
// ARKZEN GENERATED PAGE — mij-tribute/index [React+Vite]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-25T06:56:29.552Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { mijTributeAnimations, pageVariants } from '@/arkzen/generated/mij-tribute.animations'
import { useNavigate } from 'react-router-dom'
import './styles/global.css'

// ── Shared components from @arkzen:components ─────────────────────────────────
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

// ── Page component from @arkzen:page:index ─────────────────────────────
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_MijTribute_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = mijTributeAnimations(pageRef)
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

export default ArkzenPage_MijTribute_Index
