// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — RecordRow [Expo]
// Source: @arkzen:native:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:08.572Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { usePathname, useRouter } from 'expo-router'
import { AlertCircle, CalendarClock, CheckCircle, ChevronDown, LogIn, LogOut, MapPin, Navigation, RefreshCw, Settings, XCircle } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { create } from 'zustand'
import { fmtDate, fmtTime } from './utils'
import type { TimeRecord } from './types'

// ── RecordRow ────────────────────────────────────────────────

export const RecordRow = ({ rec, geofencingEnabled }: { rec: TimeRecord; geofencingEnabled: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff05' }}>
    <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: rec.type === 'in' ? '#34d39910' : '#ffffff08' }}>
      {rec.type === 'in'
        ? <LogIn size={13} color="#34d399" />
        : <LogOut size={13} color="#ffffff40" />
      }
    </View>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: rec.type === 'in' ? '#34d399' : '#ffffff40', letterSpacing: 0.5 }}>
          {rec.type.toUpperCase()}
        </Text>
        <Text style={{ fontSize: 14, color: '#ffffffb3' }}>{fmtTime(rec.timestamp)}</Text>
        {geofencingEnabled && (
          <Text style={{ fontSize: 11, color: rec.within_geofence ? '#34d39960' : '#f8717160' }}>
            {rec.within_geofence ? '✓' : '✗'}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: 11, color: '#ffffff25', fontFamily: 'monospace' }}>{fmtDate(rec.timestamp)}</Text>
    </View>
  </View>
)
