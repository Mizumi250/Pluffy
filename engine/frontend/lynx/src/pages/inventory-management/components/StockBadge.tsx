// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StockBadge
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:57.803Z
// ============================================================

import { type ReactNode, useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import { Field } from './Field'

// ── Stock badge ───────────────────────────────────────────────
export const StockBadge = ({ quantity }: { quantity: number }) => {
  const cfg = quantity === 0
    ? { bg: 'bg-red-50',     text: 'text-red-600',     label: 'Out of stock' }
    : quantity < 20
    ? { bg: 'bg-amber-50',   text: 'text-amber-600',   label: 'Low stock'    }
    : { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'In stock'     }
  return (
    <view className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
      <text className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</text>
    </view>
  )
}

// ── Field ─────────────────────────────────────────────────────
// Lynx has no multiline TextInput — multiline renders as <textarea>, single-line as <input>
