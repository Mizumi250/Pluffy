/* @arkzen:meta
name: jo-payroll
version: 1.0.0
description: J.O Payroll System — Job Order management, payroll processing, deductions tracking, cash/ATM groupings, and appointment sequencing for local government unit
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
    className: "min-h-screen bg-neutral-50"
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
  status:
    type: string
    length: 20
    nullable: false
    default: "active"
seeder:
  count: 6
  data:
    - jor_number: 1
      name_of_jo: "DELA CRUZ, JUAN"
      job_title: "LABORER"
      funding: "PUBLIC SERVICES"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "01-2345678-9"
      sss_amount: 100.00
      hdmf_premium: 100.00
      status: "active"
    - jor_number: 2
      name_of_jo: "REYES, MARIA"
      job_title: "LABORER"
      funding: "ADMIN"
      basic_pay: 346.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      cash_card_number: "4111111111111111"
      sss_number: "02-3456789-0"
      sss_amount: 100.00
      calamity_loan: 200.00
      hdmf_premium: 100.00
      status: "active"
    - jor_number: 3
      name_of_jo: "GARCIA, PEDRO"
      job_title: "LABORER"
      funding: "MAINTENANCE"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "03-4567890-1"
      sss_amount: 100.00
      status: "active"
    - jor_number: 4
      name_of_jo: "SANTOS, ANA"
      job_title: "LABORER"
      funding: "SANITATION"
      basic_pay: 346.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      cash_card_number: "4222222222222222"
      sss_number: "04-5678901-2"
      sss_amount: 100.00
      hdmf_mpl: 500.00
      hdmf_premium: 100.00
      status: "active"
    - jor_number: 5
      name_of_jo: "LOPEZ, JOSE"
      job_title: "LABORER"
      funding: "SUPPLIES"
      basic_pay: 346.00
      disbursement_type: "CASH"
      jor_pyrl_group: "GROUP A"
      sss_number: "05-6789012-3"
      sss_amount: 100.00
      status: "inactive"
    - jor_number: 6
      name_of_jo: "FLORES, CARMEN"
      job_title: "LABORER"
      funding: "HUMAN RESOURCES"
      basic_pay: 346.00
      disbursement_type: "ATM"
      jor_pyrl_group: "GROUP B"
      cash_card_number: "4333333333333333"
      sss_number: "06-7890123-4"
      sss_amount: 100.00
      calamity_loan: 100.00
      hdmf_mpl: 200.00
      hdmf_premium: 100.00
      status: "active"
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
*/

/* @arkzen:endpoint:summary
*/

$total = JobOrder::where('status', 'active')->count();
$totalAtm = JobOrder::where('status', 'active')->where('disbursement_type', 'ATM')->count();
$totalCash = JobOrder::where('status', 'active')->where('disbursement_type', 'CASH')->count();
$totalBasicPay = JobOrder::where('status', 'active')->sum('basic_pay');
$totalSss = JobOrder::where('status', 'active')->sum('sss_amount');
$totalHdmfPremium = JobOrder::where('status', 'active')->sum('hdmf_premium');
$totalDeductions = $totalSss + $totalHdmfPremium;
$netPay = $totalBasicPay - $totalDeductions;

return response()->json([
  'total_active' => $total,
  'total_atm' => $totalAtm,
  'total_cash' => $totalCash,
  'total_basic_pay' => $totalBasicPay,
  'total_sss' => $totalSss,
  'total_hdmf_premium' => $totalHdmfPremium,
  'total_deductions' => $totalDeductions,
  'net_pay' => $netPay,
]);

/* @arkzen:endpoint:summary:end */

/* @arkzen:store:payrollStore

import { create } from 'zustand'

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
  status: 'active' | 'inactive'
}

export interface PayrollSummary {
  total_active: number
  total_atm: number
  total_cash: number
  total_basic_pay: number
  total_sss: number
  total_hdmf_premium: number
  total_deductions: number
  net_pay: number
}

interface PayrollState {
  jobOrders: JobOrder[]
  summary: PayrollSummary | null
  isLoading: boolean
  setJobOrders: (orders: JobOrder[]) => void
  setSummary: (summary: PayrollSummary) => void
  setLoading: (loading: boolean) => void
  addJobOrder: (order: JobOrder) => void
  updateJobOrder: (id: number, order: JobOrder) => void
  removeJobOrder: (id: number) => void
}

export const usePayrollStore = create<PayrollState>((set) => ({
  jobOrders: [],
  summary: null,
  isLoading: false,
  setJobOrders: (orders) => set({ jobOrders: orders }),
  setSummary: (summary) => set({ summary }),
  setLoading: (loading) => set({ isLoading: loading }),
  addJobOrder: (order) => set((state) => ({ jobOrders: [...state.jobOrders, order] })),
  updateJobOrder: (id, order) => set((state) => ({
    jobOrders: state.jobOrders.map(jo => jo.id === id ? order : jo)
  })),
  removeJobOrder: (id) => set((state) => ({
    jobOrders: state.jobOrders.filter(jo => jo.id !== id)
  })),
}))

*/

