// ============================================================
// ARKZEN GENERATED SCREEN — frame-lab/index
// ============================================================

import React, { useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { FrameCard } from './components/FrameCard'
import { FrameCounter } from './components/FrameCounter'

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => (
  <View className="flex-1 bg-neutral-50 px-6 pt-6">
    <Text className="text-3xl font-bold text-neutral-900 mb-2">Frame Lab</Text>
    <Text className="text-sm text-neutral-500 mb-6 leading-6">
      This screen has no header, tab bar or status bar of its own. Everything around it comes from
      the frame block for this target.
    </Text>
    <FrameCard
      title="Who draws the chrome?"
      body="Expo: app/frame-lab/_layout.tsx. React Native: screenOptions + Frame. Both come from this tatemono's frame blocks."
    />
    <FrameCounter />
  </View>
)

// Engine wrapper
export function ArkzenScreen_FrameLab_Index() {
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
        <IndexScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_FrameLab_Index
