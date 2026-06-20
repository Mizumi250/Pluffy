// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — job-test
// Source: @arkzen:native:components:lynx:* (job-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.445Z
// ============================================================

import React, { ScrollView, Text, TouchableOpacity, View, useEffect, useRef, useState } from '@lynx-js/react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'

// status badge classes — dynamic status value, use inline bg color
export const statusBg = (s: string) => ({
  completed:  '#dcfce7',
  processing: '#fef9c3',
  failed:     '#fee2e2',
}[s] ?? '#f5f5f5')

export const statusText = (s: string) => ({
  completed:  '#15803d',
  processing: '#a16207',
  failed:     '#dc2626',
}[s] ?? '#525252')

// dot color — dynamic per job, use inline

// dot color — dynamic per job, use inline
export const dotBg = (color: string) => ({
  blue:   '#3b82f6',
  purple: '#a855f7',
  red:    '#ef4444',
}[color] ?? '#a3a3a3')
