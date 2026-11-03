// ============================================================
// ARKZEN — Expo Root Index v3.0
// app/index.tsx
//
// Root entry point — mirrors the Next.js hub page.tsx exactly.
//   - Polls /arkzen/expo-registry every 3s
//   - Shows all registered native tatemonos as cards
//   - Entire card is tappable → navigates to tatemono index route
//   - Searches and filters by framework compatibility
// ============================================================

import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Clipboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TatemonoEntry {
  name:        string
  version:     string
  status:      'active' | 'removed'
  filePath:    string
  screens:     string[]
  auth:        boolean
  registered:  string
  lastUpdated: string
  frontend?:   string[]
  backend?:    string[]
}

interface RegistryData {
  engine:  string
  project: string
  modules: TatemonoEntry[]
  activeStack?: string
  activeBackend?: string
  activeDatabase?: string
}

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

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL =
  process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return '—' }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '—' }
}

// ─── Route helper — mirrors Next.js routePath convention ─────────────────────
// index screen → /tatName (Expo Router file-system convention)
// other screens → /tatName/screenName

function getTatemonoRoute(tatemono: TatemonoEntry): string {
  const first = tatemono.screens[0]
  if (!first) return `/${tatemono.name}`
  return first === 'index' ? `/${tatemono.name}` : `/${tatemono.name}/${first}`
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TatemonoEntry['status'] }) {
  const isActive = status === 'active'
  return (
    <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-50' : 'bg-neutral-100'}`}>
      <View className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
      <Text className={`text-xs font-medium ${isActive ? 'text-emerald-700' : 'text-neutral-500'}`}>
        {status}
      </Text>
    </View>
  )
}

// ─── Tatemono card — entire card tappable, mirrors Next.js TatemonoCard ───────

function TatemonoCard({ tatemono, onNavigate }: {
  tatemono:   TatemonoEntry
  onNavigate: (route: string) => void
}) {
  const route = getTatemonoRoute(tatemono)

  function handleCopy() {
    Clipboard.setString(tatemono.name)
    Alert.alert('Copied', `"${tatemono.name}" copied to clipboard`)
  }

  return (
    <TouchableOpacity
      onPress={() => onNavigate(route)}
      activeOpacity={0.7}
      className="bg-white rounded-2xl border border-neutral-100 mb-3 overflow-hidden"
    >
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-semibold text-neutral-900 mb-0.5" numberOfLines={1}>
            {tatemono.name}
          </Text>
          <Text className="text-xs text-neutral-400 font-mono">v{tatemono.version}</Text>
        </View>
        <StatusBadge status={tatemono.status} />
      </View>

      {/* Meta */}
      <View className="px-4 pb-3 flex-row gap-4">
        <View>
          <Text className="text-xs text-neutral-400">Registered</Text>
          <Text className="text-xs text-neutral-600 font-medium mt-0.5">{formatDate(tatemono.registered)}</Text>
        </View>
        <View>
          <Text className="text-xs text-neutral-400">Updated</Text>
          <Text className="text-xs text-neutral-600 font-medium mt-0.5">{formatTime(tatemono.lastUpdated)}</Text>
        </View>
        {tatemono.auth && (
          <View className="ml-auto">
            <View className="px-2 py-0.5 rounded-md bg-indigo-50">
              <Text className="text-xs text-indigo-600 font-medium">Auth</Text>
            </View>
          </View>
        )}
      </View>

      <View className="px-4 pb-3 gap-2">
        <CompatibilityRow label="Frontend" items={tatemono.frontend ?? []} />
        <CompatibilityRow label="Backend" items={tatemono.backend ?? []} />
      </View>

      {/* Footer — route + copy, mirrors Next.js card actions */}
      <View className="flex-row border-t border-neutral-50">
        <View className="flex-1 py-3 px-4 justify-center">
          <Text className="text-xs text-neutral-400 font-mono">{route}</Text>
        </View>
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation?.(); handleCopy() }}
          className="px-5 py-3 items-center justify-center active:bg-neutral-50"
          activeOpacity={0.7}
        >
          <Text className="text-xs text-neutral-500">Copy</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

function CompatibilityRow({ label, items }: { label: string; items: string[] }) {
  return (
    <View className="flex-row items-start gap-2">
      <Text className="w-16 pt-1 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">{label}</Text>
      <View className="flex-1 flex-row flex-wrap gap-1.5">
        {items.length > 0 ? items.map(item => (
          <View key={item} className="rounded-full border border-neutral-200 bg-white px-2.5 py-1">
            <Text className="text-[10px] text-neutral-600">{item}</Text>
          </View>
        )) : (
          <View className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1">
            <Text className="text-[10px] text-neutral-400">None</Text>
          </View>
        )}
      </View>
    </View>
  )
}

