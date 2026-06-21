// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — scheduler-test
// Source: @arkzen:native:components:lynx:* (scheduler-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:51.690Z
// ============================================================

import { useCallback, useState } from '@lynx-js/react'
import { arkzenFetch } from '../../../../arkzen/core/stores/authStore'

export const exitCodeStyle = (code: number) => code === 0
  ? { bg: 'bg-green-100', text: 'text-green-700' }
  : { bg: 'bg-red-100',   text: 'text-red-600'   }

export const triggeredStyle = (t: string) => t === 'manual'
  ? { bg: 'bg-blue-100',    text: 'text-blue-600'    }
  : { bg: 'bg-neutral-100', text: 'text-neutral-500' }
