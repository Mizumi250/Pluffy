// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/payslip
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AlertCircle, Banknote, Building2, CalendarDays, CreditCard, FileText, Landmark, LayoutDashboard, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react-native'
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { create } from 'zustand'
import { AppLayout } from '../../../arkzen/core/layouts/custom/jo-payroll-app'
import { useSlideIn } from '../../arkzen/generated/jo-payroll.native-animations'
import { s } from '../../arkzen/generated/jo-payroll.native-styles'
import { Avatar } from './components/Avatar'
import { SearchBar } from './components/SearchBar'
import { StatCard } from './components/StatCard'
import { TabRow } from './components/TabRow'
import { WorkerRow } from './components/WorkerRow'
import { BASE } from './components/constants'
import { usePayrollStore } from './components/hooks'
import { formatPeso } from './components/utils'
import type { JobOrder } from './components/types'

// User screen (from @arkzen:native:page:payslip)
const PayslipScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<JobOrder | null>(null)
  const [workDays, setWorkDays] = useState('26')

  useEffect(() => {
    if (jobOrders.length > 0) return
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BASE}/api/jo-payroll/job-orders`)
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

  const now = new Date()
  const periodLabel = now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4F5F7' }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 32 }}>

      <Animated.View entering={FadeInDown.duration(350)} style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>GENERATE</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Payslip</Text>
      </Animated.View>

      {/* Worker search */}
      <Animated.View entering={FadeInDown.duration(350).delay(60)} style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 10 }}>Select Worker</Text>
        <SearchBar value={search} onChange={setSearch} placeholder="Search worker name…" />

        <View style={{ marginTop: 10, gap: 4 }}>
          {(search ? filtered : activeJOs.slice(0, 8)).map(jo => (
            <TouchableOpacity
              key={jo.id}
              onPress={() => setSelected(jo)}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, backgroundColor: selected?.id === jo.id ? '#171717' : 'transparent' }}
            >
              <Avatar name={jo.name_of_jo} size={32} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: selected?.id === jo.id ? '#ffffff' : '#111827' }} numberOfLines={1}>{jo.name_of_jo}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>{jo.job_title} · {formatPeso(jo.basic_pay)}/day</Text>
              </View>
              {selected?.id === jo.id && (
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#171717' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Work days input */}
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>Work Days:</Text>
          <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8 }}>
            <TextInput
              value={workDays}
              onChangeText={setWorkDays}
              keyboardType="number-pad"
              style={{ fontSize: 13, color: '#111827', fontWeight: '600' }}
            />
          </View>
          <Text style={{ fontSize: 11, color: '#9ca3af' }}>days</Text>
        </View>
      </Animated.View>

      {/* Payslip preview */}
      {selected && computed ? (
        <Animated.View entering={FadeInDown.duration(400)} style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', padding: 18, marginBottom: 12 }}>

          {/* Header */}
          <View style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 14, marginBottom: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827', letterSpacing: -0.3 }}>LOCAL GOVERNMENT UNIT</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Job Order Payroll System</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Pay Period: {periodLabel}</Text>
          </View>

          {/* Worker info */}
          <View style={{ gap: 6, marginBottom: 14 }}>
            {[
              { label: 'Name',          value: selected.name_of_jo },
              { label: 'JOR #',         value: String(selected.jor_number) },
              { label: 'Title',         value: selected.job_title },
              { label: 'Funding',       value: selected.funding },
              { label: 'Disbursement',  value: selected.disbursement_type },
              { label: 'Days Worked',   value: `${computed.days} days` },
            ].map(({ label, value }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{label}:</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#111827', fontFamily: 'monospace' }}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Gross pay */}
          <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
                Basic Pay ({formatPeso(selected.basic_pay)}/day × {computed.days})
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827', fontFamily: 'monospace' }}>{formatPeso(computed.gross)}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, marginTop: 8, gap: 6 }}>
            <Text style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: 1 }}>DEDUCTIONS:</Text>
            {[
              { label: 'SSS Contribution', value: computed.sss,      show: computed.sss > 0 },
              { label: 'HDMF Premium',     value: computed.hdmfPrem, show: computed.hdmfPrem > 0 },
              { label: 'HDMF MPL',         value: computed.hdmfMpl,  show: computed.hdmfMpl > 0 },
              { label: 'Calamity Loan',    value: computed.calamity, show: computed.calamity > 0 },
            ].filter(d => d.show).map(({ label, value }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{label}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#e11d48', fontFamily: 'monospace' }}>({formatPeso(value)})</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 6 }}>
              <Text style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>Total Deductions</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#e11d48', fontFamily: 'monospace' }}>({formatPeso(computed.deductions)})</Text>
            </View>
          </View>

          {/* Net pay */}
          <View style={{ backgroundColor: '#171717', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>NET PAY</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff' }}>{formatPeso(computed.net)}</Text>
          </View>
        </Animated.View>
      ) : (
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>Select a worker to preview payslip</Text>
        </View>
      )}

    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_JoPayroll_Payslip() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('jo-payroll')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <AppLayout tatSlug="jo-payroll">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PayslipScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_JoPayroll_Payslip
