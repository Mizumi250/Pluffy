/* @arkzen:meta
name: shan-shan
version: 2.0.0
description: "Portfolio for Shan Sabal Cezar — Indigo-lab-inspired epic scroll experience. Animated stroke SHAN logo, sticky tale covers, parallax layers, ScrollTrigger-driven entrances across 9 sections: Hero, Intro, 5 Tale-style service chapters, Skills marquee, About, Contact, Footer."
auth: false
*/

/* @arkzen:meta:web
favicon: 🌸
title: Shan Sabal Cezar
description: Portfolio of Shan Sabal Cezar — Indigo-lab-inspired scroll experience.
*/

/* @arkzen:meta:native
label: Shan Sabal Cezar
description: Portfolio of Shan Sabal Cezar — designer, document specialist, researcher
expo:
  bundle_id: com.shanshan.portfolio
  scheme: shanshan
  version: 2.0.0
  orientation: portrait
  status_bar_style: light
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "shan-root"
*/

/* @arkzen:native:config
theme:
  primary: "#CC0000"
  secondary: "#1a1a1a"
  accent: "#8B0000"
  background: "#f5f0eb"
  surface: "#ffffff"
  text: "#1a1a1a"
  muted: "#888888"
*/

// ─────────────────────────────────────────────────────────────────────────────
// WEB SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'

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
    const fallback = setTimeout(() => onComplete(), 3000)

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(fallback)
        onComplete()
      },
    })

    let count = { val: 0 }
    tl.to(count, {
      val: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = Math.floor(count.val) + ''
      },
    }, 0)

    tl.to(barRef.current, {
      width: '100%',
      duration: 1.4,
      ease: 'power2.inOut',
    }, 0)

    .to(barRef.current, {
      height: '100vh',
      duration: 0.4,
      ease: 'power3.in',
    })

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

const ShanHeroLogo = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const paths = Array.from(svgRef.current.querySelectorAll('.kv-path'))
    paths.forEach((el) => {
      const len = (el as SVGGeometryElement).getTotalLength?.() ?? 400
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 })
    })
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 1.2,
      stagger: 0.22,
      ease: 'power2.inOut',
      delay: 1.7,
    })
    gsap.to('#kv-svg', { opacity: 1, duration: 0.01, delay: 1.65 })

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
        <path className="kv-path"
          d="M 78 22 C 60 22 40 30 40 48 C 40 64 56 70 72 76 C 90 82 104 90 104 108 C 104 124 82 130 62 130 C 46 130 30 124 20 116"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        <path className="kv-path"
          d="M 128 22 L 128 130 M 128 76 L 184 76 M 184 22 L 184 130"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        <path className="kv-path"
          d="M 216 130 L 248 22 L 280 130 M 226 96 L 270 96"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
        <path className="kv-path"
          d="M 304 130 L 304 22 L 372 130 L 372 22"
          fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        />
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
        <div className="chapter-side-col">
          <img src={chapter.gallery[1]} alt={chapter.coverLabel} className="chapter-side-img" />
        </div>
        <div className="chapter-main-img-wrap">
          <img src={chapter.img} alt={chapter.coverLabel} className="chapter-main-img" />
        </div>
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

/* @arkzen:web:components:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB STYLES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:style */
/* shan-shan v2 — Indigo-lab × MIJ merged stylesheet */

@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Unbounded:wght@300;400;700;900&display=swap');

.shan-root {
  margin: 0; padding: 0;
  font-family: 'Space Mono', monospace;
  font-weight: 400;
  color: #1a1a1a;
  background: #f5f0eb;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  cursor: none;
}

* { box-sizing: border-box; }
a { text-decoration: none; color: inherit; }

.shan-cursor {
  position: fixed;
  width: 12px; height: 12px;
  background: #CC0000;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transform: translate(-50%, -50%);
  transition: transform 0.08s ease, width 0.2s ease, height 0.2s ease, background 0.2s ease;
  mix-blend-mode: multiply;
}

.shan-cursor-ring {
  position: fixed;
  width: 40px; height: 40px;
  border: 1px solid rgba(204,0,0,0.45);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transform: translate(-50%, -50%);
  transition: transform 0.18s ease, width 0.25s ease, height 0.25s ease;
}

a:hover ~ .shan-cursor,
button:hover ~ .shan-cursor { width: 32px; height: 32px; }

#shan-loader {
  position: fixed; inset: 0;
  background: #0a0a0a;
  z-index: 9999;
  pointer-events: all;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 40px;
  overflow: hidden;
}

#shan-loader-bar {
  position: absolute;
  top: 0; left: 0;
  width: 0%; height: 3px;
  background: #CC0000;
  transform-origin: top left;
}

#shan-loader-count {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(80px, 14vw, 180px);
  font-weight: 900;
  color: #CC0000;
  line-height: 1;
  letter-spacing: -0.04em;
  z-index: 1;
}

#shan-loader-label {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: rgba(255,255,255,0.3);
  margin-top: 8px;
  z-index: 1;
}

#shan-burger {
  position: fixed; top: 24px; right: 24px;
  z-index: 1001;
  width: 44px; height: 36px;
  cursor: pointer;
  display: flex; flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 4px 0;
}

#shan-burger i {
  display: block; height: 2px;
  background: #fff;
  border-radius: 1px;
  transition: all 0.3s ease;
}

#shan-burger i:nth-child(1) { width: 30px; }
#shan-burger i:nth-child(2) { width: 22px; }
#shan-burger i:nth-child(3) { width: 30px; }
#shan-burger i:nth-child(4) { width: 22px; }
#shan-burger i:nth-child(5) { width: 30px; }

body.scrolled #shan-burger i { background: #1a1a1a; }
body.nav-open #shan-burger i { background: #fff; }

#shan-burger.open i:nth-child(1) { transform: translateY(10px) rotate(45deg); width: 30px; }
#shan-burger.open i:nth-child(2) { opacity: 0; }
#shan-burger.open i:nth-child(3) { transform: translateY(-2px) rotate(-45deg); width: 30px; }
#shan-burger.open i:nth-child(4) { opacity: 0; }
#shan-burger.open i:nth-child(5) { opacity: 0; }

.shan-nav {
  position: fixed; inset: 0;
  background: rgba(10,10,10,0.96);
  z-index: 1000;
  display: flex;
  align-items: center; justify-content: center;
}

.shan-nav ul {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
}

.shan-nav ul li { opacity: 0; }

.shan-nav ul li a {
  color: #fff;
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(24px, 4vw, 48px);
  font-weight: 900;
  letter-spacing: -0.02em;
  padding: 12px 40px;
  display: block;
  transition: color 0.2s, letter-spacing 0.3s;
}

.shan-nav ul li a:hover { color: #CC0000; letter-spacing: 0.02em; }

.shan-scrollbar {
  position: fixed;
  right: 6px; top: 0;
  width: 3px; height: 100vh;
  z-index: 500;
  mix-blend-mode: multiply;
}

.shan-scrollbar-thumb {
  width: 3px;
  background: #CC0000;
  position: absolute;
  top: 0;
  border-radius: 2px;
  transition: opacity 0.3s;
}

.mask-top, .mask-bottom {
  position: absolute; left: 0; right: 0;
  z-index: 2; line-height: 0;
  pointer-events: none;
}
.mask-top  { top: 0; }
.mask-bottom { bottom: 0; }
.mask-top svg, .mask-bottom svg {
  display: block; width: 100%;
  height: 80px;
}

#kv {
  min-height: 100vh;
  background: #CC0000;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

#kv .kv-inner {
  display: flex; width: 100%;
  align-items: stretch; min-height: 100vh;
}

.kv-photo-half {
  flex: 1; position: relative; overflow: hidden;
}

.kv-photo-half img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
  filter: brightness(0.85) saturate(0.9);
}

.kv-text-half {
  flex: 1; background: #CC0000;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 80px 56px 140px;
  gap: 24px;
  position: relative;
}

#kv-svg {
  display: inline-block;
  opacity: 0;
}

#kv-svg svg { max-width: 100%; height: auto; }

.kv-subtitle {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.65);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  text-align: center;
}

.kv-scroll-hint {
  position: absolute;
  bottom: 32px; left: 50%;
  transform: translateX(-50%);
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
}

.kv-scroll-line {
  width: 1px; height: 48px;
  background: rgba(255,255,255,0.3);
  overflow: hidden; position: relative;
}

.kv-scroll-line::after {
  content: '';
  position: absolute; inset: 0;
  background: #fff;
  animation: scroll-drop 1.4s ease-in-out infinite;
}

@keyframes scroll-drop {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.kv-scroll-text {
  font-size: 9px;
  letter-spacing: 0.3em;
  color: rgba(255,255,255,0.5);
  writing-mode: horizontal-tb;
}

#shan-intro {
  background: #f5f0eb;
  padding: 160px 0 100px;
  position: relative;
  overflow: hidden;
}

.intro-inner {
  max-width: 560px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex; flex-direction: column;
  align-items: center; gap: 28px;
  text-align: center;
}

.intro-pre {
  font-size: 10px;
  letter-spacing: 0.35em;
  color: #CC0000;
  text-transform: uppercase;
}

.intro-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 400;
  font-style: italic;
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: #1a1a1a;
  margin: 0;
}

.intro-abstract {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(18px, 2.5vw, 26px);
  font-style: italic;
  color: #555;
  line-height: 1.55;
  max-width: 480px;
}

.intro-caption {
  font-size: 12px;
  letter-spacing: 0.15em;
  color: #888;
  margin: 0;
}

.intro-side-imgs {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 100%;
  pointer-events: none;
}

