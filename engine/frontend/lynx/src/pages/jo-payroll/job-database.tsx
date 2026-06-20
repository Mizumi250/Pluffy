// ARKZEN GENERATED — jo-payroll/job-database (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.129Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { SearchBar } from './components/SearchBar'
import { TabRow } from './components/TabRow'
import { WorkerRow } from './components/WorkerRow'
import { BACKEND_URL } from './components/constants'
import { formatPeso } from './components/utils'
import type { JobOrder } from './components/types'

import { View, Text, ScrollView, TouchableOpacity, TextInput } from '@lynx-js/react'
import { useState, useEffect, useMemo } from '@lynx-js/react'

const WorkersScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [expanded, setExpanded]   = useState<number | null>(null)

  const TABS = ['All', 'Active', 'Inactive', 'CASH', 'ATM']

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${BACKEND_URL}/api/jo-payroll/job-orders`)
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
        <View>
          <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>JO DATABASE</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Workers</Text>
        </View>
        <View style={{ gap: 8, marginTop: 12 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, funding, SSS…" />
          <TabRow tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </View>
        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>{filtered.length} records</Text>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>Loading…</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' }}>
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
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#2563eb' }}>
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
        </ScrollView>
      )}
    </View>
  )
}
