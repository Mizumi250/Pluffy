// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — body-endpoint-handler
// Source: @arkzen:native:components:lynx:* (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:28.809Z
// ============================================================

export type ProbeResult = {
  id:         number
  source:     string
  probe:      string
  payload:    string | null
  result:     string | null
  ok:         boolean
  created_at: string
}

export type Stats = {
  injected: boolean
  builder:  string
  method:   string
  total:    number
  passed:   number
  failed:   number
  sources:  string[]
}
