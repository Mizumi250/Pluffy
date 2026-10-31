'use client'
// ============================================================
// ARKZEN GENERATED PAGE — express-test/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:12.968Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Express backend test</h1>
      <p className="text-neutral-600">Hit /api/express-test/* to exercise the :ts variants.</p>
    </div>
  )
}


// Wrapper for animation + layout
const ArkzenPage_ExpressTest_Index = () => {
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

export default ArkzenPage_ExpressTest_Index
