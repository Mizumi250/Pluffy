// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatusDot
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:49.071Z
// ============================================================

import React, { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'

// ── Status dot ────────────────────────────────────────────────
export const StatusDot = ({ status }: { status: string }) => (
  <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
    status === 'sent' ? 'bg-green-500' : 'bg-red-500'
  }`} />
)
