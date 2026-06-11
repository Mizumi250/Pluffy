// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/job-database
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
          <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>JO DATABASE</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Workers</Text>
        </Animated.View>
        <View style={{ gap: 8, marginTop: 12 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, funding, SSS…" />
          <TabRow tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </View>
        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>{filtered.length} records</Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color="#171717" />
        </View>
      ) : (
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, marginHorizontal: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', paddingBottom: 8 }}>
          {filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>No records found</Text>
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
                      <View key={label} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 8, minWidth: '44%', flex: 1 }}>
                        <Text style={{ fontSize: 10, color: '#9ca3af', fontWeight: '600', marginBottom: 2 }}>{label}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827' }}>{value}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ marginTop: 8, flexDirection: 'row', gap: 8 }}>
                    <View style={{ backgroundColor: jo.status === 'active' ? '#d1fae5' : '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: jo.status === 'active' ? '#059669' : '#9ca3af' }}>
                        {jo.status.toUpperCase()}
                      </Text>
                    </View>
                    {jo.cash_card_number && (
                      <View style={{ backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#2563eb', fontFamily: 'monospace' }}>
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
