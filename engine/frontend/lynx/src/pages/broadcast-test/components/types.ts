// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — broadcast-test
// Source: @arkzen:native:components:lynx:* (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:06.409Z
// ============================================================

export type WsStatus = 'connecting' | 'connected' | 'error'

export interface LynxMessage {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}

// ── Status dot — dynamic bg color can't be a static Tailwind class, use inline
