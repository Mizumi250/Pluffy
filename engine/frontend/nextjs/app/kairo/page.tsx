'use client'
// ============================================================
// ARKZEN GENERATED PAGE — kairo/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T11:53:42.508Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BoardView } from './components/BoardView'
import { Hd } from './components/Hd'
import { Inspector } from './components/Inspector'
import { KairoApp } from './components/KairoApp'
import { PartTile } from './components/PartTile'
import { Rail } from './components/Rail'
import { SidePanel } from './components/SidePanel'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
const IndexPage = () => <KairoApp />

// Wrapper for animation + layout
const ArkzenPage_Kairo_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_Kairo_Index
