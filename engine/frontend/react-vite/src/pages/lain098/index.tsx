// ============================================================
// ARKZEN GENERATED PAGE — lain098/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T16:32:32.769Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { lain098Animations, pageVariants } from '@/arkzen/generated/lain098.animations'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { AboutSection } from './components/AboutSection'
import { ArtCarousel } from './components/ArtCarousel'
import { CommissionsSection } from './components/CommissionsSection'
import { ContactSection } from './components/ContactSection'
import { DiscographySection } from './components/DiscographySection'
import { Footer } from './components/Footer'
import { FullscreenSlider } from './components/FullscreenSlider'
import { GalleryStrip } from './components/GalleryStrip'
import { HeroScript } from './components/HeroScript'
import { HeroSection } from './components/HeroSection'
import { IntroStrip } from './components/IntroStrip'
import { LainNav } from './components/LainNav'
import { SignatureLogo } from './components/SignatureLogo'
import { WorkChapter } from './components/WorkChapter'
import { WorksSection } from './components/WorksSection'
import { CAROUSEL_ITEMS } from './components/constants'
import { ref } from './components/utils'

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

  return (
    <motion.div
      ref={pageRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_Lain098_Index = () => {
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

export default ArkzenPage_Lain098_Index
