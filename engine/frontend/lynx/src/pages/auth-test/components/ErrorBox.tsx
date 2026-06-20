// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ErrorBox
// Source: @arkzen:native:components:lynx:* (auth-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.268Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'
import { setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'

// ── Error box ─────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <View style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: 12 }}>
    <Text style={{ fontSize: 11, color: '#dc2626' }}>{message}</Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
