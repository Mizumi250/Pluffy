// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — body-endpoint-handler [Expo]
// Source: @arkzen:native:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:37.529Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../../arkzen/core/stores/authStore'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}
