/* @arkzen:meta
name: dtr-geofencing
version: 1.0.0
label: DTR Geofencing
auth: false
*/

/* @arkzen:config
toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: 2xl
  backdrop: blur
  animation: fadeScale
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:database
name: dtr-geofencing
tables:
  - name: employees
    columns:
      - { name: name, type: string, length: 255 }
      - { name: email, type: string, length: 255, unique: true }
      - { name: avatar, type: string, length: 500, nullable: true }
      - { name: is_active, type: boolean, default: true }
    seeds:
      - { name: "Alex Rivera", email: "alex@example.com", avatar: "https://i.pravatar.cc/150?img=1", is_active: true }
      - { name: "Jamie Chen", email: "jamie@example.com", avatar: "https://i.pravatar.cc/150?img=5", is_active: true }
      - { name: "Taylor Smith", email: "taylor@example.com", avatar: "https://i.pravatar.cc/150?img=8", is_active: true }

  - name: time_records
    columns:
      - { name: employee_id, type: foreignId, references: employees }
      - { name: type, type: enum, values: [in, out] }
      - { name: timestamp, type: datetime }
      - { name: latitude, type: decimal, precision: 10, scale: 8, nullable: true }
      - { name: longitude, type: decimal, precision: 11, scale: 8, nullable: true }
      - { name: within_geofence, type: boolean, default: false }
      - { name: notes, type: text, nullable: true }

  - name: settings
    columns:
      - { name: key, type: string, length: 255, unique: true }
      - { name: value, type: text, nullable: true }
    seeds:
      - { key: "geofencing_enabled", value: "true" }
      - { key: "office_latitude", value: "14.599512" }
      - { key: "office_longitude", value: "120.984219" }
      - { key: "geofence_radius_meters", value: "100" }
*/

/* @arkzen:api:employees
resource: employees
routes:
  - { method: GET, path: /employees, action: index }
  - { method: GET, path: "/employees/{id}", action: show }
*/

/* @arkzen:api:time_records
resource: time_records
routes:
  - { method: GET, path: /records, action: index }
  - { method: GET, path: "/my-records/{employee_id}", action: my_records }
  - { method: POST, path: /check-in, action: check_in }
  - { method: POST, path: /check-out, action: check_out }
*/

/* @arkzen:api:settings
resource: settings
routes:
  - { method: GET, path: /settings, action: index }
  - { method: POST, path: /settings/toggle-geofencing, action: toggle_geofencing }
  - { method: POST, path: /settings/office, action: update_office }
*/

/* @arkzen:endpoint:check_in
*/
$employeeId = $request->input('employee_id');
$latitude   = $request->input('latitude');
$longitude  = $request->input('longitude');
$notes      = $request->input('notes');

$geofencingEnabled = \App\Models\Arkzen\DtrGeofencing\Setting::where('key', 'geofencing_enabled')->value('value') === 'true';
$withinGeofence = true;
$reject = false;

if ($geofencingEnabled) {
    $officeLat  = (float) \App\Models\Arkzen\DtrGeofencing\Setting::where('key', 'office_latitude')->value('value');
    $officeLng  = (float) \App\Models\Arkzen\DtrGeofencing\Setting::where('key', 'office_longitude')->value('value');
    $radius     = (float) \App\Models\Arkzen\DtrGeofencing\Setting::where('key', 'geofence_radius_meters')->value('value');
    
    $earthRadius = 6371000;
    $lat1 = deg2rad($officeLat);
    $lon1 = deg2rad($officeLng);
    $lat2 = deg2rad($latitude);
    $lon2 = deg2rad($longitude);
    $dlat = $lat2 - $lat1;
    $dlon = $lon2 - $lon1;
    $a = sin($dlat/2) * sin($dlat/2) + cos($lat1) * cos($lat2) * sin($dlon/2) * sin($dlon/2);
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    $distance = $earthRadius * $c;
    
    $withinGeofence = $distance <= $radius;
    if (!$withinGeofence) {
        $reject = true;
    }
}

