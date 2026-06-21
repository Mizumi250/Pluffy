// ARKZEN GENERATED — jo-payroll/appointments (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T10:20:21.807Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { Avatar } from './components/Avatar'
import { SearchBar } from './components/SearchBar'
import { StatCard } from './components/StatCard'
import { BACKEND_URL } from './components/constants'
import type { JobOrder } from './components/types'

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

export const JoPayrollAppointments = AppointmentsScreen;
