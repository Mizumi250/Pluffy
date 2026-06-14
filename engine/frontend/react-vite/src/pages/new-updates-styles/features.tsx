// ============================================================
// ARKZEN GENERATED PAGE — new-updates-styles/features [React+Vite]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-13T23:41:39.329Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { FeatureCard } from './components/FeatureCard'
import { HeroSection } from './components/HeroSection'
import { Navbar } from './components/Navbar'
import { FEATURES } from './components/constants'
import { getIconComponent } from './components/utils'

// ── Page component from @arkzen:page:features ─────────────────────────────
const FeaturesPage = () => {
  const [selectedColor, setSelectedColor] = useState<'blue' | 'purple' | 'green' | 'orange'>('blue')

  return (
    <div className="min-h-screen">
      <Navbar currentPath="/new-updates-styles/features" />
      <div className="container mx-auto px-4 space-y-8 py-8">
        <h1 className="text-4xl font-bold">All Features</h1>
        
        <div className="flex gap-4 flex-wrap">
          {(['blue', 'purple', 'green', 'orange'] as const).map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedColor === color
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
              }`}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {FEATURES.filter(f => f.color === selectedColor).map(feature => (
            <FeatureCard
              key={feature.id}
              icon={getIconComponent(feature.icon)}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_NewUpdatesStyles_Features = () => {
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
        <FeaturesPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_NewUpdatesStyles_Features
