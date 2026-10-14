// ============================================================
// ARKZEN GENERATED ISLAND — layout-test/chain-guest
// React island component. Hydrated with client:load in .astro page shell.
// Layout: +guest:shell | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:12.982Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { LayerBadge } from '@/arkzen/generated/components/layout-test/LayerBadge'

// Page component code (from @arkzen:page:chain-guest)
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

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_LayoutTest_ChainGuest = () => {
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

export default ArkzenIsland_LayoutTest_ChainGuest
