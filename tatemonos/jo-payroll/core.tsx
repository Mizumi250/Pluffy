/* @arkzen:meta
name: jo-payroll
version: 2.0.0
description: J.O Payroll System v2 — Job Order management, payroll processing, deductions tracking, cash/ATM groupings, and appointment sequencing for local government unit. Redesigned with dashboard-style UI.
auth: false
*/

/* @arkzen:web:config
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
*/
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
*/
$group = request()->route('group');
$orders = \App\Models\Arkzen\JoPayroll\JobOrder::where('jor_pyrl_group', $group)->where('status', 'active')->orderBy('jor_number')->get();
return response()->json($orders);
/* @arkzen:endpoint:byGroup:end */

/* @arkzen:endpoint:appointments
*/
$orders = \App\Models\Arkzen\JoPayroll\JobOrder::whereNotNull('appointment_order')->orderBy('appointment_order')->get();
return response()->json($orders);
/* @arkzen:endpoint:appointments:end */

/* @arkzen:web:layout:app */

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
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden font-['Inter',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
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
            <span className="text-neutral-900 font-['Plus Jakarta Sans',sans-serif] font-800 text-sm">J.</span>
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
            <h1 className="text-sm font-semibold text-neutral-900 font-['Plus Jakarta Sans',sans-serif] -mt-0.5">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <Bell size={18} className="text-neutral-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-semibold font-['Plus Jakarta Sans',sans-serif]">LGU</span>
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

/* @arkzen:web:layout:app:end */

/* @arkzen:web:components:shared */

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
      <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{value}</p>
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
      <h2 className="text-base font-semibold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{title}</h2>
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
            <h3 className="text-sm font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">
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

/* @arkzen:web:components:shared:end */

/* @arkzen:web:animation */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const joPayrollAnimations = (ref: React.RefObject<HTMLDivElement | null>) => {
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

/* @arkzen:web:animation:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:app */

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


/* @arkzen:web:page:index:end */

/* @arkzen:web:page:job-database */
/* @arkzen:web:page:layout:app */

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


/* @arkzen:web:page:job-database:end */

/* @arkzen:web:page:cash-atm */
/* @arkzen:web:page:layout:app */

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
          <h3 className="text-sm font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{title}</h3>
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
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{cashList.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">CASH Workers</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">{formatPeso(cashTotal)}</p>
        </div>
        <div className="stat-chip flex-1 min-w-[140px] bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
          <CreditCard size={16} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{atmList.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">ATM Workers</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">{formatPeso(atmTotal)}</p>
        </div>
        <div className="stat-chip flex-1 min-w-[140px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(cashTotal + atmTotal)}</p>
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


/* @arkzen:web:page:cash-atm:end */

/* @arkzen:web:page:sss */
/* @arkzen:web:page:layout:app */

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
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{list.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">SSS Members</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-rose-100 shadow-sm">
          <TrendingDown size={16} className="text-rose-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(totalSss)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">SSS Deductions</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <AlertCircle size={16} className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{formatPeso(totalCalamity)}</p>
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


/* @arkzen:web:page:sss:end */

/* @arkzen:web:page:hdmf */
/* @arkzen:web:page:layout:app */

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


/* @arkzen:web:page:hdmf:end */

/* @arkzen:web:page:appointments */
/* @arkzen:web:page:layout:app */

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


/* @arkzen:web:page:appointments:end */

/* @arkzen:web:page:payslip */
/* @arkzen:web:page:layout:app */

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


/* @arkzen:web:page:payslip:end */

/* @arkzen:web:error:404 */

import React from 'react'
import Link from 'next/link'

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-8 font-['Inter',sans-serif]">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Plus Jakarta Sans:wght@700;800&display=swap');`}</style>
    <div className="text-center max-w-md">
      <p className="text-[120px] font-black text-neutral-200 font-['Plus Jakarta Sans',sans-serif] leading-none">404</p>
      <h1 className="text-xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif] -mt-2 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">The page you're looking for doesn't exist in this module.</p>
      <Link href="/jo-payroll" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  </div>
)


/* @arkzen:web:error:404:end */

/* @arkzen:native:error:404 */

/* @arkzen:import:expo */
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
/* @arkzen:import:rn:end */

/* @arkzen:import:expo */
const NativeNotFoundScreen = () => {
  const router = useRouter()
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F5F7', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 96, fontWeight: '900', color: '#e5e7eb', letterSpacing: -4 }}>404</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginTop: -8, marginBottom: 8 }}>Page not found</Text>
      <Text style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 24 }}>
        The page you're looking for doesn't exist in this module.
      </Text>
      <TouchableOpacity
        onPress={() => router.replace('/jo-payroll' as any)}
        activeOpacity={0.8}
        style={{ backgroundColor: '#171717', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
      >
        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  )
}
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
const NativeNotFoundScreen = () => {
  const navigation = useNavigation()
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F5F7', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 96, fontWeight: '900', color: '#e5e7eb', letterSpacing: -4 }}>404</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginTop: -8, marginBottom: 8 }}>Page not found</Text>
      <Text style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 24 }}>
        The page you're looking for doesn't exist in this module.
      </Text>
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('JoPayrollIndex')}
        activeOpacity={0.8}
        style={{ backgroundColor: '#171717', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
      >
        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  )
}
/* @arkzen:import:rn:end */

/* @arkzen:native:error:404:end */

/* @arkzen:meta:native
label: J.O. Payroll
description: Job Order payroll viewer for LGU workers — payslip, deductions, and worker directory
expo:
  bundle_id: com.arkzen.jopayroll
  scheme: jopayroll
  version: 2.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:native:config
theme:
  primary: "#171717"
  background: "#F4F5F7"
  surface: "#ffffff"
  border: "#e5e7eb"
  muted: "#9ca3af"
  text: "#111827"
  subtext: "#6b7280"
  emerald: "#059669"
  rose: "#e11d48"
  amber: "#d97706"
  violet: "#7c3aed"
  blue: "#2563eb"
*/

/* --- Native style block removed --- */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import { create } from 'zustand'
import { Search, TrendingDown, TrendingUp, Users, Banknote, CreditCard, Wallet, Building2, Landmark, AlertCircle } from 'lucide-react-native'

export const BASE = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import { create } from 'zustand'
import { Search, TrendingDown, TrendingUp, Users, Banknote, CreditCard, Wallet, Building2, Landmark, AlertCircle } from 'lucide-react-native'

export const BASE = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

// ── Types ────────────────────────────────────────────────────

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
  appointment_order?: number
  status: 'active' | 'inactive'
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

// ── Store ────────────────────────────────────────────────────

interface PayrollStore {
  jobOrders: JobOrder[]
  summary: PayrollSummary | null
  isLoading: boolean
  setJobOrders: (o: JobOrder[]) => void
  setSummary: (s: PayrollSummary) => void
  setLoading: (v: boolean) => void
}

export const usePayrollStore = create<PayrollStore>((set) => ({
  jobOrders: [],
  summary: null,
  isLoading: false,
  setJobOrders: (jobOrders) => set({ jobOrders }),
  setSummary: (summary) => set({ summary }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// ── Utils ────────────────────────────────────────────────────

export const formatPeso = (v?: number) =>
  v == null ? '₱0.00' : `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const getInitials = (name: string) => {
  const parts = name.replace(/,/g, '').trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#ffe4e6', text: '#e11d48' },
  { bg: '#cffafe', text: '#0891b2' },
]

export const getAvatarColor = (name: string) => {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

// ── Avatar ───────────────────────────────────────────────────

export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const color = getAvatarColor(name)
  return (
    <View
      className="items-center justify-center rounded-[10px]"
      style={{ width: size, height: size, backgroundColor: color.bg }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: color.text }}>
        {getInitials(name)}
      </Text>
    </View>
  )
}

// ── StatCard ─────────────────────────────────────────────────

export const StatCard = ({ value, label, color = '#111827', bg = '#ffffff', borderColor = '#e5e7eb' }: {
  value: string | number
  label: string
  color?: string
  bg?: string
  borderColor?: string
}) => (
  <View
    className="flex-1 rounded-2xl border p-3.5"
    style={{ backgroundColor: bg, borderColor }}
  >
    <Text className="text-[22px] font-bold" style={{ color }}>{value}</Text>
    <Text className="text-[11px] text-gray-400 font-medium mt-0.5">{label}</Text>
  </View>
)

// ── WorkerRow ────────────────────────────────────────────────

export const WorkerRow = ({ jo, onPress }: { jo: JobOrder; onPress?: () => void }) => {
  const deductions = (jo.sss_amount ?? 0) + (jo.hdmf_premium ?? 0) + (jo.hdmf_mpl ?? 0) + (jo.calamity_loan ?? 0)
  const netPay = jo.basic_pay - deductions

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 border-b border-gray-50"
      style={{ gap: 12 }}
    >
      <Avatar name={jo.name_of_jo} size={38} />
      <View className="flex-1">
        <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={1}>{jo.name_of_jo}</Text>
        <Text className="text-[11px] text-gray-400 mt-0.5">{jo.job_title} · {jo.funding}</Text>
      </View>
      <View className="items-end" style={{ gap: 4 }}>
        <Text className="text-[13px] font-bold text-gray-900">{formatPeso(netPay)}</Text>
        <View className={`rounded-md px-1.5 py-0.5 ${jo.disbursement_type === 'ATM' ? 'bg-blue-100' : 'bg-amber-100'}`}>
          <Text className={`text-[10px] font-bold ${jo.disbursement_type === 'ATM' ? 'text-blue-600' : 'text-amber-600'}`}>
            {jo.disbursement_type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── SearchBar ────────────────────────────────────────────────

export const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5" style={{ gap: 8 }}>
    <Search size={14} color="#9ca3af" />
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder ?? 'Search…'}
      placeholderTextColor="#d1d5db"
      className="flex-1 text-[13px] text-gray-900"
    />
  </View>
)

// ── TabRow ───────────────────────────────────────────────────

export const TabRow = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) => (
  <View className="flex-row flex-wrap" style={{ gap: 4 }}>
    {tabs.map(t => (
      <TouchableOpacity
        key={t}
        onPress={() => onChange(t)}
        activeOpacity={0.7}
        className={`rounded-lg px-3 py-1.5 ${active === t ? 'bg-[#171717]' : 'bg-transparent'}`}
      >
        <Text className={`text-xs font-semibold ${active === t ? 'text-white' : 'text-gray-400'}`}>{t}</Text>
      </TouchableOpacity>
    ))}
  </View>
)

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:app */

import Animated, { FadeInDown } from 'react-native-reanimated'

const DashboardScreen = () => {
  const { summary, setSummary, jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()

  useEffect(() => {
    if (summary && jobOrders.length > 0) return
    const load = async () => {
      setLoading(true)
      try {
        const [sumRes, joRes] = await Promise.all([
          fetch(`${BASE}/api/jo-payroll/job-orders/stats/summary`),
          fetch(`${BASE}/api/jo-payroll/job-orders`),
        ])
        setSummary(await sumRes.json())
        const joData = await joRes.json()
        setJobOrders(Array.isArray(joData) ? joData : joData.data ?? [])
      } catch {
        setSummary({
          total_active: 11, total_inactive: 1, total_atm: 6, total_cash: 5,
          total_basic_pay: 4142, total_sss: 1140, total_hdmf_premium: 1100,
          total_hdmf_mpl: 1000, total_calamity_loan: 450,
          total_deductions: 3690, net_pay: 452,
          group_breakdown: { 'GROUP A': 6, 'GROUP B': 6 },
        })
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const recentJOs = useMemo(() => jobOrders.slice(0, 5), [jobOrders])

  if (isLoading) return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color="#171717" />
    </View>
  )

  return (
    <ScrollView className="flex-1 bg-[#F4F5F7]" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 24 }}>

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} className="mb-4">
        <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">J.O. PAYROLL SYSTEM</Text>
        <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Dashboard</Text>
      </Animated.View>

      {/* Net pay hero */}
      <Animated.View entering={FadeInDown.duration(400).delay(60)} className="bg-[#171717] rounded-[20px] p-5 mb-3">
        <Text className="text-[11px] text-gray-500 font-semibold tracking-[1.5px] mb-2">ACTIVE WORKERS NET PAY</Text>
        <Text className="text-[32px] font-extrabold text-white -tracking-[1px]">{formatPeso(summary?.net_pay)}</Text>
        <View className="flex-row mt-3" style={{ gap: 16 }}>
          <View>
            <Text className="text-[11px] text-gray-500">Gross Pay</Text>
            <Text className="text-[13px] font-semibold text-white mt-0.5">{formatPeso(summary?.total_basic_pay)}</Text>
          </View>
          <View>
            <Text className="text-[11px] text-gray-500">Total Deductions</Text>
            <Text className="text-[13px] font-semibold text-red-400 mt-0.5">{formatPeso(summary?.total_deductions)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Stat row */}
      <Animated.View entering={FadeInDown.duration(400).delay(120)} className="flex-row mb-3" style={{ gap: 10 }}>
        <StatCard value={summary?.total_active ?? 0}   label="Active JOs"   color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        <StatCard value={summary?.total_cash ?? 0}     label="Cash"         color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
        <StatCard value={summary?.total_atm ?? 0}      label="ATM"          color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        <StatCard value={summary?.total_inactive ?? 0} label="Inactive"     color="#9ca3af" />
      </Animated.View>

      {/* Deduction breakdown */}
      <Animated.View entering={FadeInDown.duration(400).delay(180)} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
        <Text className="text-[13px] font-bold text-gray-900 mb-3">Deduction Breakdown</Text>
        {[
          { label: 'SSS',           value: summary?.total_sss,          color: '#e11d48' },
          { label: 'HDMF Premium',  value: summary?.total_hdmf_premium, color: '#7c3aed' },
          { label: 'HDMF MPL',      value: summary?.total_hdmf_mpl,     color: '#2563eb' },
          { label: 'Calamity Loan', value: summary?.total_calamity_loan, color: '#d97706' },
        ].map(({ label, value, color }) => (
          <View key={label} className="flex-row items-center justify-between py-2 border-b border-gray-50">
            <Text className="text-[13px] text-gray-700">{label}</Text>
            <Text className="text-[13px] font-semibold" style={{ color }}>{formatPeso(value)}</Text>
          </View>
        ))}
        <View className="flex-row items-center justify-between pt-2.5">
          <Text className="text-[13px] font-bold text-gray-900">Total</Text>
          <Text className="text-sm font-extrabold text-red-600">{formatPeso(summary?.total_deductions)}</Text>
        </View>
      </Animated.View>

      {/* Recent JOs */}
      <Animated.View entering={FadeInDown.duration(400).delay(240)} className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-3">
        <View className="px-4 py-3.5 border-b border-gray-100">
          <Text className="text-[13px] font-bold text-gray-900">Recent Workers</Text>
          <Text className="text-[11px] text-gray-400 mt-0.5">Latest 5 entries</Text>
        </View>
        {recentJOs.length === 0
          ? <View className="p-8 items-center"><Text className="text-[13px] text-gray-400">No data</Text></View>
          : recentJOs.map(jo => <WorkerRow key={jo.id} jo={jo} />)
        }
      </Animated.View>

    </ScrollView>
  )
}

/* @arkzen:native:page:index:end */

/* @arkzen:native:page:job-database */
/* @arkzen:native:page:layout:app */

import Animated, { FadeInDown } from 'react-native-reanimated'

const WorkersScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [expanded, setExpanded] = useState<number | null>(null)

  const TABS = ['All', 'Active', 'Inactive', 'CASH', 'ATM']

  useEffect(() => {
    if (jobOrders.length > 0) return
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(Array.isArray(data) ? data : data.data ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = useMemo(() =>
    jobOrders.filter(jo => {
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
    }), [jobOrders, search, activeTab])

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      {/* Fixed header */}
      <View style={{ backgroundColor: '#F4F5F7', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 }}>
        <Animated.View entering={FadeInDown.duration(350)}>
          <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">JO DATABASE</Text>
          <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Workers</Text>
        </Animated.View>
        <View style={{ gap: 8, marginTop: 12 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, funding, SSS…" />
          <TabRow tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </View>
        <Text className="text-[11px] text-gray-400 mt-2">{filtered.length} records</Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color="#171717" />
        </View>
      ) : (
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 overflow-hidden pb-2">
          {filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text className="text-[13px] text-gray-400">No records found</Text>
            </View>
          ) : filtered.map(jo => (
            <View key={jo.id}>
              <WorkerRow jo={jo} onPress={() => setExpanded(expanded === jo.id ? null : jo.id)} />
              {expanded === jo.id && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      { label: 'JOR #',      value: String(jo.jor_number) },
                      { label: 'Group',      value: jo.jor_pyrl_group ?? '—' },
                      { label: 'SSS No.',    value: jo.sss_number ?? '—' },
                      { label: 'Basic Pay',  value: `${formatPeso(jo.basic_pay)}/day` },
                      { label: 'SSS',        value: formatPeso(jo.sss_amount) },
                      { label: 'HDMF Prem.', value: formatPeso(jo.hdmf_premium) },
                      { label: 'HDMF MPL',   value: formatPeso(jo.hdmf_mpl) },
                      { label: 'Calamity',   value: formatPeso(jo.calamity_loan) },
                    ].map(({ label, value }) => (
                      <View key={label} className="flex-1 bg-white rounded-[10px] border border-gray-200 px-2.5 py-2" style={{ minWidth: '44%' }}>
                        <Text className="text-[10px] text-gray-400 font-semibold mb-0.5">{label}</Text>
                        <Text className="text-xs font-semibold text-gray-900">{value}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <View className={`rounded-lg px-2.5 py-1.5 ${jo.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <Text className={`text-[11px] font-semibold ${jo.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {jo.status.toUpperCase()}
                      </Text>
                    </View>
                    {jo.cash_card_number && (
                      <View className="bg-blue-50 rounded-lg px-2.5 py-1.5">
                        <Text className="text-[11px] font-semibold text-blue-600">
                          ····{jo.cash_card_number.slice(-4)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

/* @arkzen:native:page:job-database:end */

/* @arkzen:native:page:cash-atm */
/* @arkzen:native:page:layout:app */

import Animated, { FadeInDown } from 'react-native-reanimated'

const CashAtmScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [activeTab, setActiveTab] = useState<'CASH' | 'ATM'>('CASH')

  useEffect(() => {
    if (jobOrders.length > 0) return
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(Array.isArray(data) ? data : data.data ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const active   = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const cashList = useMemo(() => active.filter(j => j.disbursement_type === 'CASH'), [active])
  const atmList  = useMemo(() => active.filter(j => j.disbursement_type === 'ATM'),  [active])
  const cashTotal = useMemo(() => cashList.reduce((a, j) => a + j.basic_pay, 0), [cashList])
  const atmTotal  = useMemo(() => atmList.reduce((a, j) => a + j.basic_pay, 0),  [atmList])

  const list  = activeTab === 'CASH' ? cashList : atmList
  const total = activeTab === 'CASH' ? cashTotal : atmTotal

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 24 }}>

        <Animated.View entering={FadeInDown.duration(350)} style={{ marginBottom: 16 }}>
          <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">DISBURSEMENT</Text>
          <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Cash / ATM</Text>
        </Animated.View>

        {/* Summary cards */}
        <Animated.View entering={FadeInDown.duration(350).delay(60)} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <StatCard value={cashList.length} label="Cash Workers" color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
          <StatCard value={atmList.length}  label="ATM Workers"  color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(350).delay(90)} style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <StatCard value={formatPeso(cashTotal)} label="Cash Total"  color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
          <StatCard value={formatPeso(atmTotal)}  label="ATM Total"   color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        </Animated.View>

        {/* Tab toggle */}
        <Animated.View entering={FadeInDown.duration(350).delay(120)} style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['CASH', 'ATM'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
              className={`flex-1 py-3 rounded-xl items-center border ${activeTab === t ? 'bg-[#171717] border-[#171717]' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-[13px] font-bold ${activeTab === t ? 'text-white' : 'text-gray-400'}`}>{t}</Text>
              <Text className={`text-[11px] ${activeTab === t ? 'text-gray-400' : 'text-gray-300'} mt-0.5`}>{t === 'CASH' ? cashList.length : atmList.length} workers</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* List */}
        <Animated.View entering={FadeInDown.duration(350).delay(160)} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
            <Text className="text-[13px] font-bold text-gray-900">{activeTab} Disbursement</Text>
            <Text className={`text-xs font-semibold ${activeTab === 'CASH' ? 'text-amber-600' : 'text-blue-600'}`}>{formatPeso(total)}</Text>
          </View>

          {isLoading ? (
            <View style={{ padding: 32, alignItems: 'center' }}><ActivityIndicator color="#171717" /></View>
          ) : list.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}><Text className="text-[13px] text-gray-400">No entries</Text></View>
          ) : (
            list.map(jo => (
              <View key={jo.id} className="flex-row items-center px-4 py-3 border-b border-gray-50" style={{ gap: 12 }}>
                <Avatar name={jo.name_of_jo} size={36} />
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={1}>{jo.name_of_jo}</Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">{jo.jor_pyrl_group} · #{jo.jor_number}</Text>
                </View>
                {activeTab === 'ATM' && jo.cash_card_number && (
                  <Text className="text-[11px] text-gray-400">····{jo.cash_card_number.slice(-4)}</Text>
                )}
                <Text className="text-[13px] font-bold text-gray-900">{formatPeso(jo.basic_pay)}</Text>
              </View>
            ))
          )}
        </Animated.View>

      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:cash-atm:end */

/* @arkzen:native:page:appointments */
/* @arkzen:native:page:layout:app */

import Animated, { FadeInDown } from 'react-native-reanimated'

const AppointmentsScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (jobOrders.length > 0) return
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(Array.isArray(data) ? data : data.data ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const sorted = useMemo(() =>
    [...jobOrders]
      .filter(j => j.appointment_order != null)
      .sort((a, b) => (a.appointment_order ?? 0) - (b.appointment_order ?? 0))
      .filter(j => search === '' ||
        j.name_of_jo.toLowerCase().includes(search.toLowerCase()) ||
        j.job_title.toLowerCase().includes(search.toLowerCase()))
  , [jobOrders, search])

  const activeCount = useMemo(() => sorted.filter(j => j.status === 'active').length, [sorted])

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#F4F5F7' }}>
        <Animated.View entering={FadeInDown.duration(350)}>
          <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">SEQUENCE</Text>
          <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Appointments</Text>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 12 }}>
          <StatCard value={sorted.length}  label="Total Slots"   />
          <StatCard value={activeCount}    label="Active Slots"  color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        </View>

        <SearchBar value={search} onChange={setSearch} placeholder="Search name or title…" />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color="#171717" />
        </View>
      ) : sorted.length === 0 ? (
        <View className="bg-white rounded-2xl p-10 items-center border border-gray-200 mx-4">
          <Text className="text-[13px] text-gray-400">No appointments found</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {sorted.map((jo, index) => (
            <Animated.View key={jo.id} entering={FadeInDown.duration(300).delay(index * 40)} className="bg-white rounded-[14px] border border-gray-200 p-3.5 mb-2 flex-row items-center" style={{ gap: 12 }}>
              <View className="w-9 h-9 bg-gray-100 rounded-[10px] items-center justify-center">
                <Text className="text-xs font-extrabold text-gray-700">#{jo.appointment_order}</Text>
              </View>
              <Avatar name={jo.name_of_jo} size={36} />
              <View className="flex-1">
                <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={1}>{jo.name_of_jo}</Text>
                <Text className="text-[11px] text-gray-400 mt-0.5">{jo.job_title} · JOR #{jo.jor_number}</Text>
              </View>
              <View className={`rounded-lg px-2 py-1 ${jo.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                <Text className={`text-[10px] font-bold ${jo.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {jo.status.toUpperCase()}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  )
}

/* @arkzen:native:page:appointments:end */

/* @arkzen:native:page:payslip */
/* @arkzen:native:page:layout:app */

import Animated, { FadeInDown } from 'react-native-reanimated'

const PayslipScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<JobOrder | null>(null)
  const [workDays, setWorkDays] = useState('26')

  useEffect(() => {
    if (jobOrders.length > 0) return
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(Array.isArray(data) ? data : data.data ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const activeJOs = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const filtered  = useMemo(() =>
    activeJOs.filter(j => search === '' || j.name_of_jo.toLowerCase().includes(search.toLowerCase()))
  , [activeJOs, search])

  const computed = useMemo(() => {
    if (!selected) return null
    const days       = parseInt(workDays) || 0
    const gross      = selected.basic_pay * days
    const sss        = selected.sss_amount ?? 0
    const hdmfPrem   = selected.hdmf_premium ?? 0
    const hdmfMpl    = selected.hdmf_mpl ?? 0
    const calamity   = selected.calamity_loan ?? 0
    const deductions = sss + hdmfPrem + hdmfMpl + calamity
    return { gross, sss, hdmfPrem, hdmfMpl, calamity, deductions, net: gross - deductions, days }
  }, [selected, workDays])

  const now = new Date()
  const periodLabel = now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4F5F7' }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 32 }}>

      <Animated.View entering={FadeInDown.duration(350)} style={{ marginBottom: 16 }}>
        <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">GENERATE</Text>
        <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Payslip</Text>
      </Animated.View>

      {/* Worker search */}
      <Animated.View entering={FadeInDown.duration(350).delay(60)} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
        <Text className="text-[13px] font-bold text-gray-900 mb-2.5">Select Worker</Text>
        <SearchBar value={search} onChange={setSearch} placeholder="Search worker name…" />

        <View style={{ marginTop: 10, gap: 4 }}>
          {(search ? filtered : activeJOs.slice(0, 8)).map(jo => (
            <TouchableOpacity
              key={jo.id}
              onPress={() => setSelected(jo)}
              activeOpacity={0.7}
              className={`flex-row items-center p-2.5 rounded-[10px] ${selected?.id === jo.id ? 'bg-[#171717]' : 'bg-transparent'}`}
              style={{ gap: 10 }}
            >
              <Avatar name={jo.name_of_jo} size={32} />
              <View className="flex-1">
                <Text className={`text-xs font-semibold ${selected?.id === jo.id ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>{jo.name_of_jo}</Text>
                <Text className="text-[11px] text-gray-400">{jo.job_title} · {formatPeso(jo.basic_pay)}/day</Text>
              </View>
              {selected?.id === jo.id && (
                <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                  <Text className="text-xs text-[#171717]">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Work days input */}
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text className="text-xs text-gray-500 font-medium">Work Days:</Text>
          <View className="flex-1 bg-gray-50 rounded-[10px] border border-gray-200 px-3 py-2">
            <TextInput
              value={workDays}
              onChangeText={setWorkDays}
              keyboardType="number-pad"
              className="text-[13px] text-gray-900 font-semibold"
            />
          </View>
          <Text className="text-[11px] text-gray-400">days</Text>
        </View>
      </Animated.View>

      {/* Payslip preview */}
      {selected && computed ? (
        <Animated.View entering={FadeInDown.duration(400)} className="bg-white rounded-2xl border-2 border-gray-200 p-[18px] mb-3" style={{ borderStyle: 'dashed' }}>
          {/* Header */}
          <View className="items-center border-b border-gray-100 pb-3.5 mb-3.5">
            <Text className="text-sm font-extrabold text-gray-900 -tracking-[0.3px]">LOCAL GOVERNMENT UNIT</Text>
            <Text className="text-[11px] text-gray-400 mt-0.5">Job Order Payroll System</Text>
            <Text className="text-[11px] text-gray-400 mt-0.5">Pay Period: {periodLabel}</Text>
          </View>

          {/* Worker info */}
          <View style={{ gap: 6, marginBottom: 14 }}>
            {[
              { label: 'Name',         value: selected.name_of_jo },
              { label: 'JOR #',        value: String(selected.jor_number) },
              { label: 'Title',        value: selected.job_title },
              { label: 'Funding',      value: selected.funding },
              { label: 'Disbursement', value: selected.disbursement_type },
              { label: 'Days Worked',  value: `${computed.days} days` },
            ].map(({ label, value }) => (
              <View key={label} className="flex-row justify-between">
                <Text className="text-[11px] text-gray-400">{label}:</Text>
                <Text className="text-[11px] font-semibold text-gray-900">{value}</Text>
              </View>
            ))}
          </View>

          {/* Gross pay */}
          <View className="border-t border-gray-100 pt-3" style={{ marginBottom: 4 }}>
            <View className="flex-row justify-between">
              <Text className="text-[11px] text-gray-500">
                {`Basic Pay (${formatPeso(selected.basic_pay)}/day × ${computed.days})`}
              </Text>
              <Text className="text-xs font-bold text-gray-900">{formatPeso(computed.gross)}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View className="border-t border-gray-100 pt-2.5 mt-2" style={{ gap: 6 }}>
            <Text className="text-[10px] text-gray-400 tracking-[1px]">DEDUCTIONS:</Text>
            {[
              { label: 'SSS Contribution', value: computed.sss,      show: computed.sss > 0 },
              { label: 'HDMF Premium',     value: computed.hdmfPrem, show: computed.hdmfPrem > 0 },
              { label: 'HDMF MPL',         value: computed.hdmfMpl,  show: computed.hdmfMpl > 0 },
              { label: 'Calamity Loan',    value: computed.calamity, show: computed.calamity > 0 },
            ].filter(d => d.show).map(({ label, value }) => (
              <View key={label} className="flex-row justify-between">
                <Text className="text-[11px] text-gray-500">{label}</Text>
                <Text className="text-[11px] font-semibold text-red-600">({formatPeso(value)})</Text>
              </View>
            ))}
            <View className="flex-row justify-between border-t border-gray-100 pt-1.5">
              <Text className="text-[11px] text-gray-400">Total Deductions</Text>
              <Text className="text-[11px] font-bold text-red-600">({formatPeso(computed.deductions)})</Text>
            </View>
          </View>

          {/* Net pay */}
          <View className="bg-[#171717] rounded-xl px-4 py-3.5 flex-row justify-between items-center mt-3.5">
            <Text className="text-sm font-extrabold text-white">NET PAY</Text>
            <Text className="text-xl font-extrabold text-white">{formatPeso(computed.net)}</Text>
          </View>
        </Animated.View>
      ) : (
        <View className="bg-white rounded-2xl border border-gray-200 p-10 items-center">
          <Text className="text-[13px] text-gray-400">Select a worker to preview payslip</Text>
        </View>
      )}

    </ScrollView>
  )
}

/* @arkzen:native:page:payslip:end */

/* @arkzen:native:animation:rn */
import { withTiming, withDelay, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated'

export const useSlideIn = (delay = 0) => {
  const opacity    = useSharedValue(0)
  const translateY = useSharedValue(16)

  useEffect(() => {
    opacity.value    = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }))
    translateY.value = withDelay(delay, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }))
  }, [])

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))
}
/* @arkzen:native:animation:rn:end */

/* @arkzen:native:animation:expo */
import { withTiming, withDelay, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated'

export const useSlideIn = (delay = 0) => {
  const opacity    = useSharedValue(0)
  const translateY = useSharedValue(16)

  useEffect(() => {
    opacity.value    = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }))
    translateY.value = withDelay(delay, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }))
  }, [])

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))
}
/* @arkzen:native:animation:expo:end */

