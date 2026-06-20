// ARKZEN GENERATED — jo-payroll/payslip (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.149Z
import { useFadeSlideIn } from '../../arkzen/generated/jo-payroll.lynx-animations'
import { Avatar } from './components/Avatar'
import { SearchBar } from './components/SearchBar'
import { BACKEND_URL } from './components/constants'
import { formatPeso } from './components/utils'
import type { JobOrder } from './components/types'

import { View, Text, ScrollView, TouchableOpacity, TextInput } from '@lynx-js/react'
import { useState, useEffect, useMemo } from '@lynx-js/react'

const PayslipScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<JobOrder | null>(null)
  const [workDays, setWorkDays]   = useState('26')

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

  const activeJOs = useMemo(() => jobOrders.filter(j => j.status === 'active'), [jobOrders])
  const filtered  = useMemo(() =>
    activeJOs.filter(j => search === '' || j.name_of_jo.toLowerCase().includes(search.toLowerCase()))
  , [activeJOs, search])

  const computed = useMemo(() => {
    if (!selected) return null
    const days       = parseInt(workDays) || 0
    const gross      = selected.basic_pay * days
    const sss        = selected.sss_amount ?? 0
    const hdmfPrem   = selected.hdmf_premium ?? 0
    const hdmfMpl    = selected.hdmf_mpl ?? 0
    const calamity   = selected.calamity_loan ?? 0
    const deductions = sss + hdmfPrem + hdmfMpl + calamity
    return { gross, sss, hdmfPrem, hdmfMpl, calamity, deductions, net: gross - deductions, days }
  }, [selected, workDays])

  const now         = new Date()
  const periodLabel = now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4F5F7' }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 32 }}>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1.5, fontWeight: '600' }}>GENERATE</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2, letterSpacing: -0.5 }}>Payslip</Text>
      </View>

      {/* Worker search panel */}
      <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 10 }}>Select Worker</Text>
        <SearchBar value={search} onChange={setSearch} placeholder="Search worker name…" />

        <View style={{ marginTop: 10, gap: 4 }}>
          {(search ? filtered : activeJOs.slice(0, 8)).map(jo => (
            <TouchableOpacity
              key={jo.id}
              onPress={() => setSelected(jo)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, backgroundColor: selected?.id === jo.id ? '#171717' : 'transparent' }}
            >
              <Avatar name={jo.name_of_jo} size={32} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: selected?.id === jo.id ? '#ffffff' : '#111827' }} numberOfLines={1}>{jo.name_of_jo}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>{jo.job_title} · {formatPeso(jo.basic_pay)}/day</Text>
              </View>
              {selected?.id === jo.id && (
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#171717' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Work days input — Lynx uses onInput */}
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>Work Days:</Text>
          <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8 }}>
            <TextInput
              value={workDays}
              onInput={e => setWorkDays(e.detail.value)}
              style={{ fontSize: 13, color: '#111827', fontWeight: '600' }}
            />
          </View>
          <Text style={{ fontSize: 11, color: '#9ca3af' }}>days</Text>
        </View>
      </View>

      {/* Payslip preview */}
      {selected && computed ? (
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', padding: 18, marginBottom: 12 }}>

          {/* Header */}
          <View style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 14, marginBottom: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827', letterSpacing: -0.3 }}>LOCAL GOVERNMENT UNIT</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Job Order Payroll System</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Pay Period: {periodLabel}</Text>
          </View>

          {/* Worker info */}
          <View style={{ gap: 6, marginBottom: 14 }}>
            {[
              { label: 'Name',         value: selected.name_of_jo },
              { label: 'JOR #',        value: String(selected.jor_number) },
              { label: 'Title',        value: selected.job_title },
              { label: 'Funding',      value: selected.funding },
              { label: 'Disbursement', value: selected.disbursement_type },
              { label: 'Days Worked',  value: `${computed.days} days` },
            ].map(({ label, value }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>{label}:</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#111827' }}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Gross pay */}
          <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>
                {`Basic Pay (${formatPeso(selected.basic_pay)}/day × ${computed.days})`}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>{formatPeso(computed.gross)}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, marginTop: 8, gap: 6 }}>
            <Text style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>DEDUCTIONS:</Text>
            {[
              { label: 'SSS Contribution', value: computed.sss,      show: computed.sss > 0 },
              { label: 'HDMF Premium',     value: computed.hdmfPrem, show: computed.hdmfPrem > 0 },
              { label: 'HDMF MPL',         value: computed.hdmfMpl,  show: computed.hdmfMpl > 0 },
              { label: 'Calamity Loan',    value: computed.calamity, show: computed.calamity > 0 },
            ].filter(d => d.show).map(({ label, value }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>{label}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#e11d48' }}>({formatPeso(value)})</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 6 }}>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>Total Deductions</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#e11d48' }}>({formatPeso(computed.deductions)})</Text>
            </View>
          </View>

          {/* Net pay */}
          <View style={{ backgroundColor: '#171717', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>NET PAY</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff' }}>{formatPeso(computed.net)}</Text>
          </View>
        </View>
      ) : (
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>Select a worker to preview payslip</Text>
        </View>
      )}

    </ScrollView>
  )
}
