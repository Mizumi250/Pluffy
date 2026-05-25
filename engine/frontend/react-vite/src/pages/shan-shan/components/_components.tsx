// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — shan-shan [React+Vite]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T07:32:33.639Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const SERVICES = [
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

export const NAV_LINKS = [
  { label: "SHAN'S WAY", href: '#vision' },
  { label: 'SERVICES', href: '#brand' },
  { label: 'SKILLS', href: '#joinus' },
  { label: 'ABOUT ME', href: '#about' },
  { label: 'CONTACT', href: '#profile' },
]

export const PERSONAL_INFO = [
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

export const Loader = ({ onComplete }: { onComplete: () => void }) => {
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

export const BurgerMenu = () => {
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

export const MaskBottom = ({ fill = '#CC0000' }: { fill?: string }) => (
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

export const MaskTop = ({ fill = '#CC0000' }: { fill?: string }) => (
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

export const ShanHeroLogo = () => {
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

export const BrandItem = ({
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
