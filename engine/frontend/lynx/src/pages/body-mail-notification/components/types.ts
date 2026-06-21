// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — body-mail-notification
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:29.275Z
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

// ── Input field ───────────────────────────────────────────────
