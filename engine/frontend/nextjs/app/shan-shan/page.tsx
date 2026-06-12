'use client'
// ============================================================
// ARKZEN GENERATED PAGE — shan-shan/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T08:48:15.784Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { shanShanAnimations, pageVariants } from '@/arkzen/generated/shan-shan.animations'
import { BurgerMenu } from './components/BurgerMenu'
import { Chapter } from './components/Chapter'
import { ChapterCover } from './components/ChapterCover'
import { ChapterHead } from './components/ChapterHead'
import { ChapterLookbook } from './components/ChapterLookbook'
import { ChapterOutro } from './components/ChapterOutro'
import { ChapterOverview } from './components/ChapterOverview'
import { ChapterStory } from './components/ChapterStory'
import { Loader } from './components/Loader'
import { MaskBottom } from './components/MaskBottom'
import { MaskTop } from './components/MaskTop'
import { ShanHeroLogo } from './components/ShanHeroLogo'

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

// Wrapper for animation + layout
const ArkzenPage_ShanShan_Index = () => {
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

export default ArkzenPage_ShanShan_Index
