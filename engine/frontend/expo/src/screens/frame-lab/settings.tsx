// ============================================================
// ARKZEN GENERATED SCREEN — frame-lab/settings
// ============================================================

import React, { useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { FrameCard } from './components/FrameCard'
import { FrameCounter } from './components/FrameCounter'

// User screen (from @arkzen:native:page:settings)
const SettingsScreen = () => (
  <View className="flex-1 bg-neutral-50 px-6 pt-6">
    <Text className="text-3xl font-bold text-neutral-900 mb-2">Settings</Text>
    <FrameCard
      title="Second screen"
      body="On Expo this is the second tab. Remove the native:frame:expo block and the tab bar disappears; the screens keep working."
    />
  </View>
)

// Engine wrapper
export function ArkzenScreen_FrameLab_Settings() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('frame-lab')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['left', 'right']}>
      
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_FrameLab_Settings
