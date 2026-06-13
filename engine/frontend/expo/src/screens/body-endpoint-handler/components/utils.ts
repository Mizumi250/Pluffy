// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — body-endpoint-handler [Expo]
// Source: @arkzen:native:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:37.530Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../../arkzen/core/stores/authStore'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const sourceColor = (s: string) =>
  s === 'handler-body'   ? '#7c3aed' :
  s === 'endpoint-body'  ? '#0891b2' : '#64748b'