if ($reject) {
    return response()->json([
        'error' => 'Geofence violation',
        'message' => 'You must be within ' . $radius . ' meters of the office to check in.',
        'distance' => round($distance, 1)
    ], 403);
}

$record = \App\Models\Arkzen\DtrGeofencing\TimeRecord::create([
    'employee_id'      => $employeeId,
    'type'             => 'in',
    'timestamp'        => now(),
    'latitude'         => $latitude,
    'longitude'        => $longitude,
    'within_geofence'  => $withinGeofence,
    'notes'            => $notes,
]);

return response()->json([
    'success' => true,
    'record'  => $record,
    'within_geofence' => $withinGeofence,
    'geofencing_enabled' => $geofencingEnabled,
]);
/* @arkzen:endpoint:check_in:end */

/* @arkzen:endpoint:check_out
*/
$employeeId = $request->input('employee_id');
$latitude   = $request->input('latitude');
$longitude  = $request->input('longitude');
$notes      = $request->input('notes');

$geofencingEnabled = \App\Models\Arkzen\DtrGeofencing\Setting::where('key', 'geofencing_enabled')->value('value') === 'true';
$withinGeofence = true;
$reject = false;

if ($geofencingEnabled) {
    $officeLat  = (float) \App\Models\Arkzen\DtrGeofencing\Setting::where('key', 'office_latitude')->value('value');
    $officeLng  = (float) \App\Models\Arkzen\DtrGeofencing\Setting::where('key', 'office_longitude')->value('value');
    $radius     = (float) \App\Models\Arkzen\DtrGeofencing\Setting::where('key', 'geofence_radius_meters')->value('value');
    
    $earthRadius = 6371000;
    $lat1 = deg2rad($officeLat);
    $lon1 = deg2rad($officeLng);
    $lat2 = deg2rad($latitude);
    $lon2 = deg2rad($longitude);
    $dlat = $lat2 - $lat1;
    $dlon = $lon2 - $lon1;
    $a = sin($dlat/2) * sin($dlat/2) + cos($lat1) * cos($lat2) * sin($dlon/2) * sin($dlon/2);
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    $distance = $earthRadius * $c;
    
    $withinGeofence = $distance <= $radius;
    if (!$withinGeofence) {
        $reject = true;
    }
}

if ($reject) {
    return response()->json([
        'error' => 'Geofence violation',
        'message' => 'You must be within ' . $radius . ' meters of the office to check out.',
        'distance' => round($distance, 1)
    ], 403);
}

$record = \App\Models\Arkzen\DtrGeofencing\TimeRecord::create([
    'employee_id'      => $employeeId,
    'type'             => 'out',
    'timestamp'        => now(),
    'latitude'         => $latitude,
    'longitude'        => $longitude,
    'within_geofence'  => $withinGeofence,
    'notes'            => $notes,
]);

return response()->json([
    'success' => true,
    'record'  => $record,
    'within_geofence' => $withinGeofence,
    'geofencing_enabled' => $geofencingEnabled,
]);
/* @arkzen:endpoint:check_out:end */

/* @arkzen:endpoint:toggle_geofencing
*/
$enabled = $request->input('enabled');
\App\Models\Arkzen\DtrGeofencing\Setting::updateOrCreate(
    ['key' => 'geofencing_enabled'],
    ['value' => $enabled ? 'true' : 'false']
);
return response()->json([
    'success' => true,
    'geofencing_enabled' => $enabled,
]);
/* @arkzen:endpoint:toggle_geofencing:end */

