// ============================================================
// ARKZEN GENERATED PAGE — layout-test/chain-guest [React+Vite]
// Layout: +guest:shell | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-22T00:05:31.082Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import { LayerBadge } from './components/LayerBadge'

// ── Page component from @arkzen:page:chain-guest ─────────────────────────────
const ChainGuestPage = () => (
  <div className="p-8 space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Chain Guest Page</h2>
    <p className="text-sm text-neutral-500">
      Guest guard inside shell: <code>ShellLayout → GuestLayout</code>.
      Declared as <code>+guest:shell</code>.
    </p>
    <LayerBadge layers={['ShellLayout', 'GuestLayout (guard)']} />
  </div>
)

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_LayoutTest_ChainGuest = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <ShellLayout>
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <ChainGuestPage />
      </motion.div>
    </GuestLayout>
    </ShellLayout>
  )
}

export default ArkzenPage_LayoutTest_ChainGuest
