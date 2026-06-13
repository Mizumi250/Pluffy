// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/appointments
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
import { ScrollView, View, Text, ActivityIndicator } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

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
          <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>SEQUENCE</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Appointments</Text>
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
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', marginHorizontal: 16 }}>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>No appointments found</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {sorted.map((jo, index) => (
            <Animated.View key={jo.id} entering={FadeInDown.duration(300).delay(index * 40)} style={{ backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
      <StatusBar style="dark" />
      <AppLayout tatSlug="jo-payroll">
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
