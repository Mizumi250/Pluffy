// ============================================================
// ARKZEN GENERATED SCREEN — dtr-geofencing/admin
// ============================================================

import React, { useEffect, useState } from 'react'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { AppLayout } from '../../../arkzen/core/layouts/custom/dtr-geofencing-app'
import { usePageFadeIn } from '../../arkzen/generated/dtr-geofencing.native-animations'
import { s } from '../../arkzen/generated/dtr-geofencing.native-styles'
import { EmployeeDropdown } from './components/EmployeeDropdown'
import { GeofenceBadge } from './components/GeofenceBadge'
import { GeofenceMapView } from './components/GeofenceMapView'
import { LocationWidget } from './components/LocationWidget'
import { RecordRow } from './components/RecordRow'
import { useDtrStore } from './components/hooks'
import { parseSettings } from './components/utils'
import type { TimeRecord } from './components/types'
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:admin)
const AdminScreen = () => {
  const { settings, setSettings, employees, setEmployees } = useDtrStore()

  const [allRecords,      setAllRecords]      = useState<TimeRecord[]>([])
  const [allLoading,      setAllLoading]      = useState(true)
  const [empLoading,      setEmpLoading]      = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [geoEnabled,      setGeoEnabled]      = useState(false)
  const [officeLat,       setOfficeLat]       = useState('')
  const [officeLng,       setOfficeLng]       = useState('')
  const [officeRadius,    setOfficeRadius]     = useState('')
  const [showSettings,    setShowSettings]    = useState(false)

  const BASE = process.env.EXPO_PUBLIC_API_URL ?? ''

  const loadAll = async () => {
    setAllLoading(true)
    try {
      const res  = await fetch(`${BASE}/api/dtr/records`)
      const data = await res.json()
      setAllRecords(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch { setAllRecords([]) } finally { setAllLoading(false) }
  }

  const loadEmployees = async () => {
    setEmpLoading(true)
    try {
      const res  = await fetch(`${BASE}/api/dtr/employees`)
      const data = await res.json()
      setEmployees(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch {} finally { setEmpLoading(false) }
  }

  const loadSettings = async () => {
    try {
      const res  = await fetch(`${BASE}/api/dtr/settings`)
      const data = await res.json()
      const raw  = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      if (raw.length) {
        const parsed = parseSettings(raw)
        setSettings(parsed)
        setGeoEnabled(parsed.geofencing_enabled)
        setOfficeLat(String(parsed.office_latitude))
        setOfficeLng(String(parsed.office_longitude))
        setOfficeRadius(String(parsed.geofence_radius_meters))
      }
    } catch {}
  }

  useEffect(() => { loadEmployees(); loadSettings(); loadAll() }, [])

  const toggleGeo = async () => {
    const next = !geoEnabled
    try {
      await fetch(`${BASE}/api/dtr/settings/toggle-geofencing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      })
      setGeoEnabled(next)
      if (settings) setSettings({ ...settings, geofencing_enabled: next })
    } catch {}
  }

  const saveOffice = async () => {
    const lat = parseFloat(officeLat), lng = parseFloat(officeLng), rad = parseInt(officeRadius)
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) return
    setSaving(true)
    try {
      await fetch(`${BASE}/api/dtr/settings/office`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, radius: rad }),
      })
      if (settings) setSettings({ ...settings, office_latitude: lat, office_longitude: lng, geofence_radius_meters: rad })
    } catch {} finally { setSaving(false) }
  }

  const totalIn         = allRecords.filter(r => r.type === 'in').length
  const totalOut        = allRecords.filter(r => r.type === 'out').length
  const violationsCount = allRecords.filter(r => !r.within_geofence).length

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}>

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 11, color: '#ffffff30', letterSpacing: 2, marginBottom: 4 }}>ADMIN PANEL</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', letterSpacing: -0.5 }}>Geofence Settings</Text>
        <Text style={{ fontSize: 13, color: '#ffffff40', marginTop: 3 }}>Configure office location and view all records</Text>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.duration(400).delay(60)} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Employees',  value: employees.length,  color: '#ffffffcc' },
          { label: 'Check-ins',  value: totalIn,            color: '#34d399' },
          { label: 'Check-outs', value: totalOut,           color: '#ffffff50' },
          { label: 'Violations', value: violationsCount,    color: '#f87171' },
        ].map(({ label, value, color }) => (
          <View key={label} style={{ flex: 1, backgroundColor: '#ffffff08', borderRadius: 12, borderWidth: 1, borderColor: '#ffffff14', padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color }}>{value}</Text>
            <Text style={{ fontSize: 10, color: '#ffffff25', marginTop: 3 }}>{label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Geofencing toggle */}
      <Animated.View entering={FadeInDown.duration(400).delay(120)} style={{ backgroundColor: '#ffffff08', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff14', padding: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffffcc' }}>Geofencing Enforcement</Text>
            <Text style={{ fontSize: 12, color: '#ffffff30', marginTop: 2 }}>Require check-in within office radius</Text>
          </View>
          <TouchableOpacity
            onPress={toggleGeo}
            activeOpacity={0.8}
            style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: geoEnabled ? '#34d399' : '#ffffff18', justifyContent: 'center', paddingHorizontal: 2 }}
          >
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#ffffff', alignSelf: geoEnabled ? 'flex-end' : 'flex-start', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2 }} />
          </TouchableOpacity>
        </View>

        {geoEnabled && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#ffffff0d' }}>
            <Text style={{ fontSize: 11, color: '#ffffff30', letterSpacing: 1.5, marginBottom: 12 }}>OFFICE LOCATION</Text>
            {[
              { label: 'Latitude',       value: officeLat,       onChange: setOfficeLat,    placeholder: '14.5995' },
              { label: 'Longitude',      value: officeLng,       onChange: setOfficeLng,    placeholder: '120.9842' },
              { label: 'Radius (meters)',value: officeRadius,    onChange: setOfficeRadius, placeholder: '100' },
            ].map(({ label, value, onChange, placeholder }) => (
              <View key={label} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 12, color: '#ffffff30', marginBottom: 6 }}>{label}</Text>
                <View style={{ backgroundColor: '#ffffff08', borderWidth: 1, borderColor: '#ffffff14', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={{ fontSize: 13, color: '#ffffffb3', fontFamily: 'monospace' }}>{value || placeholder}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={saveOffice}
              disabled={saving}
              activeOpacity={0.8}
              style={{ backgroundColor: '#ffffff14', borderRadius: 10, paddingVertical: 12, alignItems: 'center', opacity: saving ? 0.5 : 1 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffffcc' }}>{saving ? 'Saving…' : 'Save Location'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* All records */}
      <Animated.View entering={FadeInDown.duration(400).delay(180)} style={{ backgroundColor: '#ffffff08', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff14', overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff0d' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#ffffff50', letterSpacing: 1 }}>ALL TIME RECORDS</Text>
          <TouchableOpacity onPress={loadAll} disabled={allLoading}>
            <RefreshCw size={13} color={allLoading ? '#ffffff20' : '#ffffff30'} />
          </TouchableOpacity>
        </View>

        {allLoading ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#ffffff30" />
          </View>
        ) : allRecords.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#ffffff20' }}>No records yet</Text>
          </View>
        ) : (
          allRecords.slice(0, 50).map(rec => (
            <RecordRow key={rec.id} rec={rec} geofencingEnabled={settings?.geofencing_enabled ?? false} />
          ))
        )}
      </Animated.View>

    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_DtrGeofencing_Admin() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('dtr-geofencing')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AppLayout tatSlug="dtr-geofencing">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AdminScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_DtrGeofencing_Admin
