// ============================================================
// ARKZEN GENERATED PAGE — layout-test/guard-auth [React+Inertia]
// Layout: auth | Auth: true | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.558Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { AuthLayout } from '@/arkzen/core/layouts/AuthLayout'
import { router, usePage } from '@inertiajs/react'

// Props passed from Laravel via Inertia::render()
export type LayoutTestGuardAuthProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:guard-auth ─────────────────────────────
const GuardAuthPage = () => (
  <div className="p-8 max-w-md mx-auto space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Guard Auth Page</h2>
    <p className="text-sm text-neutral-500">
      Auth guard only — no custom layout chain. Uses <code>+auth</code> prefix.
      Equivalent to old <code>layout:auth</code> behavior.
    </p>
    <LayerBadge layers={['AuthLayout (guard)']} />
  </div>
)

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_LayoutTest_GuardAuth() {
  const props   = usePage<LayoutTestGuardAuthProps>().props
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
      <GuardAuthPage {...props} />
    </motion.div>
  )

  return (
    <AuthLayout requireAuth={true}>
    {content}
    </AuthLayout>
  )
}

export default ArkzenPage_LayoutTest_GuardAuth
