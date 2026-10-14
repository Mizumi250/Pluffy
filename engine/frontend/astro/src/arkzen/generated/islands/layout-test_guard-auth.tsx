// ============================================================
// ARKZEN GENERATED ISLAND — layout-test/guard-auth
// React island component. Hydrated with client:load in .astro page shell.
// Layout: +auth | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:12.972Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { LayerBadge } from '@/arkzen/generated/components/layout-test/LayerBadge'

// Page component code (from @arkzen:page:guard-auth)
const GuardAuthPage = () => (
  <div className="p-8 max-w-md mx-auto space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Guard Auth Page</h2>
    <p className="text-sm text-neutral-500">
      Auth guard only — no custom layout chain. Uses <code>+auth</code> prefix.
      Equivalent to old <code>layout:auth</code> behavior.
    </p>
    <LayerBadge layers={['AuthLayout (guard)']} />
  </div>
)

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_LayoutTest_GuardAuth = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <AuthLayout requireAuth={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <GuardAuthPage />
      </motion.div>
    </AuthLayout>
  )
}

export default ArkzenIsland_LayoutTest_GuardAuth
