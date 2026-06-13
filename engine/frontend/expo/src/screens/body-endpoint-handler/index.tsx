// ============================================================
// ARKZEN GENERATED SCREEN — body-endpoint-handler/index
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { GuestLayout } from '@/layouts/GuestLayout'
import { InjectedBadge } from './components/InjectedBadge'
import { NativeBadge } from './components/NativeBadge'
import { SectionCard } from './components/SectionCard'
import { apiFetch, sourceColor } from './components/utils'
import type { ProbeResult, Stats } from './components/types'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const [probes,      setProbes]      = useState<ProbeResult[]>([])
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [ping,        setPing]        = useState<Record<string, any> | null>(null)
  const [latest,      setLatest]      = useState<ProbeResult[]>([])
  const [loading,     setLoading]     = useState(false)
  const [deleting,    setDeleting]    = useState<number | null>(null)
  const [toast,       setToast]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Echo form — multi-field like web
  const [echoFields,  setEchoFields]  = useState([{ key: 'hello', value: 'world' }])
  const [echoing,     setEchoing]     = useState(false)
  const [echoResult,  setEchoResult]  = useState<Record<string, any> | null>(null)

  // Record handler form
  const [hProbe,      setHProbe]      = useState('handler-probe')
  const [hOk,         setHOk]         = useState(true)
  const [hRecording,  setHRecording]  = useState(false)

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [probesRes, statsRes, latestRes] = await Promise.all([
        apiFetch('/api/body-endpoint-handler/probes'),
        apiFetch('/api/body-endpoint-handler/stats'),
        apiFetch('/api/body-endpoint-handler/latest'),
      ])
      const pd = await probesRes.json(); setProbes(pd.data ?? pd ?? [])
      const sd = await statsRes.json();  setStats(sd)
      const ld = await latestRes.json(); setLatest(ld.results ?? [])
    } catch { showToast('error', 'Failed to load') }
    setLoading(false)
  }

  const doPing = async () => {
    try {
      const res = await apiFetch('/api/body-endpoint-handler/ping')
      const d   = await res.json()
      setPing(d)
      showToast('success', 'Ping OK — handler body confirmed')
    } catch { showToast('error', 'Ping failed') }
  }

  const doEcho = async () => {
    setEchoing(true)
    try {
      const body: Record<string, string> = {}
      echoFields.forEach(f => { if (f.key) body[f.key] = f.value })
      const res = await apiFetch('/api/body-endpoint-handler/echo', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const d = await res.json()
      setEchoResult(d)
      showToast('success', 'Echo OK — endpoint body confirmed')
      loadAll()
    } catch { showToast('error', 'Echo failed') }
    setEchoing(false)
  }

  const doRecord = async () => {
    setHRecording(true)
    try {
      const res = await apiFetch('/api/body-endpoint-handler/record-handler', {
        method: 'POST',
        body: JSON.stringify({ probe: hProbe, ok: hOk }),
      })
      const d = await res.json()
      if (res.ok) { showToast('success', `Recorded probe #${d.probe_id} via handler body`); loadAll() }
      else        { showToast('error', 'Record failed') }
    } catch { showToast('error', 'Record request failed') }
    setHRecording(false)
  }

  const doDelete = async (id: number) => {
    setDeleting(id)
    try {
      const res = await apiFetch(`/api/body-endpoint-handler/probes/${id}`, { method: 'DELETE' })
      if (res.ok) { showToast('success', 'Probe deleted'); loadAll() }
      else        { showToast('error', 'Delete failed') }
    } catch { showToast('error', 'Delete request failed') }
    setDeleting(null)
  }

  useEffect(() => { loadAll() }, [])

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Toast */}
      {toast && (
        <View style={{
          position: 'absolute', top: 52, left: 16, right: 16, zIndex: 999,
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
          borderRadius: 10, padding: 12,
        }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{toast.msg}</Text>
        </View>
      )}

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <Text className="text-lg font-bold text-neutral-900">Body Injection Tester</Text>
        <Text className="text-xs text-neutral-400 mt-0.5 font-mono">
          ControllerBuilder v7.0 · CustomRouteBuilder v2.0
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Stats */}
        <SectionCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-bold text-neutral-900">📊 Stats Endpoint</Text>
              <Text className="text-xs text-neutral-400 font-mono mt-0.5">GET /stats · @arkzen:endpoint:stats</Text>
            </View>
            {stats && <InjectedBadge injected={stats.injected} />}
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#a3a3a3" />
          ) : stats ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {([['Total', stats.total, '#18181b'], ['Passed ✓', stats.passed, '#16a34a'], ['Failed ✗', stats.failed, '#dc2626']] as const).map(([label, val, color]) => (
                <View key={label} style={{ flex: 1, backgroundColor: '#fafafa', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '800', color }}>{val}</Text>
                  <Text style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>{label}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <TouchableOpacity
            onPress={loadAll}
            activeOpacity={0.8}
            style={{ marginTop: 10, backgroundColor: '#0ea5e9', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, alignSelf: 'flex-start' }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Refresh Stats</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* Echo — multi-field */}
        <SectionCard>
          <Text className="text-sm font-bold text-neutral-900 mb-0.5">🔁 Echo Endpoint</Text>
          <Text className="text-xs text-neutral-400 font-mono mb-3">POST /echo · @arkzen:endpoint:echo</Text>
          {echoFields.map((f, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
              <TextInput
                value={f.key}
                onChangeText={v => { const n = [...echoFields]; n[i].key = v; setEchoFields(n) }}
                placeholder="key"
                placeholderTextColor="#a3a3a3"
                autoCorrect={false}
                autoCapitalize="none"
                style={{ flex: 1, backgroundColor: '#f4f4f5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#18181b' }}
              />
              <TextInput
                value={f.value}
                onChangeText={v => { const n = [...echoFields]; n[i].value = v; setEchoFields(n) }}
                placeholder="value"
                placeholderTextColor="#a3a3a3"
                autoCorrect={false}
                autoCapitalize="none"
                style={{ flex: 1, backgroundColor: '#f4f4f5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#18181b' }}
              />
              <TouchableOpacity
                onPress={() => setEchoFields(echoFields.filter((_, j) => j !== i))}
                activeOpacity={0.8}
                style={{ backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setEchoFields([...echoFields, { key: '', value: '' }])}
              activeOpacity={0.8}
              style={{ backgroundColor: '#6366f1', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>+ Add Field</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={doEcho}
            disabled={echoing}
            activeOpacity={0.8}
            style={{ backgroundColor: echoing ? '#d4d4d8' : '#18181b', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 18, alignSelf: 'flex-start' }}
          >
            {echoing
              ? <ActivityIndicator size="small" color="#737373" />
              : <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Send Echo</Text>
            }
          </TouchableOpacity>
          {echoResult && (
            <View style={{ marginTop: 12, backgroundColor: '#f4f4f5', borderRadius: 8, padding: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <InjectedBadge injected={echoResult.injected} />
                <Text style={{ fontSize: 11, color: '#52525b' }}>{echoResult.builder} · {echoResult.field_count} field(s)</Text>
              </View>
              <Text style={{ fontSize: 11, color: '#27272a', fontFamily: 'monospace' }}>
                {JSON.stringify(echoResult.echo, null, 2)}
              </Text>
            </View>
          )}
        </SectionCard>

        {/* Ping */}
        <SectionCard>
          <Text className="text-sm font-bold text-neutral-900 mb-0.5">🏓 Ping Handler</Text>
          <Text className="text-xs text-neutral-400 font-mono mb-3">GET /ping · @arkzen:handler:ping</Text>
          <TouchableOpacity
            onPress={doPing}
            activeOpacity={0.8}
            style={{ backgroundColor: '#059669', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 18, alignSelf: 'flex-start' }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Ping</Text>
          </TouchableOpacity>
          {ping && (
            <View style={{ marginTop: 12, backgroundColor: '#f0fdf4', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#bbf7d0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <InjectedBadge injected={ping.injected} />
                <Text style={{ fontSize: 11, color: '#166534' }}>{ping.builder} · {ping.handler}</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#15803d' }}>{ping.message}</Text>
              <Text style={{ fontSize: 11, color: '#86efac', marginTop: 2 }}>{ping.timestamp}</Text>
            </View>
          )}
        </SectionCard>

        {/* Record Handler */}
        <SectionCard>
          <Text className="text-sm font-bold text-neutral-900 mb-0.5">📝 Record Handler</Text>
          <Text className="text-xs text-neutral-400 font-mono mb-3">POST /record-handler · @arkzen:handler:recordHandler</Text>
          <TextInput
            value={hProbe}
            onChangeText={setHProbe}
            placeholder="probe name"
            placeholderTextColor="#a3a3a3"
            autoCorrect={false}
            autoCapitalize="none"
            style={{ backgroundColor: '#f4f4f5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#18181b', marginBottom: 8 }}
          />
          <TouchableOpacity
            onPress={() => setHOk(v => !v)}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}
          >
            <View style={{
              width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
              borderColor: hOk ? '#7c3aed' : '#d4d4d8',
              backgroundColor: hOk ? '#7c3aed' : '#fff',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {hOk && <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 13, color: '#3f3f46' }}>ok</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={doRecord}
            disabled={hRecording}
            activeOpacity={0.8}
            style={{ backgroundColor: hRecording ? '#d4d4d8' : '#7c3aed', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 18, alignSelf: 'flex-start' }}
          >
            {hRecording
              ? <ActivityIndicator size="small" color="#737373" />
              : <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Record via Handler</Text>
            }
          </TouchableOpacity>
        </SectionCard>

        {/* Latest 5 */}
        <SectionCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <View>
              <Text className="text-sm font-bold text-neutral-900">🕑 Latest Handler</Text>
              <Text className="text-xs text-neutral-400 font-mono mt-0.5">GET /latest · @arkzen:handler:latest</Text>
            </View>
            <TouchableOpacity onPress={loadAll} activeOpacity={0.8} style={{ padding: 6 }}>
              {loading
                ? <ActivityIndicator size="small" color="#a3a3a3" />
                : <Text style={{ fontSize: 11, color: '#0ea5e9', fontWeight: '700' }}>Refresh</Text>
              }
            </TouchableOpacity>
          </View>
          {latest.length === 0 ? (
            <Text style={{ color: '#a1a1aa', fontSize: 13 }}>No results yet.</Text>
          ) : (
            latest.map(r => (
              <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
                <NativeBadge label={r.source} color={sourceColor(r.source)} />
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: '#18181b' }} numberOfLines={1}>{r.probe}</Text>
                <NativeBadge label={r.ok ? '✓' : '✗'} color={r.ok ? '#16a34a' : '#dc2626'} />
                <Text style={{ fontSize: 10, color: '#a1a1aa' }}>{new Date(r.created_at).toLocaleTimeString()}</Text>
              </View>
            ))
          )}
        </SectionCard>

        {/* All probe results + delete */}
        <SectionCard>
          <Text className="text-sm font-bold text-neutral-900 mb-3">All Probe Results</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#a3a3a3" />
          ) : probes.length === 0 ? (
            <Text style={{ color: '#a1a1aa', fontSize: 13 }}>No probes yet.</Text>
          ) : (
            probes.map((r, i) => (
              <View
                key={r.id}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: i < probes.length - 1 ? 1 : 0,
                  borderBottomColor: '#f4f4f5',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <NativeBadge label={r.source} color={sourceColor(r.source)} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#18181b', flex: 1 }} numberOfLines={1}>{r.probe}</Text>
                  <NativeBadge label={r.ok ? '✓' : '✗'} color={r.ok ? '#16a34a' : '#dc2626'} />
                  <TouchableOpacity
                    onPress={() => doDelete(r.id)}
                    disabled={deleting === r.id}
                    activeOpacity={0.8}
                    style={{ backgroundColor: '#ef4444', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, opacity: deleting === r.id ? 0.5 : 1 }}
                  >
                    {deleting === r.id
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Delete</Text>
                    }
                  </TouchableOpacity>
                </View>
                {r.result && (
                  <Text style={{ fontSize: 11, color: '#71717a', marginLeft: 2 }} numberOfLines={2}>{r.result}</Text>
                )}
                <Text style={{ fontSize: 10, color: '#a1a1aa', marginTop: 2, marginLeft: 2 }}>
                  {new Date(r.created_at).toLocaleTimeString()}
                </Text>
              </View>
            ))
          )}
        </SectionCard>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_BodyEndpointHandler_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('body-endpoint-handler')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="body-endpoint-handler" dashboardRoute="/body-endpoint-handler/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_BodyEndpointHandler_Index
