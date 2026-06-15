// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — dtr-geofencing [Expo]
// Source: @arkzen:native:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:17:29.573Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { AlertCircle, CheckCircle, ChevronDown, LogIn, LogOut, MapPin, Navigation, RefreshCw, XCircle } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'
import type { DtrSettings } from './types'

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
