/* @arkzen:meta
name: dtr-geofencing
version: 2.0.0
auth: false
*/

/* @arkzen:meta:web
label: DTR Geofencing
title: DTR Geofencing
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: 2xl
  backdrop: blur
  animation: fadeScale
layout:
  guest:
    className: "min-h-screen bg-[#0a0a0a]"
*/

/* @arkzen:database:employees
table: employees
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 255
    nullable: false
  email:
    type: string
    length: 255
    unique: true
    nullable: false
  avatar:
    type: string
    length: 500
    nullable: true
  is_active:
    type: boolean
    default: true
seeder:
  count: 3
  data:
    - name: "Alex Rivera"
      email: "alex@example.com"
      avatar: "https://i.pravatar.cc/150?img=1"
      is_active: true
    - name: "Jamie Chen"
      email: "jamie@example.com"
      avatar: "https://i.pravatar.cc/150?img=5"
      is_active: true
    - name: "Taylor Smith"
      email: "taylor@example.com"
      avatar: "https://i.pravatar.cc/150?img=8"
      is_active: true
*/

/* @arkzen:database:time_records
table: time_records
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  employee_id:
    type: foreignId
    foreign: employees.id
    nullable: false
  type:
    type: string
    length: 10
    nullable: false
  timestamp:
    type: datetime
    nullable: false
  latitude:
    type: decimal
    precision: 10
    scale: 8
    nullable: true
  longitude:
    type: decimal
    precision: 11
    scale: 8
    nullable: true
  within_geofence:
    type: boolean
    default: false
  notes:
    type: text
    nullable: true
*/

/* @arkzen:database:dtr_settings
table: dtr_settings
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  key:
    type: string
    length: 255
    unique: true
    nullable: false
  value:
    type: text
    nullable: true
seeder:
  count: 4
  data:
    - key: "geofencing_enabled"
      value: "true"
    - key: "office_latitude"
      value: "14.599512"
    - key: "office_longitude"
      value: "120.984219"
    - key: "geofence_radius_meters"
      value: "100"
*/

/* @arkzen:api:employees
model: Employee
controller: EmployeeController
prefix: /api/dtr
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /employees
    description: Get all employees
    response:
      type: collection

  show:
    method: GET
    route: /employees/{id}
    description: Get single employee
    response:
      type: single
*/

/* @arkzen:api:time_records
model: TimeRecord
controller: TimeRecordController
prefix: /api/dtr
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /records
    description: Get all time records with employee
    response:
      type: collection

  my_records:
    method: GET
    route: /my-records/{employee_id}
    description: Get records for a specific employee
    response:
      type: collection

  check_in:
    method: POST
    route: /check-in
    description: Record a check-in
    validation:
      employee_id: required|integer|exists:employees,id
      latitude: nullable|numeric
      longitude: nullable|numeric
      notes: nullable|string
    response:
      type: single

  check_out:
    method: POST
    route: /check-out
    description: Record a check-out
    validation:
      employee_id: required|integer|exists:employees,id
      latitude: nullable|numeric
      longitude: nullable|numeric
      notes: nullable|string
    response:
      type: single
*/

/* @arkzen:api:dtr_settings
model: DtrSetting
controller: DtrSettingController
prefix: /api/dtr
middleware: []
resource: false
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /settings
    description: Get all settings
    response:
      type: collection

  toggle_geofencing:
    method: POST
    route: /settings/toggle-geofencing
    description: Toggle geofencing on/off
    response:
      type: single

  update_office:
    method: POST
    route: /settings/office
    description: Update office location
    response:
      type: single
*/

/* @arkzen:endpoint:my_records
*/
$employeeId = $request->route('employee_id');
$records = \App\Models\Arkzen\DtrGeofencing\TimeRecord::where('employee_id', $employeeId)
    ->with('employee')
    ->orderByDesc('timestamp')
    ->limit(50)
    ->get();
return response()->json($records);
/* @arkzen:endpoint:my_records:end */

/* @arkzen:endpoint:check_in
*/
$employeeId = $request->input('employee_id');
$latitude   = $request->input('latitude');
$longitude  = $request->input('longitude');
$notes      = $request->input('notes');

$geofencingEnabled = \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'geofencing_enabled')->value('value') === 'true';
$withinGeofence = true;
$reject = false;

