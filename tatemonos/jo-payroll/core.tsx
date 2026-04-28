/* @arkzen:meta
name: jo-payroll
version: 2.0.0
description: J.O Payroll System v2 — Job Order management, payroll processing, deductions tracking, cash/ATM groupings, and appointment sequencing for local government unit. Redesigned with dashboard-style UI.
auth: false
*/

/* @arkzen:config
toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: xl
  backdrop: blur
  animation: fadeScale
table:
  striped: false
  hoverable: true
layout:
  guest:
    className: "min-h-screen bg-neutral-100"
*/

/* @arkzen:database:job_orders
table: job_orders
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  jor_number:
    type: integer
    nullable: false
  name_of_jo:
    type: string
    length: 255
    nullable: false
  job_title:
    type: string
    length: 255
    nullable: false
    default: "LABORER"
  funding:
    type: string
    length: 255
    nullable: false
  basic_pay:
    type: decimal
    precision: 10
    scale: 2
    nullable: false
    default: 346
  disbursement_type:
    type: string
    length: 10
    nullable: false
    default: "CASH"
  jor_pyrl_group:
    type: string
    length: 100
    nullable: true
  hdmf_no:
    type: string
    length: 50
    nullable: true
  cash_card:
    type: string
    length: 50
    nullable: true
  cash_card_number:
    type: string
    length: 50
    nullable: true
  sss_number:
    type: string
    length: 30
    nullable: true
  sss_amount:
    type: decimal
    precision: 10
    scale: 2
    nullable: true
    default: 0
  calamity_loan:
    type: decimal
    precision: 10
    scale: 2
    nullable: true
    default: 0
  hdmf_mpl:
    type: decimal
    precision: 10
    scale: 2
    nullable: true
    default: 0
  hdmf_premium:
    type: decimal
    precision: 10
    scale: 2
    nullable: true
    default: 0
  last_name:
    type: string
    length: 100
    nullable: true
  first_name:
    type: string
    length: 100
    nullable: true
  middle_name:
    type: string
    length: 100
    nullable: true
  appointment_date:
    type: date
    nullable: true
  appointment_order:
    type: integer
    nullable: true
    default: 0
  status:
    type: string
    length: 20
    nullable: false
    default: "active"
seeder:
  count: 12
  data:
    - jor_number: 1
      name_of_jo: "DELA CRUZ, JUAN A."
      job_title: "LABORER"
      funding: "PUBLIC SERVICES"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "01-2345678-9"
      sss_amount: 100.00
      hdmf_premium: 100.00
      appointment_order: 1
      status: "active"
      cash_card_number: null
      calamity_loan: 0
      hdmf_mpl: 0
    - jor_number: 2
      name_of_jo: "REYES, MARIA B."
      job_title: "LABORER"
      funding: "ADMIN"
      basic_pay: 346.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      sss_number: "02-3456789-0"
      sss_amount: 100.00
      hdmf_premium: 100.00
      appointment_order: 2
      status: "active"
      cash_card_number: "4111111111111111"
      calamity_loan: 200.00
      hdmf_mpl: 0
    - jor_number: 3
      name_of_jo: "GARCIA, PEDRO C."
      job_title: "LABORER"
      funding: "MAINTENANCE"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "03-4567890-1"
      sss_amount: 100.00
      hdmf_premium: 0
      appointment_order: 3
      status: "active"
      cash_card_number: null
      calamity_loan: 0
      hdmf_mpl: 0
    - jor_number: 4
      name_of_jo: "SANTOS, ANA D."
      job_title: "UTILITY WORKER"
      funding: "SANITATION"
      basic_pay: 346.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      sss_number: "04-5678901-2"
      sss_amount: 100.00
      hdmf_premium: 100.00
      appointment_order: 4
      status: "active"
      cash_card_number: "4222222222222222"
      calamity_loan: 0
      hdmf_mpl: 500.00
    - jor_number: 5
      name_of_jo: "LOPEZ, JOSE E."
      job_title: "LABORER"
      funding: "SUPPLIES"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "05-6789012-3"
      sss_amount: 100.00
      hdmf_premium: 0
      appointment_order: 5
      status: "inactive"
      cash_card_number: null
      calamity_loan: 0
      hdmf_mpl: 0
    - jor_number: 6
      name_of_jo: "FLORES, CARMEN F."
      job_title: "UTILITY WORKER"
      funding: "HUMAN RESOURCES"
      basic_pay: 346.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      sss_number: "06-7890123-4"
      sss_amount: 100.00
      hdmf_premium: 100.00
      appointment_order: 6
      status: "active"
      cash_card_number: "4333333333333333"
      calamity_loan: 100.00
      hdmf_mpl: 200.00
    - jor_number: 7
      name_of_jo: "BAUTISTA, CARLO G."
      job_title: "LABORER"
      funding: "PUBLIC SERVICES"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "07-8901234-5"
      sss_amount: 100.00
      hdmf_premium: 100.00
      appointment_order: 7
      status: "active"
      cash_card_number: null
      calamity_loan: 0
      hdmf_mpl: 0
    - jor_number: 8
      name_of_jo: "MENDOZA, LITA H."
      job_title: "CLERK"
      funding: "ADMIN"
      basic_pay: 380.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      sss_number: "08-9012345-6"
      sss_amount: 120.00
      hdmf_premium: 100.00
      appointment_order: 8
      status: "active"
      cash_card_number: "4444444444444444"
      calamity_loan: 0
      hdmf_mpl: 0
    - jor_number: 9
      name_of_jo: "TORRES, RAMON I."
      job_title: "LABORER"
      funding: "MAINTENANCE"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "09-0123456-7"
      sss_amount: 100.00
      hdmf_premium: 0
      appointment_order: 9
      status: "active"
      cash_card_number: null
      calamity_loan: 0
      hdmf_mpl: 0
    - jor_number: 10
      name_of_jo: "VILLANUEVA, ROSA J."
      job_title: "UTILITY WORKER"
      funding: "SANITATION"
      basic_pay: 346.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      sss_number: "10-1234567-8"
      sss_amount: 100.00
      hdmf_premium: 100.00
      appointment_order: 10
      status: "active"
      cash_card_number: "4555555555555555"
      calamity_loan: 150.00
      hdmf_mpl: 0
    - jor_number: 11
      name_of_jo: "RAMOS, EDGAR K."
      job_title: "LABORER"
      funding: "SUPPLIES"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "11-2345678-9"
      sss_amount: 100.00
      hdmf_premium: 0
      appointment_order: 11
      status: "active"
      cash_card_number: null
      calamity_loan: 0
      hdmf_mpl: 0
    - jor_number: 12
      name_of_jo: "CASTRO, LINDA L."
      job_title: "CLERK"
      funding: "HUMAN RESOURCES"
      basic_pay: 380.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      sss_number: "12-3456789-0"
      sss_amount: 120.00
      hdmf_premium: 100.00
      appointment_order: 12
      status: "active"
      cash_card_number: "4666666666666666"
      calamity_loan: 0
      hdmf_mpl: 300.00
*/

