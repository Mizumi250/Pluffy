// ============================================================
// ARKZEN GENERATED PAGE — layout-test/deep [React+Vite]
// Layout: modal | Auth: false | Guest: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T14:10:33.399Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { ModalLayout } from '@/arkzen/core/layouts/custom/layout-test-modal'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { useNavigate } from 'react-router'

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
    // Animation is managed by the page or not defined
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
