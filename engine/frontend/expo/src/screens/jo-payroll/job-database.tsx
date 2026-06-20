// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/job-database
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

// User screen (from @arkzen:native:page:job-database)
const WorkersScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [expanded, setExpanded] = useState<number | null>(null)

  const TABS = ['All', 'Active', 'Inactive', 'CASH', 'ATM']

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
    <View style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      {/* Fixed header */}
      <View style={{ backgroundColor: '#F4F5F7', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 }}>
        <Animated.View entering={FadeInDown.duration(350)}>
          <Text className="text-[11px] text-gray-400 font-semibold tracking-[1.5px]">JO DATABASE</Text>
          <Text className="text-[22px] font-extrabold text-gray-900 mt-0.5 -tracking-[0.5px]">Workers</Text>
        </Animated.View>
        <View style={{ gap: 8, marginTop: 12 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, funding, SSS…" />
          <TabRow tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </View>
        <Text className="text-[11px] text-gray-400 mt-2">{filtered.length} records</Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color="#171717" />
        </View>
      ) : (
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 overflow-hidden pb-2">
          {filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text className="text-[13px] text-gray-400">No records found</Text>
            </View>
          ) : filtered.map(jo => (
            <View key={jo.id}>
              <WorkerRow jo={jo} onPress={() => setExpanded(expanded === jo.id ? null : jo.id)} />
              {expanded === jo.id && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
                      <View key={label} className="flex-1 bg-white rounded-[10px] border border-gray-200 px-2.5 py-2" style={{ minWidth: '44%' }}>
                        <Text className="text-[10px] text-gray-400 font-semibold mb-0.5">{label}</Text>
                        <Text className="text-xs font-semibold text-gray-900">{value}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <View className={`rounded-lg px-2.5 py-1.5 ${jo.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <Text className={`text-[11px] font-semibold ${jo.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {jo.status.toUpperCase()}
                      </Text>
                    </View>
                    {jo.cash_card_number && (
                      <View className="bg-blue-50 rounded-lg px-2.5 py-1.5">
                        <Text className="text-[11px] font-semibold text-blue-600">
                          ····{jo.cash_card_number.slice(-4)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_JoPayroll_JobDatabase() {
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
        <WorkersScreen />
      </ScrollView>
      </AppLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_JoPayroll_JobDatabase
