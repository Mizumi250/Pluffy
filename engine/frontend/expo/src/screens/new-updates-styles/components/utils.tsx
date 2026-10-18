// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — new-updates-styles [Expo]
// Source: @arkzen:native:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:38.747Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Code, Layers, Palette, Zap } from 'lucide-react-native'
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export const getIcon = (name: string, color: string) => {
  const props = { size: 24, color }
  switch (name) {
    case 'zap':     return <Zap {...props} />
    case 'code':    return <Code {...props} />
    case 'palette': return <Palette {...props} />
    case 'layers':  return <Layers {...props} />
    default:        return null
  }
}
