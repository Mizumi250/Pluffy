// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — crud-test [Expo]
// Source: @arkzen:native:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:38.379Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const emptyForm: FormData = { name: '', description: '', status: 'active', priority: '0', tags: '' }

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

// ── Status badge ──────────────────────────────────────────────
