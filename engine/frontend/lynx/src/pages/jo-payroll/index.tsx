// ARKZEN GENERATED — jo-payroll/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:07.762Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { StatCard } from './components/StatCard'
import { WorkerRow } from './components/WorkerRow'
import { BACKEND_URL } from './components/constants'
import { formatPeso } from './components/utils'
import type { JobOrder, PayrollSummary } from './components/types'

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

export const JoPayrollIndex = DashboardScreen;
