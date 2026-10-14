// ============================================================
// ARKZEN GENERATED PAGE — layout-test/guard-guest [React+Inertia]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.563Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { router, usePage } from '@inertiajs/react'

// Props passed from Laravel via Inertia::render()
export type LayoutTestGuardGuestProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:guard-guest ─────────────────────────────
const GuardGuestPage = () => (
  <div className="p-8 max-w-md mx-auto space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Guard Guest Page</h2>
    <p className="text-sm text-neutral-500">
      Guest guard only — redirects to dashboard if already authenticated.
      Uses <code>+guest</code> prefix. Equivalent to old <code>layout:guest</code>.
    </p>
    <LayerBadge layers={['GuestLayout (guard)']} />
  </div>
)

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_LayoutTest_GuardGuest() {
  const props   = usePage<LayoutTestGuardGuestProps>().props
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
      <GuardGuestPage {...props} />
    </motion.div>
  )

  return (
    <GuestLayout>
    {content}
    </GuestLayout>
  )
}

export default ArkzenPage_LayoutTest_GuardGuest
