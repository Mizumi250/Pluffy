// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — AssetRow
// Source: @arkzen:native:components:lynx:* (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:04.952Z
// ============================================================

import { useState } from '@lynx-js/react'
import { LYNX_CATEGORY_EMOJI } from './constants'
import type { LynxAssetItem } from './types'

// ── Asset row ──────────────────────────────────────────────────
export const AssetRow = ({ asset }: { asset: LynxAssetItem }) => {
  const isImage = asset.category === 'images'

  return (
    <view className="bg-white border border-[#f1f5f9] rounded-2xl px-4 py-3 mb-2">
      <view className="flex-row items-center">
        <text className="text-xl mr-3">{LYNX_CATEGORY_EMOJI[asset.category] ?? '📁'}</text>
        <view className="flex-1">
          <text className="text-[13px] font-semibold text-[#0f172a]">{asset.name}</text>
          <text className="text-[11px] font-mono text-[#94a3b8] mt-0.5">
            {asset.uri}
          </text>
        </view>
        <view className="bg-[#ede9fe] px-2 py-0.5 rounded">
          <text className="text-[11px] font-semibold text-[#6366f1] font-mono">.{asset.ext}</text>
        </view>
      </view>
      {isImage && (
        <image
          src={asset.uri}
          className="w-full h-40 rounded-xl mt-3"
        />
      )}
    </view>
  )
}

// ── Guide row ──────────────────────────────────────────────────
