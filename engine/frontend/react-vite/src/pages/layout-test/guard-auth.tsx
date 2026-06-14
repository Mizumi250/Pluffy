// ============================================================
// ARKZEN GENERATED PAGE — layout-test/guard-auth [React+Vite]
// Layout: +auth | Auth: true | Guest: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-14T06:15:38.826Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'
import { useNavigate } from 'react-router'
import { LayerBadge } from './components/LayerBadge'

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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_LayoutTest_GuardAuth = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <AuthLayout requireAuth={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <GuardAuthPage />
      </motion.div>
    </AuthLayout>
  )
}

export default ArkzenPage_LayoutTest_GuardAuth
