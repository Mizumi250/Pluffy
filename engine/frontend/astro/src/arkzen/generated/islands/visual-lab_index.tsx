// ============================================================
// ARKZEN GENERATED ISLAND — visual-lab/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T07:14:46.910Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { visualLabAnimations, pageVariants } from '@/arkzen/generated/visual-lab.animations'
import { BabylonSection } from '@/arkzen/generated/components/visual-lab/BabylonSection'
import { CurtainsSection } from '@/arkzen/generated/components/visual-lab/CurtainsSection'
import { FabricSection } from '@/arkzen/generated/components/visual-lab/FabricSection'
import { HTMLCanvasSection } from '@/arkzen/generated/components/visual-lab/HTMLCanvasSection'
import { KonvaSection } from '@/arkzen/generated/components/visual-lab/KonvaSection'
import { LottieLazySection } from '@/arkzen/generated/components/visual-lab/LottieLazySection'
import { MatterSection } from '@/arkzen/generated/components/visual-lab/MatterSection'
import { OGLSection } from '@/arkzen/generated/components/visual-lab/OGLSection'
import { P5Section } from '@/arkzen/generated/components/visual-lab/P5Section'
import { ParticlesSection } from '@/arkzen/generated/components/visual-lab/ParticlesSection'
import { PhaserSection } from '@/arkzen/generated/components/visual-lab/PhaserSection'
import { PixiSection } from '@/arkzen/generated/components/visual-lab/PixiSection'
import { PlayCanvasSection } from '@/arkzen/generated/components/visual-lab/PlayCanvasSection'
import { REGLSection } from '@/arkzen/generated/components/visual-lab/REGLSection'
import { RapierSection } from '@/arkzen/generated/components/visual-lab/RapierSection'
import { ScriptDSLSection } from '@/arkzen/generated/components/visual-lab/ScriptDSLSection'
import { ShadersSection } from '@/arkzen/generated/components/visual-lab/ShadersSection'
import { TWGLSection } from '@/arkzen/generated/components/visual-lab/TWGLSection'
import { TextFXSection } from '@/arkzen/generated/components/visual-lab/TextFXSection'
import { ThreeR3FSection } from '@/arkzen/generated/components/visual-lab/ThreeR3FSection'
import { UXSection } from '@/arkzen/generated/components/visual-lab/UXSection'
import { NAV_SECTIONS } from '@/arkzen/generated/components/visual-lab/constants'
import { useVisualLabStore } from '@/arkzen/generated/components/visual-lab/hooks'

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

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_VisualLab_Index = () => {
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

export default ArkzenIsland_VisualLab_Index
