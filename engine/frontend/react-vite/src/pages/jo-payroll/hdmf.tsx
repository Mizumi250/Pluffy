// ============================================================
// ARKZEN GENERATED PAGE — jo-payroll/hdmf [React+Vite]
// Layout: app | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-13T10:20:29.664Z
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
import { colors, formatPeso, getAvatarColor, getInitials } from './components/utils'
import { Plus, Search, Edit2, Trash2, X, Check, ChevronDown, Users, Banknote, CreditCard, Building2, Landmark, TrendingUp, TrendingDown, Wallet, AlertCircle, Download, FileText, Filter, MoreHorizontal, Eye, CalendarDays, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, RefreshCw, Printer } from 'lucide-react'

// ── Page component from @arkzen:page:hdmf ─────────────────────────────
const HdmfPage = () => {
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

  const list = useMemo(() =>
    jobOrders.filter(j => j.status === 'active' && ((j.hdmf_premium ?? 0) > 0 || (j.hdmf_mpl ?? 0) > 0))
      .filter(j => search === '' || j.name_of_jo.toLowerCase().includes(search.toLowerCase()))
  , [jobOrders, search])

  const totalPremium = useMemo(() => list.reduce((a, j) => a + (j.hdmf_premium ?? 0), 0), [list])
  const totalMpl     = useMemo(() => list.reduce((a, j) => a + (j.hdmf_mpl ?? 0), 0), [list])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Landmark size={16} className="text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{list.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">HDMF Members</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-violet-100 shadow-sm">
          <TrendingDown size={16} className="text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(totalPremium)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">HDMF Premium</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(totalMpl)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">HDMF MPL Loans</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-neutral-400 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(totalPremium + totalMpl)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Total HDMF</p>
        </div>
      </div>

      <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
          <SectionHeader title="HDMF Deductions" subtitle="Pag-IBIG premium and MPL loan tracking" />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text" placeholder="Search name…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
            />
          </div>
        </div>
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  {['#', 'Name', 'HDMF No.', 'Premium', 'MPL Loan', 'Total HDMF'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0
                  ? <tr><td colSpan={6}><EmptyRow message="No HDMF records found" /></td></tr>
                  : list.map((jo, i) => (
                      <tr key={jo.id} className="border-b border-neutral-50 hover:bg-neutral-50/80 transition-colors jo-row">
                        <td className="px-5 py-3 text-xs text-neutral-400">{i + 1}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(jo.name_of_jo)}`}>
                              {getInitials(jo.name_of_jo)}
                            </div>
                            <span className="font-medium text-neutral-900 text-xs whitespace-nowrap">{jo.name_of_jo}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs font-mono text-neutral-600">{jo.hdmf_no ?? '—'}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-violet-600">{formatPeso(jo.hdmf_premium)}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-blue-600">{formatPeso(jo.hdmf_mpl)}</td>
                        <td className="px-5 py-3 text-xs font-bold text-neutral-900">{formatPeso((jo.hdmf_premium ?? 0) + (jo.hdmf_mpl ?? 0))}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_JoPayroll_Hdmf = () => {
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
        <HdmfPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_JoPayroll_Hdmf
