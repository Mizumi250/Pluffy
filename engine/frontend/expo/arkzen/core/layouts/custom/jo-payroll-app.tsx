// ARKZEN CUSTOM LAYOUT — jo-payroll/app [Expo]

import React, { useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Banknote, CalendarDays, FileText, LayoutDashboard, Users } from 'lucide-react-native'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

/* @arkzen:resolved:import expo */
const NAV_ITEMS = [
  { name: 'JoPayrollIndex',       label: 'Home',     icon: LayoutDashboard },
  { name: 'JoPayrollWorkers',     label: 'Workers',  icon: Users           },
  { name: 'JoPayrollCashAtm',     label: 'Cash/ATM', icon: Banknote        },
  { name: 'JoPayrollAppointments',label: 'Appts',    icon: CalendarDays    },
  { name: 'JoPayrollPayslip',     label: 'Payslip',  icon: FileText        },
]

const NAV_HREFS: Record<string, string> = {
  JoPayrollIndex:        '/jo-payroll',
  JoPayrollWorkers:      '/jo-payroll/job-database',
  JoPayrollCashAtm:      '/jo-payroll/cash-atm',
  JoPayrollAppointments: '/jo-payroll/appointments',
  JoPayrollPayslip:      '/jo-payroll/payslip',
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useRouter()
  const pathname = usePathname()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <View style={{ flex: 1 }}>{children}</View>

      {/* Bottom tab bar */}
      <View style={{ flexDirection: 'row', backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingBottom: 4, paddingTop: 8 }}>
        {NAV_ITEMS.map(({ name, label, icon: Icon }) => {
          const href   = NAV_HREFS[name]
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <TouchableOpacity
              key={name}
              onPress={() => router.push(href as any)}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: 'center', gap: 3 }}
            >
              <Icon size={20} color={active ? '#171717' : '#d1d5db'} />
              <Text style={{ fontSize: 10, fontWeight: active ? '700' : '500', color: active ? '#171717' : '#d1d5db' }}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </SafeAreaView>
  )
}
