// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — dtr-geofencing
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-24T15:02:00.709Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'
import { create } from 'zustand'

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

export const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
export const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const fmtDuration = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return `${Math.floor(ms/3600000)}h ${Math.floor((ms%3600000)/60000)}m`
}

export const parseSettings = (raw: { key: string; value: string }[]): DtrSettings => ({
  geofencing_enabled:   raw.find(s => s.key === 'geofencing_enabled')?.value === 'true',
  office_latitude:      parseFloat(raw.find(s => s.key === 'office_latitude')?.value ?? '0'),
  office_longitude:     parseFloat(raw.find(s => s.key === 'office_longitude')?.value ?? '0'),
  geofence_radius_meters: parseInt(raw.find(s => s.key === 'geofence_radius_meters')?.value ?? '100'),
})

export const GeofenceBadge = ({ within, enabled }: { within: boolean; enabled: boolean }) => {
  if (!enabled) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-white/30 bg-white/[0.04] px-2 py-1 rounded-full">
      <AlertCircle size={10} /> geofence off
    </span>
  )
  return within ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
      <CheckCircle size={10} /> within range
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full">
      <XCircle size={10} /> outside range
    </span>
  )
}

export const EmployeeDropdown = () => {
  const { employees, selectedEmployee, setSelectedEmployee } = useDtrStore()
  const [open, setOpen] = useState(false)

  if (!employees.length) return (
    <div className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
  )
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.07] transition-all"
      >
        <div className="flex items-center gap-3">
          {selectedEmployee?.avatar
            ? <img src={selectedEmployee.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10" />
            : <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><UserIcon size={13} className="text-white/40" /></div>
          }
          <span className="text-sm font-medium text-white/80">
            {selectedEmployee?.name ?? 'Select employee'}
          </span>
        </div>
        <ChevronDown size={14} className={`text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#161616] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => { setSelectedEmployee(emp); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-all text-left"
            >
              {emp.avatar
                ? <img src={emp.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                : <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><UserIcon size={13} className="text-white/40" /></div>
              }
              <div>
                <div className="text-sm font-medium text-white/80">{emp.name}</div>
                <div className="text-xs text-white/30">{emp.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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

export const RecordRow = ({ rec, geofencingEnabled }: { rec: TimeRecord; geofencingEnabled: boolean }) => (
  <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${rec.type === 'in' ? 'bg-emerald-400/10' : 'bg-white/[0.05]'}`}>
      {rec.type === 'in'
        ? <LogIn size={13} className="text-emerald-400" />
        : <LogOut size={13} className="text-white/40" />
      }
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide ${rec.type === 'in' ? 'text-emerald-400' : 'text-white/40'}`}>{rec.type}</span>
        <span className="text-sm text-white/70">{fmtTime(rec.timestamp)}</span>
        {geofencingEnabled && (
          rec.within_geofence
            ? <span className="text-emerald-400/60 text-xs">✓</span>
            : <span className="text-rose-400/60 text-xs">✗</span>
        )}
      </div>
      <span className="text-xs text-white/25 font-mono">{fmtDate(rec.timestamp)}</span>
    </div>
  </div>
)

export const Skeleton = () => (
  <div className="animate-pulse flex items-center gap-3 px-4 py-3">
    <div className="w-7 h-7 rounded-full bg-white/[0.05]" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-white/[0.05] rounded w-2/3" />
      <div className="h-2.5 bg-white/[0.04] rounded w-1/3" />
    </div>
  </div>
)


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
