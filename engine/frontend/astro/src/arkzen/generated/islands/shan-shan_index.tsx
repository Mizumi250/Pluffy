// ============================================================
// ARKZEN GENERATED ISLAND — shan-shan/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T13:43:45.975Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { shanShanAnimations, pageVariants } from '@/arkzen/generated/shan-shan.animations'

// Utilities, types, and helper functions from @arkzen:components
// ─── DATA ─────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    id: 'design',
    num: '01',
    slug: 'visual',
    coverLabel: 'Visual',
    tagline: 'GRAPHIC DESIGN',
    headline: 'Visual clarity,\nbold impressions.',
    desc: 'Visual design for print and digital — posters, flyers, social media graphics, brand materials. Clean layouts with bold typography that communicate clearly and leave an impression.',
    craft: 'Every layout starts from a single question: what should the eye land on first? From there, hierarchy, contrast, and rhythm carry the rest.',
    sound: 'FORM FOLLOWS FEELING',
    tags: ['Print Design', 'Social Graphics', 'Brand Identity', 'Typography'],
    img: '/tatemonos/shan-shan/assets/images/shan1.jpg',
    gallery: [
      '/tatemonos/shan-shan/assets/images/shan1.jpg',
      '/tatemonos/shan-shan/assets/images/shan2.jpg',
      '/tatemonos/shan-shan/assets/images/shan3.jpg',
    ],
    color: '#CC0000',
    coverImg: '/tatemonos/shan-shan/assets/images/shan1.jpg',
  },
  {
    id: 'docs',
    num: '02',
    slug: 'document',
    coverLabel: 'Document',
    tagline: 'DOCUMENT PREPARATION',
    headline: 'Every page structured,\nevery detail polished.',
    desc: 'Professional document preparation — reports, proposals, templates, formatted deliverables. Every page structured, every section purposeful, every detail polished.',
    craft: 'A document is architecture in two dimensions. The margins, the headers, the flow from section to section — all of it is intentional.',
    sound: 'STRUCTURE IS THE STORY',
    tags: ['Reports', 'Proposals', 'Templates', 'Formatting'],
    img: '/tatemonos/shan-shan/assets/images/shan2.jpg',
    gallery: [
      '/tatemonos/shan-shan/assets/images/shan2.jpg',
      '/tatemonos/shan-shan/assets/images/shan3.jpg',
      '/tatemonos/shan-shan/assets/images/shan4.jpg',
    ],
    color: '#111111',
    coverImg: '/tatemonos/shan-shan/assets/images/shan2.jpg',
  },
  {
    id: 'research',
    num: '03',
    slug: 'research',
    coverLabel: 'Research',
    tagline: 'RESEARCH & ANALYSIS',
    headline: 'Deep dives.\nActionable insights.',
    desc: 'Thorough research and analysis — academic papers, market studies, data gathering and synthesis. Deep dives that turn complex information into clear, actionable insights.',
    craft: 'Good research isn\'t just gathering data — it\'s knowing which question to ask next, and having the patience to follow it all the way down.',
    sound: 'DEPTH BEFORE DELIVERY',
    tags: ['Academic Research', 'Market Studies', 'Data Synthesis', 'Analysis'],
    img: '/tatemonos/shan-shan/assets/images/shan3.jpg',
    gallery: [
      '/tatemonos/shan-shan/assets/images/shan3.jpg',
      '/tatemonos/shan-shan/assets/images/shan4.jpg',
      '/tatemonos/shan-shan/assets/images/shan5.jpg',
    ],
    color: '#8B0000',
    coverImg: '/tatemonos/shan-shan/assets/images/shan3.jpg',
  },
  {
    id: 'present',
    num: '04',
    slug: 'present',
    coverLabel: 'Present',
    tagline: 'PRESENTATION DESIGN',
    headline: 'Stories told\none slide at a time.',
    desc: 'Clean, impactful slide decks — pitch presentations, school projects, business proposals. Every slide designed to support the story, not distract from it.',
    craft: 'A great presentation is a rhythm. Breath in: information. Breath out: space. Every slide knows exactly when to speak and when to let silence work.',
    sound: 'ONE SLIDE, ONE TRUTH',
    tags: ['Pitch Decks', 'School Projects', 'Business Proposals', 'Slide Design'],
    img: '/tatemonos/shan-shan/assets/images/shan4.jpg',
    gallery: [
      '/tatemonos/shan-shan/assets/images/shan4.jpg',
      '/tatemonos/shan-shan/assets/images/shan5.jpg',
      '/tatemonos/shan-shan/assets/images/shan1.jpg',
    ],
    color: '#1a1a2e',
    coverImg: '/tatemonos/shan-shan/assets/images/shan4.jpg',
  },
]

