// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — scheduler-test
// Source: @arkzen:native:components:lynx:* (scheduler-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:32.325Z
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
