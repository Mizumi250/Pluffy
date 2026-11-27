'use client'
// ============================================================
// ARKZEN GENERATED PAGE — mizumi-try/about
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T07:03:03.638Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:about)
const AboutPage = () => {
  return (
    <div>
      <h1>About</h1>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_MizumiTry_About = () => {
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
        <AboutPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_MizumiTry_About
