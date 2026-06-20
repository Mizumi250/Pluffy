// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — NProgressBar [Expo]
// Source: @arkzen:native:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T11:32:43.630Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Dimensions, FlatList, Image, Pressable, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { C } from './constants'

// Progress bar
export const NProgressBar = ({ pct, color = C.gold }: { pct: number; color?: string }) => (
  <View style={{ height: 3, backgroundColor: `${color}25`, borderRadius: 2, overflow: 'hidden' }}>
    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 2 }} />
  </View>
)
 
// Continuation card
