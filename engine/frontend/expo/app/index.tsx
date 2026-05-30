// ============================================================
// ARKZEN — Expo Root Index v3.0
// app/index.tsx
//
// Root entry point — mirrors the Next.js hub page.tsx exactly.
//   - Polls /arkzen/expo-registry every 3s
//   - Shows all registered native tatemonos as cards
//   - Entire card is tappable → navigates to tatemono index route
//   - No pills, no separate Open button — same as web stack
// ============================================================

import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
}

interface RegistryData {
  engine:  string
  project: string
  modules: TatemonoEntry[]
}

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

  const fetchRegistry = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`${BACKEND_URL}/arkzen/expo-registry`, {
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setRegistry(await res.json())
        setEngineAlive(true)
      }
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

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-xl bg-neutral-900 items-center justify-center">
              <Text className="text-white text-xs font-bold">A</Text>
            </View>
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

        {/* Section label */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Tatemonos
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
          registry.modules.map(tat => (
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