const SKILLS_MARQUEE = [
  'Canva', '·', 'Adobe Illustrator', '·', 'Photoshop', '·',
  'Microsoft Word', '·', 'PowerPoint', '·', 'Google Slides', '·',
  'Google Docs', '·', 'Excel', '·', 'Research Writing', '·',
  'Layout Design', '·', 'Typography', '·', 'Brand Identity', '·',
  'Canva', '·', 'Adobe Illustrator', '·', 'Photoshop', '·',
  'Microsoft Word', '·', 'PowerPoint', '·', 'Google Slides', '·',
]

const PERSONAL_INFO = [
  { label: 'NAME', value: 'Shan Sabal Cezar' },
  { label: 'ROLE', value: 'Designer · Document Specialist · Researcher' },
  { label: 'BASE', value: 'Philippines' },
  { label: 'TOOLS', value: 'Canva, Microsoft Office, Google Workspace, Adobe Creative Suite' },
  { label: 'STATUS', value: 'Open for freelance projects and collaborations' },
  { label: 'CONTACT', value: 'Facebook · @shan.cezar.71' },
]

const NAV_LINKS = [
  { label: "SHAN'S WORK", href: '#ch-design' },
  { label: 'SERVICES', href: '#ch-docs' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
]

// ─── LOADER ───────────────────────────────────────────────────────────────────

const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const barRef    = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const countRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Safety fallback — if GSAP stalls for any reason, force-complete after 3s
    const fallback = setTimeout(() => onComplete(), 3000)

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(fallback)
        onComplete()
      },
    })

    // Count up 0–100
    let count = { val: 0 }
    tl.to(count, {
      val: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = Math.floor(count.val) + ''
      },
    }, 0)

    // Bar sweeps across top
    tl.to(barRef.current, {
      width: '100%',
      duration: 1.4,
      ease: 'power2.inOut',
    }, 0)

    // Bar expands downward
    .to(barRef.current, {
      height: '100vh',
      duration: 0.4,
      ease: 'power3.in',
    })

    // Red flood fades out
    .to(screenRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    })

    return () => {
      clearTimeout(fallback)
      tl.kill()
    }
  }, [onComplete])

  return (
    <div ref={screenRef} id="shan-loader">
      <div ref={barRef} id="shan-loader-bar" />
      <div id="shan-loader-count" ref={countRef}>0</div>
      <div id="shan-loader-label">SHAN SABAL CEZAR</div>
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
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, stagger: 0.08, duration: 0.4, ease: 'power3.out' }
        )
      }, 10)
    }
  }

  return (
    <>
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
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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

// ─── SVG DIAGONAL MASKS ───────────────────────────────────────────────────────

const MaskBottom = ({ fill = '#CC0000' }: { fill?: string }) => (
  <div className="mask-bottom">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
      <polygon fill={fill} points="0,100 1440,100 1440,0" />
    </svg>
  </div>
)

const MaskTop = ({ fill = '#CC0000' }: { fill?: string }) => (
  <div className="mask-top">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
      <polygon fill={fill} points="0,0 0,100 1440,0" />
    </svg>
  </div>
)

// ─── ANIMATED SHAN LOGO ───────────────────────────────────────────────────────
// Full stroke-draw animation on mount. Letters are meaty, editorial weight.

const ShanHeroLogo = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const paths = Array.from(svgRef.current.querySelectorAll('.kv-path'))
    paths.forEach((el) => {
      const len = (el as SVGGeometryElement).getTotalLength?.() ?? 400
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 })
    })
    // Staggered draw-on per letter
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 1.2,
      stagger: 0.22,
      ease: 'power2.inOut',
      delay: 1.7,
    })
    // Parent fades in first
    gsap.to('#kv-svg', { opacity: 1, duration: 0.01, delay: 1.65 })

    // After draw: subtle shimmer pulse
    gsap.to(paths, {
      filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.7))',
      duration: 0.6,
      delay: 3.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }, [])

  return (
    <span id="kv-svg">
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 440 120"
        width="440"
        height="120"
        aria-label="SHAN"
      >
        {/* ── S ── */}
        <path className="kv-path"
          d="M 78 22 C 60 22 40 30 40 48 C 40 64 56 70 72 76 C 90 82 104 90 104 108 C 104 124 82 130 62 130 C 46 130 30 124 20 116"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── H ── */}
        <path className="kv-path"
          d="M 128 22 L 128 130 M 128 76 L 184 76 M 184 22 L 184 130"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── A ── */}
        <path className="kv-path"
          d="M 216 130 L 248 22 L 280 130 M 226 96 L 270 96"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── N ── */}
        <path className="kv-path"
          d="M 304 130 L 304 22 L 372 130 L 372 22"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* ── · ── */}
        <circle className="kv-path"
          cx="404" cy="122" r="7"
          fill="none" stroke="#fff" strokeWidth="9"
        />
      </svg>
    </span>
  )
}

