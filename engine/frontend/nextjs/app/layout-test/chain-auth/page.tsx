'use client'
// ============================================================
// ARKZEN GENERATED PAGE — layout-test/chain-auth
// Layout: +auth:panel | Auth guard: true | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:21.829Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from '../components/LayerBadge'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'

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

// Wrapper for animation + layout
const ArkzenPage_LayoutTest_ChainAuth = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
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

export default ArkzenPage_LayoutTest_ChainAuth
