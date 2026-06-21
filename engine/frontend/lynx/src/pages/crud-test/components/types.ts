// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — crud-test
// Source: @arkzen:native:components:lynx:* (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T09:47:13.903Z
// ============================================================

export type Item = {
  id:          number
  name:        string
  description: string | null
  status:      'active' | 'pending' | 'archived'
  priority:    number
  tags:        string | null
  created_at:  string
  updated_at:  string
}

export type FormData = { name: string; description: string; status: 'active' | 'pending' | 'archived'; priority: string; tags: string }
