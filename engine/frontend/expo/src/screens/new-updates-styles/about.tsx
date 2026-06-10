// ============================================================
// ARKZEN GENERATED SCREEN — new-updates-styles/about
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Code, Layers, Palette, Zap } from 'lucide-react-native'
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { GuestLayout } from '@/layouts/GuestLayout'
import { s } from '../../arkzen/generated/new-updates-styles.native-styles'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
// ── Badge ────────────────────────────────────────────────────
export const Badge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-blue-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-blue-600 tracking-wide">
      {label}
    </Text>
  </View>
)

// ── Primary button ───────────────────────────────────────────
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
    className={`rounded-2xl py-4 px-6 items-center ${
      disabled ? 'bg-blue-200' : 'bg-blue-600'
    }`}
  >
    <Text className="text-white font-semibold text-base tracking-wide">
      {label}
    </Text>
  </TouchableOpacity>
)

// ── Ghost button ─────────────────────────────────────────────
export const GhostButton = ({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) => (
  <Pressable
    onPress={onPress}
    className="rounded-2xl py-4 px-6 items-center border border-neutral-200"
  >
    <Text className="text-neutral-600 font-medium text-base">{label}</Text>
  </Pressable>
)

// ── Feature card ─────────────────────────────────────────────
type NativeColor = 'blue' | 'purple' | 'green' | 'orange'

const COLOR_MAP: Record<NativeColor, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
}

export const FeatureCard = ({
  icon,
  title,
  description,
  color,
  onPress,
  expanded = false,
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

// ── Data ─────────────────────────────────────────────────────
type Feature = {
  id: number
  icon: 'zap' | 'code' | 'palette' | 'layers'
  title: string
  description: string
  color: NativeColor
}

export const FEATURES: Feature[] = [
  { id: 1, icon: 'zap',     title: 'Component Separation', description: 'Individual component files with shared utilities backend',          color: 'blue' },
  { id: 2, icon: 'code',    title: 'CSS DSL Support',       description: 'Global CSS variables and per-component CSS Modules',               color: 'purple' },
  { id: 3, icon: 'palette', title: 'Multiple Pages',        description: 'Support for home, about, features, and custom routes',             color: 'green' },
  { id: 4, icon: 'layers',  title: 'Asset Management',      description: 'Built-in favicon, image, and static file support',                 color: 'orange' },
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

// User screen (from @arkzen:native:page:about)
const AboutScreen = () => {
  const router = useRouter()
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

      <GhostButton label="← Back" onPress={() => router.back()} />

      <View className="mt-8 mb-8">
        <Badge label="about" />
        <Text className="text-3xl font-bold text-neutral-900 mt-4">
          About this showcase
        </Text>
        <Text className="text-sm text-neutral-500 mt-2 leading-6">
          This tatemono demonstrates all new features added to Arkzen v2.0.
        </Text>
      </View>

      {/* Accordion */}
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

      {/* Stack info */}
      <View className="bg-neutral-100 rounded-2xl px-5 py-4">
        <Text className="text-xs font-mono text-neutral-500 leading-6">
          stack: expo{'\n'}
          engine: arkzen v10.1{'\n'}
          tatemono: new-updates-styles{'\n'}
          screens: index, about, features
        </Text>
      </View>

    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_NewUpdatesStyles_About() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('new-updates-styles')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="new-updates-styles" dashboardRoute="/new-updates-styles/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AboutScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_NewUpdatesStyles_About
