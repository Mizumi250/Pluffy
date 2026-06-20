// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxResultBanner
// Source: @arkzen:native:components:lynx:* (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.892Z
// ============================================================

import React, { ScrollView, Text, TouchableOpacity, View, useState } from '@lynx-js/react'
import { LYNX_ERRORS } from './constants'

export const LynxResultBanner = ({ result }: { result: { code: number; body: string } | null }) => {
  if (!result) return null
  const err = LYNX_ERRORS.find(e => e.code === result.code)
  return (
    <View style={{ marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: err?.bg ?? '#fafafa' }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: err?.color ?? '#525252', marginBottom: 4 }}>
        HTTP {result.code}{err ? ` — ${err.title}` : ''}
      </Text>
      <Text style={{ fontSize: 11, color: '#737373', fontFamily: 'monospace' }} numberOfLines={4}>{result.body}</Text>
    </View>
  )
}
