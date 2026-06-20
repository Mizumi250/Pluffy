// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxBadge
// Source: @arkzen:native:components:lynx:* (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:01.913Z
// ============================================================

import { useCallback, useEffect, useState } from '@lynx-js/react'

// ── Badge ─────────────────────────────────────────────────────
export const LynxBadge = ({ label, color }: { label: string; color: string }) => (
  <view style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: color + '22' }}>
    <text style={{ fontSize: 10, fontWeight: '700', color, letterSpacing: 0.5 }}>{label}</text>
  </view>
)
