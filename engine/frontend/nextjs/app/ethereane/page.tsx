'use client'
// ============================================================
// ARKZEN GENERATED PAGE — ethereane/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T09:47:17.944Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { EtheraneGame } from './components/EtheraneGame'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  return <EtheraneGame />
}

// Wrapper for animation + layout
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
