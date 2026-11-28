'use client'
// ============================================================
// ARKZEN GENERATED PAGE — rubik-solver/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:54:06.086Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RkApp } from './components/RkApp'
import { RkCube3D } from './components/RkCube3D'
import { RkCubeNet } from './components/RkCubeNet'
import { RkFrame } from './components/RkFrame'
import { RkGuide } from './components/RkGuide'
import { RkHeroCube } from './components/RkHeroCube'
import { RkMiniFace } from './components/RkMiniFace'
import { RkMoveToken } from './components/RkMoveToken'
import { RkReviewStage } from './components/RkReviewStage'
import { RkRule } from './components/RkRule'
import { RkScanStage } from './components/RkScanStage'
import { RkSolveStage } from './components/RkSolveStage'
import { RkSwatch } from './components/RkSwatch'
import { RkTally } from './components/RkTally'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
const IndexPage = () => <RkApp />

// Wrapper for animation + layout
const ArkzenPage_RubikSolver_Index = () => {
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

export default ArkzenPage_RubikSolver_Index
