// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — InjectedBadge [Expo]
// Source: @arkzen:native:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:10.114Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { NativeBadge } from './NativeBadge'

export const InjectedBadge = ({ injected }: { injected: boolean }) => (
  <NativeBadge
    label={injected ? '✓ BODY INJECTED' : '✗ STUB'}
    color={injected ? '#16a34a' : '#dc2626'}
  />
)
