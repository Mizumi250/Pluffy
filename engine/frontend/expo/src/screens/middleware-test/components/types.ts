// ============================================================
// ARKZEN GENERATED NATIVE TYPES — middleware-test [Expo]
// Source: @arkzen:native:components (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T08:35:40.287Z
// ============================================================

export type PingLog = {
  id:         number
  message:    string
  headers_ok: boolean
  created_at: string
}

export type ResultStatus = 'idle' | 'pass' | 'blocked' | 'fail'

export type Result = { status: ResultStatus; text: string }
