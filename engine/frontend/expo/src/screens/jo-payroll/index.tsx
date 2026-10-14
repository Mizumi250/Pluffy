// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/index
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

// User screen (from @arkzen:native:page:index)
const DashboardScreen = () => {
  const { summary, setSummary, jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()

  useEffect(() => {
    if (summary && jobOrders.length > 0) return
    const load = async () => {
      setLoading(true)
      try {
        const [sumRes, joRes] = await Promise.all([
          fetch(`${BASE}/api/jo-payroll/job-orders/stats/summary`),
          fetch(`${BASE}/api/jo-payroll/job-orders`),
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

  if (isLoading) return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color="#171717" />
    </View>
  )

  return (
    <ScrollView className="flex-1 bg-[#F4F5F7]" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 24 }}>

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} className="mb-4">
        <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">J.O. PAYROLL SYSTEM</Text>
        <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Dashboard</Text>
      </Animated.View>

      {/* Net pay hero */}
      <Animated.View entering={FadeInDown.duration(400).delay(60)} className="bg-[#171717] rounded-[20px] p-5 mb-3">
        <Text className="text-[11px] text-gray-500 font-semibold tracking-[1.5px] mb-2">ACTIVE WORKERS NET PAY</Text>
        <Text className="text-[32px] font-extrabold text-white -tracking-[1px]">{formatPeso(summary?.net_pay)}</Text>
        <View className="flex-row mt-3" style={{ gap: 16 }}>
          <View>
            <Text className="text-[11px] text-gray-500">Gross Pay</Text>
            <Text className="text-[13px] font-semibold text-white mt-0.5">{formatPeso(summary?.total_basic_pay)}</Text>
          </View>
          <View>
            <Text className="text-[11px] text-gray-500">Total Deductions</Text>
            <Text className="text-[13px] font-semibold text-red-400 mt-0.5">{formatPeso(summary?.total_deductions)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Stat row */}
      <Animated.View entering={FadeInDown.duration(400).delay(120)} className="flex-row mb-3" style={{ gap: 10 }}>
        <StatCard value={summary?.total_active ?? 0}   label="Active JOs"   color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        <StatCard value={summary?.total_cash ?? 0}     label="Cash"         color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
        <StatCard value={summary?.total_atm ?? 0}      label="ATM"          color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        <StatCard value={summary?.total_inactive ?? 0} label="Inactive"     color="#9ca3af" />
      </Animated.View>

      {/* Deduction breakdown */}
      <Animated.View entering={FadeInDown.duration(400).delay(180)} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
        <Text className="text-[13px] font-bold text-gray-900 mb-3">Deduction Breakdown</Text>
        {[
          { label: 'SSS',           value: summary?.total_sss,          color: '#e11d48' },
          { label: 'HDMF Premium',  value: summary?.total_hdmf_premium, color: '#7c3aed' },
          { label: 'HDMF MPL',      value: summary?.total_hdmf_mpl,     color: '#2563eb' },
          { label: 'Calamity Loan', value: summary?.total_calamity_loan, color: '#d97706' },
        ].map(({ label, value, color }) => (
          <View key={label} className="flex-row items-center justify-between py-2 border-b border-gray-50">
            <Text className="text-[13px] text-gray-700">{label}</Text>
            <Text className="text-[13px] font-semibold" style={{ color }}>{formatPeso(value)}</Text>
          </View>
        ))}
        <View className="flex-row items-center justify-between pt-2.5">
          <Text className="text-[13px] font-bold text-gray-900">Total</Text>
          <Text className="text-sm font-extrabold text-red-600">{formatPeso(summary?.total_deductions)}</Text>
        </View>
      </Animated.View>

      {/* Recent JOs */}
      <Animated.View entering={FadeInDown.duration(400).delay(240)} className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-3">
        <View className="px-4 py-3.5 border-b border-gray-100">
          <Text className="text-[13px] font-bold text-gray-900">Recent Workers</Text>
          <Text className="text-[11px] text-gray-400 mt-0.5">Latest 5 entries</Text>
        </View>
        {recentJOs.length === 0
          ? <View className="p-8 items-center"><Text className="text-[13px] text-gray-400">No data</Text></View>
          : recentJOs.map(jo => <WorkerRow key={jo.id} jo={jo} />)
        }
      </Animated.View>

    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_JoPayroll_Index() {
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
        <DashboardScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_JoPayroll_Index
