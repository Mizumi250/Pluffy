// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — KindBadge
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:49.070Z
// ============================================================

import React, { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'

// ── Kind badge ────────────────────────────────────────────────
export const KindBadge = ({ kind }: { kind: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
    kind === 'mail' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
  }`}>
    {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
  </span>
)

// ── Status dot ────────────────────────────────────────────────
