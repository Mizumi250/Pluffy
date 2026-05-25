// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — mij-tribute
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T04:25:09.457Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── BRANDS DATA ─────────────────────────────────────────────────────────────
const BRANDS = [
  {
    id: 'kms',
    logo: 'KMS',
    title: 'Purpose, Freedom, Financial Growth',
    desc: 'Building trainers who change lives. "Learn by Action. Grow by Learning." — an experiential cycle school that develops body workers through real practice, giving them purpose alongside financial independence.',
    url: 'https://school.karadamainte.com/',
    color: '#CC0000',
  },
  {
    id: 'nb',
    logo: 'NB',
    title: 'Building Health',
    desc: 'Most daily discomfort stems from posture. When posture changes, discomfort fades, movement improves, and thinking turns positive. In the age of living to 100, we stretch the nation\'s health span — one body at a time.',
    url: 'https://nb-stretch.com/',
    color: '#1a1a2e',
  },
  {
    id: 'km',
    logo: 'KM',
    title: 'Building Health',
    desc: 'Our founding brand — born in a single apartment room. No business plan, no capital. Just one person living on-site, driven to serve. Today, still our warm third place: bright, open, personal Pilates with heart.',
    url: 'https://karadamainte.com/',
    color: '#e94560',
  },
  {
    id: 'sk',
    logo: 'SK',
    title: 'Building Purpose',
    desc: '"I want to teach, but I haven\'t found what I truly love." Born from that voice — a free video platform for yoga, Pilates, and stretch. Find your purpose when you visit. That\'s the obsession behind this media.',
    url: 'https://manabiba.tv/',
    color: '#0f3460',
  },
]

// ─── NAV LINKS ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "MIJ'S WAY", href: '#vision' },
  { label: 'BRANDS', href: '#brand' },
  { label: 'JOIN US', href: '#joinus' },
  { label: 'ABOUT US', href: '#about' },
  { label: 'MANAGEMENT', href: '#profile' },
]

// ─── COMPANY TABLE ───────────────────────────────────────────────────────────
const COMPANY_INFO = [
  { label: 'Company', value: 'MADE IN JAPAN CO., LTD.' },
  { label: 'Founded', value: 'March 11, 2010' },
  { label: 'Capital', value: '18,000,000 JPY (incl. capital reserve)' },
  { label: 'CEO', value: 'Kazuki Yamakawa' },
  { label: 'Business', value: 'Fitness studio & school management, franchise ops, online video, trainer certification, seminars, publishing, consulting, job placement' },
  { label: 'Address', value: '1-10-6 Ebisu, Shibuya-ku, Tokyo' },
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
  fill = '#CC0000',
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

// ─── MIJ SVG LOGO ────────────────────────────────────────────────────────────
const MIJLogo = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const paths = svgRef.current.querySelectorAll('.mij-logo-path')
    gsap.fromTo(
      paths,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 1.5 }
    )
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 256"
      width="300"
      height="256"
      className="mij-hero-logo"
    >
      <path
        className="mij-logo-path"
        fill="#FFFFFF"
        d="M0,0v222.2h33.3V33.3V0H0z M33.3,33.3h33.3v188.9H100V0H66.7L33.3,33.3z"
      />
      <path
        className="mij-logo-path"
        fill="#FFFFFF"
        d="M100,33.3l33.3,0v188.9h33.3V0h-33.3L100,33.3z"
      />
      <path
        className="mij-logo-path"
        fill="#FFFFFF"
        d="M200,222.2h33.3V0H200V222.2z M266.7,0v255.6l33.3-33.3V0H266.7z"
      />
    </svg>
  )
}

// ─── BRAND CARD ──────────────────────────────────────────────────────────────
const BrandCard = ({
  brand,
  isOpen,
  onToggle,
}: {
  brand: (typeof BRANDS)[0]
  isOpen: boolean
  onToggle: () => void
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className={`mij-brand-item ${isOpen ? 'open' : ''}`}>
      <div className="mij-brand-header" onClick={onToggle}>
        <div className="mij-brand-logo-box" style={{ background: brand.color }}>
          <span className="mij-brand-logo-text">{brand.logo}</span>
        </div>
        <h3 className="mij-brand-title">{brand.title}</h3>
        <span className="mij-brand-chevron">{isOpen ? '−' : '+'}</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={contentRef}
            className="mij-brand-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <p className="mij-brand-desc">{brand.desc}</p>
            <a
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mij-brand-link"
            >
              {brand.url}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
