// ============================================================
// ARKZEN GENERATED NATIVE HOOKS — kotoba [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.345Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import type { KProfile } from './types'

export function useApi<T = any>(path: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(!!path)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    if (!path) return
    setLoading(true); setError(null)
    try { setData(await kt<T>(path)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setLoading(false) }
  }, [path])
  useEffect(() => { load() }, [load, ...deps])
  return { data, loading, error, reload: load, setData }
}

export function useRealtime(event: string, cb: (data: any) => void) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    const g = globalThis as any
    g.__ktBus = g.__ktBus ?? new Set()
    const h = (e: string, d: any) => { if (e === event) ref.current(d) }
    g.__ktBus.add(h)
    return () => { g.__ktBus.delete(h) }
  }, [event])
}

export function useProfile() {
  const [profile, setProfile] = useState<KProfile | null>(null)
  const load = useCallback(async () => {
    try { const r = await kt<{ data: KProfile }>('/me'); setProfile(r.data) } catch { /* auth layout handles it */ }
  }, [])
  useEffect(() => { load() }, [load])
  return { profile, setProfile, reload: load }
}

// ─── UI atoms ─────────────────────────────────────────────────

export const useNav = () => {
  const r = useRouter()
  return { go: (p: string) => r.push((p ? `/kotoba/${p}` : '/kotoba') as any) }
}



// ─── Theme (light, iOS system colors) ─────────────────────────
