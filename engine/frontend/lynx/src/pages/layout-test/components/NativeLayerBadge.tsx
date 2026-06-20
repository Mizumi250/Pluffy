// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — NativeLayerBadge
// Source: @arkzen:native:components:lynx:* (layout-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:04.290Z
// ============================================================

import React from '@lynx-js/react'
import { NATIVE_COLORS } from './constants'

export const NativeLayerBadge: React.FC<{ layers: string[] }> = ({ layers }) => (
  <view className="flex-row flex-wrap" style={{ gap: 6 }}>
    {layers.map((layer, i) => (
      <view
        key={layer}
        className="px-2.5 py-1 rounded-full text-white text-xs font-bold"
        style={{ backgroundColor: NATIVE_COLORS[i % NATIVE_COLORS.length] }}
      >
        <text className="text-white text-xs font-bold">
          {i + 1}. {layer}
        </text>
      </view>
    ))}
  </view>
)
