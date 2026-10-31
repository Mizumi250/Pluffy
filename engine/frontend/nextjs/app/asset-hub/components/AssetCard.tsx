'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — AssetCard
// Source: @arkzen:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:20:33.243Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CATEGORY_EMOJI } from './constants'
import type { AssetCategory, AssetItem } from './types'

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
