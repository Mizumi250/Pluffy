// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — AssetRow [Expo]
// Source: @arkzen:native:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:17:26.989Z
// ============================================================

import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'
import { NATIVE_ASSET_REQUIRE_MAP, NATIVE_CATEGORY_EMOJI } from './constants'
import type { NativeAssetItem } from './types'

// ── Asset row ─────────────────────────────────────────────────
// Shows image preview for image assets, plain row for everything else
export const AssetRow = ({ asset }: { asset: NativeAssetItem }) => {
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
