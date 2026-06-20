// ARKZEN GENERATED — jo-payroll/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.123Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { StatCard } from './components/StatCard'
import { WorkerRow } from './components/WorkerRow'
import { BACKEND_URL } from './components/constants'
import { formatPeso } from './components/utils'
import type { JobOrder, PayrollSummary } from './components/types'

import { View, Text, ScrollView, TouchableOpacity } from '@lynx-js/react'
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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 13, color: '#9ca3af' }}>Loading…</Text>
    </View>
  )

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4F5F7' }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 24 }}>

      {/* Header */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>J.O. PAYROLL SYSTEM</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Dashboard</Text>
      </View>

      {/* Net pay hero */}
      <View style={{ backgroundColor: '#171717', borderRadius: 20, padding: 20, marginBottom: 12 }}>
        <Text style={{ fontSize: 11, color: '#6b7280', letterSpacing: 1.5, marginBottom: 8 }}>ACTIVE WORKERS NET PAY</Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: '#ffffff', letterSpacing: -1 }}>{formatPeso(summary?.net_pay)}</Text>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
          <View>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>Gross Pay</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#ffffff', marginTop: 2 }}>{formatPeso(summary?.total_basic_pay)}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>Total Deductions</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#f87171', marginTop: 2 }}>{formatPeso(summary?.total_deductions)}</Text>
          </View>
        </View>
      </View>

      {/* Stat row */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <StatCard value={summary?.total_active ?? 0}   label="Active JOs"  color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        <StatCard value={summary?.total_cash ?? 0}     label="Cash"        color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
        <StatCard value={summary?.total_atm ?? 0}      label="ATM"         color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        <StatCard value={summary?.total_inactive ?? 0} label="Inactive"    color="#9ca3af" />
      </View>

      {/* Deduction breakdown */}
      <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Deduction Breakdown</Text>
        {[
          { label: 'SSS',           value: summary?.total_sss,           color: '#e11d48' },
          { label: 'HDMF Premium',  value: summary?.total_hdmf_premium,  color: '#7c3aed' },
          { label: 'HDMF MPL',      value: summary?.total_hdmf_mpl,      color: '#2563eb' },
          { label: 'Calamity Loan', value: summary?.total_calamity_loan, color: '#d97706' },
        ].map(({ label, value, color }) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' }}>
            <Text style={{ fontSize: 13, color: '#374151' }}>{label}</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color }}>{formatPeso(value)}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>Total</Text>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#e11d48' }}>{formatPeso(summary?.total_deductions)}</Text>
        </View>
      </View>

      {/* Recent JOs */}
      <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', marginBottom: 12 }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>Recent Workers</Text>
          <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Latest 5 entries</Text>
        </View>
        {recentJOs.length === 0
          ? <View style={{ padding: 32, alignItems: 'center' }}><Text style={{ fontSize: 13, color: '#9ca3af' }}>No data</Text></View>
          : recentJOs.map(jo => <WorkerRow key={jo.id} jo={jo} onPress={() => onNavigate('job-database')} />)
        }
      </View>

    </ScrollView>
  )
}
