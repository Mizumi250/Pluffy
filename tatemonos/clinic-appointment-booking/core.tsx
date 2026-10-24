/* @arkzen:meta
name: clinic-appointment-booking
version: 1.0.0
description: "Book clinic appointments — CRUD for patients and appointments"
auth: false
*/

/* @arkzen:meta:web
favicon: 🏥
title: Clinic App
description: Book your appointment with Dr. Smith — built with Arkzen
*/

/* @arkzen:database:patients
table: patients
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  first_name:
    type: string
    length: 255
    nullable: false
  last_name:
    type: string
    length: 255
    nullable: false
  email:
    type: string
    length: 255
    unique: true
    nullable: false
  phone_number:
    type: string
    length: 191
    nullable: true
*/

/* @arkzen:database:appointments
table: appointments
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  patient_id:
    type: foreignId
    foreign: clinic_appointment_booking_patients.id
    nullable: false
  doctor_name:
    type: string
    length: 255
    nullable: false
  date_time:
    type: datetime
    nullable: false
  status:
    type: string
    length: 50
    default: pending
*/

/* @arkzen:api:patients
model: Patient
controller: PatientController
prefix: /api/clinic-appointment-booking/patients
middleware: []
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /
    description: Get all patients
    response:
      type: paginated
  store:
    method: POST
    route: /
    description: Create new patient
    validation:
      first_name: required|string|max:255
      last_name: required|string|max:255
      email: required|email|unique:patients,email
      phone_number: sometimes|string|max:15
    response:
      type: single
  update:
    method: PUT
    route: /{id}
    description: Update patient
    validation:
      first_name: sometimes|string|max:255
      last_name: sometimes|string|max:255
      email: sometimes|email|unique:patients,email
      phone_number: sometimes|string|max:15
    response:
      type: single
  destroy:
    method: DELETE
    route: /{id}
    description: Delete patient
    response:
      type: message
      value: Patient deleted
*/

/* @arkzen:api:appointments
model: Appointment
controller: AppointmentController
prefix: /api/clinic-appointment-booking/appointments
middleware: []
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /
    description: Get all appointments
    response:
      type: paginated
  store:
    method: POST
    route: /
    description: Create an appointment
    validation:
      patient_id: required|integer|exists:patients,id
      doctor_name: required|string|max:255
      date_time: required|date_format:Y-m-d H:i:s
      status: sometimes|string|in:pending,completed,cancelled
    response:
      type: single
  update:
    method: PUT
    route: /{id}
    description: Update an appointment
    validation:
      doctor_name: nullable|string|max:255
      date_time: nullable|date_format:Y-m-d H:i:s
      status: nullable|string|in:pending,completed,cancelled
    response:
      type: single
  destroy:
    method: DELETE
    route: /{id}
    description: Delete an appointment
    response:
      type: message
      value: Appointment deleted
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState } from 'react'
import { CalendarClock, XCircle } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'

interface Patient {
  id:          number
  first_name:  string
  last_name:   string
  email:       string
  phone_number:string | null
}

interface Appointment {
  id:             number
  patient_id:     number
  doctor_name:    string
  date_time:      string
  status:         string | null
  created_at:     string
  updated_at:     string
}

type FormState = 'idle' | 'saving' | 'saved' | 'error'

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */

import React, { useState } from 'react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

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

/* @arkzen:web:page:index:end */

/* @arkzen:web:page:appointments */

import React, { useState, useEffect } from 'react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

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

/* @arkzen:web:page:appointments:end */