/* @arkzen:endpoint:update_office
*/
$lat    = $request->input('lat');
$lng    = $request->input('lng');
$radius = $request->input('radius');
\App\Models\Arkzen\DtrGeofencing\Setting::updateOrCreate(['key' => 'office_latitude'], ['value' => (string) $lat]);
\App\Models\Arkzen\DtrGeofencing\Setting::updateOrCreate(['key' => 'office_longitude'], ['value' => (string) $lng]);
\App\Models\Arkzen\DtrGeofencing\Setting::updateOrCreate(['key' => 'geofence_radius_meters'], ['value' => (string) $radius]);
return response()->json(['success' => true]);
/* @arkzen:endpoint:update_office:end */

/* @arkzen:layout:app

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarClock, Settings, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dtr-geofencing', label: 'Clock In/Out', icon: CalendarClock },
  { href: '/dtr-geofencing/admin', label: 'Admin', icon: Settings },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-neutral-900" />
              <span className="font-semibold text-neutral-900 text-sm tracking-tight">DTR · Geofence</span>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              {NAV_ITEMS.map(({ href, label }) => (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className={`text-sm font-medium transition-colors ${
                    pathname === href ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-14 left-0 w-full bg-white shadow-lg rounded-b-2xl p-4 space-y-2" onClick={e => e.stopPropagation()}>
            {NAV_ITEMS.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => { router.push(href); setMobileMenuOpen(false) }}
                className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  )
}

/* @arkzen:layout:app:end */

