// ============================================================
// ARKZEN GENERATED LYNX SHARED CONSTANTS — broadcast-test
// Source: @arkzen:native:components:lynx:* (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:52.912Z
// ============================================================

import { useCallback, useEffect, useRef, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

export const BACKEND_URL   = process.env.ARKZEN_BACKEND_URL   ?? 'http://localhost:8000'

export const REVERB_HOST   = process.env.REVERB_HOST          ?? 'localhost'

export const REVERB_PORT   = process.env.REVERB_PORT          ?? '8080'

export const REVERB_SCHEME = process.env.REVERB_SCHEME        ?? 'ws'

export const APP_KEY       = process.env.REVERB_APP_KEY       ?? 'arkzen-key'
