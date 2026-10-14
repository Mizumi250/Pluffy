// ============================================================
// ARKZEN GENERATED PAGE — layout-test/panel [React+Vite]
// Layout: panel | Auth: false | Guest: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T14:10:33.396Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { useNavigate } from 'react-router'

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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_LayoutTest_Panel = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animation is managed by the page or not defined
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

export default ArkzenPage_LayoutTest_Panel