if ($geofencingEnabled && $latitude !== null && $longitude !== null) {
    $officeLat = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'office_latitude')->value('value');
    $officeLng = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'office_longitude')->value('value');
    $radius    = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'geofence_radius_meters')->value('value');

    $earthRadius = 6371000;
    $lat1 = deg2rad($officeLat); $lon1 = deg2rad($officeLng);
    $lat2 = deg2rad($latitude);  $lon2 = deg2rad($longitude);
    $dlat = $lat2 - $lat1; $dlon = $lon2 - $lon1;
    $a = sin($dlat/2)**2 + cos($lat1) * cos($lat2) * sin($dlon/2)**2;
    $distance = $earthRadius * 2 * atan2(sqrt($a), sqrt(1-$a));

    $withinGeofence = $distance <= $radius;
    if (!$withinGeofence) {
        return response()->json([
            'error' => 'Geofence violation',
            'message' => 'You must be within ' . $radius . ' meters of the office to check in.',
            'distance' => round($distance, 1),
        ], 403);
    }
}

$record = \App\Models\Arkzen\DtrGeofencing\TimeRecord::create([
    'employee_id'     => $employeeId,
    'type'            => 'in',
    'timestamp'       => now(),
    'latitude'        => $latitude,
    'longitude'       => $longitude,
    'within_geofence' => $withinGeofence,
    'notes'           => $notes,
]);

return response()->json([
    'success'             => true,
    'record'              => $record->load('employee'),
    'within_geofence'     => $withinGeofence,
    'geofencing_enabled'  => $geofencingEnabled,
]);
/* @arkzen:endpoint:check_in:end */

/* @arkzen:endpoint:check_out
*/
$employeeId = $request->input('employee_id');
$latitude   = $request->input('latitude');
$longitude  = $request->input('longitude');
$notes      = $request->input('notes');

$geofencingEnabled = \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'geofencing_enabled')->value('value') === 'true';
$withinGeofence = true;

if ($geofencingEnabled && $latitude !== null && $longitude !== null) {
    $officeLat = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'office_latitude')->value('value');
    $officeLng = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'office_longitude')->value('value');
    $radius    = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'geofence_radius_meters')->value('value');

    $earthRadius = 6371000;
    $lat1 = deg2rad($officeLat); $lon1 = deg2rad($officeLng);
    $lat2 = deg2rad($latitude);  $lon2 = deg2rad($longitude);
    $dlat = $lat2 - $lat1; $dlon = $lon2 - $lon1;
    $a = sin($dlat/2)**2 + cos($lat1) * cos($lat2) * sin($dlon/2)**2;
    $distance = $earthRadius * 2 * atan2(sqrt($a), sqrt(1-$a));

    $withinGeofence = $distance <= $radius;
    if (!$withinGeofence) {
        return response()->json([
            'error' => 'Geofence violation',
            'message' => 'You must be within ' . $radius . ' meters of the office to check out.',
            'distance' => round($distance, 1),
        ], 403);
    }
}

$record = \App\Models\Arkzen\DtrGeofencing\TimeRecord::create([
    'employee_id'     => $employeeId,
    'type'            => 'out',
    'timestamp'       => now(),
    'latitude'        => $latitude,
    'longitude'       => $longitude,
    'within_geofence' => $withinGeofence,
    'notes'           => $notes,
]);

return response()->json([
    'success'            => true,
    'record'             => $record->load('employee'),
    'within_geofence'    => $withinGeofence,
    'geofencing_enabled' => $geofencingEnabled,
]);
/* @arkzen:endpoint:check_out:end */

/* @arkzen:endpoint:toggle_geofencing
*/
$enabled = $request->input('enabled');
\App\Models\Arkzen\DtrGeofencing\DtrSetting::updateOrCreate(
    ['key' => 'geofencing_enabled'],
    ['value' => $enabled ? 'true' : 'false']
);
return response()->json(['success' => true, 'geofencing_enabled' => $enabled]);
/* @arkzen:endpoint:toggle_geofencing:end */

