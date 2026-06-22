// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxInjectedBadge
// Source: @arkzen:native:components:lynx:* (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T07:06:45.053Z
// ============================================================

import { useCallback, useEffect, useState } from '@lynx-js/react'
import { LynxBadge } from './LynxBadge'

export const LynxInjectedBadge = ({ injected }: { injected: boolean }) => (
  <LynxBadge
    label={injected ? '✓ BODY INJECTED' : '✗ STUB'}
    color={injected ? '#16a34a' : '#dc2626'}
  />
)

// ── Section card ──────────────────────────────────────────────
