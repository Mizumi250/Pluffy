// ============================================================
// ARKZEN GENERATED SCREEN — asset-hub/index
// ============================================================

import React from 'react'
import { AssetRow } from './components/AssetRow'
import { CatBadge } from './components/CatBadge'
import { GuideRow } from './components/GuideRow'
import { NATIVE_ASSET_REGISTRY } from './components/constants'
import { ScrollView, View, Text } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:index)
const NativeIndexScreen = () => {
  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 48 }}>

      <CatBadge label="📦 Asset Hub" />

      <Text className="text-3xl font-bold text-neutral-900 mt-4 mb-2 leading-tight">
        Asset Distribution
      </Text>
      <Text className="text-sm text-neutral-500 leading-6 mb-8">
        Drop files into{' '}
        <Text className="font-mono text-indigo-500">tatemonos/asset-hub/assets/</Text>
        {' '}— engine distributes to{' '}
        <Text className="font-mono text-indigo-500">expo/assets/tatemonos/asset-hub/</Text>
        . Registered assets render below.
      </Text>

      {/* Drop guide */}
      <View className="bg-white border border-neutral-100 rounded-2xl px-4 py-3 mb-8">
        <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
          Where to drop
        </Text>
        <GuideRow folder="assets/images/" desc="jpg, png, webp, gif" />
        <GuideRow folder="assets/svg/"    desc="svg files" />
        <GuideRow folder="assets/fonts/"  desc="ttf, otf, woff2" />
        <GuideRow folder="assets/audio/"  desc="mp3, wav, ogg" />
        <GuideRow folder="assets/video/"  desc="mp4, webm" />
        <View className="py-2.5">
          <Text className="text-xs font-mono text-indigo-500 mb-0.5">assets/data/</Text>
          <Text className="text-xs text-neutral-400">json, csv, xml</Text>
        </View>
      </View>

      {/* Registered assets */}
      <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        Registered assets
      </Text>
      {NATIVE_ASSET_REGISTRY.map(a => <AssetRow key={a.key} asset={a} />)}

    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_AssetHub_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('asset-hub')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <NativeIndexScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_AssetHub_Index
