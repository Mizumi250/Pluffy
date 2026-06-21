// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — jo-payroll
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:30.874Z
// ============================================================

import { useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import { AVATAR_COLORS } from './constants'

// ── Utils ────────────────────────────────────────────────────

export const formatPeso = (v?: number) =>
  v == null ? '₱0.00' : `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const getInitials = (name: string) => {
  const parts = name.replace(/,/g, '').trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export const getAvatarColor = (name: string) => {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

// ── Avatar ───────────────────────────────────────────────────
