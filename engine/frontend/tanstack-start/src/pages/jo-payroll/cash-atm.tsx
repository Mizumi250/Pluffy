// ============================================================
// ARKZEN GENERATED PAGE — jo-payroll/cash-atm
// Layout: app | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-20T15:47:18.583Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { create } from 'zustand'
import { AppLayout } from '@/arkzen/core/layouts/custom/jo-payroll-app'
import { joPayrollAnimations, pageVariants } from '@/arkzen/generated/jo-payroll.animations'

// Utilities, types, and helper functions from @arkzen:components
// ─── Types ─────────────────────────────────────────────────────────────────
export interface JobOrder {
  id: number
  jor_number: number
  name_of_jo: string
  job_title: string
  funding: string
  basic_pay: number
  disbursement_type: 'CASH' | 'ATM'
  jor_pyrl_group?: string
  hdmf_no?: string
  sss_number?: string
  sss_amount?: number
  calamity_loan?: number
  hdmf_mpl?: number
  hdmf_premium?: number
  cash_card_number?: string
  last_name?: string
  first_name?: string
  middle_name?: string
  appointment_date?: string
  appointment_order?: number
  status: 'active' | 'inactive'
  created_at?: string
}

export interface PayrollSummary {
  total_active: number
  total_inactive: number
  total_atm: number
  total_cash: number
  total_basic_pay: number
  total_sss: number
  total_hdmf_premium: number
  total_hdmf_mpl: number
  total_calamity_loan: number
  total_deductions: number
  net_pay: number
  funding_breakdown?: Record<string, { count: number; total_pay: number }>
  group_breakdown?: Record<string, number>
}

// ─── Store ──────────────────────────────────────────────────────────────────
interface PayrollState {
  jobOrders: JobOrder[]
  summary: PayrollSummary | null
  isLoading: boolean
  searchQuery: string
  activeTab: string
  setJobOrders: (orders: JobOrder[]) => void
  setSummary: (summary: PayrollSummary) => void
  setLoading: (loading: boolean) => void
  setSearchQuery: (q: string) => void
  setActiveTab: (tab: string) => void
  addJobOrder: (order: JobOrder) => void
  updateJobOrder: (id: number, order: JobOrder) => void
  removeJobOrder: (id: number) => void
}

