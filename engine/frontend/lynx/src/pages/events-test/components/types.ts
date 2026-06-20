// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — events-test
// Source: @arkzen:native:components:lynx:* (events-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:23:55.168Z
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
