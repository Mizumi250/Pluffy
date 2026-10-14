// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/payslip
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { AlertCircle, Banknote, Building2, CalendarDays, CreditCard, FileText, Landmark, LayoutDashboard, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react-native'
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { create } from 'zustand'
import { AppLayout } from '../../../arkzen/core/layouts/custom/jo-payroll-app'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { useSlideIn } from '../../arkzen/generated/jo-payroll.native-animations'
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
        <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">GENERATE</Text>
        <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Payslip</Text>
      </Animated.View>

      {/* Worker search */}
      <Animated.View entering={FadeInDown.duration(350).delay(60)} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
        <Text className="text-[13px] font-bold text-gray-900 mb-2.5">Select Worker</Text>
        <SearchBar value={search} onChange={setSearch} placeholder="Search worker name…" />

        <View style={{ marginTop: 10, gap: 4 }}>
          {(search ? filtered : activeJOs.slice(0, 8)).map(jo => (
            <TouchableOpacity
              key={jo.id}
              onPress={() => setSelected(jo)}
              activeOpacity={0.7}
              className={`flex-row items-center p-2.5 rounded-[10px] ${selected?.id === jo.id ? 'bg-[#171717]' : 'bg-transparent'}`}
              style={{ gap: 10 }}
            >
              <Avatar name={jo.name_of_jo} size={32} />
              <View className="flex-1">
                <Text className={`text-xs font-semibold ${selected?.id === jo.id ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>{jo.name_of_jo}</Text>
                <Text className="text-[11px] text-gray-400">{jo.job_title} · {formatPeso(jo.basic_pay)}/day</Text>
              </View>
              {selected?.id === jo.id && (
                <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                  <Text className="text-xs text-[#171717]">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Work days input */}
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text className="text-xs text-gray-500 font-medium">Work Days:</Text>
          <View className="flex-1 bg-gray-50 rounded-[10px] border border-gray-200 px-3 py-2">
            <TextInput
              value={workDays}
              onChangeText={setWorkDays}
              keyboardType="number-pad"
              className="text-[13px] text-gray-900 font-semibold"
            />
          </View>
          <Text className="text-[11px] text-gray-400">days</Text>
        </View>
      </Animated.View>

      {/* Payslip preview */}
      {selected && computed ? (
        <Animated.View entering={FadeInDown.duration(400)} className="bg-white rounded-2xl border-2 border-gray-200 p-[18px] mb-3" style={{ borderStyle: 'dashed' }}>
          {/* Header */}
          <View className="items-center border-b border-gray-100 pb-3.5 mb-3.5">
            <Text className="text-sm font-extrabold text-gray-900 -tracking-[0.3px]">LOCAL GOVERNMENT UNIT</Text>
            <Text className="text-[11px] text-gray-400 mt-0.5">Job Order Payroll System</Text>
            <Text className="text-[11px] text-gray-400 mt-0.5">Pay Period: {periodLabel}</Text>
          </View>

          {/* Worker info */}
          <View style={{ gap: 6, marginBottom: 14 }}>
            {[
              { label: 'Name',         value: selected.name_of_jo },
              { label: 'JOR #',        value: String(selected.jor_number) },
              { label: 'Title',        value: selected.job_title },
              { label: 'Funding',      value: selected.funding },
              { label: 'Disbursement', value: selected.disbursement_type },
              { label: 'Days Worked',  value: `${computed.days} days` },
            ].map(({ label, value }) => (
              <View key={label} className="flex-row justify-between">
                <Text className="text-[11px] text-gray-400">{label}:</Text>
                <Text className="text-[11px] font-semibold text-gray-900">{value}</Text>
              </View>
            ))}
          </View>

          {/* Gross pay */}
          <View className="border-t border-gray-100 pt-3" style={{ marginBottom: 4 }}>
            <View className="flex-row justify-between">
              <Text className="text-[11px] text-gray-500">
                {`Basic Pay (${formatPeso(selected.basic_pay)}/day × ${computed.days})`}
              </Text>
              <Text className="text-xs font-bold text-gray-900">{formatPeso(computed.gross)}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View className="border-t border-gray-100 pt-2.5 mt-2" style={{ gap: 6 }}>
            <Text className="text-[10px] text-gray-400 tracking-[1px]">DEDUCTIONS:</Text>
            {[
              { label: 'SSS Contribution', value: computed.sss,      show: computed.sss > 0 },
              { label: 'HDMF Premium',     value: computed.hdmfPrem, show: computed.hdmfPrem > 0 },
              { label: 'HDMF MPL',         value: computed.hdmfMpl,  show: computed.hdmfMpl > 0 },
              { label: 'Calamity Loan',    value: computed.calamity, show: computed.calamity > 0 },
            ].filter(d => d.show).map(({ label, value }) => (
              <View key={label} className="flex-row justify-between">
                <Text className="text-[11px] text-gray-500">{label}</Text>
                <Text className="text-[11px] font-semibold text-red-600">({formatPeso(value)})</Text>
              </View>
            ))}
            <View className="flex-row justify-between border-t border-gray-100 pt-1.5">
              <Text className="text-[11px] text-gray-400">Total Deductions</Text>
              <Text className="text-[11px] font-bold text-red-600">({formatPeso(computed.deductions)})</Text>
            </View>
          </View>

          {/* Net pay */}
          <View className="bg-[#171717] rounded-xl px-4 py-3.5 flex-row justify-between items-center mt-3.5">
            <Text className="text-sm font-extrabold text-white">NET PAY</Text>
            <Text className="text-xl font-extrabold text-white">{formatPeso(computed.net)}</Text>
          </View>
        </Animated.View>
      ) : (
        <View className="bg-white rounded-2xl border border-gray-200 p-10 items-center">
          <Text className="text-[13px] text-gray-400">Select a worker to preview payslip</Text>
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
      <ArkzenStatusBar style="dark" />
      <AppLayout>
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
