// ARKZEN GENERATED — jo-payroll/app (Lynx custom layout)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Must export a component named AppLayout.
import { View, Text, TouchableOpacity } from '@lynx-js/react'
import { useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

const NAV_LYNX = [
  { name: 'index',        label: 'Home',     icon: 'layout-dashboard' },
  { name: 'job-database', label: 'Workers',  icon: 'users'            },
  { name: 'cash-atm',     label: 'Cash/ATM', icon: 'banknote'         },
  { name: 'appointments', label: 'Appts',    icon: 'calendar-days'    },
  { name: 'payslip',      label: 'Payslip',  icon: 'file-text'        },
]

export const AppLayout = ({ children, activePage, onNavigate }: {
  children: React.ReactNode
  activePage: string
  onNavigate: (page: string) => void
}) => (
  <View style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
    <View style={{ flex: 1 }}>{children}</View>

    {/* Bottom tab bar */}
    <View style={{ flexDirection: 'row', backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingBottom: 4, paddingTop: 8 }}>
      {NAV_LYNX.map(({ name, label, icon }) => {
        const active = activePage === name
        return (
          <TouchableOpacity
            key={name}
            onPress={() => onNavigate(name)}
            style={{ flex: 1, alignItems: 'center', gap: 3 }}
          >
            <Icon set="lucide" name={icon} size={20} color={active ? '#171717' : '#d1d5db'} />
            <Text style={{ fontSize: 10, fontWeight: active ? '700' : '500', color: active ? '#171717' : '#d1d5db' }}>
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  </View>
)
