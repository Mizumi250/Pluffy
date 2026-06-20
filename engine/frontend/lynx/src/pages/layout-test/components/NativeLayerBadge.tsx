// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — NativeLayerBadge
// Source: @arkzen:native:components:lynx:* (layout-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.703Z
// ============================================================

import React from '@lynx-js/react'
import React from 'react'
import { NATIVE_COLORS } from './constants'

export const NativeLayerBadge: React.FC<{ layers: string[] }> = ({ layers }) => (
  <div className="flex flex-wrap gap-1.5">
    {layers.map((layer, i) => (
      <div
        key={layer}
        className={`px-2.5 py-1 rounded-full text-white text-xs font-bold`}
        style={{ backgroundColor: NATIVE_COLORS[i % NATIVE_COLORS.length] }}
      >
        {i + 1}. {layer}
      </div>
    ))}
  </div>
)
