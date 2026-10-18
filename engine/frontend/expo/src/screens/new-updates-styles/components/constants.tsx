// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — new-updates-styles [Expo]
// Source: @arkzen:native:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:38.742Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Code, Layers, Palette, Zap } from 'lucide-react-native'
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import type { NativeColor, NativeFeature } from './types'


export const COLOR_MAP: Record<NativeColor, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
}

export const FEATURES: NativeFeature[] = [
  { id: 1, icon: 'zap',     title: 'Component Separation', description: 'Individual component files with shared utilities backend',   color: 'blue'   },
  { id: 2, icon: 'code',    title: 'CSS DSL Support',       description: 'Global CSS variables and per-component CSS Modules',        color: 'purple' },
  { id: 3, icon: 'palette', title: 'Multiple Pages',        description: 'Support for home, about, features, and custom routes',      color: 'green'  },
  { id: 4, icon: 'layers',  title: 'Asset Management',      description: 'Built-in favicon, image, and static file support',          color: 'orange' },
]

export const ICON_COLORS: Record<NativeColor, string> = {
  blue:   '#2563eb',
  purple: '#7c3aed',
  green:  '#059669',
  orange: '#ea580c',
}
