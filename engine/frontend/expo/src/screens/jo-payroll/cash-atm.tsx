// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/cash-atm
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import Animated, { FadeInDown } from 'react-native-reanimated'
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
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:cash-atm)
const CashAtmScreen = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [activeTab, setActiveTab] = useState('CASH')

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
          <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>DISBURSEMENT</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Cash / ATM</Text>
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
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: activeTab === t ? '#171717' : '#ffffff', borderWidth: 1, borderColor: activeTab === t ? '#171717' : '#e5e7eb' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === t ? '#ffffff' : '#9ca3af' }}>{t}</Text>
              <Text style={{ fontSize: 11, color: activeTab === t ? '#9ca3af' : '#d1d5db', marginTop: 2 }}>{t === 'CASH' ? cashList.length : atmList.length} workers</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* List */}
        <Animated.View entering={FadeInDown.duration(350).delay(160)} style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{activeTab} Disbursement</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: activeTab === 'CASH' ? '#d97706' : '#2563eb' }}>{formatPeso(total)}</Text>
          </View>

          {isLoading ? (
            <View style={{ padding: 32, alignItems: 'center' }}><ActivityIndicator color="#171717" /></View>
          ) : list.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}><Text style={{ fontSize: 13, color: '#9ca3af' }}>No entries</Text></View>
          ) : (
            list.map(jo => (
              <View key={jo.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' }}>
                <Avatar name={jo.name_of_jo} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{jo.name_of_jo}</Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{jo.jor_pyrl_group} · #{jo.jor_number}</Text>
                </View>
                {activeTab === 'ATM' && jo.cash_card_number && (
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>····{jo.cash_card_number.slice(-4)}</Text>
                )}
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{formatPeso(jo.basic_pay)}</Text>
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
