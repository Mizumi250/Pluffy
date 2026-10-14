// ============================================================
// ARKZEN GENERATED ISLAND — ethereane/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:11.892Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { EtheraneGame } from '@/arkzen/generated/components/ethereane/EtheraneGame'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  return <EtheraneGame />
}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_Ethereane_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenIsland_Ethereane_Index
