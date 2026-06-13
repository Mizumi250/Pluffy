// ============================================================
// ARKZEN GENERATED COMPONENT — LocationWidget [React+Vite]
// Source: @arkzen:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T13:54:24.323Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'
import { create } from 'zustand'
import { useDtrStore } from './hooks'
import { calcDistance, requestLocation, within } from './utils'

export const LocationWidget = () => {
  const { locationStatus, currentPosition, settings, distanceToOffice, setLocationStatus, setCurrentPosition, setDistanceToOffice } = useDtrStore()

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return }
    setLocationStatus('fetching')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCurrentPosition({ lat: latitude, lng: longitude })
        if (settings) setDistanceToOffice(calcDistance(latitude, longitude, settings.office_latitude, settings.office_longitude))
        setLocationStatus('success')
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [settings])

  if (locationStatus === 'idle') return (
    <button onClick={requestLocation} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors py-2">
      <MapPin size={14} /> Tap to get location
    </button>
  )
  if (locationStatus === 'fetching') return (
    <span className="flex items-center gap-2 text-sm text-white/40"><Loader2 size={13} className="animate-spin" /> Locating…</span>
  )
  if (locationStatus === 'denied') return (
    <span className="flex items-center gap-2 text-sm text-rose-400/80"><AlertCircle size={13} /> Location denied</span>
  )
  if (currentPosition) {
    const within = distanceToOffice !== null && settings ? distanceToOffice <= settings.geofence_radius_meters : false
    return (
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
          <CheckCircle size={11} /> {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
        </span>
        {settings?.geofencing_enabled && distanceToOffice !== null && (
          <span className={`text-xs font-mono flex items-center gap-1 ${within ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
            <Navigation size={10} /> {Math.round(distanceToOffice)}m from office
          </span>
        )}
      </div>
    )
  }
  return null
}