.intro-side-img {
  position: absolute;
  top: 20px;
  width: 200px;
  height: auto;
  opacity: 0.15;
}

.intro-side-img--l { left: 24px; }
.intro-side-img--r { right: 24px; transform: scaleX(-1); }

.homepage-tale { position: relative; }

.homepage-tale::after {
  content: '';
  display: block;
  height: 100vh;
  background: #f5f0eb;
  position: absolute;
  bottom: -100vh; left: 0; right: 0;
}

.chapter-cover {
  height: 100svh; min-height: 500px;
  overflow: hidden;
  position: sticky; top: 0;
  width: 100%;
}

.chapter-cover-bg {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  transform-origin: center;
}

.chapter-cover-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.38);
}

.chapter-cover-label-l,
.chapter-cover-label-r {
  position: absolute;
  bottom: 50%;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  z-index: 1;
}

.chapter-cover-label-l { left: 80px; }
.chapter-cover-label-r { right: 80px; }

.chapter-cover-num {
  position: absolute;
  bottom: 32px; left: 50%;
  transform: translateX(-50%);
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(80px, 20vw, 220px);
  font-weight: 900;
  color: rgba(255,255,255,0.06);
  line-height: 1;
  letter-spacing: -0.05em;
  z-index: 0;
  pointer-events: none;
  user-select: none;
}

.chapter-head {
  position: relative;
  overflow: hidden;
}

.chapter-head-inner {
  background: #fff;
  max-width: 1560px;
  margin: 0 auto;
  padding: 64px 48px 120px;
}

.chapter-head-pre {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  letter-spacing: 0.25em;
  color: #aaa;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.chapter-head-title {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(64px, 14vw, 200px);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.9;
  text-align: center;
  text-transform: uppercase;
  color: #1a1a1a;
  margin: 0 0 20px;
  overflow: hidden;
  text-wrap: nowrap;
}

.chapter-head-tagline {
  font-size: 10px;
  letter-spacing: 0.35em;
  color: #CC0000;
  text-align: center;
  margin: 0 0 24px;
  text-transform: uppercase;
}

.chapter-head-abstract {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(20px, 2.8vw, 32px);
  font-style: italic;
  color: #555;
  text-align: center;
  max-width: 540px;
  margin: 0 auto 56px;
  line-height: 1.45;
}

.chapter-head-content {
  display: flex;
  gap: 0;
  align-items: flex-start;
  position: relative;
}

.chapter-main-img-wrap {
  flex: 0 0 52%;
  order: 2;
}

.chapter-main-img {
  width: 100%;
  height: auto;
  display: block;
}

.chapter-side-col {
  flex: 0 0 24%;
  order: 1;
  padding-top: 80px;
  overflow: hidden;
}

.chapter-side-col:last-child {
  order: 3;
  padding-top: 200px;
}

.chapter-side-img {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0;
}

.chapter-side-img--offset { margin-top: 48px; }

.chapter-lookbook {
  position: relative;
  overflow: hidden;
}

.chapter-lookbook-inner {
  background: #fff;
  display: flex;
  max-width: 1560px;
  margin: 0 auto;
  overflow: hidden;
  padding-bottom: 120px;
}

.chapter-lookbook-side {
  flex: 0 0 40%;
  display: flex; flex-direction: column;
  padding: 80px 40px 0;
  overflow: hidden;
}

.chapter-lookbook-secondary {
  width: 80%; height: auto;
  display: block;
  opacity: 0;
}

.chapter-lookbook-quote {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(14px, 1.6vw, 19px);
  font-style: italic;
  line-height: 1.75;
  color: #555;
  margin: 40px 0 0 20px;
  max-width: 320px;
  opacity: 0;
}

.chapter-lookbook-main { flex: 0 0 60%; }

.chapter-lookbook-main-img {
  width: 100%;
  height: 100%; min-height: 560px;
  object-fit: cover;
  display: block;
  opacity: 0;
}

.chapter-overview {
  position: relative;
  overflow: hidden;
}

.chapter-overview-title-wr {
  position: sticky;
  top: 0; z-index: 2;
  margin-top: -320px;
  margin-bottom: -320px;
}

.chapter-overview-title {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 900;
  background: #1a1a1a;
  color: #fff;
  text-align: center;
  width: 100%;
  padding: 20px 24px;
  margin: 0;
  letter-spacing: -0.02em;
}

.chapter-overview-img-wrap {
  position: relative;
}

.chapter-overview-img {
  width: 100%;
  min-height: 100svh;
  object-fit: cover;
  display: block;
}

.chapter-overview-tags {
  position: absolute;
  bottom: 80px;
  left: 50%; transform: translateX(-50%);
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column;
  align-items: center; gap: 16px;
  z-index: 2;
}

.chapter-overview-tags li {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  background: #fff;
  color: #1a1a1a;
  padding: 6px 20px;
  opacity: 0;
}

.chapter-overview-cta {
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: #CC0000;
  color: #fff;
  padding: 18px 48px;
  display: inline-block;
  z-index: 2;
  transition: background 0.25s, transform 0.25s;
}

.chapter-overview-cta:hover {
  background: #1a1a1a;
  transform: translateX(-50%) translateY(-4px);
}

.chapter-story { position: relative; overflow: hidden; }

.chapter-story-inner {
  background: #fff;
  max-width: 1560px;
  margin: 0 auto;
  padding: 80px 80px 100px;
}

.chapter-story-content {
  display: flex;
  gap: 120px;
  margin-bottom: 60px;
}

.chapter-story-col { flex: 1; opacity: 0; }

.chapter-story-col h3 {
  font-size: 10px;
  letter-spacing: 0.3em;
  color: #aaa;
  text-transform: uppercase;
  margin: 0 0 20px;
}

.chapter-story-col p {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(15px, 1.5vw, 18px);
  font-style: italic;
  line-height: 1.8;
  color: #444;
  margin: 0;
}

.chapter-sound-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 32px 0;
  border-top: 1px solid rgba(0,0,0,0.08);
  opacity: 0;
}

.chapter-sound-label {
  font-size: 9px;
  letter-spacing: 0.35em;
  color: #bbb;
  text-transform: uppercase;
}

.chapter-sound-title {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(12px, 1.5vw, 16px);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #1a1a1a;
}

.chapter-sound-bars {
  display: flex; align-items: center;
  gap: 3px; height: 20px;
}

.chapter-sound-bar {
  display: block;
  width: 2px; background: #CC0000;
  border-radius: 1px;
  animation: sound-bar 1.2s ease-in-out infinite alternate;
}

@keyframes sound-bar {
  from { height: 4px; opacity: 0.4; }
  to   { height: 20px; opacity: 1; }
}

.chapter-sound-bar:nth-child(1)  { animation-delay: 0s; }
.chapter-sound-bar:nth-child(2)  { animation-delay: 0.11s; }
.chapter-sound-bar:nth-child(3)  { animation-delay: 0.22s; }
.chapter-sound-bar:nth-child(4)  { animation-delay: 0.33s; }
.chapter-sound-bar:nth-child(5)  { animation-delay: 0.44s; }
.chapter-sound-bar:nth-child(6)  { animation-delay: 0.33s; }
.chapter-sound-bar:nth-child(7)  { animation-delay: 0.22s; }
.chapter-sound-bar:nth-child(8)  { animation-delay: 0.11s; }
.chapter-sound-bar:nth-child(9)  { animation-delay: 0s; }

.chapter-outro { position: relative; padding-top: max(100svh, 500px); }

.chapter-outro-inner {
  background: #f5f0eb;
  display: flex;
  gap: 40px;
  max-width: 1560px;
  margin: 0 auto;
  overflow: hidden;
  min-height: 480px;
  padding: 48px 48px 0;
}

.chapter-outro-head {
  flex: 0 0 33%;
  display: flex; flex-direction: column;
  gap: 24px;
  padding-top: 40px;
}

.chapter-outro-head p {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(16px, 2vw, 22px);
  font-style: italic;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.btn-outline {
  display: inline-block;
  padding: 14px 36px;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: 2px solid #1a1a1a;
  color: #1a1a1a;
  width: fit-content;
  transition: all 0.25s ease;
}

.btn-outline:hover {
  background: #CC0000;
  border-color: #CC0000;
  color: #fff;
  transform: translateY(-2px);
}

.chapter-outro-next {
  flex: 0 0 33%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px;
}

.chapter-outro-next-label {
  font-size: 9px;
  letter-spacing: 0.4em;
  color: #bbb;
  text-transform: uppercase;
}

.chapter-outro-next-link {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(20px, 3vw, 36px);
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  transition: color 0.2s, letter-spacing 0.3s;
}

.chapter-outro-next-link:hover {
  color: #CC0000;
  letter-spacing: 0.02em;
}

.chapter-outro-img-wrap {
  flex: 0 0 33%;
  display: flex; flex-direction: column;
  overflow: hidden;
}

.chapter-outro-img {
  width: 100%; height: calc(100% - 24px);
  object-fit: cover; display: block;
}

.chapter-outro-img-wrap p {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #aaa;
  text-align: center;
  padding: 8px 0;
  margin: 0;
  text-transform: uppercase;
}

#skills-marquee {
  background: #CC0000;
  padding: 24px 0;
  overflow: hidden;
  position: relative;
}

.marquee-track {
  display: flex;
  gap: 0;
  white-space: nowrap;
  animation: marquee-scroll 28s linear infinite;
}

.marquee-track span {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(14px, 2vw, 20px);
  font-weight: 700;
  color: #fff;
  padding: 0 24px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

#about {
  background: #1a1a1a;
  padding: 120px 0 100px;
  position: relative;
  overflow: hidden;
}

.about-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  gap: 80px;
  align-items: flex-start;
}

