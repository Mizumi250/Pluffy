'use client'
// ============================================================
// ARKZEN GENERATED PAGE — jo-payroll/index
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-19T14:24:31.926Z
// ============================================================

import React, { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/arkzen/core/layouts/custom/jo-payroll-app'
import { joPayrollAnimations, pageVariants } from '@/arkzen/generated/jo-payroll.animations'
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
import { colors, deductions, formatPeso } from './components/utils'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit2, Trash2, X, Check, ChevronDown, Users, Banknote, CreditCard, Building2, Landmark, TrendingUp, TrendingDown, Wallet, AlertCircle, Download, FileText, Filter, MoreHorizontal, Eye, CalendarDays, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, RefreshCw, Printer } from 'lucide-react'

// Page component code (from @arkzen:page:index)
const DashboardPage = () => {
  const { summary, setSummary, jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [sumRes, joRes] = await Promise.all([
          fetch(`${API_BASE}/api/jo-payroll/job-orders/stats/summary`),
          fetch(`${API_BASE}/api/jo-payroll/job-orders`),
        ])
        const sumData = await sumRes.json()
        const joData  = await joRes.json()
        setSummary(sumData)
        setJobOrders(joData)
      } catch {
        // Use realistic mock data if API is unavailable
        setSummary({
          total_active: 11, total_inactive: 1, total_atm: 6, total_cash: 5,
          total_basic_pay: 4142, total_sss: 1140, total_hdmf_premium: 1100,
          total_hdmf_mpl: 1000, total_calamity_loan: 450,
          total_deductions: 3690, net_pay: 452,
          funding_breakdown: {
            'PUBLIC SERVICES': { count: 2, total_pay: 692 },
            'ADMIN': { count: 2, total_pay: 726 },
            'MAINTENANCE': { count: 2, total_pay: 692 },
            'SANITATION': { count: 2, total_pay: 692 },
            'SUPPLIES': { count: 2, total_pay: 692 },
            'HUMAN RESOURCES': { count: 2, total_pay: 726 },
          },
          group_breakdown: { 'GROUP A': 6, 'GROUP B': 6 },
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const recentJOs = useMemo(() => jobOrders.slice(0, 5), [jobOrders])
  const maxFunding = useMemo(() => {
    if (!summary?.funding_breakdown) return 1
    return Math.max(...Object.values(summary.funding_breakdown).map(v => v.count))
  }, [summary])

  if (isLoading) return <Spinner />

  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* ── Top row: Welcome + Stat chips ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Welcome banner */}
        <div className="welcome-banner lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex items-center gap-5">
          <div className="flex-1">
            <p className="text-xs text-neutral-400 font-medium mb-1">
              {today}
            </p>
            <h2 className="text-xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif] mb-1">
              J.O. Payroll Overview
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Manage all Job Order workers, track deductions, and process payroll for the LGU.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.push('/jo-payroll/job-database')}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-700 transition-colors"
              >
                <Plus size={13} /> Add J.O. Worker
              </button>
              <button
                onClick={() => router.push('/jo-payroll/payslip')}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <Printer size={13} /> Generate Payslip
              </button>
            </div>
          </div>
          {/* Decorative illustration area */}
          <div className="hidden md:flex items-center justify-center w-28 h-28 bg-neutral-50 rounded-2xl shrink-0">
            <div className="text-center">
              <p className="text-4xl font-black font-['Plus Jakarta Sans',sans-serif] text-neutral-900">
                {summary?.total_active ?? 0}
              </p>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">Active JOs</p>
            </div>
          </div>
        </div>

        {/* Quick stats column */}
        <div className="flex flex-col gap-3">
          <div className="stat-chip bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(summary?.net_pay)}</p>
                <p className="text-xs text-neutral-400">Net Pay (Active)</p>
              </div>
            </div>
          </div>
          <div className="stat-chip bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingDown size={16} className="text-rose-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(summary?.total_deductions)}</p>
                <p className="text-xs text-neutral-400">Total Deductions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat chips row ── */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Users size={16} className="text-neutral-400 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{summary?.total_active ?? 0}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Active Workers</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Banknote size={16} className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{summary?.total_cash ?? 0}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Cash Disbursement</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <CreditCard size={16} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{summary?.total_atm ?? 0}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">ATM Disbursement</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(summary?.total_basic_pay)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Gross Pay</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <AlertCircle size={16} className="text-neutral-400 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{summary?.total_inactive ?? 0}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Inactive Workers</p>
        </div>
      </div>

      {/* ── Main two-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent JO list — reference "Courses" list */}
        <div className="section-card lg:col-span-3 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <SectionHeader
            title="Job Orders"
            subtitle="Recent entries"
            action={
              <button
                onClick={() => router.push('/jo-payroll/job-database')}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                View all <ArrowUpRight size={13} />
              </button>
            }
          />
          <div className="space-y-0">
            {recentJOs.length === 0
              ? <EmptyRow message="No job orders found" />
              : recentJOs.map(jo => <JORow key={jo.id} jo={jo} onEdit={() => {}} onDelete={() => {}} />)
            }
          </div>
        </div>

        {/* Funding breakdown — reference "Your statistics" panel */}
        <div className="section-card lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <SectionHeader title="Funding Breakdown" subtitle="Active workers by source" />

          {/* Group chips */}
          <div className="flex gap-2 mb-5">
            {Object.entries(summary?.group_breakdown ?? {}).map(([g, count]) => (
              <div key={g} className="flex-1 bg-neutral-50 rounded-xl p-3 text-center border border-neutral-100">
                <p className="text-lg font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{count as number}</p>
                <p className="text-xs text-neutral-400 font-medium mt-0.5">{g}</p>
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="space-y-1">
            {Object.entries(summary?.funding_breakdown ?? {}).map(([label, v]) => (
              <FundingBar
                key={label}
                label={label}
                count={(v as { count: number }).count}
                total={(v as { total_pay: number }).total_pay}
                max={maxFunding}
              />
            ))}
          </div>

          {/* Premium CTA — reference "Learn even more!" card */}
          <div className="mt-5 bg-neutral-900 rounded-2xl p-4 text-white">
            <p className="text-sm font-bold font-['Plus Jakarta Sans',sans-serif] mb-1">Deduction Summary</p>
            <p className="text-xs text-neutral-400 mb-3">Total monthly deductions across all active workers.</p>
            <div className="space-y-1.5">
              {[
                { label: 'SSS', value: summary?.total_sss },
                { label: 'HDMF Premium', value: summary?.total_hdmf_premium },
                { label: 'HDMF MPL', value: summary?.total_hdmf_mpl },
                { label: 'Calamity Loan', value: summary?.total_calamity_loan },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <p className="text-xs text-neutral-400">{label}</p>
                  <p className="text-xs font-semibold text-white">{formatPeso(value)}</p>
                </div>
              ))}
              <div className="border-t border-neutral-700 pt-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold text-white">Total</p>
                <p className="text-xs font-bold text-emerald-400">{formatPeso(summary?.total_deductions)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_JoPayroll_Index = () => {
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
        <DashboardPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_JoPayroll_Index