/* @arkzen:components:shared

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { create } from 'zustand'
import { MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, User as UserIcon, Clock, Loader2, Navigation } from 'lucide-react'
import { useQuery, useMutation } from '@/arkzen/core/hooks/useQuery'
import { toast } from '@/arkzen/core/components'

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

export interface Settings {
  geofencing_enabled: boolean
  office_latitude: number
  office_longitude: number
  geofence_radius_meters: number
}

interface DtrState {
  employees: Employee[]
  selectedEmployee: Employee | null
  myRecords: TimeRecord[]
  settings: Settings | null
  isLoading: boolean
  locationStatus: 'idle' | 'fetching' | 'success' | 'denied'
  currentPosition: { lat: number; lng: number } | null
  distanceToOffice: number | null
  setEmployees: (employees: Employee[]) => void
  setSelectedEmployee: (emp: Employee | null) => void
  setMyRecords: (records: TimeRecord[]) => void
  setSettings: (settings: Settings) => void
  setLoading: (loading: boolean) => void
  setLocationStatus: (status: DtrState['locationStatus']) => void
  setCurrentPosition: (pos: { lat: number; lng: number } | null) => void
  setDistanceToOffice: (distance: number | null) => void
  resetState: () => void
}

export const useDtrStore = create<DtrState>((set) => ({
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
  setLoading: (isLoading) => set({ isLoading }),
  setLocationStatus: (locationStatus) => set({ locationStatus }),
  setCurrentPosition: (currentPosition) => set({ currentPosition }),
  setDistanceToOffice: (distanceToOffice) => set({ distanceToOffice }),
  resetState: () => set({
    selectedEmployee: null,
    myRecords: [],
    locationStatus: 'idle',
    currentPosition: null,
    distanceToOffice: null,
  }),
}))

export const useEmployees = () => useQuery<Employee[]>('/api/dtr/employees')
export const useEmployeeRecords = (employeeId: number | null) => useQuery<TimeRecord[]>(employeeId ? `/api/dtr/my-records/${employeeId}` : null)
export const useAllRecords = () => useQuery<TimeRecord[]>('/api/dtr/records')
export const useSettingsApi = () => useQuery<any[]>('/api/dtr/settings')
export const useCheckIn = () => useMutation<TimeRecord>('/api/dtr/check-in')
export const useCheckOut = () => useMutation<TimeRecord>('/api/dtr/check-out')
export const useToggleGeofencing = () => useMutation<any>('/api/dtr/settings/toggle-geofencing')
export const useUpdateOffice = () => useMutation<any>('/api/dtr/settings/office')

export const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
export const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString()

export const calculateDuration = (checkIn: string, checkOut: string) => {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export const StatusBadge = ({ within, enabled }: { within: boolean; enabled: boolean }) => {
  if (!enabled) return <span className="inline-flex items-center gap-1 text-xs font-mono text-neutral-400"><AlertCircle size={12} /> disabled</span>
  return within ? (
    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600"><CheckCircle size={12} /> geofence OK</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-mono text-rose-600"><XCircle size={12} /> outside</span>
  )
}

export const EmployeeSelector = () => {
  const { employees, selectedEmployee, setSelectedEmployee } = useDtrStore()
  const [isOpen, setIsOpen] = useState(false)
  if (!employees.length) return <div className="h-12 animate-pulse bg-neutral-100 rounded-xl" />
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between gap-3 p-3 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors">
        <div className="flex items-center gap-3">
          {selectedEmployee?.avatar ? <img src={selectedEmployee.avatar} className="w-8 h-8 rounded-full object-cover" /> : <UserIcon size={16} className="text-neutral-500" />}
          <span className="font-medium text-neutral-900">{selectedEmployee?.name || 'Select employee'}</span>
        </div>
        <span className="text-neutral-400 text-sm">▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-neutral-100 rounded-xl shadow-lg max-h-60 overflow-auto">
          {employees.map(emp => (
            <button key={emp.id} onClick={() => { setSelectedEmployee(emp); setIsOpen(false) }} className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors text-left">
              {emp.avatar ? <img src={emp.avatar} className="w-8 h-8 rounded-full object-cover" /> : <UserIcon size={16} className="text-neutral-500" />}
              <div><div className="font-medium text-neutral-900">{emp.name}</div><div className="text-xs text-neutral-400">{emp.email}</div></div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const LocationStatus = () => {
  const { locationStatus, currentPosition, settings, distanceToOffice, setLocationStatus, setCurrentPosition, setDistanceToOffice } = useDtrStore()

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); setLocationStatus('denied'); return }
    setLocationStatus('fetching')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCurrentPosition({ lat: latitude, lng: longitude })
        if (settings) {
          const dist = calculateDistance(latitude, longitude, settings.office_latitude, settings.office_longitude)
          setDistanceToOffice(dist)
        }
        setLocationStatus('success')
        toast.success('Location acquired')
      },
      () => { setLocationStatus('denied'); toast.error('Location permission denied') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [settings])

  if (locationStatus === 'idle') {
    return <button onClick={requestLocation} className="flex items-center gap-2 text-sm text-neutral-600 bg-white border border-neutral-200 px-4 py-2 rounded-xl hover:bg-neutral-50 transition-colors"><MapPin size={16} /> Get my location</button>
  }
  if (locationStatus === 'fetching') {
    return <span className="flex items-center gap-2 text-sm text-neutral-500"><Loader2 size={14} className="animate-spin" /> Locating...</span>
  }
  if (locationStatus === 'denied') {
    return <span className="flex items-center gap-2 text-sm text-rose-600"><AlertCircle size={14} /> Location denied – enable in browser</span>
  }
  if (currentPosition && settings) {
    const isWithin = distanceToOffice !== null && distanceToOffice <= settings.geofence_radius_meters
    return (
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle size={14} /> {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}</span>
        {settings.geofencing_enabled && distanceToOffice !== null && (
          <span className={`text-xs font-mono ${isWithin ? 'text-emerald-600' : 'text-rose-600'}`}>
            <Navigation size={10} className="inline mr-1" /> {Math.round(distanceToOffice)}m from office {isWithin ? '(within radius)' : '(outside radius)'}
          </span>
        )}
      </div>
    )
  }
  return null
}

export const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-3 p-4">
    <div className="w-10 h-10 rounded-full bg-neutral-200" />
    <div className="flex-1 space-y-2"><div className="h-4 bg-neutral-200 rounded w-3/4" /><div className="h-3 bg-neutral-200 rounded w-1/2" /></div>
  </div>
)

/* @arkzen:components:shared:end */

/* @arkzen:animation */
import { gsap } from 'gsap'