function ActiveStack({ registry }: { registry: RegistryData | null }) {
  return (
    <View className="mb-5 rounded-2xl border border-neutral-200 bg-white p-3.5 gap-2.5">
      {stackGroups.map(group => (
        <View key={group.label} className="flex-row items-start gap-2">
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
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View className="flex-1 bg-white rounded-xl border border-neutral-100 px-4 py-3">
      <Text className={`text-xl font-bold ${accent}`}>{value}</Text>
      <Text className="text-xs text-neutral-400 mt-0.5 leading-4">{label}</Text>
    </View>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View className="items-center justify-center py-16 px-8">
      <View className="w-16 h-16 rounded-2xl bg-neutral-100 items-center justify-center mb-4">
        <Text className="text-2xl">📦</Text>
      </View>
      <Text className="text-sm font-semibold text-neutral-900 mb-1 text-center">
        No tatemonos yet
      </Text>
      <Text className="text-xs text-neutral-400 text-center leading-5">
        Drop a tatemono with{'\n'}
        <Text className="font-mono text-indigo-500">@arkzen:native:page</Text>
        {'\n'}blocks and run the watcher.
      </Text>
      <View className="mt-5 px-4 py-2.5 bg-neutral-100 rounded-xl">
        <Text className="text-xs text-neutral-500 font-mono">tsx watch arkzen.ts</Text>
      </View>
    </View>
  )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

function ArkzenHub() {
  const router                              = useRouter()
  const [registry,    setRegistry]          = useState<RegistryData | null>(null)
  const [loading,     setLoading]           = useState(true)
  const [refreshing,  setRefreshing]        = useState(false)
  const [engineAlive, setEngineAlive]       = useState(false)
  const [metadataUnavailable, setMetadataUnavailable] = useState(false)
  const [query, setQuery] = useState('')
  const [frameworkFilter, setFrameworkFilter] = useState('All')

  const fetchRegistry = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`${BACKEND_URL}/arkzen/expo-registry`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Expo registry request failed (${res.status})`)
      const nativeRegistry = await res.json() as RegistryData
      let hubRegistry: HubRegistry | null = null
      try {
        const hubResponse = await fetch(`${BACKEND_URL}/arkzen/registry`, {
          headers: { Accept: 'application/json' },
        })
        if (!hubResponse.ok) throw new Error(`Hub registry request failed (${hubResponse.status})`)
        hubRegistry = await hubResponse.json() as HubRegistry
        setMetadataUnavailable(false)
      } catch {
        setMetadataUnavailable(true)
      }

      const modulesByName = new Map((hubRegistry?.modules ?? []).map(module => [module.name, module]))
      setRegistry({
        ...nativeRegistry,
        activeStack: hubRegistry?.activeStack ?? 'expo',
        activeBackend: hubRegistry?.activeBackend,
        activeDatabase: hubRegistry?.activeDatabase,
        modules: (nativeRegistry.modules ?? []).map(module => {
          const shared = modulesByName.get(module.name)
          return {
            ...module,
            frontend: shared?.frontend ?? ['Expo'],
            backend: shared?.backend ?? [],
          }
        }),
      })
      setEngineAlive(true)
    } catch {
      setEngineAlive(false)
    } finally {
      if (!silent) setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchRegistry()
    const interval = setInterval(() => fetchRegistry(true), 3000)
    return () => clearInterval(interval)
  }, [fetchRegistry])

  function onRefresh() {
    setRefreshing(true)
    fetchRegistry()
  }

  function handleNavigate(route: string) {
    router.push(route as any)
  }

  const active  = registry?.modules.filter(m => m.status === 'active').length ?? 0
  const total   = registry?.modules.length ?? 0
  const errors  = registry?.modules.filter(m => m.status === 'removed').length ?? 0
  const frameworks = [...new Set((registry?.modules ?? []).flatMap(module => [...(module.frontend ?? []), ...(module.backend ?? [])]))].sort()
  const normalizedQuery = query.trim().toLowerCase()
  const filteredModules = (registry?.modules ?? []).filter(module => {
    const compatible = [...(module.frontend ?? []), ...(module.backend ?? [])]
    const matchesQuery = !normalizedQuery || [module.name, ...compatible].some(value => value.toLowerCase().includes(normalizedQuery))
    return matchesQuery && (frameworkFilter === 'All' || compatible.includes(frameworkFilter))
  })

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View>
              <Text className="text-sm font-semibold text-neutral-900">Arkzen Engine</Text>
              <Text className="text-xs text-neutral-400">v{registry?.engine ?? '1.0.0'} · Expo</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className={`w-1.5 h-1.5 rounded-full ${engineAlive ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
            <Text className="text-xs text-neutral-400">
              {engineAlive ? 'Engine running' : 'Engine offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-5 pb-12"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a3a3a3" />
        }
      >
        {/* Stats */}
        <View className="flex-row gap-2.5 mb-5">
          <StatCard label="Active"  value={active}  accent="text-blue-600" />
          <StatCard label="Total"   value={total}   accent="text-neutral-900" />
          <StatCard label="Removed" value={errors}  accent="text-red-500" />
        </View>

        <ActiveStack registry={registry} />

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
                    activeOpacity={0.75}
                    className={`rounded-full border px-3.5 py-2 ${selected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'}`}
                  >
                    <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-neutral-500'}`}>{framework === 'All' ? 'All frameworks' : framework}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        )}

        {/* Section label */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Tatemonos · {filteredModules.length}
          </Text>
          <Text className="text-xs text-neutral-400">{registry?.project ?? 'project'}</Text>
        </View>

        {/* Cards */}
        {loading ? (
          <View className="py-16 items-center gap-3">
            <ActivityIndicator size="small" color="#a3a3a3" />
            <Text className="text-xs text-neutral-400">Loading registry…</Text>
          </View>
        ) : !registry || registry.modules.length === 0 ? (
          <EmptyState />
        ) : (
          filteredModules.length === 0 ? (
            <Text className="py-12 text-center text-xs text-neutral-400">No matching Tatemono. Try another name or framework.</Text>
          ) : filteredModules.map(tat => (
            <TatemonoCard key={tat.name} tatemono={tat} onNavigate={handleNavigate} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Index() {
  return <ArkzenHub />
}