// ─── TALE COVER (sticky scroll layer) ────────────────────────────────────────

const ChapterCover = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-cover" id={`cover-${chapter.id}`}>
    <div className="chapter-cover-bg" style={{ backgroundImage: `url(${chapter.coverImg})` }} />
    <div className="chapter-cover-overlay" />
    <div className="chapter-cover-label-l">[{chapter.coverLabel}]</div>
    <div className="chapter-cover-label-r">[{chapter.coverLabel}]</div>
    <div className="chapter-cover-num">{chapter.num}</div>
  </div>
)

// ─── CHAPTER HEAD ─────────────────────────────────────────────────────────────

const ChapterHead = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-head" id={`ch-${chapter.id}`}>
    <div className="chapter-head-inner">
      <div className="chapter-head-pre">
        <span>[{chapter.num}]</span>
        <span>[CHAPTER]</span>
      </div>
      <h2 className="chapter-head-title">{chapter.coverLabel.toUpperCase()}</h2>
      <p className="chapter-head-tagline">{chapter.tagline}</p>
      <p className="chapter-head-abstract">
        {chapter.headline.split('\n').map((l, i) => <React.Fragment key={i}>{l}<br /></React.Fragment>)}
      </p>
      <div className="chapter-head-content">
        {/* Side col 1 */}
        <div className="chapter-side-col">
          <img src={chapter.gallery[1]} alt={chapter.coverLabel} className="chapter-side-img" />
        </div>
        {/* Main image */}
        <div className="chapter-main-img-wrap">
          <img src={chapter.img} alt={chapter.coverLabel} className="chapter-main-img" />
        </div>
        {/* Side col 2 */}
        <div className="chapter-side-col">
          <img src={chapter.gallery[2] || chapter.gallery[0]} alt="" className="chapter-side-img chapter-side-img--offset" />
        </div>
      </div>
    </div>
  </div>
)

// ─── CHAPTER LOOKBOOK ─────────────────────────────────────────────────────────

const ChapterLookbook = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-lookbook">
    <div className="chapter-lookbook-inner">
      <div className="chapter-lookbook-side">
        <img src={chapter.gallery[0]} alt={`${chapter.coverLabel} secondary`} className="chapter-lookbook-secondary" />
        <p className="chapter-lookbook-quote">{chapter.desc}</p>
      </div>
      <div className="chapter-lookbook-main">
        <img src={chapter.gallery[1] || chapter.img} alt={`${chapter.coverLabel} main`} className="chapter-lookbook-main-img" />
      </div>
    </div>
  </div>
)

// ─── CHAPTER STORY ────────────────────────────────────────────────────────────

