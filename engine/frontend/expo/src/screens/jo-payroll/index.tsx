// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/index
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Banknote, Building2, CreditCard, Landmark, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { create } from 'zustand'
import { AppLayout } from '../../../arkzen/core/layouts/custom/jo-payroll-app'
import { useSlideIn } from '../../arkzen/generated/jo-payroll.native-animations'
import { s } from '../../arkzen/generated/jo-payroll.native-styles'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
// ── Types ────────────────────────────────────────────────────

export interface JobOrder {
  id: number
  jor_number: number
  name_of_jo: string
  job_title: string
  funding: string
  basic_pay: number
  disbursement_type: 'CASH' | 'ATM'
  jor_pyrl_group?: string
  hdmf_no?: string
  sss_number?: string
  sss_amount?: number
  calamity_loan?: number
  hdmf_mpl?: number
  hdmf_premium?: number
  cash_card_number?: string
  appointment_order?: number
  status: 'active' | 'inactive'
}

export interface PayrollSummary {
  total_active: number
  total_inactive: number
  total_atm: number
  total_cash: number
  total_basic_pay: number
  total_sss: number
  total_hdmf_premium: number
  total_hdmf_mpl: number
  total_calamity_loan: number
  total_deductions: number
  net_pay: number
  funding_breakdown?: Record<string, { count: number; total_pay: number }>
  group_breakdown?: Record<string, number>
}

// ── Store ────────────────────────────────────────────────────

interface PayrollStore {
  jobOrders: JobOrder[]
  summary: PayrollSummary | null
  isLoading: boolean
  setJobOrders: (o: JobOrder[]) => void
  setSummary: (s: PayrollSummary) => void
  setLoading: (v: boolean) => void
}

export const usePayrollStore = create<PayrollStore>((set) => ({
  jobOrders: [],
  summary: null,
  isLoading: false,
  setJobOrders: (jobOrders) => set({ jobOrders }),
  setSummary: (summary) => set({ summary }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// ── Utils ────────────────────────────────────────────────────

export const BASE = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

export const formatPeso = (v?: number) =>
  v == null ? '₱0.00' : `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const getInitials = (name: string) => {
  const parts = name.replace(/,/g, '').trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#ffe4e6', text: '#e11d48' },
  { bg: '#cffafe', text: '#0891b2' },
]

export const getAvatarColor = (name: string) => {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

// ── Avatar ───────────────────────────────────────────────────

export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const color = getAvatarColor(name)
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: color.text }}>{getInitials(name)}</Text>
    </View>
  )
}

// ── StatCard ─────────────────────────────────────────────────

export const StatCard = ({ value, label, color = '#111827', bg = '#ffffff', borderColor = '#e5e7eb' }: {
  value: string | number
  label: string
  color?: string
  bg?: string
  borderColor?: string
}) => (
  <View style={{ flex: 1, backgroundColor: bg, borderRadius: 14, borderWidth: 1, borderColor, padding: 14 }}>
    <Text style={{ fontSize: 22, fontWeight: '700', color }}>{value}</Text>
    <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500', marginTop: 2 }}>{label}</Text>
  </View>
)

// ── WorkerRow ────────────────────────────────────────────────

export const WorkerRow = ({ jo, onPress }: { jo: JobOrder; onPress?: () => void }) => {
  const deductions = (jo.sss_amount ?? 0) + (jo.hdmf_premium ?? 0) + (jo.hdmf_mpl ?? 0) + (jo.calamity_loan ?? 0)
  const netPay = jo.basic_pay - deductions

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' }}
    >
      <Avatar name={jo.name_of_jo} size={38} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{jo.name_of_jo}</Text>
        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{jo.job_title} · {jo.funding}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{formatPeso(netPay)}</Text>
        <View style={{ backgroundColor: jo.disbursement_type === 'ATM' ? '#dbeafe' : '#fef3c7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: jo.disbursement_type === 'ATM' ? '#2563eb' : '#d97706' }}>
            {jo.disbursement_type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── SearchBar ────────────────────────────────────────────────

export const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
    <Search size={14} color="#9ca3af" />
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder ?? 'Search…'}
      placeholderTextColor="#d1d5db"
      style={{ flex: 1, fontSize: 13, color: '#111827' }}
    />
  </View>
)

// ── TabRow ───────────────────────────────────────────────────

export const TabRow = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
    {tabs.map(t => (
      <TouchableOpacity
        key={t}
        onPress={() => onChange(t)}
        activeOpacity={0.7}
        style={{ borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: active === t ? '#171717' : 'transparent' }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: active === t ? '#ffffff' : '#9ca3af' }}>{t}</Text>
      </TouchableOpacity>
    ))}
  </View>
)

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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#171717" />
    </View>
  )

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4F5F7' }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 24 }}>

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>J.O. PAYROLL SYSTEM</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Dashboard</Text>
      </Animated.View>

      {/* Net pay + deductions hero */}
      <Animated.View entering={FadeInDown.duration(400).delay(60)} style={{ backgroundColor: '#171717', borderRadius: 20, padding: 20, marginBottom: 12 }}>
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
      </Animated.View>

      {/* Stat row */}
      <Animated.View entering={FadeInDown.duration(400).delay(120)} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <StatCard value={summary?.total_active ?? 0}   label="Active JOs"   color="#059669" bg="#f0fdf4" borderColor="#bbf7d0" />
        <StatCard value={summary?.total_cash ?? 0}     label="Cash"         color="#d97706" bg="#fffbeb" borderColor="#fde68a" />
        <StatCard value={summary?.total_atm ?? 0}      label="ATM"          color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" />
        <StatCard value={summary?.total_inactive ?? 0} label="Inactive"     color="#9ca3af" />
      </Animated.View>

      {/* Deduction breakdown */}
      <Animated.View entering={FadeInDown.duration(400).delay(180)} style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Deduction Breakdown</Text>
        {[
          { label: 'SSS',           value: summary?.total_sss,          color: '#e11d48' },
          { label: 'HDMF Premium',  value: summary?.total_hdmf_premium, color: '#7c3aed' },
          { label: 'HDMF MPL',      value: summary?.total_hdmf_mpl,     color: '#2563eb' },
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
      </Animated.View>

      {/* Recent JOs */}
      <Animated.View entering={FadeInDown.duration(400).delay(240)} style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', marginBottom: 12 }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>Recent Workers</Text>
          <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Latest 5 entries</Text>
        </View>
        {recentJOs.length === 0
          ? <View style={{ padding: 32, alignItems: 'center' }}><Text style={{ fontSize: 13, color: '#9ca3af' }}>No data</Text></View>
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
      <StatusBar style="dark" />
      <AppLayout tatSlug="jo-payroll">
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
