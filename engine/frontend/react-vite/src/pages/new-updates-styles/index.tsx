// ============================================================
// ARKZEN GENERATED PAGE — new-updates-styles/index [React+Vite]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-11T02:20:07.784Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Layers, Menu, Palette, X, Zap } from 'lucide-react'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate, Link } from 'react-router'
import './styles/global.css'

// ── Shared components from @arkzen:components ─────────────────────────────────
// ─── CUSTOM COMPONENTS ───────────────────────────────

const Navbar = ({ currentPath }: { currentPath: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const links = [
    { name: 'Home', path: '/new-updates-styles' },
    { name: 'About', path: '/new-updates-styles/about' },
    { name: 'Features', path: '/new-updates-styles/features' },
  ]

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
          <span className="font-bold text-lg">Arkzen v2.0</span>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex gap-1">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${currentPath === link.path ? 'navbar-link-active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="navbar-mobile md:hidden">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`navbar-mobile-link ${currentPath === link.path ? 'navbar-mobile-link-active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  const bgColors = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }
  
  return (
    <div className={`rounded-xl border-2 p-6 ${bgColors[color]}`}>
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  )
}

interface HeroSectionProps {
  title: string
  subtitle: string
  ctaText: string
  onCta?: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, ctaText, onCta }) => {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-xl text-neutral-600">{subtitle}</p>
      <button 
        onClick={onCta}
        className="arkzen-btn mx-auto"
      >
        {ctaText}
      </button>
    </div>
  )
}

// ─── UTILITIES & TYPES ───────────────────────────────

type Feature = {
  id: number
  icon: 'zap' | 'code' | 'palette' | 'layers'
  title: string
  description: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}

const FEATURES: Feature[] = [
  {
    id: 1,
    icon: 'zap',
    title: 'Component Separation',
    description: 'Individual component files with shared utilities backend',
    color: 'blue',
  },
  {
    id: 2,
    icon: 'code',
    title: 'CSS DSL Support',
    description: 'Global CSS variables and per-component CSS Modules',
    color: 'purple',
  },
  {
    id: 3,
    icon: 'palette',
    title: 'Multiple Pages',
    description: 'Support for home, about, features, and custom routes',
    color: 'green',
  },
  {
    id: 4,
    icon: 'layers',
    title: 'Asset Management',
    description: 'Built-in favicon, image, and static file support',
    color: 'orange',
  },
]

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    zap:    <Zap size={32} />,
    code:   <Code size={32} />,
    palette: <Palette size={32} />,
    layers:  <Layers size={32} />,
  }
  return icons[iconName] || null
}

// ── Page component from @arkzen:page:index ─────────────────────────────
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_NewUpdatesStyles_Index = () => {
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

export default ArkzenPage_NewUpdatesStyles_Index
