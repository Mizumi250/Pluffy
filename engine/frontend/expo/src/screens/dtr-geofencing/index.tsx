// ============================================================
// ARKZEN GENERATED SCREEN — dtr-geofencing/index
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
import { fmtDuration, fmtTime, parseSettings } from './components/utils'
import type { Employee } from './components/types'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'
import { LogIn, LogOut, RefreshCw } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const {
    employees, selectedEmployee, myRecords, settings, isLoading,
    locationStatus, currentPosition, distanceToOffice,
    setEmployees, setMyRecords, setSettings, setIsLoading,
  } = useDtrStore()

  const [empLoading,     setEmpLoading]     = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)

  const BASE = process.env.EXPO_PUBLIC_API_URL ?? ''

  const loadEmployees = async () => {
    setEmpLoading(true)
    try {
      const res  = await fetch(`${BASE}/api/dtr/employees`)
      const data = await res.json()
      setEmployees(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch { setEmployees([]) } finally { setEmpLoading(false) }
  }

  const loadSettings = async () => {
    try {
      const res  = await fetch(`${BASE}/api/dtr/settings`)
      const data = await res.json()
      const raw  = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      if (raw.length) setSettings(parseSettings(raw))
    } catch {}
  }

  const loadRecords = async (empId: number) => {
    setRecordsLoading(true)
    try {
      const res  = await fetch(`${BASE}/api/dtr/my-records/${empId}`)
      const data = await res.json()
      setMyRecords(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch { setMyRecords([]) } finally { setRecordsLoading(false) }
  }

  useEffect(() => { loadEmployees(); loadSettings() }, [])
  useEffect(() => { if (selectedEmployee) loadRecords(selectedEmployee.id) }, [selectedEmployee])

  const handleClock = async (type: 'in' | 'out') => {
    if (!selectedEmployee || locationStatus !== 'success' || !currentPosition) return
    setIsLoading(true)
    try {
      const res = await fetch(`${BASE}/api/dtr/check-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          latitude:    currentPosition.lat,
          longitude:   currentPosition.lng,
          notes:       `Check-${type} via app`,
        }),
      })
      const d = await res.json()
      if (!res.ok) { alert(d.message ?? `Check-${type} failed`); return }
      loadRecords(selectedEmployee.id)
    } catch {} finally { setIsLoading(false) }
  }

  const lastIn  = myRecords.filter(r => r.type === 'in').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const lastOut = myRecords.filter(r => r.type === 'out').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const checkedIn = lastIn && (!lastOut || new Date(lastIn.timestamp) > new Date(lastOut.timestamp))
  const isWithin  = currentPosition && settings && distanceToOffice !== null ? distanceToOffice <= settings.geofence_radius_meters : false
  const canClock  = locationStatus === 'success' && !!selectedEmployee && !isLoading

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}>

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 11, color: '#ffffff30', letterSpacing: 2, marginBottom: 4 }}>DAILY TIME RECORD</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', letterSpacing: -0.5 }}>
          {selectedEmployee ? `Hello ${selectedEmployee.name.split(' ')[0]},` : 'Clock In/Out'}
        </Text>
        {checkedIn && lastIn && (
          <Text style={{ fontSize: 13, color: '#ffffff40', marginTop: 3 }}>
            Checked in at {fmtTime(lastIn.timestamp)}
            {settings?.geofencing_enabled ? ` · GPS ${lastIn.within_geofence ? 'verified ✓' : 'outside ✗'}` : ''}
          </Text>
        )}
      </Animated.View>

      {/* Employee select */}
      <Animated.View entering={FadeInDown.duration(400).delay(60)} style={{ backgroundColor: '#ffffff08', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff14', padding: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 11, color: '#ffffff30', letterSpacing: 1.5, marginBottom: 10 }}>EMPLOYEE</Text>
        {empLoading
          ? <View style={{ height: 48, borderRadius: 12, backgroundColor: '#ffffff08' }} />
          : <EmployeeDropdown />
        }
      </Animated.View>

      {/* Location + clock */}
      <Animated.View entering={FadeInDown.duration(400).delay(120)} style={{ backgroundColor: '#ffffff08', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff14', padding: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 14 }}>
          <LocationWidget />
          {settings && (
            <GeofenceBadge
              within={!!(currentPosition && distanceToOffice !== null && distanceToOffice <= settings.geofence_radius_meters)}
              enabled={settings.geofencing_enabled}
            />
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => handleClock('in')}
            disabled={!canClock || !!checkedIn}
            activeOpacity={0.8}
            style={{ flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: (!canClock || !!checkedIn) ? '#ffffff08' : '#34d399' }}
          >
            {isLoading ? <ActivityIndicator size="small" color="#ffffff80" /> : (
              <>
                <LogIn size={15} color={(!canClock || !!checkedIn) ? '#ffffff20' : '#ffffff'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: (!canClock || !!checkedIn) ? '#ffffff20' : '#ffffff' }}>Check In</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleClock('out')}
            disabled={!canClock || !checkedIn}
            activeOpacity={0.8}
            style={{ flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: (!canClock || !checkedIn) ? '#ffffff08' : '#ffffff14' }}
          >
            {isLoading ? <ActivityIndicator size="small" color="#ffffff80" /> : (
              <>
                <LogOut size={15} color={(!canClock || !checkedIn) ? '#ffffff20' : '#ffffffcc'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: (!canClock || !checkedIn) ? '#ffffff20' : '#ffffffcc' }}>Check Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Map */}
      <Animated.View entering={FadeInDown.duration(400).delay(180)}>
        <GeofenceMapView />
      </Animated.View>

      {/* Summary */}
      {lastIn && (
        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          {[
            { label: 'Time In',   value: fmtTime(lastIn.timestamp) },
            { label: 'Time Out',  value: lastOut ? fmtTime(lastOut.timestamp) : '—' },
            { label: 'Duration',  value: lastOut ? fmtDuration(lastIn.timestamp, lastOut.timestamp) : 'Active' },
          ].map(({ label, value }) => (
            <View key={label} style={{ flex: 1, backgroundColor: '#ffffff08', borderRadius: 12, borderWidth: 1, borderColor: '#ffffff14', padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#ffffff30', marginBottom: 4 }}>{label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffffcc', fontFamily: 'monospace' }}>{value}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Recent records */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)} style={{ backgroundColor: '#ffffff08', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff14', overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff0d' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#ffffff50', letterSpacing: 1 }}>RECENT ENTRIES</Text>
          <TouchableOpacity onPress={() => selectedEmployee && loadRecords(selectedEmployee.id)} disabled={recordsLoading}>
            <RefreshCw size={13} color={recordsLoading ? '#ffffff20' : '#ffffff30'} />
          </TouchableOpacity>
        </View>

        {recordsLoading ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#ffffff30" />
          </View>
        ) : myRecords.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#ffffff20' }}>
              {selectedEmployee ? 'No records yet' : 'Select an employee'}
            </Text>
          </View>
        ) : (
          myRecords.slice(0, 8).map(r => (
            <RecordRow key={r.id} rec={r} geofencingEnabled={settings?.geofencing_enabled ?? false} />
          ))
        )}
      </Animated.View>

    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_DtrGeofencing_Index() {
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
        <IndexScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_DtrGeofencing_Index
