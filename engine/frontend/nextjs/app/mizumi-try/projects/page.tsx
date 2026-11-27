'use client'
// ============================================================
// ARKZEN GENERATED PAGE — mizumi-try/projects
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T07:03:03.641Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:projects)
const ProjectsPage = () => {
  return (
    <div>
      <h1>Project</h1>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_MizumiTry_Projects = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
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
        <ProjectsPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_MizumiTry_Projects
