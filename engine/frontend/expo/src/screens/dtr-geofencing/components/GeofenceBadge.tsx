// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GeofenceBadge [Expo]
// Source: @arkzen:native:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:31:15.394Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { AlertCircle, CheckCircle, ChevronDown, LogIn, LogOut, MapPin, Navigation, RefreshCw, XCircle } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'
import { EmployeeDropdown } from './EmployeeDropdown'

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
