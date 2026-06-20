// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — upload-test
// Source: @arkzen:native:components:lynx:* (upload-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:06.560Z
// ============================================================

import React from '@lynx-js/react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'

export const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export const getMimeIcon = (mime: string) => {
  if (mime.startsWith('image/')) return '🖼️'
  if (mime.includes('pdf')) return '📄'
  if (mime.includes('video')) return '🎬'
  if (mime.includes('zip') || mime.includes('rar')) return '🗜️'
  return '📁'
}
