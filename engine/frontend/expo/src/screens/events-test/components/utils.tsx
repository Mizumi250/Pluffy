// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — events-test [Expo]
// Source: @arkzen:native:components (events-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-26T07:08:57.990Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { Flame, RefreshCw, Trash2, Zap } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export const statusStyle = (s: string) => ({
  completed: { bg: 'bg-green-100',   text: 'text-green-700'   },
  running:   { bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
  failed:    { bg: 'bg-red-100',     text: 'text-red-600'     },
}[s] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' })

export const eventColor = (key: string) => ({
  'user-signed-up': { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  'order-placed':   { bg: 'bg-green-50',  text: 'text-green-600'  },
  'data-exported':  { bg: 'bg-purple-50', text: 'text-purple-600' },
}[key] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' })
