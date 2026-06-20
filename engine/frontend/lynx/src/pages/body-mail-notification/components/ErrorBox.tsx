// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ErrorBox
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:49.059Z
// ============================================================

import React, { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'

// ── Error box ─────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
    {message}
  </div>
)

// ── Primary button ────────────────────────────────────────────