/* @arkzen:native:animation:lynx */
import { useState, useEffect } from '@lynx-js/react'

// Lynx uses CSS transitions via style objects; no Reanimated equivalent.
// Use state-driven opacity + translateY for enter animations.
export const useFadeSlideIn = (delay = 0) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [])

  return {
    style: {
      opacity: visible ? 1 : 0,
      transform: [{ translateY: visible ? 0 : 16 }],
      transition: 'opacity 350ms ease-out, transform 350ms ease-out',
    },
  }
}
/* @arkzen:native:animation:lynx:end */

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect, useMemo, useCallback } from '@lynx-js/react'
import { Icon } from '@/arkzen/core/components/Icon'
const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

// ── Types ────────────────────────────────────────────────────

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
  appointment_order?: number
  status: 'active' | 'inactive'
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

// ── Utils ────────────────────────────────────────────────────

export const formatPeso = (v?: number) =>
  v == null ? '₱0.00' : `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const getInitials = (name: string) => {
  const parts = name.replace(/,/g, '').trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#ffe4e6', text: '#e11d48' },
  { bg: '#cffafe', text: '#0891b2' },
]

export const getAvatarColor = (name: string) => {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

// ── Avatar ───────────────────────────────────────────────────

export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const color = getAvatarColor(name)
  return (
    <view
      className="items-center justify-center"
      style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: color.bg }}
    >
      <text style={{ fontSize: size * 0.33, fontWeight: '700', color: color.text }}>{getInitials(name)}</text>
    </view>
  )
}

// ── StatCard ─────────────────────────────────────────────────

export const StatCard = ({ value, label, color = '#111827', bg = '#ffffff', borderColor = '#e5e7eb' }: {
  value: string | number
  label: string
  color?: string
  bg?: string
  borderColor?: string
}) => (
  <view className="flex-1 rounded-2xl border p-3.5" style={{ backgroundColor: bg, borderColor }}>
    <text className="text-[22px] font-bold" style={{ color }}>{value}</text>
    <text className="text-[11px] text-gray-400 font-medium" style={{ marginTop: 2 }}>{label}</text>
  </view>
)

// ── WorkerRow ────────────────────────────────────────────────

export const WorkerRow = ({ jo, onPress }: { jo: JobOrder; onPress?: () => void }) => {
  const deductions = (jo.sss_amount ?? 0) + (jo.hdmf_premium ?? 0) + (jo.hdmf_mpl ?? 0) + (jo.calamity_loan ?? 0)
  const netPay = jo.basic_pay - deductions

  return (
    <view
      bindtap={onPress}
      className="flex-row items-center px-4 py-3 border-b border-gray-50"
      style={{ gap: 12 }}
    >
      <Avatar name={jo.name_of_jo} size={38} />
      <view className="flex-1">
        <text className="text-[13px] font-semibold text-gray-900 truncate">{jo.name_of_jo}</text>
        <text className="text-[11px] text-gray-400" style={{ marginTop: 2 }}>{jo.job_title} · {jo.funding}</text>
      </view>
      <view className="items-end" style={{ gap: 4 }}>
        <text className="text-[13px] font-bold text-gray-900">{formatPeso(netPay)}</text>
        <view className={`rounded-md px-1.5 py-0.5 ${jo.disbursement_type === 'ATM' ? 'bg-blue-100' : 'bg-amber-100'}`}>
          <text className={`text-[10px] font-bold ${jo.disbursement_type === 'ATM' ? 'text-blue-600' : 'text-amber-600'}`}>
            {jo.disbursement_type}
          </text>
        </view>
      </view>
    </view>
  )
}

// ── SearchBar ────────────────────────────────────────────────

export const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <view className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5" style={{ gap: 8 }}>
    <Icon set="lucide" name="search" size={14} color="#9ca3af" />
    <input
      bindinput={e => onChange(e.detail.value)}
      placeholder={placeholder ?? 'Search…'}
      className="flex-1 text-[13px] text-gray-900"
    />
  </view>
)

// ── TabRow ───────────────────────────────────────────────────

export const TabRow = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) => (
  <view className="flex-row flex-wrap" style={{ gap: 4 }}>
    {tabs.map(t => (
      <view
        key={t}
        bindtap={() => onChange(t)}
        className={`rounded-lg px-3 py-1.5 ${active === t ? 'bg-[#171717]' : 'bg-transparent'}`}
      >
        <text className={`text-xs font-semibold ${active === t ? 'text-white' : 'text-gray-400'}`}>{t}</text>
      </view>
    ))}
  </view>
)

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:index */

import { useState, useEffect, useMemo } from '@lynx-js/react'

const DashboardScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [summary, setSummary]     = useState<PayrollSummary | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [sumRes, joRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/jo-payroll/job-orders/stats/summary`),
          fetch(`${BACKEND_URL}/api/jo-payroll/job-orders`),
        ])
        setSummary(await sumRes.json())
        const joData = await joRes.json()
        setJobOrders(Array.isArray(joData) ? joData : joData.data ?? [])
      } catch {
        setSummary({
          total_active: 11, total_inactive: 1, total_atm: 6, total_cash: 5,
          total_basic_pay: 4142, total_sss: 1140, total_hdmf_premium: 1100,
          total_hdmf_mpl: 1000, total_calamity_loan: 450,
          total_deductions: 3690, net_pay: 452,
          group_breakdown: { 'GROUP A': 6, 'GROUP B': 6 },
        })
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const recentJOs = useMemo(() => jobOrders.slice(0, 5), [jobOrders])

  if (loading) return (
    <view className="flex-1 items-center justify-center">
      <text className="text-[13px] text-gray-400">Loading…</text>
    </view>
  )

  return (
    <scroll-view className="flex-1 bg-[#F4F5F7]">
      <view className="px-4 pt-[52px] pb-6">

      {/* Header */}
      <view className="mb-4">
        <text className="text-[11px] text-gray-400 font-semibold" style={{ letterSpacing: 1.5 }}>J.O. PAYROLL SYSTEM</text>
        <text className="text-[22px] font-extrabold text-gray-900" style={{ marginTop: 2, letterSpacing: -0.5 }}>Dashboard</text>
      </view>

      {/* Net pay hero */}
      <view className="bg-[#171717] rounded-[20px] p-5 mb-3">
        <text className="text-[11px] text-gray-500 mb-2" style={{ letterSpacing: 1.5 }}>ACTIVE WORKERS NET PAY</text>
        <text className="text-[32px] font-extrabold text-white" style={{ letterSpacing: -1 }}>{formatPeso(summary?.net_pay)}</text>
        <view className="flex-row mt-3" style={{ gap: 16 }}>
          <view>
            <text className="text-[11px] text-gray-500">Gross Pay</text>
            <text className="text-[13px] font-semibold text-white" style={{ marginTop: 2 }}>{formatPeso(summary?.total_basic_pay)}</text>
          </view>
          <view>
            <text className="text-[11px] text-gray-500">Total Deductions</text>
            <text className="text-[13px] font-semibold text-red-400" style={{ marginTop: 2 }}>{formatPeso(summary?.total_deductions)}</text>
          </view>
        </view>
      </view>

      {/* Stat row */}
      <view className="flex-row mb-3" style={{ gap: 10 }}>
        <StatCard value={summary?.total_active ?? 0}   label="Active JOs"  color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        <StatCard value={summary?.total_cash ?? 0}     label="Cash"        color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
        <StatCard value={summary?.total_atm ?? 0}      label="ATM"         color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        <StatCard value={summary?.total_inactive ?? 0} label="Inactive"    color="#9ca3af" />
      </view>

      {/* Deduction breakdown */}
      <view className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
        <text className="text-[13px] font-bold text-gray-900 mb-3">Deduction Breakdown</text>
        {[
          { label: 'SSS',           value: summary?.total_sss,           color: '#e11d48' },
          { label: 'HDMF Premium',  value: summary?.total_hdmf_premium,  color: '#7c3aed' },
          { label: 'HDMF MPL',      value: summary?.total_hdmf_mpl,      color: '#2563eb' },
          { label: 'Calamity Loan', value: summary?.total_calamity_loan, color: '#d97706' },
        ].map(({ label, value, color }) => (
          <view key={label} className="flex-row items-center justify-between py-2 border-b border-gray-50">
            <text className="text-[13px] text-gray-700">{label}</text>
            <text className="text-[13px] font-semibold" style={{ color }}>{formatPeso(value)}</text>
          </view>
        ))}
        <view className="flex-row items-center justify-between pt-2.5">
          <text className="text-[13px] font-bold text-gray-900">Total</text>
          <text className="text-sm font-extrabold text-red-600">{formatPeso(summary?.total_deductions)}</text>
        </view>
      </view>

      {/* Recent JOs */}
      <view className="bg-white rounded-2xl border border-gray-200 mb-3" style={{ overflow: 'hidden' }}>
        <view className="px-4 py-3.5 border-b border-gray-100">
          <text className="text-[13px] font-bold text-gray-900">Recent Workers</text>
          <text className="text-[11px] text-gray-400" style={{ marginTop: 2 }}>Latest 5 entries</text>
        </view>
        {recentJOs.length === 0
          ? <view className="p-8 items-center"><text className="text-[13px] text-gray-400">No data</text></view>
          : recentJOs.map(jo => <WorkerRow key={jo.id} jo={jo} onPress={() => onNavigate('job-database')} />)
        }
      </view>

      </view>
    </scroll-view>
  )
}

