// ============================================================
// ARKZEN — Expo Root Index v1.0
// app/index.tsx
//
// Root entry point. Redirects to the first registered tatemono
// screen in the route registry, or shows a welcome screen
// when no tatemonos have been built yet.
// ============================================================

import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { ARKZEN_EXPO_ROUTES } from '@/arkzen/generated/routes'

export default function Index() {
  // If tatemonos have been built, redirect to first screen
  if (ARKZEN_EXPO_ROUTES.length > 0) {
    const firstRoute = ARKZEN_EXPO_ROUTES[0].routePath
    return <Redirect href={firstRoute as any} />
  }

  // No tatemonos yet — show engine ready screen
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50 px-8">
      <Text className="text-xs text-neutral-400 uppercase tracking-widest mb-3">
        Arkzen Engine
      </Text>
      <Text className="text-2xl font-semibold text-neutral-900 mb-2 text-center">
        Expo Stack Ready
      </Text>
      <Text className="text-sm text-neutral-500 text-center leading-6 max-w-xs">
        Drop a tatemono into{'\n'}
        <Text className="font-mono text-xs text-indigo-500">
          tatemonos/{'<name>'}/core.tsx
        </Text>
        {'\n'}and the engine will generate your screens.
      </Text>

      <View className="mt-8 px-4 py-3 bg-neutral-100 rounded-xl">
        <Text className="text-xs text-neutral-500 font-mono">
          tsx watch arkzen.ts
        </Text>
      </View>
    </View>
  )
}
