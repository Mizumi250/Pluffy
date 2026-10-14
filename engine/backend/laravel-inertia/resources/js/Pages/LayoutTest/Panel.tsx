// ============================================================
// ARKZEN GENERATED PAGE — layout-test/panel [React+Inertia]
// Layout: panel | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.551Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { router, usePage } from '@inertiajs/react'

// Props passed from Laravel via Inertia::render()
export type LayoutTestPanelProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:panel ─────────────────────────────
const PanelPage = () => (
  <div className="p-6 space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Panel Page</h2>
    <p className="text-sm text-neutral-500">
      Rendered inside <code>ShellLayout → PanelLayout</code>.
      PanelLayout declared <code>parent: shell</code> — the router resolved the chain automatically.
    </p>
    <LayerBadge layers={['ShellLayout', 'PanelLayout']} />
  </div>
)

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_LayoutTest_Panel() {
  const props   = usePage<LayoutTestPanelProps>().props
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
      <PanelPage {...props} />
    </motion.div>
  )

  return (
    <ShellLayout>
  <PanelLayout>
    {content}
    </PanelLayout>
  </ShellLayout>
  )
}

export default ArkzenPage_LayoutTest_Panel
