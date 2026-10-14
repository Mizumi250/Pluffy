// ARKZEN GENERATED — jo-payroll/job-database (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:40.945Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { SearchBar } from './components/SearchBar'
import { TabRow } from './components/TabRow'
import { WorkerRow } from './components/WorkerRow'
import { BACKEND_URL } from './components/constants'
import { formatPeso } from './components/utils'
import type { JobOrder } from './components/types'

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

export const JoPayrollJobDatabase = WorkersScreen;
