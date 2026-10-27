'use client'
// ============================================================
// ARKZEN GENERATED PAGE — clinic-appointment-booking/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:28.281Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Appointment, FormState, Patient } from './components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const [list, setList]   = useState<any[]>([])
  const [newItem, setNewItem] = useState<{ first_name: string; last_name: string; email: string; phone_number: string }>({ first_name: '', last_name: '', email: '', phone_number: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const loadList = async () => {
    try {
      const res = await arkzenFetch('/api/clinic-appointment-booking/patients')
      const d   = await res.json()
      if (!res.ok) throw new Error(d.message ?? 'Load failed')
      setList(d.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    }
  }

  const handleCreate = async () => {
    setError(null)
    try {
      setLoading(true)
      const res = await arkzenFetch('/api/clinic-appointment-booking/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message ?? 'Create failed')
      setList([...list, d])
      setNewItem({ first_name: '', last_name: '', email: '', phone_number: '' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await arkzenFetch(`/api/clinic-appointment-booking/patients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setList(list.filter(l => l.id !== id))
      } else {
        throw new Error('Delete failed')
      }
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => { loadList() }, [])

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-900/70 backdrop-blur-xl px-6 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <h1 className="text-sm font-semibold tracking-tight text-white">Patients</h1>
        <span className="flex-1" />
        <a href="/clinic-appointment-booking/appointments" className="text-xs text-neutral-400 hover:text-white transition-colors">Appointments</a>
      </header>

      <div className="max-w-md mx-auto mt-8 p-6 rounded-2xl bg-neutral-900 border border-neutral-800">

        {/* Create row */}
        <div className="mb-6">
          <input v-model={newItem.first_name} placeholder="First Name" className="w-full mb-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent" />
          <input v-model={newItem.last_name}  placeholder="Last Name"  className="w-full mb-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent" />
          <input v-model={newItem.email}      placeholder="Email"      className="w-full mb-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent" />
          <input v-model={newItem.phone_number} placeholder="Phone"      className="w-full mb-4 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent" />
          <button onClick={handleCreate} disabled={loading} className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white ${loading ? 'bg-neutral-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Creating…' : 'Create'}
          </button>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>

        {/* List */}
        {list.length === 0 ? (
          <p className="text-xs text-neutral-400 italic pt-2">No patients yet.</p>
        ) : (
          list.map(item => (
            <div key={item.id} className="bg-neutral-800 rounded-xl px-4 py-3 mb-3 flex items-start gap-3 relative">
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-1.5 right-1.5 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-full"
              >
                Delete
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-sm">{item.first_name} {item.last_name}</span>
                  <span className="text-xs text-neutral-400">{item.email}</span>
                </div>
                <p className="text-xs text-neutral-400 truncate w-[240px]">{item.phone_number}</p>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_ClinicAppointmentBooking_Index = () => {
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
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_ClinicAppointmentBooking_Index
