// ============================================================
// ARKZEN GENERATED ISLAND — new-updates-styles/about
// React island component. Hydrated with client:load in .astro page shell.
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T07:14:44.679Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { Navbar } from '@/arkzen/generated/components/new-updates-styles/Navbar'

// Page component code (from @arkzen:page:about)
const AboutPage = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const sections = [
    {
      title: 'Architecture',
      content: 'Pages are completely individual with their own page.tsx files. Components are separated into individual re-export files that import from a shared _components.tsx backend for utilities and types.',
    },
    {
      title: 'Styling',
      content: 'The CSS DSL supports both global CSS variables (for design tokens) and per-component CSS Modules. All styles are generated from @arkzen:style blocks in your tatemono file.',
    },
    {
      title: 'Generation',
      content: 'Everything is generated from a single core.tsx tatemono file. No hardcoding. Update your tatemono and rebuild with `node start.js` to regenerate all pages and components.',
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar currentPath="/new-updates-styles/about" />
      <div className="container mx-auto px-4 space-y-8 py-8">
        <h1 className="text-4xl font-bold">About This Showcase</h1>
        <p className="text-xl text-neutral-600">
          This tatemono demonstrates all the new features added to Arkzen v2.0
        </p>

        <div className="space-y-4">
          {sections.map(section => (
            <div
              key={section.title}
              className="rounded-lg border-2 border-neutral-200 p-6"
            >
              <button
                onClick={() => setExpandedSection(
                  expandedSection === section.title ? null : section.title
                )}
                className="flex w-full items-center justify-between text-lg font-bold hover:text-blue-600"
              >
                {section.title}
                <span>{expandedSection === section.title ? '−' : '+'}</span>
              </button>
              {expandedSection === section.title && (
                <p className="mt-4 text-neutral-700">{section.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_NewUpdatesStyles_About = () => {
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
        <AboutPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenIsland_NewUpdatesStyles_About
