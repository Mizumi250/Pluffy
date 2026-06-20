// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/cash-atm
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
import { Avatar } from './components/Avatar'
import { SearchBar } from './components/SearchBar'
import { StatCard } from './components/StatCard'
import { TabRow } from './components/TabRow'
import { WorkerRow } from './components/WorkerRow'
import { BASE } from './components/constants'
import { usePayrollStore } from './components/hooks'
import { formatPeso } from './components/utils'

// User screen (from @arkzen:native:page:cash-atm)
const CashAtmScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [activeTab, setActiveTab] = useState<'CASH' | 'ATM'>('CASH')

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

  const active   = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const cashList = useMemo(() => active.filter(j => j.disbursement_type === 'CASH'), [active])
  const atmList  = useMemo(() => active.filter(j => j.disbursement_type === 'ATM'),  [active])
  const cashTotal = useMemo(() => cashList.reduce((a, j) => a + j.basic_pay, 0), [cashList])
  const atmTotal  = useMemo(() => atmList.reduce((a, j) => a + j.basic_pay, 0),  [atmList])

  const list  = activeTab === 'CASH' ? cashList : atmList
  const total = activeTab === 'CASH' ? cashTotal : atmTotal

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 24 }}>

        <Animated.View entering={FadeInDown.duration(350)} style={{ marginBottom: 16 }}>
          <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">DISBURSEMENT</Text>
          <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Cash / ATM</Text>
        </Animated.View>

        {/* Summary cards */}
        <Animated.View entering={FadeInDown.duration(350).delay(60)} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <StatCard value={cashList.length} label="Cash Workers" color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
          <StatCard value={atmList.length}  label="ATM Workers"  color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(350).delay(90)} style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <StatCard value={formatPeso(cashTotal)} label="Cash Total"  color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
          <StatCard value={formatPeso(atmTotal)}  label="ATM Total"   color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        </Animated.View>

        {/* Tab toggle */}
        <Animated.View entering={FadeInDown.duration(350).delay(120)} style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['CASH', 'ATM'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
              className={`flex-1 py-3 rounded-xl items-center border ${activeTab === t ? 'bg-[#171717] border-[#171717]' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-[13px] font-bold ${activeTab === t ? 'text-white' : 'text-gray-400'}`}>{t}</Text>
              <Text className={`text-[11px] ${activeTab === t ? 'text-gray-400' : 'text-gray-300'} mt-0.5`}>{t === 'CASH' ? cashList.length : atmList.length} workers</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* List */}
        <Animated.View entering={FadeInDown.duration(350).delay(160)} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
            <Text className="text-[13px] font-bold text-gray-900">{activeTab} Disbursement</Text>
            <Text className={`text-xs font-semibold ${activeTab === 'CASH' ? 'text-amber-600' : 'text-blue-600'}`}>{formatPeso(total)}</Text>
          </View>

          {isLoading ? (
            <View style={{ padding: 32, alignItems: 'center' }}><ActivityIndicator color="#171717" /></View>
          ) : list.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}><Text className="text-[13px] text-gray-400">No entries</Text></View>
          ) : (
            list.map(jo => (
              <View key={jo.id} className="flex-row items-center px-4 py-3 border-b border-gray-50" style={{ gap: 12 }}>
                <Avatar name={jo.name_of_jo} size={36} />
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={1}>{jo.name_of_jo}</Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">{jo.jor_pyrl_group} · #{jo.jor_number}</Text>
                </View>
                {activeTab === 'ATM' && jo.cash_card_number && (
                  <Text className="text-[11px] text-gray-400">····{jo.cash_card_number.slice(-4)}</Text>
                )}
                <Text className="text-[13px] font-bold text-gray-900">{formatPeso(jo.basic_pay)}</Text>
              </View>
            ))
          )}
        </Animated.View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_JoPayroll_CashAtm() {
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
        <CashAtmScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_JoPayroll_CashAtm
