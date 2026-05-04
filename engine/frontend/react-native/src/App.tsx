// ============================================================
// ARKZEN React Native — App Root
// src/App.tsx
//
// This is the React Navigation root.
// ARKZEN_NATIVE_ROUTES is auto-updated by the Arkzen engine
// when you drop tatemonos into tatemonos/<name>/core.tsx
//
// Auth flow:
//   - useArkzenNativeAuth() hook checks token in SecureStore
//   - Protected routes redirect to login if no token
//   - Handled in screen-level (each screen checks auth state)
// ============================================================

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'react-native'
import { ARKZEN_NATIVE_ROUTES } from '@/arkzen/generated/routes'
import type { ArkzenRootStackParamList } from '@/arkzen/generated/routes'

const Stack = createNativeStackNavigator<ArkzenRootStackParamList>()

function LoadingScreen() {
  const { View, ActivityIndicator, StyleSheet } = require('react-native')
  const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f0' },
  })
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#aaa" />
    </View>
  )
}

export default function App() {
  if (ARKZEN_NATIVE_ROUTES.length === 0) {
    return <LoadingScreen />
  }

  const initialRoute = ARKZEN_NATIVE_ROUTES[0].name

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f0" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute as keyof ArkzenRootStackParamList}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
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
    </>
  )
}