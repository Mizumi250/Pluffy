// ARKZEN GENERATED — jo-payroll/payslip (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:29.215Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { Avatar } from './components/Avatar'
import { SearchBar } from './components/SearchBar'
import { BACKEND_URL } from './components/constants'
import { formatPeso } from './components/utils'
import type { JobOrder } from './components/types'

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

export const JoPayrollPayslip = PayslipScreen;
