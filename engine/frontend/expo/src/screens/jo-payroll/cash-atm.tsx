// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/cash-atm [Expo]
// Layout: app | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:cash-atm instead
// Generated: 2026-05-25T06:56:27.621Z
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
// No layout wrapper — blank screen

export function CashAtmScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const CashAtmPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [activeGroup, setActiveGroup] = useState('All')

  useEffect(() => {
    const load = async () => {
      if (jobOrders.length > 0) return
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/jo-payroll/job-orders`)
        setJobOrders(await res.json())
      } catch { }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const active = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const cashList = useMemo(() => active.filter(j => j.disbursement_type === 'CASH' && (activeGroup === 'All' || j.jor_pyrl_group === activeGroup)), [active, activeGroup])
  const atmList  = useMemo(() => active.filter(j => j.disbursement_type === 'ATM'  && (activeGroup === 'All' || j.jor_pyrl_group === activeGroup)), [active, activeGroup])

  const cashTotal = useMemo(() => cashList.reduce((a, j) => a + j.basic_pay, 0), [cashList])
  const atmTotal  = useMemo(() => atmList.reduce((a, j)  => a + j.basic_pay, 0), [atmList])

  const groups = useMemo(() => ['All', ...new Set(active.map(j => j.jor_pyrl_group ?? '').filter(Boolean))], [active])

  const DisbGroup = ({ title, list, total, accent }: { title: string; list: JobOrder[]; total: number; accent: string }) => (
    <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 font-['Syne',sans-serif]">{title}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{list.length} workers · {formatPeso(total)} total</p>
        </div>
        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${accent}`}>
          {title.includes('CASH') ? 'CASH' : 'ATM'}
        </span>
      </div>
      {isLoading
        ? <Spinner />
        : list.length === 0
          ? <EmptyRow message="No entries for this filter" />
          : list.map(jo => (
              <div key={jo.id} className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(jo.name_of_jo)}`}>
                  {getInitials(jo.name_of_jo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{jo.name_of_jo}</p>
                  <p className="text-xs text-neutral-400">{jo.jor_pyrl_group} · #{jo.jor_number}</p>
                </div>
                {jo.disbursement_type === 'ATM' && jo.cash_card_number && (
                  <p className="text-xs text-neutral-400 font-mono hidden sm:block">
                    ····{jo.cash_card_number.slice(-4)}
                  </p>
                )}
                <p className="text-sm font-semibold text-neutral-900 shrink-0">{formatPeso(jo.basic_pay)}</p>
              </div>
            ))
      }
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Stats row */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="stat-chip flex-1 min-w-[140px] bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <Banknote size={16} className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{cashList.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">CASH Workers</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">{formatPeso(cashTotal)}</p>
        </div>
        <div className="stat-chip flex-1 min-w-[140px] bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
          <CreditCard size={16} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{atmList.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">ATM Workers</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">{formatPeso(atmTotal)}</p>
        </div>
        <div className="stat-chip flex-1 min-w-[140px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Wallet size={16} className="text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(cashTotal + atmTotal)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Total Gross</p>
        </div>
      </div>

      {/* Group filter */}
      <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-3">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-neutral-500 shrink-0">Payroll Group:</p>
          <TabPills tabs={groups} active={activeGroup} onChange={setActiveGroup} />
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DisbGroup title="CASH Disbursement" list={cashList} total={cashTotal} accent="bg-amber-50 text-amber-700" />
        <DisbGroup title="ATM Disbursement"  list={atmList}  total={atmTotal}  accent="bg-blue-50 text-blue-700"   />
      </div>
    </div>
  )
}
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default CashAtmScreen
