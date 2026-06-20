// ARKZEN GENERATED — jo-payroll/cash-atm (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.139Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { Avatar } from './components/Avatar'
import { StatCard } from './components/StatCard'
import { BACKEND_URL } from './components/constants'
import { formatPeso } from './components/utils'
import type { JobOrder } from './components/types'

import { View, Text, ScrollView, TouchableOpacity } from '@lynx-js/react'
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
    <View style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 24 }}>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>DISBURSEMENT</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Cash / ATM</Text>
        </View>

        {/* Summary cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <StatCard value={cashList.length} label="Cash Workers" color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
          <StatCard value={atmList.length}  label="ATM Workers"  color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <StatCard value={formatPeso(cashTotal)} label="Cash Total" color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
          <StatCard value={formatPeso(atmTotal)}  label="ATM Total"  color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        </View>

        {/* Tab toggle */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['CASH', 'ATM'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: activeTab === t ? '#171717' : '#ffffff', borderWidth: 1, borderColor: activeTab === t ? '#171717' : '#e5e7eb' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === t ? '#ffffff' : '#9ca3af' }}>{t}</Text>
              <Text style={{ fontSize: 11, color: activeTab === t ? '#9ca3af' : '#d1d5db', marginTop: 2 }}>{t === 'CASH' ? cashList.length : atmList.length} workers</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{activeTab} Disbursement</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: activeTab === 'CASH' ? '#d97706' : '#2563eb' }}>{formatPeso(total)}</Text>
          </View>

          {loading ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>Loading…</Text>
            </View>
          ) : list.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>No entries</Text>
            </View>
          ) : (
            list.map(jo => (
              <View key={jo.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' }}>
                <Avatar name={jo.name_of_jo} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{jo.name_of_jo}</Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{jo.jor_pyrl_group} · #{jo.jor_number}</Text>
                </View>
                {activeTab === 'ATM' && jo.cash_card_number && (
                  <Text style={{ fontSize: 11, color: '#9ca3af' }}>····{jo.cash_card_number.slice(-4)}</Text>
                )}
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{formatPeso(jo.basic_pay)}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  )
}
