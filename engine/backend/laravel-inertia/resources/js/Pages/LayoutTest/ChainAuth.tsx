// ============================================================
// ARKZEN GENERATED PAGE — layout-test/chain-auth [React+Inertia]
// Layout: panel | Auth: true | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.561Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { router, usePage } from '@inertiajs/react'

// Props passed from Laravel via Inertia::render()
export type LayoutTestChainAuthProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:chain-auth ─────────────────────────────
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

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_LayoutTest_ChainAuth() {
  const props   = usePage<LayoutTestChainAuthProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animation initializer
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={{}}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <ChainAuthPage {...props} />
    </motion.div>
  )

  return (
    <ShellLayout>
  <PanelLayout>
  <AuthLayout requireAuth={true}>
    {content}
    </AuthLayout>
  </PanelLayout>
  </ShellLayout>
  )
}

export default ArkzenPage_LayoutTest_ChainAuth