/* @arkzen:api:job_orders
model: JobOrder
controller: JobOrderController
prefix: /api/jo-payroll
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /job-orders
    description: List all job orders
    response:
      type: collection

  store:
    method: POST
    route: /job-orders
    description: Create a new job order
    validation:
      jor_number: required|integer|min:0
      name_of_jo: required|string|max:255
      job_title: required|string|max:255
      funding: required|string|max:255
      basic_pay: required|numeric|min:0
      disbursement_type: required|string|in:CASH,ATM
      status: string|in:active,inactive
    response:
      type: single

  show:
    method: GET
    route: /job-orders/{id}
    description: Get single job order
    response:
      type: single

  update:
    method: PUT
    route: /job-orders/{id}
    description: Update job order
    validation:
      jor_number: integer|min:0
      name_of_jo: string|max:255
      job_title: string|max:255
      funding: string|max:255
      basic_pay: numeric|min:0
      disbursement_type: string|in:CASH,ATM
      status: string|in:active,inactive
    response:
      type: single

  destroy:
    method: DELETE
    route: /job-orders/{id}
    description: Delete job order
    response:
      type: message
      value: "Job order deleted successfully"

  summary:
    method: GET
    route: /job-orders/stats/summary
    description: Get payroll summary statistics
    response:
      type: single

  byGroup:
    method: GET
    route: /job-orders/group/{group}
    description: Get job orders by payroll group
    response:
      type: collection

  appointments:
    method: GET
    route: /job-orders/appointments/list
    description: Get appointment sequence list
    response:
      type: collection
*/

