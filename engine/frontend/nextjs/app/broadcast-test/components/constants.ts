// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — broadcast-test
// Source: @arkzen:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T00:54:04.135Z
// ============================================================

export const REVERB_HOST   = process.env.NEXT_PUBLIC_REVERB_HOST    ?? 'localhost'

export const REVERB_PORT   = process.env.NEXT_PUBLIC_REVERB_PORT    ?? '8080'

export const REVERB_SCHEME = process.env.NEXT_PUBLIC_REVERB_SCHEME  ?? 'ws'

export const APP_KEY       = process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? 'arkzen-key'

// ── ChannelPanel — top-level memo so it never remounts on parent re-render.
// Defined outside DashboardPage to preserve input focus on mobile (Android keyboard
// dismisses when a component is unmounted/remounted, which happens if Panel is an
// inline const inside a parent that re-renders on every keystroke).
type WsStatus = 'connecting' | 'connected' | 'error'

interface Message {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}
