// ============================================================
// ARKZEN GENERATED PAGE — rubik-solver/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-11-12T09:33:10.231Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RkApp } from './components/RkApp'
import { RkCube3D } from './components/RkCube3D'
import { RkCubeNet } from './components/RkCubeNet'
import { RkGlyph } from './components/RkGlyph'
import { RkGuide } from './components/RkGuide'
import { RkMiniFace } from './components/RkMiniFace'
import { RkMoveToken } from './components/RkMoveToken'
import { RkReviewStage } from './components/RkReviewStage'
import { RkScanStage } from './components/RkScanStage'
import { RkSolveStage } from './components/RkSolveStage'
import { RkSwatch } from './components/RkSwatch'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import './styles/global.css'

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => <RkApp />

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_RubikSolver_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animation is managed by the page or not defined
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
