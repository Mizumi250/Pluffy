/* @arkzen:meta
name: new-updates-styles
version: 2.0.0
description: Showcase tatemono demonstrating component separation, CSS/Style DSL, multiple pages, and custom components
auth: false
*/

/* @arkzen:meta:web
favicon: https://cdn-icons-png.flaticon.com/512/1995/1995467.png
*/

/* @arkzen:meta:native
label: New Updates & Styles
description: Arkzen v2.0 showcase — features, about, and style demo screens
expo:
  bundle_id: com.arkzen.newupdatesstyles
  scheme: newupdatesstyles
  version: 2.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: 2xl
  backdrop: blur
layout:
  guest:
    className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
  auth:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:native:config
theme:
  primary: "#2563eb"
  secondary: "#7c3aed"
  accent: "#059669"
  background: "#f8fafc"
  surface: "#ffffff"
  text: "#0f172a"
  muted: "#6b7280"
*/

// ─────────────────────────────────────────────────────────────────────────────
// WEB SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:components:shared */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Zap, Code, Palette, Layers, Menu, X } from 'lucide-react'

const Navbar = ({ currentPath }: { currentPath: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { name: 'Home',     path: '/new-updates-styles' },
    { name: 'About',    path: '/new-updates-styles/about' },
    { name: 'Features', path: '/new-updates-styles/features' },
  ]

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
          <span className="font-bold text-lg">Arkzen v2.0</span>
        </div>

        <div className="hidden md:flex gap-1">
          {links.map(link => (
            <Link
              key={link.path}
              href={link.path}
              className={`navbar-link ${currentPath === link.path ? 'navbar-link-active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="navbar-mobile md:hidden">
          {links.map(link => (
            <Link
              key={link.path}
              href={link.path}
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

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, ctaText, onCta }) => (
  <div className="space-y-4 py-16 text-center">
    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {title}
    </h1>
    <p className="text-xl text-neutral-600">{subtitle}</p>
    <button onClick={onCta} className="arkzen-btn mx-auto">
      {ctaText}
    </button>
  </div>
)

type Feature = {
  id: number
  icon: 'zap' | 'code' | 'palette' | 'layers'
  title: string
  description: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}

const FEATURES: Feature[] = [
  { id: 1, icon: 'zap',     title: 'Component Separation', description: 'Individual component files with shared utilities backend',          color: 'blue'   },
  { id: 2, icon: 'code',    title: 'CSS DSL Support',       description: 'Global CSS variables and per-component CSS Modules',               color: 'purple' },
  { id: 3, icon: 'palette', title: 'Multiple Pages',        description: 'Support for home, about, features, and custom routes',             color: 'green'  },
  { id: 4, icon: 'layers',  title: 'Asset Management',      description: 'Built-in favicon, image, and static file support',                 color: 'orange' },
]

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    zap:     <Zap size={32} />,
    code:    <Code size={32} />,
    palette: <Palette size={32} />,
    layers:  <Layers size={32} />,
  }
  return icons[iconName] || null
}

/* @arkzen:web:components:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB GLOBAL STYLE
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:style */
:root {
  --color-primary: #2563eb;
  --color-secondary: #7c3aed;
  --color-accent: #059669;
  --spacing-unit: 0.25rem;
  --radius-default: 0.75rem;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.navbar-link {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-block;
}

.navbar-link:hover        { color: #111827; background: #f3f4f6; }
.navbar-link-active       { color: var(--color-primary); background: #dbeafe; }

.navbar-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.navbar-mobile-link {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.2s;
  display: block;
}

.navbar-mobile-link:hover       { color: #111827; background: #f3f4f6; }
.navbar-mobile-link-active      { color: var(--color-primary); background: #dbeafe; }

.arkzen-btn {
  padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 6);
  border-radius: var(--radius-default);
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.arkzen-btn:hover  { background: var(--color-secondary); box-shadow: var(--shadow-lg); transform: translateY(-2px); }
.arkzen-btn:active { transform: translateY(0); }

.arkzen-input {
  padding: calc(var(--spacing-unit) * 2.5) calc(var(--spacing-unit) * 3);
  border: 2px solid #e5e7eb;
  border-radius: var(--radius-default);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.arkzen-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
/* @arkzen:web:style:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB NAMED STYLES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:style:FeatureCard */
.feature-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.feature-card:hover::before { left: 100%; }
.feature-card:hover          { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
/* @arkzen:web:style:FeatureCard:end */

/* @arkzen:web:style:HeroSection */
.hero-gradient {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.8; }
}

.hero-cta { position: relative; overflow: hidden; }

.hero-cta::after {
  content: '';
  position: absolute;
  top: 0; right: -100%;
  width: 100%; height: 100%;
  background: rgba(255,255,255,0.3);
  transition: right 0.6s;
}

.hero-cta:hover::after { right: 100%; }
/* @arkzen:web:style:HeroSection:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB PAGES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
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
/* @arkzen:web:page:index:end */

/* @arkzen:web:page:about */
/* @arkzen:web:page:layout:guest */
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
            <div key={section.title} className="rounded-lg border-2 border-neutral-200 p-6">
              <button
                onClick={() => setExpandedSection(expandedSection === section.title ? null : section.title)}
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
/* @arkzen:web:page:about:end */

/* @arkzen:web:page:features */
/* @arkzen:web:page:layout:guest */
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
/* @arkzen:web:page:features:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE SHARED COMPONENTS  (Expo + RN bare)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Zap, Code, Palette, Layers } from 'lucide-react-native'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Zap, Code, Palette, Layers } from 'lucide-react-native'
/* @arkzen:import:rn:end */

// ── Badge ─────────────────────────────────────────────────────
export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-blue-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-blue-600 tracking-wide">{label}</Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
export const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.82}
    className={`rounded-2xl py-4 px-6 items-center ${disabled ? 'bg-blue-200' : 'bg-blue-600'}`}
  >
    <Text className="text-white font-semibold text-base tracking-wide">{label}</Text>
  </TouchableOpacity>
)

// ── Ghost button ──────────────────────────────────────────────
export const GhostButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} className="rounded-2xl py-4 px-6 items-center border border-neutral-200">
    <Text className="text-neutral-600 font-medium text-base">{label}</Text>
  </Pressable>
)

// ── Feature card ──────────────────────────────────────────────
type NativeColor = 'blue' | 'purple' | 'green' | 'orange'

const COLOR_MAP: Record<NativeColor, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
}

export const FeatureCard = ({
  icon, title, description, color, onPress, expanded = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: NativeColor
  onPress?: () => void
  expanded?: boolean
}) => {
  const c = COLOR_MAP[color]
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`rounded-2xl border-2 p-5 mb-3 ${c.bg} ${c.border}`}
    >
      <View className="mb-2">{icon}</View>
      <Text className={`font-bold text-base mb-1 ${c.text}`}>{title}</Text>
      <Text className={`text-sm leading-5 opacity-80 ${c.text}`}>{description}</Text>
      {expanded && (
        <View className="mt-3 bg-white/60 rounded-xl p-3">
          <Text className="text-xs text-neutral-500">Tap another card to explore more features.</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// ── Data & helpers ─────────────────────────────────────────────
type NativeFeature = {
  id: number
  icon: 'zap' | 'code' | 'palette' | 'layers'
  title: string
  description: string
  color: NativeColor
}

export const FEATURES: NativeFeature[] = [
  { id: 1, icon: 'zap',     title: 'Component Separation', description: 'Individual component files with shared utilities backend',   color: 'blue'   },
  { id: 2, icon: 'code',    title: 'CSS DSL Support',       description: 'Global CSS variables and per-component CSS Modules',        color: 'purple' },
  { id: 3, icon: 'palette', title: 'Multiple Pages',        description: 'Support for home, about, features, and custom routes',      color: 'green'  },
  { id: 4, icon: 'layers',  title: 'Asset Management',      description: 'Built-in favicon, image, and static file support',          color: 'orange' },
]

export const getIcon = (name: string, color: string) => {
  const props = { size: 24, color }
  switch (name) {
    case 'zap':     return <Zap {...props} />
    case 'code':    return <Code {...props} />
    case 'palette': return <Palette {...props} />
    case 'layers':  return <Layers {...props} />
    default:        return null
  }
}

const ICON_COLORS: Record<NativeColor, string> = {
  blue:   '#2563eb',
  purple: '#7c3aed',
  green:  '#059669',
  orange: '#ea580c',
}

/* @arkzen:native:components:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE PAGES  (Expo + RN bare)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:page:index */
/* @arkzen:import:expo */
import React, { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
/* @arkzen:import:rn:end */

const IndexScreen = () => {
  /* @arkzen:import:expo */
  const router = useRouter()
  /* @arkzen:import:expo:end */
  /* @arkzen:import:rn */
  const navigation = useNavigation<any>()
  /* @arkzen:import:rn:end */

  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="px-6 pt-14 pb-12">

      <View className="mb-8">
        <Badge label="Arkzen v2.0" />
        <Text className="text-4xl font-bold text-neutral-900 mt-4 leading-tight">
          What's New{'\n'}in v2.0 ✦
        </Text>
        <Text className="text-base text-neutral-500 mt-3 leading-6">
          Component separation, CSS DSL, multiple pages, and more — all running natively.
        </Text>
      </View>

      <View className="mb-6">
        {FEATURES.map(f => (
          <FeatureCard
            key={f.id}
            icon={getIcon(f.icon, ICON_COLORS[f.color])}
            title={f.title}
            description={f.description}
            color={f.color}
            expanded={activeFeature === f.id}
            onPress={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
          />
        ))}
      </View>

      <View className="rounded-2xl bg-blue-600 p-6 mb-6">
        <Text className="text-white font-bold text-xl mb-3">What's new?</Text>
        {[
          '✓ Individual component files',
          '✓ Global CSS variables',
          '✓ Per-component CSS Modules',
          '✓ Multi-page support',
          '✓ Asset management',
          '✓ Zero hardcoding',
        ].map(item => (
          <Text key={item} className="text-blue-100 text-sm leading-7">{item}</Text>
        ))}
      </View>

      <View className="gap-y-3">
        <PrimaryButton
          label="Browse Features →"
          onPress={() => {
            /* @arkzen:import:expo */
            router.push('/new-updates-styles/features' as any)
            /* @arkzen:import:expo:end */
            /* @arkzen:import:rn */
            navigation.navigate('new-updates-styles/features' as never)
            /* @arkzen:import:rn:end */
          }}
        />
        <GhostButton
          label="About this tatemono"
          onPress={() => {
            /* @arkzen:import:expo */
            router.push('/new-updates-styles/about' as any)
            /* @arkzen:import:expo:end */
            /* @arkzen:import:rn */
            navigation.navigate('new-updates-styles/about' as never)
            /* @arkzen:import:rn:end */
          }}
        />
      </View>

    </ScrollView>
  )
}

/* @arkzen:native:page:index:end */


/* @arkzen:native:page:about */
/* @arkzen:import:expo */
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
/* @arkzen:import:rn:end */

const AboutScreen = () => {
  /* @arkzen:import:expo */
  const router = useRouter()
  /* @arkzen:import:expo:end */
  /* @arkzen:import:rn */
  const navigation = useNavigation<any>()
  /* @arkzen:import:rn:end */

  const [expanded, setExpanded] = useState<string | null>(null)

  const sections = [
    {
      title: 'Architecture',
      content: 'Pages are completely individual with their own screen files. Components are separated into individual re-export files that import from a shared _components backend for utilities and types.',
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
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="px-6 pt-14 pb-12">

      <GhostButton
        label="← Back"
        onPress={() => {
          /* @arkzen:import:expo */
          router.back()
          /* @arkzen:import:expo:end */
          /* @arkzen:import:rn */
          navigation.goBack()
          /* @arkzen:import:rn:end */
        }}
      />

      <View className="mt-8 mb-8">
        <Badge label="about" />
        <Text className="text-3xl font-bold text-neutral-900 mt-4">About this showcase</Text>
        <Text className="text-sm text-neutral-500 mt-2 leading-6">
          This tatemono demonstrates all new features added to Arkzen v2.0.
        </Text>
      </View>

      <View className="gap-y-3 mb-8">
        {sections.map(s => (
          <TouchableOpacity
            key={s.title}
            onPress={() => setExpanded(expanded === s.title ? null : s.title)}
            activeOpacity={0.85}
            className="bg-white rounded-2xl border border-neutral-200 p-5"
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-neutral-900 text-base">{s.title}</Text>
              <Text className="text-neutral-400 text-lg">{expanded === s.title ? '−' : '+'}</Text>
            </View>
            {expanded === s.title && (
              <Text className="mt-3 text-sm text-neutral-600 leading-6">{s.content}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-neutral-100 rounded-2xl px-5 py-4">
        <Text className="text-xs font-mono text-neutral-500 leading-6">
          {/* @arkzen:import:expo */}
          stack: expo{'\n'}
          {/* @arkzen:import:expo:end */}
          {/* @arkzen:import:rn */}
          stack: react-native-bare{'\n'}
          {/* @arkzen:import:rn:end */}
          engine: arkzen v10.1{'\n'}
          tatemono: new-updates-styles{'\n'}
          screens: index, about, features
        </Text>
      </View>

    </ScrollView>
  )
}

/* @arkzen:native:page:about:end */


/* @arkzen:native:page:features */
/* @arkzen:import:expo */
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
/* @arkzen:import:rn:end */

const FeaturesScreen = () => {
  /* @arkzen:import:expo */
  const router = useRouter()
  /* @arkzen:import:expo:end */
  /* @arkzen:import:rn */
  const navigation = useNavigation<any>()
  /* @arkzen:import:rn:end */

  const [selectedColor, setSelectedColor] = useState<NativeColor>('blue')
  const colors: NativeColor[] = ['blue', 'purple', 'green', 'orange']
  const filtered = FEATURES.filter(f => f.color === selectedColor)

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="px-6 pt-14 pb-12">

      <GhostButton
        label="← Back"
        onPress={() => {
          /* @arkzen:import:expo */
          router.back()
          /* @arkzen:import:expo:end */
          /* @arkzen:import:rn */
          navigation.goBack()
          /* @arkzen:import:rn:end */
        }}
      />

      <View className="mt-8 mb-6">
        <Badge label="features" />
        <Text className="text-3xl font-bold text-neutral-900 mt-4">All Features</Text>
      </View>

      <View className="flex-row flex-wrap gap-2 mb-6">
        {colors.map(color => (
          <TouchableOpacity
            key={color}
            onPress={() => setSelectedColor(color)}
            activeOpacity={0.8}
            className={`px-4 py-2 rounded-xl ${selectedColor === color ? 'bg-neutral-900' : 'bg-neutral-200'}`}
          >
            <Text className={`font-semibold text-sm ${selectedColor === color ? 'text-white' : 'text-neutral-700'}`}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.map(f => (
        <FeatureCard
          key={f.id}
          icon={getIcon(f.icon, ICON_COLORS[f.color])}
          title={f.title}
          description={f.description}
          color={f.color}
        />
      ))}

      {filtered.length === 0 && (
        <View className="items-center py-12">
          <Text className="text-neutral-400 text-sm">No features for this filter.</Text>
        </View>
      )}

    </ScrollView>
  )
}

/* @arkzen:native:page:features:end */

// ─────────────────────────────────────────────────────────────────────────────
// LYNX SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:lynx:shared */

import React, { useState } from '@lynx-js/react'
import { Zap, Code, Palette, Layers } from 'lucide-react'

export const LynxBadge = ({ label }: { label: string }) => (
  <div className="px-3 py-1 bg-blue-100 rounded-full self-start inline-block">
    <span className="text-xs font-semibold text-blue-600 tracking-wide">{label}</span>
  </div>
)

export const LynxPrimaryButton = ({
  label, onPress, disabled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) => (
  <button
    onClick={onPress}
    disabled={disabled}
    className={`rounded-2xl py-4 px-6 text-white font-semibold text-base tracking-wide border-none cursor-pointer w-full ${
      disabled ? 'bg-blue-200' : 'bg-blue-600'
    }`}
  >
    {label}
  </button>
)

export const LynxGhostButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <button
    onClick={onPress}
    className="rounded-2xl py-4 px-6 text-neutral-600 font-medium text-base border border-neutral-200 bg-transparent cursor-pointer w-full"
  >
    {label}
  </button>
)

type LynxColor = 'blue' | 'purple' | 'green' | 'orange'

const LYNX_COLOR_MAP: Record<LynxColor, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
}

export const LynxFeatureCard = ({
  icon, title, description, color, onClick, expanded = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: LynxColor
  onClick?: () => void
  expanded?: boolean
}) => {
  const c = LYNX_COLOR_MAP[color]
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border-2 p-5 mb-3 cursor-pointer ${c.bg} ${c.border}`}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <div className={`font-bold text-base mb-1 ${c.text}`}>{title}</div>
      <div className={`text-sm leading-5 opacity-80 ${c.text}`}>{description}</div>
      {expanded && (
        <div className="mt-3 bg-white/60 rounded-xl p-3">
          <span className="text-xs text-neutral-500">Tap another card to explore more features.</span>
        </div>
      )}
    </div>
  )
}

type LynxFeature = {
  id: number
  icon: 'zap' | 'code' | 'palette' | 'layers'
  title: string
  description: string
  color: LynxColor
}

export const LYNX_FEATURES: LynxFeature[] = [
  { id: 1, icon: 'zap',     title: 'Component Separation', description: 'Individual component files with shared utilities backend',   color: 'blue'   },
  { id: 2, icon: 'code',    title: 'CSS DSL Support',       description: 'Global CSS variables and per-component CSS Modules',        color: 'purple' },
  { id: 3, icon: 'palette', title: 'Multiple Pages',        description: 'Support for home, about, features, and custom routes',      color: 'green'  },
  { id: 4, icon: 'layers',  title: 'Asset Management',      description: 'Built-in favicon, image, and static file support',          color: 'orange' },
]

export const getLynxIcon = (name: string) => {
  switch (name) {
    case 'zap':     return <Zap size={24} />
    case 'code':    return <Code size={24} />
    case 'palette': return <Palette size={24} />
    case 'layers':  return <Layers size={24} />
    default:        return null
  }
}

/* @arkzen:native:components:lynx:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// LYNX PAGES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:page:lynx:index */

import React, { useState } from '@lynx-js/react'

const IndexLynxPage = () => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-6 pt-14 pb-12 flex flex-col">

      <div className="mb-8">
        <LynxBadge label="Arkzen v2.0" />
        <h1 className="text-4xl font-bold text-neutral-900 mt-4 leading-tight">
          What's New<br />in v2.0 ✦
        </h1>
        <p className="text-base text-neutral-500 mt-3 leading-6">
          Component separation, CSS DSL, multiple pages, and more — all running natively on Lynx.
        </p>
      </div>

      <div className="mb-6">
        {LYNX_FEATURES.map(f => (
          <LynxFeatureCard
            key={f.id}
            icon={getLynxIcon(f.icon)}
            title={f.title}
            description={f.description}
            color={f.color}
            expanded={activeFeature === f.id}
            onClick={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
          />
        ))}
      </div>

      <div className="rounded-2xl bg-blue-600 p-6 mb-6">
        <div className="text-white font-bold text-xl mb-3">What's new?</div>
        {[
          '✓ Individual component files',
          '✓ Global CSS variables',
          '✓ Per-component CSS Modules',
          '✓ Multi-page support',
          '✓ Asset management',
          '✓ Zero hardcoding',
        ].map(item => (
          <div key={item} className="text-blue-100 text-sm leading-7">{item}</div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <LynxPrimaryButton
          label="Browse Features →"
          onPress={() => { window.location.href = '/new-updates-styles/features' }}
        />
        <LynxGhostButton
          label="About this tatemono"
          onPress={() => { window.location.href = '/new-updates-styles/about' }}
        />
      </div>

    </div>
  )
}

/* @arkzen:native:page:lynx:index:end */


/* @arkzen:native:page:lynx:about */

import React, { useState } from '@lynx-js/react'

const AboutLynxPage = () => {
  const [expanded, setExpanded] = useState<string | null>(null)

  const sections = [
    {
      title: 'Architecture',
      content: 'Pages are completely individual with their own screen files. Components are separated into individual re-export files that import from a shared _components backend for utilities and types.',
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
    <div className="flex-1 overflow-y-auto bg-slate-50 px-6 pt-14 pb-12 flex flex-col">

      <LynxGhostButton label="← Back" onPress={() => window.history.back()} />

      <div className="mt-8 mb-8">
        <LynxBadge label="about" />
        <h1 className="text-3xl font-bold text-neutral-900 mt-4">About this showcase</h1>
        <p className="text-sm text-neutral-500 mt-2 leading-6">
          This tatemono demonstrates all new features added to Arkzen v2.0.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {sections.map(s => (
          <div
            key={s.title}
            onClick={() => setExpanded(expanded === s.title ? null : s.title)}
            className="bg-white rounded-2xl border border-neutral-200 p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 text-base">{s.title}</span>
              <span className="text-neutral-400 text-lg">{expanded === s.title ? '−' : '+'}</span>
            </div>
            {expanded === s.title && (
              <p className="mt-3 text-sm text-neutral-600 leading-6">{s.content}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-neutral-100 rounded-2xl px-5 py-4">
        <pre className="text-xs font-mono text-neutral-500 leading-6">
          {`stack: lynx\nengine: arkzen v10.1\ntatemono: new-updates-styles\nscreens: index, about, features`}
        </pre>
      </div>

    </div>
  )
}

/* @arkzen:native:page:lynx:about:end */


/* @arkzen:native:page:lynx:features */

import React, { useState } from '@lynx-js/react'

const FeaturesLynxPage = () => {
  const [selectedColor, setSelectedColor] = useState<LynxColor>('blue')
  const colors: LynxColor[] = ['blue', 'purple', 'green', 'orange']
  const filtered = LYNX_FEATURES.filter(f => f.color === selectedColor)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-6 pt-14 pb-12 flex flex-col">

      <LynxGhostButton label="← Back" onPress={() => window.history.back()} />

      <div className="mt-8 mb-6">
        <LynxBadge label="features" />
        <h1 className="text-3xl font-bold text-neutral-900 mt-4">All Features</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm border-none cursor-pointer ${
              selectedColor === color ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </button>
        ))}
      </div>

      {filtered.map(f => (
        <LynxFeatureCard
          key={f.id}
          icon={getLynxIcon(f.icon)}
          title={f.title}
          description={f.description}
          color={f.color}
        />
      ))}

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <span className="text-neutral-400 text-sm">No features for this filter.</span>
        </div>
      )}

    </div>
  )
}

/* @arkzen:native:page:lynx:features:end */
