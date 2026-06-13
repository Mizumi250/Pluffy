// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — LocationWidget [Expo]
// Source: @arkzen:native:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T14:30:29.951Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { AlertCircle, CheckCircle, ChevronDown, LogIn, LogOut, MapPin, Navigation, RefreshCw, XCircle } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'
import { useDtrStore } from './hooks'
import { calcDistance } from './utils'
import { GeofenceMapView } from './GeofenceMapView'

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
