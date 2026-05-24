// ============================================================
// ARKZEN — Expo Router Root Layout v1.0
// app/_layout.tsx
//
// The root layout for Expo Router.
// Sets up:
//   - SafeAreaProvider (required for SafeAreaView)
//   - GestureHandlerRootView (required for Gesture Handler)
//   - StatusBar default
//   - NativeWind (applied via babel plugin — no import needed)
//   - Font loading (if custom fonts declared in tatemono meta)
//   - Splash screen hide
//
// All tatemono app routes live under app/{tatName}/{screen}.tsx
// and are auto-discovered by Expo Router.
// ============================================================

import React, { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'

// Keep splash visible until we're ready
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    // Hide splash after layout mounts
    SplashScreen.hideAsync()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown:  false,
            animation:    'slide_from_right',
            contentStyle: { backgroundColor: '#fafaf9' },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
