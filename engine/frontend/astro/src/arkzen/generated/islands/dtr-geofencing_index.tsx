// ============================================================
// ARKZEN GENERATED ISLAND — dtr-geofencing/index
// React island component. Hydrated with client:load in .astro page shell.
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:11.715Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/dtr-geofencing-app'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { EmployeeDropdown } from '@/arkzen/generated/components/dtr-geofencing/EmployeeDropdown'
import { GeofenceBadge } from '@/arkzen/generated/components/dtr-geofencing/GeofenceBadge'
import { GeofenceMap } from '@/arkzen/generated/components/dtr-geofencing/GeofenceMap'
import { LocationWidget } from '@/arkzen/generated/components/dtr-geofencing/LocationWidget'
import { RecordRow } from '@/arkzen/generated/components/dtr-geofencing/RecordRow'
import { Skeleton } from '@/arkzen/generated/components/dtr-geofencing/Skeleton'
import { useDtrStore } from '@/arkzen/generated/components/dtr-geofencing/hooks'
import type { Employee } from '@/arkzen/generated/components/dtr-geofencing/types'
import { fmtDuration, fmtTime, parseSettings } from '@/arkzen/generated/components/dtr-geofencing/utils'
import { dtrGeofencingAnimations, pageVariants } from '@/arkzen/generated/dtr-geofencing.animations'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'

// Page component code (from @arkzen:page:index)
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

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_DtrGeofencing_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = dtrGeofencingAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <AppLayout>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenIsland_DtrGeofencing_Index
