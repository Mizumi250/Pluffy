// ============================================================
// ARKZEN GENERATED TYPES — jo-payroll
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:10:00.963Z
// ============================================================

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

// ─── Store ──────────────────────────────────────────────────────────────────
export interface PayrollState {
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