/* @arkzen:endpoint:summary
$activeJOs   = \App\Models\Arkzen\JoPayroll\JobOrder::where('status', 'active')->get();
$inactiveJOs = \App\Models\Arkzen\JoPayroll\JobOrder::where('status', 'inactive')->count();
$totalCash   = $activeJOs->where('disbursement_type', 'CASH')->count();
$totalAtm    = $activeJOs->where('disbursement_type', 'ATM')->count();
$totalBasicPay      = $activeJOs->sum('basic_pay');
$totalSss           = $activeJOs->sum('sss_amount');
$totalHdmfPremium   = $activeJOs->sum('hdmf_premium');
$totalHdmfMpl       = $activeJOs->sum('hdmf_mpl');
$totalCalamityLoan  = $activeJOs->sum('calamity_loan');
$totalDeductions    = $totalSss + $totalHdmfPremium + $totalHdmfMpl + $totalCalamityLoan;
$netPay             = $totalBasicPay - $totalDeductions;
$fundingBreakdown   = $activeJOs->groupBy('funding')->map(fn($g) => ['count' => $g->count(), 'total_pay' => $g->sum('basic_pay')]);
$groupBreakdown     = $activeJOs->groupBy('jor_pyrl_group')->map(fn($g) => $g->count());
return response()->json([
  'total_active'        => $activeJOs->count(),
  'total_inactive'      => $inactiveJOs,
  'total_atm'           => $totalAtm,
  'total_cash'          => $totalCash,
  'total_basic_pay'     => $totalBasicPay,
  'total_sss'           => $totalSss,
  'total_hdmf_premium'  => $totalHdmfPremium,
  'total_hdmf_mpl'      => $totalHdmfMpl,
  'total_calamity_loan' => $totalCalamityLoan,
  'total_deductions'    => $totalDeductions,
  'net_pay'             => $netPay,
  'funding_breakdown'   => $fundingBreakdown,
  'group_breakdown'     => $groupBreakdown,
]);
/* @arkzen:endpoint:summary:end */

/* @arkzen:endpoint:byGroup
$group = request()->route('group');
$orders = \App\Models\Arkzen\JoPayroll\JobOrder::where('jor_pyrl_group', $group)->where('status', 'active')->orderBy('jor_number')->get();
return response()->json($orders);
/* @arkzen:endpoint:byGroup:end */

/* @arkzen:endpoint:appointments
$orders = \App\Models\Arkzen\JoPayroll\JobOrder::whereNotNull('appointment_order')->orderBy('appointment_order')->get();
return response()->json($orders);
/* @arkzen:endpoint:appointments:end */

/* @arkzen:layout:app */

