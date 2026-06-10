// ============================================================
// ARKZEN GENERATED SCREEN — new-updates-styles/index
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

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const router = useRouter()
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="px-6 pt-14 pb-12">

      {/* Header */}
      <View className="mb-8">
        <Badge label="Arkzen v2.0" />
        <Text className="text-4xl font-bold text-neutral-900 mt-4 leading-tight">
          What's New{'\n'}in v2.0 ✦
        </Text>
        <Text className="text-base text-neutral-500 mt-3 leading-6">
          Component separation, CSS DSL, multiple pages, and more — all running natively.
        </Text>
      </View>

      {/* Feature cards */}
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

      {/* What's new banner */}
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

      {/* Nav */}
      <View className="gap-y-3">
        <PrimaryButton label="Browse Features →" onPress={() => router.push('/new-updates-styles/features' as any)} />
        <GhostButton   label="About this tatemono"  onPress={() => router.push('/new-updates-styles/about' as any)} />
      </View>

    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_NewUpdatesStyles_Index() {
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
        <IndexScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_NewUpdatesStyles_Index
