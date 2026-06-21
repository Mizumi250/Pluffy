// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Avatar
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:30.876Z
// ============================================================

import { useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import { getAvatarColor, getInitials } from './utils'
import { StatCard } from './StatCard'

// ── Avatar ───────────────────────────────────────────────────

export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const color = getAvatarColor(name)
  return (
    <view
      className="items-center justify-center"
      style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: color.bg }}
    >
      <text style={{ fontSize: size * 0.33, fontWeight: '700', color: color.text }}>{getInitials(name)}</text>
    </view>
  )
}

// ── StatCard ─────────────────────────────────────────────────