/* @arkzen:endpoint:update_office
*/
$lat    = $request->input('lat');
$lng    = $request->input('lng');
$radius = $request->input('radius');
\App\Models\Arkzen\DtrGeofencing\DtrSetting::updateOrCreate(['key' => 'office_latitude'],           ['value' => (string) $lat]);
\App\Models\Arkzen\DtrGeofencing\DtrSetting::updateOrCreate(['key' => 'office_longitude'],          ['value' => (string) $lng]);
\App\Models\Arkzen\DtrGeofencing\DtrSetting::updateOrCreate(['key' => 'geofence_radius_meters'],    ['value' => (string) $radius]);
return response()->json(['success' => true]);
/* @arkzen:endpoint:update_office:end */

/* @arkzen:web:layout:app */

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarClock, LayoutDashboard, Settings, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/dtr-geofencing',       label: 'Clock In/Out', icon: CalendarClock },
  { href: '/dtr-geofencing/admin', label: 'Admin',        icon: Settings },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <CalendarClock size={14} className="text-white/70" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90">DTR · Geofence</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === href
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {open ? <X size={18} className="text-white/60" /> : <Menu size={18} className="text-white/60" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="absolute top-14 left-0 w-full bg-[#111] border-b border-white/[0.06] p-3 space-y-1" onClick={e => e.stopPropagation()}>
            {NAV.map(({ href, label, icon: Icon }) => (
              <button
                key={href}
                onClick={() => { router.push(href); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-5 py-7">{children}</main>
    </div>
  )
}

/* @arkzen:web:layout:app:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { create } from 'zustand'
import {
  MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw,
  User as UserIcon, Clock, Loader2, Navigation, TrendingUp,
  ChevronDown, LogIn, LogOut
} from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

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

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:app */

const IndexPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  useEffect(() => { const c = dtrGeofencingAnimations(pageRef); return c }, [])

  const {
    employees, selectedEmployee, myRecords, settings, isLoading,
    locationStatus, currentPosition, distanceToOffice,
    setEmployees, setMyRecords, setSettings, setIsLoading,
  } = useDtrStore()

  const [empLoading,      setEmpLoading]      = useState(true)
  const [recordsLoading,  setRecordsLoading]  = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)

  const loadEmployees = async () => {
    setEmpLoading(true)
    try {
      const res  = await arkzenFetch('/api/dtr/employees')
      const data = await res.json()
      setEmployees(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch { setEmployees([]) } finally { setEmpLoading(false) }
  }

  const loadSettings = async () => {
    setSettingsLoading(true)
    try {
      const res  = await arkzenFetch('/api/dtr/settings')
      const data = await res.json()
      const raw  = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      if (raw.length) setSettings(parseSettings(raw))
    } catch {} finally { setSettingsLoading(false) }
  }

  const loadRecords = async (empId: number) => {
    setRecordsLoading(true)
    try {
      const res  = await arkzenFetch(`/api/dtr/my-records/${empId}`)
      const data = await res.json()
      setMyRecords(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch { setMyRecords([]) } finally { setRecordsLoading(false) }
  }

  useEffect(() => { loadEmployees(); loadSettings() }, [])
  useEffect(() => { if (selectedEmployee) loadRecords(selectedEmployee.id) }, [selectedEmployee])

  const handleClock = async (type: 'in' | 'out') => {
    if (!selectedEmployee) return
    if (locationStatus !== 'success' || !currentPosition) return
    setIsLoading(true)
    try {
      const res = await arkzenFetch(`/api/dtr/check-${type}`, {
        method: 'POST',
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          latitude:    currentPosition.lat,
          longitude:   currentPosition.lng,
          notes:       `Check-${type} via app`,
        }),
      })
      const d = await res.json()
      if (!res.ok) { alert(d.message ?? `Check-${type} failed`); return }
      if (selectedEmployee) loadRecords(selectedEmployee.id)
    } catch {} finally { setIsLoading(false) }
  }

  const lastIn  = myRecords.filter(r => r.type === 'in').sort((a,b)  => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const lastOut = myRecords.filter(r => r.type === 'out').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const checkedIn = lastIn && (!lastOut || new Date(lastIn.timestamp) > new Date(lastOut.timestamp))
  const isWithin  = currentPosition && settings && distanceToOffice !== null ? distanceToOffice <= settings.geofence_radius_meters : false
  const canClock  = locationStatus === 'success' && !!selectedEmployee && !isLoading

  return (
    <div ref={pageRef} className="max-w-lg mx-auto space-y-4">

      {/* Header */}
      <div className="dtr-header">
        <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">Daily Time Record</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {selectedEmployee ? `Hello ${selectedEmployee.name.split(' ')[0]},` : 'Clock In/Out'}
        </h1>
        {checkedIn && lastIn && (
          <p className="text-sm text-white/40 mt-0.5">
            Checked in at {fmtTime(lastIn.timestamp)}
            {settings?.geofencing_enabled ? ` · GPS ${lastIn.within_geofence ? 'verified ✓' : 'outside ✗'}` : ''}
          </p>
        )}
      </div>

      {/* Employee select */}
      <div className="dtr-select bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
        <label className="text-xs font-mono text-white/30 uppercase tracking-wider block mb-2.5">Employee</label>
        {empLoading ? <div className="h-11 rounded-xl bg-white/[0.04] animate-pulse" /> : <EmployeeDropdown />}
      </div>

      {/* Location + clock actions */}
      <div className="dtr-clock bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <LocationWidget />
          {settings && (
            <GeofenceBadge
              within={!!(currentPosition && distanceToOffice !== null && distanceToOffice <= settings.geofence_radius_meters)}
              enabled={settings.geofencing_enabled}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleClock('in')}
            disabled={!canClock || !!checkedIn}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all
              bg-emerald-500 hover:bg-emerald-400 text-white
              disabled:bg-white/[0.05] disabled:text-white/20 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><LogIn size={15} /> Check In</>}
          </button>
          <button
            onClick={() => handleClock('out')}
            disabled={!canClock || !checkedIn}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all
              bg-white/[0.08] hover:bg-white/[0.12] text-white/80
              disabled:bg-white/[0.03] disabled:text-white/20 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><LogOut size={15} /> Check Out</>}
          </button>
        </div>
      </div>

      {/* Geofence Map */}
      <GeofenceMap />

      {/* Today summary */}
      {lastIn && (
        <div className="dtr-summary grid grid-cols-3 gap-3">
          {[
            { label: 'Time In',   value: fmtTime(lastIn.timestamp) },
            { label: 'Time Out',  value: lastOut ? fmtTime(lastOut.timestamp) : '—' },
            { label: 'Duration',  value: lastOut ? fmtDuration(lastIn.timestamp, lastOut.timestamp) : 'Active' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 mb-1">{label}</div>
              <div className="text-sm font-semibold text-white/80 font-mono">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent entries */}
      <div className="dtr-records bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Recent Entries</span>
          <button
            onClick={() => selectedEmployee && loadRecords(selectedEmployee.id)}
            disabled={recordsLoading}
            className="text-white/20 hover:text-white/50 transition-colors"
          >
            <RefreshCw size={13} className={recordsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {recordsLoading ? (
          <div><Skeleton /><Skeleton /><Skeleton /></div>
        ) : myRecords.length === 0 ? (
          <div className="py-10 text-center text-white/20 text-sm">
            {selectedEmployee ? 'No records yet' : 'Select an employee'}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {myRecords.slice(0, 8).map(r => (
              <RecordRow key={r.id} rec={r} geofencingEnabled={settings?.geofencing_enabled ?? false} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

/* @arkzen:web:page:index:end */

/* @arkzen:web:page:admin */
/* @arkzen:web:page:layout:app */

const AdminPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  useEffect(() => { const c = dtrGeofencingAnimations(pageRef); return c }, [])

  const { settings, setSettings, employees, setEmployees } = useDtrStore()

  const [allRecords,      setAllRecords]      = useState<TimeRecord[]>([])
  const [allLoading,      setAllLoading]      = useState(true)
  const [empLoading,      setEmpLoading]      = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [saving,          setSaving]          = useState(false)

  const [officeLat,    setOfficeLat]    = useState('')
  const [officeLng,    setOfficeLng]    = useState('')
  const [officeRadius, setOfficeRadius] = useState('')
  const [geoEnabled,   setGeoEnabled]   = useState(false)

  const loadEmployees = async () => {
    setEmpLoading(true)
    try {
      const res  = await arkzenFetch('/api/dtr/employees')
      const data = await res.json()
      setEmployees(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch {} finally { setEmpLoading(false) }
  }

  const loadSettings = async () => {
    setSettingsLoading(true)
    try {
      const res  = await arkzenFetch('/api/dtr/settings')
      const data = await res.json()
      const raw  = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      if (raw.length) {
        const parsed = parseSettings(raw)
        setSettings(parsed)
        setGeoEnabled(parsed.geofencing_enabled)
        setOfficeLat(String(parsed.office_latitude))
        setOfficeLng(String(parsed.office_longitude))
        setOfficeRadius(String(parsed.geofence_radius_meters))
      }
    } catch {} finally { setSettingsLoading(false) }
  }

  const loadAll = async () => {
    setAllLoading(true)
    try {
      const res  = await arkzenFetch('/api/dtr/records')
      const data = await res.json()
      setAllRecords(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch { setAllRecords([]) } finally { setAllLoading(false) }
  }

  useEffect(() => { loadEmployees(); loadSettings(); loadAll() }, [])

  const toggleGeo = async () => {
    const next = !geoEnabled
    try {
      await arkzenFetch('/api/dtr/settings/toggle-geofencing', {
        method: 'POST',
        body: JSON.stringify({ enabled: next }),
      })
      setGeoEnabled(next)
      if (settings) setSettings({ ...settings, geofencing_enabled: next })
    } catch {}
  }

  const saveOffice = async () => {
    const lat = parseFloat(officeLat), lng = parseFloat(officeLng), rad = parseInt(officeRadius)
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) return
    setSaving(true)
    try {
      await arkzenFetch('/api/dtr/settings/office', {
        method: 'POST',
        body: JSON.stringify({ lat, lng, radius: rad }),
      })
      if (settings) setSettings({ ...settings, office_latitude: lat, office_longitude: lng, geofence_radius_meters: rad })
    } catch {} finally { setSaving(false) }
  }

  const totalIn    = allRecords.filter(r => r.type === 'in').length
  const totalOut   = allRecords.filter(r => r.type === 'out').length
  const violationsCount = allRecords.filter(r => !r.within_geofence).length

  return (
    <div ref={pageRef} className="space-y-6">

      {/* Header */}
      <div className="admin-header">
        <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">Admin Panel</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Geofence Settings</h1>
        <p className="text-sm text-white/30 mt-0.5">Configure office location and view all records</p>
      </div>

      {/* Stats */}
      <div className="admin-stats grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Employees',  value: employees.length,  color: 'text-white/80' },
          { label: 'Check-ins',  value: totalIn,            color: 'text-emerald-400' },
          { label: 'Check-outs', value: totalOut,           color: 'text-white/50' },
          { label: 'Violations', value: violationsCount,    color: 'text-rose-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-white/25 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Geofencing toggle + office settings */}
      <div className="admin-settings bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white/80">Geofencing Enforcement</h2>
            <p className="text-xs text-white/30 mt-0.5">Require check-in within office radius</p>
          </div>
          <button
            onClick={toggleGeo}
            className={`relative w-12 h-6 rounded-full transition-all ${geoEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${geoEnabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {geoEnabled && (
          <div className="border-t border-white/[0.05] pt-5">
            <p className="text-xs font-mono text-white/30 uppercase tracking-wider mb-3">Office Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-white/30 block mb-1.5">Latitude</label>
                <input
                  type="number" step="any" value={officeLat}
                  onChange={e => setOfficeLat(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 focus:border-white/20 focus:outline-none"
                  placeholder="14.5995"
                />
              </div>
              <div>
                <label className="text-xs text-white/30 block mb-1.5">Longitude</label>
                <input
                  type="number" step="any" value={officeLng}
                  onChange={e => setOfficeLng(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 focus:border-white/20 focus:outline-none"
                  placeholder="120.9842"
                />
              </div>
              <div>
                <label className="text-xs text-white/30 block mb-1.5">Radius (meters)</label>
                <input
                  type="number" value={officeRadius}
                  onChange={e => setOfficeRadius(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 focus:border-white/20 focus:outline-none"
                  placeholder="100"
                />
              </div>
            </div>
            <button
              onClick={saveOffice}
              disabled={saving}
              className="bg-white/[0.08] hover:bg-white/[0.12] text-white/80 text-sm font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save Location'}
            </button>
          </div>
        )}
      </div>

      {/* All Records table */}
      <div className="admin-records bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <span className="text-sm font-semibold text-white/60">All Time Records</span>
          <button onClick={loadAll} disabled={allLoading} className="text-white/20 hover:text-white/50 transition-colors">
            <RefreshCw size={13} className={allLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {allLoading ? (
          <div><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>
        ) : allRecords.length === 0 ? (
          <div className="py-12 text-center text-white/20 text-sm">No records yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Employee', 'Type', 'Time', 'Coordinates', 'Geofence'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono text-white/20">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRecords.slice(0, 50).map(rec => (
                  <tr key={rec.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-white/70 text-sm">{rec.employee?.name ?? `#${rec.employee_id}`}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase tracking-wider ${rec.type === 'in' ? 'text-emerald-400' : 'text-white/30'}`}>{rec.type}</span>
                    </td>
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">{new Date(rec.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-white/25 font-mono text-xs">
                      {rec.latitude ? `${Number(rec.latitude).toFixed(4)}, ${Number(rec.longitude).toFixed(4)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {rec.within_geofence
                        ? <CheckCircle size={13} className="text-emerald-400/70" />
                        : <XCircle size={13} className="text-rose-400/50" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

/* @arkzen:web:page:admin:end */

/* @arkzen:web:animation */
import { gsap } from 'gsap'

const dtrGeofencingAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.dtr-header',
      { opacity: 0, y: -18 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
    )
    gsap.fromTo(
      ['.dtr-select', '.dtr-clock', '.dtr-map', '.dtr-summary', '.dtr-records',
       '.admin-header', '.admin-stats', '.admin-settings', '.admin-records'],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.15 }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
/* @arkzen:web:animation:end */
/* @arkzen:native:layout:app */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { CalendarClock, Settings } from 'lucide-react-native'

const NAV = [
  { href: '/dtr-geofencing',       label: 'Clock In/Out', icon: CalendarClock },
  { href: '/dtr-geofencing/admin', label: 'Admin',        icon: Settings },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useRouter()
  const pathname = usePathname()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Top bar */}
      <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#ffffff0d' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarClock size={14} color="#ffffff70" />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffffe6', letterSpacing: -0.2 }}>DTR · Geofence</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <TouchableOpacity
                key={href}
                onPress={() => router.push(href as any)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: active ? '#ffffff14' : 'transparent' }}
              >
                <Icon size={13} color={active ? '#ffffff' : '#ffffff40'} />
                <Text style={{ fontSize: 12, fontWeight: '500', color: active ? '#ffffff' : '#ffffff40' }}>{label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  )
}

/* @arkzen:native:layout:app:end */

/* @arkzen:meta:native
label: DTR Geofencing
description: Daily time record with GPS geofence enforcement
expo:
  bundle_id: com.arkzen.dtrgeofencing
  scheme: dtrgeofencing
  version: 2.0.0
  orientation: portrait
  status_bar_style: light
  permissions:
    - ACCESS_FINE_LOCATION
    - ACCESS_COARSE_LOCATION
    - ACCESS_BACKGROUND_LOCATION
*/

/* @arkzen:native:config
theme:
  primary: "#34d399"
  danger: "#f87171"
  background: "#0a0a0a"
  surface: "#111111"
  border: "#ffffff14"
  text: "#ffffff"
  muted: "#ffffff40"
  card: "#ffffff08"
*/

/* @arkzen:native:style:shared */
.screen {
  flex: 1;
  background-color: #0a0a0a;
}

.section {
  background-color: #ffffff08;
  border-radius: 16px;
  border-width: 1px;
  border-color: #ffffff14;
  margin-bottom: 12px;
}

.section-header {
  padding-horizontal: 16px;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: #ffffff0d;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff50;
  letter-spacing: 1px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: #ffffff40;
  margin-top: 2px;
}

.page-eyebrow {
  font-size: 11px;
  color: #ffffff30;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.btn-primary {
  flex: 1;
  border-radius: 12px;
  padding-vertical: 14px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  background-color: #34d399;
}

.btn-primary-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.btn-secondary {
  flex: 1;
  border-radius: 12px;
  padding-vertical: 14px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  background-color: #ffffff14;
}

.btn-secondary-text {
  color: #ffffffcc;
  font-size: 14px;
  font-weight: 600;
}

.btn-disabled {
  background-color: #ffffff08;
}

.btn-disabled-text {
  color: #ffffff20;
}

.mono {
  font-size: 12px;
  color: #ffffff30;
}

.badge-in {
  flex-direction: row;
  align-items: center;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 999px;
  background-color: #34d39910;
}

.badge-in-text {
  font-size: 11px;
  color: #34d399;
  font-weight: 600;
}

.badge-out {
  flex-direction: row;
  align-items: center;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 999px;
  background-color: #ffffff0a;
}

.badge-out-text {
  font-size: 11px;
  color: #ffffff40;
  font-weight: 600;
}

.badge-violation {
  flex-direction: row;
  align-items: center;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 999px;
  background-color: #f8717110;
}

.badge-violation-text {
  font-size: 11px;
  color: #f87171;
  font-weight: 600;
}

.stat-card {
  flex: 1;
  background-color: #ffffff08;
  border-radius: 12px;
  border-width: 1px;
  border-color: #ffffff14;
  padding: 14px;
  align-items: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 11px;
  color: #ffffff25;
  margin-top: 4px;
}
/* @arkzen:native:style:shared:end */

/* @arkzen:native:components:shared */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Pressable, FlatList,
} from 'react-native'

import * as Location from 'expo-location'
import { create } from 'zustand'
import {
  LogIn, LogOut, MapPin, CheckCircle, XCircle,
  AlertCircle, RefreshCw, ChevronDown, Navigation,
} from 'lucide-react-native'

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

/* @arkzen:native:components:shared:end */


/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:app */

import Animated, { FadeInDown } from 'react-native-reanimated'

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

/* @arkzen:native:page:index:end */


/* @arkzen:native:page:admin */
/* @arkzen:native:page:layout:app */

import Animated, { FadeInDown } from 'react-native-reanimated'

const AdminScreen = () => {
  const { settings, setSettings, employees, setEmployees } = useDtrStore()

  const [allRecords,      setAllRecords]      = useState<TimeRecord[]>([])
  const [allLoading,      setAllLoading]      = useState(true)
  const [empLoading,      setEmpLoading]      = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [geoEnabled,      setGeoEnabled]      = useState(false)
  const [officeLat,       setOfficeLat]       = useState('')
  const [officeLng,       setOfficeLng]       = useState('')
  const [officeRadius,    setOfficeRadius]     = useState('')
  const [showSettings,    setShowSettings]    = useState(false)

  const BASE = process.env.EXPO_PUBLIC_API_URL ?? ''

  const loadAll = async () => {
    setAllLoading(true)
    try {
      const res  = await fetch(`${BASE}/api/dtr/records`)
      const data = await res.json()
      setAllRecords(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch { setAllRecords([]) } finally { setAllLoading(false) }
  }

  const loadEmployees = async () => {
    setEmpLoading(true)
    try {
      const res  = await fetch(`${BASE}/api/dtr/employees`)
      const data = await res.json()
      setEmployees(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
    } catch {} finally { setEmpLoading(false) }
  }

  const loadSettings = async () => {
    try {
      const res  = await fetch(`${BASE}/api/dtr/settings`)
      const data = await res.json()
      const raw  = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      if (raw.length) {
        const parsed = parseSettings(raw)
        setSettings(parsed)
        setGeoEnabled(parsed.geofencing_enabled)
        setOfficeLat(String(parsed.office_latitude))
        setOfficeLng(String(parsed.office_longitude))
        setOfficeRadius(String(parsed.geofence_radius_meters))
      }
    } catch {}
  }

  useEffect(() => { loadEmployees(); loadSettings(); loadAll() }, [])

  const toggleGeo = async () => {
    const next = !geoEnabled
    try {
      await fetch(`${BASE}/api/dtr/settings/toggle-geofencing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      })
      setGeoEnabled(next)
      if (settings) setSettings({ ...settings, geofencing_enabled: next })
    } catch {}
  }

  const saveOffice = async () => {
    const lat = parseFloat(officeLat), lng = parseFloat(officeLng), rad = parseInt(officeRadius)
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) return
    setSaving(true)
    try {
      await fetch(`${BASE}/api/dtr/settings/office`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, radius: rad }),
      })
      if (settings) setSettings({ ...settings, office_latitude: lat, office_longitude: lng, geofence_radius_meters: rad })
    } catch {} finally { setSaving(false) }
  }

  const totalIn         = allRecords.filter(r => r.type === 'in').length
  const totalOut        = allRecords.filter(r => r.type === 'out').length
  const violationsCount = allRecords.filter(r => !r.within_geofence).length

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}>

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 11, color: '#ffffff30', letterSpacing: 2, marginBottom: 4 }}>ADMIN PANEL</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', letterSpacing: -0.5 }}>Geofence Settings</Text>
        <Text style={{ fontSize: 13, color: '#ffffff40', marginTop: 3 }}>Configure office location and view all records</Text>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.duration(400).delay(60)} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Employees',  value: employees.length,  color: '#ffffffcc' },
          { label: 'Check-ins',  value: totalIn,            color: '#34d399' },
          { label: 'Check-outs', value: totalOut,           color: '#ffffff50' },
          { label: 'Violations', value: violationsCount,    color: '#f87171' },
        ].map(({ label, value, color }) => (
          <View key={label} style={{ flex: 1, backgroundColor: '#ffffff08', borderRadius: 12, borderWidth: 1, borderColor: '#ffffff14', padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color }}>{value}</Text>
            <Text style={{ fontSize: 10, color: '#ffffff25', marginTop: 3 }}>{label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Geofencing toggle */}
      <Animated.View entering={FadeInDown.duration(400).delay(120)} style={{ backgroundColor: '#ffffff08', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff14', padding: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffffcc' }}>Geofencing Enforcement</Text>
            <Text style={{ fontSize: 12, color: '#ffffff30', marginTop: 2 }}>Require check-in within office radius</Text>
          </View>
          <TouchableOpacity
            onPress={toggleGeo}
            activeOpacity={0.8}
            style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: geoEnabled ? '#34d399' : '#ffffff18', justifyContent: 'center', paddingHorizontal: 2 }}
          >
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#ffffff', alignSelf: geoEnabled ? 'flex-end' : 'flex-start', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2 }} />
          </TouchableOpacity>
        </View>

        {geoEnabled && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#ffffff0d' }}>
            <Text style={{ fontSize: 11, color: '#ffffff30', letterSpacing: 1.5, marginBottom: 12 }}>OFFICE LOCATION</Text>
            {[
              { label: 'Latitude',       value: officeLat,       onChange: setOfficeLat,    placeholder: '14.5995' },
              { label: 'Longitude',      value: officeLng,       onChange: setOfficeLng,    placeholder: '120.9842' },
              { label: 'Radius (meters)',value: officeRadius,    onChange: setOfficeRadius, placeholder: '100' },
            ].map(({ label, value, onChange, placeholder }) => (
              <View key={label} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 12, color: '#ffffff30', marginBottom: 6 }}>{label}</Text>
                <View style={{ backgroundColor: '#ffffff08', borderWidth: 1, borderColor: '#ffffff14', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={{ fontSize: 13, color: '#ffffffb3', fontFamily: 'monospace' }}>{value || placeholder}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={saveOffice}
              disabled={saving}
              activeOpacity={0.8}
              style={{ backgroundColor: '#ffffff14', borderRadius: 10, paddingVertical: 12, alignItems: 'center', opacity: saving ? 0.5 : 1 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffffcc' }}>{saving ? 'Saving…' : 'Save Location'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* All records */}
      <Animated.View entering={FadeInDown.duration(400).delay(180)} style={{ backgroundColor: '#ffffff08', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff14', overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff0d' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#ffffff50', letterSpacing: 1 }}>ALL TIME RECORDS</Text>
          <TouchableOpacity onPress={loadAll} disabled={allLoading}>
            <RefreshCw size={13} color={allLoading ? '#ffffff20' : '#ffffff30'} />
          </TouchableOpacity>
        </View>

        {allLoading ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#ffffff30" />
          </View>
        ) : allRecords.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#ffffff20' }}>No records yet</Text>
          </View>
        ) : (
          allRecords.slice(0, 50).map(rec => (
            <RecordRow key={rec.id} rec={rec} geofencingEnabled={settings?.geofencing_enabled ?? false} />
          ))
        )}
      </Animated.View>

    </ScrollView>
  )
}

/* @arkzen:native:page:admin:end */


/* @arkzen:native:animation:rn */
import { withTiming, withDelay, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated'

export const usePageFadeIn = (delay = 0) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(12)

  useEffect(() => {
    opacity.value    = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }))
    translateY.value = withDelay(delay, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }))
  }, [])

  return useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }))
}
/* @arkzen:native:animation:rn:end */
