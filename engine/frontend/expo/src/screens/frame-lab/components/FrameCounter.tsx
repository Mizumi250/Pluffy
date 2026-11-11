// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — FrameCounter [Expo]
// Source: @arkzen:native:components (frame-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T08:35:32.891Z
// ============================================================

import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export const FrameCounter = () => {
  const [count, setCount] = useState(0)
  return (
    <View className="bg-white rounded-2xl border border-neutral-100 p-6 items-center">
      <Text className="text-xs text-neutral-400 uppercase tracking-widest mb-2">State check</Text>
      <Text className="text-5xl font-bold text-indigo-500 mb-4">{count}</Text>
      <TouchableOpacity
        onPress={() => setCount(c => c + 1)}
        className="rounded-2xl py-3 px-6 bg-indigo-500 items-center"
      >
        <Text className="text-white font-semibold">+1</Text>
      </TouchableOpacity>
    </View>
  )
}
