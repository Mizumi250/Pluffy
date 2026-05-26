// ============================================================
// ARKZEN GENERATED SCREEN — jo-payroll/sss [Expo]
// Layout: app | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:sss instead
// Generated: 2026-05-26T09:29:49.268Z
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

export function SssScreen() {
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
        const SssPage = () => {
  const { jobOrders, setJobOrders, isLoading, setLoading } = usePayrollStore()
  const [search, setSearch] = useState('')

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

  const list = useMemo(() =>
    jobOrders.filter(j => j.status === 'active' && (j.sss_amount ?? 0) > 0)
      .filter(j => search === '' || j.name_of_jo.toLowerCase().includes(search.toLowerCase()) || (j.sss_number ?? '').includes(search))
  , [jobOrders, search])

  const totalSss = useMemo(() => list.reduce((a, j) => a + (j.sss_amount ?? 0), 0), [list])
  const totalCalamity = useMemo(() => list.reduce((a, j) => a + (j.calamity_loan ?? 0), 0), [list])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Stats */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Building2 size={16} className="text-rose-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{list.length}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">SSS Members</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-rose-100 shadow-sm">
          <TrendingDown size={16} className="text-rose-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(totalSss)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">SSS Deductions</p>
        </div>
        <div className="stat-chip flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <AlertCircle size={16} className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-neutral-900 font-['Syne',sans-serif]">{formatPeso(totalCalamity)}</p>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">Calamity Loans</p>
        </div>
      </div>

      {/* Table card */}
      <div className="section-card bg-white rounded-2xl border border-neutral-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
          <SectionHeader title="SSS Deductions" subtitle="Active workers with SSS contributions" />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text" placeholder="Search name or SSS number…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
            />
          </div>
        </div>
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  {['#', 'Name', 'SSS Number', 'SSS Amount', 'Calamity Loan', 'Total'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0
                  ? <tr><td colSpan={6}><EmptyRow message="No SSS records found" /></td></tr>
                  : list.map((jo, i) => (
                      <tr key={jo.id} className="border-b border-neutral-50 hover:bg-neutral-50/80 transition-colors jo-row">
                        <td className="px-5 py-3 text-xs text-neutral-400">{i + 1}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(jo.name_of_jo)}`}>
                              {getInitials(jo.name_of_jo)}
                            </div>
                            <span className="font-medium text-neutral-900 text-xs whitespace-nowrap">{jo.name_of_jo}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs font-mono text-neutral-600">{jo.sss_number ?? '—'}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-rose-600">{formatPeso(jo.sss_amount)}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-amber-600">{formatPeso(jo.calamity_loan)}</td>
                        <td className="px-5 py-3 text-xs font-bold text-neutral-900">{formatPeso((jo.sss_amount ?? 0) + (jo.calamity_loan ?? 0))}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default SssScreen
