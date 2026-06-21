// ============================================================
// ARKZEN GENERATED TYPES — scheduler-test
// Source: @arkzen:components (scheduler-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:10:06.084Z
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
