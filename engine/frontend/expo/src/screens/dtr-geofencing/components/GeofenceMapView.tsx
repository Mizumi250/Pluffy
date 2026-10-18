// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GeofenceMapView [Expo]
// Source: @arkzen:native:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:08.571Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { usePathname, useRouter } from 'expo-router'
import { AlertCircle, CalendarClock, CheckCircle, ChevronDown, LogIn, LogOut, MapPin, Navigation, RefreshCw, Settings, XCircle } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { create } from 'zustand'
import { useDtrStore } from './hooks'
import { RecordRow } from './RecordRow'

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
