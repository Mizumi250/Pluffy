// ============================================================
// ARKZEN GENERATED TYPES — broadcast-test [React+Vite]
// Source: @arkzen:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T14:30:29.773Z
// ============================================================

// ── ChannelPanel — top-level memo so it never remounts on parent re-render.
// Defined outside DashboardPage to preserve input focus on mobile (Android keyboard
// dismisses when a component is unmounted/remounted, which happens if Panel is an
// inline const inside a parent that re-renders on every keystroke).
export type WsStatus = 'connecting' | 'connected' | 'error'

export interface Message {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}
