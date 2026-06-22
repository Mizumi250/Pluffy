// ============================================================
// ARKZEN GENERATED TYPES — dtr-geofencing [React+Vite]
// Source: @arkzen:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T12:11:36.536Z
// ============================================================

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

export interface DtrStore {
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
