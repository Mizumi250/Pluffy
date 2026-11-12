// ============================================================
// ARKZEN GENERATED TYPES — broadcast-test [React+Vite]
// Source: @arkzen:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:37.205Z
// ============================================================



export type WsStatus = 'connecting' | 'connected' | 'error'

export interface Message {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}
