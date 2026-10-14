// ============================================================
// ARKZEN GENERATED SCREEN — new-updates-styles/index
// ============================================================

import React, { useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Code, Layers, Palette, Zap } from 'lucide-react-native'
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { s } from '../../arkzen/generated/new-updates-styles.native-styles'
import { Badge } from './components/Badge'
import { FeatureCard } from './components/FeatureCard'
import { GhostButton } from './components/GhostButton'
import { PrimaryButton } from './components/PrimaryButton'
import { FEATURES, ICON_COLORS } from './components/constants'
import { getIcon } from './components/utils'

// User screen (from @arkzen:native:page:index)
/* @arkzen:resolved:import expo */
const IndexScreen = () => {
  const router = useRouter()
  

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
            router.push('/new-updates-styles/features' as any)
            
          }}
        />
        <GhostButton
          label="About this tatemono"
          onPress={() => {
            router.push('/new-updates-styles/about' as any)
            
          }}
        />
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
      <ArkzenStatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_NewUpdatesStyles_Index