/* @arkzen:native:page:lynx:index:end */

/* @arkzen:native:page:lynx:job-database */

import { useState, useEffect, useMemo } from '@lynx-js/react'

const WorkersScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [expanded, setExpanded]   = useState<number | null>(null)

  const TABS = ['All', 'Active', 'Inactive', 'CASH', 'ATM']

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BACKEND_URL}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(Array.isArray(data) ? data : data.data ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = useMemo(() =>
    jobOrders.filter(jo => {
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
    }), [jobOrders, search, activeTab])

  return (
    <view className="flex-1 bg-[#F4F5F7]">
      {/* Fixed header */}
      <view className="bg-[#F4F5F7] px-4 pt-[52px] pb-3">
        <view>
          <text className="text-[11px] text-gray-400 font-semibold" style={{ letterSpacing: 1.5 }}>JO DATABASE</text>
          <text className="text-[22px] font-extrabold text-gray-900" style={{ marginTop: 2, letterSpacing: -0.5 }}>Workers</text>
        </view>
        <view className="mt-3" style={{ gap: 8 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, funding, SSS…" />
          <TabRow tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </view>
        <text className="text-[11px] text-gray-400 mt-2">{filtered.length} records</text>
      </view>

      {/* List */}
      {loading ? (
        <view className="flex-1 items-center justify-center py-10">
          <text className="text-[13px] text-gray-400">Loading…</text>
        </view>
      ) : (
        <scroll-view className="flex-1">
          <view className="px-4 pb-6">
          <view className="bg-white rounded-2xl border border-gray-200" style={{ overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <view className="p-10 items-center">
                <text className="text-[13px] text-gray-400">No records found</text>
              </view>
            ) : filtered.map(jo => (
              <view key={jo.id}>
                <WorkerRow jo={jo} onPress={() => setExpanded(expanded === jo.id ? null : jo.id)} />
                {expanded === jo.id && (
                  <view className="px-4 pb-3.5 pt-1 bg-neutral-50 border-b border-gray-100">
                    <view className="flex-row flex-wrap" style={{ gap: 8 }}>
                      {[
                        { label: 'JOR #',      value: String(jo.jor_number) },
                        { label: 'Group',      value: jo.jor_pyrl_group ?? '—' },
                        { label: 'SSS No.',    value: jo.sss_number ?? '—' },
                        { label: 'Basic Pay',  value: `${formatPeso(jo.basic_pay)}/day` },
                        { label: 'SSS',        value: formatPeso(jo.sss_amount) },
                        { label: 'HDMF Prem.', value: formatPeso(jo.hdmf_premium) },
                        { label: 'HDMF MPL',   value: formatPeso(jo.hdmf_mpl) },
                        { label: 'Calamity',   value: formatPeso(jo.calamity_loan) },
                      ].map(({ label, value }) => (
                        <view key={label} className="flex-1 bg-white rounded-[10px] border border-gray-200 px-2.5 py-2" style={{ minWidth: '44%' }}>
                          <text className="text-[10px] text-gray-400 font-semibold" style={{ marginBottom: 2 }}>{label}</text>
                          <text className="text-xs font-semibold text-gray-900">{value}</text>
                        </view>
                      ))}
                    </view>
                    <view className="flex-row mt-2" style={{ gap: 8 }}>
                      <view className={`rounded-lg px-2.5 py-1.5 ${jo.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <text className={`text-[11px] font-semibold ${jo.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {jo.status.toUpperCase()}
                        </text>
                      </view>
                      {jo.cash_card_number && (
                        <view className="bg-blue-50 rounded-lg px-2.5 py-1.5">
                          <text className="text-[11px] font-semibold text-blue-600">
                            ····{jo.cash_card_number.slice(-4)}
                          </text>
                        </view>
                      )}
                    </view>
                  </view>
                )}
              </view>
            ))}
          </view>
          </view>
        </scroll-view>
      )}
    </view>
  )
}

/* @arkzen:native:page:lynx:job-database:end */

/* @arkzen:native:page:lynx:cash-atm */

import { useState, useEffect, useMemo } from '@lynx-js/react'

const CashAtmScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<'CASH' | 'ATM'>('CASH')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BACKEND_URL}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(Array.isArray(data) ? data : data.data ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const active    = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const cashList  = useMemo(() => active.filter(j => j.disbursement_type === 'CASH'), [active])
  const atmList   = useMemo(() => active.filter(j => j.disbursement_type === 'ATM'),  [active])
  const cashTotal = useMemo(() => cashList.reduce((a, j) => a + j.basic_pay, 0), [cashList])
  const atmTotal  = useMemo(() => atmList.reduce((a, j) => a + j.basic_pay, 0),  [atmList])

  const list  = activeTab === 'CASH' ? cashList : atmList
  const total = activeTab === 'CASH' ? cashTotal : atmTotal

  return (
    <view className="flex-1 bg-[#F4F5F7]">
      <scroll-view>
        <view className="px-4 pt-[52px] pb-6">

        <view className="mb-4">
          <text className="text-[11px] text-gray-400 font-semibold" style={{ letterSpacing: 1.5 }}>DISBURSEMENT</text>
          <text className="text-[22px] font-extrabold text-gray-900" style={{ marginTop: 2, letterSpacing: -0.5 }}>Cash / ATM</text>
        </view>

        {/* Summary cards */}
        <view className="flex-row mb-3" style={{ gap: 10 }}>
          <StatCard value={cashList.length} label="Cash Workers" color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
          <StatCard value={atmList.length}  label="ATM Workers"  color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        </view>
        <view className="flex-row mb-4" style={{ gap: 10 }}>
          <StatCard value={formatPeso(cashTotal)} label="Cash Total" color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
          <StatCard value={formatPeso(atmTotal)}  label="ATM Total"  color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        </view>

        {/* Tab toggle */}
        <view className="flex-row mb-3" style={{ gap: 8 }}>
          {(['CASH', 'ATM'] as const).map(t => (
            <view
              key={t}
              bindtap={() => setActiveTab(t)}
              className={`flex-1 py-3 rounded-xl items-center border ${activeTab === t ? 'bg-[#171717] border-[#171717]' : 'bg-white border-gray-200'}`}
            >
              <text className={`text-[13px] font-bold ${activeTab === t ? 'text-white' : 'text-gray-400'}`}>{t}</text>
              <text className={`text-[11px] ${activeTab === t ? 'text-gray-400' : 'text-gray-300'}`} style={{ marginTop: 2 }}>{t === 'CASH' ? cashList.length : atmList.length} workers</text>
            </view>
          ))}
        </view>

        {/* List */}
        <view className="bg-white rounded-2xl border border-gray-200" style={{ overflow: 'hidden' }}>
          <view className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
            <text className="text-[13px] font-bold text-gray-900">{activeTab} Disbursement</text>
            <text className={`text-xs font-semibold ${activeTab === 'CASH' ? 'text-amber-600' : 'text-blue-600'}`}>{formatPeso(total)}</text>
          </view>

          {loading ? (
            <view className="p-8 items-center">
              <text className="text-[13px] text-gray-400">Loading…</text>
            </view>
          ) : list.length === 0 ? (
            <view className="p-8 items-center">
              <text className="text-[13px] text-gray-400">No entries</text>
            </view>
          ) : (
            list.map(jo => (
              <view key={jo.id} className="flex-row items-center px-4 py-3 border-b border-gray-50" style={{ gap: 12 }}>
                <Avatar name={jo.name_of_jo} size={36} />
                <view className="flex-1">
                  <text className="text-[13px] font-semibold text-gray-900 truncate">{jo.name_of_jo}</text>
                  <text className="text-[11px] text-gray-400" style={{ marginTop: 2 }}>{jo.jor_pyrl_group} · #{jo.jor_number}</text>
                </view>
                {activeTab === 'ATM' && jo.cash_card_number && (
                  <text className="text-[11px] text-gray-400">····{jo.cash_card_number.slice(-4)}</text>
                )}
                <text className="text-[13px] font-bold text-gray-900">{formatPeso(jo.basic_pay)}</text>
              </view>
            ))
          )}
        </view>

        </view>
      </scroll-view>
    </view>
  )
}

/* @arkzen:native:page:lynx:cash-atm:end */

/* @arkzen:native:page:lynx:appointments */

import { useState, useEffect, useMemo } from '@lynx-js/react'

const AppointmentsScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BACKEND_URL}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(Array.isArray(data) ? data : data.data ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const sorted = useMemo(() =>
    [...jobOrders]
      .filter(j => j.appointment_order != null)
      .sort((a, b) => (a.appointment_order ?? 0) - (b.appointment_order ?? 0))
      .filter(j => search === '' ||
        j.name_of_jo.toLowerCase().includes(search.toLowerCase()) ||
        j.job_title.toLowerCase().includes(search.toLowerCase()))
  , [jobOrders, search])

  const activeCount = useMemo(() => sorted.filter(j => j.status === 'active').length, [sorted])

  return (
    <view className="flex-1 bg-[#F4F5F7]">
      <view className="px-4 pt-[52px] pb-3 bg-[#F4F5F7]">
        <view>
          <text className="text-[11px] text-gray-400 font-semibold" style={{ letterSpacing: 1.5 }}>SEQUENCE</text>
          <text className="text-[22px] font-extrabold text-gray-900" style={{ marginTop: 2, letterSpacing: -0.5 }}>Appointments</text>
        </view>

        <view className="flex-row mt-3 mb-3" style={{ gap: 10 }}>
          <StatCard value={sorted.length}  label="Total Slots"  />
          <StatCard value={activeCount}    label="Active Slots" color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        </view>

        <SearchBar value={search} onChange={setSearch} placeholder="Search name or title…" />
      </view>

      {loading ? (
        <view className="flex-1 items-center justify-center py-10">
          <text className="text-[13px] text-gray-400">Loading…</text>
        </view>
      ) : sorted.length === 0 ? (
        <view className="bg-white rounded-2xl p-10 items-center border border-gray-200 mx-4">
          <text className="text-[13px] text-gray-400">No appointments found</text>
        </view>
      ) : (
        <scroll-view className="flex-1">
          <view className="px-4 pb-6">
          {sorted.map(jo => (
            <view key={jo.id} className="bg-white rounded-[14px] border border-gray-200 p-3.5 mb-2 flex-row items-center" style={{ gap: 12 }}>
              <view className="w-9 h-9 bg-gray-100 rounded-[10px] items-center justify-center">
                <text className="text-xs font-extrabold text-gray-700">#{jo.appointment_order}</text>
              </view>
              <Avatar name={jo.name_of_jo} size={36} />
              <view className="flex-1">
                <text className="text-[13px] font-semibold text-gray-900 truncate">{jo.name_of_jo}</text>
                <text className="text-[11px] text-gray-400" style={{ marginTop: 2 }}>{jo.job_title} · JOR #{jo.jor_number}</text>
              </view>
              <view className={`rounded-lg px-2 py-1 ${jo.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                <text className={`text-[10px] font-bold ${jo.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {jo.status.toUpperCase()}
                </text>
              </view>
            </view>
          ))}
          </view>
        </scroll-view>
      )}
    </view>
  )
}

/* @arkzen:native:page:lynx:appointments:end */

/* @arkzen:native:page:lynx:payslip */

import { useState, useEffect, useMemo } from '@lynx-js/react'

const PayslipScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<JobOrder | null>(null)
  const [workDays, setWorkDays]   = useState('26')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BACKEND_URL}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(Array.isArray(data) ? data : data.data ?? [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const activeJOs = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const filtered  = useMemo(() =>
    activeJOs.filter(j => search === '' || j.name_of_jo.toLowerCase().includes(search.toLowerCase()))
  , [activeJOs, search])

  const computed = useMemo(() => {
    if (!selected) return null
    const days       = parseInt(workDays) || 0
    const gross      = selected.basic_pay * days
    const sss        = selected.sss_amount ?? 0
    const hdmfPrem   = selected.hdmf_premium ?? 0
    const hdmfMpl    = selected.hdmf_mpl ?? 0
    const calamity   = selected.calamity_loan ?? 0
    const deductions = sss + hdmfPrem + hdmfMpl + calamity
    return { gross, sss, hdmfPrem, hdmfMpl, calamity, deductions, net: gross - deductions, days }
  }, [selected, workDays])

  const now         = new Date()
  const periodLabel = now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  return (
    <scroll-view className="flex-1 bg-[#F4F5F7]">
      <view className="px-4 pt-[52px] pb-8">

      <view className="mb-4">
        <text className="text-[11px] text-gray-400 font-semibold" style={{ letterSpacing: 1.5 }}>GENERATE</text>
        <text className="text-[22px] font-extrabold text-gray-900" style={{ marginTop: 2, letterSpacing: -0.5 }}>Payslip</text>
      </view>

      {/* Worker search panel */}
      <view className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
        <text className="text-[13px] font-bold text-gray-900 mb-2.5">Select Worker</text>
        <SearchBar value={search} onChange={setSearch} placeholder="Search worker name…" />

        <view className="mt-2.5" style={{ gap: 4 }}>
          {(search ? filtered : activeJOs.slice(0, 8)).map(jo => (
            <view
              key={jo.id}
              bindtap={() => setSelected(jo)}
              className={`flex-row items-center p-2.5 rounded-[10px] ${selected?.id === jo.id ? 'bg-[#171717]' : 'bg-transparent'}`}
              style={{ gap: 10 }}
            >
              <Avatar name={jo.name_of_jo} size={32} />
              <view className="flex-1">
                <text className={`text-xs font-semibold truncate ${selected?.id === jo.id ? 'text-white' : 'text-gray-900'}`}>{jo.name_of_jo}</text>
                <text className="text-[11px] text-gray-400">{jo.job_title} · {formatPeso(jo.basic_pay)}/day</text>
              </view>
              {selected?.id === jo.id && (
                <view className="w-5 h-5 rounded-full bg-white items-center justify-center">
                  <text className="text-xs text-[#171717]">✓</text>
                </view>
              )}
            </view>
          ))}
        </view>

        {/* Work days input */}
        <view className="mt-3 flex-row items-center" style={{ gap: 10 }}>
          <text className="text-xs text-gray-500 font-medium">Work Days:</text>
          <view className="flex-1 bg-gray-50 rounded-[10px] border border-gray-200 px-3 py-2">
            <input
              bindinput={e => setWorkDays(e.detail.value)}
              className="text-[13px] text-gray-900 font-semibold"
            />
          </view>
          <text className="text-[11px] text-gray-400">days</text>
        </view>
      </view>

      {/* Payslip preview */}
      {selected && computed ? (
        <view className="bg-white rounded-2xl border-2 border-gray-200 p-[18px] mb-3" style={{ borderStyle: 'dashed' }}>

          {/* Header */}
          <view className="items-center border-b border-gray-100 pb-3.5 mb-3.5">
            <text className="text-sm font-extrabold text-gray-900" style={{ letterSpacing: -0.3 }}>LOCAL GOVERNMENT UNIT</text>
            <text className="text-[11px] text-gray-400" style={{ marginTop: 2 }}>Job Order Payroll System</text>
            <text className="text-[11px] text-gray-400" style={{ marginTop: 2 }}>Pay Period: {periodLabel}</text>
          </view>

          {/* Worker info */}
          <view className="mb-3.5" style={{ gap: 6 }}>
            {[
              { label: 'Name',         value: selected.name_of_jo },
              { label: 'JOR #',        value: String(selected.jor_number) },
              { label: 'Title',        value: selected.job_title },
              { label: 'Funding',      value: selected.funding },
              { label: 'Disbursement', value: selected.disbursement_type },
              { label: 'Days Worked',  value: `${computed.days} days` },
            ].map(({ label, value }) => (
              <view key={label} className="flex-row justify-between">
                <text className="text-[11px] text-gray-400">{label}:</text>
                <text className="text-[11px] font-semibold text-gray-900">{value}</text>
              </view>
            ))}
          </view>

          {/* Gross pay */}
          <view className="border-t border-gray-100 pt-3" style={{ marginBottom: 4 }}>
            <view className="flex-row justify-between">
              <text className="text-[11px] text-gray-500">
                {`Basic Pay (${formatPeso(selected.basic_pay)}/day × ${computed.days})`}
              </text>
              <text className="text-xs font-bold text-gray-900">{formatPeso(computed.gross)}</text>
            </view>
          </view>

          {/* Deductions */}
          <view className="border-t border-gray-100 pt-2.5 mt-2" style={{ gap: 6 }}>
            <text className="text-[10px] text-gray-400" style={{ letterSpacing: 1 }}>DEDUCTIONS:</text>
            {[
              { label: 'SSS Contribution', value: computed.sss,      show: computed.sss > 0 },
              { label: 'HDMF Premium',     value: computed.hdmfPrem, show: computed.hdmfPrem > 0 },
              { label: 'HDMF MPL',         value: computed.hdmfMpl,  show: computed.hdmfMpl > 0 },
              { label: 'Calamity Loan',    value: computed.calamity, show: computed.calamity > 0 },
            ].filter(d => d.show).map(({ label, value }) => (
              <view key={label} className="flex-row justify-between">
                <text className="text-[11px] text-gray-500">{label}</text>
                <text className="text-[11px] font-semibold text-red-600">({formatPeso(value)})</text>
              </view>
            ))}
            <view className="flex-row justify-between border-t border-gray-100 pt-1.5">
              <text className="text-[11px] text-gray-400">Total Deductions</text>
              <text className="text-[11px] font-bold text-red-600">({formatPeso(computed.deductions)})</text>
            </view>
          </view>

          {/* Net pay */}
          <view className="bg-[#171717] rounded-xl px-4 py-3.5 flex-row justify-between items-center mt-3.5">
            <text className="text-sm font-extrabold text-white">NET PAY</text>
            <text className="text-xl font-extrabold text-white">{formatPeso(computed.net)}</text>
          </view>
        </view>
      ) : (
        <view className="bg-white rounded-2xl border border-gray-200 p-10 items-center">
          <text className="text-[13px] text-gray-400">Select a worker to preview payslip</text>
        </view>
      )}

      </view>
    </scroll-view>
  )
}

/* @arkzen:native:page:lynx:payslip:end */

/* @arkzen:native:layout:app */

/* @arkzen:import:expo */
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { LayoutDashboard, Users, Banknote, CalendarDays, FileText } from 'lucide-react-native'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { LayoutDashboard, Users, Banknote, CalendarDays, FileText } from 'lucide-react-native'
/* @arkzen:import:rn:end */

const NAV_ITEMS = [
  { name: 'JoPayrollIndex',       label: 'Home',     icon: LayoutDashboard },
  { name: 'JoPayrollWorkers',     label: 'Workers',  icon: Users           },
  { name: 'JoPayrollCashAtm',     label: 'Cash/ATM', icon: Banknote        },
  { name: 'JoPayrollAppointments',label: 'Appts',    icon: CalendarDays    },
  { name: 'JoPayrollPayslip',     label: 'Payslip',  icon: FileText        },
]

/* @arkzen:import:expo */
const NAV_HREFS: Record<string, string> = {
  JoPayrollIndex:        '/jo-payroll',
  JoPayrollWorkers:      '/jo-payroll/job-database',
  JoPayrollCashAtm:      '/jo-payroll/cash-atm',
  JoPayrollAppointments: '/jo-payroll/appointments',
  JoPayrollPayslip:      '/jo-payroll/payslip',
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useRouter()
  const pathname = usePathname()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <View style={{ flex: 1 }}>{children}</View>

      {/* Bottom tab bar */}
      <View className="flex-row bg-white border-t border-gray-100 pb-1 pt-2">
        {NAV_ITEMS.map(({ name, label, icon: Icon }) => {
          const href   = NAV_HREFS[name]
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <TouchableOpacity
              key={name}
              onPress={() => router.push(href as any)}
              activeOpacity={0.7}
              className="flex-1 items-center"
              style={{ gap: 3 }}
            >
              <Icon size={20} color={active ? '#171717' : '#d1d5db'} />
              <Text className={`text-[10px] ${active ? 'font-bold text-[#171717]' : 'font-medium text-gray-300'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </SafeAreaView>
  )
}
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
export const AppLayout: React.FC<{ children: React.ReactNode; activeScreen?: string }> = ({ children, activeScreen }) => {
  const navigation = useNavigation()

  const screenMap: Record<string, string> = {
    JoPayrollIndex:        'JoPayrollIndex',
    JoPayrollWorkers:      'JoPayrollWorkers',
    JoPayrollCashAtm:      'JoPayrollCashAtm',
    JoPayrollAppointments: 'JoPayrollAppointments',
    JoPayrollPayslip:      'JoPayrollPayslip',
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <View style={{ flex: 1 }}>{children}</View>

      {/* Bottom tab bar */}
      <View className="flex-row bg-white border-t border-gray-100 pb-1 pt-2">
        {NAV_ITEMS.map(({ name, label, icon: Icon }) => {
          const active = activeScreen === name
          return (
            <TouchableOpacity
              key={name}
              onPress={() => (navigation as any).navigate(screenMap[name])}
              activeOpacity={0.7}
              className="flex-1 items-center"
              style={{ gap: 3 }}
            >
              <Icon size={20} color={active ? '#171717' : '#d1d5db'} />
              <Text className={`text-[10px] ${active ? 'font-bold text-[#171717]' : 'font-medium text-gray-300'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </SafeAreaView>
  )
}
/* @arkzen:import:rn:end */

/* @arkzen:native:layout:app:end */
