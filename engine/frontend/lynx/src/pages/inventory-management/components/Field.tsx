// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:57.805Z
// ============================================================

import { type ReactNode, useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'

// ── Field ─────────────────────────────────────────────────────
// Lynx has no multiline TextInput — multiline renders as <textarea>, single-line as <input>
export const Field = ({
  label, placeholder, value, onInput, multiline = false, editable = true,
}: {
  label: string; placeholder: string; value: string
  onInput: (v: string) => void
  multiline?: boolean; editable?: boolean
}) => (
  <view className="gap-1.5">
    <text className="text-xs font-medium text-neutral-600">{label}</text>
    {multiline ? (
      <textarea
        className={`border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 min-h-[72px] ${
          !editable ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-50'
        }`}
        placeholder={placeholder}
        bindinput={e => onInput(e.detail.value)}
        disabled={!editable}
      />
    ) : (
      <input
        className={`border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 ${
          !editable ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-50'
        }`}
        placeholder={placeholder}
        bindinput={e => onInput(e.detail.value)}
        disabled={!editable}
      />
    )}
  </view>
)

// ── Item form panel ───────────────────────────────────────────
// Lynx has no Modal — renders as an inline slide-up panel
