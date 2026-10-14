// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/appointments
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

// User screen (from @arkzen:native:page:appointments)
const AppointmentsScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch] = useState('')

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
        <Animated.View entering={FadeInDown.duration(350)}>
          <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">SEQUENCE</Text>
          <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Appointments</Text>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 12 }}>
          <StatCard value={sorted.length}  label="Total Slots"   />
          <StatCard value={activeCount}    label="Active Slots"  color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        </View>

        <SearchBar value={search} onChange={setSearch} placeholder="Search name or title…" />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color="#171717" />
        </View>
      ) : sorted.length === 0 ? (
        <View className="bg-white rounded-2xl p-10 items-center border border-gray-200 mx-4">
          <Text className="text-[13px] text-gray-400">No appointments found</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {sorted.map((jo, index) => (
            <Animated.View key={jo.id} entering={FadeInDown.duration(300).delay(index * 40)} className="bg-white rounded-[14px] border border-gray-200 p-3.5 mb-2 flex-row items-center" style={{ gap: 12 }}>
              <View className="w-9 h-9 bg-gray-100 rounded-[10px] items-center justify-center">
                <Text className="text-xs font-extrabold text-gray-700">#{jo.appointment_order}</Text>
              </View>
              <Avatar name={jo.name_of_jo} size={36} />
              <View className="flex-1">
                <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={1}>{jo.name_of_jo}</Text>
                <Text className="text-[11px] text-gray-400 mt-0.5">{jo.job_title} · JOR #{jo.jor_number}</Text>
              </View>
              <View className={`rounded-lg px-2 py-1 ${jo.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                <Text className={`text-[10px] font-bold ${jo.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {jo.status.toUpperCase()}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_JoPayroll_Appointments() {
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
        <AppointmentsScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_JoPayroll_Appointments
