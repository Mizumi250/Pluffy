'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — dtr-geofencing
// Source: @arkzen:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:34.822Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'
import { create } from 'zustand'

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
