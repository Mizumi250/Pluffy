// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — job-test [Expo]
// Source: @arkzen:native:components (job-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:42.638Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { Cpu, RefreshCw } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export const statusStyle = (s: string) => ({
  completed:  { bg: 'bg-green-100',  text: 'text-green-700'  },
  processing: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  failed:     { bg: 'bg-red-100',    text: 'text-red-600'    },
}[s] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' })

export const dotColor = (color: string) => ({
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  red:    'bg-red-500',
}[color] ?? 'bg-neutral-400')
