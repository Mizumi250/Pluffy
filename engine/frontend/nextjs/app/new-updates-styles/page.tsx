'use client'
// ============================================================
// ARKZEN GENERATED PAGE — new-updates-styles/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:59.552Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FeatureCard } from './components/FeatureCard'
import { HeroSection } from './components/HeroSection'
import { Navbar } from './components/Navbar'
import { FEATURES } from './components/constants'
import type { Feature, FeatureCardProps, HeroSectionProps } from './components/types'
import { getIconComponent } from './components/utils'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen">
      <Navbar currentPath="/new-updates-styles" />
      <div className="container mx-auto px-4 space-y-12 py-8">
        <HeroSection
          title="Arkzen v2.0 Features"
          subtitle="Component separation, CSS DSL, multiple pages, and more"
          ctaText="Explore Features"
          onCta={() => setActiveFeature(1)}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map(feature => (
            <div
              key={feature.id}
              onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
              className="cursor-pointer transition-all"
            >
              <FeatureCard
                icon={getIconComponent(feature.icon)}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
              {activeFeature === feature.id && (
                <div className="mt-2 rounded-lg bg-neutral-100 p-4 text-sm text-neutral-700">
                  Click another feature to learn more about it
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
          <h2 className="mb-4 text-3xl font-bold">What's New in v2.0?</h2>
          <ul className="space-y-2">
            <li>✓ Individual component files with shared utilities backend</li>
            <li>✓ Global CSS variables (@arkzen:style)</li>
            <li>✓ Per-component CSS Modules (@arkzen:style:ComponentName)</li>
            <li>✓ Support for multiple pages (index, about, features, etc.)</li>
            <li>✓ Automatic favicon and asset management</li>
            <li>✓ Zero hardcoding - fully generative</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_NewUpdatesStyles_Index = () => {
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
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_NewUpdatesStyles_Index
