// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — scheduler-test
// Source: @arkzen:native:components:lynx:* (scheduler-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T02:50:33.330Z
// ============================================================

export interface CommandRun {
  id:           number
  command_name: string
  signature:    string
  exit_code:    number
  output:       string | null
  triggered_by: string
  duration_ms:  number | null
  created_at:   string
}
