// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — NativeBadge [Expo]
// Source: @arkzen:native:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T14:30:27.619Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const NativeBadge = ({ label, color }: { label: string; color: string }) => (
  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: color + '22' }}>
    <Text style={{ fontSize: 10, fontWeight: '700', color, letterSpacing: 0.5 }}>{label}</Text>
  </View>
)
