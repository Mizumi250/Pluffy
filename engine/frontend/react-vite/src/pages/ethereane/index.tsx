// ============================================================
// ARKZEN GENERATED PAGE — ethereane/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T14:10:32.397Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EtheraneGame } from './components/EtheraneGame'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import './styles/global.css'

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  return <EtheraneGame />
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_Ethereane_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animation is managed by the page or not defined
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

export default ArkzenPage_Ethereane_Index
