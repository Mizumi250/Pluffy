// ============================================================
// ARKZEN GENERATED SCREEN — dtr-geofencing/index
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { AlertCircle, CheckCircle, ChevronDown, LogIn, LogOut, MapPin, Navigation, RefreshCw, XCircle } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { create } from 'zustand'
import { AppLayout } from '../../../arkzen/core/layouts/custom/dtr-geofencing-app'
import { usePageFadeIn } from '../../arkzen/generated/dtr-geofencing.native-animations'
import { s } from '../../arkzen/generated/dtr-geofencing.native-styles'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
// ── Types ────────────────────────────────────────────────────

export interface Employee {
  id: number
  name: string
  email: string
  avatar: string | null
  is_active: boolean
}

export interface TimeRecord {
  id: number
  employee_id: number
  type: 'in' | 'out'
  timestamp: string
  latitude: number | null
  longitude: number | null
  within_geofence: boolean
  notes: string | null
  employee?: Employee
}

export interface DtrSettings {
  geofencing_enabled: boolean
  office_latitude: number
  office_longitude: number
  geofence_radius_meters: number
}

// ── Store ────────────────────────────────────────────────────

interface DtrStore {
  employees: Employee[]
  selectedEmployee: Employee | null
  myRecords: TimeRecord[]
  settings: DtrSettings | null
  isLoading: boolean
  locationStatus: 'idle' | 'fetching' | 'success' | 'denied'
  currentPosition: { lat: number; lng: number } | null
  distanceToOffice: number | null
  setEmployees: (e: Employee[]) => void
  setSelectedEmployee: (e: Employee | null) => void
  setMyRecords: (r: TimeRecord[]) => void
  setSettings: (s: DtrSettings) => void
  setIsLoading: (v: boolean) => void
  setLocationStatus: (s: DtrStore['locationStatus']) => void
  setCurrentPosition: (p: { lat: number; lng: number } | null) => void
  setDistanceToOffice: (d: number | null) => void
}

export const useDtrStore = create<DtrStore>((set) => ({
  employees: [],
  selectedEmployee: null,
  myRecords: [],
  settings: null,
  isLoading: false,
  locationStatus: 'idle',
  currentPosition: null,
  distanceToOffice: null,
  setEmployees: (employees) => set({ employees }),
  setSelectedEmployee: (selectedEmployee) => set({ selectedEmployee }),
  setMyRecords: (myRecords) => set({ myRecords }),
  setSettings: (settings) => set({ settings }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setLocationStatus: (locationStatus) => set({ locationStatus }),
  setCurrentPosition: (currentPosition) => set({ currentPosition }),
  setDistanceToOffice: (distanceToOffice) => set({ distanceToOffice }),
}))

// ── Utils ────────────────────────────────────────────────────

export const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const fmtDuration = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
}

export const parseSettings = (raw: { key: string; value: string }[]): DtrSettings => ({
  geofencing_enabled:     raw.find(s => s.key === 'geofencing_enabled')?.value === 'true',
  office_latitude:        parseFloat(raw.find(s => s.key === 'office_latitude')?.value ?? '0'),
  office_longitude:       parseFloat(raw.find(s => s.key === 'office_longitude')?.value ?? '0'),
  geofence_radius_meters: parseInt(raw.find(s => s.key === 'geofence_radius_meters')?.value ?? '100'),
})

// ── GeofenceBadge ────────────────────────────────────────────

export const GeofenceBadge = ({ within, enabled }: { within: boolean; enabled: boolean }) => {
  if (!enabled) return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#ffffff08' }}>
      <AlertCircle size={10} color="#ffffff30" />
      <Text style={{ fontSize: 11, color: '#ffffff30', fontWeight: '600' }}>geofence off</Text>
    </View>
  )
  return within ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#34d39910' }}>
      <CheckCircle size={10} color="#34d399" />
      <Text style={{ fontSize: 11, color: '#34d399', fontWeight: '600' }}>within range</Text>
    </View>
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#f8717110' }}>
      <XCircle size={10} color="#f87171" />
      <Text style={{ fontSize: 11, color: '#f87171', fontWeight: '600' }}>outside range</Text>
    </View>
  )
}

// ── EmployeeDropdown ─────────────────────────────────────────

