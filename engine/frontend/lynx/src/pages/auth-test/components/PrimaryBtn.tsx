// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — PrimaryBtn
// Source: @arkzen:native:components:lynx:* (auth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.269Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'
import { setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'

// ── Primary button ────────────────────────────────────────────
export const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    style={{ paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: loading ? '#d4d4d4' : '#171717' }}
  >
    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
      {loading ? 'Loading…' : label}
    </Text>
  </TouchableOpacity>
)
