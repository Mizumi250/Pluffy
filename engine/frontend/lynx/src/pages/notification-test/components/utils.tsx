// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — notification-test
// Source: @arkzen:native:components:lynx:* (notification-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:34.948Z
// ============================================================

import React from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

export const channelEmoji: Record<string, string> = {
  'database-ping':         '🗄️',
  'mail-ping':             '✉️',
  'broadcast-ping':        '📡',
  'broadcast-ping-public': '🌐',
  'all-channels':          '🔔',
}

export const channelLabel: Record<string, string> = {
  'database-ping':         'Database',
  'mail-ping':             'Mail',
  'broadcast-ping':        'Broadcast (private)',
  'broadcast-ping-public': 'Broadcast (public)',
  'all-channels':          'All Channels',
}

export const channelDesc: Record<string, string> = {
  'database-ping':         'Stored in notifications table',
  'mail-ping':             'Sent to your email (Mailtrap)',
  'broadcast-ping':        'Private Reverb channel per user',
  'broadcast-ping-public': 'Public Reverb channel for all',
  'all-channels':          'Database + Mail + Broadcast',
}
