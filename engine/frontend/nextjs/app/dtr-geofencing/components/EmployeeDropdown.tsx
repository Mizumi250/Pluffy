'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — EmployeeDropdown
// Source: @arkzen:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:34.782Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'
import { create } from 'zustand'
import { useDtrStore } from './hooks'
import type { DtrSettings, DtrStore, Employee, TimeRecord } from './types'

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
