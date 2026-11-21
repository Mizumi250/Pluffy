// ============================================================
// ARKZEN GENERATED TYPES — body-mail-notification [React+Vite]
// Source: @arkzen:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-21T15:25:46.733Z
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