.about-photo-col {
  flex: 0 0 280px;
  opacity: 0;
}

.about-photo-col img {
  width: 100%;
  height: auto;
  display: block;
  filter: brightness(0.85) contrast(1.1);
}

.about-info-col { flex: 1; opacity: 0; }

.about-section-label {
  font-size: 9px;
  letter-spacing: 0.4em;
  color: #CC0000;
  text-transform: uppercase;
  margin: 0 0 32px;
}

.about-name {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.03em;
  margin: 0 0 40px;
  line-height: 1;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table th, .info-table td {
  padding: 14px 0;
  font-size: 13px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.info-table th {
  color: rgba(255,255,255,0.3);
  font-weight: 400;
  white-space: nowrap;
  width: 100px;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.info-table td {
  color: rgba(255,255,255,0.82);
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 15px;
  line-height: 1.55;
  padding-left: 24px;
}

#contact {
  background: #f5f0eb;
  padding: 120px 0 80px;
  position: relative;
  overflow: hidden;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.contact-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 48px;
  text-align: center;
}

.contact-label {
  font-size: 9px;
  letter-spacing: 0.4em;
  color: #CC0000;
  text-transform: uppercase;
  margin: 0 0 24px;
}

.contact-headline {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(40px, 8vw, 100px);
  font-style: italic;
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: #1a1a1a;
  margin: 0 0 48px;
}

.contact-links {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-link {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 16px 44px;
  background: #1a1a1a;
  color: #fff;
  transition: all 0.25s ease;
  display: inline-block;
}

.contact-link:hover {
  background: #CC0000;
  transform: translateY(-3px);
}

.contact-deco {
  position: absolute;
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(80px, 20vw, 300px);
  font-weight: 900;
  color: rgba(204,0,0,0.04);
  line-height: 1;
  bottom: -20px; left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

#shan-footer {
  background: #0a0a0a;
  padding: 60px 48px 32px;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 32px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 24px;
}

.footer-logo {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(28px, 6vw, 72px);
  font-weight: 900;
  color: #CC0000;
  letter-spacing: -0.04em;
  line-height: 1;
}

.footer-socials {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-socials a {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  padding: 10px 20px;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
}

.footer-socials a:hover {
  color: #fff;
  border-color: rgba(255,255,255,0.4);
}

.footer-copy {
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
}

@media (max-width: 900px) {
  #kv .kv-inner { flex-direction: column; }
  .kv-photo-half { flex: 0 0 45vh; }
  .kv-text-half  { flex: 1; padding: 40px 24px 100px; }
  #kv-svg svg    { width: 260px !important; }

  .chapter-head-inner  { padding: 48px 24px 80px; }
  .chapter-head-content { flex-wrap: wrap; gap: 16px; }
  .chapter-side-col    { display: none; }
  .chapter-main-img-wrap { flex: 0 0 100%; }

  .chapter-lookbook-inner { flex-direction: column; }
  .chapter-lookbook-side  { flex: none; padding: 40px 24px 0; }
  .chapter-lookbook-secondary { width: 70%; margin: 0 auto; }
  .chapter-lookbook-main  { flex: none; min-height: 320px; }

  .chapter-story-inner { padding: 48px 24px 60px; }
  .chapter-story-content { flex-direction: column; gap: 40px; }

  .chapter-outro-inner { flex-direction: column; padding: 40px 24px 0; min-height: auto; }
  .chapter-outro-next  { flex: none; padding: 32px 0; }
  .chapter-outro-img-wrap { flex: 0 0 260px; }

  .about-inner { flex-direction: column; gap: 40px; padding: 0 24px; }
  .about-photo-col { flex: none; max-width: 240px; }

  .footer-inner { justify-content: center; text-align: center; }
  .footer-socials { justify-content: center; }

  .intro-side-img { display: none; }

  .chapter-cover-label-l,
  .chapter-cover-label-r { display: none; }
}
/* @arkzen:web:style:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

const shanShanAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
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
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}
/* @arkzen:web:animation:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB PAGE
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

const IndexPage = () => {
  const [loaded, setLoaded] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  const cursorRef     = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const scrollThumbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top  = e.clientY + 'px'
      }
      if (cursorRingRef.current) {
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

  useEffect(() => {
    const onScroll = () => {
      const ratio = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrollThumbRef.current) {
        scrollThumbRef.current.style.height = (ratio * 100) + 'vh'
        scrollThumbRef.current.style.opacity = '1'
      }
      const kvH = (document.getElementById('kv')?.offsetHeight ?? 0) - 80
      document.body.classList.toggle('scrolled', window.scrollY > kvH)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!loaded) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      gsap.to('.kv-photo-half img', {
        yPercent: 18, ease: 'none',
        scrollTrigger: {
          trigger: '#kv', start: 'top top',
          end: 'bottom top', scrub: true,
        },
      })

      gsap.fromTo('.intro-pre, .intro-title, .intro-abstract, .intro-caption',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#shan-intro', start: 'top 80%' },
        }
      )

      CHAPTERS.forEach((ch) => {
        const tale = document.getElementById(`tale-${ch.id}`)
        if (!tale) return

        gsap.fromTo(tale.querySelector('.chapter-cover-bg') as HTMLElement,
          { scale: 1.0 },
          {
            scale: 1.12, ease: 'none',
            scrollTrigger: {
              trigger: `.chapter-cover`,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          }
        )

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

        gsap.fromTo(tale.querySelectorAll('.chapter-head-pre, .chapter-head-tagline, .chapter-head-abstract'),
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-head-inner'), start: 'top 82%' },
          }
        )

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

        gsap.fromTo(tale.querySelectorAll('.chapter-overview-tags li'),
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 0.55, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-overview-img-wrap'), start: 'top 60%' },
          }
        )

        gsap.fromTo(tale.querySelectorAll('.chapter-story-col'),
          { opacity: 0, x: -32 },
          {
            opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-story-inner'), start: 'top 82%' },
          }
        )

        gsap.fromTo(tale.querySelector('.chapter-sound-strip'),
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: tale.querySelector('.chapter-sound-strip'), start: 'top 88%' },
          }
        )
      })

      gsap.fromTo('#skills-marquee',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#skills-marquee', start: 'top 90%' },
        }
      )

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
      gsap.fromTo('.info-table tr',
        { opacity: 0, y: 12 },
        {
          opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: '.info-table', start: 'top 85%' },
        }
      )

      gsap.fromTo('.contact-label, .contact-headline, .contact-links',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out',
          scrollTrigger: { trigger: '#contact', start: 'top 80%' },
        }
      )

      gsap.fromTo('.footer-logo',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '#shan-footer', start: 'top 90%' },
        }
      )

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

  const marqueeItems = [...SKILLS_MARQUEE, ...SKILLS_MARQUEE]

  return (
    <div ref={pageRef}>
      <div className="shan-cursor" ref={cursorRef} />
      <div className="shan-cursor-ring" ref={cursorRingRef} />

      <div className="shan-scrollbar">
        <div className="shan-scrollbar-thumb" ref={scrollThumbRef} />
      </div>

      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <BurgerMenu />

      <div id="shan-wrapper">

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

        {CHAPTERS.map((chapter, index) => (
          <Chapter key={chapter.id} chapter={chapter} index={index} />
        ))}

        <div id="skills-marquee">
          <div className="marquee-track">
            {marqueeItems.map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>

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
/* @arkzen:web:page:index:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE STYLES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:style:shared */
.screen {
  flex: 1;
  background-color: #f5f0eb;
}

.screen-dark {
  flex: 1;
  background-color: #1a1a1a;
}

.section-label {
  font-size: 9px;
  font-weight: 400;
  color: #CC0000;
  letter-spacing: 4px;
}

.section-label-light {
  font-size: 9px;
  font-weight: 400;
  color: rgba(255,255,255,0.4);
  letter-spacing: 4px;
}

.divider {
  height: 1px;
  background-color: rgba(26,26,26,0.1);
}

.divider-dark {
  height: 1px;
  background-color: rgba(255,255,255,0.08);
}

.red-pill {
  padding-horizontal: 12px;
  padding-vertical: 4px;
  background-color: #CC0000;
  align-self: flex-start;
}

.red-pill-text {
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2px;
}

.dark-pill {
  padding-horizontal: 12px;
  padding-vertical: 4px;
  background-color: #1a1a1a;
  align-self: flex-start;
}

.dark-pill-text {
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2px;
}

.tag-pill {
  padding-horizontal: 12px;
  padding-vertical: 5px;
  background-color: #ffffff;
  border-width: 1px;
  border-color: rgba(26,26,26,0.12);
}

.tag-pill-text {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: #1a1a1a;
}

.tag-pill-red {
  padding-horizontal: 12px;
  padding-vertical: 5px;
  background-color: rgba(204,0,0,0.08);
  border-width: 1px;
  border-color: rgba(204,0,0,0.2);
}

.tag-pill-red-text {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: #CC0000;
}

.cta-button {
  background-color: #CC0000;
  padding-vertical: 16px;
  padding-horizontal: 36px;
  align-items: center;
  justify-content: center;
}

.cta-button-text {
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
}

.outline-button {
  border-width: 1.5px;
  border-color: #1a1a1a;
  padding-vertical: 16px;
  padding-horizontal: 36px;
  align-items: center;
  justify-content: center;
}

.outline-button-text {
  color: #1a1a1a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
}

.outline-button-light {
  border-width: 1.5px;
  border-color: rgba(255,255,255,0.4);
  padding-vertical: 16px;
  padding-horizontal: 36px;
  align-items: center;
  justify-content: center;
}

.outline-button-light-text {
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
}

.info-label {
  font-size: 9px;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.3);
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: rgba(255,255,255,0.82);
  font-style: italic;
  line-height: 20px;
}
/* @arkzen:native:style:shared:end */

/* @arkzen:native:style:hero */
.hero-wrap {
  background-color: #CC0000;
  padding-top: 72px;
  padding-bottom: 64px;
  padding-horizontal: 28px;
  overflow: hidden;
  position: relative;
}

.hero-eyebrow {
  font-size: 9px;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 20px;
}

.hero-logo {
  font-size: 80px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -4px;
  line-height: 80px;
  margin-bottom: 6px;
}

.hero-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.65);
  letter-spacing: 1px;
  line-height: 20px;
  margin-bottom: 36px;
}

.hero-watermark {
  position: absolute;
  bottom: -20px;
  right: -12px;
  font-size: 130px;
  font-weight: 900;
  color: rgba(0,0,0,0.06);
  letter-spacing: -7px;
  line-height: 130px;
}

.hero-scroll-hint {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.hero-scroll-line {
  width: 32px;
  height: 1px;
  background-color: rgba(255,255,255,0.35);
}

.hero-scroll-text {
  font-size: 9px;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.45);
}
/* @arkzen:native:style:hero:end */

/* @arkzen:native:style:intro */
.intro-wrap {
  background-color: #f5f0eb;
  padding-horizontal: 28px;
  padding-top: 56px;
  padding-bottom: 48px;
}

.intro-pre {
  font-size: 9px;
  letter-spacing: 4px;
  color: #CC0000;
  margin-bottom: 16px;
}

.intro-title {
  font-size: 40px;
  font-weight: 300;
  color: #1a1a1a;
  font-style: italic;
  line-height: 44px;
  letter-spacing: -1.5px;
  margin-bottom: 20px;
}

.intro-abstract {
  font-size: 15px;
  color: #666666;
  line-height: 24px;
  font-style: italic;
  margin-bottom: 12px;
}

.intro-caption {
  font-size: 11px;
  letter-spacing: 2px;
  color: #aaaaaa;
}
/* @arkzen:native:style:intro:end */

/* @arkzen:native:style:marquee */
.marquee-wrap {
  background-color: #CC0000;
  padding-vertical: 18px;
  overflow: hidden;
}

.marquee-item {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  padding-horizontal: 18px;
  letter-spacing: 1px;
}
/* @arkzen:native:style:marquee:end */

/* @arkzen:native:style:chapter */
.chapter-section-header {
  background-color: #ffffff;
  padding-horizontal: 28px;
  padding-top: 48px;
  padding-bottom: 24px;
}

.chapter-section-eyebrow {
  font-size: 9px;
  letter-spacing: 4px;
  color: #CC0000;
  margin-bottom: 10px;
}

.chapter-section-title {
  font-size: 32px;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: -1.5px;
  line-height: 34px;
}

.chapter-wrap {
  margin-bottom: 2px;
  background-color: #ffffff;
  overflow: hidden;
}

.chapter-cover-img {
  width: 100%;
  height: 260px;
}

.chapter-cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 260px;
  background-color: rgba(0,0,0,0.36);
}

