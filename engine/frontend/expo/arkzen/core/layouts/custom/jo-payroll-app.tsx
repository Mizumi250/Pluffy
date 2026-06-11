// ARKZEN CUSTOM LAYOUT — jo-payroll/app [Expo]

import React, { useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Banknote, CalendarDays, FileText, LayoutDashboard, Users } from 'lucide-react-native'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

const NAV = [
  { href: '/jo-payroll',              label: 'Home',       icon: LayoutDashboard },
  { href: '/jo-payroll/job-database',      label: 'Workers',    icon: Users           },
  { href: '/jo-payroll/cash-atm',     label: 'Cash/ATM',   icon: Banknote        },
  { href: '/jo-payroll/appointments', label: 'Appts',      icon: CalendarDays    },
  { href: '/jo-payroll/payslip',      label: 'Payslip',    icon: FileText        },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router   = useRouter()
  const pathname = usePathname()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F5F7' }}>
      <View style={{ flex: 1 }}>{children}</View>

      {/* Bottom tab bar */}
      <View style={{ flexDirection: 'row', backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingBottom: 4, paddingTop: 8 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <TouchableOpacity
              key={href}
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
