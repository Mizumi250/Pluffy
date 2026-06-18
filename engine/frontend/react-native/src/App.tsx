// ============================================================
// ARKZEN React Native — App Root v2.0
// src/App.tsx
//
// v2.0 — Full wire-up:
//   - GestureHandlerRootView wraps the whole tree (required for
//     react-native-gesture-handler in bare RN)
//   - SafeAreaProvider wraps NavigationContainer
//   - Auth guard: protected routes redirect to the tatemono's
//     login screen if no valid token is found in AsyncStorage
//   - ARKZEN_NATIVE_ROUTES carries layout metadata so the guard
//     knows which screens are auth-gated
//   - Initial route resolves to first route in registry
//
// v1.0 — Foundation: basic NavigationContainer + Stack.Navigator.
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import {
  StatusBar,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { ARKZEN_NATIVE_ROUTES } from './arkzen/generated/routes'
import type { ArkzenRootStackParamList } from './arkzen/generated/routes'

const Stack = createNativeStackNavigator<ArkzenRootStackParamList>()

// ─── Auth guard ───────────────────────────────────────────────────────────────
//
// On navigation state change, check whether the active screen requires auth.
// If it does and no token exists for that tatemono, navigate to the tatemono's
// login screen. Mirrors how Expo's AuthLayout works but at the navigator level.

function useAuthGuard(navRef: React.RefObject<NavigationContainerRef<ArkzenRootStackParamList>>) {
  const handleNavigate = async (routeName: string | undefined) => {
    if (!routeName) return

    const route = ARKZEN_NATIVE_ROUTES.find(r => r.name === routeName)
    if (!route?.auth) return

    const tokenKey = `arkzen-token-${route.tatemono}`
    const token    = await AsyncStorage.getItem(tokenKey)
    if (!token && navRef.current) {
      // Resolve the login route for this tatemono
      const loginRoute = ARKZEN_NATIVE_ROUTES.find(
        r => r.tatemono === route.tatemono && r.screenName === 'login'
      )
      if (loginRoute) {
        navRef.current.navigate(loginRoute.name as keyof ArkzenRootStackParamList)
      }
    }
  }

  return { handleNavigate }
}

// ─── Loading screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="small" color="#aaa" />
    </View>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const navRef = useRef<NavigationContainerRef<ArkzenRootStackParamList>>(null)
  const { handleNavigate } = useAuthGuard(navRef)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small defer so the navigation container is mounted before we try to guard
    setReady(true)
  }, [])

  if (ARKZEN_NATIVE_ROUTES.length === 0 || !ready) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LoadingScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    )
  }

  const initialRoute = ARKZEN_NATIVE_ROUTES[0].name

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f0" />
        <NavigationContainer
          ref={navRef}
          onStateChange={() => {
            const current = navRef.current?.getCurrentRoute()?.name
            handleNavigate(current)
          }}
        >
          <Stack.Navigator
            initialRouteName={initialRoute as keyof ArkzenRootStackParamList}
            screenOptions={{
              headerShown:  false,
              animation:    'slide_from_right',
              contentStyle: { backgroundColor: '#f5f5f0' },
            }}
          >
            {ARKZEN_NATIVE_ROUTES.map(route => (
              <Stack.Screen
                key={route.name}
                name={route.name as keyof ArkzenRootStackParamList}
                component={route.component}
                options={{ headerShown: false }}
              />
            ))}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#f5f5f0',
  },
})
