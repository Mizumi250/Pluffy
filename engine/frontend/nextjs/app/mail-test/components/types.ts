// ============================================================
// ARKZEN GENERATED TYPES — mail-test
// Source: @arkzen:components (mail-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:56.899Z
// ============================================================

export interface MailLog {
  id:         number
  to_email:   string
  subject:    string
  mail_class: string
  status:     string
  error:      string | null
  created_at: string
}

export interface MailType {
  key:    string
  label:  string
  desc:   string
  fields: Record<string, string>
}
