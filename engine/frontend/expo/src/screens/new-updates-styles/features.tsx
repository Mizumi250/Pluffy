// ============================================================
// ARKZEN GENERATED SCREEN — new-updates-styles/features
// ============================================================

import React, { useState } from 'react'
import { GuestLayout } from '@/layouts/GuestLayout'
import { s } from '../../arkzen/generated/new-updates-styles.native-styles'
import { Badge } from './components/Badge'
import { FeatureCard } from './components/FeatureCard'
import { GhostButton } from './components/GhostButton'
import { PrimaryButton } from './components/PrimaryButton'
import { FEATURES, ICON_COLORS } from './components/constants'
import { getIcon } from './components/utils'
import type { NativeColor } from './components/types'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:features)
const FeaturesScreen = () => {
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState<NativeColor>('blue')

  const colors: NativeColor[] = ['blue', 'purple', 'green', 'orange']
  const filtered = FEATURES.filter(f => f.color === selectedColor)

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="px-6 pt-14 pb-12">

      <GhostButton label="← Back" onPress={() => router.back()} />

      <View className="mt-8 mb-6">
        <Badge label="features" />
        <Text className="text-3xl font-bold text-neutral-900 mt-4">All Features</Text>
      </View>

      {/* Color filter */}
      <View className="flex-row flex-wrap gap-2 mb-6">
        {colors.map(color => (
          <TouchableOpacity
            key={color}
            onPress={() => setSelectedColor(color)}
            activeOpacity={0.8}
            className={`px-4 py-2 rounded-xl ${
              selectedColor === color
                ? 'bg-neutral-900'
                : 'bg-neutral-200'
            }`}
          >
            <Text className={`font-semibold text-sm ${
              selectedColor === color ? 'text-white' : 'text-neutral-700'
            }`}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtered cards */}
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

// Engine wrapper
export function ArkzenScreen_NewUpdatesStyles_Features() {
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
        <FeaturesScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_NewUpdatesStyles_Features
