// ARKZEN GENERATED — animation-lab/components/PlayResetNative
// DO NOT EDIT

import React from 'react'
import { nativeStyles } from './utils'
import { Play, RotateCcw } from 'lucide-react-native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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
