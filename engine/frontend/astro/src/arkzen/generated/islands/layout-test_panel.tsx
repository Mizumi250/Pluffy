// ============================================================
// ARKZEN GENERATED ISLAND — layout-test/panel
// React island component. Hydrated with client:load in .astro page shell.
// Layout: panel | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:12.966Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { LayerBadge } from '@/arkzen/generated/components/layout-test/LayerBadge'

// Page component code (from @arkzen:page:panel)
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

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_LayoutTest_Panel = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <ShellLayout>
    <PanelLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <PanelPage />
      </motion.div>
    </PanelLayout>
    </ShellLayout>
  )
}

export default ArkzenIsland_LayoutTest_Panel
