// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — FrameCard [Expo]
// Source: @arkzen:native:components (frame-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T08:35:32.889Z
// ============================================================

import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

/* @arkzen:resolved:import expo */
export const FrameCard = ({ title, body }: { title: string; body: string }) => (
  <View className="bg-white rounded-2xl p-5 border border-neutral-100 mb-3">
    <Text className="text-sm font-semibold text-neutral-800 mb-1">{title}</Text>
    <Text className="text-sm text-neutral-500 leading-5">{body}</Text>
  </View>
)
