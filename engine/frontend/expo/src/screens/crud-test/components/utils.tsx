// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — crud-test [Expo]
// Source: @arkzen:native:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T12:12:31.443Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BACKEND_URL } from './constants'
import type { FormData } from './types'

export const emptyForm: FormData = { name: '', description: '', status: 'active', priority: '0', tags: '' }

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

// ── Status badge ──────────────────────────────────────────────
