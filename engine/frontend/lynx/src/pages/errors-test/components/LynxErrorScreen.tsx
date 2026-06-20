// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxErrorScreen
// Source: @arkzen:native:components:lynx:* (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.891Z
// ============================================================

import React, { ScrollView, Text, TouchableOpacity, View, useState } from '@lynx-js/react'
import { LYNX_ERRORS } from './constants'

export const LynxErrorScreen = ({ code, reset }: { code: number; reset?: () => void }) => {
  const err = LYNX_ERRORS.find(e => e.code === code) ?? {
    code,
    title: 'Error',
    message: 'An unexpected error occurred.',
    color: '#404040',
    bg: '#fafafa',
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: err.bg }}>
      <Text style={{ fontSize: 80, fontWeight: '900', color: err.color, marginBottom: 8 }}>{err.code}</Text>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#171717', marginBottom: 12 }}>{err.title}</Text>
      <Text style={{ fontSize: 13, color: '#737373', textAlign: 'center', lineHeight: 22, marginBottom: 40 }}>{err.message}</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {reset && (
          <TouchableOpacity
            onPress={reset}
            style={{ backgroundColor: '#171717', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Try again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{ borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
        >
          <Text style={{ color: '#525252', fontSize: 13, fontWeight: '500' }}>Home</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ marginTop: 40, fontSize: 11, color: '#d4d4d4' }}>Error {err.code}</Text>
    </View>
  )
}