/* @arkzen:components:shared */

import React, { useState, useEffect, useMemo } from 'react'
import { create } from 'zustand'
import {
  FileText, Download, Users, Banknote, TrendingDown, Wallet,
  Building2, Landmark, CreditCard, Calendar, Database,
  Plus, Search, Edit2, Trash2, Menu,
} from 'lucide-react'

// ─── Store ────────────────────────────────────────────────────────────────────
// FIX: Store is defined here inside @arkzen:components:shared so it is inlined
// into every generated page alongside the component code. The @arkzen:store
// block is parsed but NOT automatically injected into page files by the router,
// so any page that uses usePayrollStore() must have the store code present in
// the same generated file.

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
  status: 'active' | 'inactive'
}

export interface PayrollSummary {
  total_active: number
  total_atm: number
  total_cash: number
  total_basic_pay: number
  total_sss: number
  total_hdmf_premium: number
  total_deductions: number
  net_pay: number
}

interface PayrollState {
  jobOrders: JobOrder[]
  summary: PayrollSummary | null
  isLoading: boolean
  setJobOrders: (orders: JobOrder[]) => void
  setSummary: (summary: PayrollSummary) => void
  setLoading: (loading: boolean) => void
  addJobOrder: (order: JobOrder) => void
  updateJobOrder: (id: number, order: JobOrder) => void
  removeJobOrder: (id: number) => void
}

export const usePayrollStore = create<PayrollState>((set) => ({
  jobOrders: [],
  summary: null,
  isLoading: false,
  setJobOrders: (orders) => set({ jobOrders: orders }),
  setSummary: (summary) => set({ summary }),
  setLoading: (loading) => set({ isLoading: loading }),
  addJobOrder: (order) => set((state) => ({ jobOrders: [...state.jobOrders, order] })),
  updateJobOrder: (id, order) => set((state) => ({
    jobOrders: state.jobOrders.map(jo => jo.id === id ? order : jo)
  })),
  removeJobOrder: (id) => set((state) => ({
    jobOrders: state.jobOrders.filter(jo => jo.id !== id)
  })),
}))

// ─── Constants ───────────────────────────────────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const FUNDING_OPTIONS = [
  'PUBLIC SERVICES',
  'ADMIN',
  'MAINTENANCE',
  'SANITATION',
  'SUPPLIES',
  'HUMAN RESOURCES',
]

export const DISBURSEMENT_TYPES = ['CASH', 'ATM']

export const formatPeso = (amount?: number) => {
  if (!amount) return '₱0.00'
  return `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── UI Components ────────────────────────────────────────────────────────────

export const StatCard: React.FC<{
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
}> = ({ label, value, sub, icon, accent }) => (
  <div className={`p-4 rounded-xl ${accent.split(' ')[1]} border border-neutral-100`}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <div className={accent.split(' ')[0]}>{icon}</div>
    </div>
    <p className="text-lg font-semibold text-neutral-900">{value}</p>
    {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
  </div>
)

export const PageHeader: React.FC<{
  title: string
  description: string
  actions?: React.ReactNode
}> = ({ title, description, actions }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      <p className="text-sm text-neutral-500 mt-1">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
)

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-700'
  }`}>
    {status === 'active' ? '● Active' : '● Inactive'}
  </span>
)

