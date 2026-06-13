// ============================================================
// ARKZEN GENERATED NATIVE HOOKS — dtr-geofencing [Expo]
// Source: @arkzen:native:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T10:20:28.650Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { AlertCircle, CheckCircle, ChevronDown, LogIn, LogOut, MapPin, Navigation, RefreshCw, XCircle } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'
import type { DtrStore } from './types'

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
