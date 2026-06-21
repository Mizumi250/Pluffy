'use client'
// ============================================================
// ARKZEN GENERATED PAGE — jo-payroll/payslip
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:37.292Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/jo-payroll-app'
import { joPayrollAnimations, pageVariants } from '@/arkzen/generated/jo-payroll.animations'
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
import { colors, deductions, formatPeso, getAvatarColor, getInitials } from '../components/utils'
import type { JobOrder } from '../components/types'
import { Plus, Search, Edit2, Trash2, X, Check, ChevronDown, Users, Banknote, CreditCard, Building2, Landmark, TrendingUp, TrendingDown, Wallet, AlertCircle, Download, FileText, Filter, MoreHorizontal, Eye, CalendarDays, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, RefreshCw, Printer } from 'lucide-react'

// Page component code (from @arkzen:page:payslip)
const PayslipPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<JobOrder | null>(null)
  const [payPeriod, setPayPeriod] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [workDays, setWorkDays] = useState(26)

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

  const activeJOs = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const filtered  = useMemo(() => activeJOs.filter(j => search === '' || j.name_of_jo.toLowerCase().includes(search.toLowerCase())), [activeJOs, search])

  const computedPay = useMemo(() => {
    if (!selected) return null
    const gross      = selected.basic_pay * workDays
    const sss        = selected.sss_amount ?? 0
    const hdmfPrem   = selected.hdmf_premium ?? 0
    const hdmfMpl    = selected.hdmf_mpl ?? 0
    const calamity   = selected.calamity_loan ?? 0
    const deductions = sss + hdmfPrem + hdmfMpl + calamity
    return { gross, sss, hdmfPrem, hdmfMpl, calamity, deductions, net: gross - deductions }
  }, [selected, workDays])

  const [yr, mo] = payPeriod.split('-')
  const periodLabel = new Date(+yr, +mo - 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Worker picker */}
        <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <SectionHeader title="Select Worker" subtitle="Choose a JO worker to generate payslip" />

          {/* Period + days */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block">Pay Period</label>
              <input
                type="month" value={payPeriod} onChange={e => setPayPeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block">Work Days</label>
              <input
                type="number" min="1" max="31" value={workDays} onChange={e => setWorkDays(+e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text" placeholder="Search worker…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
            />
          </div>

          {isLoading ? <Spinner /> : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filtered.map(jo => (
                <button
                  key={jo.id}
                  onClick={() => setSelected(jo)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    selected?.id === jo.id
                      ? 'bg-neutral-900 text-white'
                      : 'hover:bg-neutral-50 border border-transparent hover:border-neutral-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    selected?.id === jo.id ? 'bg-white text-neutral-900' : getAvatarColor(jo.name_of_jo)
                  }`}>
                    {getInitials(jo.name_of_jo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${selected?.id === jo.id ? 'text-white' : 'text-neutral-900'}`}>{jo.name_of_jo}</p>
                    <p className={`text-xs truncate ${selected?.id === jo.id ? 'text-neutral-400' : 'text-neutral-400'}`}>{jo.job_title} · {formatPeso(jo.basic_pay)}/day</p>
                  </div>
                  <span className={`text-xs font-medium shrink-0 ${selected?.id === jo.id ? 'text-neutral-300' : 'text-neutral-400'}`}>#{jo.jor_number}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payslip preview */}
        <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          {!selected || !computedPay ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-3">
                <FileText size={20} className="text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-500">No worker selected</p>
              <p className="text-xs text-neutral-400 mt-1">Select a worker from the left to preview their payslip.</p>
            </div>
          ) : (
            <div>
              {/* Payslip document */}
              <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-5 font-mono text-xs">
                {/* Header */}
                <div className="text-center border-b border-neutral-200 pb-4 mb-4">
                  <p className="text-sm font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif] non-mono">LOCAL GOVERNMENT UNIT</p>
                  <p className="text-xs text-neutral-500 non-mono">Job Order Payroll System</p>
                  <p className="text-xs text-neutral-400 mt-1 non-mono">Pay Period: {periodLabel}</p>
                </div>
                {/* Worker info */}
                <div className="grid grid-cols-2 gap-1 mb-4 text-neutral-600">
                  <span className="text-neutral-400">Name:</span>
                  <span className="font-semibold text-neutral-900">{selected.name_of_jo}</span>
                  <span className="text-neutral-400">JOR #:</span>
                  <span>{selected.jor_number}</span>
                  <span className="text-neutral-400">Title:</span>
                  <span>{selected.job_title}</span>
                  <span className="text-neutral-400">Funding:</span>
                  <span>{selected.funding}</span>
                  <span className="text-neutral-400">Disbursement:</span>
                  <span>{selected.disbursement_type}</span>
                  <span className="text-neutral-400">Days Worked:</span>
                  <span>{workDays} days</span>
                </div>
                {/* Pay */}
                <div className="border-t border-neutral-200 pt-3 mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-400">Basic Pay ({formatPeso(selected.basic_pay)}/day × {workDays})</span>
                    <span className="font-semibold text-neutral-900">{formatPeso(computedPay.gross)}</span>
                  </div>
                </div>
                {/* Deductions */}
                <div className="border-t border-neutral-200 pt-3 mb-3 space-y-1">
                  <p className="text-neutral-400 mb-1">DEDUCTIONS:</p>
                  {computedPay.sss > 0       && <div className="flex justify-between"><span>SSS Contribution</span><span className="text-rose-600">({formatPeso(computedPay.sss)})</span></div>}
                  {computedPay.hdmfPrem > 0  && <div className="flex justify-between"><span>HDMF Premium</span><span className="text-rose-600">({formatPeso(computedPay.hdmfPrem)})</span></div>}
                  {computedPay.hdmfMpl > 0   && <div className="flex justify-between"><span>HDMF MPL</span><span className="text-rose-600">({formatPeso(computedPay.hdmfMpl)})</span></div>}
                  {computedPay.calamity > 0  && <div className="flex justify-between"><span>Calamity Loan</span><span className="text-rose-600">({formatPeso(computedPay.calamity)})</span></div>}
                  <div className="flex justify-between border-t border-neutral-200 pt-1">
                    <span className="text-neutral-400">Total Deductions</span>
                    <span className="font-semibold text-rose-600">({formatPeso(computedPay.deductions)})</span>
                  </div>
                </div>
                {/* Net */}
                <div className="bg-neutral-900 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-white font-bold font-['Plus Jakarta Sans',sans-serif] non-mono text-sm">NET PAY</span>
                  <span className="text-white font-bold font-['Plus Jakarta Sans',sans-serif] non-mono text-lg">{formatPeso(computedPay.net)}</span>
                </div>
              </div>
              {/* Print */}
              <button
                onClick={() => window.print()}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                <Printer size={15} /> Print Payslip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_JoPayroll_Payslip = () => {
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
        <PayslipPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_JoPayroll_Payslip
