// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/cash-atm
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