export const FilterPill: React.FC<{
  label: string
  active: boolean
  onClick: () => void
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
      active
        ? 'bg-violet-600 text-white'
        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
    }`}
  >
    {label}
  </button>
)

export const EmptyRow: React.FC<{ message: string }> = ({ message }) => (
  <tr>
    <td colSpan={10} className="text-center py-8 text-sm text-neutral-500">
      {message}
    </td>
  </tr>
)

export const JOForm: React.FC<{
  initial?: any
  onSave: (data: any) => void
  onCancel: () => void
}> = ({ initial, onSave, onCancel }) => {
  const [data, setData] = useState(initial || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-700">JOR Number</label>
          <input
            type="number"
            value={data.jor_number || ''}
            onChange={e => setData({ ...data, jor_number: parseInt(e.target.value) })}
            className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-700">Name</label>
          <input
            type="text"
            value={data.name_of_jo || ''}
            onChange={e => setData({ ...data, name_of_jo: e.target.value })}
            className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-700">Job Title</label>
          <input
            type="text"
            value={data.job_title || ''}
            onChange={e => setData({ ...data, job_title: e.target.value })}
            className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-700">Funding</label>
          <select
            value={data.funding || ''}
            onChange={e => setData({ ...data, funding: e.target.value })}
            className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            required
          >
            <option value="">Select funding</option>
            {FUNDING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-700">Basic Pay</label>
          <input
            type="number"
            step="0.01"
            value={data.basic_pay || ''}
            onChange={e => setData({ ...data, basic_pay: parseFloat(e.target.value) })}
            className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-700">Disbursement Type</label>
          <select
            value={data.disbursement_type || ''}
            onChange={e => setData({ ...data, disbursement_type: e.target.value })}
            className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            required
          >
            <option value="">Select type</option>
            {DISBURSEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  )
}

/* @arkzen:components:shared:end */

/* @arkzen:layout:app */

// FIX: Import AppLayout from the generated components directory (relative to
// the custom layout file at arkzen/core/layouts/custom/app.tsx).
// The old import `@/components/layout` was wrong — that path doesn't exist.
// AppLayout is generated into app/jo-payroll/components/_components.tsx,
// but custom layouts live at arkzen/core/layouts/custom/ so we cannot
// use a relative path to the app folder. The correct approach is to inline
// AppLayout in the layout block itself.

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, FileText, Database, Banknote, Building2, Landmark, Calendar } from 'lucide-react'

const APP_NAV_ITEMS = [
  { href: '/jo-payroll', label: 'Dashboard', icon: FileText },
  { href: '/jo-payroll/job-database', label: 'JO Database', icon: Database },
  { href: '/jo-payroll/cash-atm', label: 'Cash / ATM', icon: Banknote },
  { href: '/jo-payroll/sss-deductions', label: 'SSS', icon: Building2 },
  { href: '/jo-payroll/hdmf', label: 'HDMF', icon: Landmark },
  { href: '/jo-payroll/appointments', label: 'Appointments', icon: Calendar },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-neutral-100 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">J.O Payroll</p>
              <p className="text-xs text-neutral-400 mt-0.5">Admin System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {APP_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => { router.push(href); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-violet-50 text-violet-700' : 'text-neutral-600 hover:bg-neutral-50'}`}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">v1.0.0</p>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-neutral-100 flex items-center px-5 gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <Menu size={18} className="text-neutral-600" />
          </button>
          <div className="flex-1" />
          <div className="text-xs text-neutral-400 font-medium">
            {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

/* @arkzen:layout:app:end */

/* @arkzen:page:index
/* @arkzen:page:layout:app */

const DashboardPage = () => {
  const { summary, setSummary, isLoading, setLoading } = usePayrollStore()

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders/stats/summary`)
        const data = await res.json()
        setSummary(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (isLoading) {
    return <div className="text-center py-12 text-neutral-500">Loading...</div>
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="J.O Payroll System Overview"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Active"
          value={String(summary?.total_active || 0)}
          icon={<Users size={18} />}
          accent="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="ATM Disbursements"
          value={String(summary?.total_atm || 0)}
          icon={<Banknote size={18} />}
          accent="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Cash Disbursements"
          value={String(summary?.total_cash || 0)}
          icon={<Wallet size={18} />}
          accent="text-orange-600 bg-orange-50"
        />
        <StatCard
          label="Total Basic Pay"
          value={formatPeso(summary?.total_basic_pay)}
          icon={<TrendingDown size={18} />}
          accent="text-violet-600 bg-violet-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total SSS"
          value={formatPeso(summary?.total_sss)}
          icon={<Building2 size={18} />}
          accent="text-rose-600 bg-rose-50"
        />
        <StatCard
          label="HDMF Premium"
          value={formatPeso(summary?.total_hdmf_premium)}
          icon={<Landmark size={18} />}
          accent="text-orange-600 bg-orange-50"
        />
        <StatCard
          label="Total Deductions"
          value={formatPeso(summary?.total_deductions)}
          icon={<TrendingDown size={18} />}
          accent="text-red-600 bg-red-50"
        />
        <StatCard
          label="Net Pay"
          value={formatPeso(summary?.net_pay)}
          sub="After deductions"
          icon={<Wallet size={18} />}
          accent="text-violet-600 bg-violet-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/jo-payroll/job-database" className="bg-white border border-neutral-100 rounded-lg p-5 hover:shadow-sm transition-all">
          <Database size={20} className="text-violet-600 mb-2" />
          <p className="font-medium text-neutral-900">Job Database</p>
          <p className="text-xs text-neutral-500 mt-1">Manage all job orders</p>
        </a>
        <a href="/jo-payroll/cash-atm" className="bg-white border border-neutral-100 rounded-lg p-5 hover:shadow-sm transition-all">
          <Banknote size={20} className="text-blue-600 mb-2" />
          <p className="font-medium text-neutral-900">Cash / ATM</p>
          <p className="text-xs text-neutral-500 mt-1">Disbursement groups</p>
        </a>
        <a href="/jo-payroll/sss-deductions" className="bg-white border border-neutral-100 rounded-lg p-5 hover:shadow-sm transition-all">
          <Building2 size={20} className="text-rose-600 mb-2" />
          <p className="font-medium text-neutral-900">SSS Deductions</p>
          <p className="text-xs text-neutral-500 mt-1">Track deductions</p>
        </a>
      </div>
    </div>
  )
}

/* @arkzen:page:index:end */

/* @arkzen:page:job-database
/* @arkzen:page:layout:app */

const JobDatabasePage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading, addJobOrder, updateJobOrder, removeJobOrder } = usePayrollStore()
  const [fundingFilter, setFundingFilter] = useState('all')
  const [disbFilter, setDisbFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<JobOrder | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return jobOrders.filter(jo => {
      const matchFunding = fundingFilter === 'all' || jo.funding === fundingFilter
      const matchDisb = disbFilter === 'all' || jo.disbursement_type === disbFilter
      const matchSearch = !search || jo.name_of_jo.toLowerCase().includes(search.toLowerCase())
      return matchFunding && matchDisb && matchSearch
    })
  }, [jobOrders, fundingFilter, disbFilter, search])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job order?')) return
    try {
      await fetch(`${API_BASE}/api/jo-payroll/job-orders/${id}`, { method: 'DELETE' })
      removeJobOrder(id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async (formData: any) => {
    try {
      if (editTarget) {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const updated = await res.json()
        updateJobOrder(updated.id, updated)
      } else {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const created = await res.json()
        addJobOrder(created)
      }
      setFormOpen(false)
      setEditTarget(null)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <PageHeader
        title="JO Database"
        description="Complete job order records"
        actions={
          <>
            <button className="border border-neutral-200 text-neutral-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5">
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => { setEditTarget(null); setFormOpen(true) }}
              className="bg-violet-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> Add
            </button>
          </>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <FilterPill label="All Funding" active={fundingFilter === 'all'} onClick={() => setFundingFilter('all')} />
          {FUNDING_OPTIONS.map(f => (
            <FilterPill key={f} label={f} active={fundingFilter === f} onClick={() => setFundingFilter(f)} />
          ))}
        </div>
      </div>

      {formOpen && (
        <div className="mb-4 p-4 border border-neutral-200 rounded-lg bg-white">
          <JOForm
            initial={editTarget}
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setEditTarget(null) }}
          />
        </div>
      )}

      <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">Title</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">Funding</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">Basic Pay</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">Type</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">Status</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <EmptyRow message="No job orders found" />
            ) : (
              filtered.map(jo => (
                <tr key={jo.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-900">{jo.name_of_jo}</td>
                  <td className="px-4 py-3 text-neutral-600">{jo.job_title}</td>
                  <td className="px-4 py-3 text-neutral-600">{jo.funding}</td>
                  <td className="px-4 py-3 text-neutral-900 font-medium">{formatPeso(jo.basic_pay)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${jo.disbursement_type === 'CASH' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {jo.disbursement_type}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={jo.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditTarget(jo); setFormOpen(true) }}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(jo.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-neutral-600 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* @arkzen:page:job-database:end */

/* @arkzen:page:cash-atm
/* @arkzen:page:layout:app */

const CashAtmPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cashGroup = jobOrders.filter(j => j.disbursement_type === 'CASH')
  const atmGroup = jobOrders.filter(j => j.disbursement_type === 'ATM')

  return (
    <div>
      <PageHeader title="Cash / ATM Grouping" description="Disbursement type groups" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-100 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Cash Disbursements ({cashGroup.length})</h2>
          <div className="space-y-3">
            {cashGroup.map(jo => (
              <div key={jo.id} className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{jo.name_of_jo}</p>
                  <p className="text-xs text-neutral-500">{jo.jor_pyrl_group}</p>
                </div>
                <p className="font-semibold text-neutral-900">{formatPeso(jo.basic_pay)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-100 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">ATM Disbursements ({atmGroup.length})</h2>
          <div className="space-y-3">
            {atmGroup.map(jo => (
              <div key={jo.id} className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{jo.name_of_jo}</p>
                  <p className="text-xs text-neutral-500">{jo.jor_pyrl_group}</p>
                </div>
                <p className="font-semibold text-neutral-900">{formatPeso(jo.basic_pay)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* @arkzen:page:cash-atm:end */

/* @arkzen:page:sss-deductions
/* @arkzen:page:layout:app */

const SssDeductionsPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const sssDeductions = jobOrders.filter(j => j.sss_amount && j.sss_amount > 0)
  const totalSss = sssDeductions.reduce((sum, j) => sum + (j.sss_amount || 0), 0)

  return (
    <div>
      <PageHeader title="SSS Deductions" description="Track SSS contributions" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-neutral-100">
          <p className="text-xs font-medium text-neutral-500">Total Deductees</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">{sssDeductions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-100">
          <p className="text-xs font-medium text-neutral-500">Total SSS</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">{formatPeso(totalSss)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-100">
          <p className="text-xs font-medium text-neutral-500">Average Per Person</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">{formatPeso(sssDeductions.length > 0 ? totalSss / sssDeductions.length : 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-100">
          <p className="text-xs font-medium text-neutral-500">Status</p>
          <p className="text-sm font-semibold text-emerald-600 mt-1">Current</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">SSS Number</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sssDeductions.map(jo => (
              <tr key={jo.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-900">{jo.name_of_jo}</td>
                <td className="px-4 py-3 text-neutral-600">{jo.sss_number || '-'}</td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">{formatPeso(jo.sss_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* @arkzen:page:sss-deductions:end */

/* @arkzen:page:hdmf
/* @arkzen:page:layout:app */

const HdmfPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const premiumGroup = jobOrders.filter(j => j.hdmf_premium && j.hdmf_premium > 0)
  const totalPremium = premiumGroup.reduce((sum, j) => sum + (j.hdmf_premium || 0), 0)

  return (
    <div>
      <PageHeader title="HDMF Deductions" description="Track HDMF contributions" />

      <div className="bg-white rounded-lg border border-neutral-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">HDMF Premium Contributions</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500">Total Contributions</p>
            <p className="text-2xl font-semibold text-neutral-900 mt-1">{premiumGroup.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Total Amount</p>
            <p className="text-2xl font-semibold text-neutral-900 mt-1">{formatPeso(totalPremium)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Average Per Person</p>
            <p className="text-2xl font-semibold text-neutral-900 mt-1">{formatPeso(premiumGroup.length > 0 ? totalPremium / premiumGroup.length : 0)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-700">HDMF No</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-700">Premium</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-700">MPL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {jobOrders.map(jo => (
              <tr key={jo.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-900">{jo.name_of_jo}</td>
                <td className="px-4 py-3 text-neutral-600">{jo.hdmf_no || '-'}</td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">{formatPeso(jo.hdmf_premium)}</td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">{formatPeso(jo.hdmf_mpl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* @arkzen:page:hdmf:end */

/* @arkzen:page:appointments
/* @arkzen:page:layout:app */

const AppointmentsPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders`)
        const data = await res.json()
        setJobOrders(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = jobOrders.reduce((acc, jo) => {
    const group = jo.jor_pyrl_group || 'Unassigned'
    if (!acc[group]) acc[group] = []
    acc[group].push(jo)
    return acc
  }, {} as Record<string, JobOrder[]>)

  return (
    <div>
      <PageHeader title="Appointment Sequencing" description="Job orders grouped by payroll group" />

      <div className="space-y-6">
        {Object.entries(grouped).map(([group, jos]) => (
          <div key={group} className="bg-white rounded-lg border border-neutral-100 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">{group}</h2>
            <div className="space-y-2">
              {jos.map((jo, idx) => (
                <div key={jo.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-xs font-medium text-violet-700">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-neutral-900">{jo.name_of_jo}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* @arkzen:page:appointments:end */