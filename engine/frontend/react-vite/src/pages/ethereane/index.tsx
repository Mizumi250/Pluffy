// ============================================================
// ARKZEN GENERATED PAGE — ethereane/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-22T00:05:29.100Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { EtheraneGame } from './components/EtheraneGame'

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  return <EtheraneGame />
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_Ethereane_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
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

export default ArkzenPage_Ethereane_Index
