// ============================================================
// ARKZEN GENERATED ISLAND — mij-tribute/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T04:25:09.466Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { mijTributeAnimations, pageVariants } from '@/arkzen/generated/mij-tribute.animations'

// Utilities, types, and helper functions from @arkzen:components
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

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const [loaded, setLoaded] = useState(false)
  const [openBrand, setOpenBrand] = useState<number | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaded) return

    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo('.mij-vision-item',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '#vision', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

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

      <section className="mij-kv">
        <DiagonalMask position="bottom" fill="#CC0000" />
        <div className="mij-kv-inner">
          <div className="mij-hero-inner">
            <MIJLogo />
          </div>
        </div>
      </section>

      <section id="vision" className="mij-section mij-vision">
        <div className="mij-section-inner">
          <div className="mij-vision-grid">
            <div className="mij-vision-item">
              <h2 className="mij-heading">MISSION</h2>
              <p className="mij-vision-quote">
                "Creating many small happinesses"
              </p>
              <p className="mij-text">
                Under our purpose of "creating many small happinesses," we build
                businesses around five pillars of human well-being: ① Health
                ② Purpose ③ Free time ④ Good relationships ⑤ Financial security.
              </p>
              <p className="mij-text">
                The MIJ logo expresses these five pillars as five parallel lines,
                resembling the number "1" repeated — symbolizing "raising the flag
                (Startup)," "diving in first (First Penguin)," and "creating
                something unique (The Only One)."
              </p>
            </div>

            <div className="mij-vision-item">
              <h2 className="mij-heading">VISION</h2>
              <p className="mij-vision-quote">
                Creating a global wellness brand from Japan
              </p>

              <h2 className="mij-heading" style={{ marginTop: 24 }}>VALUE</h2>
              <ol className="mij-values-list">
                <li>Believe in your own body</li>
                <li>Believe in our possibilities to the fullest</li>
                <li>Obsess over productivity</li>
                <li>Be someone people love</li>
                <li>Generate heat (passion)</li>
              </ol>
            </div>
          </div>

          <div className="mij-vision-logo">
            <svg viewBox="0 0 200 80" width="200" className="mij-vision-svg">
              <text x="100" y="50" textAnchor="middle" fill="#CC0000"
                fontSize="48" fontWeight="900" fontFamily="sans-serif">
                MIJ
              </text>
            </svg>
          </div>
        </div>
      </section>

      <section id="brand" className="mij-section mij-brands">
        <DiagonalMask position="top" fill="#CC0000" />
        <DiagonalMask position="bottom" fill="#CC0000" />
        <div className="mij-section-inner">
          <h2 className="mij-section-title">BRANDS</h2>
          <div className="mij-brands-grid">
            {BRANDS.map((brand, i) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isOpen={openBrand === i}
                onToggle={() => setOpenBrand(openBrand === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="joinus" className="mij-section mij-joinus">
        <div className="mij-section-inner mij-joinus-inner">
          <a href="#" className="mij-join-btn">Business Leader</a>
          <a href="#" className="mij-join-btn">Office / Admin</a>
        </div>
        <DiagonalMask position="bottom" fill="#333" />
      </section>

      <section id="about" className="mij-section mij-about">
        <div className="mij-section-inner">
          <div className="mij-about-grid">
            <div className="mij-about-box mij-about-visual">
              <svg viewBox="0 0 200 120" width="200" className="mij-about-svg">
                <text x="100" y="50" textAnchor="middle" fill="#CC0000"
                  fontSize="28" fontWeight="900" fontFamily="sans-serif">
                  ABOUT
                </text>
                <text x="100" y="80" textAnchor="middle" fill="#666"
                  fontSize="14" fontFamily="sans-serif">
                  EST. 2010
                </text>
              </svg>
            </div>
            <div className="mij-about-box">
              <table className="mij-table">
                <tbody>
                  {COMPANY_INFO.map((row) => (
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

      <section id="profile" className="mij-section mij-profile">
        <DiagonalMask position="top" fill="#CC0000" />
        <div className="mij-section-inner">
          <div className="mij-profile-content">
            <h2 className="mij-heading">Management Profile</h2>
            <p className="mij-profile-name">
              <strong>Kazuki Yamakawa</strong>
            </p>
            <p className="mij-text">Born March 12, 1983 · Gifu Prefecture · Based in New York</p>
            <ul className="mij-profile-list">
              <li>CEO, Made In Japan Co., Ltd.</li>
              <li>Board Member, IBMA (International Body Maintenance Association)</li>
            </ul>
            <p className="mij-text">
              After working as a freelance personal trainer, he founded MIJ and now
              manages two companies with five brands. While running the business, he
              also competed as a professional boxer — fighting for the OPBF and
              Japanese titles, and facing Filipino champions four times.
            </p>
            <p className="mij-text">
              A pioneer of stretch education, he has certified over 1,500 trainers
              across Japan and internationally. International certification instructor
              (NESTA · IBMA · KAATSU), relaxation contest judge, healthcare app
              advisor, author, TV personality — his activities span far and wide.
            </p>
            <p className="mij-text">
              Drawing from his dual career as an entrepreneur and professional boxer,
              he advocates for diverse work styles and champions athletes' second careers.
              Currently living between New York and Tokyo.
            </p>
          </div>
        </div>
      </section>

      <footer className="mij-footer">
        <svg viewBox="0 0 200 40" width="160" className="mij-footer-logo">
          <text x="100" y="28" textAnchor="middle" fill="rgba(255,255,255,0.3)"
            fontSize="18" fontWeight="900" fontFamily="sans-serif">
            MADE IN JAPAN
          </text>
        </svg>
        <p className="mij-footer-copy">&copy; 2010 Made In Japan Co., Ltd.</p>
      </footer>
    </div>
  )
}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_MijTribute_Index = () => {
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

export default ArkzenIsland_MijTribute_Index
