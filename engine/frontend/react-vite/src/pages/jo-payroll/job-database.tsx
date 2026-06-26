// ============================================================
// ARKZEN GENERATED PAGE — jo-payroll/job-database [React+Vite]
// Layout: app | Auth: false | Guest: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-26T07:08:58.886Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/jo-payroll-app'
import { joPayrollAnimations, pageVariants } from '@/arkzen/generated/jo-payroll.animations'
import { useNavigate } from 'react-router'
import { EmptyRow } from './components/EmptyRow'
import { FundingBar } from './components/FundingBar'
import { JOFormModal } from './components/JOFormModal'
import { JORow } from './components/JORow'
import { SectionHeader } from './components/SectionHeader'
import { Spinner } from './components/Spinner'
import { StatChip } from './components/StatChip'
import { TabPills } from './components/TabPills'
import { API_BASE } from './components/constants'
import { usePayrollStore } from './components/hooks'
import { colors } from './components/utils'
import type { JobOrder } from './components/types'
import { Plus, Search, Edit2, Trash2, X, Check, ChevronDown, Users, Banknote, CreditCard, Building2, Landmark, TrendingUp, TrendingDown, Wallet, AlertCircle, Download, FileText, Filter, MoreHorizontal, Eye, CalendarDays, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, RefreshCw, Printer } from 'lucide-react'

// ── Page component from @arkzen:page:job-database ─────────────────────────────
const JobDatabasePage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading, addJobOrder, updateJobOrder, removeJobOrder } = usePayrollStore()
  const [search, setSearch]           = useState('')
  const [activeTab, setActiveTab]     = useState('All')
  const [formOpen, setFormOpen]       = useState(false)
  const [editTarget, setEditTarget]   = useState<JobOrder | null>(null)

  const TABS = ['All', 'Active', 'Inactive', 'CASH', 'ATM']

  useEffect(() => {
    const load = async () => {
      if (jobOrders.length > 0) return
      setLoading(true)
      try {
        const res  = await fetch(`${API_BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(data)
      } catch { /* use existing */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return jobOrders.filter(jo => {
      const matchSearch = search === '' ||
        jo.name_of_jo.toLowerCase().includes(search.toLowerCase()) ||
        jo.funding.toLowerCase().includes(search.toLowerCase()) ||
        (jo.sss_number ?? '').includes(search)
      const matchTab =
        activeTab === 'All'      ? true :
        activeTab === 'Active'   ? jo.status === 'active' :
        activeTab === 'Inactive' ? jo.status === 'inactive' :
        activeTab === 'CASH'     ? jo.disbursement_type === 'CASH' :
        activeTab === 'ATM'      ? jo.disbursement_type === 'ATM' : true
      return matchSearch && matchTab
    })
  }, [jobOrders, search, activeTab])

  const handleSave = async (data: Partial<JobOrder>) => {
    try {
      if (editTarget) {
        const res  = await fetch(`${API_BASE}/api/jo-payroll/job-orders/${editTarget.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        })
        const updated = await res.json()
        updateJobOrder(editTarget.id, updated)
      } else {
        const res  = await fetch(`${API_BASE}/api/jo-payroll/job-orders`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        })
        const created = await res.json()
        addJobOrder(created)
      }
    } catch { /* silent */ }
    setFormOpen(false)
    setEditTarget(null)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this J.O. worker?')) return
    try {
      await fetch(`${API_BASE}/api/jo-payroll/job-orders/${id}`, { method: 'DELETE' })
    } catch { /* silent */ }
    removeJobOrder(id)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      <JOFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        onSave={handleSave}
        initial={editTarget}
      />

      {/* Header card */}
      <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <SectionHeader
              title="JO Database"
              subtitle={`${filtered.length} records found`}
            />
            {/* Search + tabs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search name, funding, SSS no…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
                />
              </div>
              <TabPills tabs={TABS} active={activeTab} onChange={setActiveTab} />
            </div>
          </div>
          <button
            onClick={() => { setEditTarget(null); setFormOpen(true) }}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors"
          >
            <Plus size={15} /> Add J.O.
          </button>
        </div>
      </div>

      {/* List card */}
      <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
        {isLoading
          ? <Spinner />
          : filtered.length === 0
            ? <EmptyRow message="No records match your filters" />
            : <div>
                {filtered.map(jo => (
                  <div key={jo.id} className="jo-row">
                    <JORow
                      jo={jo}
                      onEdit={j => { setEditTarget(j); setFormOpen(true) }}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
        }
      </div>
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_JoPayroll_JobDatabase = () => {
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
        <JobDatabasePage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_JoPayroll_JobDatabase