const ChapterStory = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-story">
    <div className="chapter-story-inner">
      <div className="chapter-story-content">
        <div className="chapter-story-col">
          <h3>[ABOUT THIS]</h3>
          <p>{chapter.desc}</p>
        </div>
        <div className="chapter-story-col">
          <h3>[MY APPROACH]</h3>
          <p>{chapter.craft}</p>
        </div>
      </div>
      {/* Sound-within strip */}
      <div className="chapter-sound-strip">
        <span className="chapter-sound-label">THE SOUND WITHIN</span>
        <span className="chapter-sound-title">{chapter.sound}</span>
        <div className="chapter-sound-bars">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="chapter-sound-bar" style={{ animationDelay: `${i * 0.11}s` }} />
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ─── CHAPTER TAGS / OVERVIEW ──────────────────────────────────────────────────

const ChapterOverview = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-overview" style={{ '--chapter-color': chapter.color } as React.CSSProperties}>
    <div className="chapter-overview-title-wr">
      <h2 className="chapter-overview-title">{chapter.tagline}</h2>
    </div>
    <div className="chapter-overview-img-wrap">
      <img src={chapter.img} alt={chapter.tagline} className="chapter-overview-img" />
    </div>
    <ul className="chapter-overview-tags">
      {chapter.tags.map(t => <li key={t}>{t}</li>)}
    </ul>
    <a href="#contact" className="chapter-overview-cta">Request info</a>
  </div>
)

// ─── CHAPTER OUTRO ────────────────────────────────────────────────────────────

