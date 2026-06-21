'use client'
// ============================================================
// ARKZEN GENERATED PAGE — dtr-geofencing/admin
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:56.108Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/dtr-geofencing-app'
import { dtrGeofencingAnimations, pageVariants } from '@/arkzen/generated/dtr-geofencing.animations'
import { EmployeeDropdown } from '../components/EmployeeDropdown'
import { GeofenceBadge } from '../components/GeofenceBadge'
import { GeofenceMap } from '../components/GeofenceMap'
import { LocationWidget } from '../components/LocationWidget'
import { RecordRow } from '../components/RecordRow'
import { Skeleton } from '../components/Skeleton'
import { useDtrStore } from '../components/hooks'
import { map, parseSettings, within } from '../components/utils'
import type { Employee, TimeRecord } from '../components/types'
import { MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, User as UserIcon, Clock, Loader2, Navigation, TrendingUp, ChevronDown, LogIn, LogOut } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Page component code (from @arkzen:page:admin)
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

// Wrapper for animation + layout
const ArkzenPage_DtrGeofencing_Admin = () => {
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
        <AdminPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_DtrGeofencing_Admin
