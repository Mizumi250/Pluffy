// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — SectionCard [Expo]
// Source: @arkzen:native:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:17:27.437Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <View style={{
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  }}>
    {children}
  </View>
)
