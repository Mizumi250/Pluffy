// ============================================================
// ARKZEN GENERATED SCREEN — asset-hub/index
// ============================================================

import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
// ─── NATIVE ASSET REGISTRY ────────────────────────────────────────────────────
// Metro requires static require() calls — dynamic require() is not supported.
// Pattern: add a require() entry here when you drop a new file, then reference
// it by key from NATIVE_ASSET_REGISTRY. The registry stays data-driven;
// only NATIVE_ASSET_REQUIRE_MAP needs a new line per file.
//
// Distributed to: engine/frontend/expo/assets/tatemonos/asset-hub/
// require() depth: src/screens/asset-hub/index.tsx → ../../assets/tatemonos/asset-hub/

export const NATIVE_ASSET_REQUIRE_MAP: Record<string, any> = {
  // ── Add a require() here for every file you drop ──
  // Metro needs static require() calls — only list files that actually exist
  'images/baby.jpg': require('../../../assets/tatemonos/asset-hub/images/baby.jpg'),
}

export interface NativeAssetItem {
  name:     string
  key:      string   // matches NATIVE_ASSET_REQUIRE_MAP key
  category: string
  ext:      string
}

export const NATIVE_ASSET_REGISTRY: NativeAssetItem[] = [
  // ── Add an entry here alongside every new NATIVE_ASSET_REQUIRE_MAP entry ──
  { name: 'baby.jpg', key: 'images/baby.jpg', category: 'images', ext: 'jpg' },
]

const NATIVE_CATEGORY_EMOJI: Record<string, string> = {
  images: '🖼', fonts: '🔤', icons: '🔷', svg: '✏️', video: '🎬', audio: '🎵', data: '📄',
}

// ── Category badge ────────────────────────────────────────────
const CatBadge = ({ label }: { label: string }) => (
  <View className="px-3 py-1 bg-indigo-100 rounded-full self-start">
    <Text className="text-xs font-semibold text-indigo-600 tracking-wide">{label}</Text>
  </View>
)

// ── Asset row ─────────────────────────────────────────────────
// Shows image preview for image assets, plain row for everything else
const AssetRow = ({ asset }: { asset: NativeAssetItem }) => {
  const source   = NATIVE_ASSET_REQUIRE_MAP[asset.key]
  const isImage  = asset.category === 'images'

  return (
    <View className="bg-white border border-neutral-100 rounded-2xl px-4 py-3 mb-2">
      <View className="flex-row items-center">
        <Text className="text-xl mr-3">{NATIVE_CATEGORY_EMOJI[asset.category] ?? '📁'}</Text>
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-semibold text-neutral-800" numberOfLines={1}>{asset.name}</Text>
          <Text className="text-xs text-neutral-400 font-mono mt-0.5" numberOfLines={1}>
            assets/tatemonos/asset-hub/{asset.key}
          </Text>
        </View>
        <View className="bg-indigo-50 px-2 py-0.5 rounded">
          <Text className="text-xs font-semibold text-indigo-500 font-mono">.{asset.ext}</Text>
        </View>
      </View>
      {isImage && source && (
        <Image
          source={source}
          className="w-full h-40 rounded-xl mt-3"
          resizeMode="cover"
        />
      )}
    </View>
  )
}

// ── Guide row ─────────────────────────────────────────────────
const GuideRow = ({ folder, desc }: { folder: string; desc: string }) => (
  <View className="py-2.5 border-b border-neutral-100">
    <Text className="text-xs font-mono text-indigo-500 mb-0.5">{folder}</Text>
    <Text className="text-xs text-neutral-400">{desc}</Text>
  </View>
)

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
