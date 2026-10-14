// ============================================================
// ARKZEN GENERATED ISLAND — lain098/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:12.889Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { AboutSection } from '@/arkzen/generated/components/lain098/AboutSection'
import { CommissionsSection } from '@/arkzen/generated/components/lain098/CommissionsSection'
import { ContactSection } from '@/arkzen/generated/components/lain098/ContactSection'
import { DiscographySection } from '@/arkzen/generated/components/lain098/DiscographySection'
import { Footer } from '@/arkzen/generated/components/lain098/Footer'
import { FullscreenSlider } from '@/arkzen/generated/components/lain098/FullscreenSlider'
import { GalleryStrip } from '@/arkzen/generated/components/lain098/GalleryStrip'
import { GridSection } from '@/arkzen/generated/components/lain098/GridSection'
import { HeroSection } from '@/arkzen/generated/components/lain098/HeroSection'
import { IntroStrip } from '@/arkzen/generated/components/lain098/IntroStrip'
import { LainNav } from '@/arkzen/generated/components/lain098/LainNav'
import { WorksSection } from '@/arkzen/generated/components/lain098/WorksSection'
import { ZenSection } from '@/arkzen/generated/components/lain098/ZenSection'
import { CAROUSEL_ITEMS } from '@/arkzen/generated/components/lain098/constants'
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

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_Lain098_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = lain098Animations(pageRef)
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

export default ArkzenIsland_Lain098_Index
