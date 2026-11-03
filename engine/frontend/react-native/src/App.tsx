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
//   - Native Tatemono hub is the initial route
//
// v1.0 — Foundation: basic NavigationContainer + Stack.Navigator.
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../global.css'
import {
  StatusBar,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ARKZEN_NATIVE_ROUTES } from './arkzen/generated/routes'
import type { ArkzenRootStackParamList } from './arkzen/generated/routes'
import { getTokenForSlug } from '../arkzen/core/stores/authStore'

type AppStackParamList = ArkzenRootStackParamList & { ArkzenHub: undefined }
type HubScreenProps = NativeStackScreenProps<AppStackParamList, 'ArkzenHub'>

const Stack = createNativeStackNavigator<AppStackParamList>()

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

interface HubRegistry {
  activeStack?: string
  activeBackend?: string
  activeDatabase?: string
  modules?: Array<{ name: string; frontend?: string[]; backend?: string[] }>
}

const stackGroups = [
  { label: 'Frontend', key: 'activeStack' as const, tone: '#007aff', options: [['nextjs', 'Next.js'], ['react-vite', 'React + Vite'], ['react-inertia', 'React + Inertia'], ['astro', 'Astro'], ['tanstack-start', 'TanStack Start'], ['expo', 'Expo'], ['react-native', 'React Native'], ['lynx', 'Lynx'], ['tauri', 'Tauri'], ['electron', 'Electron']] },
  { label: 'Backend', key: 'activeBackend' as const, tone: '#30c75a', options: [['laravel', 'Laravel'], ['laravel-inertia', 'Laravel + Inertia'], ['express', 'Express'], ['fastapi', 'FastAPI'], ['django', 'Django'], ['spring-boot', 'Spring Boot'], ['aspnet', 'ASP.NET'], ['go', 'Go'], ['rust', 'Rust']] },
  { label: 'Database', key: 'activeDatabase' as const, tone: '#af52de', options: [['sqlite', 'SQLite'], ['pgsql', 'PostgreSQL']] },
]

