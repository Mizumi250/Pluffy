// ============================================================
// ARKZEN GENERATED ISLAND — layout-test/deep
// React island component. Hydrated with client:load in .astro page shell.
// Layout: modal | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:12.969Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ModalLayout } from '@/arkzen/core/layouts/custom/layout-test-modal'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { LayerBadge } from '@/arkzen/generated/components/layout-test/LayerBadge'

// Page component code (from @arkzen:page:deep)
const DeepPage = () => (
  <div className="space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Deep Page</h2>
    <p className="text-sm text-neutral-500">
      Three layouts deep: <code>ShellLayout → PanelLayout → ModalLayout</code>.
      Only <code>layout:modal</code> was declared — the full chain resolved via <code>parent</code> links.
    </p>
    <LayerBadge layers={['ShellLayout', 'PanelLayout', 'ModalLayout']} />
  </div>
)

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_LayoutTest_Deep = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <ShellLayout>
    <PanelLayout>
    <ModalLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <DeepPage />
      </motion.div>
    </ModalLayout>
    </PanelLayout>
    </ShellLayout>
  )
}

export default ArkzenIsland_LayoutTest_Deep
