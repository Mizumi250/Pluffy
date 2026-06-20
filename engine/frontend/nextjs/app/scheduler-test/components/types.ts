// ============================================================
// ARKZEN GENERATED TYPES — scheduler-test
// Source: @arkzen:components (scheduler-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:13.719Z
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
