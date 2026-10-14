// ============================================================
// ARKZEN GENERATED PAGE — layout-test/chain-guest [React+Inertia]
// Layout: shell | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.565Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { router, usePage } from '@inertiajs/react'

// Props passed from Laravel via Inertia::render()
export type LayoutTestChainGuestProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:chain-guest ─────────────────────────────
const ChainGuestPage = () => (
  <div className="p-8 space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Chain Guest Page</h2>
    <p className="text-sm text-neutral-500">
      Guest guard inside shell: <code>ShellLayout → GuestLayout</code>.
      Declared as <code>+guest:shell</code>.
    </p>
    <LayerBadge layers={['ShellLayout', 'GuestLayout (guard)']} />
  </div>
)

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_LayoutTest_ChainGuest() {
  const props   = usePage<LayoutTestChainGuestProps>().props
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
      <ChainGuestPage {...props} />
    </motion.div>
  )

  return (
    <ShellLayout>
  <GuestLayout>
    {content}
    </GuestLayout>
  </ShellLayout>
  )
}

export default ArkzenPage_LayoutTest_ChainGuest