export const usePayrollStore = create<PayrollState>((set) => ({
  jobOrders: [],
  summary: null,
  isLoading: false,
  searchQuery: '',
  activeTab: 'All',
  setJobOrders: (orders) => set({ jobOrders: orders }),
  setSummary: (summary) => set({ summary }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addJobOrder: (order) => set((s) => ({ jobOrders: [...s.jobOrders, order] })),
  updateJobOrder: (id, order) => set((s) => ({ jobOrders: s.jobOrders.map(j => j.id === id ? order : j) })),
  removeJobOrder: (id) => set((s) => ({ jobOrders: s.jobOrders.filter(j => j.id !== id) })),
}))

// ─── Constants ──────────────────────────────────────────────────────────────
const API_BASE = ''
export const FUNDING_OPTIONS = ['PUBLIC SERVICES', 'ADMIN', 'MAINTENANCE', 'SANITATION', 'SUPPLIES', 'HUMAN RESOURCES']
export const JOB_TITLES = ['LABORER', 'UTILITY WORKER', 'CLERK', 'DRIVER', 'SECURITY GUARD']
export const PYRL_GROUPS = ['GROUP A', 'GROUP B', 'GROUP C']

export const formatPeso = (v?: number) =>
  v == null ? '₱0.00' : `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export const getInitials = (name: string) => {
  const parts = name.replace(/,/g, '').trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

// Avatar color based on name hash
export const getAvatarColor = (name: string) => {
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ]
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// ─── Shared UI Components ───────────────────────────────────────────────────

export const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
  </div>
)

export const EmptyRow = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-3">
      <FileText size={20} className="text-neutral-400" />
    </div>
    <p className="text-sm font-medium text-neutral-500">{message}</p>
    <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or add a new entry.</p>
  </div>
)

// Stat card — matches the "11 Courses completed / 4 in progress" chips from the reference UI
export const StatChip = ({
  value, label, icon: Icon, accent = 'neutral'
}: {
  value: string | number
  label: string
  icon: React.ElementType
  accent?: 'neutral' | 'violet' | 'emerald' | 'rose' | 'amber' | 'blue'
}) => {
  const accents: Record<string, string> = {
    neutral: 'bg-white border-neutral-100',
    violet:  'bg-violet-50 border-violet-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    rose:    'bg-rose-50 border-rose-100',
    amber:   'bg-amber-50 border-amber-100',
    blue:    'bg-blue-50 border-blue-100',
  }
  const iconAccents: Record<string, string> = {
    neutral: 'text-neutral-600',
    violet:  'text-violet-600',
    emerald: 'text-emerald-600',
    rose:    'text-rose-600',
    amber:   'text-amber-600',
    blue:    'text-blue-600',
  }
  return (
    <div className={`flex-1 min-w-[120px] rounded-2xl border p-4 ${accents[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <Icon size={18} className={iconAccents[accent]} />
      </div>
      <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5 font-medium">{label}</p>
    </div>
  )
}

// Page section header — matching the reference UI style
export const SectionHeader = ({
  title, subtitle, action
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-base font-semibold text-neutral-900 font-['Syne',sans-serif]">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)

// Tab pills — matching the "All Courses / The Newest / Top Rated" row from reference
export const TabPills = ({
  tabs, active, onChange
}: {
  tabs: string[]
  active: string
  onChange: (t: string) => void
}) => (
  <div className="flex gap-1 flex-wrap">
    {tabs.map(t => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
          ${active === t
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
          }`}
      >
        {t}
      </button>
    ))}
  </div>
)

// JO row — replaces the "course row" in the reference UI
export const JORow = ({
  jo, onEdit, onDelete
}: {
  jo: JobOrder
  onEdit: (jo: JobOrder) => void
  onDelete: (id: number) => void
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = getInitials(jo.name_of_jo)
  const avatarColor = getAvatarColor(jo.name_of_jo)
  const deductions = (jo.sss_amount ?? 0) + (jo.hdmf_premium ?? 0) + (jo.hdmf_mpl ?? 0) + (jo.calamity_loan ?? 0)
  const netPay = jo.basic_pay - deductions

  return (
    <div className="flex items-center gap-4 py-3 border-b border-neutral-50 hover:bg-neutral-50/80 transition-colors group px-1 rounded-xl">
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
        {initials}
      </div>
      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate">{jo.name_of_jo}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{jo.job_title} · {jo.funding}</p>
      </div>
      {/* Pay info */}
      <div className="hidden sm:flex flex-col items-end shrink-0">
        <p className="text-xs font-semibold text-neutral-900">{formatPeso(netPay)}</p>
        <p className="text-xs text-neutral-400">net pay</p>
      </div>
      {/* Disbursement badge */}
      <div className="hidden md:block shrink-0">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
          jo.disbursement_type === 'ATM'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {jo.disbursement_type}
        </span>
      </div>
      {/* Status dot */}
      <div className="shrink-0">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          jo.status === 'active'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-neutral-100 text-neutral-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${jo.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
          {jo.status}
        </span>
      </div>
      {/* Action button — "View course" style */}
      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-700 transition-all"
        >
          Actions
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-neutral-100 rounded-xl shadow-lg overflow-hidden z-20">
              <button
                onClick={() => { onEdit(jo); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Edit2 size={13} /> Edit Record
              </button>
              <button
                onClick={() => { onDelete(jo.id); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Modal / Drawer for add/edit JO ──────────────────────────────────────────
export const JOFormModal = ({
  open, onClose, onSave, initial
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<JobOrder>) => void
  initial?: JobOrder | null
}) => {
  const [form, setForm] = useState<Partial<JobOrder>>(initial ?? {
    jor_number: 0,
    name_of_jo: '',
    job_title: 'LABORER',
    funding: 'PUBLIC SERVICES',
    basic_pay: 346,
    disbursement_type: 'CASH',
    jor_pyrl_group: 'GROUP A',
    sss_amount: 0,
    hdmf_premium: 0,
    hdmf_mpl: 0,
    calamity_loan: 0,
    status: 'active',
  })

  useEffect(() => {
    setForm(initial ?? {
      jor_number: 0, name_of_jo: '', job_title: 'LABORER',
      funding: 'PUBLIC SERVICES', basic_pay: 346,
      disbursement_type: 'CASH', jor_pyrl_group: 'GROUP A',
      sss_amount: 0, hdmf_premium: 0, hdmf_mpl: 0, calamity_loan: 0, status: 'active',
    })
  }, [initial, open])

  const set = (k: keyof JobOrder, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const inputCls = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
  const labelCls = "text-xs font-semibold text-neutral-600 mb-1 block"

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 font-['Syne',sans-serif]">
              {initial ? 'Edit Job Order' : 'New Job Order'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Fill in the employee payroll details</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <X size={16} className="text-neutral-500" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>JOR Number</label>
              <input type="number" className={inputCls} value={form.jor_number ?? ''} onChange={e => set('jor_number', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status ?? 'active'} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Full Name (LAST, FIRST MI.)</label>
            <input type="text" className={inputCls} value={form.name_of_jo ?? ''} placeholder="DELA CRUZ, JUAN A." onChange={e => set('name_of_jo', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Job Title</label>
              <select className={inputCls} value={form.job_title ?? 'LABORER'} onChange={e => set('job_title', e.target.value)}>
                {JOB_TITLES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Funding Source</label>
              <select className={inputCls} value={form.funding ?? ''} onChange={e => set('funding', e.target.value)}>
                {FUNDING_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Basic Pay (₱/day)</label>
              <input type="number" step="0.01" className={inputCls} value={form.basic_pay ?? ''} onChange={e => set('basic_pay', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Disbursement</label>
              <select className={inputCls} value={form.disbursement_type ?? 'CASH'} onChange={e => set('disbursement_type', e.target.value as 'CASH' | 'ATM')}>
                <option value="CASH">CASH</option>
                <option value="ATM">ATM</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Payroll Group</label>
              <select className={inputCls} value={form.jor_pyrl_group ?? 'GROUP A'} onChange={e => set('jor_pyrl_group', e.target.value)}>
                {PYRL_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>SSS Number</label>
              <input type="text" className={inputCls} value={form.sss_number ?? ''} placeholder="00-0000000-0" onChange={e => set('sss_number', e.target.value)} />
            </div>
          </div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest pt-1">Deductions</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>SSS Amount</label>
              <input type="number" step="0.01" className={inputCls} value={form.sss_amount ?? 0} onChange={e => set('sss_amount', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>HDMF Premium</label>
              <input type="number" step="0.01" className={inputCls} value={form.hdmf_premium ?? 0} onChange={e => set('hdmf_premium', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>HDMF MPL</label>
              <input type="number" step="0.01" className={inputCls} value={form.hdmf_mpl ?? 0} onChange={e => set('hdmf_mpl', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Calamity Loan</label>
              <input type="number" step="0.01" className={inputCls} value={form.calamity_loan ?? 0} onChange={e => set('calamity_loan', +e.target.value)} />
            </div>
          </div>
          {form.disbursement_type === 'ATM' && (
            <div>
              <label className={labelCls}>Cash Card Number</label>
              <input type="text" className={inputCls} value={form.cash_card_number ?? ''} onChange={e => set('cash_card_number', e.target.value)} />
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-700 transition-colors"
          >
            {initial ? 'Save Changes' : 'Add JO'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Mini bar chart for funding breakdown
export const FundingBar = ({ label, count, total, max }: { label: string; count: number; total: number; max: number }) => (
  <div className="flex items-center gap-3 py-1.5">
    <p className="text-xs text-neutral-500 w-28 truncate shrink-0">{label}</p>
    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-neutral-900 rounded-full transition-all duration-700"
        style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }}
      />
    </div>
    <p className="text-xs font-semibold text-neutral-700 w-6 text-right shrink-0">{count}</p>
  </div>
)

// Page component code (from @arkzen:page:cash-atm)
const CashAtmPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [activeGroup, setActiveGroup] = useState('All')

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

  const active = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const cashList = useMemo(() => active.filter(j => j.disbursement_type === 'CASH' && (activeGroup === 'All' || j.jor_pyrl_group === activeGroup)), [active, activeGroup])
  const atmList  = useMemo(() => active.filter(j => j.disbursement_type === 'ATM'  && (activeGroup === 'All' || j.jor_pyrl_group === activeGroup)), [active, activeGroup])

  const cashTotal = useMemo(() => cashList.reduce((a, j) => a + j.basic_pay, 0), [cashList])
  const atmTotal  = useMemo(() => atmList.reduce((a, j)  => a + j.basic_pay, 0), [atmList])

  const groups = useMemo(() => ['All', ...new Set(active.map(j => j.jor_pyrl_group ?? '').filter(Boolean))], [active])

  const DisbGroup = ({ title, list, total, accent }: { title: string; list: JobOrder[]; total: number; accent: string }) => (
    <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 font-['Syne',sans-serif]">{title}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{list.length} workers · {formatPeso(total)} total</p>
        </div>
        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${accent}`}>
          {title.includes('CASH') ? 'CASH' : 'ATM'}
        </span>
      </div>
      {isLoading
        ? <Spinner />
        : list.length === 0
          ? <EmptyRow message="No entries for this filter" />
          : list.map(jo => (
              <div key={jo.id} className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(jo.name_of_jo)}`}>
                  {getInitials(jo.name_of_jo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{jo.name_of_jo}</p>
                  <p className="text-xs text-neutral-400">{jo.jor_pyrl_group} · #{jo.jor_number}</p>
                </div>
                {jo.disbursement_type === 'ATM' && jo.cash_card_number && (
                  <p className="text-xs text-neutral-400 font-mono hidden sm:block">
                    ····{jo.cash_card_number.slice(-4)}
                  </p>
                )}
                <p className="text-sm font-semibold text-neutral-900 shrink-0">{formatPeso(jo.basic_pay)}</p>
              </div>
            ))
      }
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Stats row */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="stat-chip flex-1 min-w-[140px] bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <Banknote size={16} className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{cashList.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">CASH Workers</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">{formatPeso(cashTotal)}</p>
        </div>
        <div className="stat-chip flex-1 min-w-[140px] bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
          <CreditCard size={16} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{atmList.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">ATM Workers</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">{formatPeso(atmTotal)}</p>
        </div>
        <div className="stat-chip flex-1 min-w-[140px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(cashTotal + atmTotal)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Total Gross</p>
        </div>
      </div>

      {/* Group filter */}
      <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-3">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-neutral-500 shrink-0">Payroll Group:</p>
          <TabPills tabs={groups} active={activeGroup} onChange={setActiveGroup} />
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DisbGroup title="CASH Disbursement" list={cashList} total={cashTotal} accent="bg-amber-50 text-amber-700" />
        <DisbGroup title="ATM Disbursement"  list={atmList}  total={atmTotal}  accent="bg-blue-50 text-blue-700"   />
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_JoPayroll_CashAtm = () => {
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
        <CashAtmPage />
      </motion.div>
    </AppLayout>
  )
}

export default ArkzenPage_JoPayroll_CashAtm