const ChapterOutro = ({ chapter, nextChapter }: { chapter: (typeof CHAPTERS)[0], nextChapter?: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-outro">
    <div className="chapter-outro-inner">
      <div className="chapter-outro-head">
        <p>{chapter.desc.slice(0, 80)}…</p>
        <a href="#contact" className="btn-outline">LET'S WORK</a>
      </div>
      {nextChapter && (
        <div className="chapter-outro-next">
          <span className="chapter-outro-next-label">NEXT</span>
          <a href={`#ch-${nextChapter.id}`} className="chapter-outro-next-link">
            {nextChapter.coverLabel.toUpperCase()} →
          </a>
        </div>
      )}
      <div className="chapter-outro-img-wrap">
        <img src="/tatemonos/shan-shan/assets/images/shan5.jpg" alt="Shan" className="chapter-outro-img" />
        <p>Shan Sabal Cezar</p>
      </div>
    </div>
  </div>
)

// ─── FULL CHAPTER ─────────────────────────────────────────────────────────────

const Chapter = ({ chapter, index }: { chapter: (typeof CHAPTERS)[0]; index: number }) => (
  <section className="homepage-tale" id={`tale-${chapter.id}`}>
    <ChapterCover chapter={chapter} />
    <ChapterHead chapter={chapter} />
    <ChapterLookbook chapter={chapter} />
    <ChapterOverview chapter={chapter} />
    <ChapterStory chapter={chapter} />
    <ChapterOutro chapter={chapter} nextChapter={CHAPTERS[index + 1]} />
  </section>
)

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const [loaded, setLoaded] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  const cursorRef     = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const scrollThumbRef = useRef<HTMLDivElement>(null)

  // ── custom cursor ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top  = e.clientY + 'px'
      }
      if (cursorRingRef.current) {
        // ring lags slightly
        setTimeout(() => {
          if (cursorRingRef.current) {
            cursorRingRef.current.style.left = e.clientX + 'px'
            cursorRingRef.current.style.top  = e.clientY + 'px'
          }
        }, 60)
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // ── scrollbar thumb ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const ratio = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrollThumbRef.current) {
        scrollThumbRef.current.style.height = (ratio * 100) + 'vh'
        scrollThumbRef.current.style.opacity = '1'
      }
      // burger color
      const kvH = (document.getElementById('kv')?.offsetHeight ?? 0) - 80
      document.body.classList.toggle('scrolled', window.scrollY > kvH)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── scroll animations (after loader) ───────────────────────────────────────
  useEffect(() => {
    if (!loaded) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // ── KV: logo already handled inside ShanHeroLogo on mount
      // ── KV photo parallax
      gsap.to('.kv-photo-half img', {
        yPercent: 18, ease: 'none',
        scrollTrigger: {
          trigger: '#kv', start: 'top top',
          end: 'bottom top', scrub: true,
        },
      })

      // ── Intro text stagger
      gsap.fromTo('.intro-pre, .intro-title, .intro-abstract, .intro-caption',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#shan-intro', start: 'top 80%' },
        }
      )

      // ── Per-chapter animations
      CHAPTERS.forEach((ch) => {
        const tale = document.getElementById(`tale-${ch.id}`)
        if (!tale) return

        // Cover bg parallax (zoom-in on scroll-to)
        gsap.fromTo(tale.querySelector('.chapter-cover-bg') as HTMLElement,
          { scale: 1.0 },
          {
            scale: 1.12, ease: 'none',
            scrollTrigger: {
              trigger: `.chapter-cover`,
              containerAnimation: undefined,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          }
        )

        // Chapter title — clip reveal (lines slide up)
        const titleEl = tale.querySelector('.chapter-head-title') as HTMLElement
        if (titleEl) {
          gsap.fromTo(titleEl,
            { y: '110%', opacity: 0 },
            {
              y: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
              scrollTrigger: { trigger: titleEl, start: 'top 90%' },
            }
          )
        }

        // Head pre + tagline + abstract
        gsap.fromTo(tale.querySelectorAll('.chapter-head-pre, .chapter-head-tagline, .chapter-head-abstract'),
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-head-inner'), start: 'top 82%' },
          }
        )

        // Side images — stagger from sides
        const sides = tale.querySelectorAll('.chapter-side-img')
        sides.forEach((el, idx) => {
          gsap.fromTo(el,
            { opacity: 0, x: idx === 0 ? -48 : 48, scale: 0.94 },
            {
              opacity: 1, x: 0, scale: 1,
              duration: 1.0, ease: 'power3.out',
              scrollTrigger: { trigger: tale.querySelector('.chapter-head-content'), start: 'top 78%' },
            }
          )
        })

        // Lookbook images slide-in
        gsap.fromTo(tale.querySelector('.chapter-lookbook-secondary'),
          { opacity: 0, x: -56 },
          {
            opacity: 1, x: 0, duration: 1.0, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-lookbook-inner'), start: 'top 80%' },
          }
        )

        gsap.fromTo(tale.querySelector('.chapter-lookbook-main-img'),
          { opacity: 0, scale: 0.96 },
          {
            opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-lookbook-inner'), start: 'top 80%' },
          }
        )

        gsap.fromTo(tale.querySelector('.chapter-lookbook-quote'),
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-lookbook-inner'), start: 'top 75%' },
          }
        )

        // Overview tags stagger
        gsap.fromTo(tale.querySelectorAll('.chapter-overview-tags li'),
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 0.55, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-overview-img-wrap'), start: 'top 60%' },
          }
        )

        // Story columns
        gsap.fromTo(tale.querySelectorAll('.chapter-story-col'),
          { opacity: 0, x: -32 },
          {
            opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-story-inner'), start: 'top 82%' },
          }
        )

        // Sound strip
        gsap.fromTo(tale.querySelector('.chapter-sound-strip'),
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-sound-strip'), start: 'top 88%' },
          }
        )
      })

      // ── Skills marquee reveal
      gsap.fromTo('#skills-marquee',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#skills-marquee', start: 'top 90%' },
        }
      )

      // ── About — photo + table
      gsap.fromTo('.about-photo-col',
        { opacity: 0, x: -60 },
        {
          opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#about', start: 'top 78%' },
        }
      )
      gsap.fromTo('.about-info-col',
        { opacity: 0, x: 60 },
        {
          opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#about', start: 'top 78%' },
        }
      )
      // Table rows stagger
      gsap.fromTo('.info-table tr',
        { opacity: 0, y: 12 },
        {
          opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: '.info-table', start: 'top 85%' },
        }
      )

      // ── Contact
      gsap.fromTo('.contact-label, .contact-headline, .contact-links',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out',
          scrollTrigger: { trigger: '#contact', start: 'top 80%' },
        }
      )

      // ── Footer logo
      gsap.fromTo('.footer-logo',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '#shan-footer', start: 'top 90%' },
        }
      )

      // ── Mask parallax
      gsap.utils.toArray<HTMLElement>('.mask-top, .mask-bottom').forEach((el) => {
        gsap.to(el.querySelector('svg'), {
          yPercent: 14, ease: 'none',
          scrollTrigger: {
            trigger: el, start: 'top bottom',
            end: 'bottom top', scrub: true,
          },
        })
      })

    }, pageRef)

    return () => ctx.revert()
  }, [loaded])

  // ── duplicate marquee items so it scrolls seamlessly ───────────────────────
  const marqueeItems = [...SKILLS_MARQUEE, ...SKILLS_MARQUEE]

  return (
    <div ref={pageRef}>
      {/* Custom cursor */}
      <div className="shan-cursor" ref={cursorRef} />
      <div className="shan-cursor-ring" ref={cursorRingRef} />

      {/* Scrollbar */}
      <div className="shan-scrollbar">
        <div className="shan-scrollbar-thumb" ref={scrollThumbRef} />
      </div>

      {/* LOADER */}
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      {/* BURGER */}
      <BurgerMenu />

      <div id="shan-wrapper">

        {/* ── HERO / KV ── */}
        <div id="kv">
          <MaskBottom fill="#f5f0eb" />
          <div className="kv-inner">
            <div className="kv-photo-half">
              <img src="/tatemonos/shan-shan/assets/images/shan5.jpg" alt="Shan Sabal Cezar" />
            </div>
            <div className="kv-text-half">
              <ShanHeroLogo />
              <p className="kv-subtitle">designer · document specialist · researcher</p>
              <div className="kv-scroll-hint">
                <div className="kv-scroll-line" />
                <span className="kv-scroll-text">SCROLL</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── INTRO ── */}
        <div id="shan-intro">
          <div className="intro-side-imgs" aria-hidden="true">
            <img src="/tatemonos/shan-shan/assets/images/shan2.jpg" className="intro-side-img intro-side-img--l" alt="" />
            <img src="/tatemonos/shan-shan/assets/images/shan4.jpg" className="intro-side-img intro-side-img--r" alt="" />
          </div>
          <div className="intro-inner">
            <p className="intro-pre">[Intro]</p>
            <h1 className="intro-title">The Invisible Echo</h1>
            <p className="intro-abstract">
              Before the gesture, there is an idea. Before the design, a purpose.
              Shan gathers these invisible intentions and transforms them into work
              that speaks clearly, lingers beautifully.
            </p>
            <p className="intro-caption">An invitation to build something worth remembering.</p>
          </div>
        </div>

        {/* ── 4 CHAPTERS ── */}
        {CHAPTERS.map((chapter, index) => (
          <Chapter key={chapter.id} chapter={chapter} index={index} />
        ))}

        {/* ── SKILLS MARQUEE ── */}
        <div id="skills-marquee">
          <div className="marquee-track">
            {marqueeItems.map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div id="about">
          <MaskTop fill="#f5f0eb" />
          <div className="about-inner">
            <div className="about-photo-col">
              <img src="/tatemonos/shan-shan/assets/images/shan5.jpg" alt="Shan Sabal Cezar" />
            </div>
            <div className="about-info-col">
              <p className="about-section-label">[About Me]</p>
              <h2 className="about-name">Shan<br />Sabal<br />Cezar</h2>
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
          <MaskBottom fill="#f5f0eb" />
        </div>

        {/* ── CONTACT ── */}
        <div id="contact">
          <div className="contact-inner">
            <p className="contact-label">[Contact]</p>
            <h2 className="contact-headline">
              From Five,<br />Everything Begins.
            </h2>
            <div className="contact-links">
              <a
                href="https://www.facebook.com/shan.cezar.71"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                Facebook
              </a>
              <a href="mailto:shan@example.com" className="contact-link">Email</a>
            </div>
          </div>
          <div className="contact-deco" aria-hidden="true">SHAN</div>
        </div>

        {/* ── FOOTER ── */}
        <div id="shan-footer">
          <div className="footer-inner">
            <div className="footer-logo">SHAN.</div>
            <div className="footer-socials">
              <a
                href="https://www.facebook.com/shan.cezar.71"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </div>
          </div>
          <p className="footer-copy">© 2026 Shan Sabal Cezar · All Rights Reserved</p>
        </div>

      </div>
    </div>
  )
}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_ShanShan_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = shanShanAnimations(pageRef)
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

export default ArkzenIsland_ShanShan_Index