.chapter-cover-num {
  font-size: 88px;
  font-weight: 900;
  color: rgba(255,255,255,0.07);
  letter-spacing: -5px;
  line-height: 88px;
}

.chapter-cover-badge {
  position: absolute;
  top: 18px;
  left: 18px;
}

.chapter-cover-label {
  position: absolute;
  bottom: 18px;
  left: 18px;
}

.chapter-cover-label-text {
  font-size: 9px;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.7);
}

.chapter-body {
  padding-horizontal: 24px;
  padding-top: 28px;
  padding-bottom: 0px;
}

.chapter-tagline {
  font-size: 9px;
  letter-spacing: 3px;
  color: #CC0000;
  margin-bottom: 8px;
}

.chapter-title {
  font-size: 32px;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: -1.5px;
  line-height: 34px;
  margin-bottom: 16px;
}

.chapter-headline {
  font-size: 16px;
  font-weight: 300;
  color: #444444;
  font-style: italic;
  line-height: 24px;
  margin-bottom: 20px;
}

.chapter-desc {
  font-size: 13px;
  color: #666666;
  line-height: 22px;
  margin-bottom: 24px;
}

.chapter-divider {
  height: 1px;
  background-color: rgba(0,0,0,0.07);
  margin-horizontal: 24px;
  margin-vertical: 4px;
}

.chapter-lookbook-img {
  width: 100%;
  height: 200px;
}

.chapter-craft-wrap {
  padding-horizontal: 24px;
  padding-vertical: 24px;
  background-color: #f9f6f2;
}

.chapter-craft-label {
  font-size: 9px;
  letter-spacing: 3px;
  color: #aaaaaa;
  margin-bottom: 10px;
}

.chapter-craft-text {
  font-size: 14px;
  color: #555555;
  font-style: italic;
  line-height: 22px;
  border-left-width: 2px;
  border-left-color: #CC0000;
  padding-left: 14px;
}

.chapter-tags-wrap {
  padding-horizontal: 24px;
  padding-vertical: 20px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

.chapter-sound-strip {
  flex-direction: row;
  align-items: center;
  padding-horizontal: 24px;
  padding-vertical: 20px;
  border-top-width: 1px;
  border-top-color: rgba(0,0,0,0.06);
  gap: 10px;
}

.chapter-sound-label {
  font-size: 8px;
  letter-spacing: 2px;
  color: #bbbbbb;
}

.chapter-sound-title {
  font-size: 11px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.5px;
  flex: 1;
}

.chapter-outro-wrap {
  background-color: #f5f0eb;
  padding-horizontal: 24px;
  padding-top: 32px;
  padding-bottom: 40px;
  margin-bottom: 2px;
}

.chapter-outro-desc {
  font-size: 13px;
  color: #666666;
  font-style: italic;
  line-height: 22px;
  margin-bottom: 20px;
}

.chapter-next-label {
  font-size: 9px;
  letter-spacing: 3px;
  color: #bbbbbb;
  margin-top: 24px;
  margin-bottom: 6px;
}

.chapter-next-title {
  font-size: 22px;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}
/* @arkzen:native:style:chapter:end */

/* @arkzen:native:style:skills */
.skills-section {
  background-color: #ffffff;
  padding-horizontal: 28px;
  padding-vertical: 48px;
}

.skills-title {
  font-size: 28px;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: -1px;
  margin-bottom: 4px;
}

.skills-sub {
  font-size: 12px;
  color: #888888;
  letter-spacing: 1px;
  margin-bottom: 32px;
}

.skill-row {
  margin-bottom: 20px;
}

.skill-name {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.skill-bar-bg {
  height: 2px;
  background-color: rgba(26,26,26,0.1);
  border-radius: 2px;
  overflow: hidden;
}

.skill-bar-fill {
  height: 2px;
  background-color: #CC0000;
  border-radius: 2px;
}
/* @arkzen:native:style:skills:end */

/* @arkzen:native:style:about */
.about-wrap {
  background-color: #1a1a1a;
  padding-bottom: 60px;
}

.about-photo {
  width: 100%;
  height: 320px;
}

.about-body {
  padding-horizontal: 28px;
  padding-top: 40px;
}

.about-name {
  font-size: 52px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -3px;
  line-height: 50px;
  margin-bottom: 40px;
  margin-top: 16px;
}

.about-info-row {
  padding-vertical: 16px;
}
/* @arkzen:native:style:about:end */

/* @arkzen:native:style:contact */
.contact-wrap {
  background-color: #f5f0eb;
  padding-horizontal: 28px;
  padding-vertical: 64px;
  align-items: center;
}

.contact-headline {
  font-size: 40px;
  font-weight: 300;
  color: #1a1a1a;
  font-style: italic;
  text-align: center;
  line-height: 44px;
  letter-spacing: -1.5px;
  margin-top: 16px;
  margin-bottom: 40px;
}

.contact-watermark {
  font-size: 88px;
  font-weight: 900;
  color: rgba(204,0,0,0.04);
  letter-spacing: -5px;
  margin-top: 40px;
  text-align: center;
}
/* @arkzen:native:style:contact:end */

/* @arkzen:native:style:footer */
.footer-wrap {
  background-color: #0a0a0a;
  padding-horizontal: 28px;
  padding-top: 48px;
  padding-bottom: 40px;
}

.footer-logo {
  font-size: 48px;
  font-weight: 900;
  color: #CC0000;
  letter-spacing: -3px;
  line-height: 48px;
  margin-bottom: 24px;
}

.footer-copy {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.2);
  text-align: center;
  margin-top: 20px;
}

.footer-social-btn {
  padding-horizontal: 20px;
  padding-vertical: 10px;
  border-width: 1px;
  border-color: rgba(255,255,255,0.12);
}

.footer-social-text {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.4);
}
/* @arkzen:native:style:footer:end */

/* @arkzen:native:style:nav */
.nav-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10,10,10,0.97);
  z-index: 100;
  justify-content: center;
  align-items: center;
  padding-horizontal: 40px;
}

.nav-link-text {
  font-size: 36px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -1px;
  padding-vertical: 12px;
}

.nav-link-text-active {
  font-size: 36px;
  font-weight: 900;
  color: #CC0000;
  letter-spacing: -1px;
  padding-vertical: 12px;
}

.nav-close-btn {
  position: absolute;
  top: 52px;
  right: 24px;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
}

.nav-close-text {
  font-size: 28px;
  color: #ffffff;
  font-weight: 300;
}