'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Database, Banknote, Building2,
  Landmark, CalendarDays, Menu, X, ChevronRight,
  LogOut, Bell
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/jo-payroll',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/jo-payroll/job-database', label: 'JO Database',  icon: Database        },
  { href: '/jo-payroll/cash-atm',     label: 'Cash / ATM',   icon: Banknote        },
  { href: '/jo-payroll/sss',          label: 'SSS',          icon: Building2       },
  { href: '/jo-payroll/hdmf',         label: 'HDMF',         icon: Landmark        },
  { href: '/jo-payroll/appointments', label: 'Appointments', icon: CalendarDays    },
  { href: '/jo-payroll/payslip',      label: 'Payslip',      icon: Banknote        },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const currentLabel = NAV_ITEMS.find(n => n.href === pathname)?.label ?? 'J.O Payroll'

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        .nav-pill { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .nav-pill:hover { transform: translateX(3px); }
        .nav-pill.active { transform: translateX(0); }
        .sidebar-glow { box-shadow: 4px 0 24px rgba(0,0,0,0.08); }
      `}</style>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-[72px] bg-neutral-900 flex flex-col
          sidebar-glow transition-all duration-300 lg:translate-x-0
          ${open ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-neutral-800 shrink-0">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <span className="text-neutral-900 font-['Syne',sans-serif] font-800 text-sm">J.</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => { router.push(href); setOpen(false) }}
                title={label}
                className={`nav-pill w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium group relative
                  ${active
                    ? 'active bg-white text-neutral-900'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${open ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:hidden'}`}>
                  {label}
                </span>
                {/* Tooltip for collapsed state on desktop */}
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden lg:block z-50 border border-neutral-700">
                  {label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Bottom logout */}
        <div className="px-2 pb-4 shrink-0">
          <button
            className="nav-pill w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-neutral-500 hover:bg-neutral-800 hover:text-red-400 group relative"
            title="Logout"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden lg:block z-50 border border-neutral-700">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-neutral-100 flex items-center px-6 gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">J.O. PAYROLL SYSTEM</p>
            <h1 className="text-sm font-semibold text-neutral-900 font-['Syne',sans-serif] -mt-0.5">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <Bell size={18} className="text-neutral-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-semibold font-['Syne',sans-serif]">LGU</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {mounted ? children : null}
        </main>
      </div>
    </div>
  )
}

/* @arkzen:layout:app:end */

/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import {
  Plus, Search, Edit2, Trash2, X, Check, ChevronDown,
  Users, Banknote, CreditCard, Building2, Landmark,
  TrendingUp, TrendingDown, Wallet, AlertCircle,
  Download, FileText, Filter, MoreHorizontal, Eye,
  CalendarDays, ArrowUpRight, ArrowDownRight, Clock,
  CheckCircle, XCircle, RefreshCw, Printer
} from 'lucide-react'

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
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
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

/* @arkzen:components:shared:end */

/* @arkzen:animation */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const joPayrollAnimations = (ref: React.RefObject<HTMLDivElement>) => {
  if (!ref.current) return () => {}

  const ctx = gsap.context(() => {
    // Stat chips stagger in
    gsap.from('.stat-chip', {
      opacity: 0,
      y: 20,
      scale: 0.95,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'all',
    })

    // Welcome banner slides in
    gsap.from('.welcome-banner', {
      opacity: 0,
      x: -24,
      duration: 0.6,
      ease: 'power3.out',
      clearProps: 'all',
    })

    // Card sections fade up
    gsap.from('.section-card', {
      opacity: 0,
      y: 30,
      duration: 0.55,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.15,
      clearProps: 'all',
    })

    // Table rows stagger
    gsap.from('.jo-row', {
      opacity: 0,
      x: -16,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.out',
      delay: 0.3,
      clearProps: 'all',
    })
  }, ref)

  return () => ctx.revert()
}

*/

/* @arkzen:page:index */
/* @arkzen:page:layout:app */

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
            <h2 className="text-xl font-bold text-neutral-900 font-['Syne',sans-serif] mb-1">
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
              <p className="text-4xl font-black font-['Syne',sans-serif] text-neutral-900">
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
                <p className="text-xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(summary?.net_pay)}</p>
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
                <p className="text-xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(summary?.total_deductions)}</p>
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
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{summary?.total_active ?? 0}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Active Workers</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Banknote size={16} className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{summary?.total_cash ?? 0}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Cash Disbursement</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <CreditCard size={16} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{summary?.total_atm ?? 0}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">ATM Disbursement</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(summary?.total_basic_pay)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Gross Pay</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <AlertCircle size={16} className="text-neutral-400 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{summary?.total_inactive ?? 0}</p>
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
                <p className="text-lg font-bold text-neutral-900 font-['Syne',sans-serif]">{count as number}</p>
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
            <p className="text-sm font-bold font-['Syne',sans-serif] mb-1">Deduction Summary</p>
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


/* @arkzen:page:index:end */

/* @arkzen:page:job-database */
/* @arkzen:page:layout:app */

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


/* @arkzen:page:job-database:end */

/* @arkzen:page:cash-atm */
/* @arkzen:page:layout:app */

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


/* @arkzen:page:cash-atm:end */

/* @arkzen:page:sss */
/* @arkzen:page:layout:app */

const SssPage = () => {
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
    jobOrders.filter(j => j.status === 'active' && (j.sss_amount ?? 0) > 0)
      .filter(j => search === '' || j.name_of_jo.toLowerCase().includes(search.toLowerCase()) || (j.sss_number ?? '').includes(search))
  , [jobOrders, search])

  const totalSss = useMemo(() => list.reduce((a, j) => a + (j.sss_amount ?? 0), 0), [list])
  const totalCalamity = useMemo(() => list.reduce((a, j) => a + (j.calamity_loan ?? 0), 0), [list])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Stats */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Building2 size={16} className="text-rose-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{list.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">SSS Members</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-rose-100 shadow-sm">
          <TrendingDown size={16} className="text-rose-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(totalSss)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">SSS Deductions</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <AlertCircle size={16} className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(totalCalamity)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Calamity Loans</p>
        </div>
      </div>

      {/* Table card */}
      <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
          <SectionHeader title="SSS Deductions" subtitle="Active workers with SSS contributions" />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text" placeholder="Search name or SSS number…" value={search}
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
                  {['#', 'Name', 'SSS Number', 'SSS Amount', 'Calamity Loan', 'Total'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0
                  ? <tr><td colSpan={6}><EmptyRow message="No SSS records found" /></td></tr>
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
                        <td className="px-5 py-3 text-xs font-mono text-neutral-600">{jo.sss_number ?? '—'}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-rose-600">{formatPeso(jo.sss_amount)}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-amber-600">{formatPeso(jo.calamity_loan)}</td>
                        <td className="px-5 py-3 text-xs font-bold text-neutral-900">{formatPeso((jo.sss_amount ?? 0) + (jo.calamity_loan ?? 0))}</td>
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


/* @arkzen:page:sss:end */

/* @arkzen:page:hdmf */
/* @arkzen:page:layout:app */

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
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{list.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">HDMF Members</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-violet-100 shadow-sm">
          <TrendingDown size={16} className="text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(totalPremium)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">HDMF Premium</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(totalMpl)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">HDMF MPL Loans</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-neutral-400 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(totalPremium + totalMpl)}</p>
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


/* @arkzen:page:hdmf:end */

/* @arkzen:page:appointments */
/* @arkzen:page:layout:app */

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
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{sorted.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Appointment Slots</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <CheckCircle size={16} className="text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{activeCount}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Active Slots</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <XCircle size={16} className="text-neutral-400 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{inactiveCount}</p>
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


/* @arkzen:page:appointments:end */

/* @arkzen:page:payslip */
/* @arkzen:page:layout:app */

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
                  <p className="text-sm font-bold text-neutral-900 font-['Syne',sans-serif] non-mono">LOCAL GOVERNMENT UNIT</p>
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
                  <span className="text-white font-bold font-['Syne',sans-serif] non-mono text-sm">NET PAY</span>
                  <span className="text-white font-bold font-['Syne',sans-serif] non-mono text-lg">{formatPeso(computedPay.net)}</span>
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


/* @arkzen:page:payslip:end */

/* @arkzen:error:404

import React from 'react'
import Link from 'next/link'

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-8 font-['DM_Sans',sans-serif]">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
    <div className="text-center max-w-md">
      <p className="text-[120px] font-black text-neutral-200 font-['Syne',sans-serif] leading-none">404</p>
      <h1 className="text-xl font-bold text-neutral-900 font-['Syne',sans-serif] -mt-2 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">The page you're looking for doesn't exist in this module.</p>
      <Link href="/jo-payroll" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  </div>
)


/* @arkzen:error:404:end */