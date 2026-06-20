// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — AssetRow
// Source: @arkzen:native:components:lynx:* (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.049Z
// ============================================================

import React, { Image, ScrollView, Text, View, useState } from '@lynx-js/react'
import { LYNX_CATEGORY_EMOJI } from './constants'
import type { LynxAssetItem } from './types'

// ── Asset row ──────────────────────────────────────────────────
export const AssetRow = ({ asset }: { asset: LynxAssetItem }) => {
  const isImage = asset.category === 'images'

  return (
    <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, marginRight: 12 }}>{LYNX_CATEGORY_EMOJI[asset.category] ?? '📁'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#0f172a' }}>{asset.name}</Text>
          <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#94a3b8', marginTop: 2 }}>
            {asset.uri}
          </Text>
        </View>
        <View style={{ backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#6366f1', fontFamily: 'monospace' }}>.{asset.ext}</Text>
        </View>
      </View>
      {isImage && (
        <Image
          src={asset.uri}
          style={{ width: '100%', height: 160, borderRadius: 12, marginTop: 12 }}
        />
      )}
    </View>
  )
}

// ── Guide row ──────────────────────────────────────────────────
