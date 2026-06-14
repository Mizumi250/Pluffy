// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — middleware-test [Expo]
// Source: @arkzen:native:components (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T14:56:00.511Z
// ============================================================

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BACKEND_URL } from './constants'

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}

// ── Primary button ────────────────────────────────────────────
