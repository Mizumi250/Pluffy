// ============================================================
// ARKZEN GENERATED TYPES — scheduler-test
// Source: @arkzen:components (scheduler-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:13.807Z
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
