// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — inventory-management [Expo]
// Source: @arkzen:native:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:38.956Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { AlertTriangle, ChevronRight, DollarSign, Edit2, Package, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react-native'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const emptyForm: FormState = { name: '', sku: '', quantity: '', price: '', category: '', description: '' }

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

// ── Stat card ─────────────────────────────────────────────────