function HubScreen({ navigation }: HubScreenProps) {
  const [registry, setRegistry] = useState<HubRegistry | null>(null)
  const [metadataUnavailable, setMetadataUnavailable] = useState(false)
  const [query, setQuery] = useState('')
  const [frameworkFilter, setFrameworkFilter] = useState('All')
  const modules = useMemo(() => {
    const grouped = new Map<string, Array<(typeof ARKZEN_NATIVE_ROUTES)[number]>>()
    for (const route of ARKZEN_NATIVE_ROUTES) {
      const entries = grouped.get(route.tatemono) ?? []
      entries.push(route)
      grouped.set(route.tatemono, entries)
    }
    return [...grouped].map(([name, routes]) => {
      const shared = registry?.modules?.find(module => module.name === name)
      return {
        name,
        routes,
        frontend: shared?.frontend ?? ['React Native'],
        backend: shared?.backend ?? [],
      }
    })
  }, [registry])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/arkzen/registry`, {
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) throw new Error(`Hub registry request failed (${response.status})`)
        const data = await response.json() as HubRegistry
        if (active) {
          setRegistry(data)
          setMetadataUnavailable(false)
        }
      } catch {
        if (active) setMetadataUnavailable(true)
      }
    }
    void load()
    const interval = setInterval(load, 3000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  const frameworks = [...new Set(modules.flatMap(module => [...module.frontend, ...module.backend]))].sort()
  const normalizedQuery = query.trim().toLowerCase()
  const filteredModules = modules.filter(module => {
    const compatible = [...module.frontend, ...module.backend]
    const matchesQuery = !normalizedQuery || [module.name, ...compatible].some(value => value.toLowerCase().includes(normalizedQuery))
    return matchesQuery && (frameworkFilter === 'All' || compatible.includes(frameworkFilter))
  })

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="px-4 py-6 pb-12">
      <View className="mb-6">
        <Text className="text-lg font-semibold tracking-tight text-neutral-900">Arkzen Hub</Text>
        <Text className="mt-1 text-xs text-neutral-400">Tatemono registry · React Native</Text>
      </View>

      <View className="mb-5 flex-row gap-2.5">
        {[['TATEMONOS', modules.length], ['FRONTENDS', new Set(modules.flatMap(module => module.frontend)).size], ['BACKENDS', new Set(modules.flatMap(module => module.backend)).size]].map(([label, value]) => (
          <View key={String(label)} className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-3">
            <Text className="text-xl font-bold text-neutral-900">{value}</Text>
            <Text className="mt-1 text-[9px] font-semibold tracking-widest text-neutral-400">{label}</Text>
          </View>
        ))}
      </View>

      <View className="mb-5 rounded-2xl border border-neutral-200 bg-white p-3.5">
        {stackGroups.map(group => (
          <View key={group.label} className="mb-2.5 flex-row items-start gap-2">
            <Text className="w-16 pt-1 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">{group.label}</Text>
            <View className="flex-1 flex-row flex-wrap gap-1.5">
              {group.options.map(([key, label]) => {
                const isActive = registry?.[group.key] === key
                return (
                  <View
                    key={key}
                    style={{
                      backgroundColor: isActive ? group.tone : '#f3f4f6',
                      borderColor: isActive ? group.tone : '#e5e7eb',
                    }}
                    className="rounded-full border px-2.5 py-1"
                  >
                    <Text style={{ color: isActive ? '#fff' : '#9ca3af' }} className="text-[10px] font-medium">{label}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        ))}
      </View>

      {metadataUnavailable && (
        <Text className="mb-4 text-xs text-amber-700">Framework compatibility and active stack details are unavailable.</Text>
      )}

      <View className="mb-3 rounded-2xl border border-neutral-200 bg-white px-4">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Tatemono or framework"
          placeholderTextColor="#a3a3a3"
          autoCapitalize="none"
          className="h-12 text-sm text-neutral-900"
          accessibilityLabel="Search Tatemono or framework"
        />
      </View>

      {frameworks.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          <View className="flex-row gap-2 pr-4">
            {['All', ...frameworks].map(framework => {
              const selected = frameworkFilter === framework
              return (
                <TouchableOpacity
                  key={framework}
                  onPress={() => setFrameworkFilter(framework)}
                  className={`rounded-full border px-3.5 py-2 ${selected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'}`}
                >
                  <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-neutral-500'}`}>{framework === 'All' ? 'All frameworks' : framework}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      )}

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Tatemonos · {filteredModules.length}</Text>
        <Text className="text-xs text-neutral-400">React Native</Text>
      </View>

      {filteredModules.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-neutral-300 bg-white px-5 py-12">
          <Text className="text-center text-xs text-neutral-400">{modules.length ? 'No matching Tatemono. Try another name or framework.' : 'No native Tatemono routes are registered.'}</Text>
        </View>
      ) : filteredModules.map(module => {
        const firstRoute = module.routes[0]
        return (
          <TouchableOpacity
            key={module.name}
            onPress={() => firstRoute && navigation.navigate(firstRoute.name as keyof AppStackParamList)}
            activeOpacity={0.75}
            className="mb-3 rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <View className="mb-3 flex-row items-start justify-between">
              <View>
                <Text className="text-sm font-semibold text-neutral-900">{module.name}</Text>
                <Text className="mt-1 text-xs text-neutral-400">{module.routes.length} {module.routes.length === 1 ? 'screen' : 'screens'}</Text>
              </View>
              {module.routes.some(route => route.auth) && (
                <View className="rounded-full bg-neutral-100 px-2.5 py-1">
                  <Text className="text-[10px] font-medium text-neutral-500">Auth</Text>
                </View>
              )}
            </View>
            <View className="mb-2 flex-row items-start gap-2">
              <Text className="w-16 pt-1 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">Frontend</Text>
              <View className="flex-1 flex-row flex-wrap gap-1.5">
                {module.frontend.map(item => <View key={item} className="rounded-full border border-neutral-200 bg-white px-2.5 py-1"><Text className="text-[10px] text-neutral-600">{item}</Text></View>)}
              </View>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="w-16 pt-1 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">Backend</Text>
              <View className="flex-1 flex-row flex-wrap gap-1.5">
                {module.backend.length ? module.backend.map(item => <View key={item} className="rounded-full border border-neutral-200 bg-white px-2.5 py-1"><Text className="text-[10px] text-neutral-600">{item}</Text></View>) : <Text className="pt-1 text-[10px] text-neutral-400">None</Text>}
              </View>
            </View>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
//
// On navigation state change, check whether the active screen requires auth.
// If it does and no token exists for that tatemono, navigate to the tatemono's
// login screen. Mirrors how Expo's AuthLayout works but at the navigator level.

function useAuthGuard(
  navRef: React.RefObject<NavigationContainerRef<AppStackParamList> | null>,
) {
  const handleNavigate = async (routeName: string | undefined) => {
    if (!routeName) return

    const route = ARKZEN_NATIVE_ROUTES.find(r => r.name === routeName)
    if (!route?.auth) return

    const token = await getTokenForSlug(route.tatemono)
    if (!token && navRef.current) {
      // Resolve the login route for this tatemono
      const loginRoute = ARKZEN_NATIVE_ROUTES.find(
        r => r.tatemono === route.tatemono && r.screenName === 'login'
      )
      if (loginRoute) {
        navRef.current.navigate(loginRoute.name as never)
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
  const navRef = useRef<NavigationContainerRef<AppStackParamList>>(null)
  const { handleNavigate } = useAuthGuard(navRef)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small defer so the navigation container is mounted before we try to guard
    setReady(true)
  }, [])

  const initialRoute = 'ArkzenHub'
  if (!ready) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LoadingScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer
          ref={navRef}
          onStateChange={() => {
            const current = navRef.current?.getCurrentRoute()?.name
            handleNavigate(current)
          }}
        >
          <Stack.Navigator
            initialRouteName={initialRoute as Extract<keyof AppStackParamList, string>}
            screenOptions={{
              headerShown:  false,
              animation:    'slide_from_right',
              contentStyle: { backgroundColor: '#f5f5f0' },
            }}
          >
            <Stack.Screen name="ArkzenHub" component={HubScreen} />
            {ARKZEN_NATIVE_ROUTES.map(route => (
              <Stack.Screen
                key={route.name}
                name={route.name as keyof AppStackParamList}
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
