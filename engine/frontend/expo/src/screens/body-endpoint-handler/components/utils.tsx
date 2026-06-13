// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — body-endpoint-handler [Expo]
// Source: @arkzen:native:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T09:28:02.912Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../../arkzen/core/stores/authStore'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const sourceColor = (s: string) =>
  s === 'handler-body'   ? '#7c3aed' :
  s === 'endpoint-body'  ? '#0891b2' : '#64748b'

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}
