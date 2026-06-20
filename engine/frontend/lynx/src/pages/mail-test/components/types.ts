// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — mail-test
// Source: @arkzen:native:components:lynx:* (mail-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:23:56.389Z
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

// ── Input field ───────────────────────────────────────────────
