// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Avatar
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.104Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'
import { getAvatarColor, getInitials } from './utils'
import { StatCard } from './StatCard'

// ── Avatar ───────────────────────────────────────────────────

export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const color = getAvatarColor(name)
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: color.text }}>{getInitials(name)}</Text>
    </View>
  )
}

// ── StatCard ─────────────────────────────────────────────────
