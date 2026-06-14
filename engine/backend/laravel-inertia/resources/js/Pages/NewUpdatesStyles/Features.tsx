// ============================================================
// ARKZEN GENERATED PAGE — new-updates-styles/features [React+Inertia]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-14T02:27:21.305Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import './styles/global.css'
import { FeatureCard } from './components/FeatureCard'
import { HeroSection } from './components/HeroSection'
import { Navbar } from './components/Navbar'
import { FEATURES } from './components/constants'
import { getIconComponent } from './components/utils'

// Props passed from Laravel via Inertia::render()
export type NewUpdatesStylesFeaturesProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

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

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_NewUpdatesStyles_Features() {
  const props   = usePage<NewUpdatesStylesFeaturesProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={{}}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <FeaturesPage {...props} />
    </motion.div>
  )

  return <GuestLayout>{content}</GuestLayout>
}

export default ArkzenPage_NewUpdatesStyles_Features
