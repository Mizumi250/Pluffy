// ============================================================
// ARKZEN GENERATED COMPONENT — GeofenceMap [React+Vite]
// Source: @arkzen:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T03:23:48.721Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'
import { create } from 'zustand'
import { useDtrStore } from './hooks'
import { avatarUrl, bounds, init, leafletMapRef, map, mapRef, officeIcon, userIcon, within } from './utils'

export const GeofenceMap = () => {
  const { currentPosition, settings, selectedEmployee, distanceToOffice } = useDtrStore()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)

  useEffect(() => {
    if (!currentPosition || !settings || !mapRef.current) return
    if (typeof window === 'undefined') return

    const init = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css' as any)

      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }

      const map = L.map(mapRef.current!, {
        center: [currentPosition.lat, currentPosition.lng],
        zoom: 17,
        zoomControl: true,
        attributionControl: false,
      })
      leafletMapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)

      const within = distanceToOffice !== null && distanceToOffice <= settings.geofence_radius_meters

      L.circle(
        [settings.office_latitude, settings.office_longitude],
        {
          radius: settings.geofence_radius_meters,
          color: within ? '#34d399' : '#f87171',
          fillColor: within ? '#34d399' : '#f87171',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4 4',
        }
      ).addTo(map)

      const officeIcon = L.divIcon({
        html: `<div style="width:38px;height:38px;border-radius:50%;background:#1a1a1a;border:2px solid #34d399;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 4px rgba(52,211,153,0.15);font-size:16px;">🏢</div>`,
        className: '',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      })
      L.marker([settings.office_latitude, settings.office_longitude], { icon: officeIcon })
        .addTo(map)
        .bindPopup(`<div style="font-family:monospace;font-size:12px;color:#fff;background:#111;padding:6px 10px;border-radius:8px;border:1px solid #333"><strong>Office</strong><br/>${settings.office_latitude.toFixed(5)}, ${settings.office_longitude.toFixed(5)}<br/>Radius: ${settings.geofence_radius_meters}m</div>`)

      const avatarUrl = selectedEmployee?.avatar ?? null
      const userIcon = L.divIcon({
        html: `<div style="width:42px;height:42px;border-radius:50%;background:#1a1a1a;border:2.5px solid ${within ? '#34d399' : '#f87171'};box-shadow:0 0 0 4px ${within ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'};overflow:hidden;display:flex;align-items:center;justify-content:center;">${avatarUrl ? `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` : `<span style="font-size:18px;">👤</span>`}</div>`,
        className: '',
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      })
      L.marker([currentPosition.lat, currentPosition.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<div style="font-family:monospace;font-size:12px;color:#fff;background:#111;padding:6px 10px;border-radius:8px;border:1px solid #333"><strong>${selectedEmployee?.name ?? 'You'}</strong><br/>${currentPosition.lat.toFixed(5)}, ${currentPosition.lng.toFixed(5)}<br/>${distanceToOffice !== null ? Math.round(distanceToOffice) + 'm from office' : ''}</div>`)

      const bounds = L.latLngBounds(
        [currentPosition.lat, currentPosition.lng],
        [settings.office_latitude, settings.office_longitude]
      )
      map.fitBounds(bounds.pad(0.3))
    }

    init().catch(console.error)

    return () => { leafletMapRef.current?.remove(); leafletMapRef.current = null }
  }, [currentPosition, settings, selectedEmployee])

  if (!currentPosition || !settings) return null

  return (
    <div className="dtr-map rounded-2xl overflow-hidden border border-white/[0.06]" style={{ height: 260 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
