'use client'
// ============================================================
// ARKZEN GENERATED PAGE — lain098/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:09:01.212Z
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
import type { BurstItem } from './components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { lain098Animations, pageVariants } from '@/arkzen/generated/lain098.animations'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Page component code (from @arkzen:page:index)
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

// Wrapper for animation + layout
const ArkzenPage_Lain098_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
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

export default ArkzenPage_Lain098_Index
