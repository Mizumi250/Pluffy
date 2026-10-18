// ============================================================
// ARKZEN GENERATED NATIVE TYPES — broadcast-test [Expo]
// Source: @arkzen:native:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:14.841Z
// ============================================================

export type WsStatus = 'connecting' | 'connected' | 'error'

export interface NativeMessage {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}
