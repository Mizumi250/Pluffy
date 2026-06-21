// ============================================================
// ARKZEN GENERATED UTILITIES — broadcast-test
// Source: @arkzen:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:54.143Z
// ============================================================

import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Radio } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const dot = (s: WsStatus) => ({
  connecting: 'bg-yellow-400',
  connected:  'bg-green-400',
  error:      'bg-red-400',
}[s])
