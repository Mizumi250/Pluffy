// ============================================================
// ARKZEN GENERATED NATIVE TYPES — middleware-test [Expo]
// Source: @arkzen:native:components (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-01T08:12:46.938Z
// ============================================================

export type PingLog = {
  id:         number
  message:    string
  headers_ok: boolean
  created_at: string
}

export type ResultStatus = 'idle' | 'pass' | 'blocked' | 'fail'

export type Result = { status: ResultStatus; text: string }
