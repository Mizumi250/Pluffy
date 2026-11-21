// ============================================================
// ARKZEN GENERATED TYPES — broadcast-test [React+Vite]
// Source: @arkzen:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-21T15:25:47.478Z
// ============================================================



export type WsStatus = 'connecting' | 'connected' | 'error'

export interface Message {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}
