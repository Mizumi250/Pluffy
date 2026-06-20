'use client'
// ============================================================
// ARKZEN GENERATED PAGE — layout-test/guard-guest
// Layout: +guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:10.540Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { LayerBadge } from '../components/LayerBadge'

// Page component code (from @arkzen:page:guard-guest)
const GuardGuestPage = () => (
  <div className="p-8 max-w-md mx-auto space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Guard Guest Page</h2>
    <p className="text-sm text-neutral-500">
      Guest guard only — redirects to dashboard if already authenticated.
      Uses <code>+guest</code> prefix. Equivalent to old <code>layout:guest</code>.
    </p>
    <LayerBadge layers={['GuestLayout (guard)']} />
  </div>
)

// Wrapper for animation + layout
const ArkzenPage_LayoutTest_GuardGuest = () => {
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
        <GuardGuestPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_LayoutTest_GuardGuest
