// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — inventory-management [Expo]
// Source: @arkzen:native:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:26.515Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import { useRouter } from 'expo-router'
import { AlertTriangle, ChevronRight, DollarSign, Edit2, Package, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react-native'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BACKEND_URL } from './constants'
import type { FormState } from './types'

export const emptyForm: FormState = { name: '', sku: '', quantity: '', price: '', category: '', description: '' }

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

// ── Stat card ─────────────────────────────────────────────────
