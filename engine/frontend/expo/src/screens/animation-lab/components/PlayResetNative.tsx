// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — PlayResetNative [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:32:41.853Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { nativeStyles } from './utils'

// ─── PLAY/RESET BUTTONS ───────────────────────────────────────────────────────

export const PlayResetNative = ({ onPlay, onReset }: { onPlay: () => void; onReset: () => void }) => (
  <View style={nativeStyles.btnRow}>
    <TouchableOpacity style={nativeStyles.playBtn} onPress={onPlay}>
      <Play size={14} color="white" />
      <Text style={nativeStyles.playBtnLabel}>Play</Text>
    </TouchableOpacity>
    <TouchableOpacity style={nativeStyles.resetBtn} onPress={onReset}>
      <RotateCcw size={14} color="rgba(255,255,255,0.6)" />
      <Text style={nativeStyles.resetBtnLabel}>Reset</Text>
    </TouchableOpacity>
  </View>
)

// ─── ENTRANCE SECTION ─────────────────────────────────────────────────────────
