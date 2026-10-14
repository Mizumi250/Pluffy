// ARKZEN GENERATED — animation-lab/components/DemoCardNative
// DO NOT EDIT

import React from 'react'
import { nativeStyles } from './utils'
import { StyleSheet, Text, View } from 'react-native'

export const DemoCardNative = ({ title, desc, full = false, children }: {
  title: string; desc: string; full?: boolean; children: React.ReactNode
}) => (
  <View style={full ? nativeStyles.demoCardFull : nativeStyles.demoCard}>
    <View style={nativeStyles.demoCardHeader}>
      <Text style={nativeStyles.demoCardTitle}>{title}</Text>
      <Text style={nativeStyles.demoCardDesc}>{desc}</Text>
    </View>
    <View style={nativeStyles.demoCardStage}>{children}</View>
  </View>
)
