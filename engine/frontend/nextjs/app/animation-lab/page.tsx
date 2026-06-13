'use client'
// ============================================================
// ARKZEN GENERATED PAGE — animation-lab/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T00:54:02.005Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { animationLabAnimations, pageVariants } from '@/arkzen/generated/animation-lab.animations'
import { CSSCustomPropsSection } from './components/CSSCustomPropsSection'
import { CSSKeyframesSection } from './components/CSSKeyframesSection'
import { CSSTransformsSection } from './components/CSSTransformsSection'
import { CSSTransitionsSection } from './components/CSSTransitionsSection'
import { DemoCard } from './components/DemoCard'
import { FramerDragSection } from './components/FramerDragSection'
import { FramerGesturesSection } from './components/FramerGesturesSection'
import { FramerKeyframesSection } from './components/FramerKeyframesSection'
import { FramerLayoutSection } from './components/FramerLayoutSection'
import { FramerScrollSection } from './components/FramerScrollSection'
import { FramerVariantsSection } from './components/FramerVariantsSection'
import { GSAPEntranceSection } from './components/GSAPEntranceSection'
import { GSAPHover3DSection } from './components/GSAPHover3DSection'
import { GSAPScrollSection } from './components/GSAPScrollSection'
import { GSAPStaggerSection } from './components/GSAPStaggerSection'
import { GSAPTimelineSection } from './components/GSAPTimelineSection'
import { MagneticBtn } from './components/MagneticBtn'
import { ParallaxDemo } from './components/ParallaxDemo'
import { ResetBtn } from './components/ResetBtn'
import { ScrollTransformDemo } from './components/ScrollTransformDemo'
import { SectionHeader } from './components/SectionHeader'
import { NAV_SECTIONS } from './components/constants'
import { useAnimLabStore } from './components/hooks'
import { opacity, ref, y } from './components/utils'
import { gsap } from 'gsap'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const { activeSection, setActiveSection } = useAnimLabStore()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = animationLabAnimations(pageRef)
    return cleanup
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'gsap-entrance':   return <GSAPEntranceSection />
      case 'gsap-scroll':     return <GSAPScrollSection />
      case 'gsap-timeline':   return <GSAPTimelineSection />
      case 'gsap-stagger':    return <GSAPStaggerSection />
      case 'gsap-hover-3d':   return <GSAPHover3DSection />
      case 'framer-variants': return <FramerVariantsSection />
      case 'framer-gestures': return <FramerGesturesSection />
      case 'framer-layout':   return <FramerLayoutSection />
      case 'framer-keyframes':return <FramerKeyframesSection />
      case 'framer-drag':     return <FramerDragSection />
      case 'framer-scroll':   return <FramerScrollSection />
      case 'css-keyframes':   return <CSSKeyframesSection />
      case 'css-transitions': return <CSSTransitionsSection />
      case 'css-transforms':  return <CSSTransformsSection />
      case 'css-custom-props':return <CSSCustomPropsSection />
      default:                return <GSAPEntranceSection />
    }
  }

  return (
    <div ref={pageRef} className="anim-lab-root">
      {/* Sidebar */}
      <aside className="anim-lab-sidebar">
        <div className="anim-lab-logo">
          <h1>🎬 Animation Lab</h1>
          <p>GSAP · Framer Motion · CSS</p>
        </div>
        {NAV_SECTIONS.map(s => (
          <div
            key={s.id}
            className={`nav-item ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            <span className="nav-item-icon">{s.icon}</span>
            {s.label}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="anim-lab-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_AnimationLab_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = animationLabAnimations(pageRef)
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

export default ArkzenPage_AnimationLab_Index
