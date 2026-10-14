// ARKZEN GENERATED — animation-lab/components/SectionHeaderNative
// DO NOT EDIT

import React from 'react'
import { nativeStyles } from './utils'
import { StyleSheet, Text, View } from 'react-native'

export const SectionHeaderNative = ({
  icon, title, subtitle, color
}: {
  icon: string; title: string; subtitle: string; color: string
}) => (
  <View style={nativeStyles.sectionHeader}>
    <View style={[nativeStyles.sectionHeaderIcon, { backgroundColor: `${color}22` }]}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={nativeStyles.sectionHeaderTitle}>{title}</Text>
      <Text style={nativeStyles.sectionHeaderSub}>{subtitle}</Text>
    </View>
  </View>
)
