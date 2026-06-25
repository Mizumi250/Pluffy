// ============================================================
// ARKZEN GENERATED PAGE — coveo/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T14:31:55.708Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AboutSection, CreditsModal, DiscographySection, Footer, HeroSection } from './components/_components'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { coveoAnimations, pageVariants } from '@/arkzen/generated/coveo.animations'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { AboutSection } from './components/AboutSection'
import { Carousel } from './components/Carousel'
import { CarouselItem } from './components/CarouselItem'
import { CreditsModal } from './components/CreditsModal'
import { DiscographySection } from './components/DiscographySection'
import { Footer } from './components/Footer'
import { HeroScript } from './components/HeroScript'
import { HeroSection } from './components/HeroSection'

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = coveoAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <motion.div
      ref={pageRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <HeroSection />
      <AboutSection />
      <DiscographySection />
      <Footer />
      <CreditsModal />
    </motion.div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_Coveo_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = coveoAnimations(pageRef)
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

export default ArkzenPage_Coveo_Index
