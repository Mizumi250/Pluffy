// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — EmployeeDropdown [Expo]
// Source: @arkzen:native:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:43:48.039Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { AlertCircle, CheckCircle, ChevronDown, LogIn, LogOut, MapPin, Navigation, RefreshCw, XCircle } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'
import { useDtrStore } from './hooks'
import { color } from './utils'
import { LocationWidget } from './LocationWidget'

// ── EmployeeDropdown ─────────────────────────────────────────

export const EmployeeDropdown = () => {
  const { employees, selectedEmployee, setSelectedEmployee } = useDtrStore()
  const [open, setOpen] = useState(false)

  if (!employees.length) return (
    <View style={{ height: 48, borderRadius: 12, backgroundColor: '#ffffff08' }} />
  )

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff08', borderRadius: 12, borderWidth: 1, borderColor: '#ffffff14' }}
      >
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#ffffffcc' }}>
          {selectedEmployee?.name ?? 'Select employee'}
        </Text>
        <ChevronDown size={14} color="#ffffff30" />
      </TouchableOpacity>

      {open && (
        <View style={{ marginTop: 6, backgroundColor: '#161616', borderRadius: 12, borderWidth: 1, borderColor: '#ffffff14', overflow: 'hidden' }}>
          {employees.map(emp => (
            <TouchableOpacity
              key={emp.id}
              onPress={() => { setSelectedEmployee(emp); setOpen(false) }}
              activeOpacity={0.8}
              style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#ffffffcc' }}>{emp.name}</Text>
              <Text style={{ fontSize: 12, color: '#ffffff30', marginTop: 2 }}>{emp.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// ── LocationWidget ───────────────────────────────────────────