const dtrGeofencingAnimations = (pageRef) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.animate-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
/* @arkzen:animation:end */

/* @arkzen:page:index
/* @arkzen:page:layout:app */

const IndexPage = () => {
  const pageRef = useRef(null)

  useEffect(() => {
    const cleanup = dtrGeofencingAnimations(pageRef)
    return cleanup
  }, [])

  const {
    employees, selectedEmployee, myRecords, settings, isLoading, locationStatus, currentPosition, distanceToOffice,
    setEmployees, setMyRecords, setSettings, setLoading, setLocationStatus, setCurrentPosition, setDistanceToOffice
  } = useDtrStore()

  const { data: employeesData, loading: empLoading } = useEmployees()
  const { data: recordsData, refetch: refetchRecords, loading: recordsLoading } = useEmployeeRecords(selectedEmployee?.id || null)
  const { data: settingsData, loading: settingsLoading } = useSettingsApi()
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()

  useEffect(() => { if (employeesData) setEmployees(employeesData) }, [employeesData])
  useEffect(() => {
    if (settingsData && Array.isArray(settingsData)) {
      const geofencing = settingsData.find(s => s.key === 'geofencing_enabled')?.value === 'true'
      const lat = parseFloat(settingsData.find(s => s.key === 'office_latitude')?.value || '0')
      const lng = parseFloat(settingsData.find(s => s.key === 'office_longitude')?.value || '0')
      const radius = parseInt(settingsData.find(s => s.key === 'geofence_radius_meters')?.value || '100')
      setSettings({ geofencing_enabled: geofencing, office_latitude: lat, office_longitude: lng, geofence_radius_meters: radius })
    }
  }, [settingsData])
  useEffect(() => { if (recordsData) setMyRecords(recordsData) }, [recordsData])

  const handleCheckIn = async () => {
    if (!selectedEmployee) { toast.error('Select an employee first'); return }
    if (locationStatus !== 'success' || !currentPosition) { toast.error('Location not available – tap "Get my location"'); return }
    setLoading(true)
    try {
      await checkInMutation.mutateAsync({
        employee_id: selectedEmployee.id,
        latitude: currentPosition.lat,
        longitude: currentPosition.lng,
        notes: `Check-in via mobile`
      })
      toast.success(`Checked in at ${new Date().toLocaleTimeString()}`)
      refetchRecords()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Check-in failed'
      toast.error(msg)
    }
    setLoading(false)
  }

  const handleCheckOut = async () => {
    if (!selectedEmployee) { toast.error('Select an employee'); return }
    if (locationStatus !== 'success' || !currentPosition) { toast.error('Location not available'); return }
    setLoading(true)
    try {
      await checkOutMutation.mutateAsync({
        employee_id: selectedEmployee.id,
        latitude: currentPosition.lat,
        longitude: currentPosition.lng,
        notes: `Check-out via mobile`
      })
      toast.success(`Checked out at ${new Date().toLocaleTimeString()}`)
      refetchRecords()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Check-out failed'
      toast.error(msg)
    }
    setLoading(false)
  }

  const lastCheckIn = myRecords.filter(r => r.type === 'in').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const lastCheckOut = myRecords.filter(r => r.type === 'out').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  const isCheckedIn = lastCheckIn && (!lastCheckOut || new Date(lastCheckIn.timestamp) > new Date(lastCheckOut.timestamp))

  const overallLoading = empLoading || settingsLoading

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <div ref={pageRef} className="max-w-lg mx-auto">
        <div className="mb-6 animate-item">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Daily Time Record</h1>
          <p className="text-sm text-neutral-500 mt-1">GPS geofencing {settings?.geofencing_enabled ? 'enabled' : 'disabled'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mb-4 animate-item">
          <label className="text-xs font-mono text-neutral-400 uppercase tracking-wide">Employee</label>
          {overallLoading ? <div className="h-12 animate-pulse bg-neutral-100 rounded-xl mt-2" /> : <EmployeeSelector />}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mb-4 space-y-4 animate-item">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <LocationStatus />
            {settings && <StatusBadge within={!!currentPosition && distanceToOffice !== null && distanceToOffice <= settings.geofence_radius_meters} enabled={settings.geofencing_enabled} />}
          </div>
          <div className="flex gap-3">
            <button onClick={handleCheckIn} disabled={isLoading || isCheckedIn || !selectedEmployee} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold py-3 rounded-xl transition-colors">
              {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Check In'}
            </button>
            <button onClick={handleCheckOut} disabled={isLoading || !isCheckedIn || !selectedEmployee} className="flex-1 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold py-3 rounded-xl transition-colors">
              {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Check Out'}
            </button>
          </div>
        </div>

        {lastCheckIn && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mb-4 animate-item">
            <div className="flex items-center gap-2 text-neutral-600 text-sm font-mono mb-2"><Clock size={14} /> Today's hours</div>
            <div className="flex justify-between text-sm">
              <div><span className="text-neutral-400">In:</span> {formatTime(lastCheckIn.timestamp)}</div>
              <div><span className="text-neutral-400">Out:</span> {lastCheckOut ? formatTime(lastCheckOut.timestamp) : '—'}</div>
              <div><span className="text-neutral-400">Duration:</span> {lastCheckOut ? calculateDuration(lastCheckIn.timestamp, lastCheckOut.timestamp) : '—'}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden animate-item">
          <div className="px-4 py-3 border-b border-neutral-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-neutral-900">Recent entries</span>
            <button onClick={() => refetchRecords()} disabled={recordsLoading} className="text-neutral-400 hover:text-neutral-700 transition-colors">
              <RefreshCw size={14} className={recordsLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          {recordsLoading ? (
            <div><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
          ) : myRecords.length === 0 ? (
            <div className="p-6 text-center text-neutral-400 text-sm">No records yet</div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {myRecords.slice(0, 10).map(rec => (
                <div key={rec.id} className="px-4 py-3 flex justify-between items-center hover:bg-neutral-50 transition-colors">
                  <div>
                    <span className={`inline-block w-12 text-xs font-bold uppercase ${rec.type === 'in' ? 'text-emerald-600' : 'text-neutral-500'}`}>{rec.type}</span>
                    <span className="text-sm text-neutral-700 ml-2">{formatTime(rec.timestamp)}</span>
                    {settings?.geofencing_enabled && (
                      <span className={`ml-2 text-xs ${rec.within_geofence ? 'text-emerald-500' : 'text-rose-500'}`}>{rec.within_geofence ? '✓' : '✗'}</span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">{formatDate(rec.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* @arkzen:page:index:end */

/* @arkzen:page:admin
/* @arkzen:page:layout:app */

const AdminPage = () => {
  const pageRef = useRef(null)

  useEffect(() => {
    const cleanup = dtrGeofencingAnimations(pageRef)
    return cleanup
  }, [])

  const { settings, setSettings, employees, setEmployees } = useDtrStore()
  const { data: allRecords, refetch: refetchAll, loading: allLoading } = useAllRecords()
  const { data: employeesData, loading: empLoading } = useEmployees()
  const { data: settingsData, loading: settingsLoading } = useSettingsApi()
  const toggleMutation = useToggleGeofencing()
  const updateOfficeMutation = useUpdateOffice()

  const [officeLat, setOfficeLat] = useState('')
  const [officeLng, setOfficeLng] = useState('')
  const [officeRadius, setOfficeRadius] = useState('')
  const [geofencingToggle, setGeofencingToggle] = useState(false)

  useEffect(() => { if (employeesData) setEmployees(employeesData) }, [employeesData])
  useEffect(() => {
    if (settingsData && Array.isArray(settingsData)) {
      const geofencing = settingsData.find(s => s.key === 'geofencing_enabled')?.value === 'true'
      const lat = parseFloat(settingsData.find(s => s.key === 'office_latitude')?.value || '0')
      const lng = parseFloat(settingsData.find(s => s.key === 'office_longitude')?.value || '0')
      const radius = parseInt(settingsData.find(s => s.key === 'geofence_radius_meters')?.value || '100')
      setSettings({ geofencing_enabled: geofencing, office_latitude: lat, office_longitude: lng, geofence_radius_meters: radius })
      setGeofencingToggle(geofencing)
      setOfficeLat(lat.toString())
      setOfficeLng(lng.toString())
      setOfficeRadius(radius.toString())
    }
  }, [settingsData])

  const handleToggleGeofencing = async () => {
    try {
      await toggleMutation.mutateAsync({ enabled: !geofencingToggle })
      setGeofencingToggle(!geofencingToggle)
      if (settings) setSettings({ ...settings, geofencing_enabled: !geofencingToggle })
      toast.success(`Geofencing ${!geofencingToggle ? 'enabled' : 'disabled'}`)
    } catch { toast.error('Failed to update') }
  }

  const handleUpdateOffice = async () => {
    const lat = parseFloat(officeLat), lng = parseFloat(officeLng), rad = parseInt(officeRadius)
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) { toast.error('Invalid numbers'); return }
    try {
      await updateOfficeMutation.mutateAsync({ lat, lng, radius: rad })
      if (settings) setSettings({ ...settings, office_latitude: lat, office_longitude: lng, geofence_radius_meters: rad })
      toast.success('Office location updated')
    } catch { toast.error('Update failed') }
  }

  const overallLoading = empLoading || settingsLoading

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <div ref={pageRef} className="max-w-3xl mx-auto space-y-6">
        <div className="animate-item">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Admin Settings</h1>
          <p className="text-sm text-neutral-500">Geofence configuration & all time records</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm animate-item">
          <div className="flex justify-between items-center mb-4">
            <div><h2 className="font-semibold text-neutral-900">Geofencing enforcement</h2><p className="text-xs text-neutral-500">Require check‑in/out within office radius</p></div>
            <button onClick={handleToggleGeofencing} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${geofencingToggle ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
              {geofencingToggle ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          {geofencingToggle && (
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input type="number" step="any" placeholder="Latitude" value={officeLat} onChange={e => setOfficeLat(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none" />
                <input type="number" step="any" placeholder="Longitude" value={officeLng} onChange={e => setOfficeLng(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none" />
                <input type="number" placeholder="Radius (m)" value={officeRadius} onChange={e => setOfficeRadius(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none" />
              </div>
              <button onClick={handleUpdateOffice} className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">Update office location</button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden animate-item">
          <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
            <span className="font-semibold text-neutral-900">All Time Records</span>
            <button onClick={() => refetchAll()} disabled={allLoading} className="text-neutral-400 hover:text-neutral-700"><RefreshCw size={14} className={allLoading ? 'animate-spin' : ''} /></button>
          </div>
          {allLoading ? (
            <div className="p-4"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
          ) : !allRecords || allRecords.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">No records yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50"><tr className="border-b border-neutral-100">
                  <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-mono font-medium text-neutral-500">Geofence</th>
                </tr></thead>
                <tbody>
                  {allRecords.slice(0, 50).map(rec => (
                    <tr key={rec.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-neutral-800">{rec.employee?.name || rec.employee_id}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold uppercase ${rec.type === 'in' ? 'text-emerald-600' : 'text-neutral-500'}`}>{rec.type}</span></td>
                      <td className="px-4 py-3 text-neutral-600 font-mono text-xs">{formatDateTime(rec.timestamp)}</td>
                      <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{rec.latitude ? rec.latitude.toFixed(4) + ', ' + rec.longitude?.toFixed(4) : '—'}</td>
                      <td className="px-4 py-3">{rec.within_geofence ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-rose-400" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* @arkzen:page:admin:end */