export const EmployeeDropdown = () => {
  const { employees, selectedEmployee, setSelectedEmployee } = useDtrStore()
  const [open, setOpen] = useState(false)

  if (!employees.length) return (
    <View style={{ height: 48, borderRadius: 12, backgroundColor: '#ffffff08' }} />
  )

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff08', borderRadius: 12, borderWidth: 1, borderColor: '#ffffff14' }}
      >
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#ffffffcc' }}>
          {selectedEmployee?.name ?? 'Select employee'}
        </Text>
        <ChevronDown size={14} color="#ffffff30" />
      </TouchableOpacity>

      {open && (
        <View style={{ marginTop: 6, backgroundColor: '#161616', borderRadius: 12, borderWidth: 1, borderColor: '#ffffff14', overflow: 'hidden' }}>
          {employees.map(emp => (
            <TouchableOpacity
              key={emp.id}
              onPress={() => { setSelectedEmployee(emp); setOpen(false) }}
              activeOpacity={0.8}
              style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#ffffffcc' }}>{emp.name}</Text>
              <Text style={{ fontSize: 12, color: '#ffffff30', marginTop: 2 }}>{emp.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// ── LocationWidget ───────────────────────────────────────────

export const LocationWidget = () => {
  const { locationStatus, currentPosition, settings, distanceToOffice,
    setLocationStatus, setCurrentPosition, setDistanceToOffice } = useDtrStore()

  const requestLocation = useCallback(async () => {
    setLocationStatus('fetching')
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') { setLocationStatus('denied'); return }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    const { latitude, longitude } = loc.coords
    setCurrentPosition({ lat: latitude, lng: longitude })
    if (settings) setDistanceToOffice(calcDistance(latitude, longitude, settings.office_latitude, settings.office_longitude))
    setLocationStatus('success')
  }, [settings])

  if (locationStatus === 'idle') return (
    <TouchableOpacity onPress={requestLocation} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}>
      <MapPin size={14} color="#ffffff50" />
      <Text style={{ fontSize: 13, color: '#ffffff50' }}>Tap to get location</Text>
    </TouchableOpacity>
  )
  if (locationStatus === 'fetching') return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <ActivityIndicator size="small" color="#ffffff40" />
      <Text style={{ fontSize: 13, color: '#ffffff40' }}>Locating…</Text>
    </View>
  )
  if (locationStatus === 'denied') return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <AlertCircle size={13} color="#f87171" />
      <Text style={{ fontSize: 13, color: '#f87171' }}>Location denied</Text>
    </View>
  )
  if (currentPosition) {
    const within = distanceToOffice !== null && settings
      ? distanceToOffice <= settings.geofence_radius_meters : false
    return (
      <View style={{ gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <CheckCircle size={11} color="#34d399" />
          <Text style={{ fontSize: 11, color: '#34d399', fontFamily: 'monospace' }}>
            {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
          </Text>
        </View>
        {settings?.geofencing_enabled && distanceToOffice !== null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Navigation size={10} color={within ? '#34d39970' : '#f8717170'} />
            <Text style={{ fontSize: 11, color: within ? '#34d39970' : '#f8717170', fontFamily: 'monospace' }}>
              {Math.round(distanceToOffice)}m from office
            </Text>
          </View>
        )}
      </View>
    )
  }
  return null
}

// ── GeofenceMap ──────────────────────────────────────────────

// ── GeofenceMapView — replaced with coordinate card (expo-maps not available in Expo Go) ──

export const GeofenceMapView = () => {
  const { currentPosition, settings, distanceToOffice } = useDtrStore()

  if (!currentPosition || !settings) return null

  const within = distanceToOffice !== null
    ? distanceToOffice <= settings.geofence_radius_meters
    : false

  const color = within ? '#34d399' : '#f87171'

  return (
    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#ffffff14', marginBottom: 12, backgroundColor: '#ffffff08', padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <MapPin size={13} color="#ffffff30" />
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#ffffff30', letterSpacing: 1 }}>LOCATION INFO</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Your position */}
        <View style={{ flex: 1, backgroundColor: '#ffffff08', borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 10, color: '#ffffff30', marginBottom: 6 }}>YOUR POSITION</Text>
          <Text style={{ fontSize: 11, color: '#ffffffb3', fontFamily: 'monospace' }}>
            {currentPosition.lat.toFixed(5)}
          </Text>
          <Text style={{ fontSize: 11, color: '#ffffffb3', fontFamily: 'monospace' }}>
            {currentPosition.lng.toFixed(5)}
          </Text>
        </View>

        {/* Office position */}
        <View style={{ flex: 1, backgroundColor: '#ffffff08', borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 10, color: '#ffffff30', marginBottom: 6 }}>OFFICE</Text>
          <Text style={{ fontSize: 11, color: '#ffffffb3', fontFamily: 'monospace' }}>
            {settings.office_latitude.toFixed(5)}
          </Text>
          <Text style={{ fontSize: 11, color: '#ffffffb3', fontFamily: 'monospace' }}>
            {settings.office_longitude.toFixed(5)}
          </Text>
        </View>
      </View>

      {/* Distance bar */}
      {distanceToOffice !== null && (
        <View style={{ marginTop: 12, backgroundColor: '#ffffff08', borderRadius: 12, padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Navigation size={11} color={color} />
              <Text style={{ fontSize: 12, color, fontWeight: '600' }}>
                {Math.round(distanceToOffice)}m from office
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#ffffff30', fontFamily: 'monospace' }}>
              radius: {settings.geofence_radius_meters}m
            </Text>
          </View>
          {/* Progress bar */}
          <View style={{ height: 4, backgroundColor: '#ffffff10', borderRadius: 2, overflow: 'hidden' }}>
            <View style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: color,
              width: `${Math.min(100, (distanceToOffice / settings.geofence_radius_meters) * 100)}%` as any,
            }} />
          </View>
        </View>
      )}
    </View>
  )
}

// ── RecordRow ────────────────────────────────────────────────

export const RecordRow = ({ rec, geofencingEnabled }: { rec: TimeRecord; geofencingEnabled: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff05' }}>
    <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: rec.type === 'in' ? '#34d39910' : '#ffffff08' }}>
      {rec.type === 'in'
        ? <LogIn size={13} color="#34d399" />
        : <LogOut size={13} color="#ffffff40" />
      }
    </View>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: rec.type === 'in' ? '#34d399' : '#ffffff40', letterSpacing: 0.5 }}>
          {rec.type.toUpperCase()}
        </Text>
        <Text style={{ fontSize: 14, color: '#ffffffb3' }}>{fmtTime(rec.timestamp)}</Text>
        {geofencingEnabled && (
          <Text style={{ fontSize: 11, color: rec.within_geofence ? '#34d39960' : '#f8717160' }}>
            {rec.within_geofence ? '✓' : '✗'}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: 11, color: '#ffffff25', fontFamily: 'monospace' }}>{fmtDate(rec.timestamp)}</Text>
    </View>
  </View>
)

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
