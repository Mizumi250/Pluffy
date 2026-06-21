// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — events-test
// Source: @arkzen:native:components:lynx:* (events-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:47.689Z
// ============================================================

export interface EventLogEntry {
  id:            number
  event_name:    string
  listener_name: string
  status:        string
  payload:       string | null
  duration_ms:   number | null
  created_at:    string
}
