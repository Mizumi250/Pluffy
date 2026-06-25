// ============================================================
// ARKZEN GENERATED PAGE — lain/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T16:06:20.004Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { lainAnimations, pageVariants } from '@/arkzen/generated/lain.animations'
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
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = lainAnimations(pageRef)
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
      <LainNav />
      <HeroSection onPreview={openSlider} />
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
const ArkzenPage_Lain_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = lainAnimations(pageRef)
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

export default ArkzenPage_Lain_Index
