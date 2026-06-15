// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — PlayReset [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:17:26.792Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'

export const PlayReset = ({ onPlay, onReset }: { onPlay: () => void; onReset: () => void }) => (
  <View style={s.btnRow}>
    <TouchableOpacity style={s.playBtn} onPress={onPlay}>
      <Text style={s.playBtnLabel}>▶ Play</Text>
    </TouchableOpacity>
    <TouchableOpacity style={s.resetBtn} onPress={onReset}>
      <Text style={s.resetBtnLabel}>↺</Text>
    </TouchableOpacity>
  </View>
)
