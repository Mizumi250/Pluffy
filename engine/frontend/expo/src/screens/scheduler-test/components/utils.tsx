// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — scheduler-test [Expo]
// Source: @arkzen:native:components (scheduler-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:42.302Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../../arkzen/core/stores/authStore'
import { Activity, BarChart3, Clock3, RefreshCw, Trash2 } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export const exitCodeStyle    = (code: number) => code === 0
  ? { bg: 'bg-green-100', text: 'text-green-700' }
  : { bg: 'bg-red-100',   text: 'text-red-600'   }

export const triggeredStyle = (t: string) => t === 'manual'
  ? { bg: 'bg-blue-100',    text: 'text-blue-600'    }
  : { bg: 'bg-neutral-100', text: 'text-neutral-500' }
