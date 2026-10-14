// ============================================================
// ARKZEN GENERATED ISLAND — layout-test/chain-auth
// React island component. Hydrated with client:load in .astro page shell.
// Layout: +auth:panel | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:12.976Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { LayerBadge } from '@/arkzen/generated/components/layout-test/LayerBadge'

// Page component code (from @arkzen:page:chain-auth)
const ChainAuthPage = () => (
  <div className="p-6 space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Chain Auth Page</h2>
    <p className="text-sm text-neutral-500">
      Auth guard wrapping a full chain: <code>ShellLayout → PanelLayout → AuthLayout</code>.
      Declared as <code>+auth:panel</code> — guard attaches innermost, chain resolves outward.
    </p>
    <LayerBadge layers={['ShellLayout', 'PanelLayout', 'AuthLayout (guard)']} />
  </div>
)

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_LayoutTest_ChainAuth = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <ShellLayout>
    <PanelLayout>
    <AuthLayout requireAuth={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <ChainAuthPage />
      </motion.div>
    </AuthLayout>
    </PanelLayout>
    </ShellLayout>
  )
}

export default ArkzenIsland_LayoutTest_ChainAuth
