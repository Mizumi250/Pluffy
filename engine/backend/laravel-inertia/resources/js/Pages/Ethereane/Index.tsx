// ============================================================
// ARKZEN GENERATED PAGE — ethereane/index [React+Inertia]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:20.752Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EtheraneGame } from './components/EtheraneGame'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { router, usePage } from '@inertiajs/react'
import './styles/global.css'

// Props passed from Laravel via Inertia::render()
export type EthereaneIndexProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  return <EtheraneGame />
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_Ethereane_Index() {
  const props   = usePage<EthereaneIndexProps>().props
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
      <IndexPage {...props} />
    </motion.div>
  )

  return (
    <GuestLayout>
    {content}
    </GuestLayout>
  )
}

export default ArkzenPage_Ethereane_Index
