// ============================================================
// ARKZEN GENERATED NATIVE TYPES — body-mail-notification [Expo]
// Source: @arkzen:native:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T13:13:32.821Z
// ============================================================

export type SendLogEntry = {
  id:         number
  kind:       'mail' | 'notification'
  subject:    string | null
  to_email:   string | null
  mail_class: string | null
  status:     'sent' | 'failed'
  error:      string | null
  created_at: string
}

// ── Reusable input field ───────────────────────────────────────
