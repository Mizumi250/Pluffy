// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — NTabBar [Expo]
// Source: @arkzen:native:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:06.846Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Dimensions, FlatList, Image, Pressable, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { C } from './constants'

// Bottom tab bar
export const NTabBar = ({ active, onNav }: { active: string; onNav: (v: string) => void }) => {
  const tabs = [
    { id: 'home',          label: 'Home',    icon: '⌂' },
    { id: 'continuations', label: 'Journey', icon: '◱' },
    { id: 'spaces',        label: 'Spaces',  icon: '◎' },
    { id: 'common-room',   label: 'Common',  icon: '☕' },
    { id: 'profile',       label: 'Profile', icon: '◉' },
  ]
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(26,25,23,0.97)',
      borderTopWidth: 1,
      borderTopColor: C.border,
      paddingBottom: 12,
    }}>
      {tabs.map(t => (
        <Pressable
          key={t.id}
          onPress={() => onNav(t.id)}
          style={{ flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 2 }}
        >
          <Text style={{ fontSize: 18, color: active === t.id ? C.gold : C.muted }}>{t.icon}</Text>
          <Text style={{ fontSize: 10, color: active === t.id ? C.gold : C.muted, marginTop: 3, fontWeight: active === t.id ? '700' : '400' }}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}
