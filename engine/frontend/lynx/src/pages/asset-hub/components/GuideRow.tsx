// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — GuideRow
// Source: @arkzen:native:components:lynx:* (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.051Z
// ============================================================

import React, { Image, ScrollView, Text, View, useState } from '@lynx-js/react'

// ── Guide row ──────────────────────────────────────────────────
export const GuideRow = ({ folder, desc }: { folder: string; desc: string }) => (
  <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
    <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#6366f1', marginBottom: 2 }}>{folder}</Text>
    <Text style={{ fontSize: 11, color: '#94a3b8' }}>{desc}</Text>
  </View>
)
