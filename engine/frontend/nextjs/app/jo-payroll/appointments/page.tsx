'use client'
// ============================================================
// ARKZEN GENERATED PAGE — jo-payroll/appointments
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:15.780Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EmptyRow } from '../components/EmptyRow'
import { FundingBar } from '../components/FundingBar'
import { JOFormModal } from '../components/JOFormModal'
import { JORow } from '../components/JORow'
import { SectionHeader } from '../components/SectionHeader'
import { Spinner } from '../components/Spinner'
import { StatChip } from '../components/StatChip'
import { TabPills } from '../components/TabPills'
import { API_BASE } from '../components/constants'
import { usePayrollStore } from '../components/hooks'
import type { JobOrder, PayrollState, PayrollSummary } from '../components/types'
import { getAvatarColor, getInitials } from '../components/utils'
import { AppLayout } from '@/arkzen/core/layouts/custom/jo-payroll-app'
import { joPayrollAnimations, pageVariants } from '@/arkzen/generated/jo-payroll.animations'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'

// Page component code (from @arkzen:page:appointments)
const AppointmentsPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      if (jobOrders.length > 0) return
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders`)
        setJobOrders(await res.json())
      } catch { }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const sorted = useMemo(() =>
    [...jobOrders]
      .filter(j => j.appointment_order != null)
      .sort((a, b) => (a.appointment_order ?? 0) - (b.appointment_order ?? 0))
      .filter(j => search === '' || j.name_of_jo.toLowerCase().includes(search.toLowerCase()) || j.job_title.toLowerCase().includes(search.toLowerCase()))
  , [jobOrders, search])

  const activeCount   = useMemo(() => sorted.filter(j => j.status === 'active').length, [sorted])
  const inactiveCount = useMemo(() => sorted.filter(j => j.status === 'inactive').length, [sorted])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Stats */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <CalendarDays size={16} className="text-neutral-400 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{sorted.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Appointment Slots</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <CheckCircle size={16} className="text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{activeCount}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Active Slots</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <XCircle size={16} className="text-neutral-400 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{inactiveCount}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Inactive Slots</p>
        </div>
      </div>

      {/* List */}
      <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
          <SectionHeader title="Appointment Sequence" subtitle="JO workers ordered by appointment number" />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text" placeholder="Search name or title…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
            />
          </div>
        </div>
        {isLoading ? <Spinner /> : (
          <div className="px-5 py-4 space-y-1">
            {sorted.length === 0
              ? <EmptyRow message="No appointment records found" />
              : sorted.map((jo, i) => (
                  <div key={jo.id} className="jo-row flex items-center gap-4 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80 rounded-xl transition-colors px-1">
                    {/* Sequence number */}
                    <div className="w-8 h-8 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-neutral-600">#{jo.appointment_order}</span>
                    </div>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(jo.name_of_jo)}`}>
                      {getInitials(jo.name_of_jo)}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{jo.name_of_jo}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{jo.job_title} · JOR #{jo.jor_number}</p>
                    </div>
                    {/* Funding */}
                    <span className="hidden sm:block text-xs text-neutral-500 bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-lg font-medium shrink-0">
                      {jo.funding}
                    </span>
                    {/* Status */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${jo.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${jo.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                      {jo.status}
                    </span>
                  </div>
                ))
            }
          </div>
        )}
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_JoPayroll_Appointments = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = joPayrollAnimations(pageRef)
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
        <AppointmentsPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_JoPayroll_Appointments
