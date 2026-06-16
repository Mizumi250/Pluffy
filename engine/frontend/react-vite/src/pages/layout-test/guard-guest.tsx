// ============================================================
// ARKZEN GENERATED PAGE — layout-test/guard-guest [React+Vite]
// Layout: +guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-16T14:29:27.707Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import { LayerBadge } from './components/LayerBadge'

// ── Page component from @arkzen:page:guard-guest ─────────────────────────────
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
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
