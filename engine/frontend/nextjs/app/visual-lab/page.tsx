'use client'
// ============================================================
// ARKZEN GENERATED PAGE — visual-lab/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T09:47:24.828Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { visualLabAnimations, pageVariants } from '@/arkzen/generated/visual-lab.animations'
import { BabylonSection } from './components/BabylonSection'
import { CurtainsSection } from './components/CurtainsSection'
import { DemoCard } from './components/DemoCard'
import { FabricSection } from './components/FabricSection'
import { HTMLCanvasSection } from './components/HTMLCanvasSection'
import { KonvaSection } from './components/KonvaSection'
import { LottieLazySection } from './components/LottieLazySection'
import { MatterSection } from './components/MatterSection'
import { OGLSection } from './components/OGLSection'
import { P5Section } from './components/P5Section'
import { PackageBadge } from './components/PackageBadge'
import { ParticlesSection } from './components/ParticlesSection'
import { PhaserSection } from './components/PhaserSection'
import { PixiSection } from './components/PixiSection'
import { PlayCanvasSection } from './components/PlayCanvasSection'
import { Proton } from './components/Proton'
import { REGLSection } from './components/REGLSection'
import { RapierSection } from './components/RapierSection'
import { ResetBtn } from './components/ResetBtn'
import { ScriptDSLSection } from './components/ScriptDSLSection'
import { SectionHeader } from './components/SectionHeader'
import { ShadersSection } from './components/ShadersSection'
import { TWGLSection } from './components/TWGLSection'
import { TextFXSection } from './components/TextFXSection'
import { ThreeR3FSection } from './components/ThreeR3FSection'
import { UXSection } from './components/UXSection'
import { VanillaTilt } from './components/VanillaTilt'
import { NAV_SECTIONS } from './components/constants'
import { useVisualLabStore } from './components/hooks'
import { animate, canvas, curtains, label, lenis, proton, regl } from './components/utils'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const { activeSection, setActiveSection } = useVisualLabStore()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = visualLabAnimations(pageRef)
    return cleanup
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'three-r3f':    return <ThreeR3FSection />
      case 'babylonjs':    return <BabylonSection />
      case 'playcanvas':   return <PlayCanvasSection />
      case 'ogl':          return <OGLSection />
      case 'pixi':         return <PixiSection />
      case 'konva':        return <KonvaSection />
      case 'fabric':       return <FabricSection />
      case 'p5':           return <P5Section />
      case 'regl':         return <REGLSection />
      case 'twgl':         return <TWGLSection />
      case 'phaser':       return <PhaserSection />
      case 'matter':       return <MatterSection />
      case 'rapier':       return <RapierSection />
      case 'particles':    return <ParticlesSection />
      case 'proton':       return <ParticlesSection />
      case 'lottie':       return <LottieLazySection />
      case 'confetti':     return <UXSection />
      case 'typed':        return <TextFXSection />
      case 'troika':       return <TextFXSection />
      case 'splitting':    return <TextFXSection />
      case 'rough':        return <TextFXSection />
      case 'vanilla-tilt': return <UXSection />
      case 'lenis':        return <UXSection />
      case 'curtains':     return <CurtainsSection />
      case 'shaders':      return <ShadersSection />
      case 'script-dsl':   return <ScriptDSLSection />
      case 'html-canvas':  return <HTMLCanvasSection />
      default:             return <ThreeR3FSection />
    }
  }

  // Group nav items
  const groups = [...new Set(NAV_SECTIONS.map(s => s.group))]

  return (
    <div ref={pageRef} className="vl-root">
      {/* Sidebar */}
      <aside className="vl-sidebar">
        <div className="vl-logo">
          <h1>🔬 Visual Lab</h1>
          <p>All graphics packages · Script DSL · HTML-in-Canvas</p>
        </div>
        {groups.map(group => (
          <div key={group}>
            <div className="vl-nav-group">{group}</div>
            {NAV_SECTIONS.filter(s => s.group === group).map(s => (
              <div
                key={s.id}
                className={`vl-nav-item ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span style={{ fontSize: 13 }}>{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="vl-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_VisualLab_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = visualLabAnimations(pageRef)
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

export default ArkzenPage_VisualLab_Index
