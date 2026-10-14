// ============================================================
// ARKZEN GENERATED PAGE — lain098/index [React+Inertia]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.500Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AboutSection } from './components/AboutSection'
import { ArtCarousel } from './components/ArtCarousel'
import { CommissionsSection } from './components/CommissionsSection'
import { ContactSection } from './components/ContactSection'
import { DiscographySection } from './components/DiscographySection'
import { Footer } from './components/Footer'
import { FullscreenSlider } from './components/FullscreenSlider'
import { GalleryStrip } from './components/GalleryStrip'
import { GridSection } from './components/GridSection'
import { HeroScript } from './components/HeroScript'
import { HeroSection } from './components/HeroSection'
import { IntroStrip } from './components/IntroStrip'
import { LainNav } from './components/LainNav'
import { SignatureLogo } from './components/SignatureLogo'
import { WorkChapter } from './components/WorkChapter'
import { WorksSection } from './components/WorksSection'
import { ZenSection } from './components/ZenSection'
import { CAROUSEL_ITEMS } from './components/constants'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { lain098Animations, pageVariants } from '@/arkzen/generated/lain098.animations'
import { router, usePage } from '@inertiajs/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './styles/global.css'

// Props passed from Laravel via Inertia::render()
export type Lain098IndexProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  const [sliderOpen, setSliderOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)
  const [avatarVisible, setAvatarVisible] = useState(false)
  const [orbitVisible, setOrbitVisible] = useState(false)
  const [navVisible, setNavVisible] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = lain098Animations(
      pageRef,
      () => setAvatarVisible(true),   // avatar scale-in
      () => setOrbitVisible(true),    // orbit expand
      () => setNavVisible(true),      // nav + side text
    )
    return cleanup
  }, [])

  const openSlider = (index: number) => {
    setInitialIndex(index)
    setSliderOpen(true)
  }

  // GLOBAL THEME TRANSITION UPON REACHING THE FOOTER
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const footerEl = document.querySelector('.scrapbook-footer')
    if (!footerEl) return

    const ctx = gsap.context(() => {
      gsap.to(".lain-root", {
        backgroundColor: "#1D1812",
        color: "#f0f0f0",
        duration: 2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: footerEl,
          start: "top bottom",
          end: "top 30%",
          scrub: 1.2
        }
      })
      gsap.to(".lain-root", {
        "--muted": "rgba(255,255,255,0.45)",
        "--border": "rgba(255,255,255,0.08)",
        "--text-light": "rgba(255,255,255,0.6)",
        duration: 2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: footerEl,
          start: "top bottom",
          end: "top 30%",
          scrub: 1.2
        }
      })
    }, footerEl)
    return () => ctx.revert()
  }, [])

  return (
    <motion.div
      ref={pageRef}
      className="lain-root"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ⭐ GLOBAL FIXED BLEEDING BLUE ORB STARTS HERE ⭐ */}
      <div className="global-bg-bleed" />
      
      <LainNav visible={navVisible} />
      <HeroSection
        onPreview={openSlider}
        orbitVisible={orbitVisible}
        avatarVisible={avatarVisible}
      />
      <IntroStrip />
      <WorksSection />
      <GalleryStrip />
      <DiscographySection />
      <CommissionsSection />
      <AboutSection />
      <ContactSection />
      <ZenSection />
      <GridSection />
      <Footer />

      <AnimatePresence>
        {sliderOpen && (
          <FullscreenSlider
            items={CAROUSEL_ITEMS}
            initialIndex={initialIndex}
            onClose={() => setSliderOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_Lain098_Index() {
  const props   = usePage<Lain098IndexProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = lain098Animations(pageRef)
    return cleanup
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <IndexPage {...props} />
    </motion.div>
  )

  return (
    <GuestLayout>
    {content}
    </GuestLayout>
  )
}

export default ArkzenPage_Lain098_Index
