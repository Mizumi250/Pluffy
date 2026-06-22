// ============================================================
// ARKZEN GENERATED PAGE — layout-test/deep [React+Vite]
// Layout: modal | Auth: false | Guest: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-22T12:11:37.965Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ModalLayout } from '@/arkzen/core/layouts/custom/layout-test-modal'
import { useNavigate } from 'react-router'
import { LayerBadge } from './components/LayerBadge'

// ── Page component from @arkzen:page:deep ─────────────────────────────
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_LayoutTest_Deep = () => {
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

export default ArkzenPage_LayoutTest_Deep
