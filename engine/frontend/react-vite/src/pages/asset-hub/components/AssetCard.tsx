// ============================================================
// ARKZEN GENERATED COMPONENT — AssetCard [React+Vite]
// Source: @arkzen:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T03:29:33.051Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CATEGORY_EMOJI } from './constants'
import type { AssetItem } from './types'

export const AssetCard = ({ asset }: { asset: AssetItem }) => (
  <div className="ah-card">
    <span className="ah-card-emoji">{CATEGORY_EMOJI[asset.category]}</span>
    <div className="ah-card-info">
      <p className="ah-card-name">{asset.name}</p>
      <p className="ah-card-path">{asset.path}</p>
    </div>
    <span className="ah-card-ext">.{asset.ext}</span>
  </div>
)
