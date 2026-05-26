// ============================================================
// ARKZEN GENERATED SCREEN — new-updates-styles/index [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:index instead
// Generated: 2026-05-26T09:29:49.779Z
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GuestLayout } from '@/layouts/GuestLayout'

export function IndexScreen() {
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
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default IndexScreen
