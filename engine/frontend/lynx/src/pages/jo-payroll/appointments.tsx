// ARKZEN GENERATED — jo-payroll/appointments (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.143Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { Avatar } from './components/Avatar'
import { SearchBar } from './components/SearchBar'
import { StatCard } from './components/StatCard'
import { BACKEND_URL } from './components/constants'
import type { JobOrder } from './components/types'

import { View, Text, ScrollView, TouchableOpacity } from '@lynx-js/react'
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
    <View style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#F4F5F7' }}>
        <View>
          <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>SEQUENCE</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Appointments</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 12 }}>
          <StatCard value={sorted.length}  label="Total Slots"  />
          <StatCard value={activeCount}    label="Active Slots" color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        </View>

        <SearchBar value={search} onChange={setSearch} placeholder="Search name or title…" />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>Loading…</Text>
        </View>
      ) : sorted.length === 0 ? (
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', marginHorizontal: 16 }}>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>No appointments found</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {sorted.map(jo => (
            <View key={jo.id} style={{ backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 36, height: 36, backgroundColor: '#f3f4f6', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#374151' }}>#{jo.appointment_order}</Text>
              </View>
              <Avatar name={jo.name_of_jo} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{jo.name_of_jo}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{jo.job_title} · JOR #{jo.jor_number}</Text>
              </View>
              <View style={{ backgroundColor: jo.status === 'active' ? '#d1fae5' : '#f3f4f6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: jo.status === 'active' ? '#059669' : '#9ca3af' }}>
                  {jo.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