.burger-btn {
  position: absolute;
  top: 52px;
  right: 24px;
  z-index: 50;
  width: 44px;
  height: 36px;
  justify-content: space-between;
  padding-vertical: 4px;
  align-items: flex-end;
}
/* @arkzen:native:style:nav:end */

/* @arkzen:native:style:loader */
.loader-wrap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #0a0a0a;
  z-index: 999;
  justify-content: flex-end;
  align-items: flex-start;
  padding-horizontal: 40px;
  padding-bottom: 48px;
}

.loader-count {
  font-size: 100px;
  font-weight: 900;
  color: #CC0000;
  letter-spacing: -5px;
  line-height: 100px;
}

.loader-label {
  font-size: 11px;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.25);
  margin-top: 8px;
}

.loader-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  background-color: #CC0000;
}
/* @arkzen:native:style:loader:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE COMPONENTS (EXPO)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:shared + @arkzen:import:expo */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Animated,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native'
import { setActiveTatemono } from '@/arkzen/core/stores/authStore'

setActiveTatemono('shan-shan')

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    id: 'design',
    num: '01',
    coverLabel: 'Visual',
    tagline: 'GRAPHIC DESIGN',
    headline: 'Visual clarity,\nbold impressions.',
    desc: 'Visual design for print and digital — posters, flyers, social media graphics, brand materials. Clean layouts with bold typography that communicate clearly and leave an impression.',
    craft: 'Every layout starts from a single question: what should the eye land on first? From there, hierarchy, contrast, and rhythm carry the rest.',
    sound: 'FORM FOLLOWS FEELING',
    tags: ['Print Design', 'Social Graphics', 'Brand Identity', 'Typography'],
    img: require('../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
    gallery: [
      require('../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
    ],
    color: '#CC0000',
  },
  {
    id: 'docs',
    num: '02',
    coverLabel: 'Document',
    tagline: 'DOCUMENT PREPARATION',
    headline: 'Every page structured,\nevery detail polished.',
    desc: 'Professional document preparation — reports, proposals, templates, formatted deliverables. Every page structured, every section purposeful, every detail polished.',
    craft: 'A document is architecture in two dimensions. The margins, the headers, the flow from section to section — all of it is intentional.',
    sound: 'STRUCTURE IS THE STORY',
    tags: ['Reports', 'Proposals', 'Templates', 'Formatting'],
    img: require('../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
    gallery: [
      require('../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
    ],
    color: '#111111',
  },
  {
    id: 'research',
    num: '03',
    coverLabel: 'Research',
    tagline: 'RESEARCH & ANALYSIS',
    headline: 'Deep dives.\nActionable insights.',
    desc: 'Thorough research and analysis — academic papers, market studies, data gathering and synthesis. Deep dives that turn complex information into clear, actionable insights.',
    craft: "Good research isn't just gathering data — it's knowing which question to ask next, and having the patience to follow it all the way down.",
    sound: 'DEPTH BEFORE DELIVERY',
    tags: ['Academic Research', 'Market Studies', 'Data Synthesis', 'Analysis'],
    img: require('../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
    gallery: [
      require('../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan5.jpg'),
    ],
    color: '#8B0000',
  },
  {
    id: 'present',
    num: '04',
    coverLabel: 'Present',
    tagline: 'PRESENTATION DESIGN',
    headline: 'Stories told\none slide at a time.',
    desc: 'Clean, impactful slide decks — pitch presentations, school projects, business proposals. Every slide designed to support the story, not distract from it.',
    craft: 'A great presentation is a rhythm. Breath in: information. Breath out: space. Every slide knows exactly when to speak and when to let silence work.',
    sound: 'ONE SLIDE, ONE TRUTH',
    tags: ['Pitch Decks', 'School Projects', 'Business Proposals', 'Slide Design'],
    img: require('../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
    gallery: [
      require('../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan5.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
    ],
    color: '#1a1a2e',
  },
]

const SKILLS = [
  { name: 'CANVA',               pct: 96 },
  { name: 'ADOBE ILLUSTRATOR',   pct: 85 },
  { name: 'PHOTOSHOP',           pct: 80 },
  { name: 'MICROSOFT WORD',      pct: 98 },
  { name: 'POWERPOINT',          pct: 94 },
  { name: 'GOOGLE SLIDES',       pct: 95 },
  { name: 'RESEARCH WRITING',    pct: 90 },
  { name: 'LAYOUT DESIGN',       pct: 88 },
  { name: 'TYPOGRAPHY',          pct: 84 },
]

const SKILLS_MARQUEE = [
  'Canva', '·', 'Adobe Illustrator', '·', 'Photoshop', '·',
  'Microsoft Word', '·', 'PowerPoint', '·', 'Google Slides', '·',
  'Google Docs', '·', 'Excel', '·', 'Research Writing', '·',
  'Layout Design', '·', 'Typography', '·', 'Brand Identity', '·',
]

const PERSONAL_INFO = [
  { label: 'NAME',    value: 'Shan Sabal Cezar' },
  { label: 'ROLE',    value: 'Designer · Document Specialist · Researcher' },
  { label: 'BASE',    value: 'Philippines' },
  { label: 'TOOLS',   value: 'Canva, Microsoft Office, Google Workspace, Adobe Suite' },
  { label: 'STATUS',  value: 'Open for freelance projects and collaborations' },
  { label: 'CONTACT', value: 'Facebook · @shan.cezar.71' },
]

const NAV_LINKS = [
  { label: "SHAN'S WORK", scrollTo: 'work' },
  { label: 'SKILLS',      scrollTo: 'skills' },
  { label: 'ABOUT',       scrollTo: 'about' },
  { label: 'CONTACT',     scrollTo: 'contact' },
]

// ─── LOADER ───────────────────────────────────────────────────────────────────

const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0)
  const barWidth  = useRef(new Animated.Value(0)).current
  const barHeight = useRef(new Animated.Value(3)).current
  const opacity   = useRef(new Animated.Value(1)).current

  useEffect(() => {
    let frame = 0
    const total = 60
    const timer = setInterval(() => {
      frame++
      setCount(Math.round((frame / total) * 100))
      if (frame >= total) clearInterval(timer)
    }, 23)

    Animated.sequence([
      Animated.timing(barWidth, {
        toValue: SCREEN_W,
        duration: 1400,
        useNativeDriver: false,
      }),
      Animated.timing(barHeight, {
        toValue: SCREEN_H,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => onComplete())

    return () => clearInterval(timer)
  }, [])

  return (
    <Animated.View style={[s.loaderWrap, { opacity }]} pointerEvents="none">
      <Animated.View style={[s.loaderBar, { width: barWidth, height: barHeight }]} />
      <Text style={s.loaderCount}>{count}</Text>
      <Text style={s.loaderLabel}>SHAN SABAL CEZAR</Text>
    </Animated.View>
  )
}

// ─── SOUND BARS ───────────────────────────────────────────────────────────────

const SoundBars = () => {
  const anims = useRef(
    Array.from({ length: 9 }, (_, i) => ({
      val: new Animated.Value(4),
      delay: i * 110,
    }))
  ).current

  useEffect(() => {
    anims.forEach(({ val, delay }) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 20, duration: 380, useNativeDriver: false }),
          Animated.timing(val, { toValue: 4,  duration: 380, useNativeDriver: false }),
        ])
      ).start()
    })
  }, [])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 20 }}>
      {anims.map(({ val }, i) => (
        <Animated.View
          key={i}
          style={{
            width: 2,
            height: val,
            backgroundColor: '#CC0000',
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  )
}

// ─── FADE-IN WRAPPER ──────────────────────────────────────────────────────────

const FadeIn = ({
  children,
  delay = 0,
  from = 'bottom',
  distance = 28,
}: {
  children: React.ReactNode
  delay?: number
  from?: 'bottom' | 'left' | 'right' | 'none'
  distance?: number
}) => {
  const opacity = useRef(new Animated.Value(0)).current
  const translate = useRef(new Animated.Value(distance)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 640, delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0, duration: 640, delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const transform =
    from === 'bottom' ? [{ translateY: translate }] :
    from === 'left'   ? [{ translateX: translate }] :
    from === 'right'  ? [{ translateX: Animated.multiply(translate, -1) }] :
    []

  return (
    <Animated.View style={{ opacity, transform }}>
      {children}
    </Animated.View>
  )
}

// ─── STAGGER CONTAINER ────────────────────────────────────────────────────────

const StaggerReveal = ({
  children,
  baseDelay = 0,
  stagger = 80,
}: {
  children: React.ReactNode[]
  baseDelay?: number
  stagger?: number
}) => (
  <>
    {React.Children.map(children, (child, i) => (
      <FadeIn key={i} delay={baseDelay + i * stagger}>
        {child}
      </FadeIn>
    ))}
  </>
)

// ─── BURGER / NAV ─────────────────────────────────────────────────────────────

const BurgerNav = ({
  onNavigate,
  darkBg = false,
}: {
  onNavigate: (target: string) => void
  darkBg?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const navItemAnims   = useRef(NAV_LINKS.map(() => ({
    opacity:    new Animated.Value(0),
    translateX: new Animated.Value(-40),
  }))).current

  const openNav = () => {
    setOpen(true)
    Animated.timing(overlayOpacity, {
      toValue: 1, duration: 320,
      useNativeDriver: true,
    }).start(() => {
      NAV_LINKS.forEach((_, i) => {
        Animated.parallel([
          Animated.timing(navItemAnims[i].opacity, {
            toValue: 1, duration: 340, delay: i * 80,
            useNativeDriver: true,
          }),
          Animated.timing(navItemAnims[i].translateX, {
            toValue: 0, duration: 340, delay: i * 80,
            useNativeDriver: true,
          }),
        ]).start()
      })
    })
  }

  const closeNav = () => {
    navItemAnims.forEach(({ opacity: op, translateX: tx }) => {
      Animated.timing(op,  { toValue: 0, duration: 180, useNativeDriver: true }).start()
      Animated.timing(tx,  { toValue: -40, duration: 180, useNativeDriver: true }).start()
    })
    Animated.timing(overlayOpacity, {
      toValue: 0, duration: 300, delay: 120,
      useNativeDriver: true,
    }).start(() => {
      setOpen(false)
      navItemAnims.forEach(({ opacity: op, translateX: tx }) => {
        op.setValue(0); tx.setValue(-40)
      })
    })
  }

  const handleLink = (scrollTo: string) => {
    setActive(scrollTo)
    closeNav()
    setTimeout(() => {
      onNavigate(scrollTo)
      setActive(null)
    }, 340)
  }

  const line1Rotate    = useRef(new Animated.Value(0)).current
  const line2Opacity   = useRef(new Animated.Value(1)).current
  const line3Rotate    = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(line1Rotate,  { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(line2Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(line3Rotate,  { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(line1Rotate,  { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(line2Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(line3Rotate,  { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start()
    }
  }, [open])

  const lineColor = darkBg ? '#ffffff' : '#ffffff'

  return (
    <>
      <TouchableOpacity
        style={s.burgerBtn}
        onPress={openNav}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Animated.View style={{
          height: 2, width: 28, backgroundColor: lineColor, borderRadius: 1,
          transform: [{
            rotate: line1Rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg', '45deg'] }),
          }, {
            translateY: line1Rotate.interpolate({ inputRange: [0,1], outputRange: [0, 10] }),
          }],
        }} />
        <Animated.View style={{
          height: 2, width: 20, backgroundColor: lineColor, borderRadius: 1,
          opacity: line2Opacity,
        }} />
        <Animated.View style={{
          height: 2, width: 28, backgroundColor: lineColor, borderRadius: 1,
          transform: [{
            rotate: line3Rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg', '-45deg'] }),
          }, {
            translateY: line3Rotate.interpolate({ inputRange: [0,1], outputRange: [0, -10] }),
          }],
        }} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[s.navOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={s.navCloseBtn} onPress={closeNav} activeOpacity={0.7}>
            <Text style={s.navCloseText}>×</Text>
          </TouchableOpacity>

          <View style={{ width: '100%', gap: 4 }}>
            {NAV_LINKS.map((link, i) => (
              <Animated.View
                key={link.scrollTo}
                style={{
                  opacity: navItemAnims[i].opacity,
                  transform: [{ translateX: navItemAnims[i].translateX }],
                }}
              >
                <TouchableOpacity
                  onPress={() => handleLink(link.scrollTo)}
                  activeOpacity={0.7}
                >
                  <Text style={active === link.scrollTo ? s.navLinkTextActive : s.navLinkText}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={{ position: 'absolute', bottom: 48, left: 40 }}>
            <Text style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.2)' }}>
              SHAN SABAL CEZAR · PORTFOLIO
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  )
}

// ─── GALLERY STRIP ────────────────────────────────────────────────────────────

const GalleryStrip = ({ images }: { images: any[] }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap: 2, paddingHorizontal: 0 }}
  >
    {images.map((img, i) => (
      <Image
        key={i}
        source={img}
        style={{ width: SCREEN_W * 0.72, height: 200 }}
        resizeMode="cover"
      />
    ))}
  </ScrollView>
)

// ─── SKILL BAR ────────────────────────────────────────────────────────────────

const SkillBar = ({ name, pct, delay = 0 }: { name: string; pct: number; delay?: number }) => {
  const width = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  const reveal = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 400, delay,
        useNativeDriver: true,
      }),
      Animated.timing(width, {
        toValue: (SCREEN_W - 56) * (pct / 100),
        duration: 800, delay,
        useNativeDriver: false,
      }),
    ]).start()
  }, [])

  useEffect(() => { reveal() }, [])

  return (
    <Animated.View style={[s.skillRow, { opacity }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={s.skillName}>{name}</Text>
        <Text style={{ fontSize: 10, color: '#aaa', letterSpacing: 1 }}>{pct}%</Text>
      </View>
      <View style={s.skillBarBg}>
        <Animated.View style={[s.skillBarFill, { width }]} />
      </View>
    </Animated.View>
  )
}

// ─── CHAPTER COMPONENT ────────────────────────────────────────────────────────

const Chapter = ({
  chapter,
  index,
  onWorkPress,
}: {
  chapter: typeof CHAPTERS[0]
  index: number
  onWorkPress: () => void
}) => {
  const coverScale   = useRef(new Animated.Value(1)).current
  const bodyOpacity  = useRef(new Animated.Value(0)).current
  const bodyTranslate = useRef(new Animated.Value(32)).current
  const [revealed, setRevealed] = useState(false)

  const revealBody = useCallback(() => {
    if (revealed) return
    setRevealed(true)
    Animated.parallel([
      Animated.timing(bodyOpacity, {
        toValue: 1, duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(bodyTranslate, {
        toValue: 0, duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [revealed])

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(coverScale, { toValue: 1.04, duration: 6000, useNativeDriver: true }),
        Animated.timing(coverScale, { toValue: 1.00, duration: 6000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const nextChapter = CHAPTERS[index + 1]

  return (
    <View
      style={s.chapterWrap}
      onLayout={revealBody}
    >
      <View style={{ overflow: 'hidden', height: 260 }}>
        <Animated.Image
          source={chapter.img}
          style={[s.chapterCoverImg, { transform: [{ scale: coverScale }] }]}
          resizeMode="cover"
        />
        <View style={s.chapterCoverOverlay} />

        <View style={{ position: 'absolute', bottom: 8, right: 16 }}>
          <Text style={s.chapterCoverNum}>{chapter.num}</Text>
        </View>

        <View style={[s.chapterCoverBadge]}>
          <View style={s.redPill}>
            <Text style={s.redPillText}>[{chapter.coverLabel.toUpperCase()}]</Text>
          </View>
        </View>

        <View style={s.chapterCoverLabel}>
          <Text style={s.chapterCoverLabelText}>[{chapter.num}] [CHAPTER]</Text>
        </View>
      </View>

      <Animated.View style={{ opacity: bodyOpacity, transform: [{ translateY: bodyTranslate }] }}>

        <View style={s.chapterBody}>
          <Text style={s.chapterTagline}>{chapter.tagline}</Text>
          <Text style={s.chapterTitle}>{chapter.coverLabel.toUpperCase()}</Text>
          <Text style={s.chapterHeadline}>{chapter.headline}</Text>
          <Text style={s.chapterDesc}>{chapter.desc}</Text>

          <View style={s.chapterTagsWrap}>
            {chapter.tags.map((tag) => (
              <View key={tag} style={s.tagPill}>
                <Text style={s.tagPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.chapterDivider} />

        <View style={{ marginVertical: 2 }}>
          <GalleryStrip images={chapter.gallery} />
        </View>

        <View style={s.chapterDivider} />

        <View style={s.chapterCraftWrap}>
          <Text style={s.chapterCraftLabel}>[MY APPROACH]</Text>
          <Text style={s.chapterCraftText}>{chapter.craft}</Text>
        </View>

        <View style={s.chapterDivider} />

        <View style={s.chapterSoundStrip}>
          <Text style={s.chapterSoundLabel}>THE SOUND WITHIN</Text>
          <Text style={s.chapterSoundTitle}>{chapter.sound}</Text>
          <SoundBars />
        </View>

        <View style={s.chapterOutroWrap}>
          <Text style={s.chapterOutroDesc}>{chapter.desc.slice(0, 90)}…</Text>

          <TouchableOpacity style={s.ctaButton} onPress={onWorkPress} activeOpacity={0.8}>
            <Text style={s.ctaButtonText}>LET'S WORK</Text>
          </TouchableOpacity>

          {nextChapter && (
            <>
              <Text style={s.chapterNextLabel}>NEXT CHAPTER</Text>
              <Text style={s.chapterNextTitle}>{nextChapter.coverLabel.toUpperCase()} →</Text>
            </>
          )}
        </View>

      </Animated.View>
    </View>
  )
}

/* @arkzen:native:components:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE ANIMATION (RN)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:animation:rn */
import Animated as RAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated'

export function shanShanNativeAnimations() {
  const marqueeX = useSharedValue(0)

  const startMarquee = (halfWidth: number) => {
    marqueeX.value = withRepeat(
      withTiming(-halfWidth, {
        duration: 22000,
        easing: Easing.linear,
      }),
      -1,
      false
    )
  }

  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: marqueeX.value }],
  }))

  const logoScale   = useSharedValue(0.88)
  const logoOpacity = useSharedValue(0)

  const revealLogo = () => {
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 500 }))
    logoScale.value   = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.4)) }))
  }

  const logoStyle = useAnimatedStyle(() => ({
    opacity:   logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  const scrollBounce = useSharedValue(0)

  const startScrollBounce = () => {
    scrollBounce.value = withRepeat(
      withSequence(
        withTiming(8,  { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0,  { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false
    )
  }

  const scrollBounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollBounce.value }],
  }))

  return {
    startMarquee, marqueeStyle,
    revealLogo, logoStyle,
    startScrollBounce, scrollBounceStyle,
  }
}
/* @arkzen:native:animation:rn:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE PAGE: INDEX (EXPO)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:page:index + @arkzen:import:expo */

import React, { useCallback, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const IndexScreenExpo = () => {
  const scrollRef = useRef<ScrollView>(null)
  const [loaded,  setLoaded]  = useState(false)
  const [marqueeWidth, setMarqueeWidth] = useState(0)

  const sectionY = useRef<Record<string, number>>({
    work: 0, skills: 0, about: 0, contact: 0,
  }).current

  const handleNavigate = useCallback((target: string) => {
    const y = sectionY[target] ?? 0
    scrollRef.current?.scrollTo({ y, animated: true })
  }, [])

  const handleContactPress = useCallback(() => {
    scrollRef.current?.scrollTo({ y: sectionY['contact'] ?? 9999, animated: true })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />

      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <BurgerNav onNavigate={handleNavigate} darkBg={false} />

      <ScrollView
        ref={scrollRef}
        style={s.screen}
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >

        {/* HERO */}
        <View style={s.heroWrap}>
          <FadeIn delay={300}>
            <Text style={s.heroEyebrow}>DESIGNER · DOCUMENT SPECIALIST · RESEARCHER</Text>
          </FadeIn>

          <FadeIn delay={200} from="none">
            <Image
              source={require('../../../assets/tatemonos/shan-shan/images/shan5.jpg')}
              style={{ width: '100%', height: 280, marginBottom: 28 }}
              resizeMode="cover"
            />
          </FadeIn>

          <FadeIn delay={400}>
            <Text style={s.heroLogo}>SHAN.</Text>
          </FadeIn>

          <FadeIn delay={520}>
            <Text style={s.heroSubtitle}>Shan Sabal Cezar</Text>
          </FadeIn>

          <FadeIn delay={640}>
            <View style={s.heroScrollHint}>
              <View style={s.heroScrollLine} />
              <Text style={s.heroScrollText}>SCROLL</Text>
            </View>
          </FadeIn>

          <Text style={s.heroWatermark} aria-hidden="true">SHAN</Text>
        </View>

        {/* INTRO */}
        <View style={s.introWrap}>
          <FadeIn>
            <Text style={s.introPre}>[Intro]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.introTitle}>The Invisible{'\n'}Echo</Text>
          </FadeIn>
          <FadeIn delay={160}>
            <Text style={s.introAbstract}>
              Before the gesture, there is an idea. Before the design, a purpose.
              Shan gathers these invisible intentions and transforms them into work
              that speaks clearly, lingers beautifully.
            </Text>
          </FadeIn>
          <FadeIn delay={240}>
            <Text style={s.introCaption}>An invitation to build something worth remembering.</Text>
          </FadeIn>
        </View>

        {/* SKILLS MARQUEE */}
        <View
          style={s.marqueeWrap}
          onLayout={(e) => setMarqueeWidth(e.nativeEvent.layout.width)}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {[...SKILLS_MARQUEE, ...SKILLS_MARQUEE, ...SKILLS_MARQUEE].map((skill, i) => (
              <Text key={i} style={s.marqueeItem}>{skill}</Text>
            ))}
          </ScrollView>
        </View>

        {/* CHAPTERS */}
        <View
          onLayout={(e) => { sectionY['work'] = e.nativeEvent.layout.y }}
        >
          <View style={s.chapterSectionHeader}>
            <FadeIn>
              <Text style={s.chapterSectionEyebrow}>[Work]</Text>
            </FadeIn>
            <FadeIn delay={80}>
              <Text style={s.chapterSectionTitle}>What I Do.</Text>
            </FadeIn>
          </View>

          {CHAPTERS.map((chapter, index) => (
            <Chapter
              key={chapter.id}
              chapter={chapter}
              index={index}
              onWorkPress={handleContactPress}
            />
          ))}
        </View>

        {/* SKILLS */}
        <View
          style={s.skillsSection}
          onLayout={(e) => { sectionY['skills'] = e.nativeEvent.layout.y }}
        >
          <FadeIn>
            <Text style={s.sectionLabel}>[Skills]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.skillsTitle}>Tools of{'\n'}the Trade.</Text>
          </FadeIn>
          <FadeIn delay={160}>
            <Text style={s.skillsSub}>PROFICIENCY · 2026</Text>
          </FadeIn>

          <View style={{ marginTop: 8 }}>
            {SKILLS.map((skill, i) => (
              <SkillBar key={skill.name} name={skill.name} pct={skill.pct} delay={i * 80} />
            ))}
          </View>
        </View>

        {/* ABOUT */}
        <View
          style={s.aboutWrap}
          onLayout={(e) => { sectionY['about'] = e.nativeEvent.layout.y }}
        >
          <FadeIn from="none">
            <Image
              source={require('../../../assets/tatemonos/shan-shan/images/shan5.jpg')}
              style={s.aboutPhoto}
              resizeMode="cover"
            />
          </FadeIn>

          <View style={s.aboutBody}>
            <FadeIn>
              <Text style={s.sectionLabelLight}>[About Me]</Text>
            </FadeIn>
            <FadeIn delay={80}>
              <Text style={s.aboutName}>Shan{'\n'}Sabal{'\n'}Cezar</Text>
            </FadeIn>

            {PERSONAL_INFO.map((row, i) => (
              <FadeIn key={row.label} delay={i * 60}>
                <View style={s.aboutInfoRow}>
                  <Text style={s.infoLabel}>{row.label}</Text>
                  <Text style={s.infoValue}>{row.value}</Text>
                </View>
                <View style={s.dividerDark} />
              </FadeIn>
            ))}

            <View style={{ marginTop: 36, gap: 12 }}>
              <FadeIn delay={360}>
                <TouchableOpacity
                  style={s.ctaButton}
                  onPress={handleContactPress}
                  activeOpacity={0.8}
                >
                  <Text style={s.ctaButtonText}>LET'S WORK TOGETHER</Text>
                </TouchableOpacity>
              </FadeIn>
              <FadeIn delay={440}>
                <TouchableOpacity
                  style={s.outlineButtonLight}
                  onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
                  activeOpacity={0.8}
                >
                  <Text style={s.outlineButtonLightText}>FOLLOW ON FACEBOOK</Text>
                </TouchableOpacity>
              </FadeIn>
            </View>
          </View>
        </View>

        {/* CONTACT */}
        <View
          style={s.contactWrap}
          onLayout={(e) => { sectionY['contact'] = e.nativeEvent.layout.y }}
        >
          <FadeIn>
            <Text style={s.sectionLabel}>[Contact]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.contactHeadline}>
              From Five,{'\n'}Everything{'\n'}Begins.
            </Text>
          </FadeIn>

          <FadeIn delay={160}>
            <TouchableOpacity
              style={[s.ctaButton, { width: '100%' }]}
              onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
              activeOpacity={0.8}
            >
              <Text style={s.ctaButtonText}>FACEBOOK</Text>
            </TouchableOpacity>
          </FadeIn>

          <View style={{ height: 12 }} />

          <FadeIn delay={240}>
            <TouchableOpacity
              style={[s.outlineButton, { width: '100%' }]}
              onPress={() => Linking.openURL('mailto:shan@example.com')}
              activeOpacity={0.8}
            >
              <Text style={s.outlineButtonText}>EMAIL</Text>
            </TouchableOpacity>
          </FadeIn>

          <Text style={s.contactWatermark}>SHAN</Text>
        </View>

        {/* FOOTER */}
        <View style={s.footerWrap}>
          <Text style={s.footerLogo}>SHAN.</Text>
          <View style={s.dividerDark} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity
              style={s.footerSocialBtn}
              onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
              activeOpacity={0.7}
            >
              <Text style={s.footerSocialText}>FACEBOOK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.footerSocialBtn}
              onPress={() => Linking.openURL('mailto:shan@example.com')}
              activeOpacity={0.7}
            >
              <Text style={s.footerSocialText}>EMAIL</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.footerCopy}>© 2026 SHAN SABAL CEZAR · ALL RIGHTS RESERVED</Text>
        </View>

      </ScrollView>
    </View>
  )
}

export default IndexScreenExpo
/* @arkzen:native:page:index:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE PAGE: INDEX (BARE RN)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:page:index + @arkzen:import:rn */

import React, { useCallback, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const IndexScreenRN = () => {
  const scrollRef = useRef<ScrollView>(null)
  const [loaded,  setLoaded]  = useState(false)
  const [marqueeWidth, setMarqueeWidth] = useState(0)

  const sectionY = useRef<Record<string, number>>({
    work: 0, skills: 0, about: 0, contact: 0,
  }).current

  const handleNavigate = useCallback((target: string) => {
    const y = sectionY[target] ?? 0
    scrollRef.current?.scrollTo({ y, animated: true })
  }, [])

  const handleContactPress = useCallback(() => {
    scrollRef.current?.scrollTo({ y: sectionY['contact'] ?? 9999, animated: true })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />

      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <BurgerNav onNavigate={handleNavigate} darkBg={false} />

      <ScrollView
        ref={scrollRef}
        style={s.screen}
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >

        <View style={s.heroWrap}>
          <FadeIn delay={300}>
            <Text style={s.heroEyebrow}>DESIGNER · DOCUMENT SPECIALIST · RESEARCHER</Text>
          </FadeIn>

          <FadeIn delay={200} from="none">
            <Image
              source={require('../../../assets/tatemonos/shan-shan/images/shan5.jpg')}
              style={{ width: '100%', height: 280, marginBottom: 28 }}
              resizeMode="cover"
            />
          </FadeIn>

          <FadeIn delay={400}>
            <Text style={s.heroLogo}>SHAN.</Text>
          </FadeIn>

          <FadeIn delay={520}>
            <Text style={s.heroSubtitle}>Shan Sabal Cezar</Text>
          </FadeIn>

          <FadeIn delay={640}>
            <View style={s.heroScrollHint}>
              <View style={s.heroScrollLine} />
              <Text style={s.heroScrollText}>SCROLL</Text>
            </View>
          </FadeIn>

          <Text style={s.heroWatermark} aria-hidden="true">SHAN</Text>
        </View>

        <View style={s.introWrap}>
          <FadeIn>
            <Text style={s.introPre}>[Intro]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.introTitle}>The Invisible{'\n'}Echo</Text>
          </FadeIn>
          <FadeIn delay={160}>
            <Text style={s.introAbstract}>
              Before the gesture, there is an idea. Before the design, a purpose.
              Shan gathers these invisible intentions and transforms them into work
              that speaks clearly, lingers beautifully.
            </Text>
          </FadeIn>
          <FadeIn delay={240}>
            <Text style={s.introCaption}>An invitation to build something worth remembering.</Text>
          </FadeIn>
        </View>

        <View
          style={s.marqueeWrap}
          onLayout={(e) => setMarqueeWidth(e.nativeEvent.layout.width)}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {[...SKILLS_MARQUEE, ...SKILLS_MARQUEE, ...SKILLS_MARQUEE].map((skill, i) => (
              <Text key={i} style={s.marqueeItem}>{skill}</Text>
            ))}
          </ScrollView>
        </View>

        <View
          onLayout={(e) => { sectionY['work'] = e.nativeEvent.layout.y }}
        >
          <View style={s.chapterSectionHeader}>
            <FadeIn>
              <Text style={s.chapterSectionEyebrow}>[Work]</Text>
            </FadeIn>
            <FadeIn delay={80}>
              <Text style={s.chapterSectionTitle}>What I Do.</Text>
            </FadeIn>
          </View>

          {CHAPTERS.map((chapter, index) => (
            <Chapter
              key={chapter.id}
              chapter={chapter}
              index={index}
              onWorkPress={handleContactPress}
            />
          ))}
        </View>

        <View
          style={s.skillsSection}
          onLayout={(e) => { sectionY['skills'] = e.nativeEvent.layout.y }}
        >
          <FadeIn>
            <Text style={s.sectionLabel}>[Skills]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.skillsTitle}>Tools of{'\n'}the Trade.</Text>
          </FadeIn>
          <FadeIn delay={160}>
            <Text style={s.skillsSub}>PROFICIENCY · 2026</Text>
          </FadeIn>

          <View style={{ marginTop: 8 }}>
            {SKILLS.map((skill, i) => (
              <SkillBar key={skill.name} name={skill.name} pct={skill.pct} delay={i * 80} />
            ))}
          </View>
        </View>

        <View
          style={s.aboutWrap}
          onLayout={(e) => { sectionY['about'] = e.nativeEvent.layout.y }}
        >
          <FadeIn from="none">
            <Image
              source={require('../../../assets/tatemonos/shan-shan/images/shan5.jpg')}
              style={s.aboutPhoto}
              resizeMode="cover"
            />
          </FadeIn>

          <View style={s.aboutBody}>
            <FadeIn>
              <Text style={s.sectionLabelLight}>[About Me]</Text>
            </FadeIn>
            <FadeIn delay={80}>
              <Text style={s.aboutName}>Shan{'\n'}Sabal{'\n'}Cezar</Text>
            </FadeIn>

            {PERSONAL_INFO.map((row, i) => (
              <FadeIn key={row.label} delay={i * 60}>
                <View style={s.aboutInfoRow}>
                  <Text style={s.infoLabel}>{row.label}</Text>
                  <Text style={s.infoValue}>{row.value}</Text>
                </View>
                <View style={s.dividerDark} />
              </FadeIn>
            ))}

            <View style={{ marginTop: 36, gap: 12 }}>
              <FadeIn delay={360}>
                <TouchableOpacity
                  style={s.ctaButton}
                  onPress={handleContactPress}
                  activeOpacity={0.8}
                >
                  <Text style={s.ctaButtonText}>LET'S WORK TOGETHER</Text>
                </TouchableOpacity>
              </FadeIn>
              <FadeIn delay={440}>
                <TouchableOpacity
                  style={s.outlineButtonLight}
                  onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
                  activeOpacity={0.8}
                >
                  <Text style={s.outlineButtonLightText}>FOLLOW ON FACEBOOK</Text>
                </TouchableOpacity>
              </FadeIn>
            </View>
          </View>
        </View>

        <View
          style={s.contactWrap}
          onLayout={(e) => { sectionY['contact'] = e.nativeEvent.layout.y }}
        >
          <FadeIn>
            <Text style={s.sectionLabel}>[Contact]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.contactHeadline}>
              From Five,{'\n'}Everything{'\n'}Begins.
            </Text>
          </FadeIn>

          <FadeIn delay={160}>
            <TouchableOpacity
              style={[s.ctaButton, { width: '100%' }]}
              onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
              activeOpacity={0.8}
            >
              <Text style={s.ctaButtonText}>FACEBOOK</Text>
            </TouchableOpacity>
          </FadeIn>

          <View style={{ height: 12 }} />

          <FadeIn delay={240}>
            <TouchableOpacity
              style={[s.outlineButton, { width: '100%' }]}
              onPress={() => Linking.openURL('mailto:shan@example.com')}
              activeOpacity={0.8}
            >
              <Text style={s.outlineButtonText}>EMAIL</Text>
            </TouchableOpacity>
          </FadeIn>

          <Text style={s.contactWatermark}>SHAN</Text>
        </View>

        <View style={s.footerWrap}>
          <Text style={s.footerLogo}>SHAN.</Text>
          <View style={s.dividerDark} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity
              style={s.footerSocialBtn}
              onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
              activeOpacity={0.7}
            >
              <Text style={s.footerSocialText}>FACEBOOK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.footerSocialBtn}
              onPress={() => Linking.openURL('mailto:shan@example.com')}
              activeOpacity={0.7}
            >
              <Text style={s.footerSocialText}>EMAIL</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.footerCopy}>© 2026 SHAN SABAL CEZAR · ALL RIGHTS RESERVED</Text>
        </View>

      </ScrollView>
    </View>
  )
}

export default IndexScreenRN
/* @arkzen:native:page:index:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE ERROR PAGES (EXPO)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:error:404 + @arkzen:import:expo */

import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const NotFoundExpo = () => (
  <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={['top']}>
    <Text className="text-6xl mb-4 text-neutral-200 font-bold">404</Text>
    <Text className="text-xl font-bold text-neutral-900">Page Not Found</Text>
    <Text className="text-sm text-neutral-400 mt-2">The page you're looking for doesn't exist.</Text>
  </SafeAreaView>
)

export default NotFoundExpo
/* @arkzen:native:error:404:end */

/* @arkzen:native:error:500 + @arkzen:import:expo */

import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ServerErrorExpo = () => (
  <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={['top']}>
    <Text className="text-6xl mb-4 text-neutral-200 font-bold">500</Text>
    <Text className="text-xl font-bold text-neutral-900">Server Error</Text>
    <Text className="text-sm text-neutral-400 mt-2">Something went wrong on our end. Please try again later.</Text>
  </SafeAreaView>
)

export default ServerErrorExpo
/* @arkzen:native:error:500:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE ERROR PAGES (BARE RN)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:error:404 + @arkzen:import:rn */

import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const NotFoundRN = () => (
  <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={['top']}>
    <Text className="text-6xl mb-4 text-neutral-200 font-bold">404</Text>
    <Text className="text-xl font-bold text-neutral-900">Page Not Found</Text>
    <Text className="text-sm text-neutral-400 mt-2">The page you're looking for doesn't exist.</Text>
  </SafeAreaView>
)

export default NotFoundRN
/* @arkzen:native:error:404:end */

/* @arkzen:native:error:500 + @arkzen:import:rn */

import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ServerErrorRN = () => (
  <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={['top']}>
    <Text className="text-6xl mb-4 text-neutral-200 font-bold">500</Text>
    <Text className="text-xl font-bold text-neutral-900">Server Error</Text>
    <Text className="text-sm text-neutral-400 mt-2">Something went wrong on our end. Please try again later.</Text>
  </SafeAreaView>
)

export default ServerErrorRN
/* @arkzen:native:error:500:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE ERROR PAGES (LYNX)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:error:404:lynx */

import React from '@lynx-js/react'

const NotFoundLynx = () => (
  <div className="flex-1 min-h-screen bg-white text-neutral-900 flex items-center justify-center flex-col">
    <div className="text-6xl mb-4 text-neutral-200 font-bold">404</div>
    <div className="text-xl font-bold">Page Not Found</div>
    <div className="text-sm text-neutral-400 mt-2">The page you're looking for doesn't exist.</div>
  </div>
)

export default NotFoundLynx
/* @arkzen:native:error:404:lynx:end */

/* @arkzen:native:error:500:lynx */

import React from '@lynx-js/react'

const ServerErrorLynx = () => (
  <div className="flex-1 min-h-screen bg-white text-neutral-900 flex items-center justify-center flex-col">
    <div className="text-6xl mb-4 text-neutral-200 font-bold">500</div>
    <div className="text-xl font-bold">Server Error</div>
    <div className="text-sm text-neutral-400 mt-2">Something went wrong on our end. Please try again later.</div>
  </div>
)

export default ServerErrorLynx
/* @arkzen:native:error:500:lynx:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE SCRIPTS
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:script:expo */
console.log('🌸 Shan Sabal Cezar Portfolio running on Expo')
/* @arkzen:native:script:expo:end */

/* @arkzen:native:script:rn */
console.log('🌸 Shan Sabal Cezar Portfolio running on React Native Bare')
/* @arkzen:native:script:rn:end */

/* @arkzen:native:script:lynx */
console.log('🌸 Shan Sabal Cezar Portfolio running on Lynx')
/* @arkzen:native:script:lynx:end */