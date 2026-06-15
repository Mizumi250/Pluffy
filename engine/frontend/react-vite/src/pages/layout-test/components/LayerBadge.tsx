// ============================================================
// ARKZEN GENERATED COMPONENT — LayerBadge [React+Vite]
// Source: @arkzen:components (layout-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T16:01:57.540Z
// ============================================================

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from './constants'

export const LayerBadge: React.FC<{ layers: string[] }> = ({ layers }) => (
  <div className="flex flex-wrap gap-2 pt-2">
    {layers.map((layer, i) => (
      <span
        key={layer}
        className="text-xs px-2.5 py-1 rounded-full font-semibold text-white"
        style={{ background: COLORS[i % COLORS.length] }}
      >
        {i + 1}. {layer}
      </span>
    ))}
  </div>
)
