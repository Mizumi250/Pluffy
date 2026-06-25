// ============================================================
// ARKZEN GENERATED PAGE — lain098/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T13:56:58.511Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { lain098Animations, pageVariants } from '@/arkzen/generated/lain098.animations'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { AboutSection } from './components/AboutSection'
import { CommissionsSection } from './components/CommissionsSection'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { GalleryStrip } from './components/GalleryStrip'
import { HeroSection } from './components/HeroSection'
import { IntroStrip } from './components/IntroStrip'
import { LainCursor } from './components/LainCursor'
import { LainLoader } from './components/LainLoader'
import { LainNav } from './components/LainNav'
import { SkillsMarquee } from './components/SkillsMarquee'
import { WorkChapter } from './components/WorkChapter'
import { WorksSection } from './components/WorksSection'
import { ref } from './components/utils'

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  const [loaded, setLoaded] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaded) return
    lain098Animations(pageRef as React.RefObject<HTMLDivElement>)
  }, [loaded])

  return (
    <>
      <AnimatePresence>
        {!loaded && <LainLoader onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <motion.div
          ref={pageRef}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <LainCursor />
          <LainNav />
          <HeroSection />
          <IntroStrip />
          <WorksSection />
          <SkillsMarquee />
          <GalleryStrip />
          <CommissionsSection />
          <AboutSection />
          <ContactSection />
          <Footer />
        </motion.div>
      )}
    </>
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
