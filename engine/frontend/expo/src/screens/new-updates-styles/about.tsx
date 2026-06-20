// ============================================================
// ARKZEN GENERATED SCREEN — new-updates-styles/about
// ============================================================

import React, { useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Badge } from './components/Badge'
import { FeatureCard } from './components/FeatureCard'
import { GhostButton } from './components/GhostButton'
import { PrimaryButton } from './components/PrimaryButton'

// User screen (from @arkzen:native:page:about)
/* @arkzen:resolved:import expo */
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

      <GhostButton
        label="← Back"
        onPress={() => {
          router.back()
          
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
          {}
          stack: expo{'\n'}
          {}
          {}
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
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AboutScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_NewUpdatesStyles_About
