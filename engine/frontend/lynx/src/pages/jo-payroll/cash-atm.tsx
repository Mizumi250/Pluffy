// ARKZEN GENERATED — jo-payroll/cash-atm (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:05.080Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { Avatar } from './components/Avatar'
import { StatCard } from './components/StatCard'
import { BACKEND_URL } from './components/constants'
import { formatPeso } from './components/utils'
import type { JobOrder } from './components/types'

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
                  <text className="text-[13px] font-semibold text-gray-900" maxLength={1}>{jo.name_of_jo}</text>
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
