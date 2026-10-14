// ============================================================
// ARKZEN GENERATED TYPES — broadcast-test [React+Vite]
// Source: @arkzen:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T14:10:30.933Z
// ============================================================



export type WsStatus = 'connecting' | 'connected' | 'error'

export interface Message {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}
