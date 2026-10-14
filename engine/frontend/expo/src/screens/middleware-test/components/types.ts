// ============================================================
// ARKZEN GENERATED NATIVE TYPES — middleware-test [Expo]
// Source: @arkzen:native:components (middleware-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:43:20.403Z
// ============================================================

export type PingLog = {
  id:         number
  message:    string
  headers_ok: boolean
  created_at: string
}

export type ResultStatus = 'idle' | 'pass' | 'blocked' | 'fail'

export type Result = { status: ResultStatus; text: string }
