// ============================================================
// ARKZEN GENERATED ISLAND — animation-lab/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T07:14:40.620Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { animationLabAnimations, pageVariants } from '@/arkzen/generated/animation-lab.animations'
import { CSSCustomPropsSection } from '@/arkzen/generated/components/animation-lab/CSSCustomPropsSection'
import { CSSKeyframesSection } from '@/arkzen/generated/components/animation-lab/CSSKeyframesSection'
import { CSSTransformsSection } from '@/arkzen/generated/components/animation-lab/CSSTransformsSection'
import { CSSTransitionsSection } from '@/arkzen/generated/components/animation-lab/CSSTransitionsSection'
import { FramerDragSection } from '@/arkzen/generated/components/animation-lab/FramerDragSection'
import { FramerGesturesSection } from '@/arkzen/generated/components/animation-lab/FramerGesturesSection'
import { FramerKeyframesSection } from '@/arkzen/generated/components/animation-lab/FramerKeyframesSection'
import { FramerLayoutSection } from '@/arkzen/generated/components/animation-lab/FramerLayoutSection'
import { FramerScrollSection } from '@/arkzen/generated/components/animation-lab/FramerScrollSection'
import { FramerVariantsSection } from '@/arkzen/generated/components/animation-lab/FramerVariantsSection'
import { GSAPEntranceSection } from '@/arkzen/generated/components/animation-lab/GSAPEntranceSection'
import { GSAPHover3DSection } from '@/arkzen/generated/components/animation-lab/GSAPHover3DSection'
import { GSAPScrollSection } from '@/arkzen/generated/components/animation-lab/GSAPScrollSection'
import { GSAPStaggerSection } from '@/arkzen/generated/components/animation-lab/GSAPStaggerSection'
import { GSAPTimelineSection } from '@/arkzen/generated/components/animation-lab/GSAPTimelineSection'
import { NAV_SECTIONS } from '@/arkzen/generated/components/animation-lab/constants'
import { useAnimLabStore } from '@/arkzen/generated/components/animation-lab/hooks'
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

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_AnimationLab_Index = () => {
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

export default ArkzenIsland_AnimationLab_Index
