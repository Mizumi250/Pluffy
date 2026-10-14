// ============================================================
// ARKZEN GENERATED PAGE — layout-test/deep [React+Inertia]
// Layout: modal | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.554Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { ModalLayout } from '@/arkzen/core/layouts/custom/layout-test-modal'
import { PanelLayout } from '@/arkzen/core/layouts/custom/layout-test-panel'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { router, usePage } from '@inertiajs/react'

// Props passed from Laravel via Inertia::render()
export type LayoutTestDeepProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

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

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_LayoutTest_Deep() {
  const props   = usePage<LayoutTestDeepProps>().props
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
      <DeepPage {...props} />
    </motion.div>
  )

  return (
    <ShellLayout>
  <PanelLayout>
  <ModalLayout>
    {content}
    </ModalLayout>
  </PanelLayout>
  </ShellLayout>
  )
}

export default ArkzenPage_LayoutTest_Deep
