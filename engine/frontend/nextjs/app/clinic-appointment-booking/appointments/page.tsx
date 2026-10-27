'use client'
// ============================================================
// ARKZEN GENERATED PAGE — clinic-appointment-booking/appointments
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:28.302Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Appointment, FormState, Patient } from '../components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Page component code (from @arkzen:page:appointments)
const AppointmentsPage = () => {
  const [loading, setLoading]        = useState(true)
  const [error, setError]            = useState<string | null>(null)
  const [items, setItems]            = useState<Appointment[]>([])
  const [newItem, setNewItem]        = useState<Partial<Appointment>>({})
  const [deletePending, setDeletePending] = useState<number | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const res = await arkzenFetch('/api/clinic-appointment-booking/appointments')
      const d   = await res.json()
      if (!res.ok) throw new Error(d.message ?? 'Load failed')
      setItems(d.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await arkzenFetch(
        '/api/clinic-appointment-booking/appointments',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) }
      )
      const d = await res.json()
      if (!res.ok) throw new Error(d.message ?? 'Create failed')
      setItems(prev => [...prev, d])
      setNewItem({})
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    }
  }

  const handleDelete = async (id: number) => {
    setDeletePending(id)
    try {
      const res = await arkzenFetch(`/api/clinic-appointment-booking/appointments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {} finally {
      setDeletePending(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-lg font-bold text-neutral-800">Appointments</h1>

      {error && <p className="bg-red-100 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-sm text-neutral-400">Loading…</p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white border border-neutral-100 rounded-xl px-4 py-3 flex justify-between items-start gap-3">
                <div>
                  <p className={`font-semibold text-sm ${item.status === 'completed' ? 'text-green-600' : item.status === 'cancelled' ? 'text-amber-600' : 'text-neutral-900'}`}>
                    {item.doctor_name}
                  </p>
                  <p className="text-xs text-neutral-400 mb-1">{formatDateTime(item.date_time)}</p>
                  <p className="text-xs text-neutral-500 leading-5">{item.patient_id}. {item.status}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} disabled={deletePending === item.id}>
                  {deletePending === item.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-neutral-100 rounded-xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-400 pb-3">Create appointment</h2>
            <div className="gap-3 flex flex-col">
              <input
                className="border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900"
                placeholder="Patient ID"
                value={String(newItem.patient_id ?? '')}
                onChange={e => setNewItem({ ...newItem, patient_id: Number(e.target.value) || undefined })}
              />
              <input
                className="border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900"
                placeholder="Doctor Name"
                value={newItem.doctor_name ?? ''}
                onChange={e => setNewItem({ ...newItem, doctor_name: e.target.value })}
              />
              <input
                className="border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900"
                placeholder="Date & Time (YYYY-MM-DD HH:MM:SS)"
                value={newItem.date_time ?? ''}
                onChange={e => setNewItem({ ...newItem, date_time: e.target.value })}
              />
              <select
                className="border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-transparent"
                value={newItem.status ?? ''}
                onChange={e => setNewItem({ ...newItem, status: e.target.value as any })}
              >
                <option value="">Status</option>
                <option value="pending"   className="text-neutral-900">Pending</option>
                <option value="completed" className="text-green-600">Completed</option>
                <option value="cancelled" className="text-amber-600">Cancelled</option>
              </select>
              <button onClick={handleCreate} className="w-full bg-neutral-900 text-white text-sm font-medium rounded-xl px-5 py-2.5 hover:bg-neutral-700 transition-colors">
                Create
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_ClinicAppointmentBooking_Appointments = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <AppointmentsPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_ClinicAppointmentBooking_Appointments
